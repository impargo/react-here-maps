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
  /**
   * @default false
   */
  hideTruckRestrictionsWhenZooming?: boolean,
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
    format: 'jpeg',
    queryParams: {
      lang,
      scale: hidpi ? 2 : 1,
      style: trafficLayer ? 'lite.day' : 'logistics.day',
      ...(congestion
        ? {
          features: 'environmental_zones:all,congestion_zones:all',
        }
        : {}),
    },
  })

  const provider =
    new H.service.rasterTile.Provider(service, { engineType: H.Map.EngineType.HARP, tileSize: hidpi ? 512 : 256 })

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
      scale: hidpi ? 2 : 1,
    },
  })

  const truckOverlayProvider =
    new H.service.rasterTile.Provider(truckOnlyTileService, { engineType: H.Map.EngineType.HARP, tileSize: hidpi ? 512 : 256 })

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
  hideTruckRestrictionsWhenZooming,
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
    if (!map || !enableRasterLayers || !truckOverlayLayer || !truckRestrictions) {
      return
    }

    const syncEventListener = (e: H.map.ChangeEvent) => {
      if (e.oldValue.lookAt.zoom !== e.newValue.lookAt.zoom) {
        map.removeLayer(truckOverlayLayer)
      }
    }

    const mapViewChangeEndEventListener = () => {
      const dataModelLayers = map.getLayers().asArray()
      if (dataModelLayers.indexOf(truckOverlayLayer) === -1) {
        map.getLayers().add(truckOverlayLayer)
      }
    }

    if (hideTruckRestrictionsWhenZooming) {
      // Listen for changes in the view model, i.e. position, zoom level
      // Remove the overlay only if the zoom level changes, i.e. during the zoomin/out operation
      // In fact, we want the overlay to stay visible during panning operations
      map.getViewModel().addEventListener('sync', syncEventListener)

      // Listen for the mapviewchangeend event.
      // We want to re-add the overlay at the end of the interaction with the map, either panning or zoomin/out.
      // Specifically, we re-add the overlay only if the layer is not already present in the layers stack
      map.addEventListener('mapviewchangeend', mapViewChangeEndEventListener)
    }

    map.addLayer(truckOverlayLayer)

    return () => {
      map.removeLayer(truckOverlayLayer)
      map.getViewModel().removeEventListener('sync', syncEventListener)
      map.removeEventListener('mapviewchangeend', mapViewChangeEndEventListener)
    }
  }, [truckRestrictions, map, enableRasterLayers, truckOverlayLayer, hideTruckRestrictionsWhenZooming])

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
