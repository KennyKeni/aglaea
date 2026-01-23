<svelte:head>
  <title>Email Verified | Aglaea</title>
</svelte:head>

<script lang="ts">
  import { page } from '$app/stores';
  import { env } from '$env/dynamic/public';
  import { authClient } from '$lib/auth-client';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Loader2, CheckCircle, XCircle } from '@lucide/svelte';

  const error = $derived($page.url.searchParams.get('error'));
  const isError = $derived(!!error);

  let email = $state('');
  let isResending = $state(false);
  let resendSuccess = $state(false);
  let resendError = $state('');

  async function handleResend(e: SubmitEvent) {
    e.preventDefault();
    if (!email) return;

    isResending = true;
    resendSuccess = false;
    resendError = '';

    const result = await authClient.sendVerificationEmail({
      email,
      callbackURL: `${env.PUBLIC_APP_URL}/email-verified`,
    });

    isResending = false;

    if (result.error) {
      resendError = result.error.message || 'Failed to send verification email';
    } else {
      resendSuccess = true;
    }
  }
</script>

<Card.Root class="w-full max-w-md">
  <Card.Header class="text-center">
    {#if isError}
      <div
        class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10"
      >
        <XCircle class="h-6 w-6 text-destructive" />
      </div>
      <Card.Title class="text-2xl">Verification failed</Card.Title>
      <Card.Description>
        {#if error === 'invalid_token'}
          The verification link is invalid or has expired.
        {:else}
          Something went wrong during verification.
        {/if}
      </Card.Description>
    {:else}
      <div
        class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10"
      >
        <CheckCircle class="h-6 w-6 text-green-600 dark:text-green-400" />
      </div>
      <Card.Title class="text-2xl">Email verified</Card.Title>
      <Card.Description>Your email has been verified successfully.</Card.Description>
    {/if}
  </Card.Header>

  {#if isError}
    <form onsubmit={handleResend}>
      <Card.Content class="grid gap-4">
        {#if resendSuccess}
          <div
            class="flex items-center gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400"
          >
            <CheckCircle class="h-4 w-4" />
            Verification email sent. Check your inbox.
          </div>
        {/if}
        {#if resendError}
          <div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {resendError}
          </div>
        {/if}
        <p class="text-center text-sm text-muted-foreground">
          Enter your email to receive a new verification link.
        </p>
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            bind:value={email}
            required
            disabled={isResending}
          />
        </div>
      </Card.Content>
      <Card.Footer class="flex flex-col gap-4">
        <Button type="submit" class="w-full" disabled={isResending || !email}>
          {#if isResending}
            <Loader2 class="animate-spin" />
            Sending...
          {:else}
            Resend verification email
          {/if}
        </Button>
        <p class="text-center text-sm text-muted-foreground">
          <a href="/login" class="text-primary hover:underline">Back to login</a>
        </p>
      </Card.Footer>
    </form>
  {:else}
    <Card.Footer>
      <a href="/" class="block w-full">
        <Button class="w-full">Continue to app</Button>
      </a>
    </Card.Footer>
  {/if}
</Card.Root>
