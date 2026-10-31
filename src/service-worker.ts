/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, prerendered, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
	...files, // everything in `static`
	...prerendered // prerendered pages
];

// Install event: cache all assets
sw.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

// Activate event: delete old caches
sw.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

// Fetch event: serve cached assets
sw.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET' || event.request.headers.has('range')) return;

	const url = new URL(event.request.url);

	// only cache requests from our own origin
	if (url.origin === location.origin) {
		event.respondWith(
			(async () => {
				// For build assets, try the cache first
				if (ASSETS.includes(url.pathname)) {
					const cache = await caches.open(CACHE);
					const cachedResponse = await cache.match(event.request);
					if (cachedResponse) return cachedResponse;
				}

				// For non-build assets, try the network first
				try {
					const response = await fetch(event.request);

					// If this is a successful response, cache it
					if (response.status === 200) {
						const cache = await caches.open(CACHE);
						cache.put(event.request, response.clone());
					}

					return response;
				} catch (err) {
					// If the network fails, try the cache
					const cache = await caches.open(CACHE);
					const cachedResponse = await cache.match(event.request);
					if (cachedResponse) return cachedResponse;

					// If all else fails, return a fallback
					throw err;
				}
			})()
		);
	}
});