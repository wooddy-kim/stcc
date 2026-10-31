# CourtNow - 수원/동탄 테니스장 예약 현황 조회 서비스

수원시와 동탄시의 공공 테니스장 예약 현황을 한눈에 확인할 수 있는 웹 서비스입니다.

## 주요 기능

- 🎾 테니스장 선택 + 요일 다중 선택 → 예약 현황 리스트 조회
- 📝 테니스 관련 콘텐츠 (Markdown 기반)
- 💰 Google AdSense 광고 수익화

## 기술 스택

- **프론트엔드/백엔드**: SvelteKit + TypeScript
- **데이터베이스**: PostgreSQL (Supabase) + Drizzle ORM
- **크롤링**: Playwright
- **배포**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 수정하여 필요한 환경 변수를 설정하세요:

```bash
# Supabase PostgreSQL - Connection Pooling (앱 런타임용)
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres

# Supabase PostgreSQL - Direct Connection (drizzle-kit 마이그레이션 전용)
DIRECT_DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres

# 관리자 API 토큰
ADMIN_TOKEN=your-secure-token

# Google AdSense 클라이언트 ID
PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...
```

### 3. 데이터베이스 설정

Supabase PostgreSQL 데이터베이스를 생성하고 스키마를 적용하세요:

1. [Supabase Dashboard](https://supabase.com/dashboard)에서 새 프로젝트 생성
2. Settings → Database에서 연결 문자열을 `.env` 파일에 복사
3. 마이그레이션 실행:

```bash
npm run db:push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:5173 을 열어 확인하세요.

## 프로젝트 구조

```
courtnow/
├── src/
│   ├── lib/
│   │   ├── server/
│   │   │   ├── db/              # 데이터베이스 관련
│   │   │   ├── crawlers/        # 크롤러 로직
│   │   │   ├── services/        # 비즈니스 로직
│   │   │   └── utils/           # 유틸리티
│   │   ├── components/          # Svelte 컴포넌트
│   │   └── stores/              # Svelte stores
│   ├── routes/                  # SvelteKit 라우트
│   ├── content/                 # Markdown 콘텐츠
│   └── app.html                 # HTML 템플릿
├── scripts/                     # 배치 스크립트
└── .github/workflows/           # GitHub Actions
```

## 개발 상태

### ✅ Phase 1: 기본 인프라 (완료)

- SvelteKit 프로젝트 초기화
- TypeScript, ESLint, Prettier 설정
- PostgreSQL + Drizzle ORM 설정
- 데이터베이스 스키마 생성

### 🚧 Phase 2: 크롤링 시스템 (진행 예정)

- Playwright 설치 및 설정
- BaseCrawler 추상 클래스 구현
- 수원시/동탄시 크롤러 구현
- 배치 스크립트 작성

### 📋 Phase 3-10 (계획 중)

- API 및 서비스
- 프론트엔드 컴포넌트
- 콘텐츠 기능
- 광고 통합
- 배치 스케줄링
- 최적화 및 보안
- 배포
- 테스트 및 런칭

## 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run preview` - 빌드 미리보기
- `npm run check` - TypeScript 타입 체크
- `npm run lint` - ESLint 실행
- `npm run format` - Prettier 포맷팅
- `npm run crawl` - 크롤링 배치 작업 실행 (구현 예정)
- `npm run db:push` - 데이터베이스 스키마 푸시
- `npm run db:generate` - 마이그레이션 파일 생성
- `npm run db:studio` - Drizzle Studio 실행

## 라이선스

MIT
