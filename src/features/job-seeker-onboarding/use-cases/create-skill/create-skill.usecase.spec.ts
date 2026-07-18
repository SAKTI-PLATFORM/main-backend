import { CreateSkillUseCase } from './create-skill.usecase';

describe('CreateSkillUseCase', () => {
  it('persists learning and working hours for a job seeker skill', async () => {
    const skillRepository = {
      create: jest.fn((value: Record<string, unknown>) => ({
        userSkillId: 'user-skill-1',
        ...value,
      })),
      save: jest.fn((value: Record<string, unknown>) => Promise.resolve(value)),
    };
    const useCase = new CreateSkillUseCase(skillRepository as never);

    const result = await useCase.execute('user-1', {
      skillId: 'skill-1',
      detectedText: 'TypeScript',
      learningHours: 120.5,
      workingHours: 480,
    });

    expect(skillRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        skillId: 'skill-1',
        learningHours: 120.5,
        workingHours: 480,
      }),
    );
    expect(skillRepository.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: 'user-skill-1' });
  });

  it('stores omitted skill hours as null', async () => {
    const skillRepository = {
      create: jest.fn((value: Record<string, unknown>) => ({
        userSkillId: 'user-skill-2',
        ...value,
      })),
      save: jest.fn((value: Record<string, unknown>) => Promise.resolve(value)),
    };
    const useCase = new CreateSkillUseCase(skillRepository as never);

    await useCase.execute('user-1', { detectedText: 'SQL' });

    expect(skillRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        learningHours: null,
        workingHours: null,
      }),
    );
  });
});
