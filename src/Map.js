import React, { useState, useRef, useEffect, useCallback } from "react";
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
//export default function Map({ apiKey, center, paths = [], point, coords, zoom }) {
export default function Map({ apiKey, center, callback, coords, zoom }) {
    // Define refs for Polygon instance and listeners
    let enveloped = [];
//    let polyid = 0;
    const polyHash = useRef({});
//    const markerHash = useRef({});
    for(let i = 0; i < coords.length; i++){
//	markerHash.current[coords[i].id] = i;
    }
//    const markerA = useRef(markers(coords));
//    const [path, setPath] = useState();
    const [state, setState] = useState({
	drawingMode: "polygon"
    });
/*    
    useEffect(() => {
	setPath(paths);
    }, [paths]);
*/
    const [polyid, polyidinc] = useState(0);
    
    let all_locations = [...coords];
    const [ id, setId ] = useState(0);
    const [ markers, setMarkers] = useState([...coords.values()]);
    const [ drawMarker, setDrawMarker ] = useState(false);
    const addMarker = (coords) => {
	//	setId((id)=>id+1);
	setId((id)=>coords.id);
//	console.log("adding " + coords.id);
//	console.log(coords);
//	console.log(id);
//	setMarkers((markers) => markers.concat([{coords, id}]) )
    }
//    console.log(markerHash.current);
    const updateMarkers = (env) => {
	for(const [k,v] of Object.entries(coords)){
	    if(!env.includes(v.id)){
		coords[k].selected = false;
//		coords[k].visibility = false;
	    }
	    else{
		coords[k].selected = true
//		coords[k].visibility = true;
	    }
	}
	setMarkers([...coords.values()]);
    };
    
    const toggleMarkers = () => {
//	console.log("toggle: " + all_locations[0].id);
	setDrawMarker(()=>!drawMarker)	
	if(drawMarker){
	    console.log("We're in!");
	    console.log(coords.length + " == " + all_locations.length);
//	    coords = [...all_locations];
	    console.log(coords.length);
	    for(const [k,v] of Object.entries(coords)){coords[k].visibility = true;}
	    setMarkers(markers => [...coords.values()]);
	    while(coords.length > 0 && false){
//		let c = coords.shift();
//		console.log(c);
//		c.coords.id = c.id;
//		addMarker(c.coords);
	    }
	    return;
	}
	for(const [k,v] of Object.entries(coords)){coords[k].visibility = false;}
	setMarkers([...coords.values()]);
    }
    const onPolygonComplete = React.useCallback(
	function onPolygonComplete(poly) {
	    const path = poly.getPath();
	    poly.id = polyid.toString();
	    poly.addListener("click", function(){
		poly.setMap(null);
		delete polyHash.current[poly.id];
		enveloped = polygonsContain(polyHash.current,coords);
		updateMarkers(enveloped);
		callback(enveloped);
	    });
//	    poly.addListener("drag", function(){
//		console.log(".");
//	    });
	    path.addListener("set_at", function(){
		enveloped = polygonsContain(polyHash.current,coords);
		updateMarkers(enveloped);
		callback(enveloped);
	    });
	    path.addListener("remove_at", function(){
		enveloped = polygonsContain(polyHash.current,coords);
		updateMarkers(enveloped);
		callback(enveloped);
	    });
	    path.addListener("insert_at", function(){
		enveloped = polygonsContain(polyHash.current,coords);
		updateMarkers(enveloped);
		callback(enveloped);
	    });
	    polyHash.current[polyid.toString()] = poly;
	    console.log(polyid);
	    polyidinc(polyid => polyid+1);
//	    polyid++;
	    console.log(polyid);
	    enveloped = polygonsContain(polyHash.current,coords);

	    for(let j = 0; j < enveloped.length; j++){
//		let index = markerHash.current[enveloped[j]];
//		console.log("removing: " + enveloped[j] + " with index: "+index);
//		console.log(markerA.props.children[index]);
		//		console.log(markerA.props.children[index]);
//		console.log(markerA.current.props.children[index].key);
//		markerA.current.props.children[index].props.icon = dot;
	    }
//	    for(let m of markerA.current){
//		m.setMap(null);
	    //	    }
	    updateMarkers(enveloped);
	    callback(enveloped);
	    return;
	},
    );
    const initMarkers = (a) => {
	while(a.length > 0){
	    let c = a.shift();
	    console.log(c.id);
//	    c.coords.id = c.id;
	    addMarker(c.coords);
	}
    };
    while(false && coords.length > 0){
	console.log(`--- > ${coords.length} - ${all_locations.length}` );
	let c = coords.shift();
	c.coords.id = c.id;
	addMarker(c.coords);
    }
//    initMarkers(coords);
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
		    //onLoad={onLoad}
//		    onClick={(e)=> addMarker(e.latLng.toJSON())}
		    //		    onClick={(e)=> setMarkers([])}
		    onClick={(e)=> toggleMarkers(all_locations)}
		>
		    <DrawingManager
			drawingMode={state.drawingMode}
			options={options}
			onPolygonComplete={onPolygonComplete} // the one we need
		    />
		{
		    markers ? (
			markers.map((marker) => {
//			    console.log(marker);
			    return (
				<Marker position={marker.coords} key={marker.coords.id} icon={{url: (marker.selected?green:dot), Size: 10}} title={coords.id} visible={marker.visibility} />
//				<Marker
//				    key={marker.id}
//				    icon={{url: dot, Size: 1000}}
//				    draggable={true}
//				    position={marker.coords}
//				    onDragEnd={e => marker.coords = e.latLng.toJSON()}
//				/>
			    )
			})
		    ) : null
		}

//		    coords.map((coord) => marker(coord))
//		    markerA.current
//		}
		</GoogleMap>
	</LoadScriptOnlyIfNeeded>
	</div>
    );
}

function marker_(coord){
//    console.log(coord);
    return(<Marker position={coord} key={coord.id} icon={{url: green, Size: 100}} title={coord.id} ref={React.createRef()} />);
}
/*
function markers(coords){
    const markers = coords.map((coord) =>
	marker(coord)
//	<Marker position={coord} key={coord.id} icon={{url: yel, Size: 100}} title={coord.id} />
    );
    return (
	<>
	    {markers}
	</>
    );
}
*/
