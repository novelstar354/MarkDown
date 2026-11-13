# Google Sheets Markdown Renderer

高機能なGoogle Apps Script製Markdownレンダラー。

GoogleスプレッドシートのセルにMarkdownを書くだけで、自動的にRich Textへ変換します。

軽量・シンプルな構成で、インストール不要。Google Apps Scriptだけで動作します。

---

# Features

- リアルタイムMarkdown変換
- リッチテキスト描画
- H1〜H6見出し
- 太字・斜体・取り消し線
- インラインコード
- コードブロック
- 引用表示
- 箇条書き
- 番号付きリスト
- チェックボックス
- ネストリスト
- Markdownリンク
- Markdownテーブル風表示
- 水平線
- ダークテーマ
- ライトテーマ
- 複数セルの一括変換
- 選択範囲の再変換
- Markdown原文の保存
- Markdown原文への復元
- セル幅の自動調整
- セル高さの自動調整
- テキスト折り返し設定
- シート全体の一括処理

---

# Supported Markdown

| Markdown | Result |
|---|---|
| `# Heading` | H1・特大見出し |
| `## Heading` | H2・大見出し |
| `### Heading` | H3・中見出し |
| `#### Heading` | H4・小見出し |
| `##### Heading` | H5・特小見出し |
| `###### Heading` | H6・極小見出し |
| `**Bold**` | 太字 |
| `__Bold__` | 太字 |
| `*Italic*` | 斜体 |
| `_Italic_` | 斜体 |
| `~~Strike~~` | 取り消し線 |
| `` `Code` `` | インラインコード |
| `> Quote` | 引用 |
| `- List` | 箇条書き |
| `1. List` | 番号付きリスト |
| `- [ ] Task` | 未完了チェック |
| `- [x] Task` | 完了チェック |
| `[Link](https://example.com)` | クリック可能リンク |
| `---` | 水平線 |
| ` ```code ``` ` | コードブロック |

## Tables

Markdownのテーブル記法にも対応しています。

```markdown
| Name | Value |
|---|---|
| Apple | 100 |
| Orange | 200 |
```

セル内で区切り文字を使って表形式に表示します。

※独立したスプレッドシートの複数セルに分割する機能ではありません。

---

# Demo

入力：

```markdown
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

```javascript
function hello() {
  console.log("Hello");
}
```
```

↓

Google Sheets上で自動描画。

---

# Installation

## 1. Open Google Sheets

新規または既存のGoogleスプレッドシートを開きます。

---

## 2. Open Apps Script

メニュー：

```text
拡張機能 → Apps Script
```

---

## 3. Paste Script

`Code.gs` の内容をすべて削除し、Markdown Rendererのスクリプトを貼り付けます。

---

## 4. Save

保存ボタンを押します。

---

## 5. Initialize

スプレッドシートを再読み込みします。

初回は必要に応じて認証を行います。

---

# Usage

セルにMarkdownを書くだけです。

例：

```markdown
**Hello World**
```

編集後、自動的に太字へ変換されます。

複数セルをまとめて貼り付けた場合も変換できます。

---

# Menu

シート上部に `Markdown` メニューが追加されます。

## Available Actions

| Menu | Description |
|---|---|
| 全再変換 | 全シートのMarkdownを再描画 |
| 選択セルを再変換 | 選択範囲を再描画 |
| Markdownを復元（選択セル） | 選択範囲を原文に戻す |
| Markdownを復元（シート全体） | 保存された原文を復元 |
| ダークテーマ ON/OFF | テーマ切り替え |

## Cell Size Auto Resize

| Menu | Description |
|---|---|
| 選択セルの幅・高さ | 選択範囲の行・列を調整 |
| 選択列の幅 | 選択列の幅を調整 |
| 選択行の高さ | 選択行の高さを調整 |
| シート全体の幅・高さ | 全体を調整 |
| シート全体の列幅 | 全列を調整 |
| シート全体の行高さ | 全行を調整 |

## Text Wrapping

- 折り返しを有効化
- 折り返しを解除

---

# Dark Theme

ダークテーマ対応。

- 背景色自動変更
- 文字色最適化
- コードブロック背景色変更
- 引用文字色変更
- テーブル風表示の背景色変更

ライトテーマにも対応しています。

---

# Code Block

コードブロック対応。

例：

````markdown
```javascript
const hello = "world";

function test() {
  return hello;
}
```
````

表示：

- Courier New等幅フォント
- コード背景色
- コード文字色

※現バージョンでは言語別のシンタックスハイライトはありません。

---

# Markdown Restore

Markdownの原文を非表示の `_MD_SOURCE` シートに保存します。

そのため、変換後でも保存されている原文に戻せます。

- 選択セルの復元
- シート全体の復元

注意：変換前から存在するセルや、原文保存前に編集されたセルは復元できない場合があります。

---

# Technical Details

- Google Apps Script
- RichTextValue API
- onEdit Trigger
- Markdown Tokenizer
- Rich Text Renderer
- Real-time Rendering Engine
- Document Properties
- Hidden Source Storage

---

# Advanced Features

## Token Based Rendering

Markdownをトークンに分解して描画します。

- 文字位置の管理
- 複数装飾の混在
- リンク範囲の管理
- リッチテキストの生成

## Real-time Rendering

セル編集後、`onEdit` によって自動変換します。

## Multi-cell Rendering

複数セルへの貼り付けにも対応します。

## Original Text Storage

変換前のMarkdownを別シートに保存します。

## Theme Engine

ライト・ダークの2種類のテーマを切り替えられます。

---

# Limitations

現在の制限：

- HTML埋め込み
- 画像の直接描画
- 言語別シンタックスハイライト
- Obsidian拡張記法
- CSSによる自由な装飾
- 本格的な表のセル分割
- 完全なMarkdown仕様への対応
- Google SheetsのUndoとの完全な互換性

---

# Roadmap

今後の拡張予定：

- シンタックスハイライト
- Markdown Export
- HTML Export
- PDF Export
- Obsidian Theme
- Notion Theme
- Discord Markdown
- Side Preview
- Live Preview
- Custom Theme
- Multi Theme
- Advanced Table Rendering
- Image Rendering
- Advanced List Rendering
- Markdown Editor
- Custom Style Settings

---

# License

MIT License

自由に改造・再配布可能です。

---

# Author

Novel Star
