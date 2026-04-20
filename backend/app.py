import sys, io, base64, time, os
import numpy as np
import torch
import torch.nn.functional as F
import cv2
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from transformers import SegformerForSemanticSegmentation

app = FastAPI(title="Terrain AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
from backend.class_map import CLASSES, NUM_CLASSES

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Loading model on {device}...")

model = SegformerForSemanticSegmentation.from_pretrained(
    "nvidia/mit-b2", num_labels=16, ignore_mismatched_sizes=True)

checkpoint = torch.load(
    os.path.join(BASE_DIR, 'models', 'best_model.pth'),
    map_location=device, weights_only=False)

if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
    model.load_state_dict(checkpoint['model_state_dict'])
else:
    model.load_state_dict(checkpoint)

MIOU = 0.6374

model = model.to(device).eval()
torch.backends.cudnn.benchmark = True
print(f"Model ready! mIoU={MIOU:.4f}")

MEAN = torch.tensor([0.485, 0.456, 0.406]).view(3,1,1).to(device)
STD  = torch.tensor([0.229, 0.224, 0.225]).view(3,1,1).to(device)

def preprocess(img_bgr):
    img = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (512, 512))
    t = torch.from_numpy(img).permute(2,0,1).float().to(device) / 255.0
    t = (t - MEAN) / STD
    return t.unsqueeze(0)

def color_mask(mask_np):
    colored = np.zeros((*mask_np.shape, 3), dtype=np.uint8)
    for cid, info in CLASSES.items():
        colored[mask_np == cid] = info['color']
    return colored

def to_b64(img_rgb_np):
    _, buf = cv2.imencode('.png', cv2.cvtColor(img_rgb_np, cv2.COLOR_RGB2BGR))
    return base64.b64encode(buf).decode()

def get_traversability(mask):
    total = mask.size
    trav = sum(
        CLASSES.get(cid, {}).get('traversability', 5) * float((mask == cid).sum()) / total
        for cid in range(NUM_CLASSES)
    )
    return round(trav, 1)

def get_zone_scores(mask):
    w = mask.shape[1]
    zones = {
        'left':   mask[:, :w//3],
        'center': mask[:, w//3:2*w//3],
        'right':  mask[:, 2*w//3:]
    }
    scores = {}
    for name, zone in zones.items():
        total = zone.size
        s = sum(
            CLASSES.get(cid, {}).get('traversability', 5) * float((zone == cid).sum()) / total
            for cid in range(NUM_CLASSES)
        )
        scores[name] = round(s, 1)
    best = max(scores, key=scores.get)
    return scores, best + "_zone"

@app.get("/")
def root():
    return {"status": "Terrain AI running", "device": str(device)}

@app.get("/health")
def health():
    return {"status": "ok", "miou": MIOU, "device": str(device)}

@app.post("/segment")
async def segment(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        img_bgr = cv2.imdecode(
            np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)
        if img_bgr is None:
            return JSONResponse({"error": "Invalid image"}, status_code=400)

        orig_h, orig_w = img_bgr.shape[:2]
        t0 = time.time()

        with torch.no_grad():
            inp = preprocess(img_bgr)
            out = model(pixel_values=inp)
            logits = F.interpolate(
                out.logits, (512, 512),
                mode='bilinear', align_corners=False)

            # Rare class boosting
            boost = {
                5: 2.0, 7: 2.0, 8: 2.5,
                9: 1.8, 10: 2.0, 11: 2.5,
                13: 2.0, 14: 1.8, 15: 1.5
            }
            for cls_id, factor in boost.items():
                logits[:, cls_id, :, :] *= factor

            mask = logits.argmax(dim=1).squeeze(0).cpu().numpy().astype(np.uint8)

        ms = round((time.time() - t0) * 1000, 1)

        mask = cv2.resize(mask, (orig_w, orig_h),
                          interpolation=cv2.INTER_NEAREST)
        kernel = np.ones((3, 3), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

        colored_rgb = color_mask(mask)
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        overlay = cv2.addWeighted(img_rgb, 0.6, colored_rgb, 0.4, 0)

        classes_pct = {}
        total = mask.size
        for cid, info in CLASSES.items():
            pct = round(float((mask == cid).sum() / total * 100), 1)
            if pct > 0.1:
                classes_pct[info['name']] = pct

        trav = get_traversability(mask)
        zone_scores, best_path = get_zone_scores(mask)

        return JSONResponse({
            "mask_b64":       to_b64(colored_rgb),
            "overlay_b64":    to_b64(overlay),
            "classes":        classes_pct,
            "traversability": trav,
            "best_path":      best_path,
            "zone_scores":    zone_scores,
            "inference_ms":   ms,
            "miou":           round(MIOU, 4)
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)