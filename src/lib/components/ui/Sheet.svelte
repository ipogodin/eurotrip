<script>
	import Icon from '$lib/icons/Icon.svelte';

	/**
	 * Bottom sheet on phones, centered dialog on desktop. Built on <dialog>, so
	 * focus trapping, Esc and inert background come from the browser.
	 * @type {{ open: boolean, title: string, onclose: () => void, children: import('svelte').Snippet }}
	 */
	let { open, title, onclose, children } = $props();

	/** @type {HTMLDialogElement | undefined} */
	let dialog = $state();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});

	/** @param {MouseEvent} e */
	function backdrop(e) {
		if (e.target === dialog) onclose();
	}
</script>

<dialog bind:this={dialog} {onclose} onclick={backdrop} aria-label={title}>
	<div class="panel">
		<span class="grab" aria-hidden="true"></span>
		<header>
			<h2 class="t-title">{title}</h2>
			<button type="button" class="close" aria-label="Close" onclick={onclose}>
				<Icon name="x" />
			</button>
		</header>
		{@render children()}
	</div>
</dialog>

<style>
	dialog {
		border: 0;
		padding: 0;
		background: transparent;
		color: inherit;
		max-width: none;
		max-height: none;
		width: 100%;
		margin: auto 0 0;
		overflow: visible;
	}
	dialog::backdrop {
		background: rgb(12 59 62 / 0.5);
		backdrop-filter: blur(2px);
	}
	.panel {
		background: var(--surface);
		border-radius: var(--r-lg) var(--r-lg) 0 0;
		box-shadow: var(--e3);
		padding: var(--s4) var(--s4) calc(var(--s6) + env(safe-area-inset-bottom));
		max-height: 85dvh;
		overflow: auto;
		animation: rise var(--t-sheet) var(--spring);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--s3);
	}
	.close {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		margin-right: -10px;
		border: 0;
		background: transparent;
		border-radius: 50%;
	}
	.close:hover {
		background: var(--surface-2);
	}
	.grab {
		display: block;
		width: 44px;
		height: 5px;
		margin: 0 auto var(--s3);
		border-radius: 3px;
		background: var(--line);
	}
	@keyframes rise {
		from {
			transform: translateY(24px);
			opacity: 0;
		}
	}
	@media (min-width: 768px) {
		dialog {
			width: min(520px, 100% - 32px);
			margin: auto;
		}
		.grab {
			display: none;
		}
		.panel {
			border-radius: var(--r-lg);
			padding-bottom: var(--s6);
		}
	}
</style>
