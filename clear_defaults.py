import re

with open('src/data/birthdayData.js', 'r') as f:
    content = f.read()

# Match from memories: [ until ],
content = re.sub(r'memories:\s*\[.*?\](,|(?=\s*//))', 'memories: [],', content, flags=re.DOTALL)

# Match from letters: [ until ],
content = re.sub(r'letters:\s*\[.*?\](,|(?=\s*//))', 'letters: [],', content, flags=re.DOTALL)

with open('src/data/birthdayData.js', 'w') as f:
    f.write(content)
