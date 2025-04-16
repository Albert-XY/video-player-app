import librosa
import numpy as np
from scipy.stats import skew, kurtosis

def extract_audio_features(audio_path):
    y, sr = librosa.load(audio_path)
    
    # MFCC
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    
    # Spectral features
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    
    # Rhythm features
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    
    # Energy
    energy = np.sum(y**2) / len(y)
    
    # Pitch
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
    pitch = np.mean(pitches[magnitudes > np.max(magnitudes)*0.8])
    
    # Combine all features
    features = np.concatenate([
        np.mean(mfcc, axis=1),
        np.std(mfcc, axis=1),
        [np.mean(spectral_centroid), np.std(spectral_centroid)],
        [np.mean(spectral_bandwidth), np.std(spectral_bandwidth)],
        [np.mean(spectral_rolloff), np.std(spectral_rolloff)],
        [tempo, energy, pitch]
    ])
    
    return features

