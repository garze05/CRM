// Temporadas festivas — separación visual en el calendario de eventos.
// Lista inicial definida por el negocio (2026-06-11): Navidad, Día del Niño,
// Halloween. Los rangos son ajustables aquí sin tocar el calendario.
// Día del Niño en Costa Rica: 9 de setiembre.

export type FestiveSeason = {
  id: string;
  /// Etiqueta visible en la banda del calendario (español).
  label: string;
  /// Rango recurrente anual, inclusivo en ambos extremos (mes 1-12).
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  /// Token CSS del color de la banda (definido en globals.css).
  colorToken: string;
};

export const FESTIVE_SEASONS: readonly FestiveSeason[] = [
  {
    id: "navidad",
    label: "Temporada navideña",
    startMonth: 12,
    startDay: 1,
    endMonth: 12,
    endDay: 31,
    colorToken: "--season-navidad",
  },
  {
    id: "dia-del-nino",
    label: "Día del Niño",
    startMonth: 9,
    startDay: 1,
    endMonth: 9,
    endDay: 9,
    colorToken: "--season-dia-del-nino",
  },
  {
    id: "halloween",
    label: "Halloween",
    startMonth: 10,
    startDay: 24,
    endMonth: 10,
    endDay: 31,
    colorToken: "--season-halloween",
  },
];

/** Temporadas activas para una fecha dada (en hora local de Costa Rica). */
export function getSeasonsForDate(date: Date): FestiveSeason[] {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return FESTIVE_SEASONS.filter(season => {
    const afterStart =
      month > season.startMonth ||
      (month === season.startMonth && day >= season.startDay);
    const beforeEnd =
      month < season.endMonth ||
      (month === season.endMonth && day <= season.endDay);

    // Rangos dentro del mismo año (ninguna temporada actual cruza el año).
    return afterStart && beforeEnd;
  });
}
