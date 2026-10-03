#!/usr/bin/env python3
"""Собирает игру в один файл index.html из папки src/."""
import pathlib
root = pathlib.Path(__file__).parent
src = root / 'src'
engine = (src / 'engine.js').read_text(encoding='utf-8').replace("'use strict';", '', 1)
engine = engine.replace("if(typeof module!=='undefined') module.exports = {newState:newState, runMonth:runMonth};", '')
frag = (src / 'body.html').read_text(encoding='utf-8')
frag = frag.replace('/*STYLE*/', (src / 'style.css').read_text(encoding='utf-8'))
frag = frag.replace('/*ENGINE*/', engine).replace('/*DATA*/', (src / 'data.js').read_text(encoding='utf-8')).replace('/*UI*/', (src / 'ui.js').read_text(encoding='utf-8'))
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist' / 'fragment.html').write_text(frag, encoding='utf-8')
frag = frag.replace('<title>Мерч-Империя</title>\n', '', 1)
doc = ('<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
       '<meta name="color-scheme" content="light dark">\n<title>Мерч-Империя</title>\n'
       '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}</style>\n'
       '</head>\n<body>\n' + frag + '\n</body>\n</html>\n')
(root / 'index.html').write_text(doc, encoding='utf-8')
print('index.html', len(doc) // 1024, 'KB')
