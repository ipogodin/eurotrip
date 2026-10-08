<script>
	import Icon from '$lib/icons/Icon.svelte';
	import { formatRemaining } from '$lib/time.js';

	/** @type {{ deadline: string, closedLabel?: string }} */
	let { deadline, closedLabel } = $props();

	/** @type {number | null} */
	let now = $state(null);

	// Browser-only clock: starts after mount so SSR and hydration agree.
	$effect(() => {
		now = Date.now();
		const id = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(id);
	});

	const r = $derived(now === null ? null : formatRemaining(now, Date.parse(deadline)));
</script>

<span class="cd num" class:urgent={r?.urgent} class:closed={r?.closed} class:final={r?.final}>
	<Icon name="clock" size={14} />
	<span>{r === null ? '…' : r.closed && closedLabel ? closedLabel : r.text}</span>
</span>

<style>
	.cd {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 28px;
		padding: 0 10px;
		border-radius: var(--r-pill);
		background: var(--surface-2);
		color: var(--ink-2);
		font-size: 13px;
		font-weight: 600;
	}
	.urgent {
		background: var(--sun-soft);
		color: #7a5400;
	}
	.final {
		background: var(--danger-soft);
		color: #a82f2f;
	}
	.closed {
		background: var(--surface-2);
		color: var(--ink-2);
	}
</style>
