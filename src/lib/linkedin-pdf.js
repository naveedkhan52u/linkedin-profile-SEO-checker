import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const sectionNames = {
  about: 'about',
  experience: 'experience',
  education: 'education',
  skills: 'skills',
  'licenses & certifications': 'other',
  certifications: 'other',
  projects: 'other',
  'volunteer experience': 'other',
  'honors & awards': 'other',
  languages: 'other',
  contact: 'other'
};

function cleanText(value) {
  return String(value || '').replace(/\\u00a0/g, ' ').replace(/[ \\t]+/g, ' ').trim();
}

function parseProfileText(text) {
  const lines = text.split(/\\r?\\n/).map(cleanText).filter(Boolean);
  const fields = { headline: '', about: '', experience: '', skills: '', education: '' };
  const sections = { about: [], experience: [], skills: [], education: [], other: [] };
  let activeSection = '';
  let detectedSections = [];

  for (const line of lines) {
    const heading = line.toLowerCase().replace(/:$/, '').trim();
    if (Object.prototype.hasOwnProperty.call(sectionNames, heading)) {
      activeSection = sectionNames[heading];
      if (['about', 'experience', 'skills', 'education'].includes(activeSection) && !detectedSections.includes(activeSection)) {
        detectedSections.push(activeSection);
      }
      continue;
    }
    if (activeSection && sections[activeSection]) sections[activeSection].push(line);
  }

  const firstUsefulLines = lines.filter(line => !/linkedin\\.com|^page \\d+ of \\d+$/i.test(line));
  if (firstUsefulLines.length > 1) {
    const possibleHeadline = firstUsefulLines[1];
    if (possibleHeadline.length >= 8 && possibleHeadline.length <= 220 &&
        !/^(about|experience|education|skills|contact|licenses & certifications)$/i.test(possibleHeadline)) {
      fields.headline = possibleHeadline;
    }
  }

  fields.about = sections.about.join('\\n').trim();
  fields.experience = sections.experience.join('\\n').trim();
  fields.skills = sections.skills.join(', ').trim();
  fields.education = sections.education.join('\\n').trim();

  if (!detectedSections.length) {
    fields.about = lines.join('\\n').slice(0, 2000);
  }
  return { fields, detectedSections, fullText: lines.join('\\n') };
}

export async function extractLinkedInProfileFromPdf(file) {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pageLines = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const rows = new Map();
    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform?.[5] ?? 0);
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y).push({ x: item.transform?.[4] ?? 0, text: item.str });
    }
    const orderedRows = [...rows.entries()].sort((a, b) => b[0] - a[0]);
    for (const [, items] of orderedRows) {
      items.sort((a, b) => a.x - b.x);
      pageLines.push(items.map(item => item.text).join(' ').replace(/\\s+/g, ' ').trim());
    }
    pageLines.push('');
  }
  return parseProfileText(pageLines.join('\\n'));
}
