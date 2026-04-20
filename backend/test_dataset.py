import sys
sys.path.append('C:\\Users\\umesh\\terrain-ai')

from backend.class_map import RELLIS_MAP, NUM_CLASSES, CLASSES

print("="*40)
print("CLASS MAP TEST")
print("="*40)
print(f"Total classes: {NUM_CLASSES}")
print(f"RELLIS mappings: {len(RELLIS_MAP)}")
print()
print("Traversability scores:")
for cid, info in CLASSES.items():
    bar = "█" * info['trav']
    print(f"  {info['name']:15s}: {info['trav']:2d}/10  {bar}")
print()
print("All good! Ready for training.")