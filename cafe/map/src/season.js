/* ===== Карта Тулы: времена года и палитры ===== */

/* календарный месяц 0..11 → параметры сезона */
var SEASONS=[
  {snow:.95,leaf:0,aut:0,bloom:0,sky:'зима'},     /* янв */
  {snow:.85,leaf:0,aut:0,bloom:0,sky:'зима'},     /* фев */
  {snow:.42,leaf:0,aut:0,bloom:0,sky:'оттепель'}, /* мар */
  {snow:.06,leaf:.35,aut:0,bloom:.25,sky:'весна'},/* апр */
  {snow:0,leaf:.92,aut:0,bloom:1,sky:'весна'},    /* май */
  {snow:0,leaf:1,aut:0,bloom:0,sky:'лето'},       /* июн */
  {snow:0,leaf:1,aut:0,bloom:0,sky:'лето'},       /* июл */
  {snow:0,leaf:1,aut:.06,bloom:0,sky:'лето'},     /* авг */
  {snow:0,leaf:.92,aut:.4,bloom:0,sky:'осень'},   /* сен */
  {snow:0,leaf:.68,aut:.88,bloom:0,sky:'осень'},  /* окт */
  {snow:.22,leaf:.12,aut:1,bloom:0,sky:'осень'},  /* ноя */
  {snow:.8,leaf:0,aut:0,bloom:0,sky:'зима'}       /* дек */
];
function seasonAt(cal){ return SEASONS[cal]; }

function palette(S,theme){
  var P={}, sn=S.snow, lf=S.leaf, au=S.aut;
  var grass=cmix('#8E8A5A','#A9C47A',lf), dry=cmix(grass,'#C2A964',au*.55);
  P.grass=cmix(dry,'#F1F4F6',sn*.92);
  P.lawn=cmix(cmix('#9D9A68','#9CC06D',lf),'#C2AC66',au*.4); P.lawn=cmix(P.lawn,'#F3F6F8',sn*.94);
  P.forest=cmix(cmix('#7D7A56','#6F9A58',lf),'#9D8A48',au*.5); P.forest=cmix(P.forest,'#E8EEF1',sn*.8);
  P.earth=cmix('#E2D9BF','#DCD2B6',lf); P.earth=cmix(P.earth,'#F2F4F6',sn*.85);
  P.cobble=cmix('#DACDAE','#D9CFB2',lf); P.cobble=cmix(P.cobble,'#F2F4F6',sn*.85);
  P.pave=cmix('#CFC9BA','#CCC6B7',lf); P.pave=cmix(P.pave,'#EEF1F4',sn*.85);
  P.gravel=cmix('#B9B3A3','#B9B3A3',lf); P.gravel=cmix(P.gravel,'#E6EAEE',sn*.75);
  P.asph=cmix('#7A7D83','#7A7D83',0); P.asph=cmix(P.asph,'#C9CED3',sn*.22);
  P.asphD=cmix('#686B72','#686B72',0); P.asphD=cmix(P.asphD,'#B6BBC1',sn*.22);
  P.walk=cmix('#D8D1BE','#D8D1BE',0); P.walk=cmix(P.walk,'#F1F3F5',sn*.8);
  P.water=cmix('#6BA7C6','#6BA7C6',0); P.water=cmix(P.water,'#B8D3E0',sn*.18);
  P.waterL=cmix('#8FC2DA','#8FC2DA',0); P.waterL=cmix(P.waterL,'#CFE1EA',sn*.2);
  P.waterD=cmix('#4F8DAF','#4F8DAF',0);
  P.bank=cmix('#B9AF98','#B9AF98',0); P.bank=cmix(P.bank,'#E9EDF0',sn*.7);
  P.field=[cmix(cmix('#8F8B5C','#A5C46C',lf),'#F1F4F6',sn*.92), cmix(cmix('#9A8E5A','#D5C068',lf),'#F1F4F6',sn*.92), cmix(cmix('#8A7650','#A98B63',lf*.5+.2),'#EEF1F3',sn*.9), cmix(cmix('#8D8B5E','#B7CB7C',lf),'#F1F4F6',sn*.92)];
  P.crown=[cmix(cmix('#6C6A48','#4F8A3B',lf),'#B37A33',au), cmix(cmix('#706E4B','#5E9B45',lf),'#C9902B',au*.9), cmix(cmix('#6A6847','#3F7A38',lf),'#A9612B',au), cmix(cmix('#767450','#6AA84F',lf),'#D1A32F',au*.9)];
  P.crownH=[cmix(P.crown[0],'#D5E8A0',.25),cmix(P.crown[1],'#D5E8A0',.25),cmix(P.crown[2],'#D5E8A0',.25),cmix(P.crown[3],'#E6F0A8',.25)];
  P.spruce=cmix('#2F5C3C','#39704A',lf*.3); P.spruce=cmix(P.spruce,'#CFE0DC',sn*.35);
  P.trunk='#6B5440';
  P.snow=sn; P.leaf=lf; P.aut=au; P.bloom=S.bloom;
  P.roofSnow=sn;
  return P;
}
