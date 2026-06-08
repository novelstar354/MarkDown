# Google Sheets Markdown Renderer

Discord / GitHub Inspired Markdown Renderer for Google Sheets.

GoogleスプレッドシートでMarkdownをリアルタイム描画できる高機能Apps Script。

セルにMarkdownを書くだけで、自動的にリッチテキストへ変換されます。

---

![Version](https://img.shields.io/badge/version-ultimate-blue)
![Apps Script](https://img.shields.io/badge/apps--script-google-yellow)
![License](https://img.shields.io/badge/license-MIT-green)

---

# Features

* リアルタイムMarkdown変換
* Undo対応
* ダークテーマ
* コードブロック
* リッチテキスト描画
* リンク自動変換
* Spoiler対応
* Horizontal Rule対応
* ネストリスト対応
* テーブル整形
* Discord風引用
* Apps Scriptのみで動作
* インストール不要
* 軽量・高速

---

# Supported Markdown

| Markdown         | Description     |         |      |   |         |
| ---------------- | --------------- | ------- | ---- | - | ------- |
| `# Heading`      | 大見出し            |         |      |   |         |
| `## Heading`     | 中見出し            |         |      |   |         |
| `### Heading`    | 小見出し            |         |      |   |         |
| `#### Heading`   | 超小見出し           |         |      |   |         |
| `##### Heading`  | ミニ見出し           |         |      |   |         |
| `###### Heading` | 極小見出し           |         |      |   |         |
| `**Bold**`       | 太字              |         |      |   |         |
| `*Italic*`       | 斜体              |         |      |   |         |
| `~~Strike~~`     | 打ち消し            |         |      |   |         |
| `` `Code` ``     | インラインコード        |         |      |   |         |
| `> Quote`        | Discord風引用      |         |      |   |         |
| `- List`         | 箇条書き            |         |      |   |         |
| `  - Nested`     | ネストリスト          |         |      |   |         |
| `- [ ] Task`     | 未完了チェック         |         |      |   |         |
| `- [x] Task`     | 完了チェック          |         |      |   |         |
| `[Link](URL)`    | クリック可能リンク       |         |      |   |         |
| ` ```code``` `   | コードブロック         |         |      |   |         |
| `                |                 | Spoiler |      | ` | Spoiler |
| `---`            | Horizontal Rule |         |      |   |         |
| `                | Table           | `       | テーブル |   |         |

---

# 🚀 Quick Start

## 1. Open Google Sheets

新規または既存のGoogleスプレッドシートを開きます。

---

## 2. Open Apps Script

```text
拡張機能 → Apps Script
```

---

## 3. Paste Script

`Code.gs` の内容をすべて削除し、スクリプトを貼り付けます。

---

## 4. Save

保存ボタンを押します。

---

## 5. Run Once

Apps Script画面で：

```text
▶ 実行
```

を押して認証します。

Googleアカウント認証を許可してください。

---

# Demo

Input:

````markdown
md:# Google Sheets Markdown Renderer

## Features

**Bold Text**

*Italic Text*

~~Strike~~

`const x = 1`

> Quote

- List Item

  - Nested Item

- [ ] TODO

- [x] DONE

||SECRET||

---

| Name | Age |
|---|---|
| Alex | 17 |

[Google](https://google.com)

```js
function hello() {
  console.log("Hello");
}
```
````

Rendered in Google Sheets:

```text
Google Sheets Markdown Renderer

Features

Bold Text
Italic Text
Strike
const x = 1

▎ Quote

• List Item
　• Nested Item

☐ TODO
☑ DONE

████████

────────────────────

Name │ Age
Alex │ 17
```

---

# Ultimate Edition Features

## Spoiler

Discord風Spoiler対応。

```markdown
||SECRET||
```

Rendered:

```text
████████
```

---

## Horizontal Rule

区切り線対応。

```markdown
---
```

Rendered:

```text
────────────────────
```

---

## Nested List

ネスト箇条書き対応。

```markdown
- Item
  - Nested
    - Deep Nested
```

---

## Table Rendering

GitHub風テーブル整形。

```markdown
| Name | Age |
|---|---|
| Alex | 17 |
```

Rendered:

```text
Name │ Age
Alex │ 17
```

---

## Discord Style Quote

引用がDiscord風UIになります。

```markdown
> Quote
```

Rendered:

```text
▎ Quote
```

---

# Menu

シート上部に：

```text
Markdown
```

メニューが追加されます。

## Available Actions

| Menu                       | Description |
| -------------------------- | ----------- |
| `Markdown → 全再変換`          | シート全体を再描画   |
| `Markdown → ダークテーマ ON/OFF` | ダークモード切替    |

---

# Dark Theme

ダークテーマ対応。

* 背景色自動変更
* 文字色最適化
* コードブロック強化
* ダーク用リンク色
* ダーク用コード色

---

# Technical Details

* Google Apps Script
* RichTextValue API
* onEdit Trigger
* Markdown Tokenizer
* Rich Text Renderer
* Real-time Rendering Engine
* Regex Parser
* Token Based Styling Engine

---

# Advanced Features

## Undo Safe

Google SheetsのUndoと競合しにくい安全設計。

---

## Token Based Rendering

MarkdownをToken化して描画するため：

* indexズレ防止
* 複数装飾混在対応
* 安定したスタイル描画

---

## Safer onEdit

`e.value` ではなく：

```javascript
cell.getDisplayValue()
```

を使用することで：

* IME問題軽減
* 複数貼り付け安定化
* Undo競合軽減

---

# Limitations

現在未対応：

* HTML埋め込み
* 画像
* シンタックスハイライト
* Obsidian拡張記法
* Live Side Preview

---

# Roadmap

予定機能：

* シンタックスハイライト
* Markdown Export
* HTML Export
* PDF Export
* Obsidian Theme
* Notion Theme
* Discord Theme
* Side Preview
* Live Preview
* Custom CSS
* Multi Theme
* Auto Table Rendering
* Wiki Link
* @Mention
* Emoji Shortcodes

---

# Why?

Google Sheets lacks rich Markdown rendering.

This project brings Discord / GitHub style Markdown directly into spreadsheet cells using only Apps Script.

---

# License

MIT License

自由に改造・再配布可能です。

---

# Author

Created by Novel Star
