"use strict";
// a "normal" marker that uses a static image as an icon.
// large numbers of markers of this type can be added to the map
// very quickly and efficiently
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var React = require("react");
var ReactDOMServer = require("react-dom/server");
var PropTypes = require("prop-types");
var get_dom_marker_icon_1 = require("./utils/get-dom-marker-icon");
var get_marker_icon_1 = require("./utils/get-marker-icon");
// export the Marker React component from this module
var Marker = /** @class */ (function (_super) {
    __extends(Marker, _super);
    function Marker(props, context) {
        return _super.call(this, props, context) || this;
    }
    // change the position automatically if the props get changed
    Marker.prototype.componentWillReceiveProps = function (nextProps) {
        if (nextProps.lat !== this.props.lat || nextProps.lng !== this.props.lng) {
            this.setPosition({
                lat: nextProps.lat,
                lng: nextProps.lng
            });
        }
    };
    // remove the marker on unmount of the component
    Marker.prototype.componentWillUnmount = function () {
        var _a = this.context, map = _a.map, markersGroup = _a.markersGroup;
        if (this.marker) {
            markersGroup.removeObject(this.marker);
        }
    };
    Marker.prototype.render = function () {
        var map = this.context.map;
        if (map && !this.marker) {
            this.addMarkerToMap();
        }
        return null;
    };
    Marker.prototype.addMarkerToMap = function () {
        var _a = this.context, map = _a.map, markersGroup = _a.markersGroup;
        var _b = this.props, children = _b.children, bitmap = _b.bitmap, lat = _b.lat, lng = _b.lng;
        var marker;
        if (React.Children.count(children) > 0) {
            // if children are provided, we render the provided react
            // code to an html string
            var html = ReactDOMServer.renderToStaticMarkup((React.createElement("div", { className: "dom-marker" }, children)));
            // we then get a dom icon object from the wrapper method
            var icon = get_dom_marker_icon_1["default"](html);
            // then create a dom marker instance and attach it to the map,
            // provided via context
            marker = new H.map.DomMarker({ lat: lat, lng: lng }, { icon: icon });
            marker.draggable = this.props.draggable;
            marker.setData(this.props.data);
            markersGroup.addObject(marker);
        }
        else if (bitmap) {
            // if we have an image url and no react children, create a
            // regular icon instance
            var icon = get_marker_icon_1["default"](bitmap);
            // then create a normal marker instance and attach it to the map
            marker = new H.map.Marker({ lat: lat, lng: lng }, { icon: icon });
            markersGroup.addObject(marker);
        }
        else {
            // create a default marker at the provided location
            marker = new H.map.Marker({ lat: lat, lng: lng });
            markersGroup.addObject(marker);
        }
        this.marker = marker;
    };
    Marker.prototype.setPosition = function (point) {
        this.marker.setPosition(point);
    };
    // define the context types that are passed down from a <HEREMap> instance
    Marker.contextTypes = {
        map: PropTypes.object,
        markersGroup: PropTypes.object
    };
    Marker.defaultProps = { draggable: false };
    return Marker;
}(React.Component));
exports.Marker = Marker;
// make the Marker component the default export
exports["default"] = Marker;