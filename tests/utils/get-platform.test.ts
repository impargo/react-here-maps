import { getPlatform } from '../../src/utils/get-platform'

describe('getPlatform', () => {
  it('should return same platform when called multiple times', () => {
    const platform1 = getPlatform({ apikey: 'test_apikey' })
    const platform2 = getPlatform({ apikey: 'test_apikey' })
    expect(platform1).toEqual(platform2)
  })
})
