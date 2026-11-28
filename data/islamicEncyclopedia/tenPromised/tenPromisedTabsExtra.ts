import { TABS_LISTS_EXTRA_PART1, CompanionTabsExtraPatch } from './tenPromisedTabsExtraPart1';
import { TABS_LISTS_EXTRA_PART2 } from './tenPromisedTabsExtraPart2';

export type { CompanionTabsExtraPatch };

export const TABS_LISTS_EXTRA: Record<string, CompanionTabsExtraPatch> = {
  ...TABS_LISTS_EXTRA_PART1,
  ...TABS_LISTS_EXTRA_PART2
};
