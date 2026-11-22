import difflib
import itertools
import json
import re
from pathlib import Path

data = json.loads(Path('reports/round-2/browser-checks.json').read_text())
pages = {p['route']: p['text'] for p in data['pages'] if '/outbound/' in p['route']}
assert len(pages) == 6
pairs = []
for (a, first), (b, second) in itertools.combinations(pages.items(), 2):
    x, y = [re.findall(r"[\w'-]+", body.lower()) for body in (first, second)]
    shared = sum(block.size for block in difflib.SequenceMatcher(None, x, y, autojunk=False).get_matching_blocks() if block.size >= 5)
    pairs.append({'pages': [a, b], 'sharedWords': shared, 'bodyWords': [len(x), len(y)], 'percent': round(100 * shared / min(len(x), len(y)), 2)})
report = {'method': 'Main body including headings, guarantee, FAQ replacement and CTAs. Navigation/footer excluded. Lowercase word tokens; shared contiguous blocks of at least five words, SequenceMatcher with autojunk disabled; divided by shorter body.', 'pairs': pairs}
Path('reports/round-2/duplication.json').write_text(json.dumps(report, indent=2))
print(json.dumps(sorted(pairs, key=lambda pair: pair['percent'], reverse=True), indent=2))
