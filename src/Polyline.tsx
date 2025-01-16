import { FC, useContext, useEffect, useMemo, useState } from 'react'

import { HEREMapContext, HEREMapContextType } from './context'
import { EventHandlers, useEventHandlers } from './useEventHandlers'

const defaultMapStyles: H.map.SpatialStyle.Options = {
  fillColor: 'blue',
  strokeColor: 'blue',
  lineWidth: 4,
}

export interface PolylineProps extends EventHandlers {
  points?: H.geo.IPoint[],
  data?: object,
  zIndex?: number,
  style?: H.map.SpatialStyle.Options,
  draggable?: boolean,
}

export const Polyline: FC<PolylineProps> = ({
  style = defaultMapStyles,
  data,
  zIndex,
  points,
  onPointerMove,
  onPointerLeave,
  onPointerEnter,
  onDrag,
  onDragEnd,
  onDragStart,
  onTap,
  draggable,
}) => {
  const { routesGroup } = useContext<HEREMapContextType>(HEREMapContext)
  const [polyline, setPolyline] = useState<H.map.Polyline>(null)

  const line = useMemo(() => {
    const shape = new H.geo.LineString()
    points.forEach((point) => {
      const { lat, lng } = point
      shape.pushPoint(new H.geo.Point(lat, lng))
    })
    return shape
  }, [points])

  useEventHandlers(polyline, {
    onDrag,
    onDragEnd,
    onDragStart,
    onPointerEnter,
    onPointerLeave,
    onPointerMove,
    onTap,
  })

  useEffect(() => {
    if (polyline && typeof draggable === 'boolean') {
      polyline.draggable = draggable
    }
  }, [polyline, draggable])

  useEffect(() => {
    polyline?.setGeometry(line)
  }, [line])

  useEffect(() => {
    polyline?.setData(data)
  }, [data])

  useEffect(() => {
    polyline?.setZIndex(zIndex)
  }, [zIndex])

  useEffect(() => {
    polyline?.setStyle(style)
  }, [style])

  useEffect(() => {
    if (!routesGroup) {
      return
    }

    const routeLine = new H.map.Polyline(line, { style, zIndex, data })
    routesGroup.addObject(routeLine)
    setPolyline(routeLine)
    return () => {
      routesGroup.removeObject(routeLine)
    }
  }, [routesGroup])

  return null
}

export default Polyline
