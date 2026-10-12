/* Печатает HTML-файлы в PDF (A4). node tools/html2pdf.js вход.html выход.pdf [...] */
const path=require('path'); const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'; const {chromium}=require(PW);
(async()=>{ const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const a=process.argv.slice(2);
  for(let i=0;i+1<a.length;i+=2){ const p=await b.newPage(); await p.goto('file://'+path.resolve(a[i])); await p.waitForTimeout(400); await p.pdf({path:a[i+1],format:'A4',printBackground:true,margin:{top:'16mm',bottom:'16mm',left:'15mm',right:'15mm'},displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="font-size:8px;width:100%;text-align:center;color:#777;font-family:sans-serif"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'}); await p.close(); console.log('PDF:',a[i+1]); }
  await b.close(); })();
