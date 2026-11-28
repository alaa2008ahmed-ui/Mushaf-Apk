import { HISN_ALMUSLIM_CATEGORIES } from './hisnAlmuslimCategories';
import { HISN_ALMUSLIM_DATA_PART1 } from './hisnAlmuslimDataPart1';
import { HISN_ALMUSLIM_DATA_PART2 } from './hisnAlmuslimDataPart2';
import { HISN_ALMUSLIM_DATA_PART3 } from './hisnAlmuslimDataPart3';
import { HISN_ALMUSLIM_DATA_PART4 } from './hisnAlmuslimDataPart4';

export { HISN_ALMUSLIM_CATEGORIES };

export const HISN_ALMUSLIM_DATA = {
    ...HISN_ALMUSLIM_DATA_PART1,
    ...HISN_ALMUSLIM_DATA_PART2,
    ...HISN_ALMUSLIM_DATA_PART3,
    ...HISN_ALMUSLIM_DATA_PART4,
};
