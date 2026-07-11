import os

api_dir = r"c:\Users\Admin\OneDrive\Desktop\flowzint-new\frontend\app\api"

targets = [
    # With semicolon
    ('const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";',
     'const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";'),
    ("const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';",
     "const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';"),
    ('const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001";',
     'const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:8001";'),
    ("const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8001';",
     "const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:8001';"),
     
    # Without semicolon
    ('const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"',
     'const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"'),
    ("const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'",
     "const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'"),
    ('const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001"',
     'const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:8001"'),
    ("const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8001'",
     "const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:8001'")
]

for root, dirs, files in os.walk(api_dir):
    for file in files:
        if file.endswith(".ts") or file.endswith(".tsx"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            modified = False
            for target, replacement in targets:
                if target in content:
                    content = content.replace(target, replacement)
                    modified = True
                    break  # Avoid double matching/replacement in the same pass
                
            if modified:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Refactored: {filepath}")

print("Frontend API env vars unified completely!")
