<script>
	import { invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Sheet from '$lib/components/ui/Sheet.svelte';

	/**
	 * "Change photo". The member picks a photo, we pretend to upload it, and
	 * they get the next prepared photo instead, with a random phrase. The photo
	 * they picked never leaves their device: it's only used for the preview,
	 * and the request to the server carries no picture at all.
	 * @type {{
	 *   member: import('$lib/members-ui.js').PublicMember,
	 *   open: boolean,
	 *   onclose: () => void
	 * }}
	 */
	let { member, open, onclose } = $props();

	/** How long the fake upload takes (ms), so it feels real. */
	const FAKE_UPLOAD_MS = 2200;

	/** @type {'pick' | 'sending' | 'reveal' | 'error'} */
	let phase = $state('pick');
	let preview = $state('');
	let progress = $state(0);
	let result = $state(
		/** @type {{ version: number, changed: boolean, phrase: string } | null} */ (null)
	);

	function reset() {
		if (preview) URL.revokeObjectURL(preview);
		phase = 'pick';
		preview = '';
		progress = 0;
		result = null;
	}

	function close() {
		onclose();
		// Let the sheet finish closing before the content changes back.
		setTimeout(reset, 300);
	}

	/** @param {Event & { currentTarget: HTMLInputElement }} e */
	async function chosen(e) {
		const input = e.currentTarget;
		const file = input.files?.[0];
		if (!file) return;
		if (preview) URL.revokeObjectURL(preview);
		preview = URL.createObjectURL(file); // only ever shown here, on this device
		input.value = '';
		phase = 'sending';
		progress = 0;

		const started = Date.now();
		const timer = setInterval(() => {
			// Eases toward 95% and holds until the answer is in.
			progress = Math.min(95, ((Date.now() - started) / FAKE_UPLOAD_MS) * 100);
		}, 60);
		try {
			const body = new FormData();
			body.set('action', 'update'); // a real form post, so the cross-site check applies; no picture
			const [res] = await Promise.all([
				fetch(resolve('/avatars/swap'), { method: 'POST', body }).then((r) => {
					if (!r.ok) throw new Error(String(r.status));
					return r.json();
				}),
				new Promise((done) => setTimeout(done, FAKE_UPLOAD_MS))
			]);
			result = res;
			progress = 100;
			phase = 'reveal';
			// Everyone's screens pick up the new photo on their next refresh.
			await invalidate('app:votes');
		} catch {
			phase = 'error';
		} finally {
			clearInterval(timer);
		}
	}

	/** The member as they look after the swap (the new version, not the picked file). */
	const updated = $derived({ ...member, photo: result?.version ?? member.photo });
</script>

<Sheet {open} title="Change your photo" onclose={close}>
	<div class="change">
		{#if phase === 'pick'}
			<Avatar {member} size={96} ring />
			<p>Choose a new photo for your profile. Everyone in the group will see it.</p>
			<label class="btn btn-primary">
				Choose a photo
				<input type="file" accept="image/*" onchange={chosen} />
			</label>
		{:else if phase === 'sending'}
			<span
				class="shot"
				style:background-image="url({preview})"
				role="img"
				aria-label="Your chosen photo"
			></span>
			<p role="status">Uploading your photo…</p>
			<progress max="100" value={progress} aria-label="Upload progress"></progress>
		{:else if phase === 'reveal'}
			<Avatar member={updated} size={120} ring />
			<p class="phrase" role="status">{result?.phrase}</p>
			<Button onclick={close}>Okay, fine</Button>
		{:else}
			<p role="alert">Couldn't update your photo. Try again in a moment.</p>
			<Button onclick={reset}>Try again</Button>
		{/if}
	</div>
</Sheet>

<style>
	.change {
		display: grid;
		justify-items: center;
		gap: var(--s4);
		text-align: center;
		min-width: min(320px, 70vw);
	}
	.change p {
		margin: 0;
	}
	.phrase {
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 800;
		line-height: 26px;
		max-width: 22ch;
	}
	label.btn {
		position: relative;
		cursor: pointer;
	}
	input[type='file'] {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}
	.shot {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background-size: cover;
		background-position: center;
		box-shadow:
			0 0 0 3px #fff,
			0 2px 10px rgb(120 60 20 / 0.3);
	}
	progress {
		width: 100%;
		height: 10px;
		accent-color: var(--hibiscus);
	}
</style>
