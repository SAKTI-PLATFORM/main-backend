export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum EmploymentStatus {
  FRESH_GRAD = 'fresh_grad',
  WORKING = 'working',
  UNEMPLOYED = 'unemployed',
  FREELANCE = 'freelance',
}

export enum EducationLevel {
  SMA = 'SMA',
  D3 = 'D3',
  S1 = 'S1',
  S2 = 'S2',
  S3 = 'S3',
}

export enum FieldOfInterest {
  TEKNOLOGI = 'teknologi',
  KEUANGAN = 'keuangan',
  KESEHATAN = 'kesehatan',
  PENDIDIKAN = 'pendidikan',
  MANUFAKTUR = 'manufaktur',
  KREATIF = 'kreatif',
  LAINNYA = 'lainnya',
}

export enum ToolsExperience {
  ZERO_SIX_MONTHS = '0-6m',
  SIX_TWELVE_MONTHS = '6-12m',
  ONE_TWO_YEARS = '1-2y',
  TWO_THREE_YEARS = '2-3y',
  THREE_FIVE_YEARS = '3-5y',
  OVER_FIVE_YEARS = '>5y',
}

export enum WorkMode {
  REMOTE = 'remote',
  HYBRID = 'hybrid',
  ONSITE = 'onsite',
  FLEXIBLE = 'flexible',
}

export enum CompanyType {
  STARTUP = 'startup',
  KORPORASI = 'korporasi',
  BUMN = 'bumn',
  INSTANSI_PEMERINTAH = 'instansi_pemerintah',
  NGO = 'ngo',
  UMKM = 'umkm',
}

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  FREELANCE = 'freelance',
  MAGANG = 'magang',
}

export enum SkillCategory {
  TOOL = 'tool',
  KNOWLEDGE = 'knowledge',
  SOFT = 'soft',
}

export enum SkillSource {
  CV = 'cv',
  DECLARED = 'declared',
}

export enum AssessmentInstrument {
  BFI10 = 'bfi10',
  RIASEC42 = 'riasec42',
}

/** Onboarding wizard steps (design doc §5). */
export enum OnboardingStep {
  FOUNDATION = 'foundation',
  EXPERTISE = 'expertise',
  ASSESSMENT = 'assessment',
  VISION = 'vision',
}
