# Features

## Character Management

### Requirements
- Create, read, update, and delete characters
- Associate characters with campaigns
- Store flexible character attributes as JSON
- Track character access timestamps

### Implementation
- **Service Layer**: `src/services/character-service.ts`
- **Schema**: `src/db/schema.ts` - `characters` table
- **API**: Server actions with `'use server'` directive
- **Storage**: SQLite with Drizzle ORM

> [!IMPORTANT]
> Character attributes use a flexible JSON column. Any structure can be stored without schema migrations.

---

## Auto-Save Character Sheets

### Requirements
- Automatically save character changes without manual save button
- Debounce rapid changes to reduce database writes
- Prevent overwriting server-side updates on component mount

### Implementation
- **Component**: `src/components/CharacterSheet/character-sheet.tsx`
- **Debounce**: 1000ms delay using `use-debounce` library
- **State Management**: `isInitialMount` flag prevents sync on first render

> [!WARNING]
> Without the `isInitialMount` flag, debounced saves can overwrite fresh server data with stale component state.

---

## Character Data Retention (30-Day TTL)

### Requirements
- Automatically delete characters not accessed in 30 days
- Track last access time for each character
- Update timestamp on character sheet view

### Implementation
- **Service**: `deleteStaleCharacters()` in `character-service.ts`
- **Tracking**: `touchCharacter()` updates `lastAccessedAt` on page load
- **Schema**: `lastAccessedAt` timestamp column (nullable)
- **Execution**: Runs automatically on server startup via `instrumentation.ts`

> [!NOTE]
> Cleanup runs once on server startup. Characters are deleted if not accessed in 30+ days.
