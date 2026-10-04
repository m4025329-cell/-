/* Загружает логику игры (без интерфейса) в глобальную область: движок, сюжет, мини-события, концовки.
   Все скрипты проверки подключают этот файл, чтобы список модулей был в одном месте. */
var fs = require('fs'), vm = require('vm'), path = require('path');
var SRC = path.join(__dirname, '..', 'src');
var FILES = ['engine', 'content', 'orders', 'lab', 'events', 'minievents', 'minievents2', 'ending'];
FILES.forEach(function (f) {
  var p = path.join(SRC, f + '.js');
  if (fs.existsSync(p)) vm.runInThisContext(fs.readFileSync(p, 'utf8').replace("if(typeof module!=='undefined') module.exports = {};", ''), { filename: p });
});
module.exports = { SRC: SRC, FILES: FILES };
