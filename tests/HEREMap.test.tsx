import { render, waitFor } from '@testing-library/react'
import React, { useContext } from 'react'

import { HEREMapContext } from '../src/context'
import HEREMap, { HEREMapProps } from '../src/HEREMap'
import { getPlatform } from '../src/utils/get-platform'

const renderMap = (props?: Partial<HEREMapProps>) => {
  return render(
    <HEREMap
      apiKey='test_apikey'
      center={{ lat: 0, lng: 0 }}
      zoom={14}
      {...props}
    />,
  )
}

jest.mock('../src/utils/get-platform.ts', () => {
  return {
    getPlatform: jest.fn(jest.requireActual('../src/utils/get-platform.ts').getPlatform),
  }
})

describe('<HEREMap />', () => {
  it('should create or get platform on mount', () => {
    renderMap()
    expect(getPlatform).toHaveBeenCalled()
  })

  it('should generate a map when the component gets rendered', () => {
    const onMapAvailable = jest.fn()
    renderMap({ onMapAvailable })
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
    expect(onMapAvailable).toHaveBeenCalled()
  })

  it('should provide context to children', async () => {
    const Child = () => {
      const { map } = useContext(HEREMapContext)
      return map ? <div data-testid='has-map-context' /> : null
    }
    const { queryByTestId } = renderMap({ children: <Child /> })
    await waitFor(() => {
      expect(queryByTestId('has-map-context')).toBeInTheDocument()
    })
  })
})
