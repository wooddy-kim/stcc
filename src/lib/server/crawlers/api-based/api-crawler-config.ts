import type { YonginFacilityConfig, HwaseongFacilityConfig } from './types';

/**
 * ⚠️ 이 파일의 courtMappings / monthlyCourtMappings는 seed 스크립트 전용입니다.
 * 런타임 크롤링은 court_api_mappings DB 테이블에서 매핑을 읽습니다.
 * 새 월 용인시 키 등록: DB에 직접 추가하거나 seed 스크립트를 재실행하세요.
 */

/**
 * 용인시 시설 설정
 */
export const YONGIN_FACILITIES: Record<string, YonginFacilityConfig> = {
	GOLD: {
		crawlerName: 'YonginCrawler',
		displayName: '용인시립골드테니스장',
		facilityKey: 'YONGIN',
		monthlyCourtMappings: {
			'2026-01': {
				10737: '1',
				10736: '2',
				10735: '3',
				10734: '7',
				10733: '8',
				10732: '9'
			},
			'2026-02': {
				11125: '1',
				11124: '2',
				11123: '3',
				11122: '7',
				11121: '8',
				11120: '9'
			}
		},
		apiUrl:
			'https://publicsports.yongin.go.kr/publicsports/sports/selectRegistTimeByChosenDateFcltyRceptResveApply.do',
		monthsToFetch: 2,
		batchSize: 10
	},

	NAMSAN: {
		crawlerName: 'YonginNamsanCrawler',
		displayName: '용인 남산근린공원 테니스장',
		facilityKey: 'NAMSAN',
		monthlyCourtMappings: {
			'2026-01': {
				10744: 'A',
				10743: 'B'
			},
			'2026-02': {
				11132: 'A',
				11131: 'B'
			}
		},
		apiUrl:
			'https://publicsports.yongin.go.kr/publicsports/sports/selectRegistTimeByChosenDateFcltyRceptResveApply.do',
		monthsToFetch: 2,
		batchSize: 10
	}
} as const;

/**
 * 화성시 시설 설정
 */
export const HWASEONG_FACILITIES: Record<string, HwaseongFacilityConfig> = {
	YEOUL: {
		crawlerName: 'YeoulCrawler',
		displayName: '화성 여울공원 테니스장',
		facilityKey: 'YEOUL',
		courtMappings: {
			193: '1',
			195: '2',
			196: '3'
		},
		apiUrl: 'https://yeyak.hscity.go.kr/stadium/stadiumReserveUseList.do',
		monthsToFetch: 2
	},

	WANGBAESAN: {
		crawlerName: 'WangbaesanCrawler',
		displayName: '화성 왕배산체육공원 테니스장',
		facilityKey: 'WANGBAESAN',
		courtMappings: {
			230: '1',
			231: '2',
			232: '3',
			233: '4',
			235: '5',
			236: '6',
			237: '7',
			238: '8'
		},
		apiUrl: 'https://yeyak.hscity.go.kr/stadium/stadiumReserveUseList.do',
		monthsToFetch: 2
	},

	GEUMBAN: {
		crawlerName: 'GeumbanCrawler',
		displayName: '화성 금반저류지 테니스장',
		facilityKey: 'GEUMBAN',
		courtMappings: {
			212: '1',
			243: '2'
		},
		apiUrl: 'https://yeyak.hscity.go.kr/stadium/stadiumReserveUseList.do',
		monthsToFetch: 2
	},

	BIBONG: {
		crawlerName: 'BibongCrawler',
		displayName: '화성 비봉체육공원 테니스장',
		facilityKey: 'BIBONG',
		courtMappings: {
			207: '1',
			208: '2',
			242: '3'
		},
		apiUrl: 'https://yeyak.hscity.go.kr/stadium/stadiumReserveUseList.do',
		monthsToFetch: 2
	},

	DOLMORU: {
		crawlerName: 'DolmoruCrawler',
		displayName: '화성 돌모루 근린공원 테니스장',
		facilityKey: 'DOLMORU',
		courtMappings: {
			213: '8'
		},
		apiUrl: 'https://yeyak.hscity.go.kr/stadium/stadiumReserveUseList.do',
		monthsToFetch: 2
	}
} as const;

export type YonginFacilityKey = keyof typeof YONGIN_FACILITIES;
export type HwaseongFacilityKey = keyof typeof HWASEONG_FACILITIES;
