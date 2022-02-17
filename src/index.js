import React, {useState} from "react";
import ReactDOM from "react-dom";


import "./layout.css";

import $ from 'jquery';
import {Sets} from './sets.js';

import MultiRangeSlider from "./multiRangeSlider";

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
    mapCallback = (d) =>{
	console.clear();
	console.log(d);
	Sets.remove_active_set("place");
	d.forEach(
	    function(e){
		Sets.add_set("place", e);
	    }
	);
    }
    intervalCallback = (d) =>{
//	console.clear();
	Sets.interval_add_set(d[0],d[1],d[2]);
//	console.log(Sets.activeSets[d[0]]);
    }
    discreteCallback = (d) =>{
//	console.clear();
//	console.log(d.cat,d.val);
	d.checked ? Sets.add_set(d.cat,d.val) : Sets.rem_set(d.cat,d.val);
//	console.log(Sets.activeSets);
    }
    handleClick(){alert("Menu calling!");}
    render() {
	const { paths } = this.state;
	const c = [];
	this.state.menu_data.forEach(
	    function(d){
		if(d.type == "discrete"){
		    d.val.forEach(
			function(v){
			    Sets.add_set(d.key,v);
			}
		    );
		}
		if(d.type == "interval" && d.nulls){
//		    console.log("HEY!");
		    Sets.add_set(d.key,null);
		}
	    }
	);
	console.log(Sets.activeSets);
	$.each(this.state.locs, function(j,loc){
	    c.push({id: loc, lat: coords[loc][0],lng: coords[loc][1]});
	});
	//	console.log(Sets.activeSets);
	return (
	    <div id="grid">
		<div className="head" id="head">
		    <button onClick={() => console.log(Sets.select_tids())}>
			{"tids"}
		    </button>
		</div>
		<div className="inner-grid">
		    <Menu
			meta={this.state.menu_data}
			onClick={() => this.handleClick()}
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
const Checkbox = (props) => {
    return (
	<label>
	    {props.label}
	    <input type="checkbox" defaultChecked onChange={props.onChange}/>
	</label>
    );
};

function Menu(props){
    let comps = [];
    props.meta.forEach(
	function(e){
	    if(e.type == "interval"){
		let k = e.key;
		let min = e.val.min;
		let max = e.val.max;
		comps.push(
		    <MultiRangeSlider
			cat={k}
			key={k}
			min={min}
			max={max}
			onChange={({ min, max }) => props.interval([k,min,max])}
		    />
		);
		comps.push(
		    <div className="nulls" key={k+"_null_div"}>
			<Checkbox
			    key={k+"_null"}
			    label={"null"}
			    onChange={(e) => props.discrete({cat: k,val: null,checked: e.target.checked})}
			/>
		    </div>);
		return;
	    }
	    let checks = [];
	    let k = e.key;
	    e.val.forEach(
		function(i){
		    checks.push(
			<Checkbox
			    key={k+"_"+i}
			    label={i}
			    onChange={(e) => props.discrete({cat: k,val: i,checked: e.target.checked})}
			/>
		    );
		}
	    );
	    comps.push(
		<div key={k+"_title"} className="slider__cat">
		    {k}
		</div>
	    );
	    comps.push(
		    <div key={k+"_checks"} className="container">
			{checks}
		    </div>
	    );
	});
    return (
	comps
    );
}



/*
function update(){
    let locations = new Set;
    let tids = Sets.select_tids();
    tids.forEach(function(e){
	locations.add(Sets.tid2loc[e]);
    });
    $("#n_tids").html(tids.size);
    $("#n_locs").html(locations.size);
    updateMarkers(locations);
}
*/
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

