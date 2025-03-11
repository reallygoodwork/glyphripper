import { CHAR_SETS } from "./charsets.js";

interface PreviewSection {
  title: string;
  chars: string;
}

function generatePreviewSections(
  selectedSets: string[],
  customChars: string
): PreviewSection[] {
  const sections: PreviewSection[] = [];

  // Add selected character sets
  selectedSets.forEach((setName) => {
    const chars = CHAR_SETS[setName as keyof typeof CHAR_SETS];
    sections.push({
      title: setName.charAt(0).toUpperCase() + setName.slice(1),
      chars: chars,
    });
  });

  // Add custom characters if provided
  if (customChars) {
    sections.push({
      title: "Custom Characters",
      chars: customChars,
    });
  }

  // Add sample text section
  sections.push({
    title: "Sample Text",
    chars:
      "The quick brown fox jumps over the lazy dog\n" +
      "1234567890 !@#$%^&*()\n" +
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ\n" +
      "abcdefghijklmnopqrstuvwxyz",
  });

  return sections;
}

export function generatePreviewHTML(
  fontName: string,
  formats: string[],
  selectedSets: string[] = [],
  customChars: string = "",
  isVariableFont: boolean = false
): string {
  const previewSections = generatePreviewSections(selectedSets, customChars);
  const fontSources = formats
    .map((format) => {
      const formatName = format === "ttf" ? "truetype" : format;
      return `url('./${fontName}-subset.${format}') format('${formatName}')`;
    })
    .join(",\n           ");

  // Define font-weight based on whether it's a variable font
  const fontWeightDeclaration = isVariableFont
    ? "font-weight: 100 900;"
    : "font-weight: 400;";

  // Add styles for the code blocks and usage section
  const additionalStyles = `
    .usage-demo {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #EDEDED;
    }

    .usage-demo h2 {
      font-size: 1.25rem;
      color: #475569;
      margin-bottom: 1.5rem;
    }

    .usage-demo h3 {
      font-size: 1.125rem;
      color: #475569;
      margin: 1.5rem 0 0.75rem;
    }

    .license-notice {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 1rem 1.5rem;
      margin-bottom: 2rem;
      border-radius: 0 6px 6px 0;
    }

    .license-notice h3 {
      color: #b45309;
      margin-top: 0;
    }

    .license-notice p {
      margin: 0.75rem 0;
      color: #78350f;
    }

    .license-notice ul {
      margin: 0.75rem 0;
      padding-left: 1.5rem;
      color: #78350f;
    }

    .license-notice li {
      margin-bottom: 0.5rem;
    }

    .code-block {
      background: #F4F4F4;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    pre {
      white-space: pre-wrap;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9rem;
      line-height: 1.5;
      background: #0f172a;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }

    .copy-hint {
      font-size: 0.875rem;
      margin-top: 0.5rem;
      color: #64748b;
      font-style: italic;
    }

    .usage-instructions ol {
      padding-left: 1.5rem;
      line-height: 1.6;
    }

    .usage-instructions li {
      margin-bottom: 0.5rem;
    }

    .html-example {
      margin-top: 2rem;
    }
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fontName} Preview</title>
  <style>
    @font-face {
      font-family: '${fontName}';
      src: local('${fontName}'),
           ${fontSources};
      ${fontWeightDeclaration}
      font-style: normal;
      font-display: block;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, Cantarell, Ubuntu, roboto, noto, helvetica, arial, sans-serif;
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
      line-height: 1.5;
      background: #ffff;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 0.25rem;
      color: #00835c;
    }

    .project-info {
      font-size: 0.875rem;
      color: #7a7a7a;
      margin-bottom: 1rem;
    }

    .project-info a {
      color: #00835c;
      text-decoration: none;
    }

    .preview-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      border-radius: 8px;
      background: #F4F4F4;
    }

    .preview-section h2 {
      font-size: 1.25rem;
      margin-top: 0;
      margin-bottom: 1rem;
      color: #7a7a7a;
    }

    .preview-content {
      font-family: '${fontName}', system-ui, sans-serif;
      font-size: 1.5rem;
      line-height: 1.6;
      margin: 0;
      color: #010101;
      white-space: pre-wrap;
    }

    .size-demo {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #EDEDED;
    }

    .size-demo h2 {
      font-size: 1.25rem;
      color: #475569;
    }

    .size-demo p {
      font-family: '${fontName}', system-ui, sans-serif;
      margin: 1rem 0;
    }

    .size-12 { font-size: 12px; }
    .size-16 { font-size: 16px; }
    .size-24 { font-size: 24px; }
    .size-32 { font-size: 32px; }
    .size-48 { font-size: 48px; }

    /* Weight variations for variable fonts */
    .weight-demo {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #EDEDED;
    }

    .weight-demo h2 {
      font-size: 1.25rem;
      color: #475569;
    }

    .weight-demo p {
      font-family: '${fontName}', system-ui, sans-serif;
      font-size: 24px;
      margin: 1rem 0;
    }

    .weight-100 { font-weight: 100; }
    .weight-300 { font-weight: 300; }
    .weight-400 { font-weight: 400; }
    .weight-500 { font-weight: 500; }
    .weight-700 { font-weight: 700; }
    .weight-900 { font-weight: 900; }

    /* Debug info */
    .debug-info {
      margin: 1rem 0;
      padding: 1rem;
      background: #fee;
      border: 1px solid #faa;
      border-radius: 4px;
    }
    .debug-info.success {
      background: #efe;
      border-color: #afa;
    }
    ${additionalStyles}
  </style>
  <script>
    document.fonts.ready.then(() => {
      const debugDiv = document.createElement('div');
      const fontLoaded = document.fonts.check("12px '${fontName}'");
      debugDiv.className = 'debug-info' + (fontLoaded ? ' success' : '');
      debugDiv.innerHTML = fontLoaded
        ? '✅ Font loaded successfully!'
        : '❌ Font failed to load. Check browser console for network errors.';
      document.body.insertBefore(debugDiv, document.body.firstChild);
    });
  </script>
</head>
<body>
  <h1>${fontName} Font Preview</h1>
  <p class="project-info">Generated with <a href="https://github.com/reallygoodwork/glyphripper">Glyphripper</a>. A <a href="https://reallygoodwork.com">Really Good Work</a> project.</p>

  ${previewSections
    .map(
      (section) => `
  <div class="preview-section">
    <h2>${section.title}</h2>
    <p class="preview-content">${section.chars}</p>
  </div>
  `
    )
    .join("")}

  <div class="size-demo">
    <h2>Size Variations</h2>
    <p class="size-12">12px - The quick brown fox jumps over the lazy dog</p>
    <p class="size-16">16px - The quick brown fox jumps over the lazy dog</p>
    <p class="size-24">24px - The quick brown fox jumps over the lazy dog</p>
    <p class="size-32">32px - The quick brown fox jumps over the lazy dog</p>
    <p class="size-48">48px - The quick brown fox jumps over the lazy dog</p>
  </div>

  ${isVariableFont ? `
  <div class="weight-demo">
    <h2>Weight Variations</h2>
    <p class="weight-100">Weight 100 - The quick brown fox jumps over the lazy dog</p>
    <p class="weight-300">Weight 300 - The quick brown fox jumps over the lazy dog</p>
    <p class="weight-400">Weight 400 - The quick brown fox jumps over the lazy dog</p>
    <p class="weight-500">Weight 500 - The quick brown fox jumps over the lazy dog</p>
    <p class="weight-700">Weight 700 - The quick brown fox jumps over the lazy dog</p>
    <p class="weight-900">Weight 900 - The quick brown fox jumps over the lazy dog</p>
  </div>
  ` : `
  <div class="weight-demo">
    <h2>Font Information</h2>
    <p>This is a standard (non-variable) font. To use different weights, you would need separate font files for each weight.</p>
    <p>The current font is set with: <code>font-weight: 400;</code> (normal weight)</p>
  </div>
  `}

  <div class="usage-demo">
    <h2>How to Use This Font</h2>
    <div class="license-notice">
      <h3>⚠️ License Notice</h3>
      <p>
        Remember that font usage is subject to the terms of the original font's license.
        By subsetting this font, you confirm that you have the necessary rights to use, modify, and distribute it.
      </p>
      <p>
        Always respect the font creator's license terms when using this font in any project.
        Some common license restrictions may include:
      </p>
      <ul>
        <li>Limitations on commercial use</li>
        <li>Requirements for attribution</li>
        <li>Restrictions on redistribution or embedding</li>
        <li>Limitations on modification (including subsetting)</li>
      </ul>
    </div>

    <div class="code-block">
      <h3>CSS @font-face Rule</h3>
      <pre><code>@font-face {
  font-family: '${fontName}';
  src: ${formats.map(format => {
    const formatName = format === "ttf" ? "truetype" : format;
    return `url('path-to-font/${fontName}-subset.${format}') format('${formatName}')`;
  }).join(',\n       ')};
  ${isVariableFont ?
    "font-weight: 100 900; /* Variable font - supports multiple weights */" :
    "font-weight: 400; /* Standard font - normal weight */"}
  font-style: normal;
  font-display: swap;
}</code></pre>
      <p class="copy-hint">Copy the above code to your CSS file.</p>
    </div>

    <div class="usage-instructions">
      <h3>Usage Instructions</h3>
      <ol>
        <li>Upload the font files to your web server</li>
        <li>Update the file paths in the @font-face rule to match your directory structure</li>
        <li>Add the @font-face rule to your CSS</li>
        <li>Use the font in your CSS with: <code>font-family: '${fontName}', sans-serif;</code></li>
        ${isVariableFont ?
          "<li>Set weights with: <code>font-weight: 100;</code> to <code>font-weight: 900;</code></li>" :
          "<li>The font is set to normal weight (400)</li>"}
      </ol>
    </div>

    <div class="html-example">
      <h3>HTML Example</h3>
      <pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
  &lt;meta charset="UTF-8"&gt;
  &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
  &lt;title&gt;My Page&lt;/title&gt;
  &lt;style&gt;
    @font-face {
      font-family: '${fontName}';
      src: ${formats.map(format => {
        const formatName = format === "ttf" ? "truetype" : format;
        return `url('fonts/${fontName}-subset.${format}') format('${formatName}')`;
      }).join(',\n           ')};
      ${isVariableFont ? "font-weight: 100 900;" : "font-weight: 400;"}
      font-style: normal;
      font-display: swap;
    }

    body {
      font-family: '${fontName}', sans-serif;
    }

    h1 {
      ${isVariableFont ? "font-weight: 700;" : "/* This font doesn't support variable weights */"}
    }

    p {
      ${isVariableFont ? "font-weight: 400;" : "/* This font uses standard weight 400 */"}
    }
  &lt;/style&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;h1&gt;Using ${fontName} Font&lt;/h1&gt;
  &lt;p&gt;This text is displayed in the ${fontName} font.&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>
    </div>
  </div>
</body>
</html>`;
}
