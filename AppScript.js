function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Markdown")
    .addItem("全再変換", "renderMarkdown")
    .addToUi();
}

/**
 * リアルタイム変換
 */
function onEdit(e) {

  const cell = e.range;
  const value = e.value;

  if (!value || typeof value !== "string") return;

  applyMarkdown(cell, value);
}

/**
 * 全セル再変換
 */
function renderMarkdown() {

  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();

  for (let r = 0; r < values.length; r++) {
    for (let c = 0; c < values[r].length; c++) {

      const value = values[r][c];

      if (!value || typeof value !== "string") continue;

      applyMarkdown(
        range.getCell(r + 1, c + 1),
        value
      );
    }
  }
}

/**
 * Markdown適用
 */
function applyMarkdown(cell, original) {

  let text = original;

  const styles = [];

  function pushStyle(start, end, style) {
    styles.push({ start, end, style });
  }

  // ===== 表示変換 =====

  text = text
    .replace(/^### /gm, "")
    .replace(/^## /gm, "")
    .replace(/^# /gm, "")
    .replace(/^> /gm, "")
    .replace(/^- \[ \] /gm, "☐ ")
    .replace(/^- \[x\] /gim, "☑ ")
    .replace(/^- /gm, "• ")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1");

  const builder = SpreadsheetApp.newRichTextValue()
    .setText(text);

  // ===== 見出し =====

  if (original.startsWith("# ")) {
    pushStyle(
      0,
      text.length,
      SpreadsheetApp.newTextStyle()
        .setBold(true)
        .setFontSize(20)
        .build()
    );
  }

  if (original.startsWith("## ")) {
    pushStyle(
      0,
      text.length,
      SpreadsheetApp.newTextStyle()
        .setBold(true)
        .setFontSize(17)
        .build()
    );
  }

  if (original.startsWith("### ")) {
    pushStyle(
      0,
      text.length,
      SpreadsheetApp.newTextStyle()
        .setBold(true)
        .setFontSize(15)
        .build()
    );
  }

  // ===== 太字 =====

  applyRegexStyle(
    original,
    /\*\*(.*?)\*\*/g,
    builder,
    SpreadsheetApp.newTextStyle()
      .setBold(true)
      .build()
  );

  // ===== 斜体 =====

  applyRegexStyle(
    original,
    /\*(.*?)\*/g,
    builder,
    SpreadsheetApp.newTextStyle()
      .setItalic(true)
      .build()
  );

  // ===== 打ち消し =====

  applyRegexStyle(
    original,
    /~~(.*?)~~/g,
    builder,
    SpreadsheetApp.newTextStyle()
      .setStrikethrough(true)
      .build()
  );

  // ===== code =====

  applyRegexStyle(
    original,
    /`(.*?)`/g,
    builder,
    SpreadsheetApp.newTextStyle()
      .setFontFamily("Courier New")
      .setBackgroundColor("#eeeeee")
      .build()
  );

  // ===== 引用 =====

  if (original.startsWith("> ")) {

    builder.setTextStyle(
      0,
      text.length,
      SpreadsheetApp.newTextStyle()
        .setItalic(true)
        .setForegroundColor("#666666")
        .build()
    );
  }

  // ===== リンク =====

  const linkRegex = /\[(.*?)\]\((.*?)\)/g;

  let match;

  while ((match = linkRegex.exec(original)) !== null) {

    const label = match[1];
    const url = match[2];

    const visibleBefore = original
      .substring(0, match.index)
      .replace(/\*\*|\*|~~|`|# |## |### |> |- |\[ |\[x\]|\[(.*?)\]\((.*?)\)/g, "");

    const start = visibleBefore.length;

    builder.setLinkUrl(
      start,
      start + label.length,
      url
    );
  }

  // ===== スタイル適用 =====

  styles.forEach(s => {
    try {
      builder.setTextStyle(s.start, s.end, s.style);
    } catch(e){}
  });

  cell.setRichTextValue(builder.build());
}

/**
 * regexスタイル適用
 */
function applyRegexStyle(original, regex, builder, style) {

  let match;

  while ((match = regex.exec(original)) !== null) {

    const content = match[1];

    const before = original.substring(0, match.index);

    const visibleBefore = before
      .replace(/\*\*|\*|~~|`|# |## |### |> |- |\[ |\[x\]/g, "");

    const start = visibleBefore.length;

    try {
      builder.setTextStyle(
        start,
        start + content.length,
        style
      );
    } catch(e){}
  }
}
