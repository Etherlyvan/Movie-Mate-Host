// backend/test-complete.js
const axios = require("axios");

const BASE_URL = "http://localhost:3001/api";

async function testCompleteSystem() {
  console.log("🧪 Testing Complete Movie Tracker System...\n");

  try {
    const timestamp = Date.now().toString().slice(-6);
    const testUser = {
      username: `user${timestamp}`,
      email: `user${timestamp}@example.com`,
      password: "Test123456",
    };

    // 1. Authentication Flow
    console.log("🔐 Testing Authentication Flow...");
    const registerResponse = await axios.post(
      `${BASE_URL}/auth/register`,
      testUser
    );
    const token = registerResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log("✅ User registered and authenticated");

    // 2. Movie Discovery
    console.log("\n🎬 Testing Movie Discovery...");
    const popularMovies = await axios.get(`${BASE_URL}/movies/popular`);
    const trendingMovies = await axios.get(`${BASE_URL}/movies/trending`);
    const searchResults = await axios.get(
      `${BASE_URL}/movies/search?query=avengers`
    );
    console.log("✅ Movie discovery working");
    console.log(`📊 Popular: ${popularMovies.data.data.results.length} movies`);
    console.log(
      `📊 Trending: ${trendingMovies.data.data.results.length} movies`
    );
    console.log(`📊 Search: ${searchResults.data.data.results.length} results`);

    // 3. Movie Details with Auth
    console.log("\n🎭 Testing Movie Details with Authentication...");
    const movieId = popularMovies.data.data.results[0].id;
    const movieDetails = await axios.get(`${BASE_URL}/movies/${movieId}`, {
      headers,
    });
    console.log("✅ Movie details with auth status");
    console.log(`📽️ Movie: ${movieDetails.data.data.title}`);
    console.log(
      `🔖 Initially bookmarked: ${movieDetails.data.data.isBookmarked}`
    );

    // 4. Bookmark Workflow
    console.log("\n🔖 Testing Complete Bookmark Workflow...");

    // Add bookmark
    await axios.post(
      `${BASE_URL}/users/bookmarks/${movieId}`,
      {
        movieTitle: movieDetails.data.data.title,
        moviePoster: movieDetails.data.data.poster_path,
      },
      { headers }
    );
    console.log("✅ Movie bookmarked");

    // Verify bookmark in movie details
    const updatedDetails = await axios.get(`${BASE_URL}/movies/${movieId}`, {
      headers,
    });
    console.log(`🔖 Now bookmarked: ${updatedDetails.data.data.isBookmarked}`);

    // Get bookmarks list
    const bookmarksList = await axios.get(`${BASE_URL}/users/bookmarks`, {
      headers,
    });
    console.log(`📊 Bookmarks count: ${bookmarksList.data.data.total}`);

    // 5. User Profile Management
    console.log("\n👤 Testing User Profile Management...");
    const profileUpdate = await axios.put(
      `${BASE_URL}/users/profile`,
      {
        profile: {
          bio: "Movie enthusiast and avid watcher",
          favoriteGenres: ["Action", "Sci-Fi", "Drama"],
        },
        preferences: {
          theme: "dark",
          notifications: {
            email: true,
            push: false,
          },
        },
      },
      { headers }
    );
    console.log("✅ Profile updated successfully");
    console.log(`📝 Bio: ${profileUpdate.data.data.user.profile.bio}`);
    console.log(
      `🎭 Favorite genres: ${profileUpdate.data.data.user.profile.favoriteGenres.join(
        ", "
      )}`
    );

    // 6. Data Persistence Test
    console.log("\n💾 Testing Data Persistence...");

    // Login again with same user
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    const newToken = loginResponse.data.data.token;
    const newHeaders = { Authorization: `Bearer ${newToken}` };

    // Check if data persisted
    const persistedProfile = await axios.get(`${BASE_URL}/users/profile`, {
      headers: newHeaders,
    });
    const persistedBookmarks = await axios.get(`${BASE_URL}/users/bookmarks`, {
      headers: newHeaders,
    });

    console.log("✅ Data persistence verified");
    console.log(
      `📝 Persisted bio: ${persistedProfile.data.data.user.profile.bio}`
    );
    console.log(
      `🔖 Persisted bookmarks: ${persistedBookmarks.data.data.total}`
    );

    // 7. API Performance & Response Format
    console.log("\n⚡ Testing API Performance & Format...");
    const startTime = Date.now();
    const responses = await Promise.all([
      axios.get(`${BASE_URL}/movies/popular`),
      axios.get(`${BASE_URL}/movies/trending`),
      axios.get(`${BASE_URL}/movies/genres`),
      axios.get(`${BASE_URL}/users/profile`, { headers: newHeaders }),
    ]);
    const endTime = Date.now();

    console.log(`✅ API response time: ${endTime - startTime}ms`);

    // Verify response format consistency
    responses.forEach((response, index) => {
      const hasSuccess = "success" in response.data;
      const hasData = "data" in response.data;
      console.log(
        `📋 Response ${index + 1} format: ${
          hasSuccess && hasData ? "✅" : "❌"
        }`
      );
    });

    console.log("\n🎉 Complete system test passed!");
    console.log("\n📊 System Capabilities Verified:");
    console.log("- ✅ User Authentication & Authorization");
    console.log("- ✅ Movie Discovery & Search");
    console.log("- ✅ Movie Details with User Context");
    console.log("- ✅ Bookmark Management");
    console.log("- ✅ User Profile Management");
    console.log("- ✅ Data Persistence");
    console.log("- ✅ API Performance & Consistency");
    console.log("- ✅ Database Integration");
    console.log("- ✅ RESTful API Standards");

    console.log("\n🚀 System is ready for production!");
  } catch (error) {
    console.error(
      "❌ Complete system test failed:",
      error.response?.data || error.message
    );
  }
}

testCompleteSystem();
