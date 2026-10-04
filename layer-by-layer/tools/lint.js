/* Проверка текстов: форма глаголов (пол игрока неизвестен), пробелы, кавычки, «вы/ты» */
const fs=require('fs'), path=require('path');
const SRC=process.argv[2]?path.resolve(process.argv[2]):path.join(__dirname,'..','src');
const files=process.argv.length>3?process.argv.slice(3):['events.js','content.js','ending.js','ui.js'];
let problems=0;
function report(f,i,msg,line){ problems++; console.log(f+':'+(i+1)+'  '+msg+'\n    '+line.trim().slice(0,200)); }
files.forEach(f=>{
  const lines=fs.readFileSync(path.join(SRC,f),'utf8').split('\n');
  lines.forEach((ln,i)=>{
    /* только строки с русским текстом */
    if(!/[А-Яа-яЁё]{3}/.test(ln)) return;
    /* 1. мужской/женский род после «ты» */
    const re=/(^|[^А-Яа-яЁё])[Тт]ы\s+(?:не\s+|уже\s+|тоже\s+|даже\s+|ещё\s+|всё\s+|так\s+)?([а-яё]+(?:л|ла|ли))(?![а-яё])/g; let m;
    while((m=re.exec(ln))){ const w=m[2]; if(/^(мог|смог|мол|вел)$/.test(w)) continue; report(f,i,'прошедшее время после «ты»: '+w,ln); }
    const re2=/(^|[^А-Яа-яЁё])[Тт]ы\s+(?:не\s+)?(сам|один|рад|готов|должен|богат|прав|уверен|доволен|согласен|занят|способен|горд)(?![а-яё])/g;
    while((m=re2.exec(ln))) report(f,i,'род после «ты»: '+m[2],ln);
    /* 2. прочее */
    if(/  +[А-Яа-яЁё]/.test(ln.replace(/^\s+/,''))) report(f,i,'двойной пробел',ln);
    if(/\.\.(?!\.)/.test(ln) && !/\.\.\./.test(ln)) report(f,i,'две точки подряд',ln);
    const open=(ln.match(/«/g)||[]).length, close=(ln.match(/»/g)||[]).length; if(open!==close) report(f,i,'несбалансированные «»',ln);
  });
});
console.log(problems? ('\nПроблем: '+problems) : 'Текст: проблем не найдено');
process.exit(problems?1:0);
