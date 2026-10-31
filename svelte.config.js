import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		// nodejs22.x가 필요하다: renderMarkdown이 쓰는 isomorphic-dompurify → jsdom →
		// html-encoding-sniffer(CJS)가 @exodus/bytes(ESM)를 require()한다.
		// require(ESM)은 Node 20.19+에서만 지원되는데 Vercel의 nodejs20.x 런타임은
		// 그 이전이라 /content/[slug]와 /courts/[slug]가 ERR_REQUIRE_ESM으로 500이 났다.
		// 로컬 Node가 20.19.4라 dev·preview·빌드 모두 통과해 배포 전에는 잡히지 않는다.
		// 크론 함수(api/cron/*)도 이 설정을 따른다. 예전엔 nodejs20.x를 따로 명시했는데
		// Vercel이 nodejs20.x를 종료해 배포 단계에서 전체 배포가 실패했다(2026-10-16~25).
		adapter: adapter({ runtime: 'nodejs22.x' }),
		serviceWorker: {
			register: true
		}
	}
};

export default config;
