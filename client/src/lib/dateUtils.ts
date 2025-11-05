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
