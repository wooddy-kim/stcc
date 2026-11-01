import {
	pgTable,
	serial,
	varchar,
	text,
	integer,
	boolean,
	timestamp,
	doublePrecision,
	index,
	uniqueIndex
} from 'drizzle-orm/pg-core';

// regions 테이블 - 지역 정보 (수원시, 동탄시)
export const regions = pgTable('regions', {
	id: serial('id').primaryKey(),
	code: varchar('code', { length: 50 }).notNull().unique(),
	name: varchar('name', { length: 100 }).notNull(),
	// 크롤러 타입: 'PLAYWRIGHT' | 'YONGIN_API' | 'HWASEONG_API' | 'FMCS_RENT_API' | 'NAMYANGJU_API' | 'ANSAN_API'
	crawlerType: varchar('crawler_type', { length: 20 }).default('PLAYWRIGHT'),
	apiUrl: text('api_url'), // API 크롤러 엔드포인트 (PLAYWRIGHT는 NULL)
	monthsToFetch: integer('months_to_fetch').default(2),
	batchSize: integer('batch_size').default(10),
	createdAt: timestamp('created_at').defaultNow()
});

// courts 테이블 - 테니스장 정보
export const courts = pgTable(
	'courts',
	{
		id: serial('id').primaryKey(),
		regionId: integer('region_id').references(() => regions.id),
		name: varchar('name', { length: 200 }).notNull(),
		rawName: varchar('raw_name', { length: 200 }),
		address: text('address'),
		totalCourts: integer('total_courts'),
		isActive: boolean('is_active').default(true),
		// URL 경로용 slug (예: suwon-mangpo, yongin-gold)
		slug: varchar('slug', { length: 100 }).unique(),
		// 테니스장 상세 정보
		imageUrl: text('image_url'),
		reservationUrl: text('reservation_url'),
		operatingPolicy: text('operating_policy'),
		pricingInfo: text('pricing_info'),
		// 추가 상세 정보
		surfaceType: varchar('surface_type', { length: 50 }), // 코트 표면 종류 (하드코트, 클레이코트 등)
		facilities: text('facilities'), // 편의시설 JSON 배열
		parkingInfo: text('parking_info'), // 주차 정보 마크다운
		transitInfo: text('transit_info'), // 대중교통 정보 마크다운
		// 지도 좌표
		latitude: doublePrecision('latitude'),
		longitude: doublePrecision('longitude'),
		// DB 주도 크롤링용 필드
		facilityKey: varchar('facility_key', { length: 20 }), // court_api_mappings.facilityKey 연결
		courtSortMode: varchar('court_sort_mode', { length: 10 }).default('numeric'), // 'numeric' | 'alpha'
		createdAt: timestamp('created_at').defaultNow()
	},
	(table) => ({
		regionIdx: index('courts_region_idx').on(table.regionId),
		nameIdx: index('courts_name_idx').on(table.name)
	})
);

// reservations 테이블 - 예약 현황 (핵심 테이블)
export const reservations = pgTable(
	'reservations',
	{
		id: serial('id').primaryKey(),
		courtId: integer('court_id').references(() => courts.id),
		courtNumber: varchar('court_number', { length: 50 }),
		availableCourts: varchar('available_courts', { length: 100 }),
		date: timestamp('date').notNull(),
		startTime: varchar('start_time', { length: 10 }).notNull(),
		endTime: varchar('end_time', { length: 10 }).notNull(),
		status: varchar('status', { length: 20 }).notNull(), // 'available', 'reserved', 'closed'
		crawledAt: timestamp('crawled_at').notNull(),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow()
	},
	(table) => ({
		// 가장 중요한 인덱스: 특정 테니스장의 날짜별 조회
		courtDateIdx: index('reservations_court_date_idx').on(table.courtId, table.date),
		dateStatusIdx: index('reservations_date_status_idx').on(table.date, table.status),
		// 중복 방지 (코트 구분 없이 시간대별로 하나의 예약 현황만 저장)
		uniqueReservation: uniqueIndex('reservations_unique_idx').on(
			table.courtId,
			table.date,
			table.startTime
		)
	})
);

// court_api_mappings 테이블 - 시설별 API 코트 식별키 관리
// 화성시: yearMonth = 'STATIC' (고정 stadiumIdx)
// 용인시: yearMonth = 'YYYY-MM' (월별 갱신 resveId)
export const courtApiMappings = pgTable(
	'court_api_mappings',
	{
		id: serial('id').primaryKey(),
		facilityKey: varchar('facility_key', { length: 20 }).notNull(),
		yearMonth: varchar('year_month', { length: 7 }).notNull().default('STATIC'),
		apiCourtId: integer('api_court_id').notNull(),
		courtNumber: varchar('court_number', { length: 10 }).notNull(),
		createdAt: timestamp('created_at').defaultNow()
	},
	(table) => ({
		uniqueMapping: uniqueIndex('court_api_mapping_unique').on(
			table.facilityKey,
			table.yearMonth,
			table.apiCourtId
		),
		facilityMonthIdx: index('court_api_mapping_facility_month_idx').on(
			table.facilityKey,
			table.yearMonth
		)
	})
);

// crawl_logs 테이블 - 크롤링 이력 (모니터링용)
export const crawlLogs = pgTable(
	'crawl_logs',
	{
		id: serial('id').primaryKey(),
		source: varchar('source', { length: 50 }).notNull(),
		status: varchar('status', { length: 20 }).notNull(), // 'success', 'failure'
		recordsCount: integer('records_count').default(0),
		duration: integer('duration'), // ms
		errorMessage: text('error_message'),
		createdAt: timestamp('created_at').defaultNow()
	},
	(table) => ({
		sourceCreatedIdx: index('crawl_logs_source_created_idx').on(table.source, table.createdAt)
	})
);

// tips 테이블 - 테니스 팁 콘텐츠 (DB화된 마크다운)
export const tips = pgTable(
	'tips',
	{
		id: serial('id').primaryKey(),
		title: varchar('title', { length: 500 }).notNull(),
		slug: varchar('slug', { length: 200 }).notNull().unique(),
		category: varchar('category', { length: 100 }).notNull(),
		difficulty: varchar('difficulty', { length: 50 }).notNull(),
		rawContent: text('raw_content').notNull(),
		htmlContent: text('html_content').notNull(),
		excerpt: text('excerpt'),
		readingTime: integer('reading_time').default(1),
		lastUpdated: varchar('last_updated', { length: 20 }),
		isPublished: boolean('is_published').default(true),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow()
	},
	(table) => ({
		slugIdx: uniqueIndex('tips_slug_idx').on(table.slug),
		categoryIdx: index('tips_category_idx').on(table.category),
		difficultyIdx: index('tips_difficulty_idx').on(table.difficulty),
		publishedIdx: index('tips_published_idx').on(table.isPublished)
	})
);
