<script>
	/**
	 * @type {{
	 *   variant?: 'primary' | 'secondary' | 'ghost' | 'danger',
	 *   size?: 'sm' | 'md' | 'lg',
	 *   block?: boolean,
	 *   type?: 'button' | 'submit' | 'reset',
	 *   disabled?: boolean,
	 *   onclick?: (e: MouseEvent) => void,
	 *   children: import('svelte').Snippet
	 * }}
	 */
	let {
		variant = 'primary',
		size = 'md',
		block = false,
		type = 'button',
		disabled = false,
		onclick,
		children,
		...rest
	} = $props();
</script>

<button
	{type}
	{disabled}
	{onclick}
	class="btn btn-{variant}"
	class:btn-sm={size === 'sm'}
	class:btn-lg={size === 'lg'}
	class:btn-block={block}
	{...rest}
>
	{@render children()}
</button>
