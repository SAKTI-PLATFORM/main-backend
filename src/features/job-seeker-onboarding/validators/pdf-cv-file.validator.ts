import { FileValidator } from '@nestjs/common';

export const MAX_CV_FILE_SIZE = 10 * 1024 * 1024;

export class PdfCvFileValidator extends FileValidator<Record<string, never>> {
  constructor() {
    super({});
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!file?.buffer || file.size === 0) return false;
    if (file.size > MAX_CV_FILE_SIZE) return false;
    if (file.mimetype.toLowerCase() !== 'application/pdf') return false;

    // The PDF header must occur within the first 1024 bytes per ISO 32000.
    return file.buffer.subarray(0, 1024).includes(Buffer.from('%PDF-'));
  }

  buildErrorMessage(): string {
    return 'CV wajib berupa file PDF yang valid dengan ukuran maksimal 10 MB.';
  }
}
