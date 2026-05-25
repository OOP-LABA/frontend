export const categoryLabels = {
  Medicine: 'Медицина',
  Household: 'Бытовые задачи',
  Math: 'Математика',
  Programming: 'Программирование',
  English: 'Английский язык',
};

export const cityLabels = {
  Moscow: 'Москва',
  'New York': 'Нью-Йорк',
  Kazan: 'Казань',
  Troitsk: 'Троицк',
};

export const statusLabels = {
  OPEN: 'Открыто',
  IN_PROGRESS: 'В работе',
  DONE: 'Завершено',
  CANCELLED: 'Отменено',
  RESOLVED: 'Решено',
  REJECTED: 'Отклонено',
  ALL: 'Все',
};

export const roleLabels = {
  ROLE_USER: 'Пользователь',
  ROLE_ADMIN: 'Администратор',
};

export const depositStatusLabels = {
  HELD: 'удерживается',
  RELEASED: 'выплачено',
  REFUNDED: 'возвращено',
};

export const formatCategory = (value) => categoryLabels[value] || value;

export const formatCity = (value) => cityLabels[value] || value;

export const formatStatus = (value) => statusLabels[value] || String(value || '').replace(/_/g, ' ');

export const formatRole = (value) => roleLabels[value] || value;

export const formatDepositStatus = (value) => depositStatusLabels[value] || formatStatus(value);

export const formatNumber = (value) => {
  const n = Number(value) || 0;
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
};

export const formatDateTime = (value) => (value ? new Date(value).toLocaleString('ru-RU') : '');

export const ruPlural = (count, one, few, many) => {
  const abs = Math.abs(Number(count) || 0) % 100;
  const last = abs % 10;

  if (abs > 10 && abs < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
};

export const formatReviewsCount = (count) =>
  `${count} ${ruPlural(count, 'отзыв', 'отзыва', 'отзывов')}`;

export const formatOffersCount = (count) =>
  `${count} ${ruPlural(count, 'отклик', 'отклика', 'откликов')}`;
