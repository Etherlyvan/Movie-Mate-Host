const axios = require("axios");

const BASE_URL = "http://localhost:3001/api";

async function testAllEndpoints() {
  try {
    console.log("🧪 Testing all endpoints...\n");

    // Test 1: Health check
    console.log("1. Testing health check...");
    const health = await axios.get("http://localhost:3001/health");
    console.log("✅ Health:", health.data.status);

    // Test 2: Popular movies
    console.log("\n2. Testing popular movies...");
    const popular = await axios.get(`${BASE_URL}/movies/popular`);
    console.log(
      "✅ Popular movies:",
      popular.data.data.results.length,
      "movies"
    );

    // Test 3: Search movies
    console.log("\n3. Testing movie search...");
    const search = await axios.get(
      `${BASE_URL}/movies/search?query=spider-man`
    );
    console.log(
      "✅ Search results:",
      search.data.data.results.length,
      "movies"
    );

    // Test 4: Movie details
    console.log("\n4. Testing movie details...");
    const movieId = popular.data.data.results[0].id;
    const details = await axios.get(`${BASE_URL}/movies/${movieId}`);
    console.log("✅ Movie details:", details.data.data.title);

    // Test 5: Genres
    console.log("\n5. Testing genres...");
    const genres = await axios.get(`${BASE_URL}/movies/genres`);
    console.log("✅ Genres:", genres.data.data.genres.length, "genres");

    // Test 6: Trending movies
    console.log("\n6. Testing trending movies...");
    const trending = await axios.get(`${BASE_URL}/movies/trending`);
    console.log(
      "✅ Trending movies:",
      trending.data.data.results.length,
      "movies"
    );

    console.log("\n🎉 All integration tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Make sure server is running first
testAllEndpoints();
