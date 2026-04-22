import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ParsedResume {
  text: string;
  fileName: string;
  fileType: "pdf" | "docx" | "txt";
  pageCount?: number;
  warnings: string[];
}

export async function parseFile(file: File): Promise<ParsedResume> {
  const name = file.name.toLowerCase();
  const warnings: string[] = [];

  if (name.endsWith(".pdf")) {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        // @ts-expect-error pdfjs item type
        .map((it) => it.str)
        .join(" ");
      text += pageText + "\n";
    }
    if (text.trim().length < 100) {
      warnings.push("PDF appears to be scanned/image-based — ATS will struggle to read it.");
    }
    return { text, fileName: file.name, fileType: "pdf", pageCount: pdf.numPages, warnings };
  }

  if (name.endsWith(".docx")) {
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return { text: result.value, fileName: file.name, fileType: "docx", warnings };
  }

  if (name.endsWith(".txt")) {
    const text = await file.text();
    return { text, fileName: file.name, fileType: "txt", warnings };
  }

  throw new Error("Unsupported file format. Please upload PDF, DOCX, or TXT.");
}