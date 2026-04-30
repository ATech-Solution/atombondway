# Plugin System — Atombondway

## Overview

The plugin system lets admins enable or disable optional site features without modifying code.
Each plugin is a document in the **Plugins** collection in the Payload CMS admin panel.

Active plugins automatically appear as navigation links in the admin sidebar (below the System group).

---

## Plugin Documentation Convention

> **Every plugin must have:**
> 1. `docs/{plugin-slug}.md` — the primary knowledge doc (structure, features, env vars, API, setup)
> 2. `src/plugins/{plugin-slug}/CHANGELOG.md` — version log (version, date, title, summary)
>
> **Before modifying a plugin:** read its `CHANGELOG.md` to understand the current state.
> **After modifying a plugin:** update `CHANGELOG.md` and `docs/{plugin-slug}.md`.

---

## Managing Plugins

### Enable a Plugin

1. Go to **Admin → System → Plugins**
2. Find the plugin you want to enable
3. Set **Status** to **Active**
4. Save
5. The plugin's admin link appears automatically in the sidebar under **Plugins**

### Disable a Plugin

1. Go to **Admin → System → Plugins**
2. Find the plugin
3. Set **Status** to **Inactive**
4. Save

> Disabling a plugin prevents its API routes from executing but does not remove any data.

---

## Plugins Collection Fields

| Field | Description |
|-------|-------------|
| `name` | Human-readable plugin name |
| `slug` | Unique identifier used in code (do not change after creation) |
| `description` | What this plugin does |
| `version` | Plugin version string |
| `status` | `active` or `inactive` |
| `config` | JSON object with plugin-specific settings. Use `adminPath` to set the sidebar link URL |

### `config.adminPath`

Set this in the plugin document (or via the seed) to control which URL the sidebar nav link points to.

```json
{
  "adminPath": "/admin/plugins/backup"
}
```

If not set, defaults to `/admin/plugins/{slug}`.

---

## Available Plugins

### Backup & Restore

**Slug:** `backup-restore`  
**Version:** 2.0.0  
**Admin Panel:** Admin → Plugins → Backup & Restore  
**Knowledge doc:** [docs/backup-restore.md](./backup-restore.md)

Creates snapshots of the SQLite database, media files, and project source code.
Supports local storage and Google Drive (OAuth2). Includes upload, delete, and a built-in restore guide.

---

## Creating a New Plugin

### 1. Create the plugin folder

```
src/plugins/
└── my-plugin/
    ├── index.ts         ← PLUGIN_METADATA export + public API
    ├── MyView.tsx       ← optional custom admin view (client component)
    ├── CHANGELOG.md     ← version log (required)
    └── README.md        ← plugin documentation
```

### 2. Export plugin metadata from `index.ts`

```typescript
export const PLUGIN_METADATA = {
  slug: 'my-plugin',
  name: 'My Plugin',
  description: 'What this plugin does.',
  version: '1.0.0',
} as const
```

### 3. Register an admin view (optional)

In `payload.config.ts`, add your view to `admin.components.views`:

```typescript
admin: {
  components: {
    views: {
      myPlugin: {
        Component: '@/plugins/my-plugin/MyView#MyView',
        path: '/plugins/my-plugin',
      },
    },
  },
}
```

### 4. Add API routes (optional)

Create Next.js API routes under `src/app/api/plugins/my-plugin/`.
Always check:
- The user is authenticated and has `admin` role
- The plugin `status` is `active` in the Plugins collection before doing any work

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const { user } = await payload.auth({ headers: request.headers })
if (!user || user.role !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 5. Seed the plugin document

Add a seed in `payload.config.ts` `onInit` to auto-create the plugin document:

```typescript
onInit: async (payload) => {
  const existing = await payload.find({
    collection: 'plugins',
    where: { slug: { equals: 'my-plugin' } },
    limit: 1,
  })
  if (existing.docs.length === 0) {
    await payload.create({
      collection: 'plugins',
      data: {
        name: 'My Plugin',
        slug: 'my-plugin',
        description: 'What this plugin does.',
        version: '1.0.0',
        status: 'inactive',
        config: { adminPath: '/admin/plugins/my-plugin' },
      },
    })
  }
}
```

### 6. Create the knowledge doc

Create `docs/my-plugin.md` with:
- Overview and features
- File structure
- Environment variables
- API reference
- Setup instructions

### 7. Create `CHANGELOG.md`

Start the changelog at `src/plugins/my-plugin/CHANGELOG.md`:

```markdown
## v1.0.0 — YYYY-MM-DD

Initial release.
- Feature A
- Feature B
```

---

## Security Notes

- All plugin API routes must verify the user is an `admin` before executing
- The Plugins collection is admin-only for create/update/delete; editors can only read
- File paths in backup/restore routes are validated to prevent path traversal

---

## Folder Structure Reference

```
src/
└── plugins/                        ← all plugin code lives here
    └── backup-restore/
        ├── index.ts
        ├── BackupView.tsx
        ├── CHANGELOG.md
        ├── README.md
        └── handlers/
            ├── backup.ts
            ├── restore.ts
            └── cloud.ts

backups/                            ← backup results (committed folder, ignored content)
├── db/                             ← .db snapshots
├── files/                          ← .tar.gz archives
├── project/                        ← project source archives
├── scripts/
│   ├── backup.js                   ← npm run backup
│   └── restore.js                  ← npm run restore
└── RESTORE.md                      ← step-by-step restore guide

src/app/api/plugins/                ← plugin API routes
└── backup/
    ├── run/route.ts
    ├── restore/route.ts
    ├── download/route.ts
    ├── list/route.ts
    ├── delete/route.ts
    ├── upload/route.ts
    └── gdrive/route.ts

docs/                               ← plugin knowledge docs
├── plugins.md                      ← this file
└── backup-restore.md               ← Backup & Restore knowledge doc

src/components/admin/
├── PluginNavLinks.tsx              ← server component: fetches active plugins for sidebar
└── PluginNavLinksClient.tsx        ← client component: renders nav links with active state
```
