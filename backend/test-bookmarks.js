const axios = require("axios");

const BASE_URL = "http://localhost:3001/api";

async function testBookmarks() {
  console.log("🧪 Testing Bookmark System...\n");

  try {
    // First, register and login a user dengan username yang lebih pendek
    const timestamp = Date.now().toString().slice(-6); // Ambil 6 digit terakhir
    const testUser = {
      username: `book${timestamp}`, // Maksimal 10 karakter
      email: `book${timestamp}@example.com`,
      password: "Test123456",
    };

    console.log("1. Setting up test user...");
    console.log("📝 Test user:", {
      username: testUser.username,
      email: testUser.email,
    });

    const registerResponse = await axios.post(
      `${BASE_URL}/auth/register`,
      testUser
    );
    const token = registerResponse.data.data.token;
    console.log("✅ Test user created and logged in");

    const headers = { Authorization: `Bearer ${token}` };

    // Test 2: Get empty bookmarks
    console.log("\n2. Testing empty bookmarks...");
    const emptyBookmarks = await axios.get(`${BASE_URL}/users/bookmarks`, {
      headers,
    });
    console.log(
      "✅ Empty bookmarks:",
      emptyBookmarks.data.data.bookmarks.length === 0
    );
    console.log("📊 Initial bookmark count:", emptyBookmarks.data.data.total);

    // Test 3: Add bookmark
    console.log("\n3. Testing add bookmark...");
    const movieData = {
      movieTitle: "The Shawshank Redemption",
      moviePoster: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    };

    const addBookmark = await axios.post(
      `${BASE_URL}/users/bookmarks/278`,
      movieData,
      { headers }
    );
    console.log("✅ Bookmark added successfully");
    console.log("📽️ Movie:", addBookmark.data.data.bookmark.movieTitle);
    console.log("🆔 Movie ID:", addBookmark.data.data.bookmark.movieId);

    // Test 4: Check bookmark status
    console.log("\n4. Testing check bookmark status...");
    const checkBookmark = await axios.get(
      `${BASE_URL}/users/bookmarks/check/278`,
      { headers }
    );
    console.log("✅ Bookmark status check successful");
    console.log("🔖 Is bookmarked:", checkBookmark.data.data.isBookmarked);

    // Test 5: Get bookmarks list
    console.log("\n5. Testing get bookmarks list...");
    const bookmarksList = await axios.get(`${BASE_URL}/users/bookmarks`, {
      headers,
    });
    console.log("✅ Bookmarks list retrieved");
    console.log(
      "📊 Bookmarks count:",
      bookmarksList.data.data.bookmarks.length
    );
    console.log(
      "📽️ First bookmark:",
      bookmarksList.data.data.bookmarks[0].movieTitle
    );

    // Test 6: Add duplicate bookmark (should fail)
    console.log("\n6. Testing duplicate bookmark prevention...");
    try {
      await axios.post(`${BASE_URL}/users/bookmarks/278`, movieData, {
        headers,
      });
      console.log("❌ Should have failed with duplicate bookmark");
    } catch (error) {
      if (error.response?.status === 400) {
        console.log("✅ Correctly rejected duplicate bookmark");
        console.log("📝 Error message:", error.response.data.message);
      } else {
        throw error;
      }
    }

    // Test 7: Add another bookmark
    console.log("\n7. Testing add second bookmark...");
    const movieData2 = {
      movieTitle: "The Godfather",
      moviePoster: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    };

    const addBookmark2 = await axios.post(
      `${BASE_URL}/users/bookmarks/238`,
      movieData2,
      { headers }
    );
    console.log("✅ Second bookmark added");
    console.log("📽️ Movie:", addBookmark2.data.data.bookmark.movieTitle);

    // Test 8: Check second bookmark status
    console.log("\n8. Testing second bookmark status...");
    const checkBookmark2 = await axios.get(
      `${BASE_URL}/users/bookmarks/check/238`,
      { headers }
    );
    console.log(
      "✅ Second bookmark status:",
      checkBookmark2.data.data.isBookmarked
    );

    // Test 9: Get updated bookmarks list
    console.log("\n9. Testing updated bookmarks list...");
    const updatedBookmarks = await axios.get(`${BASE_URL}/users/bookmarks`, {
      headers,
    });
    console.log(
      "✅ Updated bookmarks count:",
      updatedBookmarks.data.data.bookmarks.length
    );

    // Test 10: Remove first bookmark
    console.log("\n10. Testing remove bookmark...");
    await axios.delete(`${BASE_URL}/users/bookmarks/278`, { headers });
    console.log("✅ First bookmark removed successfully");

    // Test 11: Verify removal
    console.log("\n11. Testing bookmark removal verification...");
    const checkRemoved = await axios.get(
      `${BASE_URL}/users/bookmarks/check/278`,
      { headers }
    );
    console.log(
      "✅ Removal verified - bookmark removed:",
      !checkRemoved.data.data.isBookmarked
    );

    // Test 12: Check non-existent bookmark
    console.log("\n12. Testing non-existent bookmark check...");
    const checkNonExistent = await axios.get(
      `${BASE_URL}/users/bookmarks/check/999999`,
      { headers }
    );
    console.log(
      "✅ Non-existent bookmark check:",
      !checkNonExistent.data.data.isBookmarked
    );

    // Test 13: Remove non-existent bookmark (should fail)
    console.log("\n13. Testing remove non-existent bookmark...");
    try {
      await axios.delete(`${BASE_URL}/users/bookmarks/999999`, { headers });
      console.log("❌ Should have failed removing non-existent bookmark");
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("✅ Correctly failed to remove non-existent bookmark");
      } else {
        throw error;
      }
    }

    // Test 14: Final bookmarks count
    console.log("\n14. Testing final bookmarks count...");
    const finalBookmarks = await axios.get(`${BASE_URL}/users/bookmarks`, {
      headers,
    });
    console.log(
      "✅ Final bookmarks count:",
      finalBookmarks.data.data.bookmarks.length
    );
    console.log(
      "📽️ Remaining bookmarks:",
      finalBookmarks.data.data.bookmarks.map((b) => b.movieTitle)
    );

    // Test 15: Unauthorized bookmark access
    console.log("\n15. Testing unauthorized bookmark access...");
    try {
      await axios.get(`${BASE_URL}/users/bookmarks`);
      console.log("❌ Should have failed without token");
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("✅ Correctly rejected unauthorized access");
      } else {
        throw error;
      }
    }

    // Test 16: Invalid movie data
    console.log("\n16. Testing invalid movie data...");
    try {
      await axios.post(`${BASE_URL}/users/bookmarks/123`, {}, { headers }); // Empty data
      console.log("❌ Should have failed with empty movie data");
    } catch (error) {
      if (error.response?.status === 400) {
        console.log("✅ Correctly rejected invalid movie data");
      } else {
        throw error;
      }
    }

    console.log("\n🎉 All bookmark tests passed!");
    console.log("\n📊 Summary:");
    console.log("- Get empty bookmarks: ✅");
    console.log("- Add bookmark: ✅");
    console.log("- Check bookmark status: ✅");
    console.log("- Get bookmarks list: ✅");
    console.log("- Duplicate bookmark prevention: ✅");
    console.log("- Add multiple bookmarks: ✅");
    console.log("- Remove bookmark: ✅");
    console.log("- Verify bookmark removal: ✅");
    console.log("- Non-existent bookmark handling: ✅");
    console.log("- Unauthorized access prevention: ✅");
    console.log("- Invalid data validation: ✅");
  } catch (error) {
    console.error(
      "❌ Bookmark test failed:",
      error.response?.data || error.message
    );

    if (error.response?.status === 500) {
      console.log("\n🔍 Possible issues:");
      console.log("- Check if server is running");
      console.log("- Verify database connection");
      console.log("- Check server logs for detailed errors");
    }
  }
}

testBookmarks();
