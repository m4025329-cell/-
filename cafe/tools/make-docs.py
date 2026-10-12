#!/usr/bin/env python3
"""Делает PDF из документов docs/*.md (нужны пакет markdown и Playwright). python3 tools/make-docs.py"""
import pathlib, subprocess, markdown
root = pathlib.Path(__file__).resolve().parent.parent
out = root / 'dist' / 'docs'
out.mkdir(parents=True, exist_ok=True)
fonts = (root / 'fonts').as_uri()
css = """
@font-face{font-family:'Nunito';src:url(%s/Nunito-cyrillic.woff2) format('woff2');font-weight:400 900;unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:'Nunito';src:url(%s/Nunito-latin.woff2) format('woff2');font-weight:400 900;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Playfair Display';src:url(%s/PlayfairDisplay-cyrillic.woff2) format('woff2');font-weight:600 900;unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:'Playfair Display';src:url(%s/PlayfairDisplay-latin.woff2) format('woff2');font-weight:600 900;unicode-range:U+0000-00FF}
body{font:400 10.5pt/1.5 'Nunito',sans-serif;color:#2B1810;margin:0}
h1,h2,h3{font-family:'Playfair Display',Georgia,serif;line-height:1.2;color:#2B1810}
h1{font-size:22pt;border-bottom:4px solid #D1361A;padding-bottom:6px;margin:0 0 12px} h2{font-size:15pt;margin:20px 0 6px;border-bottom:2px solid #EBD6BA;padding-bottom:3px;break-after:avoid} h3{font-size:12pt;margin:14px 0 4px;break-after:avoid}
table{border-collapse:collapse;width:100%%;margin:8px 0;font-size:9.5pt;break-inside:auto} th{background:#FBEFDB;text-align:left;border:1px solid #CDB89A;padding:4px 6px} td{border:1px solid #DCC9AC;padding:4px 6px;vertical-align:top} tr{break-inside:avoid}
code{background:#FFF3DE;padding:1px 4px;border-radius:3px;font-size:9pt} pre{background:#FFF3DE;padding:8px;border-radius:6px;overflow-wrap:anywhere;white-space:pre-wrap} ul,ol{margin:4px 0 8px;padding-left:20px} li{margin:2px 0} p{margin:5px 0} em{color:#5B4033}
""" % (fonts, fonts, fonts, fonts)
docs = ['Методичка-для-учителя', 'Паспорт-проекта', 'Установка-как-приложение']
args = []
for name in docs:
    src = root / 'docs' / (name + '.md')
    html = markdown.markdown(src.read_text(encoding='utf-8'), extensions=['tables', 'sane_lists'])
    f = out / (name + '.html')
    f.write_text('<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>%s</title><style>%s</style></head><body>%s</body></html>' % (name.replace('-', ' '), css, html), encoding='utf-8')
    args += [str(f), str(root / 'docs' / (name + '.pdf'))]
subprocess.run(['node', str(root / 'tools' / 'html2pdf.js')] + args, check=True)
