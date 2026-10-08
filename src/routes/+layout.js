// The whole site is static content — prerender every page to plain HTML at
// build time so Vercel serves it from the CDN with no serverless function.
export const prerender = true;
