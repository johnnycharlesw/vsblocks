function decode(value) {
	return value === null ? null : decodeURIComponent(value);
}

const url = new URL(window.location.href);
const params = url.searchParams;
const id = decode(params.get('vsblocks-reqid'));
const scheme = decode(params.get('vsblocks-scheme'));
const authority = decode(params.get('vsblocks-authority'));

if (!id) {
	throw new Error('Missing id');
} else if (!scheme) {
	throw new Error('Missing scheme');
} else if (!authority) {
	throw new Error('Missing authority');
}

const path = decode(params.get('vsblocks-path'));
const query = decode(params.get('vsblocks-query'));
const fragment = decode(params.get('vsblocks-fragment'));

params.delete('vsblocks-reqid');
params.delete('vsblocks-scheme');
params.delete('vsblocks-authority');
params.delete('vsblocks-path');
params.delete('vsblocks-query');
params.delete('vsblocks-fragment');

let uri = { scheme, authority };

if (path) {
	uri.path = path;
}

if (query) {
	const originalParams = new URLSearchParams(query);
	originalParams.forEach((value, key) => params.set(key, value));
}

const resultQuery = params.toString();
if (resultQuery) {
	uri.query = resultQuery;
}

if (fragment) {
	uri.fragment = fragment;
}

localStorage.setItem(`vsblocks-web.url-callbacks[${id}]`, JSON.stringify(uri));
