#!/usr/bin/env python3
"""Собирает игру «Первый столик» в один файл index.html (шрифты встроены) и фрагмент для публикации."""
import base64, json, pathlib
root = pathlib.Path(__file__).parent
src = root / 'src'
APP_VERSION = '1.0.0'

def fonts_css():
    meta = json.loads((root / 'fonts' / 'fonts.json').read_text(encoding='utf-8'))
    out = []
    for m in meta:
        data = base64.b64encode((root / 'fonts' / m['file']).read_bytes()).decode('ascii')
        out.append("@font-face{font-family:'%s';font-style:normal;font-weight:%s;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s}" % (m['family'], m['weight'], data, m['range']))
    return '\n'.join(out)

def js(name):
    return (src / name).read_text(encoding='utf-8')

logic = '\n'.join(js(n) for n in ['data.js', 'engine.js', 'orders.js', 'events.js', 'events2.js', 'story.js', 'quiz.js', 'ending.js', 'art.js'])
ui = '(function(){\n\'use strict\';\n' + '\n'.join(js(n) for n in ['ui1.js', 'ui2.js', 'ui3.js', 'ui4.js']).replace('APP_VERSION=\'1.0.0\'', "APP_VERSION='%s'" % APP_VERSION) + '\n})();'
scripts = logic + '\n' + ui
css = (src / 'style.css').read_text(encoding='utf-8').replace('/*FONTS*/', fonts_css())
frag = (src / 'body.html').read_text(encoding='utf-8').replace('/*STYLE*/', css).replace('/*SCRIPTS*/', scripts)
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist' / 'fragment.html').write_text(frag, encoding='utf-8')
head_title = '<title>Первый столик</title>\n'
doc = ('<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
       '<meta name="color-scheme" content="light dark">\n<meta name="theme-color" content="#D1361A">\n'
       '<meta name="description" content="Экономическая игра о кафе, которое растёт в сеть ресторанов в разных городах">\n' + head_title +
       '<style>:root{padding-top:env(safe-area-inset-top,0px)}body{margin:0}[hidden]{display:none!important}</style>\n'
       '</head>\n<body>\n' + frag.replace(head_title, '', 1) + '\n</body>\n</html>\n')
(root / 'index.html').write_text(doc, encoding='utf-8')
print('index.html', len(doc) // 1024, 'KB')
