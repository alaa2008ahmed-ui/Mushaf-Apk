import { ON_THIS_DAY_EVENTS_Q1 } from './onThisDayEventsQ1';
import { ON_THIS_DAY_EVENTS_Q2 } from './onThisDayEventsQ2';
import { ON_THIS_DAY_EVENTS_Q3 } from './onThisDayEventsQ3';
import { ON_THIS_DAY_EVENTS_Q4 } from './onThisDayEventsQ4';

export const ON_THIS_DAY_EVENTS: Record<string, { year: number; text: string }[]> = {
  ...ON_THIS_DAY_EVENTS_Q1,
  ...ON_THIS_DAY_EVENTS_Q2,
  ...ON_THIS_DAY_EVENTS_Q3,
  ...ON_THIS_DAY_EVENTS_Q4,
};
