<script lang="ts">
  import { onMount } from 'svelte';
  import { env } from '$env/dynamic/public';
  import { authClient } from '$lib/auth-client';
  import { Button } from '$lib/components/ui/button';
  import { Loader2, X, Mail } from '@lucide/svelte';

  interface Props {
    email: string;
  }

  let { email }: Props = $props();

  const DISMISS_KEY = 'email-verification-banner-dismissed';

  let dismissed = $state(false);
  let isResending = $state(false);
  let resendSuccess = $state(false);
  let resendError = $state('');

  onMount(() => {
    dismissed = sessionStorage.getItem(DISMISS_KEY) === 'true';
  });

  function handleDismiss() {
    dismissed = true;
    sessionStorage.setItem(DISMISS_KEY, 'true');
  }

  async function handleResend() {
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
      resendError = result.error.message || 'Failed to send';
    } else {
      resendSuccess = true;
    }
  }
</script>

{#if !dismissed}
  <div class="bg-amber-500/10 border-b border-amber-500/20">
    <div class="mx-auto flex items-center justify-between gap-4 px-4 py-2">
      <div class="flex items-center gap-3 text-sm text-amber-700 dark:text-amber-400">
        <Mail class="h-4 w-4 shrink-0" />
        <span>
          {#if resendSuccess}
            Verification email sent to {email}
          {:else if resendError}
            {resendError}
          {:else}
            Please verify your email address
          {/if}
        </span>
      </div>
      <div class="flex items-center gap-2">
        {#if !resendSuccess}
          <Button
            variant="ghost"
            size="sm"
            class="h-7 text-amber-700 hover:text-amber-800 hover:bg-amber-500/20 dark:text-amber-400 dark:hover:text-amber-300"
            onclick={handleResend}
            disabled={isResending}
          >
            {#if isResending}
              <Loader2 class="h-3 w-3 animate-spin" />
            {:else}
              Resend
            {/if}
          </Button>
        {/if}
        <Button
          variant="ghost"
          size="sm"
          class="h-7 w-7 p-0 text-amber-700 hover:text-amber-800 hover:bg-amber-500/20 dark:text-amber-400 dark:hover:text-amber-300"
          onclick={handleDismiss}
        >
          <X class="h-4 w-4" />
          <span class="sr-only">Dismiss</span>
        </Button>
      </div>
    </div>
  </div>
{/if}
