import fs from 'fs';
import path from 'path';

// PathResolverOptions 인터페이스는 더 이상 사용되지 않습니다.
// 필요한 경우 findContentFile 함수를 직접 사용하세요.

/**
 * 다양한 환경에서 콘텐츠 디렉토리 경로를 찾는 공통 함수
 */
export function findContentDirectory(baseDir: string): string | null {
  // Vercel 환경에서는 process.cwd()가 /var/task 일 수 있음
  // 따라서 /var/task 하위에서 콘텐츠 디렉토리를 찾는 추가 경로를 확인
  const cwd = process.cwd();
  const additionalPaths = [];

  if (cwd === '/var/task') {
    // Vercel 서버리스 함수 환경
    additionalPaths.push(
      path.join(cwd, 'src/content', baseDir),
      path.join(cwd, 'content', baseDir),
      path.join(cwd, '..', 'src/content', baseDir)
    );
  }

  // 가능한 경로들
  const possiblePaths = [
    path.join(process.cwd(), 'src/content', baseDir),
    path.join(process.cwd(), '.svelte-kit/build/src/content', baseDir),
    path.join('/var/task/src/content', baseDir),
    path.join('/var/task/.svelte-kit/build/src/content', baseDir),
    ...additionalPaths
  ];

  // 각 경로 확인
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      return possiblePath;
    }
  }

  // 모듈 기반 상대 경로 시도
  try {
    const moduleDir = path.dirname(new URL(import.meta.url).pathname);
    const relativePath = path.join(moduleDir, `../../content/${baseDir}`);
    const normalizedPath = relativePath.startsWith('/') ? relativePath : path.join(process.cwd(), relativePath);
    if (fs.existsSync(normalizedPath)) {
      return normalizedPath;
    }
  } catch (e) {
    // 무시하고 계속
  }

  // 마지막으로 현재 디렉토리에서 직접 검색
  try {
    const currentDir = process.cwd();
    const searchPaths = [
      path.join(currentDir, 'src/content', baseDir),
      path.join(currentDir, 'content', baseDir),
      path.join(currentDir, '..', 'src/content', baseDir),
      path.join(currentDir, '..', 'content', baseDir)
    ];

    for (const searchPath of searchPaths) {
      if (fs.existsSync(searchPath)) {
        return searchPath;
      }
    }
  } catch (e) {
    // 무시하고 계속
  }

  return null;
}

/**
 * 다양한 환경에서 콘텐츠 파일 경로를 찾는 공통 함수
 */
export function findContentFile(baseDir: string, fileName: string): string | null {
  const contentDir = findContentDirectory(baseDir);
  if (!contentDir) {
    return null;
  }

  const filePath = path.join(contentDir, `${fileName}.md`);
  return fs.existsSync(filePath) ? filePath : null;
}

/**
 * 콘텐츠 디렉토리에서 모든 파일의 슬러그 목록을 가져오는 공통 함수
 */
export function getAllContentSlugs(baseDir: string): string[] {
  const contentDir = findContentDirectory(baseDir);
  if (!contentDir) {
    console.warn(`${baseDir} content directory not found in any expected location`);
    return [];
  }

  try {
    const files = fs.readdirSync(contentDir);
    return files
      .filter((file) => file.endsWith('.md') && file !== 'README.md')
      .map((file) => file.replace(/\.md$/, ''));
  } catch (error) {
    console.error(`Error reading ${baseDir} directory:`, error);
    return [];
  }
}