import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, increment, arrayUnion, arrayRemove, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUser(userId) {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createUser(userId, data) {
  await setDoc(doc(db, 'users', userId), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateUser(userId, data) {
  await updateDoc(doc(db, 'users', userId), data);
}

export async function saveWithdrawalReason(userId, { reason, detail }) {
  await addDoc(collection(db, 'withdrawalReasons'), {
    userId,
    reason,
    detail: detail || '',
    createdAt: serverTimestamp(),
  });
}

export async function deleteAllUserData(userId) {
  const deleteCollection = async (colName) => {
    const snap = await getDocs(query(collection(db, colName), where('userId', '==', userId)));
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  };
  await Promise.all([
    deleteDoc(doc(db, 'users', userId)),
    deleteCollection('userBooks'),
    deleteCollection('readingRecords'),
    deleteCollection('reviews'),
  ]);
}

export async function getUserByEmail(email) {
  if (!email) return null;
  const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function checkNickname(nickname) {
  const q = query(collection(db, 'users'), where('nickname', '==', nickname), limit(1));
  const snap = await getDocs(q);
  return snap.empty;
}

// ─── User Books ───────────────────────────────────────────────────────────────

export async function getUserBooks(userId, status = null) {
  let q = query(collection(db, 'userBooks'), where('userId', '==', userId));
  if (status) q = query(q, where('status', '==', status));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function setUserBook(userId, isbn, data) {
  const id = `${userId}_${isbn}`;
  await setDoc(doc(db, 'userBooks', id), {
    userId,
    isbn,
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function removeUserBook(userId, isbn) {
  await deleteDoc(doc(db, 'userBooks', `${userId}_${isbn}`));
}

export async function getBookReaderCount(isbn) {
  const q = query(collection(db, 'userBooks'), where('isbn', '==', isbn), where('status', '==', 'reading'));
  const snap = await getDocs(q);
  return snap.size;
}

// ─── Reading Records ──────────────────────────────────────────────────────────

export async function getReadingRecords(userId) {
  const q = query(
    collection(db, 'readingRecords'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
    };
  });
}

export async function addReadingRecord(userId, data) {
  return await addDoc(collection(db, 'readingRecords'), {
    userId,
    ...data,
    // createdAt은 로컬 ISO 문자열 유지 (serverTimestamp로 덮지 않음)
  });
}

export async function deleteReadingRecord(id) {
  await deleteDoc(doc(db, 'readingRecords', id));
}

export async function updateReadingRecord(id, data) {
  await updateDoc(doc(db, 'readingRecords', id), data);
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function getReviews(roomId = null) {
  let q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(50));
  if (roomId) q = query(collection(db, 'reviews'), where('roomId', '==', roomId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateReviewsBookInfo(isbn, bookData) {
  const q = query(collection(db, 'reviews'), where('bookIsbn', '==', isbn));
  const snap = await getDocs(q);
  // bookTitle이 이미 있는 리뷰는 건드리지 않음 (리뷰 작성 시 저장된 정확한 데이터 보호)
  await Promise.all(
    snap.docs
      .filter(d => !d.data().bookTitle)
      .map(d => updateDoc(d.ref, {
        bookTitle: bookData.title || null,
        bookAuthor: bookData.author || null,
        bookCover: bookData.coverImage || bookData.cover || null,
      }))
  );
}

export async function addReview(data) {
  return await addDoc(collection(db, 'reviews'), {
    ...data,
    likes: [],
    createdAt: serverTimestamp(),
  });
}

export async function updateReview(reviewId, data) {
  await updateDoc(doc(db, 'reviews', reviewId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteReview(reviewId) {
  await deleteDoc(doc(db, 'reviews', reviewId));
}

export async function toggleReviewLike(reviewId, userId) {
  const ref = doc(db, 'reviews', reviewId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const likes = snap.data().likes || [];
  if (likes.includes(userId)) {
    await updateDoc(ref, { likes: arrayRemove(userId) });
  } else {
    await updateDoc(ref, { likes: arrayUnion(userId) });
  }
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

export async function getRooms(userId = null) {
  let q = query(collection(db, 'rooms'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getRoom(roomId) {
  const snap = await getDoc(doc(db, 'rooms', roomId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createRoom(data) {
  return await addDoc(collection(db, 'rooms'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function joinRoom(roomId, userId) {
  const id = `${roomId}_${userId}`;
  await setDoc(doc(db, 'roomParticipants', id), {
    roomId,
    userId,
    currentPage: 0,
    joinedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'rooms', roomId), {
    participantCount: increment(1),
  });
}

export async function getRoomParticipants(roomId) {
  const q = query(collection(db, 'roomParticipants'), where('roomId', '==', roomId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
