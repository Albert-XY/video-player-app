import cv2
import numpy as np
from scipy.stats import skew, kurtosis
from skimage.feature import hog
from skimage import color

def extract_video_features(video_path):
    cap = cv2.VideoCapture(video_path)
    features = []
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Convert to HSV and CIE LUV color spaces
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        luv = cv2.cvtColor(frame, cv2.COLOR_BGR2LUV)
        
        # Lighting key
        v_channel = hsv[:,:,2]
        lighting_key = np.mean(v_channel) * np.std(v_channel)
        
        # Color variance
        luv_cov = np.cov(luv.reshape(-1, 3).T)
        color_variance = np.linalg.det(luv_cov)
        
        # Color histogram
        hist = cv2.calcHist([hsv], [0, 2], None, [10, 10], [0, 180, 0, 256])
        hist_features = hist.flatten() / hist.sum()
        
        # Median lightness
        hsl = cv2.cvtColor(frame, cv2.COLOR_BGR2HLS)
        median_lightness = np.median(hsl[:,:,1])
        
        # Visual cues
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        shadow_proportion = np.sum(gray < 30) / gray.size
        visual_excitement = np.std(gray)
        grayness = 1 - np.std(frame) / 128
        details = np.sum(cv2.Laplacian(gray, cv2.CV_64F) != 0) / gray.size
        
        # HOG features for motion estimation
        hog_features = hog(gray, orientations=9, pixels_per_cell=(8, 8), cells_per_block=(2, 2), visualize=False)
        
        frame_features = np.concatenate([
            [lighting_key, color_variance, median_lightness, shadow_proportion, 
             visual_excitement, grayness, details],
            hist_features,
            hog_features
        ])
        
        features.append(frame_features)
    
    cap.release()
    
    # Compute statistics over all frames
    features = np.array(features)
    return np.concatenate([
        np.mean(features, axis=0),
        np.std(features, axis=0),
        skew(features, axis=0),
        kurtosis(features, axis=0)
    ])

# Shot change detection (simplified version)
def detect_shot_changes(video_path):
    cap = cv2.VideoCapture(video_path)
    prev_frame = None
    shot_changes = []
    frame_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        if prev_frame is not None:
            diff = cv2.absdiff(frame, prev_frame)
            if np.mean(diff) > 30:  # Arbitrary threshold
                shot_changes.append(frame_count)
        
        prev_frame = frame
        frame_count += 1
    
    cap.release()
    return shot_changes

def extract_rhythm_features(video_path):
    shot_changes = detect_shot_changes(video_path)
    shot_lengths = np.diff(shot_changes)
    
    avg_shot_change_rate = len(shot_changes) / frame_count
    shot_length_variance = np.var(shot_lengths)
    
    return avg_shot_change_rate, shot_length_variance

