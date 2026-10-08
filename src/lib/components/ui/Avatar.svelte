<script>
	import { initials, memberColor } from '$lib/members-ui.js';

	/** @type {{ member: import('$lib/members-ui.js').PublicMember, size?: number, ring?: boolean }} */
	let { member, size = 28, ring = false } = $props();
</script>

<span
	class="avatar"
	class:ring
	style:--size="{size}px"
	style:background={memberColor(member.id)}
	title={member.name}
	role="img"
	aria-label={member.name}
>
	<span aria-hidden="true">{initials(member.name)}</span>
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
		font-weight: 650;
		letter-spacing: 0.02em;
		flex: none;
	}
	.ring {
		box-shadow: 0 0 0 2px var(--surface);
	}
</style>
