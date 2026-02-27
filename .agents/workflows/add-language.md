---
description: Add a new language translation to FlowWatcher — creates locale file, registers it in i18n config, adds to language selector, and verifies the build.
---

# Add New Language

This workflow adds a complete translation for a new language. The user specifies which language they want (e.g. "Bangla", "Spanish", "French") and this workflow handles everything.

// turbo-all

## Step 0 — Determine Language Details

From the user's request, determine:
- **Language name** (e.g. "Bangla", "Spanish")
- **ISO 639-1 code** (e.g. `bn`, `es`, `fr`, `de`, `ar`, `hi`, `ja`, `ko`, `zh`, `tr`, `pt`, `ru`, `it`, `pl`)
- **Native name** (e.g. "বাংলা", "Español", "Français", "Deutsch", "العربية")
- **RTL?** (only Arabic, Hebrew, Farsi, Urdu are RTL)

If the user only says a language name, look up the ISO code and native name yourself. Do NOT ask the user for these.

---

## Step 1 — Read the English Source Locale

```
Read: d:\Projects\Web\raw\FlowWatcher\apps\desktop\src\locales\en.json
```

This is the **source of truth**. The new locale file must have the **exact same keys** with translated values. Count the total keys to verify completeness later.

---

## Step 2 — Create the New Locale File

Create the file at: `d:\Projects\Web\raw\FlowWatcher\apps\desktop\src\locales\<code>.json`

Rules:
- **Copy the EXACT key structure** from `en.json` — same nesting, same key names.
- **Translate ONLY the values** (right side of the colon).
- **DO NOT translate:**
  - `app.name` → Always "FlowWatcher" (brand name)
  - `settings.versionValue` → Always "v0.1.0-dev" (version string)
  - `settings.repoLink` → Always "github.com/IamAshrafee/FlowWatcher" (URL)
  - `settings.licenseValue` → Always "MIT License" (license name)
  - Technical units like `KB/s`, `MB/s`, `PID` prefix
  - `{{variable}}` placeholders — keep them exactly as-is
- **DO translate:**
  - Every other value string naturally into the target language
  - Adapt phrases to sound natural (don't translate word-by-word)
  - Keep `_one` / `_other` pluralization keys — translate both forms per the language's plural rules
- **Preserve emoji** in values that have them (e.g. `🌙`, `☀️`, `⚠`, `↻`)
- For languages with more complex plural forms (e.g. Arabic has 6 forms), add extra keys like `_zero`, `_two`, `_few`, `_many` as needed by i18next pluralization rules.

---

## Step 3 — Register the Language in i18n.ts

Read the current file:
```
Read: d:\Projects\Web\raw\FlowWatcher\apps\desktop\src\i18n.ts
```

Make TWO edits to this file:
1. **Add an import** after the existing locale imports (line ~16):
   ```ts
   import <code> from "./locales/<code>.json";
   ```
2. **Add to resources** inside the `resources: { ... }` object:
   ```ts
   <code>: { translation: <code> },
   ```

The result should look like:
```ts
import en from "./locales/en.json";
import bn from "./locales/bn.json";     // ← new line

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        bn: { translation: bn },         // ← new line
    },
    ...
```

---

## Step 4 — Add to Language Selector in Settings

Read the current file:
```
Read: d:\Projects\Web\raw\FlowWatcher\apps\desktop\src\pages\index.tsx
```

Find the `LANGUAGE_OPTIONS` array (search for `const LANGUAGE_OPTIONS`) and add a new entry:
```ts
const LANGUAGE_OPTIONS = [
    { code: "en", label: "English" },
    { code: "<code>", label: "<NativeName>" },  // ← add here
];
```

Use the **native name** of the language as the label (e.g. "বাংলা" not "Bangla", "Español" not "Spanish").

---

## Step 5 — Verify Key Completeness

Run a verification to ensure no keys are missing:

```bash
cd d:/Projects/Web/raw/FlowWatcher/apps/desktop && node -e "
const en = require('./src/locales/en.json');
const target = require('./src/locales/<code>.json');
function getKeys(obj, prefix='') {
  return Object.entries(obj).flatMap(([k,v]) =>
    typeof v === 'object' ? getKeys(v, prefix+k+'.') : [prefix+k]
  );
}
const enKeys = getKeys(en);
const targetKeys = getKeys(target);
const missing = enKeys.filter(k => !targetKeys.includes(k));
const extra = targetKeys.filter(k => !enKeys.includes(k));
console.log('English keys:', enKeys.length);
console.log('Target keys:', targetKeys.length);
if (missing.length) { console.log('MISSING:', missing); process.exit(1); }
if (extra.length) console.log('Extra (OK for plurals):', extra);
console.log('✅ All keys present!');
"
```

This MUST print "✅ All keys present!" — if any keys are missing, go back to Step 2 and add them.

---

## Step 6 — Build Verification

```bash
cd d:/Projects/Web/raw/FlowWatcher/apps/desktop && npm run build
```

This must pass with 0 errors. If it fails, fix the errors and re-run.

---

## Step 7 — Report to User

Report:
- Language added: **<Language Name>** (`<code>`)
- Locale file: `src/locales/<code>.json` — <N> keys translated
- Registered in: `i18n.ts` and `LANGUAGE_OPTIONS`
- Build: ✅ passed
- How to use: Open app → Settings → Language → select `<NativeName>`
