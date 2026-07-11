import urllib.request
import json

try:
    print("Testing http://localhost:8000/healthz ...")
    response = urllib.request.urlopen("http://localhost:8000/healthz", timeout=5)
    print("Status code:", response.status)
    print("Headers:")
    print(response.info())
    print("Body:")
    print(response.read().decode("utf-8"))
except Exception as e:
    print("Error querying endpoint:", e)
