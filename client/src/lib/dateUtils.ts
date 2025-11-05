/**
 * Formata uma data para exibição sem problemas de timezone
 * 
 * Problema: new Date(timestamp) interpreta como UTC e converte para timezone local,
 * causando diferença de dias quando a hora é 00:00:00 UTC.
 * 
 * Solução: Usar toLocaleDateString com timeZone: 'UTC' para manter a data original
 */

export function formatEventDate(
  dateString: string | Date,
  locale: string = 'pt-BR',
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Força interpretação como UTC para evitar conversão de timezone
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...options,
  };
  
  return date.toLocaleDateString(locale, defaultOptions);
}

/**
 * Formata data curta (dd/mm/yyyy)
 */
export function formatShortDate(dateString: string | Date, locale: string = 'pt-BR'): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return date.toLocaleDateString(locale, {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formata intervalo de datas de forma inteligente
 * - Evento de 1 dia: "17 de março de 2026"
 * - Múltiplos dias no mesmo mês: "17 a 18 de março de 2026"
 * - Múltiplos dias em meses diferentes: "30 de março a 2 de abril de 2026"
 * - Múltiplos dias em anos diferentes: "28 de dezembro de 2025 a 3 de janeiro de 2026"
 */
export function formatDateRange(
  dateStart: string | Date,
  dateEnd: string | Date | null | undefined,
  locale: string = 'pt-BR'
): string {
  const start = typeof dateStart === 'string' ? new Date(dateStart) : dateStart;
  
  // Se não há data de término, retorna apenas a data de início
  if (!dateEnd) {
    return formatEventDate(start, locale);
  }
  
  const end = typeof dateEnd === 'string' ? new Date(dateEnd) : dateEnd;
  
  // Se as datas são iguais, retorna apenas uma data
  if (start.getTime() === end.getTime()) {
    return formatEventDate(start, locale);
  }
  
  // Extrai componentes das datas (em UTC para evitar timezone)
  const startDay = start.getUTCDate();
  const startMonth = start.getUTCMonth();
  const startYear = start.getUTCFullYear();
  
  const endDay = end.getUTCDate();
  const endMonth = end.getUTCMonth();
  const endYear = end.getUTCFullYear();
  
  // Mesmo mês e ano: "17 a 18 de março de 2026"
  if (startMonth === endMonth && startYear === endYear) {
    const monthName = start.toLocaleDateString(locale, { 
      month: 'long', 
      timeZone: 'UTC' 
    });
    return `${startDay} a ${endDay} de ${monthName} de ${startYear}`;
  }
  
  // Mesmo ano, meses diferentes: "30 de março a 2 de abril de 2026"
  if (startYear === endYear) {
    const startMonthName = start.toLocaleDateString(locale, { 
      month: 'long', 
      timeZone: 'UTC' 
    });
    const endMonthName = end.toLocaleDateString(locale, { 
      month: 'long', 
      timeZone: 'UTC' 
    });
    return `${startDay} de ${startMonthName} a ${endDay} de ${endMonthName} de ${startYear}`;
  }
  
  // Anos diferentes: "28 de dezembro de 2025 a 3 de janeiro de 2026"
  const startFormatted = formatEventDate(start, locale, { year: 'numeric' });
  const endFormatted = formatEventDate(end, locale, { year: 'numeric' });
  return `${startFormatted} a ${endFormatted}`;
}
