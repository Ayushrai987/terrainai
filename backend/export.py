# backend/export.py
import torch
import sys
sys.path.append('C:\\Users\\umesh\\terrain-ai')
from transformers import SegformerForSemanticSegmentation

# Load trained model
print("Loading best model...")
model = SegformerForSemanticSegmentation.from_pretrained(
    "nvidia/mit-b2",
    num_labels=16,
    ignore_mismatched_sizes=True
)
checkpoint = torch.load(
    'C:\\Users\\umesh\\terrain-ai\\models\\best_model.pth',
    map_location='cpu',
    weights_only=False
)
model.load_state_dict(checkpoint['model_state_dict'])
model.eval()
print(f"Loaded! mIoU was: {checkpoint['miou']:.4f}")

# Export to ONNX
print("Exporting to ONNX...")
dummy = torch.randn(1, 3, 512, 512)
torch.onnx.export(
    model, dummy,
    'C:\\Users\\umesh\\terrain-ai\\models\\terrain.onnx',
    opset_version=14,
    input_names=['image'],
    output_names=['logits'],
    dynamic_axes={
        'image': {0:'batch'},
        'logits': {0:'batch'}
    }
)
print("ONNX exported!")

# Speed test
import onnxruntime as ort
import numpy as np
import time

session = ort.InferenceSession(
    'C:\\Users\\umesh\\terrain-ai\\models\\terrain.onnx',
    providers=['CUDAExecutionProvider','CPUExecutionProvider']
)
test_input = np.random.randn(1,3,512,512).astype(np.float32)

# Warmup
for _ in range(3):
    session.run(None, {'image': test_input})

# Benchmark
times = []
for _ in range(10):
    t = time.time()
    session.run(None, {'image': test_input})
    times.append((time.time()-t)*1000)

print(f"\nInference speed: {np.mean(times):.1f}ms average")
print(f"Min: {np.min(times):.1f}ms")
print("Model ready for demo!")