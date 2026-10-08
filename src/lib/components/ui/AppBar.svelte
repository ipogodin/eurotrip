<script>
	import { resolve } from '$app/paths';
	import Avatar from './Avatar.svelte';
	import Icon from '$lib/icons/Icon.svelte';

	/**
	 * @type {{
	 *   title?: string,
	 *   member: (import('$lib/members-ui.js').PublicMember & { isAdmin?: boolean }) | null,
	 *   nav?: { href: string, label: string }[],
	 *   current?: string,
	 *   children?: import('svelte').Snippet
	 * }}
	 */
	let { title = 'Eurotrip', member, nav = [], current = '', children } = $props();

	let menuOpen = $state(false);
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (menuOpen = false)} />

<header class="bar">
	<div class="inner">
		<a class="brand" href={resolve('/')}>
			<span class="mark" aria-hidden="true"><Icon name="waves" size={16} /></span>
			<span class="name">{title}</span>
		</a>

		{#if nav.length}
			<nav class="top-nav" aria-label="Primary">
				{#each nav as n (n.href)}
					<a
						href={resolve(/** @type {any} */ (n.href))}
						aria-current={current === n.href ? 'page' : undefined}>{n.label}</a
					>
				{/each}
			</nav>
		{/if}

		<div class="end">
			{@render children?.()}
			{#if member}
				<div class="menu">
					<button
						type="button"
						class="who"
						aria-haspopup="menu"
						aria-expanded={menuOpen}
						aria-label="Account menu for {member.name}"
						onclick={() => (menuOpen = !menuOpen)}
					>
						<Avatar {member} size={32} />
					</button>
					{#if menuOpen}
						<div class="pop" role="menu">
							<p class="who-name">{member.name}</p>
							{#if member.isAdmin}
								<a role="menuitem" href={resolve(/** @type {any} */ ('/admin'))}>
									<Icon name="shield" size={16} /> Admin
								</a>
							{/if}
							<form method="POST" action="/logout">
								<button type="submit" role="menuitem"
									><Icon name="log-out" size={16} /> Log out</button
								>
							</form>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</header>

<style>
	.bar {
		position: sticky;
		top: 0;
		z-index: 50;
		height: var(--appbar-h);
		background: rgb(255 255 255 / 0.85);
		backdrop-filter: blur(14px);
		border-bottom: 1px solid var(--line);
	}
	.inner {
		width: min(var(--page-max), 100% - 32px);
		height: 100%;
		margin-inline: auto;
		display: flex;
		align-items: center;
		gap: var(--s4);
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--s2);
		color: var(--ink);
		font-weight: 700;
		text-decoration: none;
	}
	.mark {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 9px;
		background: var(--accent);
		color: #fff;
	}
	.top-nav {
		display: none;
		gap: var(--s1);
		margin-left: var(--s4);
	}
	.top-nav a {
		padding: 8px 12px;
		border-radius: var(--r-sm);
		color: var(--ink-2);
		font-weight: 600;
		text-decoration: none;
	}
	.top-nav a[aria-current='page'] {
		background: var(--accent-soft);
		color: var(--accent-strong);
	}
	.end {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: var(--s3);
	}
	.menu {
		position: relative;
	}
	.who {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		padding: 0;
		border: 0;
		background: transparent;
		border-radius: 50%;
	}
	.pop {
		position: absolute;
		right: 0;
		top: calc(100% + 4px);
		min-width: 200px;
		padding: var(--s2);
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		box-shadow: var(--e2);
		display: grid;
	}
	.who-name {
		padding: var(--s2) var(--s3);
		font-weight: 600;
		border-bottom: 1px solid var(--line);
		margin-bottom: var(--s1);
	}
	.pop a,
	.pop button {
		display: flex;
		align-items: center;
		gap: var(--s2);
		width: 100%;
		min-height: 44px;
		padding: 0 var(--s3);
		border: 0;
		border-radius: var(--r-sm);
		background: transparent;
		color: var(--ink);
		text-align: left;
		text-decoration: none;
	}
	.pop a:hover,
	.pop button:hover {
		background: var(--surface-2);
	}
	@media (min-width: 768px) {
		.top-nav {
			display: flex;
		}
	}
</style>
