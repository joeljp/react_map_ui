import React from "react";
import ReactDOM from "react-dom";

import MultiRangeSlider from "./multiRangeSlider";

const Checkbox = (props) => {
    return (
	<label>
	    {props.label}
	    <input type="checkbox" defaultChecked onChange={props.onChange}/>
	</label>
    );
};

export default function Menu(props){
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
