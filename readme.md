
/* =========================================================
 * Markdown Formatter PRO
 * Google Apps Script
 * Version 2.0
 * ========================================================= */

const MD_CONFIG = {
  DISABLED_SHEET: "_MD_DISABLED",
  SOURCE_SHEET: "_MD_SOURCE",
  INLINE_CODE_BG: "#eeeeee",
  ACCENT: "#4285f4",
  LINK: "#1155cc",

  DARK: {
    BG: "#111111",
    TEXT: "#eeeeee",
    CODE_TEXT: "#dcdcdc",
    CODE_BG: "#202020",
    QUOTE: "#aaaaaa",
    QUOTE_BAR: "#6699ff",
    TABLE_BG: "#252525",
    HEADER_BG: "#303030",
    HR: "#666666"
  },

  LIGHT: {
    BG: null,
    TEXT: "#222222",
    CODE_TEXT: "#222222",
    CODE_BG: "#eeeeee",
    QUOTE: "#666666",
    QUOTE_BAR: "#4285f4",
    TABLE_BG: "#f1f3f4",
    HEADER_BG: "#e8eaed",
    HR: "#999999"
  },

  HEADER_SIZES: {
    1: 26,
    2: 22,
    3: 18,
    4: 16,
    5: 14,
    6: 12
  }
};

/* =========================================================
 * MENU
 * ========================================================= */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Markdown")
    .addItem("全再変換", "renderMarkdown")
    .addItem("選択セルを再変換", "renderSelectedMarkdown")
    .addSeparator()
    .addItem("Markdown変換を無効化（選択セル）", "disableMarkdownSelected")
    .addItem("Markdown変換を有効化（選択セル）", "enableMarkdownSelected")
    .addSeparator()
    .addItem("Markdownを復元（選択セル）", "restoreSelectedMarkdown")
    .addItem("Markdownを復元（シート全体）", "restoreAllMarkdown")
    .addSeparator()
    .addItem("ダークテーマ ON/OFF", "toggleDarkTheme")
    .addSeparator()
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu("セルサイズ自動調整")
        .addItem("選択セルの幅・高さ", "autoResizeSelected")
        .addItem("選択列の幅", "autoResizeSelectedColumns")
        .addItem("選択行の高さ", "autoResizeSelectedRows")
        .addSeparator()
        .addItem("シート全体の幅・高さ", "autoResizeAll")
        .addItem("シート全体の列幅", "autoResizeAllColumns")
        .addItem("シート全体の行高さ", "autoResizeAllRows")
    )
    .addSeparator()
    .addItem("折り返しを有効化", "enableWrapSelected")
    .addItem("折り返しを解除", "disableWrapSelected")
    .addToUi();
}

/* =========================================================
 * SOURCE STORAGE
 * Markdown原文を非表示シートに保存
 * ========================================================= */

function getSourceSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(MD_CONFIG.SOURCE_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(MD_CONFIG.SOURCE_SHEET);
    sheet.getRange(1, 1, 1, 4).setValues([
      ["SheetID", "Row", "Column", "Original"]
    ]);
    sheet.hideSheet();
  }

  return sheet;
}

function sourceKey(sheetId, row, col) {
  return sheetId + "|" + row + "|" + col;
}

function loadSourceMap() {
  const sheet = getSourceSheet();
  const lastRow = sheet.getLastRow();
  const map = new Map();

  if (lastRow < 2) return map;

  const data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();

  data.forEach((r, i) => {
    map.set(sourceKey(r[0], r[1], r[2]), {
      row: i + 2,
      value: r[3]
    });
  });

  return map;
}

function saveOriginal(sheet, row, col, value, map) {
  const source = getSourceSheet();
  const key = sourceKey(sheet.getSheetId(), row, col);
  const existing = map.get(key);

  if (existing) {
    source.getRange(existing.row, 4).setValue(value);
  } else {
    const newRow = source.getLastRow() + 1;

    source.getRange(newRow, 1, 1, 4).setValues([[
      sheet.getSheetId(),
      row,
      col,
      value
    ]]);

    map.set(key, {
      row: newRow,
      value: value
    });
  }
}

function deleteOriginal(sheet, row, col, map) {
  const key = sourceKey(sheet.getSheetId(), row, col);
  const item = map.get(key);

  if (!item) return;

  getSourceSheet().getRange(item.row, 1, 1, 4).clearContent();
  map.delete(key);
}

/* =========================================================
 * THEME
 * ========================================================= */

function isDarkTheme() {
  return PropertiesService.getDocumentProperties()
    .getProperty("MD_DARK") === "true";
}

function getTheme() {
  return isDarkTheme() ? MD_CONFIG.DARK : MD_CONFIG.LIGHT;
}

function toggleDarkTheme() {
  const props = PropertiesService.getDocumentProperties();
  const current = isDarkTheme();

  props.setProperty("MD_DARK", String(!current));

  renderMarkdown();

  SpreadsheetApp.getActiveSpreadsheet().toast(
    current ? "Light Theme ON" : "Dark Theme ON"
  );
}

/* =========================================================
 * EDIT HOOK
 * 複数セルの貼り付けにも対応
 * ========================================================= */

function onEdit(e) {
  if (!e || !e.range) return;

  const range = e.range;
  const sheet = range.getSheet();

  if (
    sheet.getName() === MD_CONFIG.SOURCE_SHEET ||
    sheet.getName() === MD_CONFIG.DISABLED_SHEET
  ) return;

  const map = loadSourceMap();
  const disabled = loadDisabledMap();
  const values = range.getValues();

  for (let r = 0; r < values.length; r++) {
    for (let c = 0; c < values[r].length; c++) {
      const cell = range.getCell(r + 1, c + 1);
      const value = values[r][c];

      const key = sourceKey(
        sheet.getSheetId(),
        cell.getRow(),
        cell.getColumn()
      );

      if (typeof value !== "string" || value === "") {
        deleteOriginal(
          sheet,
          cell.getRow(),
          cell.getColumn(),
          map
        );
        continue;
      }

      saveOriginal(
        sheet,
        cell.getRow(),
        cell.getColumn(),
        value,
        map
      );

      // 無効化されているセルは変換しない
      if (disabled.has(key)) continue;

      applyMarkdown(cell, value);
    }
  }
}

/* =========================================================
 * FULL RENDER
 * ========================================================= */

function renderMarkdown() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const map = loadSourceMap();
  const disabled = loadDisabledMap();
  ss.getSheets().forEach(sheet => {
    if (
  sheet.getName() === MD_CONFIG.SOURCE_SHEET ||
  sheet.getName() === MD_CONFIG.DISABLED_SHEET
) return;
    const range = sheet.getDataRange();
    const values = range.getValues();

    for (let r = 0; r < values.length; r++) {
      for (let c = 0; c < values[r].length; c++) {
        const cell = range.getCell(r + 1, c + 1);
        const value = values[r][c];

        if (typeof value !== "string" || value === "") continue;

        const key = sourceKey(
          sheet.getSheetId(),
          cell.getRow(),
          cell.getColumn()
        );

        const original = map.has(key)
          ? map.get(key).value
          : value;

        if (!map.has(key)) {
          saveOriginal(
            sheet,
            cell.getRow(),
            cell.getColumn(),
            original,
            map
          );
        }
        if (disabled.has(key)) continue;
        applyMarkdown(cell, original);
      }
    }
  });

  ss.toast("Markdown Render Complete");
}

/* =========================================================
 * SELECTED RENDER
 * ========================================================= */

function renderSelectedMarkdown() {
  const range = SpreadsheetApp.getActiveRange();
  if (!range) return;

  const sheet = range.getSheet();

  if (
    sheet.getName() === MD_CONFIG.SOURCE_SHEET ||
    sheet.getName() === MD_CONFIG.DISABLED_SHEET
  ) return;

  const map = loadSourceMap();
  const disabled = loadDisabledMap();
  const values = range.getValues();

  for (let r = 0; r < values.length; r++) {
    for (let c = 0; c < values[r].length; c++) {
      const cell = range.getCell(r + 1, c + 1);
      const value = values[r][c];

      if (typeof value !== "string" || !value) continue;

      const key = sourceKey(
        sheet.getSheetId(),
        cell.getRow(),
        cell.getColumn()
      );

      if (disabled.has(key)) continue;

      const original = map.has(key)
        ? map.get(key).value
        : value;

      if (!map.has(key)) {
        saveOriginal(
          sheet,
          cell.getRow(),
          cell.getColumn(),
          original,
          map
        );
      }

      applyMarkdown(cell, original);
    }
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Selected Render Complete"
  );
}

/* =========================================================
 * RESTORE MARKDOWN
 * ========================================================= */

function restoreSelectedMarkdown() {
  const range = SpreadsheetApp.getActiveRange();
  if (!range) return;

  const sheet = range.getSheet();
  const map = loadSourceMap();

  for (let r = 0; r < range.getNumRows(); r++) {
    for (let c = 0; c < range.getNumColumns(); c++) {
      const cell = range.getCell(r + 1, c + 1);
      const key = sourceKey(
        sheet.getSheetId(),
        cell.getRow(),
        cell.getColumn()
      );

      if (!map.has(key)) continue;

      cell.setValue(map.get(key).value);
      cell.setNote("");
      deleteOriginal(sheet, cell.getRow(), cell.getColumn(), map);
    }
  }

  SpreadsheetApp.getActiveSpreadsheet().toast("Markdown Restored");
}

function restoreAllMarkdown() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const map = loadSourceMap();

  const source = getSourceSheet();
  const data = source.getDataRange().getValues();

  const sheetMap = new Map(
    ss.getSheets().map(s => [String(s.getSheetId()), s])
  );

  for (let i = 1; i < data.length; i++) {
    const [sheetId, row, col, original] = data[i];

    if (original === "" || original === null) continue;

    const sheet = sheetMap.get(String(sheetId));
    if (!sheet) continue;

    const cell = sheet.getRange(row, col);
    cell.setValue(original);
    cell.setNote("");
  }

  if (source.getLastRow() > 1) {
    source.getRange(
      2, 1, source.getLastRow() - 1, 4
    ).clearContent();
  }

  ss.toast("All Markdown Restored");
}

/* =========================================================
 * HEADER STYLE
 * ========================================================= */

function getHeaderStyle(level) {
  return SpreadsheetApp.newTextStyle()
    .setBold(true)
    .setFontSize(MD_CONFIG.HEADER_SIZES[level] || 12)
    .build();
}

/* =========================================================
 * INLINE PARSER
 * ========================================================= */

function parseInline(text) {
  const regex =
    /(\*\*(.+?)\*\*)|(__(.+?)__)|(\*(.+?)\*)|(_(.+?)_)|(~~(.+?)~~)|(`([^`]+?)`)|(\[([^\]]+?)\]\((https?:\/\/[^ )]+)\))/g;

  const tokens = [];
  let last = 0;
  let m;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) {
      tokens.push({
        type: "text",
        text: text.slice(last, m.index)
      });
    }

    if (m[1]) {
      tokens.push({ type: "bold", text: m[2] });
    } else if (m[3]) {
      tokens.push({ type: "bold", text: m[4] });
    } else if (m[5]) {
      tokens.push({ type: "italic", text: m[6] });
    } else if (m[7]) {
      tokens.push({ type: "italic", text: m[8] });
    } else if (m[9]) {
      tokens.push({ type: "strike", text: m[10] });
    } else if (m[11]) {
      tokens.push({ type: "code", text: m[12] });
    } else if (m[13]) {
      tokens.push({
        type: "link",
        text: m[14],
        url: m[15]
      });
    }

    last = regex.lastIndex;
  }

  if (last < text.length) {
    tokens.push({
      type: "text",
      text: text.slice(last)
    });
  }

  return tokens;
}

/* =========================================================
 * TEXT STYLE HELPER
 * ========================================================= */

function addStyle(styles, start, end, style, url) {
  if (end <= start) return;

  styles.push({
    start,
    end,
    style,
    url: url || null
  });
}

/* =========================================================
 * MARKDOWN RENDER ENGINE
 * ========================================================= */

function applyMarkdown(cell, original) {
  if (typeof original !== "string") return;

  const theme = getTheme();
  const lines = original.replace(/\r\n?/g, "\n").split("\n");

  const output = [];
  const styles = [];

  let index = 0;
  let inCode = false;
  let codeLines = [];

  function pushLine(text, options = {}) {
    const start = index;
    output.push(text);

    const end = start + text.length;

    if (options.style) {
      addStyle(styles, start, end, options.style);
    }

    if (options.bg) {
      addStyle(
        styles,
        start,
        end,
        SpreadsheetApp.newTextStyle()
          .setBackgroundColor(options.bg)
          .build()
      );
    }

    index = end + 1;
  }

  function renderInline(line, options = {}) {
    const tokens = parseInline(line);
    const visible = tokens.map(t => t.text).join("");
    const start = index;

    output.push(visible);

    let local = start;

    tokens.forEach(t => {
      const end = local + t.text.length;
      const base = SpreadsheetApp.newTextStyle();

      switch (t.type) {
        case "bold":
          addStyle(styles, local, end, base.setBold(true).build());
          break;

        case "italic":
          addStyle(styles, local, end, base.setItalic(true).build());
          break;

        case "strike":
          addStyle(styles, local, end, base.setStrikethrough(true).build());
          break;

        case "code":
          addStyle(
            styles,
            local,
            end,
            base
              .setFontFamily("Courier New")
              .setForegroundColor(theme.CODE_TEXT)
              .setBackgroundColor(theme.CODE_BG)
              .build()
          );
          break;

        case "link":
          addStyle(
            styles,
            local,
            end,
            base
              .setForegroundColor(MD_CONFIG.LINK)
              .setUnderline(true)
              .build(),
            t.url
          );
          break;
      }

      local = end;
    });

    if (options.style) {
      addStyle(styles, start, local, options.style);
    }

    if (options.bg) {
      addStyle(
        styles,
        start,
        local,
        SpreadsheetApp.newTextStyle()
          .setBackgroundColor(options.bg)
          .build()
      );
    }

    if (options.quote) {
      addStyle(
        styles,
        start,
        local,
        SpreadsheetApp.newTextStyle()
          .setItalic(true)
          .setForegroundColor(theme.QUOTE)
          .build()
      );
    }

    index = local + 1;
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    /* CODE BLOCK */

    if (line.startsWith("```")) {
      if (!inCode) {
        inCode = true;
        codeLines = [];
      } else {
        const code = codeLines.join("\n");
        const start = index;

        output.push(code);

        addStyle(
          styles,
          start,
          start + code.length,
          SpreadsheetApp.newTextStyle()
            .setFontFamily("Courier New")
            .setForegroundColor(theme.CODE_TEXT)
            .setBackgroundColor(theme.CODE_BG)
            .build()
        );

        index = start + code.length + 1;
        inCode = false;
        codeLines = [];
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    /* HEADINGS */

    const heading = line.match(/^(#{1,6})\s+(.*)$/);

    if (heading) {
      const level = heading[1].length;
      renderInline(heading[2], {
        style: getHeaderStyle(level)
      });
      continue;
    }

    /* HORIZONTAL RULE */

    if (/^(\*\s*){3,}$/.test(line) ||
        /^(-\s*){3,}$/.test(line) ||
        /^(_\s*){3,}$/.test(line)) {
      pushLine("━━━━━━━━━━━━━━━━━━━━", {
        style: SpreadsheetApp.newTextStyle()
          .setForegroundColor(theme.HR)
          .build()
      });
      continue;
    }

    /* BLOCKQUOTE */

    if (/^>\s?/.test(line)) {
      const quote = line.replace(/^>\s?/, "");
      renderInline("┃ " + quote, {
        quote: true
      });
      continue;
    }

    /* TABLE */

    if (line.includes("|") &&
        i + 1 < lines.length &&
        /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) &&
        lines[i + 1].includes("-")) {

      const headers = splitTableRow(line);
      const separator = lines[i + 1];

      const headerStart = index;
      const headerText = headers.join("   │   ");

      pushLine(headerText, {
        style: SpreadsheetApp.newTextStyle()
          .setBold(true)
          .build(),
        bg: theme.HEADER_BG
      });

      const headerEnd = headerStart + headerText.length;

      addStyle(
        styles,
        headerStart,
        headerEnd,
        SpreadsheetApp.newTextStyle()
          .setBackgroundColor(theme.HEADER_BG)
          .setBold(true)
          .build()
      );

      i++;

      while (i + 1 < lines.length &&
             lines[i + 1].includes("|")) {
        i++;

        const cells = splitTableRow(lines[i]);
        renderInline(cells.join("   │   "), {
          bg: theme.TABLE_BG
        });
      }

      continue;
    }

    /* CHECKBOX */

    const checkbox = line.match(/^(\s*)- \[([ xX])\] (.*)$/);

    if (checkbox) {
      const mark = checkbox[2].toLowerCase() === "x" ? "☑" : "☐";
      const indent = "　".repeat(Math.floor(checkbox[1].length / 2));
      renderInline(indent + mark + " " + checkbox[3]);
      continue;
    }

    /* UNORDERED LIST */

    const unordered = line.match(/^(\s*)[-*+] (.*)$/);

    if (unordered) {
      const indent = "　".repeat(Math.floor(unordered[1].length / 2));
      renderInline(indent + "• " + unordered[2]);
      continue;
    }

    /* ORDERED LIST */

    const ordered = line.match(/^(\s*)(\d+)[.)] (.*)$/);

    if (ordered) {
      const indent = "　".repeat(Math.floor(ordered[1].length / 2));
      renderInline(
        indent + ordered[2] + ". " + ordered[3]
      );
      continue;
    }

    /* NORMAL TEXT */

    renderInline(line);
  }

  /* UNFINISHED CODE BLOCK */

  if (inCode) {
    const code = codeLines.join("\n");
    const start = index;

    output.push(code);

    addStyle(
      styles,
      start,
      start + code.length,
      SpreadsheetApp.newTextStyle()
        .setFontFamily("Courier New")
        .setForegroundColor(theme.CODE_TEXT)
        .setBackgroundColor(theme.CODE_BG)
        .build()
    );
  }

  const text = output.join("\n");

  const builder = SpreadsheetApp.newRichTextValue()
    .setText(text);

  styles.forEach(s => {
    try {
      builder.setTextStyle(s.start, s.end, s.style);

      if (s.url) {
        builder.setLinkUrl(s.start, s.end, s.url);
      }
    } catch (err) {
      console.log(err);
    }
  });

  cell.setRichTextValue(builder.build());

  /* CELL BACKGROUND */

  if (isDarkTheme()) {
    cell.setBackground(theme.BG);
  } else {
    cell.setBackground(null);
  }

  cell.setWrap(false);
}

/* =========================================================
 * TABLE PARSER
 * ========================================================= */

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map(s => s.trim());
}


/* =========================================================
 * AUTO RESIZE PRO
 * ========================================================= */

// 設定
const MD_RESIZE_CONFIG = {
  MIN_COLUMN_WIDTH: 4,
  MIN_ROW_HEIGHT: 20,
  MAX_ROW_HEIGHT: 250,
  CHAR_WIDTH: 7.5,
  LINE_HEIGHT: 16,
  PADDING: 16
};

// セル内の表示文字列を取得
function getDisplayText(cell) {
  const rich = cell.getRichTextValue();

  if (rich) {
    return rich.getText() || "";
  }

  return String(cell.getDisplayValue() || "");
}



function calculateColumnWidth(text, fontSize) {
  const lines = String(text).split("\n");
  let maxWidth = 0;

  lines.forEach(line => {
    let width = 0;

    for (const char of line) {
      if (/[^\x00-\xff]/.test(char)) {
        // 全角文字
        width += fontSize * 1.0;
      } else {
        // 半角文字：できるだけ詰める
        width += fontSize * 0.48;
      }
    }

    maxWidth = Math.max(maxWidth, width);
  });

  // 左右の余白を最小限にする
  return Math.max(50, Math.ceil(maxWidth + 10));
}



// 列幅に合わせた行の高さを計算



function calculateRowHeight(text, columnWidth, fontSize) {
  return Math.ceil(fontSize * 1.35 + 1);
}




// 選択範囲のサイズ調整
function autoResizeSelected() {
  const range = SpreadsheetApp.getActiveRange();
  if (!range) return;

  resizeRangeByContent(range);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "セルサイズを調整しました"
  );
}

// 選択列
function autoResizeSelectedColumns() {
  const range = SpreadsheetApp.getActiveRange();
  if (!range) return;

  const sheet = range.getSheet();

  for (
    let col = range.getColumn();
    col < range.getColumn() + range.getNumColumns();
    col++
  ) {
    resizeColumnByContent(sheet, col);
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "文字量に応じて列幅を調整しました"
  );
}

// 選択行
function autoResizeSelectedRows() {
  const range = SpreadsheetApp.getActiveRange();
  if (!range) return;

  resizeRowsByContent(
    range.getSheet(),
    range.getRow(),
    range.getNumRows()
  );

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "文字量に応じて行高さを調整しました"
  );
}

// 範囲全体
function resizeRangeByContent(range) {
  const sheet = range.getSheet();

  for (
    let col = range.getColumn();
    col < range.getColumn() + range.getNumColumns();
    col++
  ) {
    resizeColumnByContent(sheet, col);
  }

  resizeRowsByContent(
    sheet,
    range.getRow(),
    range.getNumRows()
  );
}

// 列幅調整
function resizeColumnByContent(sheet, col) {
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const values = sheet.getRange(1, col, lastRow, 1);

  let maxWidth = MD_RESIZE_CONFIG.MIN_COLUMN_WIDTH;

  values.getRichTextValues().forEach((row, i) => {
    const cell = values.getCell(i + 1, 1);
    const text = getDisplayText(cell);
    if (!text) return;

    const fontSize = Number(cell.getFontSize()) || 10;

    maxWidth = Math.max(
      maxWidth,
      calculateColumnWidth(text, fontSize)
    );
  });

  sheet.setColumnWidth(col, maxWidth);
}

// 行高さ調整
function resizeRowsByContent(sheet, startRow, numRows) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const widths = [];

  for (let col = 1; col <= lastCol; col++) {
    widths[col] = sheet.getColumnWidth(col);
  }

  for (
    let row = startRow;
    row < startRow + numRows;
    row++
  ) {
    let maxHeight = MD_RESIZE_CONFIG.MIN_ROW_HEIGHT;

    for (let col = 1; col <= lastCol; col++) {
      const cell = sheet.getRange(row, col);
      const text = getDisplayText(cell);

      if (!text) continue;

      const fontSize = Number(cell.getFontSize()) || 10;

      maxHeight = Math.max(
        maxHeight,
        calculateRowHeight(
          text,
          widths[col],
          fontSize
        )
      );
    }

    sheet.setRowHeight(
      row,
      Math.min(maxHeight, MD_RESIZE_CONFIG.MAX_ROW_HEIGHT)
    );
  }
}

// シート全体
function autoResizeAll() {
  const sheet = SpreadsheetApp.getActiveSheet();

  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const lastRow = Math.max(sheet.getLastRow(), 1);

  resizeRangeByContent(
    sheet.getRange(1, 1, lastRow, lastCol)
  );

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "シート全体のセルサイズを調整しました"
  );
}

// 全列
function autoResizeAllColumns() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastCol = Math.max(sheet.getLastColumn(), 1);

  for (let col = 1; col <= lastCol; col++) {
    resizeColumnByContent(sheet, col);
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "全列の幅を調整しました"
  );
}

// 全行
function autoResizeAllRows() {
  const sheet = SpreadsheetApp.getActiveSheet();

  resizeRowsByContent(
    sheet,
    1,
    Math.max(sheet.getLastRow(), 1)
  );

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "全行の高さを調整しました"
  );
}


/* =========================================================
 * WRAP
 * ========================================================= */

function enableWrapSelected() {
  const range = SpreadsheetApp.getActiveRange();
  if (!range) return;

  range.setWrap(true);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "テキストの折り返しを有効にしました"
  );
}

function disableWrapSelected() {
  const range = SpreadsheetApp.getActiveRange();
  if (!range) return;

  range.setWrap(false);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "テキストの折り返しを解除しました"
  );
}

/* =========================================================
 * MARKDOWN ENABLE / DISABLE
 * ========================================================= */

// 無効セル保存シート
function getDisabledSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(MD_CONFIG.DISABLED_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(MD_CONFIG.DISABLED_SHEET);
    sheet.getRange(1, 1, 1, 3).setValues([
      ["SheetID", "Row", "Column"]
    ]);
    sheet.hideSheet();
  }

  return sheet;
}

// 無効セル一覧
function loadDisabledMap() {
  const sheet = getDisabledSheet();
  const lastRow = sheet.getLastRow();
  const map = new Set();

  if (lastRow < 2) return map;

  const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();

  data.forEach(r => {
    if (r[0] !== "" && r[1] !== "" && r[2] !== "") {
      map.add(sourceKey(r[0], r[1], r[2]));
    }
  });

  return map;
}

function disableMarkdownSelected() {
  const range = SpreadsheetApp.getActiveRange();
  if (!range) return;

  const sheet = range.getSheet();

  if (
    sheet.getName() === MD_CONFIG.SOURCE_SHEET ||
    sheet.getName() === MD_CONFIG.DISABLED_SHEET
  ) return;

  const storage = getDisabledSheet();
  const disabled = loadDisabledMap();
  const sourceMap = loadSourceMap();

  const values = [];

  for (let r = 0; r < range.getNumRows(); r++) {
    for (let c = 0; c < range.getNumColumns(); c++) {
      const row = range.getRow() + r;
      const col = range.getColumn() + c;

      const key = sourceKey(
        sheet.getSheetId(),
        row,
        col
      );

      if (!disabled.has(key)) {
        values.push([
          sheet.getSheetId(),
          row,
          col
        ]);

        disabled.add(key);
      }

      // 変換済みならMarkdown原文に戻す
      const original = sourceMap.get(key);

      if (original) {
        sheet.getRange(row, col).setValue(original.value);
      }
    }
  }

  if (values.length > 0) {
    storage.getRange(
      storage.getLastRow() + 1,
      1,
      values.length,
      3
    ).setValues(values);
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "選択セルのMarkdown変換を無効化しました"
  );
}

// 有効化
function enableMarkdownSelected() {
  const range = SpreadsheetApp.getActiveRange();
  if (!range) return;

  const sheet = range.getSheet();
  const storage = getDisabledSheet();

  const data = storage.getDataRange().getValues();
  const selected = new Set();

  for (let r = 0; r < range.getNumRows(); r++) {
    for (let c = 0; c < range.getNumColumns(); c++) {
      selected.add(
        sourceKey(
          sheet.getSheetId(),
          range.getRow() + r,
          range.getColumn() + c
        )
      );
    }
  }

  const keep = [data[0]];

  for (let i = 1; i < data.length; i++) {
    const key = sourceKey(data[i][0], data[i][1], data[i][2]);

    if (!selected.has(key)) {
      keep.push(data[i]);
    }
  }

  storage.clearContents();

  if (keep.length > 0) {
    storage.getRange(
      1, 1, keep.length, 3
    ).setValues(keep);
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "選択セルのMarkdown変換を有効化しました"
  );

  renderSelectedMarkdown();
}
