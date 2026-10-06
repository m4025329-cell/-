/* A/B: влияние отдельных решений на итоговый капитал одного кафе (без расширения). */
const B=require('./bots.js');
function wrap(base,extra){ return function(s,m,l){ base(s,m,l); extra(s,m,l); }; }
const base=B.good({});
const V={
  base:base,
  lera:wrap(base,(s,m)=>{ if(m>=2&&!s.specs.lera&&s.cash>100000) A_spec(s,'lera','o1'); }),
  arsen_off:B.good({}),
  pay2:wrap(base,(s,m)=>{ s.outlets[0].pay=2; }),
  pay0:wrap(base,(s,m)=>{ s.outlets[0].pay=0; }),
  stock4:wrap(base,(s,m)=>{ s.outlets[0].stock=4; }),
  stock2:wrap(base,(s,m)=>{ s.outlets[0].stock=2; }),
  farm:wrap(base,(s,m)=>{ s.outlets[0].sup='farm'; }),
  market:wrap(base,(s,m)=>{ s.outlets[0].sup='market'; }),
  blog:wrap(base,(s,m)=>{ if(m%3===0&&s.outlets[0].rep>=62) s.outlets[0].mk.blog=1; }),
  happy:wrap(base,(s,m)=>{ s.outlets[0].mk.happy=1; }),
  loyal:wrap(base,(s,m)=>{ s.outlets[0].mk.loyal=1; }),
  corp:wrap(base,(s,m)=>{ s.outlets[0].mk.corp=1; }),
  nomk:wrap(base,(s,m)=>{ s.outlets[0].mk={}; }),
  price_up10:wrap(base,(s,m)=>{ s.outlets[0].padj=10; }),
  price_dn10:wrap(base,(s,m)=>{ s.outlets[0].padj=-10; }),
  long:wrap(base,(s,m)=>{ s.outlets[0].hrs=2; }),
  short:wrap(base,(s,m)=>{ s.outlets[0].hrs=0; }),
  mgr:wrap(base,(s,m)=>{ if(m>=3&&!s.outlets[0].mgr&&s.cash>100000) A_mgr(s,'o1'); }),
  deliv:wrap(base,(s,m)=>{ s.outlets[0].mk.deliv=1; }),
  menu_full:wrap(base,(s,m)=>{ ['salad','cheesec','caesar','brusch','smoothie','lemonade'].forEach(id=>{ A_lab(s,id); A_menu(s,id,true); }); }),
};
const out=[]; for(const k of Object.keys(V)){ let tot=0; for(let sd=1;sd<=6;sd++){ const s=B.run(V[k],'ab'+sd,'norm'); tot+=capital(s); } out.push([k,Math.round(tot/6/1000)]); }
const b0=out[0][1]; out.forEach(([k,v])=>console.log(k.padEnd(12),String(v).padStart(6)+'k', (v-b0>=0?'+':'')+(v-b0)+'k'));
