/**
 * =========================================================
 * Google Sheets Markdown Renderer - Stable Full Edition
 * =========================================================
 */

const MD_CONFIG = {
  INLINE_CODE_BG: "#eeeeee",
  DARK: {
    BG: "#111111",
    TEXT: "#eeeeee",
    CODE_BG: "#1e1e1e",
    CODE_TEXT: "#dcdcdc",
    QUOTE: "#888888"
  },
  LIGHT: {
    BG: null,
    TEXT: null,
    CODE_BG: "#f5f5f5",
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
 * DARK MODE
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
  if (cell.getNote() === "__MD_RENDERING__") return;

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
      if (!value || typeof value !== "string") continue;

      applyMarkdown(range.getCell(r + 1, c + 1), value);
    }
  }

  SpreadsheetApp.getActiveSpreadsheet().toast("Markdown Render Complete");
}

/* =========================================================
 * APPLY MARKDOWN
 * ========================================================= */

function applyMarkdown(cell, original) {
  try {
    cell.setNote("__MD_RENDERING__");

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

      // CODE BLOCK
      if (line.startsWith("```")) {
        let code = [];
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

      // HEADERS
      if (line.startsWith("# ")) {
        line = line.replace("# ", "");
        headingStyle = SpreadsheetApp.newTextStyle().setBold(true).setFontSize(22).build();
      } else if (line.startsWith("## ")) {
        line = line.replace("## ", "");
        headingStyle = SpreadsheetApp.newTextStyle().setBold(true).setFontSize(18).build();
      } else if (line.startsWith("### ")) {
        line = line.replace("### ", "");
        headingStyle = SpreadsheetApp.newTextStyle().setBold(true).setFontSize(15).build();
      }

      // QUOTES
      let isQuote = false;
      if (line.startsWith("> ")) {
        line = line.replace("> ", "");
        isQuote = true;
      }

      // CHECKBOX
      line = line
        .replace(/^- \[ \] /g, "☐ ")
        .replace(/^- \[[xX]\] /g, "☑ ")
        .replace(/^- /g, "• ");

      const regex =
        /(\*\*(.*?)\*\*)|(\*(.*?)\*)|(~~(.*?)~~)|(`(.*?)`)|(\[(.*?)\]\((.*?)\))/g;

      let tokens = [];
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

        const baseStyle = SpreadsheetApp.newTextStyle();

        switch (t.type) {
          case "bold":
            styles.push({ start, end, style: baseStyle.setBold(true).build() });
            break;

          case "italic":
            styles.push({ start, end, style: baseStyle.setItalic(true).build() });
            break;

          case "strike":
            styles.push({ start, end, style: baseStyle.setStrikethrough(true).build() });
            break;

          case "code":
            styles.push({
              start,
              end,
              style: baseStyle
                .setFontFamily("Courier New")
                .setBackgroundColor(MD_CONFIG.INLINE_CODE_BG)
                .build()
            });
            break;

          case "link":
            styles.push({
              start,
              end,
              style: baseStyle.setForegroundColor("#1155cc").setUnderline(true).build(),
              link: t.url
            });
            break;
        }

        local += t.text.length;
      });

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

    // THEME BACKGROUND
    if (isDark) {
      cell.setBackground(theme.BG);
      cell.setFontColor(theme.TEXT);
    } else {
      cell.setBackground(null);
      cell.setFontColor(null);
    }

  } finally {
    Utilities.sleep(30);
    cell.setNote("");
  }
}
