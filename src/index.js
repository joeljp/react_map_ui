import React, {useState, useRef} from "react";
import ReactDOM from "react-dom";


import "./layout.css";

import {Sets} from './sets.js';

import Menu from "./Menu";
import Map from "./Map";
import config from "./config.js";

import coords from "./coords.json";
import meta from "./meta.json";

const API_KEY = config.API_KEY;
const center = config.CENTER;
const zoom = config.ZOOM;

// This is a static class
Sets.initSuperSet(meta);


export default function App(){
    const locs = Object.keys(Sets.SuperSet["place"]);
    const menu_data = initMenuData(Sets.SuperSet);
    const markers = locs.map(function(loc){
	return {id: loc, polyselected: true, selected: true, coords:{id: loc, lat: coords[loc][0],lng: coords[loc][1]}}});
    let a = Sets.initActiveSets([{type: 'discrete', key: 'place', val: locs}]);
    a = Sets.initActiveSets(menu_data, a);
    const [activeSets, aUpdate] = useState(a);
    const [c, cUpdate] = useState(markers);
    const updatePlaces = () =>{
	let locs = [...Sets.select_tids(activeSets)].map(e => Sets.tid2loc[e]);
	locs = [...new Set(locs)];
	for(const [i,v] of Object.entries(c)){
	    if(!locs.includes(v.id)){
		v.selected = false;
		continue;
	    }
	    v.selected = true;
	}
	cUpdate([...c.values()]);
    };

    const mapCallback = (d) => {
	aUpdate(Sets.remove_active_set("place", activeSets));
	d.forEach(
	    function(e){
		aUpdate(Sets.add_set("place", e, activeSets));
	    }
	);
	for(const [k,v] of Object.entries(c)){
	    if(!d.includes(v.id)){
		c[k].polyselected = false;
	    }
	    else{
		c[k].polyselected = true
	    }
	}
	cUpdate([...c.values()]);
    };
    const markerCallback = (d) =>{
	for(const [k,v] of Object.entries(c)){
	    if(!d.includes(v.id)){
		c[k].polyselected = false;
	    }
	    else{
		c[k].polyselected = true
	    }
	}
	console.log(d);
	cUpdate([...c.values()]);
    };
    const intervalCallback = (d) => {
	aUpdate(Sets.interval_add_set(d[0],d[1],d[2], activeSets));
	updatePlaces();
    };
    const discreteCallback = (d) => {
	d.checked ? aUpdate(Sets.add_set(d.cat,d.val,activeSets)) : aUpdate(Sets.rem_set(d.cat,d.val, activeSets));
	updatePlaces();
    };
    
    return (
	    <div id="grid">
		<div className="head" id="head">
		    <button onClick={() => console.log(Sets.select_tids(activeSets))}>
			{"tids"}
		    </button>
		    <button onClick={() => console.log(activeSets)}>
			{"meta"}
		    </button>
		    <button onClick={() => console.log(activeSets["place"])}>
			{"locs"}
		    </button>
		</div>
		<div className="inner-grid">
		    <div className="divTableBody">
			<Menu
			    meta={menu_data}
			    interval={(d) => intervalCallback(d)} 
			    discrete={(d) => discreteCallback(d)}
			/>
		    </div>
		</div>
		<Map
		    apiKey={API_KEY}
		    center={center}
		    callback={(d) => mapCallback(d)}
		    coords={c}
		    zoom={zoom}
		/>
	    </div>
	);
}
/* Some auxfuns */

function initMenuData(meta){
    // meta = cat -> val -> Set of tids
    let menu_data = [];
    let geo_data = ["place","geo","region","country"];
    let interval_data = ["age", "birth", "rec"];
    let discrete_data = ["sex","gender","agegroup"];
    
    for (const [key, value] of Object.entries(meta)) {
	
	if(geo_data.includes(key)){ continue; }
	
	if(interval_data.includes(key)){
	    let [min,max,nulls] = getInterval(Object.keys(value));
	    menu_data.push({type:"interval",key:key,val:{min:min,max:max},nulls:nulls});
	    continue;
	}
	menu_data.push({type:"discrete",key:key,val:Object.keys(value)});
    }
    return menu_data;
}
function getInterval(arr){
    let min = 99999999;
    let max = 0;
    var nulls = false;
    arr.forEach(
	function(e){
	    if(e == "null"){
		nulls = true;
		return;
	    }
	    e = parseInt(e); // the keys are string reps of ints (Javascript converts them to strings), so they must be correctly parsed to ints
	    if(e > max){max = e;}
	    if(e < min){min = e;}
	});
    return [min,max,nulls];
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

