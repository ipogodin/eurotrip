<script>
	import { enhance } from '$app/forms';
	import Button from './Button.svelte';
	import Sheet from './Sheet.svelte';

	/**
	 * A "Are you sure?" sheet that submits a form action when confirmed.
	 * Used for the admin's one-way actions.
	 * @type {{
	 *   open: boolean,
	 *   title: string,
	 *   action: string,
	 *   fields?: Record<string, string>,
	 *   confirmLabel: string,
	 *   cancelLabel?: string,
	 *   tone?: 'primary' | 'danger',
	 *   submit: import('@sveltejs/kit').SubmitFunction,
	 *   onclose: () => void,
	 *   children: import('svelte').Snippet
	 * }}
	 */
	let {
		open,
		title,
		action,
		fields = {},
		confirmLabel,
		cancelLabel = 'Cancel',
		tone = 'primary',
		submit,
		onclose,
		children
	} = $props();
</script>

<Sheet {open} {title} {onclose}>
	<form class="confirm" method="POST" {action} use:enhance={submit}>
		{#each Object.entries(fields) as [name, value] (name)}
			<input type="hidden" {name} {value} />
		{/each}
		<div class="msg">{@render children()}</div>
		<div class="actions">
			<Button variant="secondary" onclick={onclose}>{cancelLabel}</Button>
			<Button type="submit" variant={tone === 'danger' ? 'danger' : 'primary'}
				>{confirmLabel}</Button
			>
		</div>
	</form>
</Sheet>

<style>
	.confirm {
		display: grid;
		gap: var(--s4);
	}
	.msg :global(p) {
		margin: 0 0 var(--s2);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s3);
		justify-content: flex-end;
	}
</style>
