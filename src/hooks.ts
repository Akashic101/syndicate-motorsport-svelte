import { deLocalizeUrl, localizeHref } from '$lib/paraglide/runtime';

export const reroute = (request) => deLocalizeUrl(request.url).pathname;

export const transport = (url: string) => localizeHref(url);
