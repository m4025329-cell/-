#!/usr/bin/env python3
"""Собирает карту Тулы в один файл city-map.html (шрифты встроены) и фрагмент для публикации."""
import base64, json, pathlib
root = pathlib.Path(__file__).parent
game = root.parent
src = root / 'src'

def fonts_css():
    meta = json.loads((game / 'fonts' / 'fonts.json').read_text(encoding='utf-8'))
    out = []
    for m in meta:
        data = base64.b64encode((game / 'fonts' / m['file']).read_bytes()).decode('ascii')
        out.append("@font-face{font-family:'%s';font-style:normal;font-weight:%s;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s}" % (m['family'], m['weight'], data, m['range']))
    return '\n'.join(out)

ORDER = ['util.js', 'geo.js', 'data.js', 'season.js', 'gen1.js', 'gen2.js', 'gen3.js', 'render1.js', 'render2.js', 'life.js', 'core.js', 'app.js', 'ui.js']
scripts = '(function(){\n"use strict";\n' + '\n'.join((src / n).read_text(encoding='utf-8') for n in ORDER if (src / n).exists()) + '\n})();'
css = (src / 'style.css').read_text(encoding='utf-8').replace('/*FONTS*/', fonts_css())
frag = (src / 'body.html').read_text(encoding='utf-8').replace('/*STYLE*/', css).replace('/*SCRIPTS*/', scripts)
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist' / 'fragment.html').write_text(frag, encoding='utf-8')
title = '<title>Карта Тулы</title>\n'
doc = ('<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
       '<meta name="color-scheme" content="light dark">\n' + title +
       '<style>:root{padding-top:env(safe-area-inset-top,0px)}body{margin:0}[hidden]{display:none!important}</style>\n'
       '</head>\n<body>\n' + frag.replace(title, '', 1) + '\n</body>\n</html>\n')
(root / 'city-map.html').write_text(doc, encoding='utf-8')
print('city-map.html', len(doc) // 1024, 'KB')
