# Синхронизация с backend

Backend - отдельный репозиторий, общего пакета типов нет.
Связь между типами держится на трёх вещах: спецификации, сгенерированных типах и
двух файлах-зеркалах.

## Полезные команды

| Команда              | Что делает                                                               |
|----------------------|--------------------------------------------------------------------------|
| `npm run api:sync`   | скопировать спецификацию API из папки с бэкендом и перегенерировать типы |
| `npm run api:types`  | только перегенерировать типы                                             |

**Порядок при изменении API:** backend меняет код и `docs/openapi.yaml` →
здесь `npm run api:sync` → `npm run typecheck`. Расхождения находит компилятор.

## 1. Спецификация и типы

```
../backend/docs/openapi.yaml  →  openapi.yaml  →  app/api/schema.d.ts
```

- `openapi.yaml` - копия спецификации из backend, руками не правится
- `app/api/schema.d.ts` - генерируется, руками не правится, коммитится


Всё, что приходит и уходит по HTTP, типизируется отсюда:

```ts
import type { Schemas } from '~/api/types'

export type Form = Schemas['Form']
export type FormListQuery = NonNullable<operations['listForms']['parameters']['query']>
```

## 2. Файлы-зеркала

Схема формы лежит в БД как JSONB и валидируется одинаковыми zod-схемами на обеих
сторонах. Два файла - ручные копии backend, и переносить их нужно целиком:

| Здесь                                      | Оригинал                                        |
|--------------------------------------------|-------------------------------------------------|
| `app/features/forms/schema/form-schema.ts` | `src/modules/form/schema/form-schema.schema.ts` |
| `app/features/forms/schema/condition.ts`   | `src/modules/form/schema/condition.schema.ts`   |

## 3. Ошибки

Формат ответа - `{ code, message, details? }`, разбирается в `app/api/error.ts`.
Текст для пользователя собирает frontend по `code` и `params` 
(пример: `app/features/form-responses/error.ts`); `message` - подсказка для разработчика
и на экран не выводится.

Добавили код на backend - добавьте перевод: `Record<ErrorCode, ...>`
типизирован контрактом, поэтому пропущенный код уронит `typecheck`.
