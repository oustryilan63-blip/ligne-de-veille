/* Implantation commune au terrain et aux illustrations. Coordonnées de sol isométriques. */
(function(root){
 const project=(x,y)=>[350+(x-y)*26,74+(x+y)*14];
 const buildings={hangar:[3,3.4],ecole:[4,7.4],atelier:[8.4,3.2],radar:[10.6,1],port:[11,5.8]};
 const units={rafale:[472,168,.8],caracal:[221,144,.7],leclerc:[319,303,.72],caesar:[220,271,.72],fremm:[602,315,.95],suffren:[534,373,.85]};
 const pads={hangar:[1.9,2.5,2.8,3],ecole:[2.85,6.5,2.8,2.9],atelier:[7.3,2.2,2.8,3],radar:[9.4,.2,2.7,2.5],port:[9.8,5.15,2.65,2.5]};
 const layout={project,buildings,units,pads,helipad:[.45,5.41]};root.QG_LAYOUT=layout;if(typeof module!=='undefined')module.exports=layout;
})(typeof window!=='undefined'?window:globalThis);
