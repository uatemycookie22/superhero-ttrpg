import { Temporal } from '@js-temporal/polyfill';

/** Convert Temporal.Instant to Date for Drizzle ORM */
export const toDate = (instant: Temporal.Instant): Date => 
  new Date(instant.epochMilliseconds);

/** Convert Date to Temporal.Instant */
export const fromDate = (date: Date): Temporal.Instant => 
  Temporal.Instant.fromEpochMilliseconds(date.getTime());

/** Get current timestamp as Temporal.Instant */
export const now = () => Temporal.Now.instant();

/** Get timestamp N days ago */
export const daysAgo = (days: number) => 
  now().subtract({ hours: days * 24 });
