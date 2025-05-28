const axios = require("axios");
require("dotenv").config();

const TMDB_API_KEY = "787d40502474165790b561a9747dccd9"; // Ganti dengan API key Anda
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function testTMDBAPI() {
  try {
    console.log("🧪 Testing TMDB API...");

    // Test 1: Get popular movies
    const popularResponse = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        page: 1,
      },
    });

    console.log(
      "✅ Popular movies test:",
      popularResponse.data.results.length,
      "movies found"
    );
    console.log("📽️ First movie:", popularResponse.data.results[0].title);

    // Test 2: Search movie
    const searchResponse = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: "Avengers",
      },
    });

    console.log(
      "✅ Search test:",
      searchResponse.data.results.length,
      'results for "Avengers"'
    );

    // Test 3: Get movie details
    const movieId = popularResponse.data.results[0].id;
    const detailResponse = await axios.get(
      `${TMDB_BASE_URL}/movie/${movieId}`,
      {
        params: {
          api_key: TMDB_API_KEY,
          append_to_response: "credits,videos",
        },
      }
    );

    console.log("✅ Movie details test:", detailResponse.data.title);
    console.log(
      "🎭 Genres:",
      detailResponse.data.genres.map((g) => g.name).join(", ")
    );

    console.log("\n🎉 All TMDB API tests passed!");
  } catch (error) {
    console.error("❌ TMDB API Error:", error.response?.data || error.message);
  }
}

testTMDBAPI();
