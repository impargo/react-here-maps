import './bundle'

import { debounce, uniqueId } from 'lodash'
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

import { HEREMapContext } from './context'
import type { DefaultLayers } from './types'
import { useLegacyRasterLayers } from './useLegacyRasterLayers'
import { useRasterLayers } from './useRasterLayers'
import { useVectorLayers } from './useVectorLayers'
import { getPlatform } from './utils/get-platform'
import { getTileLanguage, getUILanguage } from './utils/languages'

export interface HEREMapProps extends H.Map.Options {
  children?: React.ReactNode,
  apiKey: string,
  animateCenter?: boolean,
  animateZoom?: boolean,
  hidpi?: boolean,
  interactive?: boolean,
  routes?: object[],
  truckRestrictions?: boolean,
  /**
   * Specify the engine type. Choose between the newer HARP engine, or the legacy P2D engine.
   * The WEBGL engine is not supported by this library.
   *
   * Note that the P2D engine is no longer supported by HERE and may be shut down at any moment.
   * It's only provided for legacy reasons for a transitional period.
   */
  engineType?: H.Map.EngineType,
  showActiveAndInactiveTruckRestrictions?: boolean,
  trafficLayer?: boolean,
  useSatellite?: boolean,
  disableMapSettings?: boolean,
  onMapAvailable?: (state: HEREMapState) => void,
  /**
   * Language code that is used both for the tile labels
   * and for the UI (if disableMapSettings is false).
   * This can be either a two-letter code (e.g. 'en') or
   * a full locale code (e.g. 'en-US' or `de-DE`).
   *
   * Note that not all languages can be used for the UI.
   * For the full list of supported languages, see
   * https://www.here.com/docs/bundle/maps-api-for-javascript-developer-guide/page/topics/map-controls-ui.html#change-the-ui-language
   *
   * @default en
   */
  language?: string,
  /**
   * Also known as environmental zones.
   */
  congestion?: boolean,
  useVectorTiles?: boolean,
}

export interface HEREMapState {
  map?: H.Map,
  behavior?: H.mapevents.Behavior,
  ui?: H.ui.UI,
  markersGroups: Record<string, H.map.Group>,
  routesGroup?: H.map.Group,
  trafficLayer?: boolean,
}

export interface HEREMapRef {
  getMap: () => H.Map,
  getElement: () => Element,
  setCenter: (point: H.geo.IPoint) => void,
  setZoom: (zoom: number) => void,
  screenToGeo: (x: number, y: number) => H.geo.Point,
  zoomOnMarkers: (animate?: number | boolean, group?: string) => void,
  zoomOnMarkersSet: (markersSet: H.map.DomMarker[], animate?: number | boolean) => void,
  addToMarkerGroup: (marker: H.map.Marker, group: string) => void,
  removeFromMarkerGroup: (marker: H.map.Marker, group: string) => void,
}

export const HEREMap = forwardRef<HEREMapRef, HEREMapProps>(({
  children,
  center,
  hidpi,
  interactive = true,
  zoom,
  useSatellite,
  trafficLayer,
  onMapAvailable,
  disableMapSettings,
  language = 'en',
  congestion,
  truckRestrictions,
  showActiveAndInactiveTruckRestrictions,
  apiKey,
  animateZoom,
  animateCenter,
  useVectorTiles,
  engineType = H.Map.EngineType.HARP,
}, ref) => {
  if (engineType === H.Map.EngineType.WEBGL) {
    throw new Error('WEBGL Engine is not supported.')
  }

  if (engineType !== H.Map.EngineType.HARP && useVectorTiles) {
    throw new Error('Vector tiles can only be used with the HARP engine.')
  }

  const uniqueIdRef = useRef<string>(uniqueId())

  const [map, setMap] = useState<H.Map>(null)
  const [routesGroup, setRoutesGroup] = useState(null)

  const markersGroupsRef = useRef<Record<string, H.map.Group>>({})

  const defaultLayersRef = useRef<DefaultLayers>(null)

  useVectorLayers({
    congestion,
    defaultLayers: defaultLayersRef.current,
    map,
    trafficLayer,
    truckRestrictions,
    useSatellite,
    enableVectorLayers: useVectorTiles,
  })

  useRasterLayers({
    apiKey,
    congestion,
    defaultLayers: defaultLayersRef.current,
    language,
    map,
    trafficLayer,
    truckRestrictions,
    showActiveAndInactiveTruckRestrictions,
    useSatellite,
    enableRasterLayers: !useVectorTiles && engineType === H.Map.EngineType.HARP,
    hidpi,
  })

  useLegacyRasterLayers({
    apiKey,
    congestion,
    defaultLayers: defaultLayersRef.current,
    language,
    map,
    trafficLayer,
    truckRestrictions,
    useSatellite,
    enableRasterLayers: !useVectorTiles && engineType === H.Map.EngineType.P2D,
    hidpi,
  })

  const unmountedRef = useRef(false)

  const screenToGeo = (x: number, y: number): H.geo.Point => {
    return map.screenToGeo(x, y)
  }

  const zoomOnMarkersGroup = (markersGroup: H.map.Group, animate: number | boolean = true) => {
    const DISTANCE_FACTOR = 0.1
    const BEARING_TOP_LEFT = 315
    const BEARING_BOTTOM_RIGHT = 135
    const boundingBox = markersGroup.getBoundingBox()
    const topLeft = boundingBox.getTopLeft()
    const bottomRight = boundingBox.getBottomRight()
    const distance = topLeft.distance(bottomRight) * DISTANCE_FACTOR
    const viewBounds = H.geo.Rect.fromPoints(
      topLeft.walk(BEARING_TOP_LEFT, distance),
      bottomRight.walk(BEARING_BOTTOM_RIGHT, distance),
    )
    if (viewBounds) { map.getViewModel().setLookAtData({ bounds: viewBounds }, animate, true) }
  }

  const zoomOnMarkers = (animate: number | boolean = true, group: string = 'default') => {
    if (map) {
      if (!markersGroupsRef.current[group]) { return }
      zoomOnMarkersGroup(markersGroupsRef.current[group], animate)
    }
  }

  const zoomOnMarkersSet = (markersSet: H.map.DomMarker[], animate: number | boolean = true) => {
    const markersGroupSet = new H.map.Group()
    markersSet.map((m) => markersGroupSet.addObject(m))
    zoomOnMarkersGroup(markersGroupSet, animate)
  }

  const addToMarkerGroup = (marker: H.map.Marker, group: string) => {
    if (!markersGroupsRef.current[group]) {
      markersGroupsRef.current[group] = new H.map.Group()
      map.addObject(markersGroupsRef.current[group])
    }
    markersGroupsRef.current[group].addObject(marker)
  }

  const removeFromMarkerGroup = (marker: H.map.Marker, group: string) => {
    if (markersGroupsRef.current[group]) {
      markersGroupsRef.current[group].removeObject(marker)
      if (markersGroupsRef.current[group].getObjects().length === 0) {
        if (map.getObjects().length > 0) {
          map.removeObject(markersGroupsRef.current[group])
        }
        markersGroupsRef.current[group] = null
      }
    }
  }

  useImperativeHandle<HEREMapRef, HEREMapRef>(ref, () => {
    return {
      addToMarkerGroup,
      getElement: () => document.querySelector(`#map-container-${uniqueIdRef.current}`),
      getMap: () => map,
      removeFromMarkerGroup,
      screenToGeo,
      setCenter: (point: H.geo.IPoint) => {
        map.setCenter(point, animateCenter)
      },
      setZoom: (newZoom: number) => {
        map.setZoom(newZoom, animateZoom)
      },
      zoomOnMarkers,
      zoomOnMarkersSet,
    }
  }, [map])

  useEffect(() => {
    if (unmountedRef.current) {
      return
    }

    // get the platform to base the maps on
    const platform = getPlatform({
      apikey: apiKey,
    })

    const ppi = engineType === H.Map.EngineType.P2D
      ? hidpi ? 320 : 72
      : undefined

    defaultLayersRef.current = platform.createDefaultLayers({
      lg: getTileLanguage(language),
      engineType,
      ppi,
    }) as DefaultLayers

    const hereMapEl = document.querySelector(`#map-container-${uniqueIdRef.current}`) as HTMLElement
    const baseLayer = useVectorTiles
      ? defaultLayersRef.current.vector.normal.logistics
      : defaultLayersRef.current.raster.normal.map
    const newMap = new H.Map(
      hereMapEl,
      baseLayer,
      {
        center,
        engineType,
        pixelRatio: hidpi ? 2 : 1,
        zoom,
      },
    )

    const routesProvider = new H.map.provider.LocalObjectProvider()
    const routesLayer = new H.map.layer.ObjectLayer(routesProvider)
    newMap.addLayer(routesLayer)

    let ui: H.ui.UI

    // make the map interactive
    // MapEvents enables the event system
    // Behavior implements default interactions for pan/zoom
    const behavior = interactive ? new H.mapevents.Behavior(new H.mapevents.MapEvents(newMap)) : undefined

    if (behavior) {
      behavior.disable(H.mapevents.Behavior.Feature.FRACTIONAL_ZOOM)

      // create the default UI for the map
      ui = H.ui.UI.createDefault(newMap, defaultLayersRef.current, getUILanguage(language))
      if (disableMapSettings) {
        ui.removeControl('mapsettings')
      }
    }

    setMap(newMap)
    setRoutesGroup(routesProvider.getRootGroup())

    onMapAvailable?.({
      behavior,
      map: newMap,
      markersGroups: markersGroupsRef.current,
      routesGroup: routesProvider.getRootGroup(),
      trafficLayer,
      ui,
    })

    return () => {
      unmountedRef.current = true
      map?.dispose()
    }
  }, [])

  useEffect(() => {
    if (map) {
      const resizeMap = () => {
        map.getViewPort().resize()
      }

      const debouncedResizeMap = debounce(resizeMap, 200)

      // make the map resize when the window gets resized
      window.addEventListener('resize', debouncedResizeMap)
      return () => {
        window.removeEventListener('resize', debouncedResizeMap)
      }
    }
  }, [map])

  return (
    <div className="heremap" style={{ height: '100%' }}>
      <div
        className="map-container"
        id={`map-container-${uniqueIdRef.current}`}
        style={{ height: '100%' }}
      >
        {map && <HEREMapContext.Provider value={{ map, routesGroup, removeFromMarkerGroup, addToMarkerGroup }}>
          {children}
        </HEREMapContext.Provider>}
      </div>
    </div>
  )
})

export default HEREMap
