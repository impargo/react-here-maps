import { useEffect, useMemo } from 'react'

import type { DefaultLayers } from './types'
import { getTileLanguage } from './utils/languages'

export interface UseRasterLayersProps {
  map?: H.Map,
  truckRestrictions?: boolean,
  trafficLayer?: boolean,
  useSatellite?: boolean,
  congestion?: boolean,
  defaultLayers?: DefaultLayers,
  apiKey: string,
  hidpi?: boolean,
  enableRasterLayers: boolean,
  language: string,
  engineType?: H.Map.EngineType,
}

export const getLayers = (
  apiKey: string,
  language: string,
  hidpi?: boolean,
) => {
  const lang = getTileLanguage(language)
  const ppi = hidpi ? 400 : 100
  const format = 'png8'

  const getTrafficOverlayProvider = (): H.map.provider.ImageTileProvider.Options => {
    return {
      getURL (col, row, level) {
        return `https://traffic.maps.hereapi.com/v3/flow/mc/${level}/${col}/${row}/${format}?apiKey=${apiKey}&ppi=${ppi}`
      },
    }
  }
  const getTrafficBaseProvider = (): H.map.provider.ImageTileProvider.Options => {
    return {
      getURL (col, row, level) {
        const style = 'lite.day'
        return `https://maps.hereapi.com/v3/base/mc/${level}/${col}/${row}/${format}?apiKey=${apiKey}&lang=${lang}&ppi=${ppi}&style=${style}`
      },
    }
  }

  const getTruckLayerProviderLegacy = (enableCongestion: boolean): H.map.provider.ImageTileProvider.Options => {
    return {
      max: 20,
      min: 8,
      getURL (col, row, level) {
        return ['https://',
          '1.base.maps.ls.hereapi.com/maptile/2.1/truckonlytile/newest/normal.day/',
          level,
          '/',
          col,
          '/',
          row,
          '/256/png8',
          '?style=fleet',
          '&apiKey=',
          apiKey,
          enableCongestion ? '&congestion' : '',
          '&lg=',
          lang,
          '&ppi=',
          hidpi ? '320' : '72',
        ].join('')
      },
    }
  }
  const truckOverlayProvider = new H.map.provider.ImageTileProvider(getTruckLayerProviderLegacy(false))
  const truckOverlayCongestionProvider = new H.map.provider.ImageTileProvider(getTruckLayerProviderLegacy(true))
  const trafficOverlayProvider = new H.map.provider.ImageTileProvider(getTrafficOverlayProvider())
  const trafficBaseProvider = new H.map.provider.ImageTileProvider(getTrafficBaseProvider())

  return {
    trafficBaseLayer: new H.map.layer.TileLayer(trafficBaseProvider),
    trafficOverlayLayer: new H.map.layer.TileLayer(trafficOverlayProvider),
    truckCongestionLayer: new H.map.layer.TileLayer(truckOverlayCongestionProvider),
    truckOverlayLayer: new H.map.layer.TileLayer(truckOverlayProvider),
  }
}

export const useLegacyRasterLayers = ({
  map,
  useSatellite,
  trafficLayer,
  congestion,
  truckRestrictions,
  defaultLayers,
  apiKey,
  language,
  hidpi,
  enableRasterLayers,
}: UseRasterLayersProps) => {
  const layers = useMemo(() => map && getLayers(
    apiKey,
    language,
    hidpi,
  ), [apiKey, language, hidpi, map])

  useEffect(() => {
    if (map && layers && enableRasterLayers && defaultLayers) {
      const satelliteBaseLayer = defaultLayers?.raster.satellite.map
      const emptyBaseLayer = defaultLayers?.raster.normal.map
      const baseLayer = useSatellite
        ? satelliteBaseLayer
        : trafficLayer
          ? layers.trafficBaseLayer
          : emptyBaseLayer

      map.setBaseLayer(baseLayer)
    }
  }, [map, useSatellite, defaultLayers, trafficLayer, enableRasterLayers, layers])

  useEffect(() => {
    if (map && layers && enableRasterLayers) {
      if (truckRestrictions) {
        if (congestion) {
          map.removeLayer(layers.truckOverlayLayer)
          map.addLayer(layers.truckCongestionLayer)
        } else {
          map.removeLayer(layers.truckCongestionLayer)
          map.addLayer(layers.truckOverlayLayer)
        }
      } else {
        map.removeLayer(layers.truckCongestionLayer)
        map.removeLayer(layers.truckOverlayLayer)
      }
    }
  }, [truckRestrictions, congestion, map, enableRasterLayers, layers])

  useEffect(() => {
    if (map && layers && enableRasterLayers) {
      if (trafficLayer) {
        map.addLayer(layers.trafficOverlayLayer)
      } else {
        map.removeLayer(layers.trafficOverlayLayer)
      }
    }
  }, [trafficLayer, map, enableRasterLayers, layers])
}
