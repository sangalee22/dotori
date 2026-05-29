const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, addDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyB-DaCa48IZYkJJV7hn-Ydz3hoe_G-aXS4",
  authDomain: "dotori-b69be.firebaseapp.com",
  projectId: "dotori-b69be",
  storageBucket: "dotori-b69be.firebasestorage.app",
  messagingSenderId: "642592573898",
  appId: "1:642592573898:web:033f50f4aad2461a2ca733",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const BOOKS = [
  { isbn: '9788936434267', title: '채식주의자', author: '한강', cover: 'https://image.aladin.co.kr/product/1019/57/cover/8936434268_2.jpg', totalPages: 247 },
  { isbn: '9788932919126', title: '82년생 김지영', author: '조남주', cover: 'https://image.aladin.co.kr/product/13207/43/cover/8932919127_2.jpg', totalPages: 190 },
  { isbn: '9788954651523', title: '아몬드', author: '손원평', cover: 'https://image.aladin.co.kr/product/18616/6/cover/8954651526_2.jpg', totalPages: 264 },
  { isbn: '9788901217598', title: '달러구트 꿈 백화점', author: '이미예', cover: 'https://image.aladin.co.kr/product/24248/67/cover/8901217597_2.jpg', totalPages: 304 },
  { isbn: '9788936438784', title: '소년이 온다', author: '한강', cover: 'https://image.aladin.co.kr/product/5086/41/cover/8936438786_2.jpg', totalPages: 216 },
  { isbn: '9791168412699', title: '불편한 편의점', author: '김호연', cover: 'https://image.aladin.co.kr/product/28674/38/cover/k732836188_2.jpg', totalPages: 320 },
  { isbn: '9788954676830', title: '파친코', author: '이민진', cover: 'https://image.aladin.co.kr/product/22205/26/cover/8954676839_2.jpg', totalPages: 672 },
  { isbn: '9788937434587', title: '데미안', author: '헤르만 헤세', cover: 'https://image.aladin.co.kr/product/543/57/cover/8937434580_2.jpg', totalPages: 200 },
];

const NICKNAMES = ['책벌레민준', '독서왕수아', '활자중독자', '북클럽지현', '페이지터너', '밑줄긋는사람', '서재지기', '낭독하는밤', '책읽는오후', '도서관단골'];
const REVIEW_TEXTS = [
  '정말 오랫동안 마음에 남는 책이에요. 마지막 페이지를 덮고 한참 멍하니 있었어요.',
  '문장 하나하나가 아름다워서 천천히 읽게 되는 책입니다. 강추해요!',
  '예상치 못한 전개에 밤새 읽었어요. 완독하고 나서 여운이 엄청나요.',
  '주인공의 감정이 너무 생생하게 느껴져서 같이 울었어요.',
  '처음엔 어렵게 느껴졌는데 읽다 보니 빠져들었어요. 인생책 추가!',
  '독서모임에서 추천받았는데 역시 기대 이상이었어요.',
  '이 작가의 다른 책도 다 읽고 싶어졌어요. 문체가 너무 좋아요.',
  '짧지만 깊은 여운을 남기는 작품. 두 번 읽고 싶어요.',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return Timestamp.fromDate(d);
}

async function seed() {
  console.log('🌱 더미 데이터 삽입 시작...');

  // 1. 유저 생성
  const userIds = [];
  for (let i = 0; i < 10; i++) {
    const id = `dummy_user_${i}`;
    userIds.push(id);
    await setDoc(doc(db, 'users', id), {
      nickname: NICKNAMES[i],
      name: NICKNAMES[i],
      email: `user${i}@dotori.app`,
      profileImage: null,
      provider: i % 2 === 0 ? 'google' : 'kakao',
      createdAt: daysAgo(randomInt(10, 60)),
    });
  }
  console.log('✅ 유저 10명 생성');

  // 2. userBooks - 읽는 중 / 완독
  for (const userId of userIds) {
    const shuffled = [...BOOKS].sort(() => 0.5 - Math.random());
    const readingBooks = shuffled.slice(0, randomInt(1, 3));
    const completedBooks = shuffled.slice(3, 3 + randomInt(1, 3));

    for (const book of readingBooks) {
      await setDoc(doc(db, 'userBooks', `${userId}_${book.isbn}`), {
        userId,
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        cover: book.cover,
        totalPages: book.totalPages,
        currentPage: randomInt(10, book.totalPages - 10),
        status: 'reading',
        startedAt: daysAgo(randomInt(3, 20)),
        updatedAt: daysAgo(randomInt(0, 2)),
      });
    }

    for (const book of completedBooks) {
      await setDoc(doc(db, 'userBooks', `${userId}_${book.isbn}_done`), {
        userId,
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        cover: book.cover,
        totalPages: book.totalPages,
        currentPage: book.totalPages,
        status: 'completed',
        startedAt: daysAgo(randomInt(30, 90)),
        completedAt: daysAgo(randomInt(1, 29)),
        updatedAt: daysAgo(1),
      });
    }
  }
  console.log('✅ 읽는 중 / 완독 책 생성');

  // 3. 독서 기록
  for (const userId of userIds) {
    for (let i = 0; i < randomInt(5, 15); i++) {
      const book = BOOKS[randomInt(0, BOOKS.length - 1)];
      const dayOffset = randomInt(0, 30);
      await addDoc(collection(db, 'readingRecords'), {
        userId,
        isbn: book.isbn,
        title: book.title,
        cover: book.cover,
        date: new Date(Date.now() - dayOffset * 86400000).toISOString().split('T')[0],
        duration: randomInt(600, 7200),
        startPage: randomInt(1, 100),
        endPage: randomInt(101, 200),
        createdAt: daysAgo(dayOffset),
      });
    }
  }
  console.log('✅ 독서 기록 생성');

  // 4. 독서방
  const roomIds = [];
  const roomNames = ['한강 소설 읽기', '2025 부커상 수상작 모임', '일주일에 한 권 챌린지', '고전문학 탐독', '한국 현대문학 독서회'];
  for (let i = 0; i < 5; i++) {
    const book = BOOKS[i];
    const ref = await addDoc(collection(db, 'rooms'), {
      roomName: roomNames[i],
      isbn: book.isbn,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCover: book.cover,
      totalPages: book.totalPages,
      ownerId: userIds[i],
      isPublic: true,
      maxParticipants: randomInt(5, 20),
      participantCount: randomInt(3, 10),
      endDate: new Date(Date.now() + randomInt(7, 30) * 86400000).toISOString().split('T')[0],
      createdAt: daysAgo(randomInt(3, 14)),
    });
    roomIds.push(ref.id);
  }
  console.log('✅ 독서방 5개 생성');

  // 5. 리뷰 (피드)
  for (let i = 0; i < 30; i++) {
    const userId = userIds[randomInt(0, userIds.length - 1)];
    const book = BOOKS[randomInt(0, BOOKS.length - 1)];
    const roomId = roomIds[randomInt(0, roomIds.length - 1)];
    const likeCount = randomInt(0, 5);
    const likes = userIds.slice(0, likeCount);

    await addDoc(collection(db, 'reviews'), {
      userId,
      userNickname: NICKNAMES[userIds.indexOf(userId)],
      roomId,
      isbn: book.isbn,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCover: book.cover,
      content: REVIEW_TEXTS[randomInt(0, REVIEW_TEXTS.length - 1)],
      page: randomInt(1, book.totalPages),
      type: 'text',
      isSpoiler: Math.random() < 0.1,
      likes,
      commentCount: randomInt(0, 8),
      createdAt: daysAgo(randomInt(0, 14)),
    });
  }
  console.log('✅ 리뷰 30개 생성');

  console.log('🎉 더미 데이터 삽입 완료!');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
