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
		min-height: 32px;
		padding: 0 12px;
		border-radius: var(--r-pill);
		background: var(--sea-soft);
		color: #055c61;
		font-size: 14px;
		font-weight: 800;
	}
	.urgent {
		background: var(--sun-soft);
		color: #7a3e00;
	}
	.final {
		background: var(--danger-soft);
		color: #a32013;
		animation: throb 1.2s ease-in-out infinite;
	}
	.closed {
		background: var(--surface-2);
		color: var(--ink-2);
	}
	@keyframes throb {
		50% {
			transform: scale(1.05);
		}
	}
</style>
