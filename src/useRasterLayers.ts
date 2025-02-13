import { useEffect, useMemo } from 'react'

import type { DefaultLayers } from './types'
import { getPlatform } from './utils/get-platform'
import { getTileLanguage } from './utils/languages'

export interface UseRasterLayersProps {
  map?: H.Map,
  truckRestrictions?: boolean,
  showActiveAndInactiveTruckRestrictions?: boolean,
  trafficLayer?: boolean,
  useSatellite?: boolean,
  congestion?: boolean,
  defaultLayers?: DefaultLayers,
  apiKey: string,
  enableRasterLayers: boolean,
  language: string,
  hidpi?: boolean,
}

const getBaseLayer = ({
  apiKey,
  language,
  congestion,
  trafficLayer,
  hidpi,
}: Pick<UseRasterLayersProps, 'apiKey' | 'language' | 'congestion' | 'trafficLayer' | 'hidpi'>) => {
  const lang = getTileLanguage(language)

  const platform = getPlatform({
    apikey: apiKey,
  })

  const service = platform.getRasterTileService({
    queryParams: {
      lang,
      ppi: hidpi ? 200 : 100,
      style: trafficLayer ? 'lite.day' : 'logistics.day',
      ...(congestion
        ? {
          features: 'environmental_zones:all,congestion_zones:all',
        }
        : {}),
    },
  })

  const provider =
    new H.service.rasterTile.Provider(service, { engineType: H.Map.EngineType.HARP, tileSize: 256 })

  return new H.map.layer.TileLayer(provider)
}

const getTruckOverlayLayer = ({
  apiKey,
  language,
  hidpi,
  showActiveAndInactiveTruckRestrictions,
}: Pick<UseRasterLayersProps, 'apiKey' | 'language' | 'hidpi' | 'showActiveAndInactiveTruckRestrictions'>) => {
  const lang = getTileLanguage(language)

  const platform = getPlatform({
    apikey: apiKey,
  })

  const truckOnlyTileService = platform.getRasterTileService({
    resource: 'blank',
    queryParams: {
      features: `vehicle_restrictions:${showActiveAndInactiveTruckRestrictions ? 'active_and_inactive' : 'permanent_only'}`,
      style: 'logistics.day',
      lang,
      ppi: hidpi ? 200 : 100,
    },
  })

  const truckOverlayProvider =
    new H.service.rasterTile.Provider(truckOnlyTileService, { engineType: H.Map.EngineType.HARP, tileSize: 256 })

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
  language,
  enableRasterLayers,
  showActiveAndInactiveTruckRestrictions,
  hidpi,
}: UseRasterLayersProps) => {
  const truckOverlayLayer = useMemo(() => map && getTruckOverlayLayer({
    apiKey,
    language,
    showActiveAndInactiveTruckRestrictions,
    hidpi,
  }), [apiKey, showActiveAndInactiveTruckRestrictions, language, hidpi, map])

  const baseLayer = useMemo(() => map && getBaseLayer({
    apiKey,
    language,
    congestion,
    trafficLayer,
    hidpi,
  }), [apiKey, language, congestion, trafficLayer, hidpi, map])

  useEffect(() => {
    if (!map || !defaultLayers || !baseLayer || !enableRasterLayers) {
      return
    }

    const satelliteBaseLayer = defaultLayers?.raster.satellite.map
    map.setBaseLayer(useSatellite ? satelliteBaseLayer : baseLayer)
  }, [map, useSatellite, defaultLayers, baseLayer, enableRasterLayers])

  useEffect(() => {
    if (!map || !enableRasterLayers || !truckOverlayLayer) {
      return
    }

    if (truckRestrictions) {
      map.addLayer(truckOverlayLayer)
    }

    return () => {
      map.removeLayer(truckOverlayLayer)
    }
  }, [truckRestrictions, map, enableRasterLayers, truckOverlayLayer])

  useEffect(() => {
    if (!map || !defaultLayers || !enableRasterLayers) {
      return
    }

    if (trafficLayer) {
      map.addLayer(defaultLayers.vector.traffic.logistics)
    }

    return () => {
      map.removeLayer(defaultLayers.vector.traffic.logistics)
    }
  }, [trafficLayer, map, defaultLayers, enableRasterLayers])
}
