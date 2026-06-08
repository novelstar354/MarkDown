/**
 * =========================================================
 * Google Sheets Markdown Renderer - H1~H6 FULL Edition
 * =========================================================
 */

const MD_CONFIG = {
  INLINE_CODE_BG: "#eeeeee",
  DARK: {
    BG: "#111111",
    CODE_TEXT: "#dcdcdc",
    QUOTE: "#888888"
  },
  LIGHT: {
    BG: null,
    CODE_TEXT: "#222222",
    QUOTE: "#666666"
  }
};

/* =========================================================
 * MENU
 * ========================================================= */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Markdown")
    .addItem("全再変換", "renderMarkdown")
    .addItem("ダークテーマ ON/OFF", "toggleDarkTheme")
    .addToUi();
}

/* =========================================================
 * THEME
 * ========================================================= */

function toggleDarkTheme() {
  const props = PropertiesService.getDocumentProperties();
  const current = props.getProperty("MD_DARK") === "true";
  props.setProperty("MD_DARK", (!current).toString());

  SpreadsheetApp.getActiveSpreadsheet().toast(
    current ? "Light Theme ON" : "Dark Theme ON"
  );
}

/* =========================================================
 * EDIT HOOK
 * ========================================================= */

function onEdit(e) {
  if (!e || !e.range) return;

  const cell = e.range;
  const value = e.value;

  if (!value || typeof value !== "string") return;
  if (cell.getNote() === "MD_LOCK") return;

  applyMarkdown(cell, value);
}

/* =========================================================
 * FULL RENDER
 * ========================================================= */

function renderMarkdown() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();

  for (let r = 0; r < values.length; r++) {
    for (let c = 0; c < values[r].length; c++) {
      const value = values[r][c];
      if (typeof value !== "string" || !value) continue;

      applyMarkdown(range.getCell(r + 1, c + 1), value);
    }
  }

  SpreadsheetApp.getActiveSpreadsheet().toast("Markdown Render Complete");
}

/* =========================================================
 * HEADER STYLE (H1~H6)
 * ========================================================= */

function getHeaderStyle(level) {
  const sizes = {
    1: 26,
    2: 22,
    3: 18,
    4: 16,
    5: 14,
    6: 12
  };

  return SpreadsheetApp.newTextStyle()
    .setBold(true)
    .setFontSize(sizes[level] || 12)
    .build();
}

/* =========================================================
 * APPLY MARKDOWN
 * ========================================================= */

function applyMarkdown(cell, original) {
  cell.setNote("MD_LOCK");

  try {
    const isDark =
      PropertiesService.getDocumentProperties().getProperty("MD_DARK") === "true";

    const theme = isDark ? MD_CONFIG.DARK : MD_CONFIG.LIGHT;

    const lines = original.split("\n");

    const styles = [];
    const renderedLines = [];

    let index = 0;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      let headingStyle = null;
      let isQuote = false;

      /* =========================
       * CODE BLOCK
       * ========================= */
      if (line.startsWith("```")) {
        const code = [];
        i++;

        while (i < lines.length && !lines[i].startsWith("```")) {
          code.push(lines[i]);
          i++;
        }

        const text = code.join("\n");
        renderedLines.push(text);

        styles.push({
          start: index,
          end: index + text.length,
          style: SpreadsheetApp.newTextStyle()
            .setFontFamily("Courier New")
            .setForegroundColor(theme.CODE_TEXT)
            .build()
        });

        index += text.length + 1;
        continue;
      }

      /* =========================
       * HEADERS H1~H6
       * ========================= */
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        line = headerMatch[2];
        headingStyle = getHeaderStyle(level);
      }

      /* =========================
       * QUOTE
       * ========================= */
      if (line.startsWith("> ")) {
        line = line.slice(2);
        isQuote = true;
      }

      /* =========================
       * LIST / CHECKBOX
       * ========================= */
      line = line
        .replace(/^- \[ \] /g, "☐ ")
        .replace(/^- \[[xX]\] /g, "☑ ")
        .replace(/^- /g, "• ");

      /* =========================
       * INLINE PARSER
       * ========================= */
      const regex =
        /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(~~(.+?)~~)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;

      const tokens = [];
      let last = 0;
      let m;

      while ((m = regex.exec(line)) !== null) {
        if (m.index > last) {
          tokens.push({ type: "text", text: line.slice(last, m.index) });
        }

        if (m[1]) tokens.push({ type: "bold", text: m[2] });
        else if (m[3]) tokens.push({ type: "italic", text: m[4] });
        else if (m[5]) tokens.push({ type: "strike", text: m[6] });
        else if (m[7]) tokens.push({ type: "code", text: m[8] });
        else if (m[9]) tokens.push({ type: "link", text: m[10], url: m[11] });

        last = regex.lastIndex;
      }

      if (last < line.length) {
        tokens.push({ type: "text", text: line.slice(last) });
      }

      const visible = tokens.map(t => t.text).join("");
      renderedLines.push(visible);

      let local = index;

      tokens.forEach(t => {
        const start = local;
        const end = local + t.text.length;

        const base = SpreadsheetApp.newTextStyle();

        switch (t.type) {
          case "bold":
            styles.push({ start, end, style: base.setBold(true).build() });
            break;

          case "italic":
            styles.push({ start, end, style: base.setItalic(true).build() });
            break;

          case "strike":
            styles.push({ start, end, style: base.setStrikethrough(true).build() });
            break;

          case "code":
            styles.push({
              start,
              end,
              style: base
                .setFontFamily("Courier New")
                .setBackgroundColor(MD_CONFIG.INLINE_CODE_BG)
                .build()
            });
            break;

          case "link":
            styles.push({
              start,
              end,
              style: base.setForegroundColor("#1155cc").setUnderline(true).build(),
              link: t.url
            });
            break;
        }

        local += t.text.length;
      });

      /* =========================
       * QUOTE STYLE
       * ========================= */
      if (isQuote) {
        styles.push({
          start: index,
          end: index + visible.length,
          style: SpreadsheetApp.newTextStyle()
            .setItalic(true)
            .setForegroundColor(theme.QUOTE)
            .build()
        });
      }

      /* =========================
       * HEADER STYLE APPLY
       * ========================= */
      if (headingStyle) {
        styles.push({
          start: index,
          end: index + visible.length,
          style: headingStyle
        });
      }

      index += visible.length + 1;
    }

    const text = renderedLines.join("\n");

    const builder = SpreadsheetApp.newRichTextValue().setText(text);

    styles.forEach(s => {
      try {
        builder.setTextStyle(s.start, s.end, s.style);
        if (s.link) builder.setLinkUrl(s.start, s.end, s.link);
      } catch (e) {}
    });

    cell.setRichTextValue(builder.build());

    if (isDark) {
      cell.setBackground(theme.BG);
    } else {
      cell.setBackground(null);
    }

  } finally {
    Utilities.sleep(20);
    cell.setNote("");
  }
}
