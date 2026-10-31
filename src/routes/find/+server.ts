import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// 시간대 검색은 홈의 시간 선택으로 합쳤다. 북마크·검색 유입은 홈으로 보낸다.
export const GET: RequestHandler = () => redirect(301, '/');
