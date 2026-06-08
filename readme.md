# Google Sheets Markdown Renderer

## Discord Inspired Ultimate Edition

Google スプレッドシートで
Discord / GitHub 風 Markdown をリアルタイム表示できる Apps Script です。

---

# Features

* リアルタイム Markdown 変換
* Discord風ダークテーマ
* Undo対応
* コードブロック
* インラインコード
* 見出し
* 太字
* 斜体
* 打ち消し
* 引用
* リスト
* チェックボックス
* リンク
* 全再変換
* 自動高さ調整

---

# Supported Markdown

| Markdown                       | Preview  |
| ------------------------------ | -------- |
| `# Title`                      | 見出し      |
| `**Bold**`                     | 太字       |
| `*Italic*`                     | 斜体       |
| `~~Strike~~`                   | 打ち消し     |
| `` `Code` ``                   | インラインコード |
| `> Quote`                      | 引用       |
| `- List`                       | リスト      |
| `- [x] Done`                   | チェックボックス |
| `[Google](https://google.com)` | リンク      |
| ` `                            | コードブロック  |

---

# Installation

## 1. Google Sheets を開く

新規または既存のスプレッドシートを開きます。

---

## 2. Apps Script を開く

```txt
拡張機能 → Apps Script
```

---

## 3. スクリプトを貼り付け

配布されている `Code.gs` をすべて貼り付けます。

---

## 4. 保存

```txt
Ctrl + S
```

---

## 5. 初回実行

Apps Script 上で:

```javascript
onOpen()
```

を実行。

Google アカウント認証を許可してください。

---

# Usage

セルに `md:` を先頭につけて入力します。

例:

````md
md:# Hello World

**Bold**

*Italic*

~~Strike~~

`code`

> Quote

- List

- [x] Done

[Google](https://google.com)

```js
console.log("Hello");
```
````

---

# Discord Theme

このプロジェクトは Discord の配色を参考にしています。

### Theme Colors

| Element    | Color     |
| ---------- | --------- |
| Background | `#313338` |
| Text       | `#dbdee1` |
| Code Block | `#1e1f22` |
| Link       | `#00a8fc` |

---

# Menu

スプレッドシート上部に:

```txt
Markdown
```

メニューが追加されます。

## Available Commands

| Menu     | Description        |
| -------- | ------------------ |
| 全再変換     | すべての Markdown を再描画 |
| ダークテーマ適用 | Discord風テーマ適用      |

---

# Real-time Rendering

セル編集時に自動で Markdown が描画されます。

追加操作は不要です。

---

# How It Works

このプロジェクトは Google Apps Script の:

* `RichTextValue`
* `TextStyle`
* `onEdit(e)`

を使用して Markdown を装飾しています。

---

# Configuration

`CONFIG` を変更するとテーマをカスタマイズできます。

```javascript
const CONFIG = {
  DARK_THEME: true,
  BG: "#313338",
  TEXT: "#dbdee1"
};
```

---

# Notes

* Markdown として認識するには `md:` が必要です
* Google Sheets の制限により完全な HTML/CSS は使えません
* 一部 Markdown は簡易再現です

---

# Planned Features

* シンタックスハイライト
* Mermaid 対応
* テーブル対応
* 数式対応
* Notion風テーマ
* Obsidian風テーマ
* Discord Embed
* メンション機能
* サイドプレビュー

---

# License

MIT License

自由に改造・配布可能です。

---

# Inspired By

* Discord
* GitHub Markdown
* Obsidian
* Notion

---

# Example

````md
md:# Discord Markdown

## Subtitle

**Bold**

*Italic*

~~Strike~~

> Quote

```js
console.log("Hello");
```
````

---

# Author

Novel Star
