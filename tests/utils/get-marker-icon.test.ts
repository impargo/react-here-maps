import getMarkerIcon, { Icons } from '../../src/utils/get-marker-icon'

describe('<HEREMap />', () => {
  describe('#getMarkerIcon(bitmap: string): H.map.Icon', () => {
    beforeEach(() => {
      Icons.clear()
    })

    it('should create a new icon instance if one does not exist', () => {
      const bitmap: string = 'https://josh-es.github.io/react-here-maps/images/map-marker.png'

      // test we get an icon instance
      const icon: H.map.Icon = getMarkerIcon(bitmap)
      expect(icon).toBeInstanceOf(H.map.Icon)
    })

    it('should add the new icon instance to the map', () => {
      const bitmap: string = 'https://josh-es.github.io/react-here-maps/images/map-marker.png'

      // expect the map size to be zero
      expect(Icons.size).toEqual(0)

      // get an icon instance
      getMarkerIcon(bitmap)

      // test that the size has increased by one
      expect(Icons.size).toEqual(1)
    })

    it('shouldn\'t create two icons for the same bitmap', () => {
      const bitmap: string = 'https://josh-es.github.io/react-here-maps/images/map-marker.png'

      // get an icon instance
      getMarkerIcon(bitmap)

      // test that the size has increased to one
      expect(Icons.size).toEqual(1)

      // get a second icon instance
      getMarkerIcon(bitmap)

      // test that the size is still one
      expect(Icons.size).toEqual(1)
    })
  })
})
