# Translation Guide

Thank you for helping translate FlowWatcher! This guide explains how translations work and how to add a new language.

---

## Architecture

FlowWatcher uses [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/) for internationalization.

```
apps/desktop/src/
├── i18n.ts              ← Configuration: registers all languages
├── locales/
│   └── en.json          ← English (source of truth)
│   └── <code>.json      ← Other languages (same key structure)
├── main.tsx             ← Imports i18n before React
└── pages/index.tsx      ← LANGUAGE_OPTIONS for Settings dropdown
```

**Key principle:** Every user-facing string in the UI uses `t("key")` from the `useTranslation()` hook. The key maps to a value in the current locale's JSON file.

---

## How to Add a New Language

### Automated (Recommended)

If you're working with the AI assistant, simply say:

> "Add [language name]" and attach the `/add-language` workflow.

The workflow handles everything automatically.

### Manual Steps

#### 1. Create the Locale File

Copy `apps/desktop/src/locales/en.json` to `<code>.json` (e.g. `bn.json` for Bangla):

```bash
cp apps/desktop/src/locales/en.json apps/desktop/src/locales/bn.json
```

#### 2. Translate the Values

Open your new file and translate **only the values** (right side of `:`). Keep all keys identical.

**DO NOT translate:**
| Key | Reason |
|-----|--------|
| `app.name` | Brand name — always "FlowWatcher" |
| `settings.versionValue` | Version string |
| `settings.repoLink` | GitHub URL |
| `settings.licenseValue` | License name |
| Units: `KB/s`, `MB/s` | Technical units |
| `{{variable}}` placeholders | Runtime interpolation — keep exactly as-is |

**Pluralization:** Keys ending in `_one` and `_other` handle singular/plural. Translate both forms. For languages with more plural forms (e.g. Arabic, Polish), add `_zero`, `_two`, `_few`, `_many` as needed — see [i18next plurals](https://www.i18next.com/translation-function/plurals).

#### 3. Register in i18n.ts

Open `apps/desktop/src/i18n.ts` and:

```ts
import en from "./locales/en.json";
import bn from "./locales/bn.json";  // ← Add import

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        bn: { translation: bn },     // ← Add to resources
    },
    // ...
});
```

#### 4. Add to Language Selector

In `apps/desktop/src/pages/index.tsx`, find `LANGUAGE_OPTIONS` and add:

```ts
const LANGUAGE_OPTIONS = [
    { code: "en", label: "English" },
    { code: "bn", label: "বাংলা" },  // ← Use native name
];
```

#### 5. Verify

```bash
npm run build  # Must pass with 0 errors
```

---

## Key Structure Reference

The English locale has **9 namespaces** with **100+ keys**:

| Namespace | Component | Key Count |
|-----------|-----------|-----------|
| `app` | Brand + status labels | 7 |
| `nav` | Tab navigation | 4 |
| `dashboard` | Dashboard page | 9 |
| `trigger` | Trigger builder sentence | 17 |
| `countdown` | Countdown dialog | 3 |
| `advanced` | Advanced page | 4 |
| `processList` | Process list panel | 9 |
| `exclusionList` | Exclusion list panel | 5 |
| `logs` | Logs page | 17 |
| `settings` | Settings page | 27 |

**Total: ~102 keys**

---

## Quality Checklist

Before submitting a translation:

- [ ] All keys from `en.json` are present in your file
- [ ] No `{{variable}}` placeholders were translated or removed
- [ ] Brand name "FlowWatcher" is kept as-is
- [ ] Phrases sound natural in the target language (not word-by-word)
- [ ] Pluralization forms are correct for your language
- [ ] `npm run build` passes with 0 errors
- [ ] Tested in the app: Settings → Language → your language

---

## Need Help?

Open an issue with the `translation` label or ask in Discussions.
