import { render } from '@testing-library/react'
import * as React from 'react'

import { HEREMapContext, HEREMapContextType } from '../src/context'
import Marker from '../src/Marker'

const renderWithMapContext = (
  ui: React.ReactElement,
  {
    removeFromMarkerGroup = jest.fn(),
    addToMarkerGroup = jest.fn(),
  }: Partial<Pick<HEREMapContextType, 'addToMarkerGroup' | 'removeFromMarkerGroup'>> = {},
) => {
  const map = {} as unknown as H.Map
  return render(
    ui,
    {
      wrapper: ({ children }) => (
        <HEREMapContext.Provider value={{ map, removeFromMarkerGroup, addToMarkerGroup }}>
          <div id="page-container">
            {children}
          </div>
        </HEREMapContext.Provider>
      ),
    },
  )
}

describe('<HEREMap />', () => {
  describe('<Marker />', () => {
    describe('DOM Marker', () => {
      const center = { lat: 0, lng: 0 }

      it('should render and attach to map instance', async () => {
        const addToMarkerGroup = jest.fn()

        renderWithMapContext(
            <Marker {...center}>
              <div data-testid="circle-marker" />
            </Marker>, {
              addToMarkerGroup,
            },
        )

        expect(addToMarkerGroup).toHaveBeenCalled()
      })

      it('should create a DomMarker instance', async () => {
        const addToMarkerGroup = jest.fn()

        renderWithMapContext(
          <Marker {...center}>
            <div data-testid="circle-marker" />
          </Marker>, {
            addToMarkerGroup,
          },
        )

        expect(addToMarkerGroup.mock.calls[0][0]).toBeInstanceOf(H.map.DomMarker)
      })

      it('should update marker position when props change', async () => {
        const spy = jest.spyOn(H.map.DomMarker.prototype, 'setGeometry')

        const { rerender } = renderWithMapContext(
          <Marker {...center}>
            <div data-testid="circle-marker" />
          </Marker>,
        )

        spy.mockReset()

        rerender(
          <Marker lat={1} lng={0}>
            <div data-testid="circle-marker" />
          </Marker>,
        )

        expect(spy).toHaveBeenCalled()
      })
    })

    describe('Marker w/ Bitmap Provided', () => {
      it('should create icon with bitmap', () => {
        const addToMarkerGroup = jest.fn()

        const bitmap = 'test-bitmap.png'

        renderWithMapContext(
          <Marker lat={0} lng={0} bitmap={bitmap} />,
          {
            addToMarkerGroup,
          },
        )

        expect(addToMarkerGroup).toHaveBeenCalled()
        expect(addToMarkerGroup.mock.calls[0][0]).toBeInstanceOf(H.map.Marker)
      })
    })

    describe('Default Marker', () => {
      it('should not create icon or domIcon', () => {
        const addToMarkerGroup = jest.fn()

        renderWithMapContext(
          <Marker lat={0} lng={0} />,
          {
            addToMarkerGroup,
          },
        )

        expect(addToMarkerGroup).toHaveBeenCalled()
        expect(addToMarkerGroup.mock.calls[0][0]).not.toBeInstanceOf(H.map.DomMarker)
      })
    })

    describe('Unmount', () => {
      it('should remove itself from the map on unmount', () => {
        const removeFromMarkerGroup = jest.fn()

        const { unmount } = renderWithMapContext(
          <Marker lat={0} lng={0} />,
          {
            removeFromMarkerGroup,
          },
        )

        unmount()
        expect(removeFromMarkerGroup).toHaveBeenCalled()
      })
    })
  })
})
