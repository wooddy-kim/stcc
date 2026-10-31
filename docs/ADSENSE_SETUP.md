# Google AdSense 설정 가이드

이 문서는 CourtNow 애플리케이션에 Google AdSense 광고를 추가하는 방법을 안내합니다.

## 1. Google AdSense 계정 생성

### 1.1 AdSense 가입

1. [Google AdSense](https://www.google.com/adsense) 접속
2. "시작하기" 버튼 클릭
3. Google 계정으로 로그인
4. 웹사이트 URL 입력: `https://courtnow.info`
5. 약관 동승 및 계정 생성

### 1.2 사이트 검토 대기

- AdSense 팀이 사이트를 검토합니다 (보통 1-2주 소요)
- 검토 기준:
  - ✅ 충분한 콘텐츠
  - ✅ 사용자에게 가치 제공
  - ✅ AdSense 정책 준수

## 2. AdSense 코드 받기

### 2.1 퍼블리셔 ID 확인

승인 후 AdSense 대시보드에서:

1. **계정** → **계정 정보** 클릭
2. **퍼블리셔 ID** 확인 (예: `ca-pub-1234567890123456`)
3. 이 ID를 복사해두세요

### 2.2 광고 단위 생성

1. **광고** → **광고 단위 기준** 클릭
2. **디스플레이 광고** 선택
3. 광고 단위 이름 입력: `CourtNow 배너 광고`
4. 광고 크기: **반응형** 선택 (권장)
5. **만들기** 클릭
6. **광고 단위 ID** 복사 (예: `1234567890`)

## 3. 환경 변수 설정

### 3.1 로컬 개발 환경

`.env` 파일에 다음 추가:

```bash
PUBLIC_ADSENSE_CLIENT_ID=ca-pub-1234567890123456
```

### 3.2 Vercel 배포 환경

1. Vercel 대시보드 → 프로젝트 선택
2. **Settings** → **Environment Variables**
3. 새 변수 추가:
   - **Name**: `PUBLIC_ADSENSE_CLIENT_ID`
   - **Value**: `ca-pub-1234567890123456`
   - **Environment**: Production, Preview, Development 모두 체크
4. **Save** 클릭

### 3.3 재배포

환경 변수 추가 후 재배포:

```bash
git commit -m "feat: Add Google AdSense"
git push
```

또는 Vercel 대시보드에서 **Deployments** → **Redeploy**

## 4. 광고 슬롯 ID 설정

### 4.1 코드 수정

`src/routes/+page.svelte` 파일에서 `adSlot` 값을 실제 광고 단위 ID로 변경:

```svelte
<AdSenseBanner
  adSlot="1234567890"  <!-- 여기에 실제 광고 단위 ID 입력 -->
  adFormat="auto"
  fullWidthResponsive={true}
/>
```

### 4.2 여러 광고 추가 (선택사항)

다른 페이지나 위치에 광고를 추가하려면:

```svelte
<script>
	import AdSenseBanner from '$lib/components/AdSenseBanner.svelte';
</script>

<!-- 배너 광고 -->
<AdSenseBanner adSlot="1234567890" adFormat="auto" fullWidthResponsive={true} />
```

## 5. 광고 확인

### 5.1 테스트 모드

개발 환경에서는 광고가 표시되지 않을 수 있습니다. 프로덕션 배포 후 확인하세요.

### 5.2 광고 표시 확인

1. 배포된 사이트 접속: `https://courtnow.info`
2. 요일 선택 섹션 아래에 광고 영역 확인
3. "Advertisement" 라벨 확인

### 5.3 광고가 표시되지 않는 경우

**가능한 원인**:

- AdSense 계정이 아직 승인되지 않음
- 환경 변수가 올바르게 설정되지 않음
- 광고 슬롯 ID가 잘못됨
- 광고 차단 프로그램 사용 중

**해결 방법**:

1. 브라우저 콘솔에서 에러 확인
2. 환경 변수 확인: `echo $PUBLIC_ADSENSE_CLIENT_ID`
3. AdSense 대시보드에서 광고 단위 상태 확인
4. 광고 차단 프로그램 비활성화 후 테스트

## 6. 광고 배치 전략

### 6.1 현재 배치

- **위치**: 요일 선택과 예약 리스트 사이
- **형식**: 반응형 배너
- **타입**: 디스플레이 광고

### 6.2 추가 배치 권장 위치

1. **헤더 하단**: 페이지 상단에 가로 배너
2. **예약 리스트 중간**: 리스트 아이템 사이
3. **푸터 상단**: 페이지 하단

### 6.3 모바일 최적화

AdSenseBanner 컴포넌트는 자동으로 모바일에 최적화됩니다:

- `fullWidthResponsive={true}`: 화면 크기에 맞게 자동 조정
- `adFormat="auto"`: Google이 최적의 광고 형식 선택

## 7. AdSense 정책 준수

### 7.1 금지 사항

- ❌ 자신의 광고 클릭 금지
- ❌ 사용자에게 광고 클릭 유도 금지
- ❌ 광고 코드 수정 금지
- ❌ 부적절한 콘텐츠와 함께 배치 금지

### 7.2 권장 사항

- ✅ 광고와 콘텐츠 명확히 구분
- ✅ "Advertisement" 라벨 표시
- ✅ 사용자 경험 우선
- ✅ 적절한 광고 수 유지 (페이지당 3개 이하 권장)

## 8. 수익 모니터링

### 8.1 AdSense 대시보드

1. [AdSense 대시보드](https://www.google.com/adsense) 접속
2. **보고서** 탭에서 수익 확인
3. 주요 지표:
   - 페이지 조회수
   - 클릭 수
   - 페이지 RPM (1,000회 노출당 수익)
   - 클릭률 (CTR)

### 8.2 수익 최적화 팁

1. **콘텐츠 품질 향상**: 더 많은 방문자 유치
2. **광고 위치 테스트**: A/B 테스트로 최적 위치 찾기
3. **사용자 경험 유지**: 너무 많은 광고는 역효과
4. **모바일 최적화**: 모바일 트래픽 고려

## 9. 트러블슈팅

### 문제: "AdSense 스크립트 로드 실패" 에러

**해결**:

```bash
# 환경 변수 확인
echo $PUBLIC_ADSENSE_CLIENT_ID

# Vercel 재배포
vercel --prod
```

### 문제: 광고 영역만 표시되고 광고가 안 나옴

**원인**: AdSense 승인 대기 중 또는 광고 슬롯 ID 오류

**해결**:

1. AdSense 계정 상태 확인
2. 광고 단위 ID 확인
3. 24-48시간 대기 (새 사이트의 경우)

### 문제: 특정 페이지에서만 광고 안 나옴

**해결**:

1. 해당 페이지가 AdSense 정책 위반하는지 확인
2. 브라우저 콘솔에서 JavaScript 에러 확인
3. AdSense 계정의 **차단 컨트롤** 확인

## 10. 다음 단계

- [ ] AdSense 계정 승인 대기
- [ ] 실제 퍼블리셔 ID 및 광고 단위 ID 설정
- [ ] 프로덕션 배포 후 광고 표시 확인
- [ ] 광고 성과 모니터링
- [ ] 필요시 추가 광고 배치

---

**참고 자료**:

- [AdSense 고객센터](https://support.google.com/adsense)
- [AdSense 정책](https://support.google.com/adsense/answer/48182)
- [광고 배치 가이드](https://support.google.com/adsense/answer/1354736)
