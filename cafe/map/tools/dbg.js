/* Отладка генерации без браузера: node tools/dbg.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const ORDER=['util.js','geo.js','data.js','season.js','gen1.js','gen2.js','gen3.js','render1.js','render2.js','core.js'];
let code='"use strict";\n'+ORDER.filter(n=>fs.existsSync(path.join(__dirname,'..','src',n))).map(n=>fs.readFileSync(path.join(__dirname,'..','src',n),'utf8')).join('\n');
code+='\nbuildWorld();\nthis.__out={GEN:GEN,DIST:DIST};';
const ctx={console,Math,Uint8Array,performance:{now:Date.now}}; vm.createContext(ctx);
const t0=Date.now(); vm.runInContext(code,ctx); const G=ctx.__out.GEN;
const by={}; G.items.forEach(i=>{ const k=i.t; by[k]=(by[k]||0)+1; });
console.log('время',Date.now()-t0,'мс; предметов',G.items.length,JSON.stringify(by),'улиц',G.streets.length,'земли',G.land.length);
const dd={}; G.items.forEach(i=>{ const x=i.x!=null?i.x:i.cx; const d=vm.runInContext('districtAt('+x+','+(i.y)+')',ctx)||'-'; dd[d]=(dd[d]||0)+1; }); console.log('по районам',JSON.stringify(dd));
vm.runInContext(`
var L=makeLattice('old',-.16,104,88,1); var N=L.n, tot=0, inD=0, okM=0;
for(var j=-N;j<N;j++) for(var i=-N;i<N;i++){ tot++; var c=latPt(L,i+.5,j+.5); if(inDistrict('old',c[0],c[1],8)){ inD++; if(mfree(c[0],c[1],F_WATER|F_RAIL|F_SOLID|F_ROAD|F_PARK)) okM++; } }
this.__d={N:N,tot:tot,inD:inD,okM:okM,ox:L.ox,oy:L.oy};
`,ctx); console.log(JSON.stringify(ctx.__d));

console.log('блоков',JSON.stringify(G.dbg));vm.runInContext(`
var rs={tot:0,notIn:0,maskCtr:0,corners:0,ok:0}; var L=makeLattice('old',-.16,64,54,1), N=L.n, FB=F_WATER|F_RAIL|F_SOLID|F_ROAD|F_PARK;
var cnt={w:0,r:0,s:0,rd:0,p:0};
for(var j=-N;j<N;j++) for(var i=-N;i<N;i++){ rs.tot++; var ctr=latPt(L,i+.5,j+.5); if(!inDistrict('old',ctr[0],ctr[1],0)){ rs.notIn++; continue; }
 var m=mget(ctr[0],ctr[1]); if(m&F_WATER) cnt.w++; if(m&F_RAIL) cnt.r++; if(m&F_SOLID) cnt.s++; if(m&F_ROAD) cnt.rd++; if(m&F_PARK) cnt.p++;
 if(!mfree(ctr[0],ctr[1],FB)){ rs.maskCtr++; continue; } rs.ok++; }
this.__e={rs:rs,cnt:cnt,N:N};
`,ctx); console.log(JSON.stringify(ctx.__e));
