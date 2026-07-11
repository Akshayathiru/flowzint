import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import engine
print("Engine URL:", engine.url)
print("Resolved absolute path:", os.path.abspath(str(engine.url).replace("sqlite:///", "")))
