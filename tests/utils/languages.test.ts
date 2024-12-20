import { getTileLanguage, getUILanguage } from '../../src/utils/languages'

describe('getUILanguage', () => {
  it('should return the same locale if supported', () => {
    expect(getUILanguage('en-US')).toBe('en-US')
    expect(getUILanguage('de-DE')).toBe('de-DE')
    expect(getUILanguage('zh-CN')).toBe('zh-CN')
  })

  it('should map 2-letter codes to full locales', () => {
    expect(getUILanguage('en')).toBe('en-US')
    expect(getUILanguage('de')).toBe('de-DE')
    expect(getUILanguage('zh')).toBe('zh-CN')
  })

  it('should return en-US for unsupported languages', () => {
    expect(getUILanguage('xx')).toBe('en-US')
    expect(getUILanguage('xx-XX')).toBe('en-US')
  })
})

describe('getTileLanguage', () => {
  it('should return 2-letter codes unchanged', () => {
    expect(getTileLanguage('en')).toBe('en')
    expect(getTileLanguage('de')).toBe('de')
    expect(getTileLanguage('zh')).toBe('zh')
  })

  it('should extract language code from locale', () => {
    expect(getTileLanguage('en-US')).toBe('en')
    expect(getTileLanguage('de-DE')).toBe('de')
    expect(getTileLanguage('zh-CN')).toBe('zh')
  })
})
