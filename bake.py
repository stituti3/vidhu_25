import json

# Read order from local_storage_dump
try:
    with open('data/local_storage_dump.json', 'r') as f:
        dump = json.load(f)
except Exception:
    dump = {}

memory_order = dump.get('memoryOrder', [])
letter_order = dump.get('letterOrder', [])

# Read memories from backend json
try:
    with open('data/custom_memories.json', 'r') as f:
        memories = json.load(f)
except Exception:
    memories = []

# Read letters from backend json
try:
    with open('data/community_letters.json', 'r') as f:
        letters = json.load(f)
except Exception:
    letters = []

# Merge any local storage letters just in case they were not saved in backend
ls_letters = dump.get('communityLetters', [])
for ls_let in ls_letters:
    if not any(l['id'] == ls_let['id'] for l in letters):
        letters.append(ls_let)

def get_mem_idx(mem_id):
    try:
        return memory_order.index(mem_id)
    except ValueError:
        return 999999

def get_let_idx(let_id):
    try:
        return letter_order.index(let_id)
    except ValueError:
        return 999999

memories.sort(key=lambda x: get_mem_idx(x.get('id', '')))
letters.sort(key=lambda x: get_let_idx(x.get('id', '')))

with open('src/data/baked_memories.js', 'w') as f:
    f.write('export const BAKED_MEMORIES = ' + json.dumps(memories, indent=2) + ';\n')

with open('src/data/baked_letters.js', 'w') as f:
    f.write('export const BAKED_LETTERS = ' + json.dumps(letters, indent=2) + ';\n')
