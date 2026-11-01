/**
 * 코트 상세 페이지의 title·description.
 *
 * Search Console(2026-08~10)에서 코트 페이지는 평균 5~7위인데 CTR이 0~3%였다.
 * 검색어는 "돌모루 테니스장", "군포시민체육광장 예약"처럼 시설명+테니스장/예약이 많아
 * 시 이름·"테니스장"·"예약"이 제목에 드러나고, 공식 사이트에 없는 "빈 코트 실시간"을 앞세운다.
 * 코트·시 데이터만으로 만들어지므로 새 코트·시가 추가돼도 손댈 필요가 없다.
 */
type CourtSeoInput = {
	name: string;
	regionName: string | null;
	address: string | null;
	totalCourts: number | null;
};

export function courtSeo({ name, regionName, address, totalCourts }: CourtSeoInput) {
	const city = regionName?.replace(/시$/, '') ?? '';
	const prefix = city && !name.startsWith(city) ? `${city} ` : '';
	const place = `${prefix}${/테니스/.test(name) ? name : `${name} 테니스장`}`;

	const facts = [address && `${address} 위치`, totalCourts && `코트 ${totalCourts}면`]
		.filter(Boolean)
		.join(', ');

	return {
		title: `${place} 예약 · 빈 코트 실시간 확인 | CourtNow`,
		description: `${place}의 오늘 빈 시간을 실시간으로 확인하세요.${facts ? ` ${facts}.` : ''} 예약 방법·요금·주차 안내.`
	};
}
