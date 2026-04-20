# backend/class_map.py

CLASSES = {
    0:  {"name": "background",   "color": [0,0,0],       "trav": 0},
    1:  {"name": "sky",          "color": [135,206,235],  "trav": 10},
    2:  {"name": "trees",        "color": [0,100,0],      "trav": 2},
    3:  {"name": "grass",        "color": [124,252,0],    "trav": 7},
    4:  {"name": "bushes",       "color": [34,139,34],    "trav": 3},
    5:  {"name": "rocks",        "color": [128,128,128],  "trav": 2},
    6:  {"name": "dirt_soil",    "color": [139,119,101],  "trav": 7},
    7:  {"name": "water",        "color": [0,0,205],      "trav": 0},
    8:  {"name": "road_path",    "color": [64,64,64],     "trav": 9},
    9:  {"name": "buildings",    "color": [178,34,34],    "trav": 1},
    10: {"name": "vehicles",     "color": [255,0,0],      "trav": 1},
    11: {"name": "person",       "color": [255,165,0],    "trav": 0},
    12: {"name": "flowers",      "color": [255,255,0],    "trav": 6},
    13: {"name": "logs_wood",    "color": [139,69,19],    "trav": 2},
    14: {"name": "sand_gravel",  "color": [244,164,96],   "trav": 6},
    15: {"name": "mud_puddle",   "color": [101,67,33],    "trav": 1},
}

NUM_CLASSES = 16

OFFSEG = {
    0: "sky",
    1: "traversable",
    2: "non_traversable",
    3: "obstacle"
}

CLASS_TO_OFFSEG = {
    0: 0, 1: 0, 2: 2, 3: 1,
    4: 2, 5: 2, 6: 1, 7: 2,
    8: 1, 9: 3, 10: 3, 11: 3,
    12: 1, 13: 2, 14: 1, 15: 2,
}

RELLIS_MAP = {
    0: 0,  1: 6,  3: 3,  4: 2,
    5: 0,  6: 7,  7: 1,  8: 10,
    9: 0,  10: 8, 12: 9, 15: 13,
    17: 11, 18: 0, 19: 4, 23: 8,
    27: 0, 31: 15, 33: 15, 34: 5,
}

def get_traversability_score(class_mask):
    import numpy as np
    total_pixels = class_mask.size
    score_sum = 0
    for class_id, info in CLASSES.items():
        pixel_count = (class_mask == class_id).sum()
        score_sum += (pixel_count / total_pixels) * info["trav"]
    return round(float(score_sum), 1)

def get_zone_scores(class_mask):
    import numpy as np
    h, w = class_mask.shape
    strip_w = w // 5
    directions = ["far_left", "left", "center", "right", "far_right"]
    scores = {}
    for i, direction in enumerate(directions):
        strip = class_mask[:, i*strip_w:(i+1)*strip_w]
        scores[direction] = get_traversability_score(strip)
    best = max(scores, key=scores.get)
    return scores, best

if __name__ == "__main__":
    print("class_map.py working!")