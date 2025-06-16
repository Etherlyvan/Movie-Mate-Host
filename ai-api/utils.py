# utils.py - Lightweight version (NO 4.4GB file)
import numpy as np
import pandas as pd
import json
import joblib
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import logging
from functools import lru_cache
import os

logger = logging.getLogger(__name__)

class LightweightModelLoader:
    def __init__(self):
        self.tfidf_vectorizer = None
        self.movies_df = None
        self.index_to_movie_id = None
        self.movie_id_to_index = None
        
    def load_models(self):
        """Load lightweight models (total ~3MB)"""
        try:
            logger.info("🔄 Loading lightweight models...")
            
            # Load TF-IDF vectorizer (189 KB)
            logger.info("📦 Loading TF-IDF vectorizer...")
            self.tfidf_vectorizer = joblib.load("models/tfidf_vectorizer.pkl")
            logger.info(f"✅ TF-IDF loaded: {os.path.getsize('models/tfidf_vectorizer.pkl')} bytes")
            
            # Load movies dataset (2 MB)
            logger.info("📊 Loading movies dataset...")
            self.movies_df = pd.read_csv("models/movies_content.csv")
            logger.info(f"✅ Movies loaded: {len(self.movies_df)} movies")
            
            # Load movie ID mappings (386 KB)
            logger.info("🗂️ Loading movie ID mappings...")
            with open("models/movie_id_mappings.json", "r") as f:
                self.index_to_movie_id = json.load(f)
            self.movie_id_to_index = {v: int(k) for k, v in self.index_to_movie_id.items()}
            logger.info(f"✅ Mappings loaded: {len(self.index_to_movie_id)} mappings")
            
            # Calculate total model size
            total_size = (
                os.path.getsize("models/tfidf_vectorizer.pkl") +
                os.path.getsize("models/movies_content.csv") +
                os.path.getsize("models/movie_id_mappings.json")
            )
            logger.info(f"🎯 Total model size: {total_size / (1024*1024):.2f} MB")
            logger.info("✅ All lightweight models loaded successfully!")
            
        except Exception as e:
            logger.error(f"❌ Error loading models: {str(e)}")
            raise

# Global model loader
model_loader = LightweightModelLoader()

def initialize_models():
    """Initialize lightweight models at startup"""
    model_loader.load_models()

@lru_cache(maxsize=1)
def get_movie_features():
    """Cache movie features for better performance"""
    logger.info("🔄 Computing movie features...")
    movie_texts = model_loader.movies_df['title'] + " " + model_loader.movies_df['genres']
    features = model_loader.tfidf_vectorizer.transform(movie_texts)
    logger.info("✅ Movie features computed and cached")
    return features

def get_recommendations(genres: list, favorites: list, top_n: int = 5):
    """Get movie recommendations using real-time similarity computation"""
    try:
        logger.info(f"🎬 Getting recommendations for {len(genres)} genres, {len(favorites)} favorites")
        
        # Validate input
        if not genres and not favorites:
            raise ValueError("At least one genre or favorite movie is required")
        
        # Create user profile text
        user_text = f"{' '.join(genres)} {' '.join(favorites)}".lower()
        logger.info(f"🔍 User profile: {user_text}")
        
        # Transform user input to TF-IDF vector
        user_vector = model_loader.tfidf_vectorizer.transform([user_text])
        
        # Get cached movie features
        movie_features = get_movie_features()
        
        # Compute similarities in real-time (this is the magic!)
        logger.info("🧮 Computing similarities in real-time...")
        similarities = cosine_similarity(user_vector, movie_features)[0]
        
        # Get top recommendations
        top_indices = similarities.argsort()[::-1][:top_n]
        
        recommendations = []
        for idx in top_indices:
            movie_data = model_loader.movies_df.iloc[idx]
            recommendations.append({
                "movieId": int(movie_data["movieId"]),
                "title": movie_data["title"],
                "genres": movie_data["genres"],
                "similarity": float(similarities[idx])
            })
        
        logger.info(f"✅ Generated {len(recommendations)} recommendations")
        return recommendations
        
    except Exception as e:
        logger.error(f"❌ Error in get_recommendations: {str(e)}")
        raise

def get_model_info():
    """Get information about loaded models"""
    if model_loader.tfidf_vectorizer is None:
        return {"status": "not_loaded"}
    
    return {
        "status": "loaded",
        "total_movies": len(model_loader.movies_df),
        "vocabulary_size": len(model_loader.tfidf_vectorizer.vocabulary_),
        "model_files": [
            "tfidf_vectorizer.pkl",
            "movies_content.csv", 
            "movie_id_mappings.json"
        ],
        "total_size_mb": round(
            (os.path.getsize("models/tfidf_vectorizer.pkl") +
             os.path.getsize("models/movies_content.csv") +
             os.path.getsize("models/movie_id_mappings.json")) / (1024*1024), 2
        )
    }