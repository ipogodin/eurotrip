<script>
	import { enhance } from '$app/forms';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ConfirmSheet from '$lib/components/ui/ConfirmSheet.svelte';
	import { showToast } from '$lib/components/ui/toast.svelte.js';
	import Icon from '$lib/icons/Icon.svelte';
	import RelativeTime from './RelativeTime.svelte';

	/**
	 * Public comments on a villa: everyone signed in sees them, anyone can write,
	 * authors delete their own and the admin can delete any. Text only: it is
	 * always shown as plain text, never as HTML.
	 * @type {{
	 *   comments: import('$lib/server/store/types.js').Comment[],
	 *   members: import('$lib/members-ui.js').PublicMember[],
	 *   me: string,
	 *   isAdmin: boolean,
	 *   max: number
	 * }}
	 */
	let { comments, members, me, isAdmin, max } = $props();

	let text = $state('');
	let posting = $state(false);
	/** The comment waiting for "Delete?" confirmation. */
	let deleting = $state('');

	const byId = $derived(new Map(members.map((m) => [m.id, m])));
	const empty = $derived(text.trim().length === 0);

	/** @type {import('@sveltejs/kit').SubmitFunction} */
	const post = () => {
		posting = true;
		return async ({ result, update }) => {
			posting = false;
			if (result.type === 'success') {
				text = '';
			} else if (result.type === 'failure') {
				const message = /** @type {{ message?: string } | undefined} */ (result.data)?.message;
				showToast(message ?? 'Could not post that.', 'error', 5000);
			} else {
				showToast('Something went wrong. Try again.', 'error', 5000);
			}
			await update({ reset: false });
		};
	};

	/** @type {import('@sveltejs/kit').SubmitFunction} */
	const remove =
		() =>
		async ({ result, update }) => {
			deleting = '';
			if (result.type === 'failure') {
				const message = /** @type {{ message?: string } | undefined} */ (result.data)?.message;
				showToast(message ?? 'Could not delete that.', 'error', 5000);
			}
			await update({ reset: false });
		};

	/** @param {KeyboardEvent & { currentTarget: HTMLTextAreaElement }} e */
	function onKeydown(e) {
		// Ctrl/Cmd + Enter posts, like most chat boxes.
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !empty && !posting) {
			e.currentTarget.form?.requestSubmit();
		}
	}
</script>

<section class="comments" aria-labelledby="comments-title">
	<h2 id="comments-title" class="t-headline">
		Comments <span class="count num">{comments.length}</span>
	</h2>

	{#if comments.length === 0}
		<p class="empty">No comments yet. Say what you think of this villa.</p>
	{:else}
		<ul class="list">
			{#each comments as c (c.id)}
				{@const author = byId.get(c.memberId)}
				<li>
					{#if author}<Avatar member={author} size={36} />{/if}
					<div class="body">
						<p class="meta">
							<b>{c.memberId === me ? 'You' : (author?.short ?? 'Someone')}</b>
							<span aria-hidden="true">·</span>
							<RelativeTime iso={c.createdAt} />
						</p>
						<p class="text">{c.text}</p>
					</div>
					{#if c.memberId === me || isAdmin}
						<button
							type="button"
							class="del"
							aria-label="Delete this comment"
							title="Delete"
							onclick={() => (deleting = c.id)}
						>
							<Icon name="x" size={16} />
						</button>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}

	<form class="write" method="POST" action="?/comment" use:enhance={post}>
		<label class="sr-only" for="comment-text">Write a comment</label>
		<textarea
			id="comment-text"
			name="text"
			rows="3"
			maxlength={max}
			placeholder="Write a comment everyone can see…"
			bind:value={text}
			onkeydown={onKeydown}></textarea>
		<div class="bar">
			<span class="left num" class:near={max - text.length < 40}>{max - text.length} left</span>
			<Button type="submit" disabled={empty || posting}>{posting ? 'Posting…' : 'Post'}</Button>
		</div>
	</form>
</section>

<ConfirmSheet
	open={deleting !== ''}
	title="Delete this comment?"
	action="?/deleteComment"
	fields={{ commentId: deleting }}
	confirmLabel="Delete"
	tone="danger"
	submit={remove}
	onclose={() => (deleting = '')}
>
	<p>It disappears for everyone.</p>
</ConfirmSheet>

<style>
	.comments {
		display: grid;
		gap: var(--s4);
		padding-top: var(--s3);
		border-top: 2px dashed var(--line);
	}
	h2 {
		display: flex;
		align-items: center;
		gap: var(--s2);
		margin: 0;
	}
	.count {
		padding: 0 10px;
		border-radius: var(--r-pill);
		background: var(--sea-soft);
		color: #055c61;
		font-size: 14px;
		font-weight: 900;
	}
	.empty {
		margin: 0;
		color: var(--ink-3);
		font-weight: 700;
	}
	.list {
		display: grid;
		gap: var(--s3);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.list li {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: start;
		gap: var(--s3);
		padding: var(--s3);
		border-radius: var(--r-md);
		background: var(--surface-2);
	}
	.body {
		min-width: 0;
	}
	.meta {
		display: flex;
		gap: 6px;
		margin: 0 0 2px;
		font-size: 13px;
		color: var(--ink-3);
		font-weight: 700;
	}
	.meta b {
		color: var(--ink);
		font-weight: 900;
	}
	.text {
		margin: 0;
		line-height: 24px;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.del {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		margin: -6px -6px 0 0;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--ink-3);
		cursor: pointer;
	}
	.del:hover {
		background: var(--danger-soft);
		color: var(--papaya);
	}
	.write {
		display: grid;
		gap: var(--s2);
	}
	textarea {
		width: 100%;
		min-height: 88px;
		padding: var(--s3) var(--s4);
		border: 2px solid var(--line);
		border-radius: var(--r-md);
		background: var(--surface);
		color: var(--ink);
		font: inherit;
		line-height: 24px;
		resize: vertical;
	}
	textarea:focus-visible {
		outline: none;
		border-color: var(--lagoon);
		box-shadow: 0 0 0 5px var(--sea-soft);
	}
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s3);
	}
	.left {
		color: var(--ink-3);
		font-size: 13px;
		font-weight: 700;
	}
	.left.near {
		color: var(--papaya);
	}
</style>
