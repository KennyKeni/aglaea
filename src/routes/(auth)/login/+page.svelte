<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Loader2 } from '@lucide/svelte';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let isLoading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		isLoading = true;

		await authClient.signIn.email(
			{ email, password, callbackURL: '/' },
			{
				onSuccess: () => {
					goto('/');
				},
				onError: (ctx) => {
					error = ctx.error.message || 'Failed to sign in';
					isLoading = false;
				},
			},
		);
	}
</script>

<Card.Root class="w-full max-w-md">
	<Card.Header class="text-center">
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description>Enter your credentials to access your account</Card.Description>
	</Card.Header>
	<form onsubmit={handleSubmit} class="flex flex-col gap-6">
		<Card.Content class="grid gap-6">
			{#if error}
				<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
					{error}
				</div>
			{/if}
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
					placeholder="Enter your password"
					bind:value={password}
					required
					disabled={isLoading}
				/>
			</div>
		</Card.Content>
		<Card.Footer class="flex flex-col gap-6">
			<Button type="submit" class="w-full" disabled={isLoading}>
				{#if isLoading}
					<Loader2 class="animate-spin" />
					Signing in...
				{:else}
					Sign in
				{/if}
			</Button>
			<p class="text-center text-sm text-muted-foreground">
				Don't have an account?
				<a href="/signup" class="text-primary hover:underline">Sign up</a>
			</p>
		</Card.Footer>
	</form>
</Card.Root>
