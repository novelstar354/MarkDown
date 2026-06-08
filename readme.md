# Google Sheets Markdown Renderer

GoogleスプレッドシートでMarkdownをリアルタイム描画できる高機能Apps Script。

セルにMarkdownを書くだけで、自動的にリッチテキストへ変換されます。

---

# Features

* リアルタイムMarkdown変換
* Undo対応
* ダークテーマ
* コードブロック
* リッチテキスト描画
* リンク自動変換
* Apps Scriptのみで動作
* インストール不要
* 軽量・高速

---

# Supported Markdown

| Markdown        | Result    |
| --------------- | --------- |
| `# Heading`     | 特大見出し    |
| `## Heading`    | 大見出し      |
| `### Heading`   | 中見出し      |
|  #### Heading   | 小見出し      |
|  ##### Heading  | 特小見出し　　|
|  ###### Heading | 極小見出し    |
| `**Bold**`      | 太字        |
| `*Italic*`      | 斜体        |
| `~~Strike~~`    | 打ち消し      |
| `` `Code` ``    | インラインコード  |
| `> Quote`       | 引用        |
| `- List`        | 箇条書き      |
| `- [ ] Task`    | 未完了チェック   |
| `- [x] Task`    | 完了チェック    |
| `[Link](URL)`   | クリック可能リンク |
| ` ```code``` `  | コードブロック   |

---

# Demo

入力：

````markdown id="61vskm"
# Google Sheets Markdown Renderer

## Features

**Bold Text**

*Italic Text*

~~Strike~~

`const x = 1`

> Quote

- List Item

- [ ] TODO

- [x] DONE

[Google](https://google.com)

```js
function hello() {
  console.log("Hello");
}
```
````

↓

Google Sheets上で自動描画。

---

# Installation

## 1. Open Google Sheets

新規または既存のGoogleスプレッドシートを開きます。

---

## 2. Open Apps Script

メニュー：

```text id="g3v37n"
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

```text id="wsvu4x"
▶ 実行
```

を押して認証します。

Googleアカウント認証を許可してください。

---

# Usage

セルにMarkdownを書くだけです。

例：

```markdown id="dvm3bj"
**Hello World**
```

編集完了後、自動で太字へ変換されます。

---

# Menu

シート上部に：

```text id="d6y69g"
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

---

# Code Block

コードブロック対応。

例：

````markdown id="2k9ndm"
```javascript
const hello = "world";
```
````

↓

等幅フォント + ダーク背景で表示。

---

# Technical Details

* Google Apps Script
* RichTextValue API
* onEdit Trigger
* Markdown Tokenizer
* Rich Text Renderer
* Real-time Rendering Engine

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

## Real-time Rendering

セル編集後、自動でMarkdownを変換。

---

# Limitations

現在未対応：

* テーブル
* HTML埋め込み
* 画像
* シンタックスハイライト
* ネストリスト
* Obsidian拡張記法

---

# Roadmap

予定機能：

* シンタックスハイライト
* Markdown Export
* HTML Export
* PDF Export
* Obsidian Theme
* Notion Theme
* Discord Markdown
* Side Preview
* Live Preview
* Custom CSS
* Multi Theme
* Auto Table Rendering

---

# License

MIT License

自由に改造・再配布可能です。

---

# Author

Novel Star
