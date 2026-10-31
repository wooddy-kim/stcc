// Kakao JavaScript SDK Type Definitions
declare global {
  interface Window {
    Kakao: KakaoSDK;
  }
}

interface KakaoSDK {
  init(appKey: string): void;
  isInitialized(): boolean;
  Share: {
    sendDefault(settings: KakaoShareSettings): void;
  };
}

interface KakaoShareSettings {
  objectType: 'feed';
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  };
  buttons?: Array<{
    title: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  }>;
}

export {};