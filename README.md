# Shirone (customized version)

English · [繁體中文](./README.zh-TW.md)

Another customized version of [Shirone](https://github.com/LyraVoid/Shirone), the Material 3 Expressive blog theme built with Astro.

> [!NOTE]
> Synced with upstream until 2026-09-30; Starting from 2026-10-01 it is maintained independently and no longer tracks upstream.

## What's different

- Extra Markdown syntax: superscript/subscript, colored text, keyboard keys, furigana, and chat transcripts. See [`docs/markdown-extensions.md`](./docs/markdown-extensions.md).
- More custom features from before the last sync are being restored one at a time.

## Development

Requires [Node.js](https://nodejs.org/) 22.12+ and [pnpm](https://pnpm.io/) 9.

```bash
pnpm install
pnpm dev          # http://localhost:4321
```

On Windows, use `pnpm.cmd` and `npx.cmd`.


| Command                          | Action                                      |
| -------------------------------- | ------------------------------------------- |
| `pnpm dev`                       | Start the development server                |
| `pnpm new-post <filename>`       | Create a post in`src/content/posts/`        |
| `pnpm format`                    | Format with Biome (run before committing)   |
| `pnpm check` / `pnpm type-check` | Astro and TypeScript checks                 |
| `pnpm build`                     | Build the site and search index into`dist/` |
| `pnpm preview`                   | Preview the production build                |

Site settings live in `src/config/`; see [`src/config/README.md`](./src/config/README.md).

## Credits

Based on [Shirone](https://github.com/LyraVoid/Shirone) and its contributors, which began as a refactor of [Fuwari](https://github.com/saicaca/fuwari) by saicaca.

## License

[MIT](./LICENSE), keeping the original copyright notices.
