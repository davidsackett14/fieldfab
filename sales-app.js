const $=id=>document.getElementById(id);
const money=n=>'$'+Math.round(n).toLocaleString('en-US');
function isPeak(){const n=new Date();const d=String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');return d>=D.A.ps&&d<=D.A.pe;}
let VIEW='cust', MODE='conv', GOOD_STAGE='Single Stage', COMM_STAGE='Variable';
function uniq(a){return [...new Set(a)];}
function stageOf(c){if(/Modulating/.test(c))return 'Modulating';if(/Variable/.test(c))return 'Variable';if(/Two Stage/.test(c))return 'Two Stage';return 'Single Stage';}
function effOf(c){return c.split(' ')[0];}
function isComm(c){return /Communicating|Variable|Modulating/.test(c);}
function btuOf(m){const e=m.match(/(80|96|97)/);if(!e)return null;let rest=m.slice(m.indexOf(e[0])+2).replace(/[A-Z]+$/,'');if(!/^\d+$/.test(rest))return null;return parseInt(rest.slice(0,-1),10)*1000;}
function opt(v,sel,label){return '<option value="'+v+'"'+(String(v)===String(sel)?' selected':'')+'>'+(label||v)+'</option>';}

// ---------- shared furnace selectors ----------
function basePool(){const eff=$('feff').value,air=$('fair').value;return D.f.filter(f=>effOf(f.c)===eff&&f.a===air);}
function fillEff(){const cur=$('feff').value||'80%';$('feff').innerHTML=uniq(D.f.map(f=>effOf(f.c))).sort().map(e=>opt(e,cur,e)).join('');}
function fillAir(){const eff=$('feff').value,list=uniq(D.f.filter(f=>effOf(f.c)===eff).map(f=>f.a));if(list.indexOf($('fair').value)<0)$('fair').value=list[0];$('fair').innerHTML=list.map(a=>opt(a,$('fair').value,a)).join('');}
function fillBtu(){const list=uniq(basePool().map(f=>btuOf(f.m)).filter(Boolean)).sort((a,b)=>a-b);if(list.map(String).indexOf(String($('fbtu').value))<0)$('fbtu').value=list[0];$('fbtu').innerHTML=list.map(b=>opt(b,$('fbtu').value,(b/1000)+',000 BTU')).join('');}
function goodStages(){const list=uniq(basePool().map(f=>stageOf(f.c)));if(list.indexOf(GOOD_STAGE)<0)GOOD_STAGE=list[0];return list;}
function commStages(){const list=uniq(basePool().filter(f=>isComm(f.c)).map(f=>stageOf(f.c)));if(list.indexOf(COMM_STAGE)<0)COMM_STAGE=list.length?list[0]:'';return list;}
function fillCommStage(){
 const list=commStages(), sel=$('commstage');
 if(!sel) return;
 const only=list.length<2;
 sel.innerHTML=list.map(s=>opt(s,COMM_STAGE,s)).join('');
 sel.value=COMM_STAGE;
 sel.disabled=only;
 const hint=$('commHint');
 if(hint) hint.textContent=list.length?(only?'Higher tiers use the '+list[0]+' communicating furnace — set by the efficiency choice.':'Higher tiers use a communicating furnace in the type you pick here.'):'No communicating furnace at this efficiency and airflow.';
}
function pickAt(pool){const bt=+$('fbtu').value;if(!pool.length)return null;const exact=pool.find(f=>btuOf(f.m)===bt);if(exact)return exact;return pool.slice().sort((a,b)=>Math.abs(btuOf(a.m)-bt)-Math.abs(btuOf(b.m)-bt))[0];}
function goodFurnace(){goodStages();return pickAt(basePool().filter(f=>stageOf(f.c)===GOOD_STAGE))||D.f[0];}
function commFurnace(){commStages();return pickAt(basePool().filter(f=>isComm(f.c)&&stageOf(f.c)===COMM_STAGE))||D.f[0];}

function fillCtons(){const cur=$('ctons').value||'3',list=uniq(D.ac.map(x=>x.t)).sort((a,b)=>a-b);$('ctons').innerHTML=list.map(t=>opt(t,cur,t+' ton')).join('');}
const TIERS=[{k:'good',n:'Good',s:'14 SEER2 single stage',re:/13\.4|14\.3/},{k:'better',n:'Better',s:'16 SEER2 inverter',re:/15\.2|16 SEER2/},{k:'best',n:'Best',s:'17 SEER2 two stage',re:/17\.2|17 SEER2/},{k:'dual',n:'Dual Fuel',s:'16 SEER2 dual fuel',dual:true}];
function pickCool(t,tons){if(t.dual){const f=D.dual.filter(x=>x.t===tons);return f.find(x=>/16 SEER2/.test(x.s))||f[0]||D.dual[0];}const f=D.ac.filter(x=>x.t===tons);return f.find(x=>t.re.test(x.s))||f[0]||D.ac[0];}

// ---------- ductless ----------
function fillDTons(){const cur=$('dtons').value||'12000',list=uniq(D.one.map(x=>x.b)).sort((a,b)=>a-b);$('dtons').innerHTML=list.map(b=>opt(b,cur,(b/1000)+',000 BTU')).join('');}
function fillDIndoor(){const bt=+$('dtons').value,l=D.one.filter(x=>x.b===bt);if(l.map(x=>x.i).indexOf($('dindoor').value)<0)$('dindoor').value=l.length?l[0].i:'';$('dindoor').innerHTML=l.map(x=>opt(x.i,$('dindoor').value,x.i+' + '+x.o+' - '+money(x.p))).join('');}
function pickDOne(){return D.one.find(x=>x.i===$('dindoor').value)||D.one[0];}
function fillDMulti(){const cur=$('dmulti').value||'',list=uniq(D.multi.map(x=>x.m));if(list.indexOf(cur)<0)$('dmulti').value=list[0];$('dmulti').innerHTML=list.map(m=>opt(m,$('dmulti').value,m)).join('');}
function fillDHeads(){const m=$('dmulti').value,l=D.multi.filter(x=>x.m===m);if(l.map(x=>x.heads).map(String).indexOf(String($('dheads').value))<0)$('dheads').value=l.length?l[0].heads:'';$('dheads').innerHTML=l.map(x=>opt(x.heads,$('dheads').value,x.heads+' heads - '+money(x.p))).join('');}
function pickDMulti(){return D.multi.find(x=>x.m===$('dmulti').value&&x.heads===+$('dheads').value)||D.multi[0];}

function furnLine(f){return f.c+' &middot; '+f.a+' &middot; '+((btuOf(f.m)||0)/1000)+',000 BTU &middot; <span class="mono">'+f.m+'</span>';}

function render(){
 const peak=isPeak();
 $('peakBadge').textContent=peak?'Peak season pricing active (May 15 - Aug 31)':'Off-season - peak pricing shown for comparison';
 $('peakBadge').className='badge'+(peak?' on':'');
 $('convPanel').style.display=MODE==='conv'?'block':'none';
 $('ductPanel').style.display=MODE==='duct'?'block':'none';
 let lines=[];
 if(MODE==='conv'){
  const gF=goodFurnace(), cF=commFurnace(), tons=+$('ctons').value;
  $('furnaceStrip').innerHTML='<div><b>Good:</b> '+furnLine(gF)+'</div><div><b>Better / Best / Dual Fuel:</b> '+furnLine(cF)+' <em>(communicating)</em></div>';
  const tiers=TIERS.map(t=>({t,u:pickCool(t,tons),f:t.k==='good'?gF:cF}));
  $('cards').innerHTML=tiers.map(x=>{
   const fp=peak?x.f.d:x.f.p, price=peak?x.u.d:x.u.p, g4b=fp+price, peakTotal=x.f.d+x.u.d;
   const soon=peak?'':'<div class="soon">Peak season: <b>'+money(peakTotal)+'</b><span>Act now and save '+money(peakTotal-g4b)+'</span></div>';
   const coolOnly=!x.t.dual&&x.u.o?'<div class="coolonly">Cooling-only convert: '+money(peak?x.u.q:x.u.o)+'</div>':'';
   let stageSel='';
   if(x.t.k==='good'){stageSel='<label class="instage">Furnace stages<select id="gstage">'+goodStages().map(s=>opt(s,GOOD_STAGE,s)).join('')+'</select></label>';}
   const fnote='<div class="fnote">'+(x.t.k==='good'?'':'Communicating furnace: ')+'<span class="mono">'+x.f.m+'</span> &middot; '+x.f.c+'</div>';
   let dualBlock='';
   if(x.t.dual){const rebTotal=D.reb.util.reduce((s,r)=>s+(r.a||0),0),net=Math.max(0,g4b-rebTotal);dualBlock='<div class="reb"><b>Potential rebates up to '+money(rebTotal)+'</b>'+D.reb.util.map(r=>'<span>'+r.n+' '+money(r.a)+'</span>').join('')+'</div><div class="net"><span>Estimated net after rebates</span><b>'+money(net)+'</b></div>';}
   return '<div class="card"><div class="tier">'+x.t.n+'</div><div class="sub">'+x.t.s+' &middot; <span class="mono">'+x.u.m+'</span></div>'+stageSel+fnote+'<div class="g4blabel">Installed total <span>(furnace + cooling)</span></div><div class="price">'+money(g4b)+'</div><div class="split"><span>Furnace '+money(fp)+'</span><span>Cooling '+money(price)+'</span></div>'+dualBlock+coolOnly+soon+'</div>';
  }).join('');
  const gs=$('gstage');if(gs)gs.onchange=()=>{GOOD_STAGE=gs.value;render();};
  lines=tiers.map(x=>({n:x.t.n+' furnace',m:x.f.m,u:x.f})).concat(tiers.map(x=>({n:x.t.n+' cooling',m:x.u.m,u:x.u})));
 } else {
  const one=pickDOne(),multi=pickDMulti(),onePrice=peak?one.d:one.p,multiPrice=peak?multi.d:multi.p;
  lines=[{n:'Single-zone ductless',m:one.i+' + '+one.o,s:(one.b/1000)+',000 BTU \u00b7 SEER2 '+one.s,u:{m:one.i+' + '+one.o,e:one.e,k:one.k,p:one.p,d:one.d},price:onePrice},
         {n:'Multi-zone ductless',m:multi.m,s:multi.heads+' heads on '+multi.m+' \u00b7 '+multi.hm,u:{m:multi.m,e:multi.e,k:multi.e,p:multi.p,d:multi.d},price:multiPrice}];
  $('furnaceStrip').innerHTML='';
  $('cards').innerHTML=lines.map(L=>{const soon=peak?'':'<div class="soon">Peak season: <b>'+money(L.u.d)+'</b><span>Act now and save '+money(L.u.d-L.price)+'</span></div>',reb=L.n==='Multi-zone ductless'?'<div class="reb">Qualifying utility rebates may apply</div>':'';return '<div class="card"><div class="tier">'+L.n+'</div><div class="sub">'+L.s+'</div><div class="g4blabel">Installed total</div><div class="price">'+money(L.price)+'</div>'+reb+soon+'</div>';}).join('');
 }
 if(VIEW==='int'){$('internal').style.display='block';$('internal').innerHTML='<h3>Internal - do not present</h3><table><tr><th>Item</th><th>Model</th><th>Equipment</th><th>Pricing cost</th><th>Price</th><th>Margin</th></tr>'+lines.map(L=>'<tr><td>'+L.n+'</td><td class="mono">'+L.m+'</td><td>'+money(L.u.e)+'</td><td>'+money(L.u.k)+'</td><td>'+money(L.u.p)+'</td><td>'+money(L.u.p-L.u.k)+'</td></tr>').join('')+'</table><p class="intnote">Dealer incentives are internal only. Federal tax credits expired December 31, 2025 - do not present.</p>';}
 else $('internal').style.display='none';
}
function setMode(m){MODE=m;$('bConv').className='tab'+(m==='conv'?' on':'');$('bDuct').className='tab'+(m==='duct'?' on':'');render();}
$('bConv').onclick=()=>setMode('conv');$('bDuct').onclick=()=>setMode('duct');
fillEff();fillAir();fillBtu();fillCommStage();fillCtons();fillDTons();fillDIndoor();fillDMulti();fillDHeads();
$('feff').onchange=()=>{fillAir();fillBtu();fillCommStage();render();};
$('fair').onchange=()=>{fillBtu();fillCommStage();render();};
$('fbtu').onchange=render;$('ctons').onchange=render;
$('commstage').onchange=()=>{COMM_STAGE=$('commstage').value;render();};
$('dtons').onchange=()=>{fillDIndoor();render();};$('dindoor').onchange=render;
$('dmulti').onchange=()=>{fillDHeads();render();};$('dheads').onchange=render;
$('toggle').onclick=()=>{VIEW=VIEW==='cust'?'int':'cust';$('toggle').textContent=VIEW==='cust'?'Show internal':'Show customer';render();};
$('disc').textContent=D.disc;
setMode('conv');
