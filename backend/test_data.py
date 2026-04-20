import sys
sys.path.append('C:\\Users\\umesh\\terrain-ai')
from backend.dataset import RELLISDataset

ds = RELLISDataset(
    'C:\\Users\\umesh\\terrain-ai\\data\\raw\\Rellis-3D',
    'C:\\Users\\umesh\\terrain-ai\\data\\raw\\train.lst'
)

img, mask = ds[0]
print('Image shape:', img.shape)
print('Mask shape:', mask.shape)
print('Unique classes:', mask.unique().tolist())
print('Dataset ready!')