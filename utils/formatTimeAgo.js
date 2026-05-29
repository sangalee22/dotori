export function formatTimeAgo(createdAt) {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffMin = Math.floor(diffMs / 1000 / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;

  const yy = String(created.getFullYear()).slice(2);
  const mm = String(created.getMonth() + 1).padStart(2, '0');
  const dd = String(created.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}
