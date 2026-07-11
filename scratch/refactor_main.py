import os

main_path = r"c:\Users\Admin\OneDrive\Desktop\flowzint-new\main.py"

with open(main_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace import of FastAPI to include APIRouter
content = content.replace(
    "from fastapi import FastAPI, UploadFile,",
    "from fastapi import FastAPI, APIRouter, UploadFile,"
)

# Insert router initialization
content = content.replace(
    'app = FastAPI(title="Voice & Language Layer API")',
    'app = FastAPI(title="Voice & Language Layer API")\nrouter = APIRouter()'
)

# Replace @app. with @router. except @app.get("/healthz")
# We can do this by first replacing @app.get("/healthz") with a temporary token,
# then replacing @app. with @router., and then restoring @app.get("/healthz")
content = content.replace('@app.get("/healthz")', '__HEALTHZ_DECORATOR__')
content = content.replace('@app.', '@router.')
content = content.replace('__HEALTHZ_DECORATOR__', '@app.get("/healthz")')

# Append app.include_router(router) at the end of the file
content += "\n\napp.include_router(router)\n"

with open(main_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully refactored main.py!")
