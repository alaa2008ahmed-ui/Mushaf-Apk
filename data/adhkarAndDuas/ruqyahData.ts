// Complete authentic Ruqyah Data (Verses & Prophetic Supplications) with full Arabic & English support

import type { RuqyahItem } from './ruqyahGuideSteps';
import { RUQYAH_QURAN_PART1 } from './ruqyahQuranPart1';
import { RUQYAH_QURAN_PART2 } from './ruqyahQuranPart2';
import { RUQYAH_SUNNAH_PART1 } from './ruqyahSunnahPart1';
import { RUQYAH_SUNNAH_PART2 } from './ruqyahSunnahPart2';

export type { RuqyahItem, RuqyahGuideStep } from './ruqyahGuideSteps';
export { RUQYAH_GUIDE_STEPS } from './ruqyahGuideSteps';

export const RUQYAH_DATA: RuqyahItem[] = [
  ...RUQYAH_QURAN_PART1,
  ...RUQYAH_QURAN_PART2,
  ...RUQYAH_SUNNAH_PART1,
  ...RUQYAH_SUNNAH_PART2,
];
