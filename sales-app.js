const $=id=>document.getElementById(id);
const money=n=>'$'+Math.round(n).toLocaleString('en-US');
function isPeak(){const n=new Date();const d=String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');return d>=D.A.ps&&d<=D.A.pe;}
let VIEW='cust', MODE='conv';
function uniq(a){return [...new Set(a)];}
function stageOf(c){if(/Modulating/.test(c))return 'Modulating';if(/Variable/.test(c))return 'Variable';if(/Two Stage/.test(c))return 'Two Stage';return 'Single Stage';}
function effOf(c){return c.split(' ')[0];}
function btuOf(m){const hit=m.match(/\d{2}(?=\d{3}(?:A|B|C|D|X))/);return hit?+hit[0]:null;}
function opt(v,sel,label){return '<option value="'+v+'"'+(String(v)===String(sel)?' selected':'')+'>'+(label||v)+'</option>';}

function furnacePool(){return D.f.filter(f=>effOf(f.c)===$('feff').value&&stageOf(f.c)===$('fstage').value&&f.a===$('fair').value);}
function fillEff(){const cur=$('feff').value||'80%';$('feff').innerHTML=uniq(D.f.map(f=>effOf(f.c))).sort().map(e=>opt(e,cur,e)).join('');}
function fillStage(){const eff=$('feff').value;const list=uniq(D.f.filter(f=>effOf(f.c)===eff).map(f=>stageOf(f.c)));
 if(list.indexOf($('fstage').value)<0)$('fstage').value=list[0];
 $('fstage').innerHTML=list.map(s=>opt(s,$('fstage').value,s)).join('');}
function fillAir(){const eff=$('feff').value,st=$('fstage').value;
 const list=uniq(D.f.filter(f=>effOf(f.c)===eff&&stageOf(f.c)===st).map(f=>f.a));
 if(list.indexOf($('fair').value)<0)$('fair').value=list[0];
 $('fair').innerHTML=list.map(a=>opt(a,$('fair').value,a)).join('');}
function fillBtu(){const l=furnacePool();const list=uniq(l.map(f=>btuOf(f.m)).filter(Boolean)).sort((a,b)=>a-b);
 if(list.map(String).indexOf(String($('fbtu').value))<0)$('fbtu').value=list[0];
 $('fbtu').innerHTML=list.map(b=>opt(b,$('fbtu').value,b+',000 BTU')).join('');}
function fillFmodel(){const l=furnacePool(),bt=+$('fbtu').value,m=l.filter(f=>btuOf(f.m)===bt);
 if(m.map(x=>x.m).indexOf($('fmodel').value)<0)$('fmodel').value=m.length?m[0].m:'';
 $('fmodel').innerHTML=m.map(f=>opt(f.m,$('fmodel').value,f.m+'  —  '+money(f.p))).join('');}
function pickFurnace(){const l=furnacePool();return l.find(f=>f.m===$('fmodel').value)||l[0]||D.f[0];}

function fillCtons(){const cur=$('ctons').value||'3';const list=uniq(D.ac.map(x=>x.t)).sort((a,b)=>a-b);
 $('ctons').innerHTML=list.map(t=>opt(t,cur,t+' ton')).join('');}
function fillCmodel(){const tons=+$('ctons').value;const list=D.ac.filter(x=>x.t===tons).concat(D.dual.filter(x=>x.t===tons));
 if(list.map(x=>x.m).indexOf($('cmodel').value)<0)$('cmodel').value=list.length?list[0].m:'';
 $('cmodel').innerHTML=list.map(x=>opt(x.m,$('cmodel').value,x.m+'  —  '+x.s)).join('');}
function pickCool(){return D.ac.concat(D.dual).find(x=>x.m===$('cmodel').value)||D.ac[0];}
function isDual(u){return !!D.dual.find(x=>x.m===u.m);}

function fillDTons(){const cur=$('dtons').value||'12000';const list=uniq(D.one.map(x=>x.b)).sort((a,b)=>a-b);
 $('dtons').innerHTML=list.map(b=>opt(b,cur,b.toLocaleString()+' BTU')).join('');}
function fillDIndoor(){const bt=+$('dtons').value,l=D.one.filter(x=>x.b===bt);
 if(l.map(x=>x.i).indexOf($('dindoor').value)<0)$('dindoor').value=l.length?l[0].i:'';
 $('dindoor').innerHTML=l.map(x=>opt(x.i,$('dindoor').value,x.i+' + '+x.o+'  —  '+money(x.p))).join('');}
function pickDOne(){return D.one.find(x=>x.i===$('dindoor').value)||D.one[0];}
function fillDMulti(){const cur=$('dmulti').value||'';const list=uniq(D.multi.map(x=>x.m));
 if(list.indexOf(cur)<0)$('dmulti').value=list[0];
 $('dmulti').innerHTML=list.map(m=>opt(m,$('dmulti').value,m)).join('');}
function fillDHeads(){const m=$('dmulti').value,l=D.multi.filter(x=>x.m===m);
 if(l.map(x=>x.heads).map(String).indexOf(String($('dheads').value))<0)$('dheads').value=l.length?l[0].heads:'';
 $('dheads').innerHTML=l.map(x=>opt(x.heads,$('dheads').value,x.heads+' heads  —  '+money(x.p))).join('');}
function pickDMulti(){return D.multi.find(x=>x.m===$('dmulti').value&&x.heads===+$('dheads').value)||D.multi[0];}

function render(){
 const peak=isPeak();
 $('peakBadge').textContent=peak?'Peak season pricing active (May 15 - Aug 31)':'Off-season - peak pricing shown for comparison';
 $('peakBadge').className='badge'+(peak?' on':'');
 $('convPanel').style.display=MODE==='conv'?'block':'none';
 $('ductPanel').style.display=MODE==='duct'?'block':'none';
 let lines=[];
 if(MODE==='conv'){
  const frn=pickFurnace(),cool=pickCool();
  lines=[{n:'Furnace',s:frn.c+' · '+frn.a,u:frn,price:peak?frn.d:frn.p}];
  const dual=isDual(cool);
  lines.push({n:dual?'Dual fuel heat pump':'Air conditioner',s:cool.s+' · installed with furnace',u:cool,price:peak?cool.d:cool.p,
   reb:dual?'Qualifying utility rebates may apply':''});
  if(!dual) lines.push({n:'Cooling only',s:'Standalone AC, no furnace',u:{m:cool.m,e:cool.e,k:cool.k,p:cool.o,d:cool.q},price:peak?cool.q:cool.o,reb:''});
  const tot=lines[0].price+lines[1].price;
  $('summary').innerHTML='<div class="tot"><span>Furnace + cooling, installed</span><b>'+money(tot)+'</b></div>';
 } else {
  const one=pickDOne(),multi=pickDMulti();
  lines=[{n:'Single-zone ductless',s:one.b.toLocaleString()+' BTU · SEER2 '+one.s+' · '+one.i+' + '+one.o,u:one,price:peak?one.d:one.p,reb:''},
   {n:'Multi-zone ductless',s:multi.heads+' heads on '+multi.m+' · '+multi.hm,u:{m:multi.m,e:multi.e,k:multi.e,p:multi.p,d:multi.d},price:peak?multi.d:multi.p,reb:'Utility rebates may apply'}];
  $('summary').innerHTML='';
 }
 $('cards').innerHTML=lines.map(L=>{
  const soon=peak?'':'<div class="soon">Peak season: <b>'+money(L.u.d)+'</b><span>Act now and save '+money(L.u.d-L.price)+'</span></div>';
  const reb=L.reb?'<div class="reb">'+L.reb+'</div>':'';
  return '<div class="card"><div class="tier">'+L.n+'</div><div class="sub">'+L.s+'</div><div class="price">'+money(L.price)+'</div>'+reb+soon+'</div>';
 }).join('');
 if(VIEW==='int'){
  $('internal').style.display='block';
  $('internal').innerHTML='<h3>Internal - do not present</h3><table><tr><th>Item</th><th>Model</th><th>Equipment</th><th>Pricing cost</th><th>Price</th><th>Margin</th></tr>'+
   lines.map(L=>'<tr><td>'+L.n+'</td><td class="mono">'+L.u.m+'</td><td>'+money(L.u.e)+'</td><td>'+money(L.u.k)+'</td><td>'+money(L.u.p)+'</td><td>'+money(L.u.p-L.u.k)+'</td></tr>').join('')+
   '</table><p class="intnote">Dealer incentives are internal only. Federal tax credits expired December 31, 2025 - do not present.</p>';
 } else {$('internal').style.display='none';}
}
function setMode(m){MODE=m;$('bConv').className='tab'+(m==='conv'?' on':'');$('bDuct').className='tab'+(m==='duct'?' on':'');render();}
$('bConv').onclick=()=>setMode('conv');
$('bDuct').onclick=()=>setMode('duct');
fillEff();fillStage();fillAir();fillBtu();fillFmodel();fillCtons();fillCmodel();fillDTons();fillDIndoor();fillDMulti();fillDHeads();
$('feff').onchange=()=>{fillStage();fillAir();fillBtu();fillFmodel();render();};
$('fstage').onchange=()=>{fillAir();fillBtu();fillFmodel();render();};
$('fair').onchange=()=>{fillBtu();fillFmodel();render();};
$('fbtu').onchange=()=>{fillFmodel();render();};
$('fmodel').onchange=render;
$('ctons').onchange=()=>{fillCmodel();render();};
$('cmodel').onchange=render;
$('dtons').onchange=()=>{fillDIndoor();render();};
$('dindoor').onchange=render;
$('dmulti').onchange=()=>{fillDHeads();render();};
$('dheads').onchange=render;
$('toggle').onclick=()=>{VIEW=VIEW==='cust'?'int':'cust';$('toggle').textContent=VIEW==='cust'?'Show internal':'Show customer';render();};
$('disc').textContent=D.disc;
setMode('conv');
