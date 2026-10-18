const $=id=>document.getElementById(id);
const money=n=>'$'+Math.round(n).toLocaleString('en-US');
function isPeak(){const n=new Date();const d=String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');return d>=D.A.ps&&d<=D.A.pe;}
let VIEW='cust', MODE='conv';
function uniq(a){return [...new Set(a)];}
function stageOf(c){if(/Modulating/.test(c))return 'Modulating';if(/Variable/.test(c))return 'Variable';if(/Two Stage/.test(c))return 'Two Stage';return 'Single Stage';}
function effOf(c){return c.split(' ')[0];}
// Goodman numbering: [prefix][efficiency 80|96|97][capacity digits][airflow digit][revision]
function btuOf(m){const e=m.match(/(80|96|97)/);if(!e)return null;
 let rest=m.slice(m.indexOf(e[0])+2).replace(/[A-Z]+$/,'');
 if(!/^\d+$/.test(rest))return null;
 return parseInt(rest.slice(0,-1),10)*1000;}
function opt(v,sel,label){return '<option value="'+v+'"'+(String(v)===String(sel)?' selected':'')+'>'+(label||v)+'</option>';}

// Furnaces whose category indicates a communicating control
function isComm(c){return /Communicating|Variable|Modulating/.test(c);}
let TIER='good';   // which g4b card sets the furnace requirement

function furnacePool(){
 const eff=$('feff').value, air=$('fair').value;
 const pool=D.f.filter(f=>effOf(f.c)===eff&&f.a===air);
 if(TIER==='good') return pool.filter(f=>stageOf(f.c)===$('fstage').value);
 return pool.filter(f=>isComm(f.c));
}
function fillEff(){const cur=$('feff').value||'80%';$('feff').innerHTML=uniq(D.f.map(f=>effOf(f.c))).sort().map(e=>opt(e,cur,e)).join('');}
function fillStage(){
 const eff=$('feff').value, air=$('fair').value;
 const comm=uniq(D.f.filter(f=>effOf(f.c)===eff&&f.a===air&&isComm(f.c)).map(f=>stageOf(f.c)));
 const all=uniq(D.f.filter(f=>effOf(f.c)===eff&&f.a===air).map(f=>stageOf(f.c)));
 const list=TIER==='good'?all:comm;
 if(list.indexOf($('fstage').value)<0)$('fstage').value=list[0];
 $('fstage').innerHTML=list.map(s=>opt(s,$('fstage').value,s)).join('');
 const lab=$('fstage')&&$('fstage').closest('label');
 if(lab) lab.style.display=(TIER==='good')?'flex':'none';
 const note=$('stageNote');
 if(note) note.style.display=(TIER==='good')?'none':'block';
}
function fillAir(){const eff=$('feff').value;
 const list=uniq(D.f.filter(f=>effOf(f.c)===eff&&(TIER==='good'||isComm(f.c))).map(f=>f.a));
 if(list.indexOf($('fair').value)<0)$('fair').value=list[0];
 $('fair').innerHTML=list.map(a=>opt(a,$('fair').value,a)).join('');}
function fillBtu(){const l=furnacePool();const list=uniq(l.map(f=>btuOf(f.m)).filter(Boolean)).sort((a,b)=>a-b);
 if(list.map(String).indexOf(String($('fbtu').value))<0)$('fbtu').value=list[0];
 $('fbtu').innerHTML=list.map(b=>opt(b,$('fbtu').value,(b/1000)+',000 BTU')).join('');}
function pickFurnace(){const l=furnacePool(),bt=+$('fbtu').value;return l.find(f=>btuOf(f.m)===bt)||l[0]||D.f[0];}
function fillCtons(){const cur=$('ctons').value||'3';const list=uniq(D.ac.map(x=>x.t)).sort((a,b)=>a-b);
 $('ctons').innerHTML=list.map(t=>opt(t,cur,t+' ton')).join('');}

const TIERTXT={good:'Good tier - your stage choice',better:'Better tier - communicating furnace',best:'Best tier - communicating furnace',dual:'Dual fuel - communicating furnace'};
const TIERS=[{k:'good',n:'Good',s:'14 SEER2 single stage',re:/13\.4|14\.3/},
 {k:'better',n:'Better',s:'16 SEER2 inverter',re:/15\.2|16 SEER2/},
 {k:'best',n:'Best',s:'17 SEER2 two stage',re:/17\.2|17 SEER2/},
 {k:'dual',n:'Dual Fuel',s:'16 SEER2 dual fuel',dual:true}];
function pickCool(t,tons){if(t.dual){const f=D.dual.filter(x=>x.t===tons);return f.find(x=>/16 SEER2/.test(x.s))||f[0]||D.dual[0];}
 const f=D.ac.filter(x=>x.t===tons);return f.find(x=>t.re.test(x.s))||f[0]||D.ac[0];}

function fillDTons(){const cur=$('dtons').value||'12000';const list=uniq(D.one.map(x=>x.b)).sort((a,b)=>a-b);
 $('dtons').innerHTML=list.map(b=>opt(b,cur,(b/1000)+',000 BTU')).join('');}
function fillDIndoor(){const bt=+$('dtons').value,l=D.one.filter(x=>x.b===bt);
 if(l.map(x=>x.i).indexOf($('dindoor').value)<0)$('dindoor').value=l.length?l[0].i:'';
 $('dindoor').innerHTML=l.map(x=>opt(x.i,$('dindoor').value,x.i+' + '+x.o+'  -  '+money(x.p))).join('');}
function pickDOne(){return D.one.find(x=>x.i===$('dindoor').value)||D.one[0];}
function fillDMulti(){const cur=$('dmulti').value||'';const list=uniq(D.multi.map(x=>x.m));
 if(list.indexOf(cur)<0)$('dmulti').value=list[0];
 $('dmulti').innerHTML=list.map(m=>opt(m,$('dmulti').value,m)).join('');}
function fillDHeads(){const m=$('dmulti').value,l=D.multi.filter(x=>x.m===m);
 if(l.map(x=>x.heads).map(String).indexOf(String($('dheads').value))<0)$('dheads').value=l.length?l[0].heads:'';
 $('dheads').innerHTML=l.map(x=>opt(x.heads,$('dheads').value,x.heads+' heads  -  '+money(x.p))).join('');}
function pickDMulti(){return D.multi.find(x=>x.m===$('dmulti').value&&x.heads===+$('dheads').value)||D.multi[0];}

function render(){
 const peak=isPeak();
 $('peakBadge').textContent=peak?'Peak season pricing active (May 15 - Aug 31)':'Off-season - peak pricing shown for comparison';
 $('peakBadge').className='badge'+(peak?' on':'');
 $('convPanel').style.display=MODE==='conv'?'block':'none';
 $('ductPanel').style.display=MODE==='duct'?'block':'none';
 let lines=[];
 if(MODE==='conv'){
  const frn=pickFurnace(),tons=+$('ctons').value;
  const frnPrice=peak?frn.d:frn.p;
  $('furnaceStrip').innerHTML='<b>Furnace</b> <em>('+TIERTXT[TIER]+')</em> '+frn.c+' &middot; '+frn.a+' &middot; '+((btuOf(frn.m)||0)/1000)+',000 BTU &middot; <span class="mono">'+frn.m+'</span><span class="fprice">'+money(frnPrice)+'</span>';
  const tiers=TIERS.map(t=>({t,u:pickCool(t,tons)}));
  $('cards').innerHTML=tiers.map(x=>{
   const price=peak?x.u.d:x.u.p;
   const peakTotal=frn.d+x.u.d;
   const soon=peak?'':'<div class="soon">Peak season: <b>'+money(peakTotal)+'</b><span>Act now and save '+money(peakTotal-(frnPrice+price))+'</span></div>';
   const reb=x.t.dual?'<div class="reb">Qualifying utility rebates may apply</div>':'';
   const coolOnly=!x.t.dual&&x.u.o?'<div class="coolonly">Cooling-only convert: '+money(peak?x.u.q:x.u.o)+'</div>':'';
   const g4b=frnPrice+price;
   const on=(x.t.k===TIER)?' on':'';
   return '<div class="card clickable'+on+'" data-tier="'+x.t.k+'"><div class="tier">'+x.t.n+(on?' &#10003;':'')+'</div><div class="sub">'+x.t.s+'</div><div class="g4blabel">Installed total <span>(furnace + cooling)</span></div><div class="price">'+money(g4b)+'</div><div class="split"><span>Furnace '+money(frnPrice)+'</span><span>Cooling '+money(price)+'</span></div>'+reb+coolOnly+soon+'</div>';
  }).join('');
  $('summary').innerHTML='';
  Array.prototype.forEach.call($('cards').querySelectorAll('.clickable'),function(el){
   el.onclick=function(){const t=el.getAttribute('data-tier');if(t===TIER)return;TIER=t;fillStage();fillAir();fillBtu();render();};
  });
  lines=[{n:'Furnace',m:frn.m,u:frn,price:frnPrice}].concat(tiers.map(x=>({n:x.t.n,m:x.u.m,u:x.u,price:peak?x.u.d:x.u.p})));
 } else {
  const one=pickDOne(),multi=pickDMulti();
  lines=[{n:'Single-zone ductless',m:one.i+' + '+one.o,u:one,price:peak?one.d:one.p},
   {n:'Multi-zone ductless',m:multi.m,u:{m:multi.m,e:multi.e,k:multi.e,p:multi.p,d:multi.d},price:peak?multi.d:multi.p}];
  $('furnaceStrip').innerHTML='';
  $('cards').innerHTML=lines.map(L=>{
   const soon=peak?'':'<div class="soon">Peak season: <b>'+money(L.u.d)+'</b><span>Act now and save '+money(L.u.d-L.price)+'</span></div>';
   return '<div class="card"><div class="tier">'+L.n+'</div><div class="model mono">'+L.m+'</div><div class="price">'+money(L.price)+'</div>'+soon+'</div>';
  }).join('');
  $('summary').innerHTML='';
 }
 if(VIEW==='int'){
  $('internal').style.display='block';
  $('internal').innerHTML='<h3>Internal - do not present</h3><table><tr><th>Item</th><th>Model</th><th>Equipment</th><th>Pricing cost</th><th>Price</th><th>Margin</th></tr>'+
   lines.map(L=>'<tr><td>'+L.n+'</td><td class="mono">'+L.m+'</td><td>'+money(L.u.e)+'</td><td>'+money(L.u.k)+'</td><td>'+money(L.u.p)+'</td><td>'+money(L.u.p-L.u.k)+'</td></tr>').join('')+
   '</table><p class="intnote">Dealer incentives are internal only. Federal tax credits expired December 31, 2025 - do not present.</p>';
 } else {$('internal').style.display='none';}
}
function setMode(m){MODE=m;$('bConv').className='tab'+(m==='conv'?' on':'');$('bDuct').className='tab'+(m==='duct'?' on':'');render();}
$('bConv').onclick=()=>setMode('conv');
$('bDuct').onclick=()=>setMode('duct');
fillEff();fillStage();fillAir();fillBtu();fillCtons();fillDTons();fillDIndoor();fillDMulti();fillDHeads();
$('feff').onchange=()=>{fillStage();fillAir();fillBtu();render();};
$('fstage').onchange=()=>{fillAir();fillBtu();render();};
$('fair').onchange=()=>{fillBtu();render();};
$('fbtu').onchange=render;$('ctons').onchange=render;
$('dtons').onchange=()=>{fillDIndoor();render();};
$('dindoor').onchange=render;
$('dmulti').onchange=()=>{fillDHeads();render();};
$('dheads').onchange=render;
$('toggle').onclick=()=>{VIEW=VIEW==='cust'?'int':'cust';$('toggle').textContent=VIEW==='cust'?'Show internal':'Show customer';render();};
$('disc').textContent=D.disc;
setMode('conv');
