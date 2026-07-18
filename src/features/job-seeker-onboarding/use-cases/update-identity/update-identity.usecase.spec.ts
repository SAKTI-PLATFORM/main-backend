import { JobseekerProfile } from 'src/domain/entity/jobseeker-profile.entity';
import { User } from 'src/domain/entity/user.entity';
import { UpdateIdentityUseCase } from './update-identity.usecase';

describe('UpdateIdentityUseCase', () => {
  it('synchronizes user and job seeker profile identity fields', async () => {
    const user = {
      userId: 'user-1',
      fullName: 'Old Name',
      email: 'old@example.com',
    } as User;
    const profile = { userId: 'user-1' } as JobseekerProfile;
    const userRepository = {
      findOne: jest.fn().mockResolvedValue(user),
      exists: jest.fn().mockResolvedValue(false),
      save: jest.fn((value: User) => Promise.resolve(value)),
    };
    const profileRepository = {
      findOne: jest.fn().mockResolvedValue(profile),
      create: jest.fn((value: Partial<JobseekerProfile>) => value),
      save: jest.fn((value: JobseekerProfile) => Promise.resolve(value)),
    };
    const manager = {
      getRepository: jest.fn((entity: typeof User | typeof JobseekerProfile) =>
        entity === User ? userRepository : profileRepository,
      ),
    };
    const dataSource = {
      transaction: jest.fn(
        (callback: (value: typeof manager) => Promise<unknown>) =>
          callback(manager),
      ),
    };
    const useCase = new UpdateIdentityUseCase(dataSource as never);

    const result = await useCase.execute('user-1', {
      fullName: 'Anargya Isadhi Maheswara',
      email: 'ANARGYA@example.com',
      professionalHeadline: 'Software Engineer & AI Enthusiast',
      phoneNumber: '+62 812-3456-7890',
      domicile: 'Bogor, Indonesia',
      linkedinUrl: 'linkedin.com/in/anargya',
      profileSummary: 'Software engineer experienced in scalable products.',
    });

    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Anargya Isadhi Maheswara',
        email: 'anargya@example.com',
        phoneNumber: '+62 812-3456-7890',
        domicile: 'Bogor, Indonesia',
      }),
    );
    expect(profileRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        domicile: 'Bogor, Indonesia',
        professionalHeadline: 'Software Engineer & AI Enthusiast',
        linkedinUrl: 'linkedin.com/in/anargya',
      }),
    );
    expect(result.profileSummary).toBe(
      'Software engineer experienced in scalable products.',
    );
  });
});
