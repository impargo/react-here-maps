const SUPPORTED_UI_LOCALES = [
  'en-US' as const,
  'de-DE' as const,
  'es-ES' as const,
  'fi-FI' as const,
  'fr-FR' as const,
  'it-IT' as const,
  'nl-NL' as const,
  'pl-PL' as const,
  'pt-BR' as const,
  'pt-PT' as const,
  'ru-RU' as const,
  'tr-TR' as const,
  'zh-CN' as const,
]

type SupportedLanguage = typeof SUPPORTED_UI_LOCALES[0]

const SUPPORTED_UI_LOCALES_MAP: Record<string, SupportedLanguage> = {
  en: 'en-US',
  de: 'de-DE',
  es: 'es-ES',
  fi: 'fi-FI',
  fr: 'fr-FR',
  it: 'it-IT',
  nl: 'nl-NL',
  pl: 'pl-PL',
  pt: 'pt-PT',
  ru: 'ru-RU',
  tr: 'tr-TR',
  zh: 'zh-CN',
}

export const getUILanguage = (language: string) => {
  if (SUPPORTED_UI_LOCALES.includes(language as SupportedLanguage)) {
    return language
  }

  return SUPPORTED_UI_LOCALES_MAP[language] ?? 'en-US'
}

export const getTileLanguage = (language: string) => language.split('-')[0]
