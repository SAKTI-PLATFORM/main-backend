import { ValueTransformer } from 'typeorm';

/**
 * MySQL DECIMAL columns are returned as strings by the driver. This transformer
 * parses them back to `number` on read so domain/dashboard code never juggles
 * stringified numbers.
 */
export const numericTransformer: ValueTransformer = {
  to: (value?: number | null): number | null | undefined => value,
  from: (value?: string | null): number | null | undefined =>
    value === null || value === undefined ? value : Number(value),
};
