/**
 * 테니스 용어 사전 데이터
 * 초보자를 위한 테니스 용어 설명
 */

export interface GlossaryTerm {
	id: string;
	term: string; // 영어 용어
	termKo: string; // 한국어 용어
	category: 'stroke' | 'scoring' | 'court' | 'equipment' | 'rules' | 'general';
	definition: string; // 정의
	example?: string; // 사용 예시
	relatedTerms?: string[]; // 관련 용어 ID
}

export const CATEGORY_LABELS: Record<GlossaryTerm['category'], string> = {
	stroke: '스트로크',
	scoring: '점수/득점',
	court: '코트/시설',
	equipment: '장비',
	rules: '규칙',
	general: '일반'
};

export const GLOSSARY: GlossaryTerm[] = [
	// 스트로크 관련
	{
		id: 'forehand',
		term: 'Forehand',
		termKo: '포핸드',
		category: 'stroke',
		definition: '라켓을 든 손 쪽으로 날아오는 공을 치는 기본 스트로크입니다.',
		example: '오른손잡이의 경우 오른쪽에서 치는 샷이 포핸드입니다.',
		relatedTerms: ['backhand', 'groundstroke']
	},
	{
		id: 'backhand',
		term: 'Backhand',
		termKo: '백핸드',
		category: 'stroke',
		definition: '라켓을 든 손 반대쪽으로 날아오는 공을 치는 스트로크입니다.',
		example: '오른손잡이의 경우 왼쪽에서 치는 샷이 백핸드입니다.',
		relatedTerms: ['forehand', 'groundstroke']
	},
	{
		id: 'serve',
		term: 'Serve',
		termKo: '서브',
		category: 'stroke',
		definition: '각 포인트를 시작할 때 공을 위로 던져 치는 샷입니다.',
		example: '서브는 대각선 서비스 박스 안에 들어가야 합니다.',
		relatedTerms: ['ace', 'double-fault', 'first-serve', 'second-serve']
	},
	{
		id: 'volley',
		term: 'Volley',
		termKo: '발리',
		category: 'stroke',
		definition: '공이 바운드하기 전에 네트 근처에서 치는 샷입니다.',
		example: '네트 플레이에서 발리는 매우 중요한 기술입니다.',
		relatedTerms: ['half-volley', 'drop-volley']
	},
	{
		id: 'groundstroke',
		term: 'Groundstroke',
		termKo: '그라운드 스트로크',
		category: 'stroke',
		definition: '공이 한 번 바운드한 후에 치는 샷의 총칭입니다.',
		example: '포핸드와 백핸드가 대표적인 그라운드 스트로크입니다.',
		relatedTerms: ['forehand', 'backhand']
	},
	{
		id: 'topspin',
		term: 'Topspin',
		termKo: '톱스핀',
		category: 'stroke',
		definition: '공이 전진 방향으로 회전하도록 치는 기술로, 공이 빠르게 떨어집니다.',
		example: '톱스핀을 많이 걸면 높이 넘겨도 코트 안에 떨어집니다.',
		relatedTerms: ['slice', 'flat']
	},
	{
		id: 'slice',
		term: 'Slice',
		termKo: '슬라이스',
		category: 'stroke',
		definition: '공 아래를 깎아 역회전을 거는 샷으로, 낮게 날아갑니다.',
		example: '슬라이스 백핸드는 수비할 때 유용합니다.',
		relatedTerms: ['topspin', 'drop-shot']
	},
	{
		id: 'lob',
		term: 'Lob',
		termKo: '로브',
		category: 'stroke',
		definition: '상대방 머리 위로 높이 넘기는 샷입니다.',
		example: '상대가 네트에 있을 때 로브로 넘기면 효과적입니다.',
		relatedTerms: ['overhead', 'passing-shot']
	},
	{
		id: 'overhead',
		term: 'Overhead',
		termKo: '오버헤드/스매시',
		category: 'stroke',
		definition: '머리 위로 높이 올라온 공을 강하게 내리치는 샷입니다.',
		example: '로브를 스매시로 마무리했습니다.',
		relatedTerms: ['lob', 'serve']
	},
	{
		id: 'drop-shot',
		term: 'Drop Shot',
		termKo: '드롭샷',
		category: 'stroke',
		definition: '공을 살짝 터치하여 네트 바로 넘어 떨어뜨리는 샷입니다.',
		example: '상대가 뒤에 있을 때 드롭샷이 효과적입니다.',
		relatedTerms: ['slice', 'volley']
	},
	{
		id: 'half-volley',
		term: 'Half Volley',
		termKo: '하프 발리',
		category: 'stroke',
		definition: '공이 바운드하자마자 지면에서 막 떠오를 때 치는 샷입니다.',
		example: '하프 발리는 타이밍이 어려운 고급 기술입니다.',
		relatedTerms: ['volley', 'groundstroke']
	},
	{
		id: 'passing-shot',
		term: 'Passing Shot',
		termKo: '패싱샷',
		category: 'stroke',
		definition: '네트에 있는 상대방 옆을 지나가는 샷입니다.',
		example: '크로스로 패싱샷을 성공시켰습니다.',
		relatedTerms: ['lob', 'volley']
	},

	// 점수/득점 관련
	{
		id: 'ace',
		term: 'Ace',
		termKo: '에이스',
		category: 'scoring',
		definition: '상대가 라켓을 전혀 대지 못한 서비스 포인트입니다.',
		example: '센터로 정확한 서브를 넣어 에이스를 기록했습니다.',
		relatedTerms: ['serve', 'service-winner']
	},
	{
		id: 'love',
		term: 'Love',
		termKo: '러브',
		category: 'scoring',
		definition: '테니스에서 0점을 의미합니다.',
		example: '40-러브는 40-0을 의미합니다.',
		relatedTerms: ['deuce', 'advantage']
	},
	{
		id: 'deuce',
		term: 'Deuce',
		termKo: '듀스',
		category: 'scoring',
		definition: '게임에서 40-40 동점 상황입니다.',
		example: '듀스 후 2점을 연속으로 따야 게임을 이깁니다.',
		relatedTerms: ['advantage', 'love']
	},
	{
		id: 'advantage',
		term: 'Advantage',
		termKo: '어드밴티지',
		category: 'scoring',
		definition: '듀스 후 한 점을 먼저 딴 상태입니다.',
		example: '어드밴티지 서버는 서버가 한 점 앞선 상태입니다.',
		relatedTerms: ['deuce', 'game']
	},
	{
		id: 'break',
		term: 'Break',
		termKo: '브레이크',
		category: 'scoring',
		definition: '상대방의 서브 게임을 이기는 것입니다.',
		example: '첫 세트에서 2번의 브레이크에 성공했습니다.',
		relatedTerms: ['break-point', 'hold']
	},
	{
		id: 'break-point',
		term: 'Break Point',
		termKo: '브레이크 포인트',
		category: 'scoring',
		definition: '이 포인트를 따면 상대 서브를 브레이크할 수 있는 상황입니다.',
		example: '브레이크 포인트를 세이브했습니다.',
		relatedTerms: ['break', 'game-point']
	},
	{
		id: 'double-fault',
		term: 'Double Fault',
		termKo: '더블 폴트',
		category: 'scoring',
		definition: '서브를 두 번 연속 실패하여 상대에게 점수를 주는 것입니다.',
		example: '중요한 순간에 더블 폴트가 나왔습니다.',
		relatedTerms: ['serve', 'fault']
	},
	{
		id: 'let',
		term: 'Let',
		termKo: '렛',
		category: 'scoring',
		definition: '서브가 네트에 닿고 서비스 박스에 들어갔을 때 다시 서브하는 것입니다.',
		example: '렛이 선언되어 퍼스트 서브를 다시 넣습니다.',
		relatedTerms: ['serve', 'fault']
	},
	{
		id: 'tiebreak',
		term: 'Tiebreak',
		termKo: '타이브레이크',
		category: 'scoring',
		definition: '세트가 6-6 동점일 때 승부를 가리는 특별 게임입니다.',
		example: '타이브레이크에서 7-5로 세트를 가져갔습니다.',
		relatedTerms: ['set', 'game']
	},

	// 코트/시설 관련
	{
		id: 'baseline',
		term: 'Baseline',
		termKo: '베이스라인',
		category: 'court',
		definition: '코트의 가장 뒤쪽 선으로, 서브가 이 선 뒤에서 넣어야 합니다.',
		example: '베이스라인 랠리가 계속되었습니다.',
		relatedTerms: ['service-line', 'sideline']
	},
	{
		id: 'service-box',
		term: 'Service Box',
		termKo: '서비스 박스',
		category: 'court',
		definition: '서브가 떨어져야 하는 네트와 서비스 라인 사이의 영역입니다.',
		example: '서브가 서비스 박스 밖으로 나가서 폴트입니다.',
		relatedTerms: ['serve', 'service-line']
	},
	{
		id: 'service-line',
		term: 'Service Line',
		termKo: '서비스 라인',
		category: 'court',
		definition: '서비스 박스의 뒤쪽 경계선입니다.',
		example: '서브가 서비스 라인에 걸쳐 들어갔습니다.',
		relatedTerms: ['service-box', 'baseline']
	},
	{
		id: 'net',
		term: 'Net',
		termKo: '네트',
		category: 'court',
		definition: '코트 중앙에 설치된 그물로, 높이는 중앙 91.4cm입니다.',
		example: '네트에 걸려 아쉽게 포인트를 놓쳤습니다.',
		relatedTerms: ['volley', 'net-play']
	},
	{
		id: 'alley',
		term: 'Alley',
		termKo: '앨리',
		category: 'court',
		definition: '복식에서만 사용하는 코트 양쪽의 좁은 영역입니다.',
		example: '복식에서는 앨리도 인 영역입니다.',
		relatedTerms: ['singles', 'doubles']
	},
	{
		id: 'ad-court',
		term: 'Ad Court',
		termKo: '어드 코트',
		category: 'court',
		definition: '코트 왼쪽 절반 (듀스 포인트가 아닌 포인트에서 서브받는 쪽).',
		example: '40-30 상황에서는 어드 코트에서 서브합니다.',
		relatedTerms: ['deuce-court', 'advantage']
	},
	{
		id: 'deuce-court',
		term: 'Deuce Court',
		termKo: '듀스 코트',
		category: 'court',
		definition: '코트 오른쪽 절반 (듀스 포인트에서 서브받는 쪽).',
		example: '매 게임은 듀스 코트에서 시작합니다.',
		relatedTerms: ['ad-court', 'deuce']
	},

	// 장비 관련
	{
		id: 'racket',
		term: 'Racket',
		termKo: '라켓',
		category: 'equipment',
		definition: '테니스 공을 치는 도구로, 프레임과 스트링으로 구성됩니다.',
		example: '라켓 무게는 보통 280-340g 정도입니다.',
		relatedTerms: ['string', 'grip']
	},
	{
		id: 'string',
		term: 'String',
		termKo: '스트링',
		category: 'equipment',
		definition: '라켓 헤드에 짜여진 줄로, 공을 치는 부분입니다.',
		example: '스트링 텐션이 높으면 컨트롤이 좋아집니다.',
		relatedTerms: ['racket', 'tension']
	},
	{
		id: 'grip',
		term: 'Grip',
		termKo: '그립',
		category: 'equipment',
		definition: '라켓을 잡는 손잡이 부분 또는 잡는 방법을 의미합니다.',
		example: '이스턴 그립은 초보자에게 추천됩니다.',
		relatedTerms: ['racket', 'overgrip']
	},
	{
		id: 'tennis-ball',
		term: 'Tennis Ball',
		termKo: '테니스공',
		category: 'equipment',
		definition: '노란색의 펠트로 덮인 고무 공입니다.',
		example: '경기용 공은 ITF 승인을 받아야 합니다.',
		relatedTerms: ['racket']
	},

	// 규칙 관련
	{
		id: 'fault',
		term: 'Fault',
		termKo: '폴트',
		category: 'rules',
		definition: '서브가 서비스 박스에 들어가지 않거나 규칙 위반 시 선언됩니다.',
		example: '폴트 후 세컨드 서브 기회가 주어집니다.',
		relatedTerms: ['double-fault', 'let']
	},
	{
		id: 'foot-fault',
		term: 'Foot Fault',
		termKo: '풋폴트',
		category: 'rules',
		definition: '서브 시 베이스라인을 밟거나 넘어서 폴트가 되는 것입니다.',
		example: '풋폴트를 주의해서 서브 자세를 교정했습니다.',
		relatedTerms: ['serve', 'fault']
	},
	{
		id: 'out',
		term: 'Out',
		termKo: '아웃',
		category: 'rules',
		definition: '공이 라인 바깥에 떨어지는 것입니다.',
		example: '베이스라인 아웃으로 포인트를 잃었습니다.',
		relatedTerms: ['in', 'line-call']
	},
	{
		id: 'in',
		term: 'In',
		termKo: '인',
		category: 'rules',
		definition: '공이 라인 안쪽이나 라인에 닿아 유효한 것입니다.',
		example: '라인에 걸쳐 인으로 판정되었습니다.',
		relatedTerms: ['out', 'line-call']
	},

	// 일반 용어
	{
		id: 'rally',
		term: 'Rally',
		termKo: '랠리',
		category: 'general',
		definition: '서브 후 포인트가 끝날 때까지 공을 주고받는 것입니다.',
		example: '30회가 넘는 긴 랠리 끝에 포인트를 땄습니다.',
		relatedTerms: ['groundstroke', 'point']
	},
	{
		id: 'singles',
		term: 'Singles',
		termKo: '단식',
		category: 'general',
		definition: '1대1로 경기하는 형식입니다.',
		example: '단식에서는 앨리 부분이 아웃 영역입니다.',
		relatedTerms: ['doubles', 'alley']
	},
	{
		id: 'doubles',
		term: 'Doubles',
		termKo: '복식',
		category: 'general',
		definition: '2대2로 경기하는 형식입니다.',
		example: '복식에서는 파트너와의 호흡이 중요합니다.',
		relatedTerms: ['singles', 'alley']
	},
	{
		id: 'match',
		term: 'Match',
		termKo: '매치/경기',
		category: 'general',
		definition: '승패를 가르는 전체 경기를 의미합니다.',
		example: '3세트 매치에서 2세트를 먼저 이기면 승리입니다.',
		relatedTerms: ['set', 'game']
	},
	{
		id: 'set',
		term: 'Set',
		termKo: '세트',
		category: 'general',
		definition: '게임을 6개 이상 이기면 가져가는 단위입니다.',
		example: '첫 세트를 6-4로 가져갔습니다.',
		relatedTerms: ['game', 'tiebreak']
	},
	{
		id: 'game',
		term: 'Game',
		termKo: '게임',
		category: 'general',
		definition: '포인트를 4개 이상 먼저 따면 이기는 단위입니다.',
		example: '15-30-40 순서로 점수가 올라갑니다.',
		relatedTerms: ['set', 'point']
	},
	{
		id: 'winner',
		term: 'Winner',
		termKo: '위너',
		category: 'general',
		definition: '상대가 손도 대지 못하고 득점한 샷입니다.',
		example: '크로스 포핸드 위너로 포인트를 마무리했습니다.',
		relatedTerms: ['unforced-error', 'ace']
	},
	{
		id: 'unforced-error',
		term: 'Unforced Error',
		termKo: '비강제 실책',
		category: 'general',
		definition: '상대의 압박 없이 스스로 실수로 잃는 포인트입니다.',
		example: '오늘 경기에서 비강제 실책이 너무 많았습니다.',
		relatedTerms: ['winner', 'forced-error']
	},
	{
		id: 'warm-up',
		term: 'Warm-up',
		termKo: '워밍업',
		category: 'general',
		definition: '경기 전 몸을 풀고 공을 주고받는 시간입니다.',
		example: '공식 경기에서는 5분의 워밍업 시간이 주어집니다.',
		relatedTerms: ['match']
	},
	{
		id: 'cross-court',
		term: 'Cross-court',
		termKo: '크로스코트',
		category: 'general',
		definition: '코트를 대각선으로 가로지르는 샷입니다.',
		example: '크로스코트 백핸드가 아주 정확했습니다.',
		relatedTerms: ['down-the-line']
	},
	{
		id: 'down-the-line',
		term: 'Down the Line',
		termKo: '다운더라인',
		category: 'general',
		definition: '사이드라인을 따라 직선으로 치는 샷입니다.',
		example: '다운더라인 위너로 멋지게 마무리했습니다.',
		relatedTerms: ['cross-court', 'passing-shot']
	}
];

/**
 * 카테고리별 용어 그룹핑
 */
export function getTermsByCategory(): Record<GlossaryTerm['category'], GlossaryTerm[]> {
	const grouped: Record<GlossaryTerm['category'], GlossaryTerm[]> = {
		stroke: [],
		scoring: [],
		court: [],
		equipment: [],
		rules: [],
		general: []
	};

	for (const term of GLOSSARY) {
		grouped[term.category].push(term);
	}

	return grouped;
}

/**
 * ID로 용어 찾기
 */
export function getTermById(id: string): GlossaryTerm | undefined {
	return GLOSSARY.find((t) => t.id === id);
}

/**
 * 검색어로 용어 필터링
 */
export function searchTerms(query: string): GlossaryTerm[] {
	if (!query.trim()) return GLOSSARY;

	const lowerQuery = query.toLowerCase();
	return GLOSSARY.filter(
		(term) =>
			term.term.toLowerCase().includes(lowerQuery) ||
			term.termKo.includes(query) ||
			term.definition.includes(query)
	);
}
