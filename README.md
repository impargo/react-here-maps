react-here-maps
==============

React Wrapper for the HERE Maps API for JavaScript (v3.0.12.4)

Dependencies
--------------

The module will automatically load the [HERE Maps API][here-maps-link] scripts and stylesheets for you. We follow this practice because the scripts themselves are split into multiple modules and we hope to conditionally load these scripts at some point in the future based on the features that the user of the module wishes to use.

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

### Route
Renders a polyline on the map by passing an array of coordinates.

> Supports event handling via callbacks `onTap`, `onPointerLeave`, `onPointerMove`, `onPointerEnter`, `onDragStart`, `onDrag`, and `onDragEnd`.


Publishing a Pre-release Package Version
--------------

To generate a pre-release package from the changes in a pull request, add a `/publish` comment in the PR. This will publish a new package version and add a comment in the PR with the details of the published version.


Acknowledgment
--------------
This project was originally forked from https://github.com/Josh-ES/react-here-maps, however, this project has since deviated significantly from the original project after several rewrites to support newer HERE APIs and React versions.

Credit is due to the original creator and contributors.

The original fork can be found [here](https://github.com/impargo/react-here-maps-old-fork).
