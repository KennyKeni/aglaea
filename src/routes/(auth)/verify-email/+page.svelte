<svelte:head>
  <title>Verify Email | Aglaea</title>
</svelte:head>

<script lang="ts">
  import { page } from '$app/stores';
  import { onDestroy } from 'svelte';
  import { env } from '$env/dynamic/public';
  import { authClient } from '$lib/auth-client';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Loader2, Mail, CheckCircle } from '@lucide/svelte';

  const email = $derived($page.url.searchParams.get('email') || '');

  let isResending = $state(false);
  let resendSuccess = $state(false);
  let resendError = $state('');
  let cooldown = $state(0);

  let cooldownInterval: ReturnType<typeof setInterval> | null = null;

  function startCooldown() {
    cooldown = 60;
    cooldownInterval = setInterval(() => {
      cooldown--;
      if (cooldown <= 0 && cooldownInterval) {
        clearInterval(cooldownInterval);
        cooldownInterval = null;
      }
    }, 1000);
  }

  onDestroy(() => {
    if (cooldownInterval) clearInterval(cooldownInterval);
  });

  async function handleResend() {
    if (!email || cooldown > 0) return;

    isResending = true;
    resendSuccess = false;
    resendError = '';

    const result = await authClient.sendVerificationEmail({
      email,
      callbackURL: `${env.PUBLIC_APP_URL}/email-verified`,
    });

    isResending = false;

    if (result.error) {
      resendError = result.error.message || 'Failed to resend verification email';
    } else {
      resendSuccess = true;
      startCooldown();
    }
  }
</script>

<Card.Root class="w-full max-w-md">
  <Card.Header class="text-center">
    <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
      <Mail class="h-6 w-6 text-primary" />
    </div>
    <Card.Title class="text-2xl">Check your email</Card.Title>
    <Card.Description>
      {#if email}
        We sent a verification link to <span class="font-medium text-foreground">{email}</span>
      {:else}
        We sent a verification link to your email address
      {/if}
    </Card.Description>
  </Card.Header>
  <Card.Content class="grid gap-4">
    {#if resendSuccess}
      <div class="flex items-center gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
        <CheckCircle class="h-4 w-4" />
        Verification email sent
      </div>
    {/if}
    {#if resendError}
      <div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
        {resendError}
      </div>
    {/if}
    <p class="text-center text-sm text-muted-foreground">
      Click the link in the email to verify your account. If you don't see it, check your spam
      folder.
    </p>
  </Card.Content>
  <Card.Footer class="flex flex-col gap-4">
    <Button
      variant="outline"
      class="w-full"
      onclick={handleResend}
      disabled={isResending || cooldown > 0 || !email}
    >
      {#if isResending}
        <Loader2 class="animate-spin" />
        Sending...
      {:else if cooldown > 0}
        Resend in {cooldown}s
      {:else}
        Resend verification email
      {/if}
    </Button>
    <a href="/" class="block w-full">
      <Button variant="default" class="w-full">Continue to app</Button>
    </a>
    <p class="text-center text-sm text-muted-foreground">
      Wrong email? <a href="/signup" class="text-primary hover:underline">Sign up again</a>
    </p>
  </Card.Footer>
</Card.Root>
