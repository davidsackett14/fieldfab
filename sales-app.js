const $=id=>document.getElementById(id);
const money=n=>'$'+Math.round(n).toLocaleString('en-US');
function isPeak(){const n=new Date();const d=String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');return d>=D.A.ps&&d<=D.A.pe;}
let VIEW='cust';
function uniq(a){return [...new Set(a)];}
function stageOf(c){if(/Modulating/.test(c))return 'Modulating';if(/Variable/.test(c))return 'Variable';if(/Two Stage/.test(c))return 'Two Stage';return 'Single Stage';}
function effOf(c){return c.split(' ')[0];}
function btuOf(m){const hit=m.match(/\d{2}(?=\d{3}(?:A|B|C|D|X))/);return hit?+hit[0]:null;}

function furnacePool(){return D.f.filter(f=>effOf(f.c)===$('feff').value&&stageOf(f.c)===$('fstage').value&&f.a===$('fair').value);}
function fillEff(){const cur=$('feff').value||'80%';const list=uniq(D.f.map(f=>effOf(f.c))).sort();
 $('feff').innerHTML=list.map(e=>'<option'+(e===cur?' selected':'')+'>'+e+'</option>').join('');}
function fillStage(){const eff=$('feff').value,cur=$('fstage').value;
 const list=uniq(D.f.filter(f=>effOf(f.c)===eff).map(f=>stageOf(f.c)));
 if(list.indexOf(cur)<0)$('fstage').value=list[0];
 $('fstage').innerHTML=list.map(s=>'<option'+(s===cur?' selected':'')+'>'+s+'</option>').join('');}
function fillAir(){const eff=$('feff').value,st=$('fstage').value,cur=$('fair').value;
 const list=uniq(D.f.filter(f=>effOf(f.c)===eff&&stageOf(f.c)===st).map(f=>f.a));
 $('fair').innerHTML=list.map(a=>'<option'+(a===cur?' selected':'')+'>'+a+'</option>').join('');}
function fillBtu(){const l=furnacePool(),cur=$('fbtu').value;
 const list=uniq(l.map(f=>btuOf(f.m)).filter(Boolean)).sort((a,b)=>a-b);
 $('fbtu').innerHTML=list.map(b=>'<option value="'+b+'"'+(String(b)===cur?' selected':'')+'>'+b+',000 BTU</option>').join('');}
function pickFurnace(){const l=furnacePool(),bt=+$('fbtu').value;return l.find(f=>btuOf(f.m)===bt)||l[0]||D.f[0];}

const TIERS=[{k:'good',n:'Good',s:'14 SEER2 single stage',re:/13\.4|14\.3/},
 {k:'better',n:'Better',s:'16 SEER2 inverter',re:/15\.2|16 SEER2/},
 {k:'best',n:'Best',s:'17 SEER2 two stage',re:/17\.2|17 SEER2/},
 {k:'dual',n:'Dual Fuel',s:'16 SEER2 dual fuel',dual:true}];
function pickCool(t,tons){if(t.dual){const f=D.dual.filter(x=>x.t===tons);return f.find(x=>/16 SEER2/.test(x.s))||f[0]||D.dual[0];}
 const f=D.ac.filter(x=>x.t===tons);return f.find(x=>t.re.test(x.s))||f[0]||D.ac[0];}
function fillCoolTons(){const cur=$('ctons').value||'3';const list=uniq(D.ac.map(x=>x.t)).sort((a,b)=>a-b);
 $('ctons').innerHTML=list.map(t=>'<option value="'+t+'"'+(String(t)===cur?' selected':'')+'>'+t+' ton</option>').join('');}

function render(){
 const peak=isPeak();
 $('peakBadge').textContent=peak?'Peak season pricing active (May 15 - Aug 31)':'Off-season - peak pricing shown for comparison';
 $('peakBadge').className='badge'+(peak?' on':'');
 const frn=pickFurnace(),tons=+$('ctons').value,frnPrice=peak?frn.d:frn.p;
 $('furnaceStrip').innerHTML='<b>Furnace:</b> '+frn.c+' &middot; '+frn.a+' &middot; <span class="mono">'+frn.m+'</span><span class="fprice">'+money(frnPrice)+'</span>';
 const rows=TIERS.map(t=>{const u=pickCool(t,tons);return{t,u,price:peak?u.d:u.p,acOnly:peak?(u.q||null):(u.o||null),peakPrice:u.d};});
 $('cards').innerHTML=rows.map(r=>{
  const soon=peak?'':'<div class="soon">During peak season: <b>'+money(r.peakPrice)+'</b><span>Act now and save '+money(r.peakPrice-r.price)+'</span></div>';
  const reb=r.t.dual?'<div class="reb">Qualifying utility rebates up to '+money(2900)+'</div>':'';
  const world=r.acOnly?'<div class="world">Cooling-only install: <b>'+money(r.acOnly)+'</b></div>':'';
  return '<div class="card"><div class="tier">'+r.t.n+'</div><div class="sub">'+r.t.s+'</div><div class="model"><span>'+r.u.s+'</span><br><span class="mono">'+r.u.m+'</span></div><div class="price">'+money(r.price)+'</div>'+reb+world+soon+'</div>';
 }).join('');
 if(VIEW==='int'){
  $('internal').style.display='block';
  $('internal').innerHTML='<h3>Internal - do not present</h3><table><tr><th>Item</th><th>Model</th><th>Equipment</th><th>Pricing cost</th><th>Price</th><th>Margin</th></tr>'+
   '<tr><td><b>Furnace</b></td><td>'+frn.m+'</td><td>'+money(frn.e)+'</td><td>'+money(frn.k)+'</td><td>'+money(frn.p)+'</td><td>'+money(frn.p-frn.k)+'</td></tr>'+
   rows.map(r=>'<tr><td>'+r.t.n+'</td><td>'+r.u.m+'</td><td>'+money(r.u.e)+'</td><td>'+money(r.u.k)+'</td><td>'+money(r.u.p)+'</td><td>'+money(r.u.p-r.u.k)+'</td></tr>').join('')+
   '</table><p class="intnote">Dealer incentives are internal only. Federal tax credits expired December 31, 2025 - do not present.</p>';
 } else {$('internal').style.display='none';}
}
fillEff();fillStage();fillAir();fillBtu();fillCoolTons();
$('feff').onchange=()=>{fillStage();fillAir();fillBtu();render();};
$('fstage').onchange=()=>{fillAir();fillBtu();render();};
$('fair').onchange=()=>{fillBtu();render();};
$('fbtu').onchange=render;$('ctons').onchange=render;
$('toggle').onclick=()=>{VIEW=VIEW==='cust'?'int':'cust';$('toggle').textContent=VIEW==='cust'?'Show internal':'Show customer';render();};
$('disc').textContent=D.disc;
render();
