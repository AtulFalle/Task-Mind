import { Injectable } from '@nestjs/common';
import { ExtractedTextStatus } from '@task-mind/shared';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { PDFParse } from 'pdf-parse';
import mammoth = require('mammoth');

const OCR_UNAVAILABLE_MESSAGE =
  'Text extraction unavailable. OCR will be supported later.';

export interface ParsedDocumentText {
  status: ExtractedTextStatus;
  text: string | null;
  error?: string;
}

@Injectable()
export class DocumentTextParserService {
  async parse(filePath: string, mimeType: string): Promise<ParsedDocumentText> {
    const extension = extname(filePath).toLowerCase();

    if (this.isTxt(mimeType, extension)) {
      return this.completed(await readFile(filePath, 'utf8'));
    }

    if (this.isDocx(mimeType, extension)) {
      const result = await mammoth.extractRawText({ path: filePath });
      return this.completed(result.value);
    }

    if (this.isPdf(mimeType, extension)) {
      return this.parsePdf(filePath);
    }

    return {
      status: ExtractedTextStatus.UNSUPPORTED,
      text: null,
      error: 'This document type is not supported for text extraction.',
    };
  }

  private async parsePdf(filePath: string): Promise<ParsedDocumentText> {
    const buffer = await readFile(filePath);
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      const text = this.cleanText(result.text);

      if (!text) {
        return {
          status: ExtractedTextStatus.UNSUPPORTED,
          text: OCR_UNAVAILABLE_MESSAGE,
        };
      }

      return {
        status: ExtractedTextStatus.COMPLETED,
        text,
      };
    } finally {
      await parser.destroy();
    }
  }

  private completed(text: string): ParsedDocumentText {
    return {
      status: ExtractedTextStatus.COMPLETED,
      text: this.cleanText(text),
    };
  }

  private cleanText(text: string): string {
    return text.replace(/\r\n/g, '\n').trim();
  }

  private isTxt(mimeType: string, extension: string): boolean {
    return mimeType === 'text/plain' || extension === '.txt';
  }

  private isPdf(mimeType: string, extension: string): boolean {
    return mimeType === 'application/pdf' || extension === '.pdf';
  }

  private isDocx(mimeType: string, extension: string): boolean {
    return (
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      extension === '.docx'
    );
  }
}
