import React, { useState, useRef, useCallback } from "react";
import {
    LoadScript,
    GoogleMap,
    DrawingManager,
    Polygon,
    Marker
} from "@react-google-maps/api";

import dot from './dot.svg';
import yel from './yellow.svg';
import green from './green.svg';
import "./styles.css";
const libraries = ["drawing", "geometry"];

const polygonOptions = {
    fillColor: `#2196F3`,
    strokeColor: `#000000`,
    fillOpacity: 0.5,
    strokeWeight: 1.0,
    clickable: true,
    editable: true,
    draggable: true,
    zIndex: 1,
};
const options = {
    drawingControl: true,
    drawingControlOptions: {
	drawingModes: ["polygon"]
    },
    polygonOptions: polygonOptions
};

const polygonsContain = (polygons,coords) => {
    let markers = [];
    for(var k in polygons){
	markers = markers.concat(polygonContains(polygons[k],coords));
    }
    markers = [...new Set(markers)];
    return markers;
}
const polygonContains = (polygon,coords) => {
    let markers = [];
    const google = window.google;
    let cl = google.maps.geometry.poly.containsLocation
    for(var j=0; j<coords.length; j++){
	const contains = cl(
	    coords[j].coords,
            polygon
	);
	if(contains){
	    markers.push(coords[j].id);
	}
    }
    return markers;
}
class LoadScriptOnlyIfNeeded extends LoadScript {
    componentDidMount() {
	const cleaningUp = true;
	const isBrowser = typeof document !== "undefined"; // require('@react-google-maps/api/src/utils/isbrowser')
	const isAlreadyLoaded =
	      window.google &&
	      window.google.maps &&
	      document.querySelector("body.first-hit-completed"); // AJAX page loading system is adding this class the first time the app is loaded
	if (!isAlreadyLoaded && isBrowser) {
	    // @ts-ignore
	    if (window.google && !cleaningUp) {
		console.error("google api is already presented");
		return;
	    }

	    this.isCleaningUp().then(this.injectScript);
	}

	if (isAlreadyLoaded) {
	    this.setState({ loaded: true });
	}
    }
}
export default function Map({ apiKey, center, callback, coords, zoom }) {
    // Define refs for Polygon instance and listeners
    let enveloped = [];
    const polyHash = useRef({});
    const [state, setState] = useState({
	drawingMode: "polygon"
    });
    const [polyid, polyidinc] = useState(0);
    
//    const [ markers, setMarkers] = useState([...coords.values()]);
    const [ drawMarker, setDrawMarker ] = useState(false);

    const onPolygonComplete = React.useCallback(
	function onPolygonComplete(poly) {
	    const path = poly.getPath();
	    poly.id = polyid.toString();
	    poly.addListener("click", function(){
		poly.setMap(null);
		delete polyHash.current[poly.id];
		enveloped = polygonsContain(polyHash.current,coords);
		callback(enveloped);
	    });
//	    poly.addListener("drag", function(){console.log("what a drag"); });
	    path.addListener("set_at", function(){
		enveloped = polygonsContain(polyHash.current,coords);
		callback(enveloped);
	    });
	    path.addListener("remove_at", function(){
		enveloped = polygonsContain(polyHash.current,coords);
		callback(enveloped);
	    });
	    path.addListener("insert_at", function(){
		enveloped = polygonsContain(polyHash.current,coords);
		callback(enveloped);
	    });
	    polyHash.current[polyid.toString()] = poly;
	    polyidinc(polyid => polyid+1);
	    enveloped = polygonsContain(polyHash.current,coords);
	    callback(enveloped);
	    return;
	},
    );
    return (
	<div className="App">
	    <LoadScriptOnlyIfNeeded
		id="script-loader"
		googleMapsApiKey={apiKey}
		libraries={libraries}
		language="no"
		region="no"
	    >
		<GoogleMap
		    mapContainerClassName="App-map"
		    center={center}
		    zoom={zoom}
		    version="weekly"
		>
		    <DrawingManager
			drawingMode={state.drawingMode}
			options={options}
			onPolygonComplete={onPolygonComplete} // the one we need
		    />
		{
		    coords ? (
			coords.map((marker) => {
			    return (
				<Marker
				    position={marker.coords}
				    key={marker.coords.id}
				    icon={{url: ((marker.polyselected && marker.selected)?green:dot), Size: 10}}
				    title={coords.id}
				    visible={marker.visibility}
				/>
			    )
			})
		    ) : null
		}
		</GoogleMap>
	</LoadScriptOnlyIfNeeded>
	</div>
    );
}
