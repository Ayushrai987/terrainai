# backend/dataset.py
import os
import cv2
import numpy as np
import torch
from torch.utils.data import Dataset
from backend.class_map import RELLIS_MAP, NUM_CLASSES

class RELLISDataset(Dataset):
    def __init__(self, root, split_file, transform=None):
        self.root = root
        self.transform = transform
        self.pairs = []

        with open(split_file, 'r') as f:
            for line in f.readlines():
                parts = line.strip().split()
                if len(parts) == 2:
                    img_path = os.path.join(root, parts[0])
                    mask_path = os.path.join(root, parts[1])
                    if os.path.exists(img_path) and os.path.exists(mask_path):
                        self.pairs.append((img_path, mask_path))

        print(f"RELLIS loaded: {len(self.pairs)} pairs")

    def __len__(self):
        return len(self.pairs)

    def __getitem__(self, idx):
        img_path, mask_path = self.pairs[idx]
        image = cv2.imread(img_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
        new_mask = np.zeros_like(mask)
        for orig_id, new_id in RELLIS_MAP.items():
            new_mask[mask == orig_id] = new_id
        if self.transform:
            augmented = self.transform(image=image, mask=new_mask)
            image = augmented['image']
            new_mask = augmented['mask']
            return image, new_mask.long()
        return image, torch.from_numpy(new_mask).long()


class RUGDDataset(Dataset):
    def __init__(self, frames_dir, annotations_dir, transform=None):
        self.transform = transform
        self.pairs = []
        self.color_map = {
            (108,64,20):   6,
            (255,229,204): 14,
            (0,102,0):     3,
            (0,255,0):     2,
            (0,153,153):   0,
            (0,128,255):   7,
            (0,0,255):     1,
            (255,255,0):   10,
            (255,0,127):   0,
            (64,64,64):    8,
            (255,128,0):   14,
            (255,0,0):     9,
            (153,76,0):    6,
            (102,102,0):   5,
            (102,0,0):     13,
            (0,255,128):   10,
            (204,153,255): 11,
            (102,0,204):   0,
            (0,153,0):     4,
            (0,204,255):   0,
            (128,128,128): 5,
            (204,0,0):     8,
            (76,76,76):    8,
            (0,0,0):       0,
        }

        for scene in sorted(os.listdir(frames_dir)):
            scene_img_dir = os.path.join(frames_dir, scene)
            scene_ann_dir = os.path.join(annotations_dir, scene)
            if not os.path.isdir(scene_img_dir):
                continue
            if not os.path.exists(scene_ann_dir):
                continue
            for img_file in sorted(os.listdir(scene_img_dir)):
                if not img_file.endswith('.png'):
                    continue
                img_path = os.path.join(scene_img_dir, img_file)
                ann_path = os.path.join(scene_ann_dir, img_file)
                if os.path.exists(ann_path):
                    self.pairs.append((img_path, ann_path))

        print(f"RUGD loaded: {len(self.pairs)} pairs")

    def __len__(self):
        return len(self.pairs)

    def __getitem__(self, idx):
        img_path, ann_path = self.pairs[idx]
        image = cv2.imread(img_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        ann = cv2.imread(ann_path)
        ann = cv2.cvtColor(ann, cv2.COLOR_BGR2RGB)
        mask = np.zeros(ann.shape[:2], dtype=np.uint8)
        for color, class_id in self.color_map.items():
            match = np.all(ann == np.array(color), axis=2)
            mask[match] = class_id
        if self.transform:
            augmented = self.transform(image=image, mask=mask)
            image = augmented['image']
            mask = augmented['mask']
            return image, mask.long()
        return image, torch.from_numpy(mask).long()