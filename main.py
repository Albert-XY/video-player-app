import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
from skrvm import RVR
from video_feature_extraction import extract_video_features, extract_rhythm_features
from audio_feature_extraction import extract_audio_features

def extract_features(video_path, audio_path):
    video_features = extract_video_features(video_path)
    rhythm_features = extract_rhythm_features(video_path)
    audio_features = extract_audio_features(audio_path)
    
    return np.concatenate([video_features, rhythm_features, audio_features])

def train_rvm(X, y):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    rvm = RVR(kernel='rbf')
    rvm.fit(X_train_scaled, y_train)
    
    y_pred = rvm.predict(X_test_scaled)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Mean Squared Error: {mse}")
    print(f"R-squared Score: {r2}")
    
    return rvm, scaler

def main():
    # Assume we have a list of video paths, audio paths, and corresponding valence/arousal ratings
    video_paths = [...]
    audio_paths = [...]
    valence_ratings = [...]
    arousal_ratings = [...]
    
    features = []
    for video_path, audio_path in zip(video_paths, audio_paths):
        features.append(extract_features(video_path, audio_path))
    
    features = np.array(features)
    
    # Train RVM for valence
    rvm_valence, scaler_valence = train_rvm(features, valence_ratings)
    
    # Train RVM for arousal
    rvm_arousal, scaler_arousal = train_rvm(features, arousal_ratings)
    
    # Example of using the trained models
    new_video_path = "path/to/new/video.mp4"
    new_audio_path = "path/to/new/audio.mp3"
    new_features = extract_features(new_video_path, new_audio_path)
    new_features_scaled = scaler_valence.transform([new_features])
    
    predicted_valence = rvm_valence.predict(new_features_scaled)[0]
    predicted_arousal = rvm_arousal.predict(new_features_scaled)[0]
    
    print(f"Predicted Valence: {predicted_valence}")
    print(f"Predicted Arousal: {predicted_arousal}")

if __name__ == "__main__":
    main()

