# Shirone（個人版本）

[English](./README.md) · 繁體中文

這是 [Shirone](https://github.com/LyraVoid/Shirone) 的某客製化版本。Shirone 是以 Astro 打造、採用 Material 3 Expressive 設計的部落格主題。

> [!NOTE]
> 與上游同步至 2026-09-30；自 2026-10-01 起獨立維護，不再追蹤上游。

## 與上游的差異

- 額外的 Markdown 語法：上標／下標、彩色文字、鍵盤按鍵、振假名（furigana）與聊天記錄。詳見 [`docs/markdown-extensions.md`](./docs/markdown-extensions.md)。
- 上次同步前的其他自訂功能正逐一恢復中。

## 開發

需要 [Node.js](https://nodejs.org/) 22.12 以上與 [pnpm](https://pnpm.io/) 9。

```bash
pnpm install
pnpm dev          # http://localhost:4321
```

在 Windows 上請改用 `pnpm.cmd` 與 `npx.cmd`。


| 指令                             | 說明                              |
| -------------------------------- | --------------------------------- |
| `pnpm dev`                       | 啟動開發伺服器                    |
| `pnpm new-post <filename>`       | 在`src/content/posts/` 建立新文章 |
| `pnpm format`                    | 以 Biome 格式化（提交前執行）     |
| `pnpm check` / `pnpm type-check` | Astro 與 TypeScript 檢查          |
| `pnpm build`                     | 建置網站與搜尋索引至`dist/`       |
| `pnpm preview`                   | 預覽正式版建置結果                |

網站設定位於 `src/config/`，請參閱 [`src/config/README.md`](./src/config/README.md)。

## 致謝

基於 [Shirone](https://github.com/LyraVoid/Shirone) 及其貢獻者的成果；Shirone 最初源自 saicaca 的 [Fuwari](https://github.com/saicaca/fuwari) 重構。

## 授權

[MIT](./LICENSE)，保留原有的版權聲明。
