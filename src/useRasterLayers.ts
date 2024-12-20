import { useEffect, useMemo } from 'react'

import type { DefaultLayers } from './types'
import getPlatform from './utils/get-platform'

export interface UseRasterLayersProps {
  map?: H.Map,
  truckRestrictions?: boolean,
  trafficLayer?: boolean,
  useSatellite?: boolean,
  congestion?: boolean,
  defaultLayers?: DefaultLayers,
  apiKey: string,
  useVectorTiles: boolean,
  locale?: string,
}

const getBaseLayer = ({
  apiKey,
  locale,
  congestion,
  trafficLayer,
}: Pick<UseRasterLayersProps, 'apiKey' | 'locale' | 'congestion' | 'trafficLayer'>) => {
  const lang = locale ?? 'en'

  const platform = getPlatform({
    apikey: apiKey,
  })

  const service = platform.getRasterTileService({
    queryParams: {
      lang,
      style: trafficLayer ? 'lite.day' : 'logistics.day',
      ...(congestion
        ? {
          features: 'environmental_zones:all,congestion_zones:all',
        }
        : {}),
    },
  })

  const provider =
    new H.service.rasterTile.Provider(service, { engineType: H.Map.EngineType.HARP })

  return new H.map.layer.TileLayer(provider)
}

const getTruckOverlayLayer = ({
  apiKey,
  locale,
}: Pick<UseRasterLayersProps, 'apiKey' | 'locale'>) => {
  const lang = locale ?? 'en'

  const platform = getPlatform({
    apikey: apiKey,
  })

  const truckOnlyTileService = platform.getRasterTileService({
    resource: 'blank',
    queryParams: {
      features: 'vehicle_restrictions:active_and_inactive',
      style: 'logistics.day',
      lang,
    },
  })

  const truckOverlayProvider =
    new H.service.rasterTile.Provider(truckOnlyTileService, { engineType: H.Map.EngineType.HARP })

  return new H.map.layer.TileLayer(truckOverlayProvider)
}

export const useRasterLayers = ({
  map,
  useSatellite,
  trafficLayer,
  congestion,
  truckRestrictions,
  defaultLayers,
  apiKey,
  locale,
  useVectorTiles,
}: UseRasterLayersProps) => {
  const truckOverlayLayer = useMemo(() => map && getTruckOverlayLayer({
    apiKey,
    locale,
  }), [apiKey, locale, map])

  const baseLayer = useMemo(() => map && getBaseLayer({
    apiKey,
    locale,
    congestion,
    trafficLayer,
  }), [apiKey, locale, congestion, trafficLayer, map])

  useEffect(() => {
    if (!map || !defaultLayers || !baseLayer || useVectorTiles) {
      return
    }

    const satelliteBaseLayer = defaultLayers?.raster.satellite.map
    map.setBaseLayer(useSatellite ? satelliteBaseLayer : baseLayer)
  }, [map, useSatellite, defaultLayers, baseLayer, useVectorTiles])

  useEffect(() => {
    if (!map || !truckOverlayLayer) {
      return
    }

    if (truckRestrictions && !useVectorTiles) {
      map.addLayer(truckOverlayLayer)
    } else {
      map.removeLayer(truckOverlayLayer)
    }
  }, [truckRestrictions, map, useVectorTiles, truckOverlayLayer])

  useEffect(() => {
    if (!map || !defaultLayers) {
      return
    }

    if (trafficLayer && !useVectorTiles) {
      map.addLayer(defaultLayers.vector.traffic.logistics)
    } else {
      map.removeLayer(defaultLayers.vector.traffic.logistics)
    }
  }, [trafficLayer, map, defaultLayers, useVectorTiles])
}
