import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

const root = process.cwd();
const sourcePath = path.join(root, 'docs', 'user-manual.md');
const outputPath = path.join(root, 'docs', 'Academic-Tracker-User-Manual.pdf');

const markdown = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const doc = new PDFDocument({
  size: 'A4',
  bufferPages: true,
  margins: { top: 54, bottom: 54, left: 58, right: 58 },
  info: {
    Title: 'Academic Tracker User Manual',
    Author: 'academic-progress-tracker',
    Subject: 'User manual and operating guideline'
  }
});

doc.pipe(fs.createWriteStream(outputPath));

const styles = {
  h1: { size: 24, color: '#111827', gapBefore: 0, gapAfter: 14 },
  h2: { size: 17, color: '#1f2937', gapBefore: 16, gapAfter: 8 },
  h3: { size: 13, color: '#374151', gapBefore: 10, gapAfter: 6 },
  body: { size: 10.5, color: '#374151', gapBefore: 0, gapAfter: 7 },
  bullet: { size: 10.5, color: '#374151', gapBefore: 0, gapAfter: 4 },
  code: { size: 9.5, color: '#111827', gapBefore: 4, gapAfter: 7 }
};

function ensureSpace(height) {
  if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

function writeParagraph(text, style = styles.body) {
  ensureSpace(style.size * 2.4);
  doc
    .font('Helvetica')
    .fontSize(style.size)
    .fillColor(style.color)
    .text(text, {
      align: 'left',
      lineGap: 2.5
    });
  doc.moveDown(style.gapAfter / 10);
}

function writeHeading(text, style) {
  ensureSpace(style.size * 2.6);
  if (style.gapBefore) doc.moveDown(style.gapBefore / 10);
  doc
    .font('Helvetica-Bold')
    .fontSize(style.size)
    .fillColor(style.color)
    .text(text, { lineGap: 2 });
  doc.moveDown(style.gapAfter / 10);
}

function writeBullet(text) {
  ensureSpace(styles.bullet.size * 2.2);
  const x = doc.x;
  const y = doc.y;
  doc
    .font('Helvetica')
    .fontSize(styles.bullet.size)
    .fillColor(styles.bullet.color)
    .text('•', x, y);
  doc
    .text(text, x + 14, y, {
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right - 14,
      lineGap: 2.5
    });
  doc.moveDown(styles.bullet.gapAfter / 10);
}

function writeNumbered(text) {
  const match = text.match(/^(\d+)\.\s+(.*)$/);
  if (!match) return writeParagraph(text);
  ensureSpace(styles.body.size * 2.2);
  const x = doc.x;
  const y = doc.y;
  doc
    .font('Helvetica')
    .fontSize(styles.body.size)
    .fillColor(styles.body.color)
    .text(`${match[1]}.`, x, y);
  doc
    .text(match[2], x + 22, y, {
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right - 22,
      lineGap: 2.5
    });
  doc.moveDown(styles.body.gapAfter / 10);
}

function writeCode(text) {
  ensureSpace(styles.code.size * 2.4);
  doc
    .font('Courier')
    .fontSize(styles.code.size)
    .fillColor(styles.code.color)
    .text(text, {
      lineGap: 2
    });
  doc.moveDown(styles.code.gapAfter / 10);
}

let inCodeBlock = false;
let codeLines = [];

function flushCodeBlock() {
  if (codeLines.length) {
    writeCode(codeLines.join('\n'));
    codeLines = [];
  }
}

for (const rawLine of markdown.split('\n')) {
  const line = rawLine.trimEnd();

  if (line.startsWith('```')) {
    if (inCodeBlock) {
      flushCodeBlock();
      inCodeBlock = false;
    } else {
      inCodeBlock = true;
    }
    continue;
  }

  if (inCodeBlock) {
    codeLines.push(line);
    continue;
  }

  if (!line.trim()) {
    doc.moveDown(0.2);
    continue;
  }

  if (line.startsWith('# ')) {
    writeHeading(line.slice(2), styles.h1);
  } else if (line.startsWith('## ')) {
    writeHeading(line.slice(3), styles.h2);
  } else if (line.startsWith('### ')) {
    writeHeading(line.slice(4), styles.h3);
  } else if (line.startsWith('- ')) {
    writeBullet(line.slice(2));
  } else if (/^\d+\.\s+/.test(line)) {
    writeNumbered(line);
  } else {
    writeParagraph(line);
  }
}

flushCodeBlock();

const pageCount = doc.bufferedPageRange().count;
for (let i = 0; i < pageCount; i += 1) {
  doc.switchToPage(i);
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#6b7280')
    .text(`Academic Tracker User Manual • Page ${i + 1} of ${pageCount}`, doc.page.margins.left, doc.page.height - 34, {
      align: 'center',
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right
    });
}

doc.end();
console.log(`Generated ${path.relative(root, outputPath)}`);
