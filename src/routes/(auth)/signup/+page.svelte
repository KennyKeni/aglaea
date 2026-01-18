<svelte:head>
  <title>Sign Up | Aglaea</title>
</svelte:head>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { authClient } from '$lib/auth-client';
  import * as Card from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Button } from '$lib/components/ui/button';
  import { Loader2 } from '@lucide/svelte';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let error = $state('');
  let isLoading = $state(false);

  const passwordMismatch = $derived(confirmPassword.length > 0 && password !== confirmPassword);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }

    error = '';
    isLoading = true;

    await authClient.signUp.email(
      { name, email, password, callbackURL: '/' },
      {
        onSuccess: () => {
          goto('/');
        },
        onError: (ctx) => {
          error = ctx.error.message || 'Failed to create account';
          isLoading = false;
        },
      },
    );
  }
</script>

<Card.Root class="w-full max-w-md">
  <Card.Header class="text-center">
    <Card.Title class="text-2xl">Create Account</Card.Title>
    <Card.Description>Enter your details to create a new account</Card.Description>
  </Card.Header>
  <form onsubmit={handleSubmit} class="flex flex-col gap-6">
    <Card.Content class="grid gap-6">
      {#if error}
        <div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      {/if}
      <div class="space-y-2">
        <Label for="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Your name"
          bind:value={name}
          required
          disabled={isLoading}
        />
      </div>
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          bind:value={email}
          required
          disabled={isLoading}
        />
      </div>
      <div class="space-y-2">
        <Label for="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          bind:value={password}
          required
          disabled={isLoading}
        />
      </div>
      <div class="space-y-2">
        <Label for="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          bind:value={confirmPassword}
          required
          disabled={isLoading}
          aria-invalid={passwordMismatch ? true : undefined}
        />
        {#if passwordMismatch}
          <p class="text-sm text-destructive">Passwords do not match</p>
        {/if}
      </div>
    </Card.Content>
    <Card.Footer class="flex flex-col gap-6">
      <Button type="submit" class="w-full" disabled={isLoading || passwordMismatch}>
        {#if isLoading}
          <Loader2 class="animate-spin" />
          Creating account...
        {:else}
          Create account
        {/if}
      </Button>
      <p class="text-center text-sm text-muted-foreground">
        Already have an account?
        <a href="/login" class="text-primary hover:underline">Sign in</a>
      </p>
    </Card.Footer>
  </form>
</Card.Root>
