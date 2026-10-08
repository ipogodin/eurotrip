<script>
	import Icon from '$lib/icons/Icon.svelte';
	import { toasts } from './toast.svelte.js';
</script>

<div class="toaster" aria-live="polite" aria-atomic="false">
	{#each toasts.items as t (t.id)}
		<div class="toast {t.tone}" role="status">
			<Icon
				name={t.tone === 'error' ? 'alert' : t.tone === 'success' ? 'check' : 'clock'}
				size={16}
			/>
			{t.message}
		</div>
	{/each}
</div>

<style>
	.toaster {
		position: fixed;
		z-index: 100;
		left: 50%;
		bottom: calc(var(--bottomnav-h) + var(--s4) + env(safe-area-inset-bottom));
		transform: translateX(-50%);
		display: grid;
		gap: var(--s2);
		width: max-content;
		max-width: calc(100% - 32px);
		pointer-events: none;
	}
	.toast {
		display: flex;
		align-items: center;
		gap: var(--s2);
		padding: 10px 16px;
		border-radius: var(--r-pill);
		background: var(--ink);
		color: #fff;
		font-size: 14px;
		font-weight: 500;
		box-shadow: var(--e2);
		animation: pop var(--t-sheet) var(--ease);
	}
	.success :global(svg) {
		color: #6ee7a8;
	}
	.error {
		background: #8f2424;
	}
	@keyframes pop {
		from {
			transform: translateY(8px);
			opacity: 0;
		}
	}
	@media (min-width: 768px) {
		.toaster {
			bottom: var(--s6);
		}
	}
</style>
