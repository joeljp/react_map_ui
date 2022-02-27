import React, {useState} from "react";
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

export default class App extends React.Component {
    constructor(props) {
	Sets.initSuperSet(meta);
	super(props);
	this.state = {
	    paths: [],
	    tids: [],
	    locs: Object.keys(Sets.SuperSet["place"]),
	    menu_data: initMenuData(Sets.SuperSet)
	};
    }
    mapCallback = (d) => {
	console.clear();
	console.log(d.length);
	Sets.remove_active_set("place");
	d.forEach(
	    function(e){
		Sets.add_set("place", e);
	    }
	);
    }
    intervalCallback = (d) => {
	Sets.interval_add_set(d[0],d[1],d[2]);
    }
    discreteCallback = (d) => {
	d.checked ? Sets.add_set(d.cat,d.val) : Sets.rem_set(d.cat,d.val);
    }
    
    render() {
	const { paths } = this.state;
	const c = [];
	Sets.initActiveSets(this.state.menu_data);
	for(let j = 0; j < this.state.locs.length; j++){
	    let loc = this.state.locs[j];
	    c.push({id: loc, visibility: true, selected: true, coords:{id: loc, lat: coords[loc][0],lng: coords[loc][1]}});
	}
	return (
	    <div id="grid">
		<div className="head" id="head">
		    <button onClick={() => console.log(Sets.select_tids())}>
			{"tids"}
		    </button>
		    <button onClick={() => console.log(Sets.select_tids())}>
			{"tods"}
		    </button>
		</div>
		<div className="inner-grid">
		    <Menu
			meta={this.state.menu_data}
			interval={(d)=> this.intervalCallback(d)} 
			discrete={(d) => this.discreteCallback(d)}
		    />
		</div>
		<Map
		    apiKey={API_KEY}
		    center={center}
		    callback={(d) => this.mapCallback(d)}
		    coords={c}
		    zoom={zoom}
		/>
	    </div>
	);
    }
}

/* Some auxfuns */

function initActiveSets(data){ // No longer in use
    console.log(data);
    data.forEach(
	function(d){
	    if(d.type == "discrete"){
		d.val.forEach(
		    function(v){
			Sets.add_set(d.key,v);
		    }
		);
	    }
	    if(d.type == "interval"){
		console.log(d);
		if(d.nulls){
		    Sets.add_set(d.key,null);
		}
		Sets.interval_add_set(d.key,d.val.min,d.val.max);
	    }
	}
    );
}

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
    let min = 999999;
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

