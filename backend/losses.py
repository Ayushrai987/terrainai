# backend/losses.py
import torch
import torch.nn as nn
import torch.nn.functional as F


class DiceLoss(nn.Module):
    def __init__(self, num_classes, smooth=1e-6):
        super().__init__()
        self.num_classes = num_classes
        self.smooth = smooth

    def forward(self, pred, target):
        pred = F.softmax(pred, dim=1)
        target_one_hot = F.one_hot(
            target, self.num_classes
        ).permute(0, 3, 1, 2).float()
        intersection = (pred * target_one_hot).sum(dim=(2, 3))
        union = pred.sum(dim=(2, 3)) + target_one_hot.sum(dim=(2, 3))
        dice = (2 * intersection + self.smooth) / (union + self.smooth)
        return 1 - dice.mean()


class CCALLoss(nn.Module):
    """
    Confusion-Aware Composite Loss
    Reference: springaav GitHub repo
    Standard loss se 0.28% mIoU improvement free milta hai
    """
    def __init__(self, num_classes, confusion_matrix=None,
                 ce_weight=0.5, dice_weight=0.3, ccal_weight=0.2):
        super().__init__()
        self.num_classes = num_classes
        self.ce_weight = ce_weight
        self.dice_weight = dice_weight
        self.ccal_weight = ccal_weight
        self.dice = DiceLoss(num_classes)

        # Confusion matrix — off-road classes ke liye
        # Ye penalize karta hai jab model commonly confused
        # classes ko galat predict karta hai
        if confusion_matrix is not None:
            self.register_buffer(
                'conf_mat',
                torch.FloatTensor(confusion_matrix)
            )
        else:
            # Default — grass/dirt confusion penalize karo
            conf = torch.eye(num_classes)
            conf[3][6] = 0.3   # grass ↔ dirt
            conf[6][3] = 0.3
            conf[4][2] = 0.2   # bushes ↔ trees
            conf[2][4] = 0.2
            conf[15][7] = 0.4  # mud ↔ water
            conf[7][15] = 0.4
            self.register_buffer('conf_mat', conf)

    def forward(self, pred, target):
        # 1. Standard Cross Entropy
        ce_loss = F.cross_entropy(pred, target, ignore_index=255)

        # 2. Dice Loss
        dice_loss = self.dice(pred, target)

        # 3. Confusion-Aware Loss
        pred_soft = F.softmax(pred, dim=1)
        B, C, H, W = pred_soft.shape
        target_flat = target.view(-1)
        pred_flat = pred_soft.permute(0, 2, 3, 1).reshape(-1, C)

        valid = target_flat != 255
        target_valid = target_flat[valid]
        pred_valid = pred_flat[valid]

        conf_weights = self.conf_mat[target_valid]
        ccal_loss = -(conf_weights * torch.log(pred_valid + 1e-10)).mean()

        total = (self.ce_weight * ce_loss +
                 self.dice_weight * dice_loss +
                 self.ccal_weight * ccal_loss)
        return total