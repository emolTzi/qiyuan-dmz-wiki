#!/usr/bin/env python3
"""Check local links/assets and HTML fragments without building the static site."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.refs, self.ids = path, [], set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for name in ('id', 'name'):
            if attrs.get(name):
                self.ids.add(attrs[name])
        for name in ('href', 'src', 'poster', 'data-src'):
            if attrs.get(name):
                self.refs.append((self.getpos()[0], attrs[name]))
        if attrs.get('srcset') and not attrs['srcset'].startswith('data:'):
            self.refs.extend((self.getpos()[0], item.strip().split()[0])
                             for item in attrs['srcset'].split(',') if item.strip())
        for ref in re.findall(r'url\([\s\"\']*([^\)\"\']+)', attrs.get('style', '')):
            self.refs.append((self.getpos()[0], ref.strip()))

    handle_startendtag = handle_starttag

pages = {}
for path in sorted(ROOT.rglob('*.html')):
    if '.git' in path.parts:
        continue
    page = Page(path)
    page.feed(path.read_text(encoding='utf-8-sig'))
    pages[path] = page

checked = external = assets = 0
errors = []

def check(owner, lineno, ref, fragments=True):
    global checked, external, assets
    url = urlsplit(ref)
    if url.scheme or url.netloc:
        external += 1
        return
    target = (ROOT / unquote(url.path).lstrip('/') if url.path.startswith('/')
              else owner.parent / unquote(url.path)) if url.path else owner
    target = target.resolve()
    if target.is_dir():
        target = target / 'index.html'
    checked += 1
    if target.is_relative_to(ROOT) and 'assets' in target.relative_to(ROOT).parts:
        assets += 1
    reason = None
    if not target.is_relative_to(ROOT):
        reason = 'outside site root'
    elif not target.is_file():
        reason = 'missing file'
    elif fragments and url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
        reason = 'missing fragment'
    if reason:
        errors.append(f'{owner.relative_to(ROOT)}:{lineno}: {ref} ({reason})')

for path, page in pages.items():
    for lineno, ref in page.refs:
        check(path, lineno, ref)
# Also follow CSS url() assets, so a valid stylesheet cannot hide a broken image/font reference.
for path in sorted((ROOT / 'assets').rglob('*.css')):
    css = path.read_text(encoding='utf-8-sig')
    for match in re.finditer(r'url\(\s*[\"\']?([^\)\"\']+)', css):
        check(path, css[:match.start()].count('\n') + 1, match[1].strip(), False)

print(f'HTML pages: {len(pages)}; local references: {checked}; assets: {assets}; external/data skipped: {external}; errors: {len(errors)}')
for error in errors:
    print(error)
sys.exit(bool(errors))
