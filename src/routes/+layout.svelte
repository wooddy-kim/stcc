<script>
  import Navigation from '$lib/components/Navigation.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import PWAInstallPrompt from '$lib/components/pwa/PWAInstallPrompt.svelte'
  import ScrollToTop from '$lib/components/ScrollToTop.svelte'
  import { favorites } from '$lib/stores/favorites'
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import { afterNavigate } from '$app/navigation'
  import { PUBLIC_ADSENSE_CLIENT_ID } from '$env/static/public'
  import { env } from '$env/dynamic/public'

  const ga4Id = env.PUBLIC_GA4_ID

  // 특정 페이지에서 푸터 숨김 여부 확인
  $: hideFooter = $page.url.pathname.startsWith('/map')

  // SvelteKit 클라이언트 라우팅은 자동 page_view가 잡히지 않으므로 수동 전송한다.
  // 최초 진입은 gtag 스니펫의 config가 처리하므로 from이 없으면 건너뛴다.
  afterNavigate(({ from, to }) => {
    const gtag = /** @type {any} */ (window).gtag
    if (!browser || !ga4Id || !gtag || !from) return
    gtag('event', 'page_view', {
      page_path: to?.url.pathname,
      page_location: to?.url.href,
      page_title: document.title
    })
  })

  onMount(() => {
    // localStorage → 즐겨찾기 store 복원
    favorites.hydrate()

    // Initialize Kakao SDK
    if (browser && typeof window !== 'undefined' && window.Kakao) {
      // Check if Kakao SDK is loaded
      if (!window.Kakao) {
        console.warn('Kakao SDK not loaded')
        return
      }

      if (!window.Kakao.isInitialized()) {
        try {
          window.Kakao.init('c09fad8cb99996bdc84d925a529e3c5f')
          console.log('Kakao SDK initialized successfully')
        } catch (error) {
          console.error('Kakao SDK initialization failed:', error)
        }
      } else {
        console.log('Kakao SDK already initialized')
      }
    }
  })
</script>

<svelte:head>
    <!-- AdSense 스크립트는 여기서 1회만 로드한다.
         컴포넌트 <svelte:head>에 두면 하이드레이션 후에야 로드가 시작되고
         인스턴스마다 중복 태그가 생겨 광고 노출이 늦어진다.
         browser 가드를 두지 않아 SSR HTML에 포함된다. -->
    {#if PUBLIC_ADSENSE_CLIENT_ID}
        <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLIC_ADSENSE_CLIENT_ID}`}
            crossorigin="anonymous"
        ></script>
    {/if}

    <!-- GA4: 미설정 시(ga4Id 없음) 아무것도 렌더하지 않는다. -->
    {#if ga4Id}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}></script>
        {@html `<script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${ga4Id}', { send_page_view: true });
        <\/script>`}
    {/if}
</svelte:head>

<Navigation/>

<div class="page-background">
    <div class="gradient-blob blob-1"></div>
    <div class="gradient-blob blob-2"></div>
</div>

<main>
    <slot/>
</main>

{#if !hideFooter}
    <Footer/>
{/if}

<PWAInstallPrompt/>

<ScrollToTop/>

<style>
    /* ===== Design Tokens (CSS Variables) ===== */
    :global(:root) {
        /* ===== Neutral Colors (뉴트럴) ===== */
        --color-gray-50: #f9fafb;
        --color-gray-100: #f3f4f6;
        --color-gray-200: #e5e7eb;
        --color-gray-300: #d1d5db;
        --color-gray-400: #9ca3af;
        --color-gray-500: #6b7280;
        --color-gray-600: #4b5563;
        --color-gray-700: #374151;
        --color-gray-800: #1f2937;
        --color-gray-900: #111827;

        /* ===== Primary Colors (브랜드 - 테니스 그린) ===== */
        --color-primary-50: #ecfdf5;
        --color-primary-100: #d1fae5;
        --color-primary-200: #a7f3d0;
        --color-primary-300: #6ee7b7;
        --color-primary-400: #34d399;
        --color-primary-500: #10b981;
        --color-primary-600: #059669;
        --color-primary-700: #047857;
        --color-primary-800: #065f46;
        --color-primary-900: #064e3b;

        /* ===== Success Colors (성공 - 초록색) ===== */
        --color-success-50: #f0fdf4;
        --color-success-100: #dcfce7;
        --color-success-200: #bbf7d0;
        --color-success-300: #86efac;
        --color-success-400: #4ade80;
        --color-success-500: #22c55e;
        --color-success-600: #16a34a;
        --color-success-700: #15803d;
        --color-success-800: #166534;
        --color-success-900: #14532d;

        /* ===== Warning Colors (경고 - 노란색/주황색) ===== */
        --color-warning-50: #fffbeb;
        --color-warning-100: #fef3c7;
        --color-warning-200: #fde68a;
        --color-warning-300: #fcd34d;
        --color-warning-400: #fbbf24;
        --color-warning-500: #f59e0b;
        --color-warning-600: #d97706;
        --color-warning-700: #b45309;
        --color-warning-800: #92400e;
        --color-warning-900: #78350f;

        /* ===== Error Colors (에러 - 빨간색) ===== */
        --color-error-50: #fef2f2;
        --color-error-100: #fee2e2;
        --color-error-200: #fecaca;
        --color-error-300: #fca5a5;
        --color-error-400: #f87171;
        --color-error-500: #ef4444;
        --color-error-600: #dc2626;
        --color-error-700: #b91c1c;
        --color-error-800: #991b1b;
        --color-error-900: #7f1d1d;

        /* ===== Semantic Colors (의미론적) ===== */
        --color-text-primary: var(--color-gray-800);
        --color-text-secondary: var(--color-gray-600);
        --color-text-tertiary: var(--color-gray-500);
        --color-text-disabled: var(--color-gray-400);

        --color-bg-primary: #ffffff;
        --color-bg-secondary: var(--color-gray-50);
        --color-bg-tertiary: var(--color-gray-100);
        --color-bg-page: var(--color-gray-100);

        --color-border-light: var(--color-gray-200);
        --color-border-default: var(--color-gray-300);
        --color-border-dark: var(--color-gray-400);

        /* ===== Font Family ===== */
        --font-sans: 'Pretendard Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --font-display: 'Inter', 'Pretendard Variable', -apple-system, BlinkMacSystemFont, sans-serif;

        /* ===== Font Sizes ===== */
        --text-xs: 0.75rem;
        --text-sm: 0.875rem;
        --text-base: 1rem;
        --text-lg: 1.125rem;
        --text-xl: 1.25rem;
        --text-2xl: 1.5rem;
        --text-3xl: 1.875rem;
        --text-4xl: 2.25rem;
        --text-5xl: 3rem;

        /* ===== Font Weights ===== */
        --font-normal: 400;
        --font-medium: 500;
        --font-semibold: 600;
        --font-bold: 700;
        --font-extrabold: 800;

        /* ===== Line Heights ===== */
        --leading-tight: 1.25;
        --leading-snug: 1.375;
        --leading-normal: 1.5;
        --leading-relaxed: 1.625;
        --leading-loose: 2;

        /* ===== Spacing Scale (8px 기반) ===== */
        --space-0: 0;
        --space-1: 0.25rem;
        --space-2: 0.5rem;
        --space-3: 0.75rem;
        --space-4: 1rem;
        --space-5: 1.25rem;
        --space-6: 1.5rem;
        --space-8: 2rem;
        --space-10: 2.5rem;
        --space-12: 3rem;
        --space-16: 4rem;
        --space-20: 5rem;

        /* ===== Container ===== */
        --container-max: 1200px;
        --container-padding: var(--space-4);

        /* ===== Box Shadows ===== */
        --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
        --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
        --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.04);
        --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.06), 0 4px 6px rgba(0, 0, 0, 0.04);
        --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.08), 0 10px 10px rgba(0, 0, 0, 0.04);

        /* ===== Colored Shadows (브랜드 컬러 - 테니스 그린) ===== */
        --shadow-primary-sm: 0 2px 4px rgba(16, 185, 129, 0.15);
        --shadow-primary-md: 0 4px 12px rgba(16, 185, 129, 0.2);
        --shadow-primary-lg: 0 8px 24px rgba(16, 185, 129, 0.25);
        --shadow-success-sm: 0 2px 4px rgba(34, 197, 94, 0.15);
        --shadow-error-sm: 0 2px 4px rgba(239, 68, 68, 0.15);

        /* ===== Accent Color (코랄 오렌지) ===== */
        --color-accent-50: #fff7ed;
        --color-accent-100: #ffedd5;
        --color-accent-200: #fed7aa;
        --color-accent-300: #fdba74;
        --color-accent-400: #fb923c;
        --color-accent-500: #f97316;
        --color-accent-600: #ea580c;
        --color-accent-700: #c2410c;

        /* ===== Gradients ===== */
        --gradient-primary: linear-gradient(135deg, #10b981 0%, #059669 100%);
        --gradient-primary-soft: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        --gradient-accent: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        --gradient-hero: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #ffffff 100%);

        /* ===== Border Radius ===== */
        --radius-sm: 6px;
        --radius-md: 8px;
        --radius-lg: 12px;
        --radius-xl: 16px;
        --radius-2xl: 24px;
        --radius-full: 9999px;

        /* ===== Transitions ===== */
        --transition-fast: 150ms ease;
        --transition-base: 200ms ease;
        --transition-slow: 300ms ease;
        --transition-bounce: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);

        /* ===== Transform Values ===== */
        --hover-lift: translateY(-2px);
        --hover-scale: scale(1.02);
        --active-scale: scale(0.98);
    }

    :global(html) {
        overflow-x: hidden;
    }

    :global(body) {
        margin: 0;
        padding: 0;
        font-family: var(--font-sans);
        font-size: var(--text-base);
        line-height: var(--leading-relaxed);
        background: var(--color-bg-page);
        color: var(--color-text-primary);
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    :global(*) {
        box-sizing: border-box;
    }

    :global(h1, h2, h3, h4, h5, h6) {
        margin: 0;
        line-height: var(--leading-tight);
    }

    :global(p) {
        margin: 0;
        line-height: var(--leading-relaxed);
    }

    :global(a) {
        color: var(--color-primary-600);
        text-decoration: none;
        transition: color var(--transition-fast);
    }

    :global(a:hover) {
        color: var(--color-primary-700);
    }

    /* Screen Reader Only */
    :global(.sr-only) {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    main {
        flex: 1;
        position: relative;
        z-index: 1;
    }

    /* Background decorative elements */
    .page-background {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        overflow: hidden;
        z-index: 0;
    }

    .gradient-blob {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.4;
        animation: float 20s ease-in-out infinite;
    }

    .blob-1 {
        width: 600px;
        height: 600px;
        background: var(--gradient-primary-soft);
        top: -200px;
        right: -200px;
    }

    .blob-2 {
        width: 400px;
        height: 400px;
        background: linear-gradient(135deg, var(--color-primary-100) 0%, var(--color-primary-200) 100%);
        bottom: -100px;
        left: -100px;
        animation-delay: -10s;
    }

    @keyframes float {
        0%, 100% {
            transform: translate(0, 0) scale(1);
        }
        25% {
            transform: translate(30px, -30px) scale(1.05);
        }
        50% {
            transform: translate(0, 20px) scale(0.95);
        }
        75% {
            transform: translate(-20px, -10px) scale(1.02);
        }
    }

    @media (max-width: 768px) {
        .gradient-blob {
            opacity: 0.3;
        }

        .blob-1 {
            width: 400px;
            height: 400px;
        }

        .blob-2 {
            width: 300px;
            height: 300px;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .gradient-blob {
            animation: none;
        }

        :global(*) {
            scroll-behavior: auto !important;
        }
    }
</style>
