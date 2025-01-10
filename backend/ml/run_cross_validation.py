import sys
import numpy as np
from cross_validation import kfold_cross_validation

def load_data(data_path):
    # 实现数据加载逻辑
    # 返回数据和标签
    pass

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python run_cross_validation.py <data_path>")
        sys.exit(1)

    data_path = sys.argv[1]
    data, labels = load_data(data_path)

    accuracy, precision, recall, f1 = kfold_cross_validation(data, labels)

    print(f"Cross-validation results:")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1 Score: {f1:.4f}")

