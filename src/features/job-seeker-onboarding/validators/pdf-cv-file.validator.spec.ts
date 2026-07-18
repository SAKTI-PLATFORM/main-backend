import { PdfCvFileValidator } from './pdf-cv-file.validator';

describe('PdfCvFileValidator', () => {
  const validator = new PdfCvFileValidator();

  function file(
    content: string,
    mimetype = 'application/pdf',
  ): Express.Multer.File {
    const buffer = Buffer.from(content);
    return {
      fieldname: 'cv',
      originalname: 'cv.pdf',
      encoding: '7bit',
      mimetype,
      size: buffer.length,
      buffer,
      stream: undefined as never,
      destination: '',
      filename: '',
      path: '',
    };
  }

  it('accepts a PDF whose header is in the first 1024 bytes', () => {
    expect(validator.isValid(file('metadata\n%PDF-1.7\ncontent'))).toBe(true);
  });

  it('rejects a non-PDF MIME type', () => {
    expect(validator.isValid(file('%PDF-1.7', 'text/plain'))).toBe(false);
  });

  it('rejects a spoofed PDF without a PDF signature', () => {
    expect(validator.isValid(file('not actually a pdf'))).toBe(false);
  });

  it('rejects an empty upload', () => {
    expect(validator.isValid(file(''))).toBe(false);
  });
});
