import sys
import os

# Add root directory to sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, root_dir)

try:
    import backend.app
    print("Imports are perfectly successful!")
except Exception as e:
    import traceback
    traceback.print_exc()
    sys.exit(1)
