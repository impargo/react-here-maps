import H from '@here/maps-api-for-javascript'
import { useEffect } from 'react'

export interface UseVectorLayersProps {
  map?: H.Map,
  truckRestrictions?: boolean,
  showActiveAndInactiveTruckRestrictions?: boolean,
  truckRestrictionsStartTime?: Date,
  truckRestrictionsEndTime?: Date,
  trafficLayer?: boolean,
  useSatellite?: boolean,
  congestion?: boolean,
  defaultLayers?: H.service.Platform.DefaultLayers,
  enableVectorLayers: boolean,
}

const vectorAndRasterFeatures = [
  {
    feature: 'road exit labels',
    mode: 'numbers only',
  },
  {
    feature: 'traffic lights',
    mode: 'all',
  },
]

const vectorOnlyFeatures = [
  {
    feature: 'building extruded',
    mode: 'all',
  },
  {
    feature: 'building footprints',
    mode: 'all',
  },
]

const setFeatures = (
  style: H.map.render.harp.Style,
  truckRestrictions: boolean,
  showActiveAndInactiveTruckRestrictions: boolean,
  congestion: boolean,
  useSatellite: boolean,
) => {
  style.setEnabledFeatures([
    ...vectorAndRasterFeatures,
    ...(useSatellite ? [] : vectorOnlyFeatures),
    {
      feature: 'vehicle restrictions',
      mode: truckRestrictions
        ? (showActiveAndInactiveTruckRestrictions ? 'active & inactive differentiated' : 'active only')
        : 'none',
    },
    { feature: 'congestion zones', mode: congestion ? 'all' : 'none' },
    { feature: 'environmental zones', mode: congestion ? 'all' : 'none' },
  ])
}

const pad = (value: number) => `${value}`.padStart(2, '0')

// ISO8601 format: YYYY-MM-DDThh:mm
const toLocalTimestamp = (value: Date) => {
  const date = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
  const time = `${pad(value.getHours())}:${pad(value.getMinutes())}`
  return `${date}T${time}`
}

const getTimeRestriction = (startTime?: Date, endTime?: Date) => {
  const start = startTime ?? new Date()
  const end = endTime ?? start ?? endTime
  return [toLocalTimestamp(start), toLocalTimestamp(end)]
}

export const useVectorLayers = ({
  map,
  useSatellite,
  trafficLayer,
  congestion,
  truckRestrictions,
  showActiveAndInactiveTruckRestrictions,
  truckRestrictionsStartTime,
  truckRestrictionsEndTime,
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
      const provider = layer.getProvider() as H.service.omv.Provider
      const style = provider.getStyleInternal() as H.map.render.harp.Style

      provider.setTimeRestriction(getTimeRestriction(truckRestrictionsStartTime, truckRestrictionsEndTime))

      if (style.getState() === H.map.render.Style.State.READY) {
        setFeatures(style, truckRestrictions, showActiveAndInactiveTruckRestrictions, congestion, useSatellite)
        return
      }

      const changeListener = () => {
        if (style.getState() === H.map.render.Style.State.READY) {
          style.removeEventListener('change', changeListener)
          setFeatures(style, truckRestrictions, showActiveAndInactiveTruckRestrictions, congestion, useSatellite)
        }
      }
      style.addEventListener('change', changeListener)
    })
  }, [
    defaultLayers,
    map,
    enableVectorLayers,
    useSatellite,
    truckRestrictions,
    showActiveAndInactiveTruckRestrictions,
    truckRestrictionsStartTime,
    truckRestrictionsEndTime,
    congestion,
  ])

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
