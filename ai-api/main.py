# main.py - Lightweight version
import os
import logging
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
from contextlib import asynccontextmanager
import uvicorn

# Import lightweight utils
from utils import initialize_models, get_recommendations, get_model_info

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global state
models_loaded = False
start_time = time.time()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    global models_loaded
    
    logger.info("🚀 Starting Lightweight Movie Recommendation API...")
    
    try:
        # Initialize lightweight models
        logger.info("📦 Loading lightweight ML models (no 4.4GB file)...")
        initialize_models()
        models_loaded = True
        logger.info("✅ Lightweight models loaded successfully!")
        
    except Exception as e:
        logger.error(f"❌ Failed to load models: {str(e)}")
        raise
    
    yield
    
    logger.info("🛑 Shutting down application...")

# Create FastAPI app
app = FastAPI(
    title="🎬 Lightweight Movie Recommendation API",
    description="AI-powered movie recommendations (3MB models, no 4.4GB file)",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class RecommendationRequest(BaseModel):
    genres: List[str] = Field(..., min_items=1, max_items=10, 
                             description="List of preferred genres")
    favorites: List[str] = Field(..., min_items=1, max_items=20, 
                                description="List of favorite movies")
    top_n: int = Field(default=5, ge=1, le=50, 
                      description="Number of recommendations")

class MovieRecommendation(BaseModel):
    movieId: int
    title: str
    genres: str
    similarity: float

class RecommendationResponse(BaseModel):
    recommendations: List[MovieRecommendation]
    status: str
    total_results: int
    processing_time_ms: float
    model_info: dict

# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"📡 {request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
    return response

# API Routes
@app.get("/")
async def root():
    """Root endpoint with API information"""
    uptime = time.time() - start_time
    model_info = get_model_info()
    
    return {
        "message": "🎬 Lightweight Movie Recommendation API",
        "description": "Real-time similarity computation (no 4.4GB file needed)",
        "status": "running",
        "models_loaded": models_loaded,
        "version": "2.0.0",
        "uptime_seconds": round(uptime, 2),
        "model_info": model_info,
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "recommend": "/recommend",
            "model_info": "/model-info"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy" if models_loaded else "loading",
        "models_loaded": models_loaded,
        "timestamp": time.time(),
        "lightweight": True
    }

@app.get("/model-info")
async def model_info():
    """Get detailed model information"""
    return get_model_info()

@app.post("/recommend", response_model=RecommendationResponse)
async def recommend_movies(request: RecommendationRequest):
    """Get movie recommendations using real-time similarity computation"""
    
    if not models_loaded:
        raise HTTPException(
            status_code=503, 
            detail="🔄 Models are still loading. Please try again in a moment."
        )
    
    start_time = time.time()
    
    try:
        logger.info(f"📊 Processing recommendation request...")
        
        # Get recommendations using real-time computation
        recommendations = get_recommendations(
            genres=request.genres,
            favorites=request.favorites,
            top_n=request.top_n
        )
        
        processing_time = (time.time() - start_time) * 1000
        
        return RecommendationResponse(
            recommendations=recommendations,
            status="success",
            total_results=len(recommendations),
            processing_time_ms=round(processing_time, 2),
            model_info=get_model_info()
        )
        
    except Exception as e:
        logger.error(f"❌ Error processing recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"🌐 Starting lightweight server on port {port}")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )