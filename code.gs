/**
 * =========================================================
 * Google Sheets Markdown Renderer - Full Edition
 * =========================================================
 * Features:
 * - Real-time Markdown Rendering
 * - Undo-safe
 * - Dark Theme
 * - Code Block
 * - Heading
 * - Bold
 * - Italic
 * - Strike
 * - Inline Code
 * - Quote
 * - List
 * - Checkbox
 * - Link
 * - Full Re-render
 * =========================================================
 */

/* =========================================================
 * SETTINGS
 * ========================================================= */

const MD_CONFIG = {
  DARK_THEME: true,
  CODE_BLOCK_BG: "#1e1e1e",
  CODE_BLOCK_TEXT: "#dcdcdc",
  QUOTE_COLOR: "#888888",
  INLINE_CODE_BG: "#eeeeee"
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
 * DARK THEME TOGGLE
 * ========================================================= */

function toggleDarkTheme() {

  const props = PropertiesService.getDocumentProperties();

  const current = props.getProperty("MD_DARK");

  if (current === "true") {
    props.setProperty("MD_DARK", "false");
  } else {
    props.setProperty("MD_DARK", "true");
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Dark Theme Changed"
  );
}

/* =========================================================
 * REALTIME
 * ========================================================= */

function onEdit(e) {

  if (!e || !e.range) return;

  const cell = e.range;

  if (cell.getNote() === "__MD_RENDERING__") return;

  const value = e.value;

  if (!value || typeof value !== "string") return;

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

      applyMarkdown(
        range.getCell(r + 1, c + 1),
        value
      );
    }
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Markdown Render Complete"
  );
}

/* =========================================================
 * APPLY MARKDOWN
 * ========================================================= */

function applyMarkdown(cell, original) {

  try {

    cell.setNote("__MD_RENDERING__");

    const darkTheme =
      PropertiesService
        .getDocumentProperties()
        .getProperty("MD_DARK") === "true";

    const lines = original.split("\n");

    const renderedLines = [];

    const styles = [];

    let currentIndex = 0;

    for (let i = 0; i < lines.length; i++) {

      const line = lines[i];

      // =====================================================
      // CODE BLOCK
      // =====================================================

      if (line.startsWith("```")) {

        let codeContent = [];

        i++;

        while (
          i < lines.length &&
          !lines[i].startsWith("```")
        ) {
          codeContent.push(lines[i]);
          i++;
        }

        const codeText = codeContent.join("\n");

        renderedLines.push(codeText);

        styles.push({
          start: currentIndex,
          end: currentIndex + codeText.length,
          style: SpreadsheetApp.newTextStyle()
            .setFontFamily("Courier New")
            .setForegroundColor(MD_CONFIG.CODE_BLOCK_TEXT)
            .build(),
          bg: MD_CONFIG.CODE_BLOCK_BG
        });

        currentIndex += codeText.length + 1;

        continue;
      }

      let rendered = line;

      let headingStyle = null;

      // =====================================================
      // HEADINGS
      // =====================================================

      if (line.startsWith("### ")) {

        rendered = line.replace(/^### /, "");

        headingStyle =
          SpreadsheetApp.newTextStyle()
            .setBold(true)
            .setFontSize(15)
            .build();

      } else if (line.startsWith("## ")) {

        rendered = line.replace(/^## /, "");

        headingStyle =
          SpreadsheetApp.newTextStyle()
            .setBold(true)
            .setFontSize(18)
            .build();

      } else if (line.startsWith("# ")) {

        rendered = line.replace(/^# /, "");

        headingStyle =
          SpreadsheetApp.newTextStyle()
            .setBold(true)
            .setFontSize(22)
            .build();
      }

      // =====================================================
      // QUOTE
      // =====================================================

      if (rendered.startsWith("> ")) {

        rendered = rendered.replace(/^> /, "");

        styles.push({
          start: currentIndex,
          end: currentIndex + rendered.length,
          style: SpreadsheetApp.newTextStyle()
            .setItalic(true)
            .setForegroundColor(MD_CONFIG.QUOTE_COLOR)
            .build()
        });
      }

      // =====================================================
      // CHECKBOX
      // =====================================================

      rendered = rendered
        .replace(/^- \[ \] /gm, "☐ ")
        .replace(/^- \[[xX]\] /gm, "☑ ")
        .replace(/^- /gm, "• ");

      // =====================================================
      // TOKENIZE
      // =====================================================

      const tokens = [];

      const regex =
        /(\*\*(.*?)\*\*)|(\*(.*?)\*)|(~~(.*?)~~)|(`(.*?)`)|(\[(.*?)\]\((.*?)\))/g;

      let lastIndex = 0;

      let match;

      while ((match = regex.exec(rendered)) !== null) {

        if (match.index > lastIndex) {

          tokens.push({
            type: "text",
            text: rendered.substring(lastIndex, match.index)
          });
        }

        if (match[1]) {

          tokens.push({
            type: "bold",
            text: match[2]
          });

        } else if (match[3]) {

          tokens.push({
            type: "italic",
            text: match[4]
          });

        } else if (match[5]) {

          tokens.push({
            type: "strike",
            text: match[6]
          });

        } else if (match[7]) {

          tokens.push({
            type: "code",
            text: match[8]
          });

        } else if (match[9]) {

          tokens.push({
            type: "link",
            text: match[10],
            url: match[11]
          });
        }

        lastIndex = regex.lastIndex;
      }

      if (lastIndex < rendered.length) {

        tokens.push({
          type: "text",
          text: rendered.substring(lastIndex)
        });
      }

      // =====================================================
      // BUILD LINE
      // =====================================================

      let visibleLine = "";

      tokens.forEach(t => {
        visibleLine += t.text;
      });

      renderedLines.push(visibleLine);

      let localIndex = currentIndex;

      tokens.forEach(t => {

        const start = localIndex;

        const end = localIndex + t.text.length;

        switch (t.type) {

          case "bold":

            styles.push({
              start,
              end,
              style:
                SpreadsheetApp.newTextStyle()
                  .setBold(true)
                  .build()
            });

            break;

          case "italic":

            styles.push({
              start,
              end,
              style:
                SpreadsheetApp.newTextStyle()
                  .setItalic(true)
                  .build()
            });

            break;

          case "strike":

            styles.push({
              start,
              end,
              style:
                SpreadsheetApp.newTextStyle()
                  .setStrikethrough(true)
                  .build()
            });

            break;

          case "code":

            styles.push({
              start,
              end,
              style:
                SpreadsheetApp.newTextStyle()
                  .setFontFamily("Courier New")
                  .setBackgroundColor(
                    MD_CONFIG.INLINE_CODE_BG
                  )
                  .build()
            });

            break;

          case "link":

            styles.push({
              start,
              end,
              style:
                SpreadsheetApp.newTextStyle()
                  .setForegroundColor("#1155cc")
                  .setUnderline(true)
                  .build(),
              link: t.url
            });

            break;
        }

        localIndex += t.text.length;
      });

      if (headingStyle) {

        styles.push({
          start: currentIndex,
          end: currentIndex + visibleLine.length,
          style: headingStyle
        });
      }

      currentIndex += visibleLine.length + 1;
    }

    const finalText = renderedLines.join("\n");

    const builder =
      SpreadsheetApp.newRichTextValue()
        .setText(finalText);

    styles.forEach(s => {

      try {

        builder.setTextStyle(
          s.start,
          s.end,
          s.style
        );

        if (s.link) {

          builder.setLinkUrl(
            s.start,
            s.end,
            s.link
          );
        }

      } catch (e) {}
    });

    cell.setRichTextValue(builder.build());

    // =====================================================
    // DARK THEME
    // =====================================================

    if (darkTheme) {

      cell.setBackground("#111111");
      cell.setFontColor("#eeeeee");

    } else {

      cell.setBackground(null);
      cell.setFontColor(null);
    }

  } finally {

    Utilities.sleep(50);

    cell.setNote("");
  }
}
