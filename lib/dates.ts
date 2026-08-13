/** Septembre 2026 : 1–22 tous les jours, puis weekends uniquement (26–27). */

export const YEAR = 2026;
export const MONTH = 8; // 0-indexed = septembre

export function isSelectableDate(year: number, month: number, day: number): boolean {
  if (year !== YEAR || month !== MONTH) return false;
  if (day >= 1 && day <= 22) return true;
  const date = new Date(year, month, day);
  const dow = date.getDay();
  const weekend = dow === 0 || dow === 6;
  return weekend && day <= 27;
}

export function septemberDays(): { day: number; selectable: boolean; dow: number }[] {
  const last = new Date(YEAR, MONTH + 1, 0).getDate();
  const days = [];
  for (let day = 1; day <= last; day++) {
    const date = new Date(YEAR, MONTH, day);
    days.push({
      day,
      selectable: isSelectableDate(YEAR, MONTH, day),
      dow: date.getDay(),
    });
  }
  return days;
}

/** 0 = lundi … 6 = dimanche, pour une grille FR */
export function mondayOffset(): number {
  const first = new Date(YEAR, MONTH, 1);
  return (first.getDay() + 6) % 7;
}

export function formatDateFr(isoDay: string): string {
  const day = Number(isoDay);
  const date = new Date(YEAR, MONTH, day);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function toIsoDate(day: number): string {
  return `${YEAR}-09-${String(day).padStart(2, "0")}`;
}
