# Studylance — Frontend (React + Vite)

Фронтенд для учебной фриланс‑платформы: студенты публикуют задания, исполнители оставляют отклики, заказчик выбирает исполнителя, ведётся упрощённый учёт “залога”, есть профили/резюме, рейтинги/отзывы и админ‑модерация.

Важно: **верификации по email и мессенджера нет** (осознанно не реализуем).

## Технологии

- React + Vite
- Mantine UI
- Redux Toolkit
- React Router
- Axios

## Требования

- Node.js (желательно 18+)
- Запущенный backend (`../backend`) + PostgreSQL

## Быстрый запуск локально

### 1) База данных (PostgreSQL)

По умолчанию backend ожидает:

- DB: `studylance_db`
- User: `postgres`
- Password: `postgres`

Создай БД:

```sql
CREATE DATABASE studylance_db;
```

Если используешь другие креды/имя БД — поменяй их в `../backend/src/main/resources/application.yaml`.

### 2) Backend

Из корня репозитория:

```bash
cd backend
./mvnw spring-boot:run
```

Backend поднимается на: `http://localhost:8080/api/v1`

При старте Liquibase создаст таблицы и применит миграции/сид‑данные.

### 3) Frontend

```bash
cd client
npm install
npm run dev
```

По умолчанию Vite выдаст URL (обычно `http://localhost:5173`).

Если хочешь фиксированный порт (например 9090):

```bash
npm run dev -- --host 0.0.0.0 --port 9090
```

## Конфигурация API

По умолчанию фронт обращается к `http://localhost:8080/api/v1`.

Можно переопределить через переменную окружения:

- `VITE_API_BASE_URL` — базовый URL API

Пример `client/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## Как пользоваться

### Пользовательские роли

- **ROLE_USER** — обычный пользователь (заказчик и/или исполнитель)
- **ROLE_ADMIN** — админка: баны/разбаны, обработка жалоб, удаление проблемных задач

### Основные страницы/роуты

- `/` — лендинг
- `/signup` — регистрация
- `/signin` — вход
- `/posts` — лента задач + фильтры
- `/posts/:postId` — карточка задачи
- `/profile` — ваш профиль/резюме (редактирование)
- `/profiles/:username` — публичный профиль + отзывы + жалоба
- `/dashboard` — “мои задания”: созданные и назначенные
- `/admin` — админ‑панель (только для `ROLE_ADMIN`)

### Создание задачи

- Нажми `POST A TASK` в хедере или открой `/posts?new=1`.
- `Subject` можно вводить **любой** — если такого ещё нет, backend создаст новую категорию автоматически.
- Картинка‑вложение (optional) загружается **в backend и хранится в БД**, Imgur не используется.

### Отклики и выбор исполнителя

- Исполнитель оставляет “Offer” в задаче.
- Заказчик принимает оффер → задача становится `IN_PROGRESS`, назначается исполнитель, сохраняется “deposit”.

### Статусы и отзывы

- `Mark as done` доступно для owner/executor/admin.
- После `DONE` можно оставить отзыв (review) другой стороне.

### Жалобы и админ‑модерация

- “Report” доступен в задаче и в публичном профиле.
- Админка: `/admin` → вкладки `Users` / `Complaints`.

## Как стать админом (через SQL)

По умолчанию регистрация выдаёт роль `ROLE_USER`. Чтобы сделать пользователя админом — добавь связь в `users_roles`.

Пример (важно: `username` чувствителен к регистру):

```sql
INSERT INTO users_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ROLE_ADMIN'
WHERE u.username = 'User1'
ON CONFLICT DO NOTHING;
```

После этого **перелогинься**, чтобы новый JWT содержал роль админа (иначе UI не покажет `ADMIN`).

## Команды

```bash
npm run lint
npm run build
npm run preview
```

