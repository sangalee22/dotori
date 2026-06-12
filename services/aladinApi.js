/**
 * Aladin Open API Service
 * API 문서: http://www.aladin.co.kr/ttb/api/ItemList.aspx
 */

import { Platform } from 'react-native';

const ALADIN_API_KEY = 'ttbsang_a0_01255001';
const BASE_URL = 'http://www.aladin.co.kr/ttb/api';

// 웹 환경에서는 CORS 우회를 위해 로컬 프록시 사용
const USE_PROXY = Platform.OS === 'web';
const PROXY_URL = 'http://localhost:8090/';

/**
 * 알라딘 공식 카테고리 매핑
 * 참고: http://www.aladin.co.kr/shop/common/wbest.aspx
 *
 * 카테고리별 주간 베스트셀러를 조회하기 위한 CategoryId
 * QueryType=Bestseller와 함께 사용
 */
const CATEGORY_MAP = {
  '종합': 0,
  '소설': 1,
  '시': 50940,
  '에세이': 51371,
  '자기계발': 336,
  '경제/경영': 170,
  '인문': 656,
  '건강/뷰티': 55890,
};

export const CATEGORY_LIST = [
  { id: 0, name: '종합', label: '종합', subs: [] },
  {
    id: 1, name: '소설', label: '소설',
    subs: [
      { id: 1,      label: '전체' },
      { id: 50917,  label: '한국소설' },
      { id: 50918,  label: '일본소설' },
      { id: 50919,  label: '영미소설' },
      { id: 50920,  label: '스페인/중남미' },
      { id: 50921,  label: '프랑스소설' },
      { id: 50922,  label: '독일소설' },
      { id: 50923,  label: '중국소설' },
      { id: 52650,  label: '러시아소설' },
      { id: 50925,  label: '세계의 소설' },
      { id: 50926,  label: '추리/미스터리' },
      { id: 50928,  label: '판타지/환상' },
      { id: 50929,  label: '역사소설' },
      { id: 50930,  label: 'SF소설' },
      { id: 50931,  label: '호러/공포' },
      { id: 50932,  label: '무협소설' },
      { id: 50933,  label: '액션/스릴러' },
      { id: 50935,  label: '로맨스소설' },
      { id: 51252,  label: '여성문학' },
    ],
  },
  { id: 50940, name: '시', label: '시', subs: [] },
  { id: 51371, name: '에세이', label: '에세이', subs: [] },
  {
    id: 336, name: '자기계발', label: '자기계발',
    subs: [
      { id: 336,    label: '전체' },
      { id: 70214,  label: '성공' },
      { id: 70212,  label: '리더십' },
      { id: 70211,  label: '행복론' },
      { id: 2951,   label: '인간관계' },
      { id: 70236,  label: '힐링' },
      { id: 107822, label: '정리/심플라이프' },
      { id: 70224,  label: '협상/설득/화술' },
      { id: 70220,  label: '시간/정보관리' },
      { id: 70223,  label: '창의적사고' },
      { id: 2943,   label: '취업/진로' },
      { id: 70241,  label: '20대 자기계발' },
      { id: 70218,  label: '여성 자기계발' },
      { id: 70219,  label: '중년 자기계발' },
      { id: 70233,  label: '프레젠테이션' },
      { id: 70228,  label: '기획/보고' },
    ],
  },
  {
    id: 170, name: '경제/경영', label: '경제/경영',
    subs: [
      { id: 170,    label: '전체' },
      { id: 3057,   label: '경제학/경제일반' },
      { id: 2172,   label: '기업 경영' },
      { id: 2028,   label: '기업/경영자 스토리' },
      { id: 261,    label: '마케팅/세일즈' },
      { id: 197414, label: '트렌드/미래전망' },
      { id: 172,    label: '재테크/투자' },
      { id: 177,    label: '창업/취업/은퇴' },
      { id: 3049,   label: 'CEO 능력계발' },
    ],
  },
  {
    id: 656, name: '인문', label: '인문',
    subs: [
      { id: 656, label: '인문학' },
      { id: 74,  label: '역사' },
      { id: 798, label: '사회과학' },
      { id: 987, label: '과학' },
    ],
  },
  {
    id: 55890, name: '건강/뷰티', label: '건강/뷰티',
    subs: [
      { id: 55890, label: '전체' },
      { id: 53521, label: '건강정보' },
      { id: 53516, label: '건강운동' },
      { id: 53514, label: '다이어트' },
      { id: 53515, label: '헬스/피트니스' },
      { id: 53518, label: '질병치료와 예방' },
      { id: 53517, label: '정신건강' },
      { id: 53520, label: '대체의학' },
      { id: 53519, label: '한의학' },
      { id: 53523, label: '수영/수상스포츠' },
      { id: 53522, label: '걷기/육상스포츠' },
      { id: 53529, label: '등산/캠핑' },
    ],
  },
];

/**
 * 저자명 정리 (목록 표시용)
 * - 괄호와 괄호 안 내용 제거: (지은이), (엮은이), (옮긴이) 등
 * - 쉼표로 구분된 여러 저자 중 첫 번째만 표시
 * @param {string} authorString - 원본 저자 문자열
 * @returns {string} 정리된 저자명
 */
function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export function cleanAuthorName(authorString) {
  if (!authorString) return '';

  // 쉼표로 구분된 첫 번째 저자만 추출
  const firstAuthor = authorString.split(',')[0];

  // 괄호와 괄호 안의 내용 제거
  const cleanedAuthor = firstAuthor.replace(/\s*\([^)]*\)/g, '').trim();

  return cleanedAuthor;
}

/**
 * 저자명 정리 (상세페이지 표시용)
 * - (지은이)는 완전히 제거
 * - (엮은이), (원작), (번역) 등은 각 저자와 매칭하여 반환
 * @param {string} authorString - 원본 저자 문자열 (예: "홍길동 (엮은이), 김철수 (원작)")
 * @returns {Array} [{ name: '저자명', role: '역할' }, ...]
 */
export function formatAuthorForDetail(authorString) {
  if (!authorString) return [];

  const authors = [];

  // 쉼표로 구분된 각 저자 처리
  const authorParts = authorString.split(',').map(part => part.trim());

  authorParts.forEach(part => {
    // 저자명과 역할 추출
    const roleMatch = part.match(/\(([^)]+)\)/);
    const name = part.replace(/\s*\([^)]*\)/g, '').trim();
    const role = roleMatch ? roleMatch[1] : null;

    // 지은이가 아닌 경우에만 역할 포함
    if (role && role !== '지은이') {
      authors.push({ name, role });
    } else if (!role || role === '지은이') {
      // 역할이 없거나 지은이인 경우 이름만
      authors.push({ name, role: null });
    }
  });

  return authors;
}

const EXCLUDED_CATEGORIES = [
  '수험서', '자격증', '고등학교참고서', '달력', '기타',
  '어린이', '외국어', '유아', '잡지', '전집', '중고전집',
  '종교', '역학', '중학교참고서', '초등학교참고서',
  '만화', '코믹', '대학교재', '전문서적',
];

function isExcludedBook(book) {
  const categoryName = book.categoryName || '';
  return EXCLUDED_CATEGORIES.some(keyword => categoryName.includes(keyword));
}

/**
 * 베스트셀러 목록 조회
 * @param {string|number} category - 카테고리 이름 또는 CategoryId
 * @param {number} maxResults - 최대 결과 개수 (기본: 10)
 * @returns {Promise<Array>} 베스트셀러 목록
 */
export async function fetchBestsellers(category = '종합', maxResults = 10) {
  try {
    // categoryId 또는 category 이름으로 ID 찾기
    const categoryId = typeof category === 'number'
      ? category
      : (CATEGORY_MAP[category] || 0);


    const params = new URLSearchParams({
      ttbkey: ALADIN_API_KEY,
      QueryType: 'Bestseller',
      MaxResults: maxResults.toString(),
      start: '1',
      SearchTarget: 'Book',
      output: 'JS', // JSON 형식
      Version: '20131101',
      CategoryId: categoryId.toString(),
      Cover: 'Big', // 큰 이미지 (200px)
    });

    const apiUrl = `${BASE_URL}/ItemList.aspx?${params.toString()}`;
    const url = USE_PROXY ? `${PROXY_URL}${encodeURIComponent(apiUrl)}` : apiUrl;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();

    // API 응답 데이터를 앱에서 사용하는 형식으로 변환
    if (data && data.item && Array.isArray(data.item)) {

      // 제외할 카테고리 (검색과 동일)
      const filteredBooks = data.item
        .filter(book => !isExcludedBook(book))
        .map((book, index) => ({
          rank: index + 1,
          title: book.title,
          author: cleanAuthorName(book.author), // 저자명 정리 (목록용)
          coverImage: book.cover,
          isbn: book.isbn13 || book.isbn,
          publisher: book.publisher,
          pubDate: book.pubDate,
          description: decodeHtml(book.description),
          priceStandard: book.priceStandard,
          priceSales: book.priceSales,
          link: book.link,
          categoryId: categoryId, // 디버깅용
        }));

      // 첫 번째 책 정보 로그
      if (filteredBooks.length > 0) {
      }

      return filteredBooks;
    }

    return [];
  } catch (error) {
    throw error;
  }
}

/**
 * 기간별 베스트셀러 조회 (주간/월간/일간)
 * @param {'weekly'|'monthly'|'daily'} period
 * @param {number} maxResults
 */
export async function fetchBestsellersByPeriod(period = 'weekly', category = '종합', maxResults = 20, start = 1) {
  // Aladin API는 Bestseller(주간)만 지원 - 월간/일간은 동일 엔드포인트 사용
  const queryType = 'Bestseller';
  const categoryId = typeof category === 'number' ? category : (CATEGORY_MAP[category] ?? 0);
  try {
    const params = new URLSearchParams({
      ttbkey: ALADIN_API_KEY,
      QueryType: queryType,
      MaxResults: maxResults.toString(),
      start: start.toString(),
      SearchTarget: 'Book',
      output: 'JS',
      Version: '20131101',
      CategoryId: categoryId.toString(),
      Cover: 'Big',
    });
    const apiUrl = `${BASE_URL}/ItemList.aspx?${params.toString()}`;
    const url = USE_PROXY ? `${PROXY_URL}${encodeURIComponent(apiUrl)}` : apiUrl;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API 요청 실패: ${response.status}`);
    const data = await response.json();
    if (data && data.item && Array.isArray(data.item)) {
      return data.item
        .filter(book => !isExcludedBook(book))
        .map((book, index) => ({
        rank: start + index,
        title: book.title,
        author: cleanAuthorName(book.author),
        coverImage: book.cover,
        isbn: book.isbn13 || book.isbn,
        publisher: book.publisher,
        pubDate: book.pubDate,
        description: book.description,
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * 특정 도서 상세 정보 조회
 * @param {string} itemId - 도서 ISBN 또는 ItemId
 * @returns {Promise<Object>} 도서 상세 정보
 */
export async function fetchBookDetail(itemId) {
  try {
    const params = new URLSearchParams({
      ttbkey: ALADIN_API_KEY,
      itemIdType: 'ISBN13',
      ItemId: itemId,
      output: 'JS',
      Version: '20131101',
      OptResult: 'ebookList,usedList,reviewList',
      Cover: 'Big',
    });

    const apiUrl = `${BASE_URL}/ItemLookUp.aspx?${params.toString()}`;
    const url = USE_PROXY ? `${PROXY_URL}${encodeURIComponent(apiUrl)}` : apiUrl;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.item && data.item.length > 0) {
      const item = data.item[0];
      item.description = decodeHtml(item.description);
      return item;
    }

    return null;
  } catch (error) {
    throw error;
  }
}

/**
 * 신간 목록 조회
 * @param {string|number} category - 카테고리 이름 또는 CategoryId
 * @param {number} maxResults - 최대 결과 개수 (기본: 10)
 * @returns {Promise<Array>} 신간 목록
 */
export async function fetchNewBooks(category = '종합', maxResults = 10) {
  try {
    // categoryId 또는 category 이름으로 ID 찾기
    const categoryId = typeof category === 'number'
      ? category
      : (CATEGORY_MAP[category] || 0);


    const params = new URLSearchParams({
      ttbkey: ALADIN_API_KEY,
      QueryType: 'ItemNewAll',
      MaxResults: '50', // 필터링 후 충분한 결과를 위해 많이 요청
      start: '1',
      SearchTarget: 'Book',
      output: 'JS',
      Version: '20131101',
      CategoryId: categoryId.toString(),
      Cover: 'Big',
    });

    const apiUrl = `${BASE_URL}/ItemList.aspx?${params.toString()}`;
    const url = USE_PROXY ? `${PROXY_URL}${encodeURIComponent(apiUrl)}` : apiUrl;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.item && Array.isArray(data.item)) {

      // 신간은 소설/시/희곡/에세이만 포함
      const includedCategories = ['소설', '시', '희곡', '에세이'];

      const extraExcluded = ['라이트 노벨', '라이트노벨', '큰글자도서', '큰 글자 도서', '큰글자'];
      const seenPublishers = new Set();

      const filteredBooks = data.item
        .filter((book) => {
          const categoryName = book.categoryName || '';
          const isIncluded = includedCategories.some(k => categoryName.includes(k));
          const isExcluded = isExcludedBook(book) || extraExcluded.some(k => categoryName.includes(k));
          const result = isIncluded && !isExcluded;
          if (result) {
            const publisher = book.publisher || '';
            if (seenPublishers.has(publisher)) return false;
            seenPublishers.add(publisher);
          }
          return result;
        })
        .slice(0, maxResults) // 원래 요청한 개수만 반환
        .map((book, index) => ({
          rank: index + 1,
          title: book.title,
          author: cleanAuthorName(book.author),
          coverImage: book.cover,
          isbn: book.isbn13 || book.isbn,
          publisher: book.publisher,
          pubDate: book.pubDate,
          description: decodeHtml(book.description),
          priceStandard: book.priceStandard,
          priceSales: book.priceSales,
          link: book.link,
          categoryId: categoryId,
        }));

      if (filteredBooks.length > 0) {
      }

      return filteredBooks;
    }

    return [];
  } catch (error) {
    throw error;
  }
}

/**
 * 도서 검색
 * @param {string} query - 검색어
 * @param {string} queryType - 검색 타입 ('Keyword', 'Title', 'Author', 'Publisher')
 * @param {number} maxResults - 최대 결과 개수
 * @returns {Promise<Array>} 검색 결과
 */
export async function searchBooks(query, queryType = 'Keyword', maxResults = 20) {
  try {
    const params = new URLSearchParams({
      ttbkey: ALADIN_API_KEY,
      Query: query,
      QueryType: queryType,
      MaxResults: (maxResults * 2).toString(), // 필터링 후 충분한 결과를 위해 2배 요청
      start: '1',
      SearchTarget: 'Book',
      output: 'JS',
      Version: '20131101',
      Cover: 'Big',
    });

    const apiUrl = `${BASE_URL}/ItemSearch.aspx?${params.toString()}`;
    const url = USE_PROXY ? `${PROXY_URL}${encodeURIComponent(apiUrl)}` : apiUrl;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.item && Array.isArray(data.item)) {
      // 제외할 카테고리 (1-depth 기준)
      const filteredBooks = data.item
        .filter(book => !isExcludedBook(book))
        .slice(0, maxResults) // 원래 요청한 개수만 반환
        .map((book) => ({
          title: book.title,
          author: cleanAuthorName(book.author), // 저자명 정리 (목록용)
          coverImage: book.cover,
          isbn: book.isbn13 || book.isbn,
          publisher: book.publisher,
          pubDate: book.pubDate,
          description: decodeHtml(book.description),
          priceStandard: book.priceStandard,
          priceSales: book.priceSales,
          link: book.link,
        }));
      
      return filteredBooks;
    }

    return [];
  } catch (error) {
    throw error;
  }
}
