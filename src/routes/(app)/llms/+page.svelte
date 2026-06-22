<script lang="ts">
  import { browser } from '$app/environment';
  import { StreamProcessor, type StreamChunk, type UIMessage } from '@tanstack/ai/client';
  import { Bot, LoaderCircle, RotateCcw, Send, Square } from '@lucide/svelte';
  import { onDestroy, onMount, tick } from 'svelte';
  import { Streamdown } from 'svelte-streamdown';
  import { Button } from '$lib/components/ui/button';
  import { cn } from '$lib/utils';

  type ChatResponse = {
    sessionId?: string;
    message?: string;
  };

  const SESSION_STORAGE_KEY = 'aglaea.llms.sessionId';

  let input = $state('');
  let messages = $state<UIMessage[]>([]);
  let sessionId = $state<string | null>(null);
  let isSending = $state(false);
  let isResetting = $state(false);
  let errorMessage = $state('');
  let abortController = $state<AbortController | null>(null);
  let viewport: HTMLDivElement | null = $state(null);
  let intentionalAbort = false;

  const canSend = $derived(input.trim().length > 0 && !isSending && !isResetting);
  const sessionLabel = $derived(sessionId ? sessionId.slice(0, 8) : 'New');
  const markdownAllowedLinkPrefixes = ['https://', 'http://', 'mailto:'];
  const markdownAllowedImagePrefixes = ['https://'];

  const processor = new StreamProcessor({
    events: {
      onMessagesChange: (next) => {
        messages = next;
        void scrollToBottom();
      },
      onError: (error) => {
        errorMessage = error.message;
      },
    },
  });

  onMount(() => {
    const storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSessionId) sessionId = storedSessionId;
  });

  onDestroy(() => {
    abortController?.abort();
  });

  function persistSession(nextSessionId: string | null): void {
    sessionId = nextSessionId;
    if (!browser) return;

    if (nextSessionId) {
      localStorage.setItem(SESSION_STORAGE_KEY, nextSessionId);
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  async function scrollToBottom(): Promise<void> {
    await tick();
    viewport?.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
  }

  function messageText(message: UIMessage): string {
    const chunks: string[] = [];

    for (const part of message.parts) {
      if (part.type === 'text' || part.type === 'thinking') {
        chunks.push(part.content);
      }

      if (part.type === 'structured-output') {
        chunks.push(part.raw || JSON.stringify(part.data ?? part.partial ?? {}, null, 2));
      }
    }

    return chunks.filter(Boolean).join('\n\n');
  }

  function toolSummaries(message: UIMessage): string[] {
    return message.parts.flatMap((part) =>
      part.type === 'tool-call' ? [`${part.name} ${part.state}`] : [],
    );
  }

  function messageLabel(message: UIMessage): string {
    if (message.role === 'user') return 'You';
    if (message.role === 'assistant') return 'Herta';
    return 'System';
  }

  function appendAssistantMessage(content: string, id = crypto.randomUUID()): void {
    processor.setMessages([
      ...processor.getMessages(),
      {
        id,
        role: 'assistant',
        parts: [{ type: 'text', content }],
        createdAt: new Date(),
      },
    ]);
  }

  function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError';
  }

  function parseSseEvent(rawEvent: string): StreamChunk | null {
    const payload = rawEvent
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n')
      .trim();

    if (!payload || payload === '[DONE]') return null;
    return JSON.parse(payload) as StreamChunk;
  }

  async function* readSseJsonChunks(
    stream: ReadableStream<Uint8Array>,
  ): AsyncGenerator<StreamChunk> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() ?? '';

        for (const event of events) {
          const chunk = parseSseEvent(event);
          if (chunk) yield chunk;
        }
      }

      buffer += decoder.decode();
      const chunk = parseSseEvent(buffer);
      if (chunk) yield chunk;
    } finally {
      reader.releaseLock();
    }
  }

  async function sendMessage(): Promise<void> {
    const message = input.trim();
    if (!message || isSending) return;

    input = '';
    errorMessage = '';
    isSending = true;
    intentionalAbort = false;
    abortController = new AbortController();

    const clientMessageId = crypto.randomUUID();
    processor.addUserMessage(message, clientMessageId);
    processor.prepareAssistantMessage();

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          accept: 'text/event-stream',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId: sessionId ?? undefined,
          clientMessageId,
          stream: true,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(body || `Request failed with status ${response.status}`);
      }

      const nextSessionId = response.headers.get('x-herta-session-id');
      if (nextSessionId) persistSession(nextSessionId);

      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('text/event-stream') && response.body) {
        await processor.process(readSseJsonChunks(response.body));
      } else {
        const body = (await response.json()) as ChatResponse;
        if (body.sessionId) persistSession(body.sessionId);
        appendAssistantMessage(body.message ?? '');
      }
    } catch (error) {
      if (isAbortError(error)) {
        if (!intentionalAbort) errorMessage = 'Request cancelled.';
        return;
      }

      errorMessage = error instanceof Error ? error.message : 'Unable to send message.';
    } finally {
      isSending = false;
      intentionalAbort = false;
      abortController = null;
    }
  }

  function stopStreaming(): void {
    intentionalAbort = false;
    abortController?.abort();
  }

  async function resetConversation(): Promise<void> {
    if (isResetting) return;

    const currentSessionId = sessionId;
    intentionalAbort = true;
    abortController?.abort();
    errorMessage = '';
    isResetting = true;

    try {
      if (currentSessionId) {
        const response = await fetch('/api/ai/chat/reset', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sessionId: currentSessionId }),
        });

        if (!response.ok) {
          const body = await response.text().catch(() => '');
          throw new Error(body || `Reset failed with status ${response.status}`);
        }
      }

      processor.clearMessages();
      messages = [];
      persistSession(null);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unable to reset session.';
    } finally {
      isResetting = false;
    }
  }

  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    void sendMessage();
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }
</script>

<svelte:head>
  <title>Aglaea | LLMs</title>
</svelte:head>

<div class="flex h-[calc(100vh-3.5rem)] min-h-[620px] flex-col bg-background">
  <header class="border-b bg-background px-4 py-3 sm:px-6">
    <div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
      <div class="flex min-w-0 items-center gap-3">
        <div class="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
          <Bot class="size-5 text-muted-foreground" />
        </div>
        <div class="min-w-0">
          <h1 class="truncate text-lg font-semibold tracking-tight">LLMs</h1>
          <p class="truncate text-xs text-muted-foreground">Session {sessionLabel}</p>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        {#if isSending}
          <Button variant="outline" size="icon" aria-label="Stop streaming" onclick={stopStreaming}>
            <Square class="size-4" />
          </Button>
        {/if}
        <Button
          variant="outline"
          size="icon"
          aria-label="Reset session"
          disabled={isResetting}
          onclick={() => void resetConversation()}
        >
          {#if isResetting}
            <LoaderCircle class="size-4 animate-spin" />
          {:else}
            <RotateCcw class="size-4" />
          {/if}
        </Button>
      </div>
    </div>
  </header>

  <div bind:this={viewport} class="flex-1 overflow-y-auto px-3 py-4 sm:px-4" aria-live="polite">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-3">
      {#each messages as message (message.id)}
        {@const text = messageText(message)}
        {@const tools = toolSummaries(message)}
        <article
          class={cn('flex w-full', message.role === 'user' ? 'justify-end' : 'justify-start')}
        >
          <div class="max-w-[min(42rem,100%)]">
            <div class="mb-1 text-xs font-medium text-muted-foreground">
              {messageLabel(message)}
            </div>

            {#if text}
              {#if message.role === 'assistant'}
                <Streamdown
                  content={text}
                  baseTheme="shadcn"
                  allowedLinkPrefixes={markdownAllowedLinkPrefixes}
                  allowedImagePrefixes={markdownAllowedImagePrefixes}
                  class="break-words text-sm leading-6"
                />
              {:else}
                <p class="whitespace-pre-wrap break-words text-sm leading-6">{text}</p>
              {/if}
            {:else if isSending && message.role === 'assistant'}
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle class="size-4 animate-spin" />
                <span>Streaming</span>
              </div>
            {/if}

            {#if tools.length > 0}
              <div class="mt-2 flex flex-wrap gap-2">
                {#each tools as tool (tool)}
                  <span class="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                    {tool}
                  </span>
                {/each}
              </div>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  </div>

  <footer class="border-t bg-background px-3 py-3 sm:px-4">
    <form class="mx-auto w-full max-w-5xl" onsubmit={handleSubmit}>
      <label for="llm-message" class="sr-only">Message</label>
      <div
        class="flex items-end rounded-lg border border-input bg-background transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50"
      >
        <textarea
          id="llm-message"
          bind:value={input}
          rows="2"
          class="min-h-12 flex-1 resize-none rounded-lg bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Ask Herta"
          disabled={isSending || isResetting}
          onkeydown={handleKeydown}></textarea>
        <Button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          size="icon"
          class="m-1 shrink-0 rounded-md"
        >
          {#if isSending}
            <LoaderCircle class="size-4 animate-spin" />
          {:else}
            <Send class="size-4" />
          {/if}
        </Button>
      </div>
    </form>

    {#if errorMessage}
      <div class="mx-auto mt-3 max-w-5xl rounded-md border border-destructive/30 px-3 py-2">
        <p class="text-sm text-destructive">{errorMessage}</p>
      </div>
    {/if}
  </footer>
</div>
