export interface DefaultLayers {
  raster: {
    normal: {
      map: H.map.layer.BaseTileLayer,
      base: H.map.layer.BaseTileLayer,
    },
    satellite: {
      map: H.map.layer.BaseTileLayer,
    },
  },
  vector: {
    normal: {
      map: H.map.layer.BaseTileLayer,
      logistics: H.map.layer.BaseTileLayer,
      traffic: H.map.layer.TileLayer,
    },
    traffic: {
      logistics: H.map.layer.TileLayer,
    },
  },
  hybrid: {
    logistics: {
      raster: H.map.layer.BaseTileLayer,
      vector: H.map.layer.TileLayer,
      traffic: H.map.layer.TileLayer,
    },
    day: {
      raster: H.map.layer.BaseTileLayer,
      vector: H.map.layer.TileLayer,
    },
  },
}
