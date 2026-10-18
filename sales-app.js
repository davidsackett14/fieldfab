const $=id=>document.getElementById(id);
const money=n=>'$'+Math.round(n).toLocaleString('en-US');
function isPeak(){const now=new Date();const mmdd=String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');return mmdd>=D.A.ps&&mmdd<=D.A.pe;}
let VIEW='cust';
const TIERS=[
 {key:'good',label:'Good',sub:'14 SEER2 single stage',re:/13\.4|14\.3/},
 {key:'better',label:'Better',sub:'16 SEER2 inverter',re:/15\.2|16 SEER2/},
 {key:'best',label:'Best',sub:'17 SEER2 two stage',re:/17\.2|17 SEER2/},
 {key:'dual',label:'Dual Fuel',sub:'16 SEER2 dual fuel',dual:true}
];
function tonsList(){return [...new Set(D.ac.map(x=>x.t))].sort((a,b)=>a-b);}
function pick(tier,tons){
 if(tier.dual){const f=D.dual.filter(x=>x.t===tons);return f.find(x=>/16 SEER2/.test(x.s))||f[0]||D.dual[0];}
 const f=D.ac.filter(x=>x.t===tons);
 return f.find(x=>tier.re.test(x.s))||f[0]||D.ac[0];
}
function render(){
 const tons=+$('tons').value, peak=isPeak();
 $('peakBadge').textContent=peak?'Peak season pricing active (May 15 - Aug 31)':'Off-season - peak pricing shown for comparison';
 $('peakBadge').className='badge'+(peak?' on':'');
 const rows=TIERS.map(t=>{const u=pick(t,tons);return {t,u,price:peak?u.d:u.p,acOnly:peak?(u.q||null):(u.o||null),peakPrice:u.d};});
 $('cards').innerHTML=rows.map(r=>{
  const soon=peak?'':'<div class="soon">During peak season: <b>'+money(r.peakPrice)+'</b><span>Lock in now and save '+money(r.peakPrice-r.price)+'</span></div>';
  const reb=r.t.dual?'<div class="reb">Qualifying utility rebates up to '+money(2900)+'</div>':'';
  const world=r.acOnly?'<div class="world">Cooling-only install: <b>'+money(r.acOnly)+'</b></div>':'';
  return '<div class="card"><div class="tier">'+r.t.label+'</div><div class="sub">'+r.t.sub+'</div><div class="model">'+r.u.s+'<br><span>'+r.u.m+'</span></div><div class="price">'+money(r.price)+'</div>'+reb+world+soon+'</div>';
 }).join('');
 if(VIEW==='int'){
  $('internal').style.display='block';
  $('internal').innerHTML='<h3>Internal - do not present</h3><table><tr><th>Option</th><th>Model</th><th>Equipment</th><th>Pricing cost</th><th>Price</th><th>Margin</th></tr>'+
   rows.map(r=>'<tr><td>'+r.t.label+'</td><td>'+r.u.m+'</td><td>'+money(r.u.e)+'</td><td>'+money(r.u.k)+'</td><td>'+money(r.u.p)+'</td><td>'+money(r.u.p-r.u.k)+'</td></tr>').join('')+
   '</table><p class="intnote">Dealer incentives are internal only. Federal tax credits expired December 31, 2025 - do not present.</p>';
 } else { $('internal').style.display='none'; }
}
$('tons').innerHTML=tonsList().map(t=>'<option value="'+t+'">'+t+' ton</option>').join('');
$('tons').value='3';
$('toggle').onclick=()=>{VIEW=VIEW==='cust'?'int':'cust';$('toggle').textContent=VIEW==='cust'?'Show internal':'Show customer';render();};
$('tons').onchange=render;
$('disc').textContent=D.disc;
render();
