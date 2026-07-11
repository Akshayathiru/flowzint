import os

api_dir = r"c:\Users\Admin\OneDrive\Desktop\flowzint-new\frontend\app\api"

for root, dirs, files in os.walk(api_dir):
    for file in files:
        if file.endswith(".ts") or file.endswith(".tsx"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            modified = False
            
            # Replace hardcoded port 5000 URL
            target1 = 'const VOICE_LAYER_URL = "http://127.0.0.1:5000";'
            target1_alt = "const VOICE_LAYER_URL = 'http://127.0.0.1:5000';"
            
            # Replace localhost:8000 env checks
            target2 = 'const VOICE_LAYER_URL = process.env.VOICE_LAYER_URL || "http://localhost:8000";'
            target2_alt = "const VOICE_LAYER_URL = process.env.VOICE_LAYER_URL || 'http://localhost:8000'"
            
            if target1 in content:
                content = content.replace(target1, 'const VOICE_LAYER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.VOICE_LAYER_URL || "http://localhost:8000";')
                modified = True
            elif target1_alt in content:
                content = content.replace(target1_alt, 'const VOICE_LAYER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.VOICE_LAYER_URL || "http://localhost:8000";')
                modified = True
                
            if target2 in content:
                content = content.replace(target2, 'const VOICE_LAYER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.VOICE_LAYER_URL || "http://localhost:8000";')
                modified = True
            elif target2_alt in content:
                content = content.replace(target2_alt, 'const VOICE_LAYER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.VOICE_LAYER_URL || "http://localhost:8000";')
                modified = True
                
            if modified:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Refactored Voice URL in: {filepath}")

print("Frontend voice layer env vars unified!")
