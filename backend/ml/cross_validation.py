import os
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import KFold
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.models import load_model
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

def build_model(input_shape):
    # 这里需要实现模型构建的逻辑
    # 返回一个编译好的Keras模型
    pass

def kfold_cross_validation(data, labels, k=10):
    kfold = KFold(n_splits=k, shuffle=True, random_state=42)

    all_accuracy = []
    all_precision = []
    all_recall = []
    all_f1 = []

    for fold, (train_idx, val_idx) in enumerate(kfold.split(data, labels)):
        print(f"\nFold {fold + 1}/{k}")

        # 划分训练集和验证集
        X_train, X_val = data[train_idx], data[val_idx]
        y_train, y_val = labels[train_idx], labels[val_idx]

        # 构建和训练模型
        model = build_model(X_train.shape[1:])

        # 回调函数
        early_stopping = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
        model_checkpoint = ModelCheckpoint(f'best_model_fold_{fold + 1}.weights.h5', monitor='val_loss',
                                           save_best_only=True, save_weights_only=True)
        reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, min_lr=1e-6)

        history = model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=50,
            batch_size=32,
            callbacks=[early_stopping, model_checkpoint, reduce_lr],
            verbose=1
        )

        # 绘制训练集和验证集的损失曲线和准确率曲线
        plt.figure(figsize=(12, 5))

        # 损失曲线
        plt.subplot(1, 2, 1)
        plt.plot(history.history['loss'], label='Training Loss')
        plt.plot(history.history['val_loss'], label='Validation Loss')
        plt.title(f'Loss Curve for Fold {fold + 1}')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.legend()

        # 准确率曲线
        plt.subplot(1, 2, 2)
        plt.plot(history.history['accuracy'], label='Training Accuracy')
        plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
        plt.title(f'Accuracy Curve for Fold {fold + 1}')
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy')
        plt.legend()

        plt.savefig(f'fold_{fold + 1}_curves.png')
        plt.close()

        # 只有在训练结束并保存了权重文件后，才加载模型权重
        weight_file = f'best_model_fold_{fold + 1}.weights.h5'
        if os.path.exists(weight_file):
            model.load_weights(weight_file)

        # 在验证集上评估模型
        y_pred = np.argmax(model.predict(X_val), axis=1)
        y_true = np.argmax(y_val, axis=1) if len(y_val.shape) > 1 else y_val

        # 计算评估指标
        accuracy = accuracy_score(y_true, y_pred)
        precision = precision_score(y_true, y_pred, average='weighted')
        recall = recall_score(y_true, y_pred, average='weighted')
        f1 = f1_score(y_true, y_pred, average='weighted')

        all_accuracy.append(accuracy)
        all_precision.append(precision)
        all_recall.append(recall)
        all_f1.append(f1)

        print(f"Fold {fold + 1} - Accuracy: {accuracy:.4f}, Precision: {precision:.4f}, Recall: {recall:.4f}, F1: {f1:.4f}")

    # 输出平均评估指标
    print("\nAverage metrics across all folds:")
    print(f"Accuracy: {np.mean(all_accuracy):.4f} (+/- {np.std(all_accuracy):.4f})")
    print(f"Precision: {np.mean(all_precision):.4f} (+/- {np.std(all_precision):.4f})")
    print(f"Recall: {np.mean(all_recall):.4f} (+/- {np.std(all_recall):.4f})")
    print(f"F1 Score: {np.mean(all_f1):.4f} (+/- {np.std(all_f1):.4f})")

    return np.mean(all_accuracy), np.mean(all_precision), np.mean(all_recall), np.mean(all_f1)

