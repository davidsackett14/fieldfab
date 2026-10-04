import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';

const ids = ['topWidth','topDepth','bottomWidth','bottomDepth','offsetX','offsetY','heightFL','heightFR','heightRL','heightRR'];
const $ = id => document.getElementById(id);
const tolerance = $('tolerance');
const viewer = $('viewer');
const state = JSON.parse(localStorage.getItem('fieldfab-state') || '{}');

const toleranceOptions = {
  imperial: [['0.015625','1/64 in'],['0.03125','1/32 in'],['0.0625','1/16 in'],['0.125','1/8 in'],['0.25','1/4 in']],
  metric: [['0.1','0.1 mm'],['0.5','0.5 mm'],['1','1 mm'],['2','2 mm'],['5','5 mm']]
};

function parseMeasurement(raw) {
  let s = String(raw).trim().replace(/[″"]/g,'').replace(/\bin(ch(es)?)?\b/gi,'').trim();
  if (!s) return NaN;
  const feet = s.match(/^(-?\d+(?:\.\d+)?)\s*['′]\s*(.*)$/);
  let total = 0;
  if (feet) { total = Number(feet[1]) * 12; s = feet[2].trim(); }
  s = s.replace(/^(\-?\d+)\-(\d+\/\d+)$/, '$1 $2');
  const mixed = s.match(/^(-?\d+(?:\.\d+)?)\s+(\d+)\/(\d+)$/);
  if (mixed) return total + Number(mixed[1]) + Math.sign(Number(mixed[1]) || 1) * Number(mixed[2]) / Number(mixed[3]);
  const fraction = s.match(/^(-?\d+)\/(\d+)$/);
  if (fraction) return total + Number(fraction[1]) / Number(fraction[2]);
  return total + Number(s || 0);
}

function gcd(a,b){ while(b){[a,b]=[b,a%b]} return a; }
function imperial(value, increment) {
  const rounded = Math.round(value/increment)*increment;
  let whole = Math.trunc(rounded); let rem = Math.abs(rounded-whole);
  const den = Math.round(1/increment); let num = Math.round(rem*den);
  if(num===den){ whole += Math.sign(rounded)||1; num=0; }
  if(!num) return `${whole} in`;
  const g=gcd(num,den); return `${whole ? whole+' ' : rounded<0?'-':''}${num/g}/${den/g} in`;
}
function format(value){ const inc=Number(tolerance.value); return $('system').value==='imperial' ? imperial(value,inc) : `${(Math.round(value/inc)*inc).toFixed(inc<1?1:0)} mm`; }
function precise(value){ return $('system').value==='imperial' ? `${value.toFixed(3)} in` : `${value.toFixed(2)} mm`; }

function populateTolerance(preserve=false){
  const system=$('system').value; const old=preserve?tolerance.value:null; tolerance.innerHTML='';
  for(const [v,label] of toleranceOptions[system]){ const o=document.createElement('option');o.value=v;o.textContent=label;tolerance.append(o); }
  if(old && [...tolerance.options].some(o=>o.value===old)) tolerance.value=old;
  else tolerance.value=state.tolerance || (system==='imperial'?'0.0625':'1');
}

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(45,1,.1,10000);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); viewer.append(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true;
scene.add(new THREE.HemisphereLight(0xffffff,0x172554,2.2));
const directional=new THREE.DirectionalLight(0xffffff,2); directional.position.set(3,-4,6); scene.add(directional);
const model=new THREE.Group(); scene.add(model);

function clearModel(){ while(model.children.length){ const o=model.children.pop(); o.geometry?.dispose(); o.material?.dispose(); } }
function edge(a,b,color=0x7dd3fc){ const g=new THREE.BufferGeometry().setFromPoints([a,b]); model.add(new THREE.Line(g,new THREE.LineBasicMaterial({color}))); }
function face(points,color){ const g=new THREE.BufferGeometry(); const p=[...points[0],...points[1],...points[2],...points[0],...points[2],...points[3]]; g.setAttribute('position',new THREE.Float32BufferAttribute(p,3)); g.computeVertexNormals(); model.add(new THREE.Mesh(g,new THREE.MeshStandardMaterial({color,transparent:true,opacity:.58,side:THREE.DoubleSide,roughness:.65}))); }

function readGeometry(){
  const v={}; for(const id of ids){v[id]=parseMeasurement($(id).value); if(!Number.isFinite(v[id])) throw new Error(`Enter a valid value for ${$(id).parentElement.textContent.trim()}.`);}
  if(['topWidth','topDepth','bottomWidth','bottomDepth','heightFL','heightFR','heightRL','heightRR'].some(k=>v[k]<=0)) throw new Error('Widths, depths, and heights must be greater than zero.');
  const bx=v.offsetX, by=v.offsetY, bw=v.bottomWidth/2, bd=v.bottomDepth/2, tw=v.topWidth/2, td=v.topDepth/2;
  const B={FL:[bx-bw,by-bd,0],FR:[bx+bw,by-bd,0],RL:[bx-bw,by+bd,0],RR:[bx+bw,by+bd,0]};
  const T={FL:[-tw,-td,v.heightFL],FR:[tw,-td,v.heightFR],RL:[-tw,td,v.heightRL],RR:[tw,td,v.heightRR]};
  return {v,B,T};
}

function rebuild(reset=false){
  try{
    const {v,B,T}=readGeometry(); $('message').textContent=''; clearModel();
    face([B.FL,B.FR,T.FR,T.FL],0x0284c7); face([B.FR,B.RR,T.RR,T.FR],0x0891b2); face([B.RR,B.RL,T.RL,T.RR],0x0e7490); face([B.RL,B.FL,T.FL,T.RL],0x0369a1);
    [['FL','FR'],['FR','RR'],['RR','RL'],['RL','FL']].forEach(([a,b])=>{edge(new THREE.Vector3(...B[a]),new THREE.Vector3(...B[b]),0xf8fafc);edge(new THREE.Vector3(...T[a]),new THREE.Vector3(...T[b]),0xf8fafc)});
    const results=[];
    for(const k of ['FL','FR','RL','RR']){ const a=new THREE.Vector3(...B[k]),b=new THREE.Vector3(...T[k]); edge(a,b,0xfbbf24); results.push([k,a.distanceTo(b)]); }
    $('results').innerHTML=results.map(([k,n])=>`<div class="result"><strong>${k} edge</strong><span>Calculated: ${precise(n)}</span><span>Fabrication: ${format(n)}</span></div>`).join('');
    const twist=Math.abs((v.heightFL+v.heightRR)-(v.heightFR+v.heightRL)); if(twist>1e-7) $('message').textContent='Notice: the four top corners are not coplanar. The model preserves the entered heights.';
    const box=new THREE.Box3().setFromObject(model); const size=box.getSize(new THREE.Vector3()); const center=box.getCenter(new THREE.Vector3()); controls.target.copy(center);
    if(reset){ const d=Math.max(size.x,size.y,size.z)*2.2; camera.position.set(center.x+d,center.y-d,center.z+d*.8); controls.update(); }
    localStorage.setItem('fieldfab-state',JSON.stringify({system:$('system').value,tolerance:tolerance.value,values:Object.fromEntries(ids.map(id=>[id,$(id).value]))}));
  } catch(err){ $('message').textContent=err.message; }
}

function resize(){ const w=viewer.clientWidth,h=viewer.clientHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
function animate(){ requestAnimationFrame(animate); controls.update(); renderer.render(scene,camera); }

if(state.system) $('system').value=state.system; if(state.values) for(const id of ids) if(state.values[id]!=null) $(id).value=state.values[id];
populateTolerance();
$('system').addEventListener('change',()=>{ populateTolerance(); rebuild(); }); tolerance.addEventListener('change',()=>rebuild());
ids.forEach(id=>$(id).addEventListener('input',()=>rebuild())); $('resetView').addEventListener('click',()=>rebuild(true));
new ResizeObserver(resize).observe(viewer); resize(); rebuild(true); animate();
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
