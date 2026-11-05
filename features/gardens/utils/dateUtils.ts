/**
 * Formats a date as `YYYY-MM-DD` using the user's local calendar day.
 * `toISOString()` uses UTC, which shows tomorrow's date in Brazil after 21h.
 */
export const toLocalDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Parses a `YYYY-MM-DD` input value at local noon, avoiding timezone day shifts.
 */
export const fromDateInputValue = (value: string) => new Date(`${value}T12:00:00`);

/**
 * Formats a date in Brazilian Portuguese (dd/mm/aaaa), independent of the browser locale.
 */
export const formatShortDatePtBr = (date: Date) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    date,
  );
