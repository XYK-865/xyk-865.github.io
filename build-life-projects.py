"""Build the three project pages from reviewed public sources; no private input."""
from pathlib import Path
from html import escape
from urllib.parse import urlparse
import json, re

ROOT = Path(__file__).resolve().parent
SITE = ROOT / 'site'
ASSETS = SITE / 'assets/personal-os'
REV = 'personal-os-20261101'
PAGES = [
    ('personal-os', 'Personal OS｜人生元系统', 'PERSONAL OS / V0.1', '把信息变成判断，把行动变成反馈。', '八大人生领域、跨领域母题与可修正的认知系统。', ['overview', 'architecture', 'domains', 'mother-questions', 'knowledge', 'action-engine', 'romance', 'cross-domain', 'presentation', 'evolution']),
    ('decision-model', '个人快速判断与退出模型', 'DECISION ENGINE / V0.4', '做选择，也为调整和退出留好位置。', '目标、约束、成本、可逆性、退出合约与结果复盘。', ['when-to-use', 'decision-flow', 'quadrants', 'comparison', 'exit-contract', 'example', 'review', 'nine-questions']),
]

def inline(text):
    text = escape(str(text), quote=True)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'(?<!\*)\*([^*\n]+)\*(?!\*)', r'<em>\1</em>', text)
    def link(match):
        url = match[2].replace('&amp;', '&')
        return '<a href="' + escape(url, quote=True) + '">' + match[1] + '</a>' if urlparse(url).scheme in ('https', 'http') or url.startswith('#') else match[1]
    return re.sub(r'\[([^\]]+)\]\(([^\s)]+)\)', link, text)

def table(rows):
    head, body = rows[0], rows[1:]
    if '第一象限' in head[0] and len(body) == 3:
        cells = [(head[0], body[0][0]), (head[1], body[0][1]), (body[1][0], body[2][0]), (body[1][1], body[2][1])]
        return '<div class="life-quadrants">' + ''.join('<article><small>0' + str(i + 1) + '</small><h3>' + inline(title.replace('**', '')) + '</h3><p>' + inline(text) + '</p></article>' for i, (title, text) in enumerate(cells)) + '</div>'
    if head[0] == '编号' and head[1] == '领域':
        navigation = '<nav class="life-domain-nav" aria-label="八大人生领域">' + ''.join('<a href="#' + row[0] + '">' + inline(row[1].split(' ')[0]) + '</a>' for row in body) + '</nav>'
        return navigation + '<div class="life-domain-grid">' + ''.join('<article id="' + row[0] + '"><small>' + row[0] + '</small><h3>' + inline(row[1]) + '</h3><p>' + inline(row[2]) + '</p></article>' for row in body) + '</div>'
    if head[0] == 'ID' and '母题' in head[1]:
        return '<div class="life-question-grid">' + ''.join('<article id="' + row[0] + '"><small>' + row[0] + '</small><h3><a href="#' + row[0] + '">' + inline(row[1]) + '</a></h3><p>' + inline(row[2]) + '</p></article>' for row in body) + '</div>'
    return '<table class="life-table"><thead><tr>' + ''.join('<th scope="col">' + inline(c) + '</th>' for c in head) + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join('<td data-label="' + escape(head[min(i, len(head) - 1)]) + '">' + inline(c) + '</td>' for i, c in enumerate(row)) + '</tr>' for row in body) + '</tbody></table>'

def markdown(text, section_ids):
    lines = text.splitlines()
    result, headings, paragraph = [], [], []
    listing = None
    current_section = False
    section_count = 0
    i = 0
    def flush():
        nonlocal listing
        if paragraph:
            result.append('<p>' + inline('\n'.join(paragraph)).replace('\n', '<br>') + '</p>')
            paragraph.clear()
        if listing:
            result.append('</' + listing + '>')
            listing = None
    while i < len(lines):
        line, stripped = lines[i], lines[i].strip()
        if stripped.startswith('```'):
            flush()
            code = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                code.append(lines[i])
                i += 1
            code = '\n'.join(code)
            result.append('<pre class="life-code"><code>' + escape(code) + '</code></pre>')
            i += 1
            continue
        if i + 1 < len(lines) and '|' in line and re.match(r'^\s*\|?\s*:?-{3,}', lines[i + 1]):
            flush()
            rows = []
            while i < len(lines) and '|' in lines[i] and lines[i].strip():
                cells = [c.strip() for c in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(':?-{3,}:?', c) for c in cells):
                    rows.append(cells)
                i += 1
            result.append(table(rows))
            continue
        match = re.match(r'^(#{1,6})\s+(.+)', line)
        if match:
            flush()
            level, title = len(match[1]), match[2]
            if level == 1:
                i += 1
                continue
            if level == 2:
                if current_section:
                    result.append('</section>')
                target = section_ids[section_count]
                section_count += 1
                result.append('<section class="life-section" aria-labelledby="heading-' + target + '"><h2 id="' + target + '"><span id="heading-' + target + '">' + inline(title) + '</span></h2>')
                current_section = True
                headings.append({'id': target, 'title': title})
            else:
                result.append('<h' + str(level) + '>' + inline(title) + '</h' + str(level) + '>')
            i += 1
            continue
        if re.fullmatch(r'\s*([-*_])(?:\s*\1){2,}\s*', line):
            flush()
            result.append('<hr>')
            i += 1
            continue
        if stripped.startswith('>'):
            flush()
            quote = []
            while i < len(lines) and lines[i].strip().startswith('>'):
                quote.append(re.sub(r'^\s*>\s?', '', lines[i]))
                i += 1
            result.append('<blockquote><p>' + inline(' '.join(quote)) + '</p></blockquote>')
            continue
        match = re.match(r'^\s*(?:([-+*])|(\d+)[.)])\s+(.+)', line)
        if match:
            target = 'ol' if match[2] else 'ul'
            if paragraph:
                flush()
            if listing != target:
                if listing:
                    result.append('</' + listing + '>')
                result.append('<' + target + '>')
                listing = target
            result.append('<li>' + inline(match[3]) + '</li>')
        elif not stripped:
            flush()
        else:
            if listing:
                result.append('</' + listing + '>')
                listing = None
            paragraph.append(line)
        i += 1
    flush()
    if current_section:
        result.append('</section>')
    if section_count != len(section_ids):
        raise ValueError('Review the section IDs after changing the document structure')
    return '\n'.join(result), headings

def shell(slug, title, kicker, subtitle, description, content):
    tabs = [('personal-os', '人生元系统'), ('decision-model', '判断与退出'), ('life-checklist', '人生清单')]
    nav = ''.join('<a href="' + name + '.html"' + (' aria-current="page"' if name == slug else '') + '>' + label + '</a>' for name, label in tabs)
    return '''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<!-- Generated by build-life-projects.py. Edit assets/personal-os/content/*.md or checklist.json. -->
<title>''' + escape(title) + ''' · Spike Hsu</title><meta name="description" content="''' + escape(description) + '''">
<link rel="icon" href="favicon.svg?v=2" type="image/svg+xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Serif+SC:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css?v=cat-smooth-parity-20261028"><link rel="stylesheet" href="assets/personal-os/life-projects.css?v=''' + REV + '''"></head>
<body class="life-project-page"><a class="skip-link" href="#main">跳到主要内容</a><header id="site-header" data-page="projects"></header>
<main id="main" class="page-shell life-main"><nav class="life-breadcrumb" aria-label="面包屑"><a href="projects.html">项目与作品</a><span>/</span><span>''' + escape(title) + '''</span></nav>
<nav class="life-project-nav" aria-label="个人项目">''' + nav + '''</nav>
<header class="life-hero"><div><p class="kicker">''' + escape(kicker) + '''</p><h1>''' + escape(title) + '''</h1><p class="life-subtitle">''' + escape(subtitle) + '''</p><p class="life-description">''' + escape(description) + '''</p></div><div class="life-hero-mark" aria-hidden="true"><span>INPUT</span><i>↓</i><strong>判断 · 行动</strong><i>↺</i><span>REVIEW & EVOLVE</span></div></header>
''' + content + '''
<footer class="life-page-end"><a href="projects.html">← 返回项目</a><a href="#main">返回顶部 ↑</a></footer></main>
<footer id="site-footer"></footer><script src="posts.js"></script><script src="app.js?v=cat-smooth-parity-20261028"></script><script type="module" src="assets/personal-os/life-projects.js?v=''' + REV + '''"></script></body></html>'''

def template_section():
    templates = [('cognition-card', '认知卡', '把事实、解释、价值偏好、证据与反例分开记录。'), ('mother-question', '母题', '用一个可以跨领域反复追问的问题组织资料。'), ('principle', '原则', '记录成立依据、适用边界、反例与版本变化。'), ('source-note', '来源笔记', '保存作者观点、上下文和你自己的补充推断。'), ('decision-record', '四宫格决策记录', '在行动前写下选择依据、检查点和退出条件。'), ('review', '结果复盘', '对照原判断，更新原则并留下下一步验证。')]
    return '<section class="life-section life-templates"><h2 id="templates">模板工具箱</h2><p>下载空白模板，在自己的笔记中填写。模板默认标记为 private；这里没有任何个人填写记录。</p><div class="life-template-grid">' + ''.join('<a href="assets/personal-os/templates/' + name + '.md" download><strong>' + title + '</strong><p>' + description + '</p><span>下载 Markdown ↓</span></a>' for name, title, description in templates) + '</div></section>'

search = []
for slug, title, kicker, subtitle, description, ids in PAGES:
    raw = (ASSETS / 'content' / (slug + '.md')).read_text(encoding='utf-8-sig')
    front, text = raw.split('---', 2)[1:]
    meta = dict(line.split(':', 1) for line in front.strip().splitlines() if ':' in line)
    meta = {key.strip(): value.strip() for key, value in meta.items()}
    if meta.get('visibility') != 'public':
        raise ValueError('Cannot publish private source')
    body, headings = markdown(text, ids)
    links = ''.join('<li><a href="#' + h['id'] + '">' + escape(h['title']) + '</a></li>' for h in headings)
    if slug == 'personal-os':
        links += '<li><a href="#templates">模板工具箱</a></li>'
        body += template_section()
    peer_slug, peer_title = ('decision-model', '个人快速判断与退出模型') if slug == 'personal-os' else ('personal-os', 'Personal OS｜人生元系统')
    actions = '<div class="life-reading-actions"><span>公开草案 · V' + meta['version'] + ' · 更新 ' + meta['updated'] + '</span><a href="assets/personal-os/content/' + slug + '.md" download>下载原稿 ↓</a><a href="' + peer_slug + '.html">' + peer_title + ' ↗</a></div>'
    if slug == 'decision-model':
        actions += '<div class="life-quick-nav"><a href="#quadrants">四宫格</a><a href="#exit-contract">退出合约</a><a href="#nine-questions">九问速览</a><a href="assets/personal-os/templates/decision-record.md" download>下载空白记录 ↓</a></div>'
    layout = actions + '<div class="life-reading-layout"><aside class="life-toc"><details open><summary>本文目录</summary><ol>' + links + '</ol></details></aside><article class="life-body" aria-label="完整正文">' + body + '</article></div>'
    (SITE / (slug + '.html')).write_text(shell(slug, title, kicker, subtitle, description, layout), encoding='utf-8')
    search.append({'id': slug, 'title': title, 'href': slug + '.html', 'category': '项目', 'heading': title, 'text': re.sub(r'[`#*|>]', '', text)})

data_file = ASSETS / 'checklist.json'
if data_file.exists():
    data = json.loads(data_file.read_text(encoding='utf-8'))
    categories, items = data['categories'], data['items']
    source_revision = data['attribution']['snapshot']
    filters = '<button type="button" data-life-category="all" aria-pressed="true">全部</button>' + ''.join('<button type="button" data-life-category="' + c['id'] + '" aria-pressed="false">' + escape(c.get('shortLabel', c['title'])) + '</button>' for c in categories)
    groups = []
    for category in categories:
        cards = []
        for item in [i for i in items if i['category'] == category['id']]:
            if not item['sourceURL'].startswith('https://github.com/eternity4719/HowToLiveBetter/'):
                raise ValueError('Review checklist source URL: ' + item['id'])
            cards.append('<article class="life-check-card" id="' + item['id'] + '" data-life-item data-category="' + category['id'] + '"><p class="life-card-kicker">资料线索 · 待实践</p><h3>' + escape(item['title']) + '</h3><p>' + escape(item['summary']) + '</p><details><summary>带着一个问题回看</summary><p>' + escape(item['reflection']) + '</p><a href="decision-model.html#quadrants">用四宫格梳理这个问题 →</a></details><a class="life-source-link" href="' + escape(item['sourceURL'], quote=True) + '" target="_blank" rel="noopener noreferrer">' + escape(item['sourceTitle']) + ' ↗</a></article>')
            search.append({'id': item['id'], 'title': '人生高性价比清单', 'heading': item['title'], 'href': 'life-checklist.html#' + item['id'], 'category': '项目', 'text': item['summary'] + ' ' + item['reflection']})
        groups.append('<section class="life-check-group" data-life-group="' + category['id'] + '" aria-labelledby="category-' + category['id'] + '"><div class="life-group-heading"><span>0' + str(len(groups) + 1) + '</span><div><h2 id="category-' + category['id'] + '">' + escape(category['title']) + '</h2><p>' + escape(category.get('description', '')) + '</p></div></div><div class="life-check-grid">' + ''.join(cards) + '</div></section>')
    intro = '<div class="life-check-intro"><p><strong>V0.1 · 七类主题 · ' + str(len(items)) + ' 个查阅入口</strong></p><p>把值得查证的生活问题留在一个地方。这里的摘要是个人整理，不沿用来源的证据评级，也不代表已经验证或实践；具体决定仍要核对原始依据、时效与个人条件。</p><p>健康、法律和财务内容用于找线索，实际行动前核对官方或专业来源。</p></div>'
    controls = '<section class="life-check-controls" aria-label="清单查询"><label for="life-query">查找生活主题</label><input type="search" id="life-query" placeholder="试试：睡眠、消费、劳动合同" autocomplete="off"><div class="life-filters" aria-label="生活分类">' + filters + '</div><p id="life-count" role="status" aria-live="polite">' + str(len(items)) + ' / ' + str(len(items)) + ' 个主题</p></section>'
    source = '<section class="life-attribution"><h2 id="sources">来源与维护</h2><p>参考「高性价比人生指南」（<a href="https://github.com/eternity4719/HowToLiveBetter" target="_blank" rel="noopener noreferrer">eternity4719 / HowToLiveBetter 项目贡献者</a>），按 <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> 使用。本页重新分类并改写主题摘要、补充复盘问题，未复制整库正文，未沿用其证据评级或量化收益。参考快照：<a href="https://github.com/eternity4719/HowToLiveBetter/tree/' + source_revision + '" target="_blank" rel="noopener noreferrer"><code>' + source_revision[:7] + '</code></a> · 整理日期：2026-11-01。</p><p>遇到新资料时保留来源、条件和可能的反例，再判断是否加入自己的原则；完成一次实践后，可使用 <a href="assets/personal-os/templates/review.md" download>复盘模板</a>记录结果。</p></section>'
    body = intro + controls + '<div id="life-checklist">' + ''.join(groups) + '</div><p id="life-empty" hidden>没有找到匹配主题，试试其他关键词或分类。</p>' + source
    (SITE / 'life-checklist.html').write_text(shell('life-checklist', '人生高性价比清单', 'LIFE CHECKLIST / V0.1', '把生活里的重要问题，整理成可以回看的清单。', '健康、金钱、职业、关系、法律、成长与时间，七个入口持续积累。', body), encoding='utf-8')
    search.insert(2, {'id': 'life-checklist', 'title': '人生高性价比清单', 'heading': '七类生活主题', 'href': 'life-checklist.html', 'category': '项目', 'text': ' '.join(c['title'] for c in categories)})

(ROOT / 'life-project-search-entries.json').write_text(json.dumps(search, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
index_file = SITE / 'search-index.json'
if index_file.exists():
    index = json.loads(index_file.read_text(encoding='utf-8'))
    owned_pages = {'projects.html', 'personal-os.html', 'decision-model.html', 'life-checklist.html'}
    preserved = [item for item in index['items'] if item.get('href', '').split('?', 1)[0].split('#', 1)[0] not in owned_pages]
    project_entry = {'title': '项目与作品', 'heading': '持续迭代的个人项目', 'href': 'projects.html#life-projects-title', 'category': '项目', 'text': 'Personal OS 人生元系统、个人快速判断与退出模型、人生高性价比清单、Bilibili影像频道和GitHub实验室。'}
    index['items'] = preserved + [project_entry] + search
    index['version'] = REV
    index_file.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'pages': 3 if data_file.exists() else 2, 'searchEntries': len(search)}, ensure_ascii=False))
