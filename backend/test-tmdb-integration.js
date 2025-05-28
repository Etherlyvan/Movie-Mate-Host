const axios = require("axios");

const BASE_URL = "http://localhost:3001/api";

async function testTMDBIntegration() {
  console.log("🧪 Testing TMDB Integration...\n");

  try {
    // Test 1: Popular movies
    console.log("1. Testing popular movies...");
    const popular = await axios.get(`${BASE_URL}/movies/popular`);
    console.log(`✅ Popular: ${popular.data.data.results.length} movies`);
    console.log(`📽️ First movie: ${popular.data.data.results[0].title}`);
    console.log(`🖼️ Poster URL: ${popular.data.data.results[0].poster_url}`);

    // Test 2: Search movies
    console.log("\n2. Testing movie search...");
    const search = await axios.get(`${BASE_URL}/movies/search?query=avengers`);
    console.log(
      `✅ Search: ${search.data.data.results.length} results for "avengers"`
    );
    console.log(`📽️ First result: ${search.data.data.results[0].title}`);

    // Test 3: Movie details
    console.log("\n3. Testing movie details...");
    const movieId = popular.data.data.results[0].id;
    const details = await axios.get(`${BASE_URL}/movies/${movieId}`);
    console.log(`✅ Details: ${details.data.data.title}`);
    console.log(`⭐ Rating: ${details.data.data.vote_average}`);
    console.log(
      `🎭 Genres: ${details.data.data.genres.map((g) => g.name).join(", ")}`
    );

    // Test 4: Genres
    console.log("\n4. Testing genres...");
    const genres = await axios.get(`${BASE_URL}/movies/genres`);
    console.log(`✅ Genres: ${genres.data.data.genres.length} available`);
    console.log(
      `🎭 Some genres: ${genres.data.data.genres
        .slice(0, 5)
        .map((g) => g.name)
        .join(", ")}`
    );

    // Test 5: Trending movies
    console.log("\n5. Testing trending movies...");
    const trending = await axios.get(`${BASE_URL}/movies/trending`);
    console.log(`✅ Trending: ${trending.data.data.results.length} movies`);
    console.log(`🔥 Top trending: ${trending.data.data.results[0].title}`);

    // Test 6: Top rated movies
    console.log("\n6. Testing top rated movies...");
    const topRated = await axios.get(`${BASE_URL}/movies/top-rated`);
    console.log(`✅ Top Rated: ${topRated.data.data.results.length} movies`);
    console.log(`🏆 Highest rated: ${topRated.data.data.results[0].title}`);

    console.log("\n🎉 All TMDB integration tests passed!");
    console.log("\n📊 Summary:");
    console.log(`- Popular movies: ✅`);
    console.log(`- Search functionality: ✅`);
    console.log(`- Movie details: ✅`);
    console.log(`- Genres: ✅`);
    console.log(`- Trending movies: ✅`);
    console.log(`- Top rated movies: ✅`);
    console.log(`- Image URLs: ✅`);
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);

    if (error.response?.status === 500) {
      console.log("\n🔍 Possible issues:");
      console.log("- Check if TMDB_API_KEY is set in .env");
      console.log("- Verify TMDB API key is valid");
      console.log("- Check internet connection");
    }
  }
}

// Make sure server is running first
testTMDBIntegration();
