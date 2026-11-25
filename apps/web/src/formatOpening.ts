export const NOT_SPECIFIED = 'Not specified'

export const orNotSpecified = (value: string | null) => value || NOT_SPECIFIED

/** closingDate is YYYY-MM-DD; format in UTC so the day never shifts with the visitor's timezone. */
export function formatClosingDate(date: string | null): string {
  if (!date) return NOT_SPECIFIED
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
