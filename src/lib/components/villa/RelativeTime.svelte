<script>
	import { formatAgo } from '$lib/time.js';

	/** @type {{ iso: string }} */
	let { iso } = $props();

	/** @type {number | null} */
	let now = $state(null);

	// Browser-only clock, so the server and the first paint agree (no mismatch);
	// the label fills in right after load and keeps itself fresh.
	$effect(() => {
		now = Date.now();
		const id = setInterval(() => (now = Date.now()), 30_000);
		return () => clearInterval(id);
	});

	const label = $derived(now === null ? '' : formatAgo(iso, now));
	const full = $derived(
		now === null
			? undefined
			: new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
					new Date(iso)
				)
	);
</script>

<time datetime={iso} title={full}>{label}</time>
