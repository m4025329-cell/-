/* Загружает логику игры (без интерфейса) в глобальную область. Все скрипты проверки подключают этот файл. */
var fs = require('fs'), vm = require('vm'), path = require('path');
var SRC = path.join(__dirname, '..', 'src');
var FILES = ['data', 'engine', 'orders', 'events', 'events2', 'story', 'quiz', 'ending', 'art'];
FILES.forEach(function (f) {
  var p = path.join(SRC, f + '.js');
  if (fs.existsSync(p)) vm.runInThisContext(fs.readFileSync(p, 'utf8'), { filename: p });
});
module.exports = { SRC: SRC, FILES: FILES };
