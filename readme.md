# Google Sheets Markdown Renderer

GoogleスプレッドシートでMarkdownをリアルタイム変換できるApps Scriptです。

入力したMarkdownを、自動でリッチテキスト表示へ変換します。

---

# 機能

## 対応Markdown

| Markdown     | 表示        |
| ------------ | --------- |
| `# 見出し`      | 大見出し      |
| `## 見出し2`    | 中見出し      |
| `### 見出し3`   | 小見出し      |
| `**太字**`     | 太字        |
| `*斜体*`       | 斜体        |
| `~~削除~~`     | 打ち消し      |
| `` `code` `` | コード表示     |
| `> 引用`       | 引用スタイル    |
| `- リスト`      | 箇条書き      |
| `- [ ]`      | チェックボックス  |
| `- [x]`      | 完了チェック    |
| `[リンク](URL)` | クリック可能リンク |

---

# デモ

入力：

```markdown
# タイトル

## サブタイトル

**太字**

*斜体*

~~削除~~

`const x = 1`

> 引用

- リスト

- [ ] 未完了

- [x] 完了

[Google](https://google.com)
```

↓

自動でMarkdownスタイルへ変換。

---

# インストール方法

## 1. Google Sheetsを開く

新規または既存のスプレッドシートを開きます。

---

## 2. Apps Scriptを開く

メニュー：

```text
拡張機能 → Apps Script
```

---

## 3. コードを貼る

`Code.gs` の中身をすべて削除し、スクリプトを貼り付けます。

---

## 4. 保存

保存ボタンを押します。

---

## 5. 初回実行

Apps Script画面で：

```text
▶ 実行
```

を押して認証します。

Googleアカウント認証が表示されるので許可してください。

---

# 使い方

セルにMarkdownを書くだけです。

例：

```markdown
**Hello**
```

Enterを押すと、自動で太字になります。

---

# メニュー

シート上部に：

```text
Markdown
```

メニューが追加されます。

## 全再変換

```text
Markdown → 全再変換
```

すべてのセルを再変換します。

---

# 技術仕様

* Google Apps Script
* RichTextValue API
* onEdit Trigger
* Real-time Markdown Rendering

---

# 注意

## 一部未対応

現在未対応：

* テーブル
* コードブロック
* シンタックスハイライト
* 画像
* HTML埋め込み

---

# 今後追加予定

* Discord風Markdown
* Obsidian風テーマ
* Notion風表示
* コードブロック
* シンタックスハイライト
* サイドバープレビュー
* ダークモード
* Markdown Export

---

# ライセンス

MIT License

自由に改造・再配布可能です。

---

# 作者

Novel Star
