const B=require('./bots.js');
const {s,R}=B.runTo(B.good({}),'ab1',8);
[-20,-10,-5,0,5,10,20].forEach(p=>{ const c=cloneState(s); c.outlets[0].padj=p; const r=simMonth(c,{preview:true}), o=r.outlets[0];
 console.log(String(p).padStart(4)+'%','guests/d',(o.guests/30).toFixed(1),'check',o.avgCheck.toFixed(0),'rev',Math.round(o.rev/1000),'cogs%',(o.cogs/o.rev*100).toFixed(1),'profit',Math.round(r.profit/1000),'util',o.utilK.toFixed(2),'val',o.dims.val.toFixed(0),'repNew',o.repNew.toFixed(1),'want/d',o.wantDay.toFixed(1),'rW',o.rW.toFixed(3)); });
