<script>
	import { resolve } from '$app/paths';
	import { initials, memberColor } from '$lib/members-ui.js';

	/** @type {{ member: import('$lib/members-ui.js').PublicMember, size?: number, ring?: boolean }} */
	let { member, size = 28, ring = false } = $props();

	// The photo (when there is one) sits on top of the coloured initials, so a
	// photo that fails to load simply leaves the initials showing.
	const src = $derived(
		member.photo
			? resolve('/avatars/[id]/[version]', { id: member.id, version: String(member.photo) })
			: ''
	);
	let failedSrc = $state('');
</script>

<span
	class="avatar"
	class:ring
	style:--size="{size}px"
	style:background={memberColor(member)}
	title={member.name}
	role="img"
	aria-label={member.name}
>
	<span aria-hidden="true">{initials(member.name)}</span>
	{#if src && failedSrc !== src}
		<img {src} alt="" loading="lazy" decoding="async" onerror={() => (failedSrc = src)} />
	{/if}
</span>

<style>
	.avatar {
		display: inline-grid;
		place-items: center;
		width: var(--size);
		height: var(--size);
		border-radius: 50%;
		color: #fff;
		font-size: calc(var(--size) * 0.4);
		font-weight: 900;
		letter-spacing: 0.02em;
		flex: none;
		box-shadow:
			0 0 0 2px #fff,
			0 2px 6px rgb(120 60 20 / 0.25);
	}
	.avatar {
		position: relative;
		overflow: hidden;
	}
	.avatar > span {
		grid-area: 1 / 1;
	}
	.avatar img {
		grid-area: 1 / 1;
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
	}
	.ring {
		box-shadow:
			0 0 0 3px #fff,
			0 2px 6px rgb(120 60 20 / 0.25);
	}
</style>
