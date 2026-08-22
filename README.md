# etu-forms (frontend)

Конструктор форм: сборка формы вручную или с помощью ИИ-помощника,
публикация, публичная ссылка `/f/:id` для заполнения формы
неавторизованными пользователями, просмотр ответов
с фильтрами и выгрузка в .xlsx фоновой задачей.

SPA, всё общение с backend по JSON, авторизация
через Bearer Token в заголовке.

Backend живёт в отдельном репозитории.

## Стек

Nuxt 4 в режиме SPA (`ssr: false`), Vue 3, TypeScript (strict), 
Nuxt UI 4 + Tailwind 4, Zod, ESLint (`@nuxt/eslint`).

Типы запросов и ответов руками не пишутся: они генерируются из OpenAPI
backend в `app/api/schema.d.ts` (`openapi-typescript`), подробнее в 
[Синхронизация с бэкендом](docs/backend-sync.md)

## Быстрый старт

```bash
cp .env.example .env      # NUXT_PUBLIC_API_BASE_URL - адрес backend
npm ci
npm run dev
```

Нужен запущенный backend по адресу из `.env`.

## Команды

```
npm run dev            dev-сервер
npm run build          сборка
npm run generate       сборка статики для продакшна

npm run typecheck      nuxt typecheck
npm run lint           eslint .
npm run format         eslint . --fix

npm run api:sync       забрать openapi.yaml из backend и перегенерировать типы
npm run api:types      перегенерировать типы из локального openapi.yaml
```

После правок прогоняются `npm run typecheck` и `npm run lint`

## Структура

```
app/
  api/           HTTP-инфраструктура: клиент, ошибки, сборка query, schema.d.ts
  components/    Vue-компоненты, авто-импорт по пути
                 (form/editor/Inspector.vue → <FormEditorInspector>)
  composables/   общее для всех фич: useFilters, useAutoRefresh, usePageHeader
  features/      логика и контракты фич (см. ниже)
  layouts/       dashboard (кабинет), builder (редактор), default (публичные
                 страницы: заполнение форм и авторизация)
  middleware/    auth на страницах и глобальный редирект на вход в систему
  pages/         страницы (pages/forms/[id]/responses.vue → url /forms/:id/responses)
  plugins/       инициализация: восстановление сессии, локализация zod
  utils/         чистые хелперы
  assets/        стили

docs/            документация
public/          статика
openapi.yaml     копия спецификации backend, источник типов
```

`.vue` всегда в `components/`, скрипты - в `features/`

### Разделы кабинета

| Адрес                  | Что там                                                    |
|------------------------|------------------------------------------------------------|
| `/forms`               | Список форм и конструктор формы                            |
| `/forms/:id/responses` | Ответы: просмотр, фильтрация, выгрузка в .xlsx             |
| `/jobs`                | Фоновые задачи: прогресс, скачивание результата, отмена    |
| `/tokens`              | API-токены для доступа к backend снаружи                   |
| `/f/:id`               | Публичное заполнение опубликованной формы, без авторизации |

### Фичи

| Модуль           | Отвечает за                      |
|------------------|----------------------------------|
| `auth`           | аутентификация                   |
| `api-tokens`     | API-токены                       |
| `forms`          | формы, ИИ-конструктор форм       |
| `form-responses` | ответы на форму, экспорт в .xlsx |
| `ai`             | ИИ                               |
| `jobs`           | фоновые задачи                   |

### Структура фичи

У всех фич она одинаковая, отличается только набор необязательных файлов:

```
app/features/<фича>/
  api.ts          методы ресурса: createCrudApi плюс специфичные эндпоинты
  types.ts        типы контракта - Schemas['...'], руками не пишутся
  constants.ts    константы: статусы и т.д.
  filters.ts      фильтры и их перевод в query
  error.ts        код ошибки backend → текст для пользователя
  use*.ts         поведение фичи
```

У `forms` внутри ещё три слоя - контракт схемы, конструктор и заполнение:

```
schema → editor
schema → runtime → FormInputStorage → form-responses
```

Подробнее в [Формы: слои и жизненный цикл](docs/forms-architecture.md).

Что откуда можно импортировать:

| Файл                                    | Кто импортирует                        |
|-----------------------------------------|----------------------------------------|
| `components/`, `composables/`, `utils/` | авто-импорт, доступны глобально        |
| `features/<фича>/*`                     | страницы, компоненты и другие фичи     |
| `api/schema.d.ts`                       | только `api/types.ts` и `types.ts` фич |

Зависимости между фичами односторонние: `form-responses → jobs`,
`form-responses → forms`.

## Как проходит запрос

Сверху вниз - путь действия пользователя, снизу вверх - путь ответа:

```
   действие пользователя
        │
   pages/<...>.vue          разметка и мета страницы
        │
   components/<...>.vue     компонент
        │
   features/<фича>/filters.ts
        │
   features/<фича>/api.ts   методы ресурса
        │
   api/http.ts              get / post / patch / delete
        │
   api/client.ts            сборка запроса в бэкенд
        │
        │
   backend
        │
        ▼   обратно поднимается ответ
   api/schema.d.ts          типы контракта
        │
   features/<фича>/error.ts код ошибки → текст, понятный пользователю
        │
   экран
```

Долгие операции идут иначе: backend сразу отвечает задачей, а frontend
опрашивает `/jobs/:id` и только потом забирает файл.
Так устроена выгрузка ответов: ссылка на файл требует `Authorization`, поэтому
он скачивается как `Blob` и отдаётся браузеру.
Уход со страницы отменяет только опрос - задача остаётся в очереди и видна
на `/jobs`.

### Разработка

| Пример задачи                     | Файл(-ы)                                                       |
|-----------------------------------|----------------------------------------------------------------|
| новый раздел                      | `app/pages/`, `definePageMeta` с layout и middleware           |
| новый запрос к API                | `features/<фича>/api.ts`                                       |
| новый фильтр                      | `features/<фича>/filters.ts` + `components/<фича>/Filters.vue` |
| изменить текст ошибки             | `features/<фича>/error.ts`                                     |
| добавить новый статус для Form    | `features/<фича>/constants.ts`                                 |
| изменить просмотр ответа на форму | `app/components/`                                              |
| backend поменял контракт          | `npm run api:sync`, дальше чинить typecheck                    |

Файлы в `app/api/`, `app/composables/` и `app/utils/` - общие для всех фич.
Правка там чинит или ломает сразу всё, так что менять их стоит осознанно,
а не ради одного случая.

## Документация

| Документ                                                 | О чём                                          |
|----------------------------------------------------------|------------------------------------------------|
| [openapi.yaml](openapi.yaml)                             | Копия API спецификации backend, источник типов |
| [docs/backend-sync.md](docs/backend-sync.md)             | Синхронизация типов с бэкендом                 |
| [docs/forms-architecture.md](docs/forms-architecture.md) | Слои формы, жизненный цикл, словарь терминов   |
