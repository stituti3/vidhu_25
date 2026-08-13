import json

# Read old letters from JS file (it's export const BAKED_LETTERS = [...];)
with open('old_baked_letters.js', 'r') as f:
    js_content = f.read()
js_array_str = js_content.split('=', 1)[1].strip().rstrip(';')
old_letters = json.loads(js_array_str)

# Read current letters
with open('data/community_letters.json', 'r') as f:
    current_letters = json.load(f)

# Merge
for ol in old_letters:
    if not any(l['id'] == ol['id'] for l in current_letters):
        current_letters.append(ol)

with open('data/community_letters.json', 'w') as f:
    json.dump(current_letters, f, indent=2)

print('Merged letters:', len(current_letters))
