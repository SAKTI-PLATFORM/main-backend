export type OceanTraitKey = 'O' | 'C' | 'E' | 'A' | 'N';
export type RiasecTypeKey = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export type OceanScores = Record<OceanTraitKey, number>;
export type OceanTraitConfidence = Record<OceanTraitKey, number>;
export type RiasecScores = Record<RiasecTypeKey, number>;
export type RiasecRawScores = Record<RiasecTypeKey, number>;

/** Result returned by SAKTI-AI `/ml/score-psychometric`. */
export interface PsychometricResult {
  ocean: {
    scores: OceanScores;
    trait_confidence: OceanTraitConfidence;
    confidence: number;
  };
  riasec: {
    scores: RiasecScores;
    raw: RiasecRawScores;
    holland_code: string;
  };
}

/** Raw responses as captured by the onboarding wizard (design doc §5 Step 03). */
export interface OceanResponse {
  trait: OceanTraitKey;
  polarity: '+' | '-';
  value: number;
}

export interface RiasecResponse {
  item: number;
  letter?: RiasecTypeKey;
  agreed: boolean;
}
