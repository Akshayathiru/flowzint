import urllib.request
import json

try:
    with urllib.request.urlopen("http://localhost:8001/active") as response:
        html = response.read()
        data = json.loads(html.decode('utf-8'))
        print(json.dumps(data, indent=2))
except Exception as e:
    print("Error:", e)
