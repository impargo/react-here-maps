react-here-maps
==============

React Wrapper for the HERE Maps API for JavaScript (v3.1)

Dependencies
--------------

The module is dependant on @here/maps-api-for-javascript packaged and hosted by HERE. To make sure it installs correctly in your environment, make sure you have the correct registry URL configured.

- Run this
```
npm config set @here:registry https://repo.platform.here.com/artifactory/api/npm/maps-api-for-javascript/
```
- Or, add this to your .npmrc
```
@here:registry=https://repo.platform.here.com/artifactory/api/npm/maps-api-for-javascript/
```

Quick Start
--------------

Declare your HERE Maps component using the following React syntax:

```tsx
import HEREMap from 'react-here-maps';

export const Map = () => {
    return (
        <HEREMap 
            appId="{your app_id}"
            appCode="{your app_code}"
            center={{ lat: 0, lng: 0 }}
            zoom={14}
        />
    )
}
```

If you would like to display a marker as well, you can do so as follows:

```tsx
import HEREMap, { Marker } from 'react-here-maps';

const CENTER = { lat: 0, lng: 0 };

export const Map = () => {
    return (
        <HEREMap 
            appId="{your app_id}"
            appCode="{your app_code}"
            center={CENTER}
            zoom={14}
        >
            <Marker {...CENTER}>
                <div className="circle-marker" />
            </Marker>
            <Route points={[{lat, lon}]} />
        </HEREMap>
    )
}
```

Supported Components
--------------

> This entire project is written in TypeScript, so refer to the interfaces of each of the supported components in the code.

### HEREMap
This component renders the map itself and controls the visible layers. It requires a valid `apiKey` from HERE.

#### Supported layers
- Truck restrictions
- Traffic
- Satellite
- Congestion / environmental zones
- Marker: can be rendered as a child to HEREMap to show a marker on the map.

### Marker
Can be used as a child to the map component to render a marker on the map. The content of the marker is controlled either via `children`, or the `bitmap` prop.

#### children
Any children passed to the marker will be rendered as static markup and used as a DomIcon.

### bitmap
The `bitmap` is used to create an Icon that is used as the marker. This is usually more performant than passing the `children` prop. Specially that the icons are cached.

> If neither `children` nor `bitmap` are supplied, a default icon is used.

> Supports event handling via callbacks `onTap`, `onPointerLeave`, `onPointerMove`, `onPointerEnter`, `onDragStart`, `onDrag`, and `onDragEnd`.

### Cluster
This component clusters multiple nearby markers. You can supply different icons for the clusters and for the individual data points via `getBitmapForCluster` and `getBitmapForPoint` respectively. The clustering behavior is controlled via `clusteringOptions`.

You can also provide callbacks for clicking on the cluster icon or individual markers.

### Polyline
Renders a polyline on the map by passing an array of { lat, lng } points.

> Supports event handling via callbacks `onTap`, `onPointerLeave`, `onPointerMove`, `onPointerEnter`, `onDragStart`, `onDrag`, and `onDragEnd`.

#### Direction Arrows
In the HERE HARP Engine, the route direction arrows need to be rendered separately, by using an additional `Polyline` component than the route itself.

For the arrows to show up, the style prop in the `PolyLine` needs to include a `strokeColor`, `lineWidth`, `lineDash` and a `lineDashImage`.

- `lineDash` is a tuple indicating the painted and non painted segments. The painted segment cannot be zero. Ex: [1, 5].

- `lineDashImage` can be any HTMLImageElement object. You can also used the `H.map.SpatialStyle.DashImage.ARROW` bundled by HERE.

For an example check the testbench.


Publishing a Pre-release Package Version
--------------

To generate a pre-release package from the changes in a pull request, add a `/publish` comment in the PR. This will publish a new package version and add a comment in the PR with the details of the published version.


Acknowledgment
--------------
This project was originally forked from https://github.com/Josh-ES/react-here-maps, however, this project has since deviated significantly from the original project after several rewrites to support newer HERE APIs and React versions.

Credit is due to the original creator and contributors.

The original fork can be found [here](https://github.com/impargo/react-here-maps-old-fork).
