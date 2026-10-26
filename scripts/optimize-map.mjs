// Retire uniquement les sommets répétés ou exactement alignés, sans déplacer les frontières.
export function optimizeMapPath(value){
 const rings=value.match(/M[^M]+/g);if(!rings||rings.join('')!==value)return value;
 return rings.map(ring=>{
  if(!ring.endsWith('Z'))return ring;
  const matches=[...ring.matchAll(/([ML])(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)];
  if(matches.map(m=>m[0]).join('')+'Z'!==ring||matches[0]?.[1]!=='M')return ring;
  const points=matches.map(m=>({x:Math.round(Number(m[2])*10),y:Math.round(Number(m[3])*10),text:m[2]+','+m[3]}));
  if(matches.some((m,i)=>Math.abs(Number(m[2])*10-points[i].x)>1e-7||Math.abs(Number(m[3])*10-points[i].y)>1e-7))return ring;
  const stack=[];
  for(const point of points){
   if(stack.length&&stack.at(-1).x===point.x&&stack.at(-1).y===point.y)continue;
   while(stack.length>=2){const a=stack.at(-2),b=stack.at(-1),cross=(b.x-a.x)*(point.y-b.y)-(b.y-a.y)*(point.x-b.x),direction=(b.x-a.x)*(point.x-b.x)+(b.y-a.y)*(point.y-b.y);if(cross!==0||direction<0)break;stack.pop();}
   stack.push(point);
  }
  if(stack.length>3&&stack.at(-1).x===stack[0].x&&stack.at(-1).y===stack[0].y)stack.pop();
  if(stack.length<3)return ring;
  const result=stack.map((p,i)=>(i?'L':'M')+p.text).join('')+'Z';return result.length<ring.length?result:ring;
 }).join('');
}
