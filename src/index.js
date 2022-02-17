import React from "react";
import ReactDOM from "react-dom";

import $ from 'jquery';
import {Sets} from './sets.js';


import Map from "./Map";
//import "./styles.css";

//import { makeStyles } from "@material-ui/core/styles";

import coords from "./coords.json";
import meta from "./meta.json";

const API_KEY = "AIzaSyCeGVnQFiyEzY0bOKoaLt-GZxjdztiG8gc";

const center = {
    lat: 64.92379165427583,
    lng: 16.706251160048125
};

export default class App extends React.Component {
  constructor(props) {
//    let tri = [{ lat: 64.5, lng: 15.3},{ lat: 62.4, lng: 13.3 },{ lat: 62.5, lng: 15.4 } ];
    super(props);
    this.state = {
      paths: []
    };
  }

  render() {
    const { paths } = this.state;
    const c = [];
    Sets.initSuperSet(meta);
    let locs = Object.keys(Sets.SuperSet["place"]);
      $.each(locs, function(j,loc){
	  c.push({id: loc, lat: coords[loc][0],lng: coords[loc][1]});
      });  
    return (
      <div>
        <Map
            apiKey={API_KEY}
            center={center}
            paths={paths}
            point={paths => this.setState({ paths })}
	    coords={c}
	    zoom={4.7}
        />
        })}
      </div>
    );
  }
}

//export default withStyles(useStyles)(App);
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
//https://stackoverflow.com/questions/59627596/react-js-delete-point-from-the-path-update-the-polygon
