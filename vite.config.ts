/// <reference types="vitest" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { config } from 'dotenv';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

// Load environment variables
config();

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			devOptions: {
				enabled: true
			},
			manifest: {
				short_name: 'CourtNow',
				name: 'CourtNow - 공공 테니스장 예약 현황',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				background_color: '#ffffff',
				theme_color: '#10b981',
				icon: 'static/favicon.svg'
			}
		})
	],
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
