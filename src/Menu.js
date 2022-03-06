import React from "react";
import ReactDOM from "react-dom";

import MultiRangeSlider from "./multiRangeSlider";

const Checkbox = (props) => {
    return (
	<label>
	    <div className="nulls">{props.label}</div>
	    <div><input type="checkbox" defaultChecked onChange={props.onChange}/></div>
	</label>
    );
};

export default function Menu(props){
    let comps = [];
    let j = 0;
    props.meta.forEach(
	function(e){
	    let row = [];
	    row.push(
		<div className="divTableCell" key={"row_label"+j}>
		    {e.key}
		</div>
	    );
	    if(e.type == "interval"){
		let k = e.key;
		let min = e.val.min;
		let max = e.val.max;
		row.push(
			<MultiRangeSlider
			    cat={k}
			    key={k}
			    min={min}
			    max={max}
			    onChange={({ min, max }) => props.interval([k,min,max])}
			/>
 		);
		row.push(
		    <div className="divTableCell" key={k+"_null_div"}>
			<Checkbox
			    key={k+"_null"}
			    label={"null"}
			    onChange={(e) => props.discrete({cat: k,val: null,checked: e.target.checked})}
			/>
		    </div>);
		let rowID = "row_id"+j++;
		comps.push(<div key={rowID} className="divTableRow">{row}</div>);
		return;
	    }
	    let checks = [];
	    let k = e.key;
	    let nulls = false;
	    e.val.forEach(
		function(i){
		    if(i == "null"){ // Seriously?!?
			nulls = true;
		    }
		    let check = (
			<Checkbox
			    key={k+"_"+i}
			    label={i}
			    onChange={(e) => props.discrete({cat: k,val: i,checked: e.target.checked})}
			/>);
		    if(nulls){
			nulls = check;
			return;
		    }
		    checks.push(
			check
		    );
		}
	    );
	    row.push(
		<div key={k+"_checks"} className="divTableCell">
		    {checks}
		</div>
	    );
	    if(nulls){
		row.push(
		<div key={k+"_null"} className="divTableCell">
		    {nulls}
		</div>
		);
	    }
	    let rowID = "row_id"+j++;
	    comps.push(<div key={rowID} className="divTableRow">{row}</div>);
	});
    return (
	comps
    );
}
