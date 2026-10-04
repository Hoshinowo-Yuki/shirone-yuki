# CLAUDE.md

Project rules live in `AGENTS.md`; read it first. This file tracks in-progress work that is not yet visible from the code or git history, so sessions on different machines stay in sync. Update the status sections whenever work moves forward.

## Context: restoring custom features after the upstream sync

**Detached from upstream from 2026-10-01.** `b7560d7` (2026-09-30) was the last upstream commit merged; upstream is no longer tracked or merged. The README was cut down to a short fork README, kept in English (`README.md`) and Traditional Chinese (`README.zh-TW.md`) only; keep the two in sync.

The repo was synced with upstream (`0929f01`) and cleaned with defaults (`167b489`). Custom features added before the sync were dropped and are being restored **one feature at a time**. The working approach is **get it working first, refactor to upstream standards second**, with a read-only audit before each refactor.

Pre-sync history still holds the originals. Use it as the reference when restoring:

- `7db7b94` — `core: migrating remark and rehype plugins` (7 plugins + processor wiring)
- `a511f96` — `fix: address CI failures for remark plugins` (tabs/highlight conflict fixes)
- `2dc89a8` — `refactor: font + chat css` (`src/styles/chat.css`, `HYTMR45W-Compressed.woff2`)

Find other dropped features with `git log --author=星野ゆき` before `0929f01`.

## Environment notes

- Work happens on more than one machine. On Windows use `pnpm.cmd` / `npx.cmd`; on the Linux machine (used from 2026-10-03) plain `pnpm` / `npx` work.
- On the laptop used on 2026-10-02, pnpm was not installed and `node_modules` was missing (Node 26 has no corepack). Install with `npm.cmd i -g pnpm` then `pnpm.cmd install --frozen-lockfile` before validating.
- Linux machine: Playwright's browsers are not installed. For ad-hoc screenshots, launch Chromium with `executablePath: "/usr/bin/brave"`; `pnpm exec playwright test` needs `npx playwright install` first. `gh` is not installed and there are no GitHub push credentials (HTTPS has no helper, the SSH key is not registered), so the user pushes. CI status can be read anonymously from `https://api.github.com/repos/Hoshinowo-Yuki/shirone-yuki/actions/runs?head_sha=<sha>`.
- The dev server (`astro dev`, which daemonises; stop with `astro dev stop`) does not hot-reload Markdown plugin changes. After editing a remark/rehype plugin, stop it, delete `.astro/data-store.json`, and start it again.
- CI's unit step runs every test: `node --test "tests/**/*.test.mjs"`, not only `tests/plugins/markdown/`.
- Demo posts are not committed. Copies of the demo posts used for visual checks live outside the repo in `/home/neko/projects/shirone-demo-posts/` (`inline-text-extensions.md`, `chat-transcripts.md`, `tabs.md`); copy one into `src/content/posts/` temporarily to preview, and remove it before committing.

## Feature 1: Markdown plugins (status: done)

Refactored to upstream standards in `1c38ca3` after an audit agreed with the user. Each syntax now has a manifest entry, a feature probe, docs in `docs/markdown-extensions.md` (§3.6–3.10), a row in `docs/markdown-plugin-order.md`, and node tests. `src/plugins/markdown/common/` no longer exists.

| Syntax | Author forms | Files |
| --- | --- | --- |
| supersub | `:sup[x]`, `:sub[x]`, `^x^` (no `~sub~`: GFM owns `~x~` as strikethrough) | `remark-supersub.mjs` |
| colored-text | `:red[x]` … `:pink[x]`, `:gray[x]`, `:primary[x]`/`secondary`/`tertiary`/`error`, `:hex-ff5733[x]` | `remark-colored-text.mjs`, `core/colored-text.mjs`, `rehype-component-colored-text.mjs`, `styles/markdown/colored-text.css`, `--content-color-*` in `variables.styl` |
| keyboard | `:keyboard{key="Ctrl"}`, `:keyboard[Esc]`, `{… theme}`, `::keyboard{…}` alone on a line | `remark-keyboard.mjs`, `rehype-component-keyboard.mjs`, `styles/markdown/keyboard.css` |
| furigana | `[漢字]{かんじ}`, `{に.ほん.ご}`, `{=きょう}`, `{a+b}`, `{*}` | `remark-furigana.mjs` (source rewrite like marker), `core/furigana.mjs`, `rehype-component-furigana.mjs` |
| chat | `:::chat` with `[user\|time]`, `[user\|time\|right\|replyTo]`, `[[date]]` dividers, `((note))` | `rehype-component-chat.mjs`, `styles/markdown/chat.css` |
| tabs | `:::tabs` with `::tab[Title]` lines (≥2, nothing before the first); `@tab` blocks stay option-groups | `remark-tabs.mjs` (rewrites to `tab-set`), `rehype-component-tabs.mjs`, `styles/markdown/tabs.css` |

- `remark-highlight` was removed: upstream `remarkMarker` already owns `==text==`.
- `core/directive-source.mjs` restores rejected directives as the author's exact source text.
- Chat warnings (empty block, no headers, unknown position) go to `vfile.message`, which Astro does not print.

Open items for this feature:

- **Packaging:** npm-package mode (`src/integration/`, `docs/packaging-contract.md`) has not been checked with the new plugins.
- **Playwright:** no `tests/site/*.spec.ts` fragments yet for these syntaxes; visual checks were done ad hoc with screenshots.

## Tabs: rebuilt (2026-10-04)

Rebuilt from scratch rather than restored, after the user chose the old author syntax and no-JS switching. Design reference: a borderless rounded card, plain text labels, the active label in primary with an underline as wide as the tab.

- Each tab is emitted as radio input, label, panel; `:checked + label + panel` switches them, and flex `order` puts every label in one row above the panels, so there is no tab-count limit and no client script. Arrow keys come from the native radios; screen readers hear a radio group, not ARIA tabs (accepted trade-off).
- Group names are `shirone-tabs-<hash of file path + block source>-<n>`, so several posts on one page do not interfere.
- The card uses `--surface-container-low`: the post card is already `--surface-container-lowest` (`--card-bg`), so it cannot be darker than the post without a fixed black, which the rules forbid. In dark mode the tabs card is slightly lighter than the post, unlike the reference image.
- Switching fades the new panel in while it rises 8px (`--m3e-duration-long`, `--m3e-easing-standard`; the user found emphasized-decelerate too abrupt). It also plays once on page load, since CSS cannot tell load from switch. Off under reduced motion and in print.
- Demo post: `/home/neko/projects/shirone-demo-posts/tabs.md`.
- No Playwright spec yet (same gap as the other restored syntaxes).

## Remaining features to restore

Inventory done on 2026-10-04: tabs was the only feature left, and it is now rebuilt, so nothing remains to restore. Everything else from the pre-sync commits is either still in the repo (404 page, privacy-policies page, favicons, Docker/nginx deploy), replaced by an upstream equivalent (ogImage handling), or lives in the separate private content repo (custom fonts such as HYTMR45W and LXGW WenKai TC, banner images). Do not restore fonts or banners into this repo.
