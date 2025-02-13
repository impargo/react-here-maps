import { useEffect } from 'react'

import { DefaultLayers } from './types'

export interface UseVectorLayersProps {
  map?: H.Map,
  truckRestrictions?: boolean,
  trafficLayer?: boolean,
  useSatellite?: boolean,
  congestion?: boolean,
  defaultLayers?: DefaultLayers,
  enableVectorLayers: boolean,
}

const defaultLogisticsLayerFeatures = [
  {
    feature: 'road exit labels',
    mode: 'numbers only',
  },
  {
    feature: 'building extruded',
    mode: 'all',
  },
  {
    feature: 'building footprints',
    mode: 'all',
  },
]

const setFeatures = (style: H.map.render.harp.Style, truckRestrictions: boolean, congestion: boolean) => {
  style.setEnabledFeatures([
    ...defaultLogisticsLayerFeatures,
    ...(truckRestrictions ? [{ feature: 'vehicle restrictions' }] : []),
    ...(congestion
      ? [{ feature: 'congestion zones' }, { feature: 'environmental zones' }]
      : []),
  ])
}

export const useVectorLayers = ({
  map,
  useSatellite,
  trafficLayer,
  congestion,
  truckRestrictions,
  defaultLayers,
  enableVectorLayers,
}: UseVectorLayersProps) => {
  useEffect(() => {
    if (!map || !defaultLayers || !enableVectorLayers) {
      return
    }

    [
      defaultLayers.vector.normal.logistics,
      defaultLayers.hybrid.logistics.vector,
    ].forEach(layer => {
      const style = layer.getProvider().getStyleInternal() as H.map.render.harp.Style

      if (style.getState() === H.map.render.Style.State.READY) {
        setFeatures(style, truckRestrictions, congestion)
        return
      }

      const changeListener = () => {
        if (style.getState() === H.map.Style.State.READY) {
          style.removeEventListener('change', changeListener)
          setFeatures(style, truckRestrictions, congestion)
        }
      }
      style.addEventListener('change', changeListener)
    })
  }, [defaultLayers, map, enableVectorLayers, useSatellite, truckRestrictions, congestion])

  useEffect(() => {
    if (!map || !defaultLayers || !enableVectorLayers) {
      return
    }

    if (useSatellite) {
      map.setBaseLayer(defaultLayers.hybrid.logistics.raster)
      map.addLayer(defaultLayers.hybrid.logistics.vector)
    }

    return () => {
      map.removeLayer(defaultLayers.hybrid.logistics.vector)
      map.setBaseLayer(defaultLayers.vector.normal.logistics)
    }
  }, [defaultLayers, map, enableVectorLayers, useSatellite])

  useEffect(() => {
    if (!map || !defaultLayers || !enableVectorLayers) {
      return
    }

    if (trafficLayer) {
      map.addLayer(defaultLayers.vector.traffic.logistics)
    }

    return () => {
      map.removeLayer(defaultLayers.vector.traffic.logistics)
    }
  }, [trafficLayer, map, defaultLayers, enableVectorLayers])
}
