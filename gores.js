const $=i=>document.getElementById(i);
function parse(s){s=String(s).trim().replace(/"|in/g,'').trim();let m=s.match(/^(\d+(?:\.\d+)?)[\s-]+(\d+)\/(\d+)$/);if(m)return +m[1]+m[2]/m[3];m=s.match(/^(\d+)\/(\d+)$/);if(m)return m[1]/m[2];return Number(s)}
function fr(v){const u=Math.round(v*16),w=Math.floor(u/16),n=u%16;if(!n)return w+'"';let d=16,k=n;while(k%2===0){k/=2;d/=2}return(w?w+' ':'')+k+'/'+d+'"'}
let G=null;
function calc(){const ID=parse($('id').value),OD=parse($('od').value),n=Math.round(+$('n').value),A=+$('ang').value;if(!(ID>0&&OD>ID))throw Error('Outer diameter must be larger than inner diameter.');if(!(n>=2))throw Error('Use at least 2 gores.');if(!(A>0&&A<=180))throw Error('Angle must be 1–180°.');
const d=(OD-ID)/2,r=d/2,R=(OD+ID)/4,full=A/(n-1),end=full/2,C=Math.PI*d,end_=$('which').value==='end',a=(end_?end:full)*Math.PI/180,t=Math.tan(a/2);
// full gore: symmetric about centerline, half-height each side = (R - r cos phi) tan(a/2); end gore: one square edge, height = (R - r cos phi) tan(a)
const h=phi=>end_?(R-r*Math.cos(phi))*Math.tan(a):2*(R-r*Math.cos(phi))*t;
G={ID,OD,n,A,d,r,R,full,end,C,end_,h};}
function draw(){const cv=$('c'),host=$('view'),dpr=devicePixelRatio||1,W=host.clientWidth,H=host.clientHeight;cv.width=W*dpr;cv.height=H*dpr;const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,W,H);if(!G)return;
const maxH=G.h(Math.PI),pad=70,s=Math.min((W-pad*2)/G.C,(H-pad*2)/maxH),ox=pad,mid=H/2,N=180,pt=i=>{const phi=2*Math.PI*i/N,hh=G.h(phi)*s;return[ox+G.C*s*i/N,hh]};
const top=[],bot=[];for(let i=0;i<=N;i++){const[p,hh]=pt(i);if(G.end_){bot.push([p,mid+maxH*s/2]);top.push([p,mid+maxH*s/2-hh])}else{top.push([p,mid-hh/2]);bot.push([p,mid+hh/2])}}
x.beginPath();top.forEach((q,i)=>i?x.lineTo(...q):x.moveTo(...q));for(let i=bot.length-1;i>=0;i--)x.lineTo(...bot[i]);x.closePath();x.fillStyle='#dbeafe';x.fill();x.strokeStyle='#0f172a';x.lineWidth=2;x.stroke();
if(!G.end_){x.setLineDash([6,5]);x.strokeStyle='#64748b';x.beginPath();x.moveTo(ox,mid);x.lineTo(ox+G.C*s,mid);x.stroke();x.setLineDash([])}
const lab=(t,X,Y,c)=>{x.font='800 12px system-ui';const w=x.measureText(t).width+10;x.fillStyle='#fff';x.fillRect(X-w/2,Y-10,w,20);x.strokeStyle=c;x.lineWidth=1;x.strokeRect(X-w/2,Y-10,w,20);x.fillStyle=c;x.textAlign='center';x.textBaseline='middle';x.fillText(t,X,Y)};
[[0,'Seam (throat)'],[.25,'1/4'],[.5,'1/2 (heel)'],[.75,'3/4'],[1,'Seam (throat)']].forEach(([f,nm])=>{const i=Math.round(f*N),X=top[i][0],y1=top[i][1],y2=bot[i][1];x.strokeStyle='#be123c';x.lineWidth=1.5;x.beginPath();x.moveTo(X,y1);x.lineTo(X,y2);x.stroke();lab(nm+': '+fr(G.h(f*2*Math.PI)),X,f===.5?(y1+y2)/2:y1-14,'#be123c');lab(fr(G.C*f),X,H-18,'#166534')});
lab('Stretch-out '+fr(G.C),ox+G.C*s/2,22,'#075985')}
function tables(){const g=G,row=(k,v)=>'<tr><th>'+k+'</th><td>'+v+'</td></tr>';$('tables').innerHTML='<table>'+row('Pipe diameter',fr(g.d))+row('Centerline radius',fr(g.R))+row('Pieces',g.n+' ('+(g.n-2)+' middle + 2 end)')+row('Middle gore angle',g.full.toFixed(2)+'°')+row('End gore angle',g.end.toFixed(2)+'°')+row('Stretch-out (πd)',fr(g.C))+row('Height at seam / throat',fr(g.h(0)))+row('Height at 1/4',fr(g.h(Math.PI/2)))+row('Height at 1/2 / heel (piece height)',fr(g.h(Math.PI)))+row('Height at 3/4',fr(g.h(1.5*Math.PI)))+'</table><p>Heights are the full piece height at each stretch-out station. Seams/allowances not added.</p>'}
function run(){try{$('err').textContent='';calc();draw();tables()}catch(e){G=null;draw();$('err').textContent=e.message;$('tables').innerHTML=''}}
$('go').onclick=run;$('which').onchange=run;addEventListener('resize',draw);run();
