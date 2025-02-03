import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import { HEREMap } from '../src/HEREMap'
import { Marker } from '../src/Marker'
import { Polyline } from '../src/Polyline'
import points from './points.json'

if (!process.env.HERE_APIKEY) {
  console.error('Missing HERE_APIKEY environment variable.')
  process.exit(1)
}

const MapAndControls = () => {
  const [useVectorTiles, setUseVectorTiles] = useState(false)
  const [enableSatellite, setEnableSatellite] = useState(false)
  const [enableTruckLayer, setEnableTruckLayer] = useState(true)
  const [enableActiveAndInactiveTruckRestrictions, setEnableActiveAndInactiveTruckRestrictions] = useState(false)
  const [enableCongestionLayer, setEnableCongestionLayer] = useState(false)
  const [enableTrafficLayer, setEnableTrafficLayer] = useState(false)
  const [showExampleRouteAndMarkers, setShowExampleRouteAndMarkers] = useState(true)

  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
      <div style={{ flex: '1', height: '100%' }}>
        <HEREMap
          apiKey={process.env.HERE_APIKEY!}
          center={{ lat: 51.528098, lng: 9.951222 }}
          zoom={6}
          useVectorTiles={useVectorTiles}
          useSatellite={enableSatellite}
          truckRestrictions={enableTruckLayer}
          showActiveAndInactiveTruckRestrictions={enableActiveAndInactiveTruckRestrictions}
          congestion={enableCongestionLayer}
          trafficLayer={enableTrafficLayer}
          onMapAvailable={() => console.log('Map is available')}
          hidpi={devicePixelRatio > 1}
        >
          {showExampleRouteAndMarkers && <>
            <Polyline
              points={points}
              style={{
                fillColor: 'white',
                strokeColor: 'rgba(49, 95, 225, 0.8)',
                lineWidth: 8,
              }}
            />
            <Polyline
              points={points}
              style={{
                strokeColor: 'white',
                lineWidth: 8,
                // HARP
                // lineDashImage: H.map.SpatialStyle.DashImage.ARROW,
                // lineDash: [1, 4],
                // WEBGL
                lineTailCap: 'arrow-tail',
                lineHeadCap: 'arrow-head',
                lineDash: [0, 4],
              }}
            />
            <Marker
              lat={points[0].lat}
              lng={points[0].lng}
              draggable
            />
            <Marker
              lat={points[points.length - 1].lat}
              lng={points[points.length - 1].lng}
              draggable
            />
          </>}
        </HEREMap>
      </div>
      <div style={{ width: '240px', display: 'flex', flexDirection: 'column', padding: '8px' }}>
      <label>
          <input
            type='checkbox'
            onChange={event => setUseVectorTiles(event.target.checked)}
            checked={useVectorTiles}
          />
          Use vector tiles
        </label>
        <label>
          <input
            type='checkbox'
            onChange={event => setEnableSatellite(event.target.checked)}
            checked={enableSatellite}
          />
          Satellite
        </label>
        <label>
          <input
            type='checkbox'
            onChange={event => setEnableTruckLayer(event.target.checked)}
            checked={enableTruckLayer}
          />
          Truck restrictions layer
        </label>
        <label>
          <input
            type='checkbox'
            onChange={event => setEnableActiveAndInactiveTruckRestrictions(event.target.checked)}
            checked={enableActiveAndInactiveTruckRestrictions}
          />
          Show active and inactive truck restrictions
        </label>
        <label>
          <input
            type='checkbox'
            onChange={event => setEnableCongestionLayer(event.target.checked)}
            checked={enableCongestionLayer}
          />
          Congestion layer
        </label>
        <label>
          <input
            type='checkbox'
            onChange={event => setEnableTrafficLayer(event.target.checked)}
            checked={enableTrafficLayer}
          />
          Traffic layer
        </label>
        <label>
          <input
            type='checkbox'
            onChange={event => setShowExampleRouteAndMarkers(event.target.checked)}
            checked={showExampleRouteAndMarkers}
          />
          Show example route & markers
        </label>
      </div>
    </div>
  )
}

ReactDOM.render(
  <MapAndControls />,
  document.getElementById('root'),
)
