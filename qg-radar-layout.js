/* Implantation commune au terrain et aux illustrations. Coordonnées de sol isométriques. */
(function(root){
 const project=(x,y)=>[350+(x-y)*26,74+(x+y)*14];
 const buildings={hangar:[3.2,3.2],ecole:[1.8,7.7],atelier:[8.5,3.7],radar:[10.9,1.4],port:[11.2,6.5]};
 const units={rafale:[472,168,.8],caracal:[221,144,.7],leclerc:[319,303,.72],caesar:[220,271,.72],fremm:[602,315,.95],suffren:[534,373,.85],griffon:[367,278,.65],nh90:[271,110,.7],a400m:[378,191,.85]};
 const pads={hangar:[2.1,2.55,3.4,1.5],ecole:[.8,7.15,2.15,1.6],atelier:[7.45,3.05,2.55,1.65],radar:[10,.8,1.9,1.7],port:[10.35,5.8,1.9,1.8]};
 const roads=[[5.74,1.65,.52,8.65],[-.25,4.75,12.4,.5]];
 const access=[[5.2,3.15,.65,.4],[4.95,3.55,.35,1.45],[10.72,2.35,.36,2.55],[10.85,5.05,.5,1.05],[5.1,9.25,.65,.4],[6.2,9.12,.6,.4],[6.2,6.76,.85,.4]];
 const parking=[[3.85,9.1,1.4,1.15],[6.55,8.05,1.65,1.3],[7,6.65,1.55,1.25]];
 const paths=[[1.62,5.05,.36,2.2]];
 // Correct display perspective without rotating vertical walls or altering the originals.
 // Ground slopes become +14/26 and -14/26 in all building families.
 const axes={hangar:[.35,-.52],atelier:[.38,-.49],ecole:[.45,-.59],radar:[.48,-.40],port:[.40,-.46]};
 const alignment=Object.fromEntries(Object.entries(axes).map(([id,[left,right]])=>{const vertical=(28/26)/(left-right);return [id,{shear:14/26-left*vertical,vertical}];}));
 const trees=[[0,3],[.1,6.4],[1,9.9],[3.7,7.4],[8.5,-.15],[12,2.3],[9,9.8],[9.8,8.3],[8.8,5.9]];
 const layout={project,buildings,units,pads,roads,access,parking,paths,alignment,trees,helipad:[.45,5.41],helipads:[[.45,5.41],[.12,3.16]]};root.QG_LAYOUT=layout;if(typeof module!=='undefined')module.exports=layout;
})(typeof window!=='undefined'?window:globalThis);
