import { ParseCvUseCase } from './parse-cv.usecase';

describe('ParseCvUseCase', () => {
  it('returns editable detected data without persisting profile records', async () => {
    const cvDocumentRepository = {
      create: jest.fn((value: Record<string, unknown>) => ({
        cvId: 'cv-1',
        ...value,
      })),
      save: jest.fn((value: Record<string, unknown>) => Promise.resolve(value)),
      findOne: jest.fn().mockResolvedValue(null),
    };
    const parsedCvDataRepository = {
      create: jest.fn((value: Record<string, unknown>) => ({
        parsedId: 'parsed-1',
        ...value,
      })),
      save: jest.fn((value: Record<string, unknown>) => Promise.resolve(value)),
    };
    const parsedResult = {
      confidenceScore: 0.91,
      personalInfo: {
        fullName: 'Anargya Isadhi Maheswara',
        professionalHeadline: 'Software Engineer',
        email: null,
        phoneNumber: '+6281234567890',
        domicile: 'Bogor',
        linkedinUrl: 'linkedin.com/in/anargya',
        profileSummary: 'Software engineer and AI enthusiast.',
      },
      educations: [{ degree: 'Sarjana Komputer' }],
      experiences: [{ title: 'Data Analyst' }, { title: 'BI Intern' }],
      projects: [{ project_name: 'Dashboard BI' }],
      certifications: [],
      skills: [{ detected_text: 'SQL' }, { detected_text: 'Power BI' }],
    };
    const saktiAiClient = {
      parseCvFile: jest.fn().mockResolvedValue(parsedResult),
    };
    const userRepository = {
      findOne: jest.fn().mockResolvedValue({
        fullName: 'Account Name',
        email: 'account@example.com',
      }),
    };
    const profileRepository = {
      findOne: jest.fn().mockResolvedValue(null),
    };
    const useCase = new ParseCvUseCase(
      cvDocumentRepository as never,
      parsedCvDataRepository as never,
      userRepository as never,
      profileRepository as never,
      saktiAiClient as never,
    );
    const cv = {
      originalname: 'cv.pdf',
      mimetype: 'application/pdf',
    } as Express.Multer.File;

    const result = await useCase.execute('user-1', cv, {});

    expect(result.detected).toEqual({
      educations: 1,
      experiences: 2,
      projects: 1,
      certifications: 0,
      skills: 2,
    });
    expect(result.parsedResult.personalInfo).toEqual(
      expect.objectContaining({
        fullName: 'Anargya Isadhi Maheswara',
        email: 'account@example.com',
      }),
    );
    expect(parsedCvDataRepository.save).toHaveBeenCalledTimes(1);
    expect(cvDocumentRepository.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ parseStatus: 'PARSED' }),
    );
  });
});
