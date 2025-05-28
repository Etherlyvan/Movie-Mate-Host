const axios = require("axios");

const BASE_URL = "http://localhost:3001/api";

async function testAuth() {
  console.log("🧪 Testing Authentication System...\n");

  try {
    // Test data dengan username yang lebih pendek
    const timestamp = Date.now().toString().slice(-6); // Ambil 6 digit terakhir
    const testUser = {
      username: `test${timestamp}`, // Maksimal 10 karakter
      email: `test${timestamp}@example.com`,
      password: "Test123456",
    };

    console.log("📝 Test user data:", {
      username: testUser.username,
      email: testUser.email,
      password: "***hidden***",
    });

    // Test 1: Register
    console.log("\n1. Testing user registration...");
    const registerResponse = await axios.post(
      `${BASE_URL}/auth/register`,
      testUser
    );
    console.log("✅ Registration successful");
    console.log("👤 User:", registerResponse.data.data.user.username);
    console.log("📧 Email:", registerResponse.data.data.user.email);
    console.log("🔑 Token received:", !!registerResponse.data.data.token);

    const token = registerResponse.data.data.token;

    // Test 2: Get current user
    console.log("\n2. Testing get current user...");
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Get user successful");
    console.log("👤 User ID:", meResponse.data.data.user._id);
    console.log("👤 Username:", meResponse.data.data.user.username);

    // Test 3: Login
    console.log("\n3. Testing user login...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    console.log("✅ Login successful");
    console.log("🔑 New token received:", !!loginResponse.data.data.token);
    console.log("⏰ Last login:", loginResponse.data.data.user.lastLogin);

    // Test 4: Protected route
    console.log("\n4. Testing protected route...");
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Protected route access successful");
    console.log(
      "👤 Profile username:",
      profileResponse.data.data.user.username
    );

    // Test 5: Update profile
    console.log("\n5. Testing profile update...");
    const updateData = {
      profile: {
        bio: "Test user bio",
        favoriteGenres: ["Action", "Comedy"],
      },
    };
    const updateResponse = await axios.put(
      `${BASE_URL}/users/profile`,
      updateData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("✅ Profile update successful");
    console.log("📝 Bio:", updateResponse.data.data.user.profile.bio);

    // Test 6: Invalid credentials
    console.log("\n6. Testing invalid credentials...");
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: "wrongpassword",
      });
      console.log("❌ Should have failed with wrong password");
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("✅ Correctly rejected invalid credentials");
      } else {
        throw error;
      }
    }

    // Test 7: Unauthorized access
    console.log("\n7. Testing unauthorized access...");
    try {
      await axios.get(`${BASE_URL}/users/profile`);
      console.log("❌ Should have failed without token");
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("✅ Correctly rejected unauthorized access");
      } else {
        throw error;
      }
    }

    // Test 8: Invalid token
    console.log("\n8. Testing invalid token...");
    try {
      await axios.get(`${BASE_URL}/users/profile`, {
        headers: { Authorization: "Bearer invalid-token" },
      });
      console.log("❌ Should have failed with invalid token");
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("✅ Correctly rejected invalid token");
      } else {
        throw error;
      }
    }

    // Test 9: Refresh token
    console.log("\n9. Testing token refresh...");
    const refreshResponse = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("✅ Token refresh successful");
    console.log("🔑 New token received:", !!refreshResponse.data.data.token);

    // Test 10: Logout
    console.log("\n10. Testing logout...");
    const logoutResponse = await axios.post(
      `${BASE_URL}/auth/logout`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("✅ Logout successful");

    console.log("\n🎉 All authentication tests passed!");
    console.log("\n📊 Summary:");
    console.log("- User registration: ✅");
    console.log("- Get current user: ✅");
    console.log("- User login: ✅");
    console.log("- Protected routes: ✅");
    console.log("- Profile update: ✅");
    console.log("- Invalid credentials handling: ✅");
    console.log("- Unauthorized access prevention: ✅");
    console.log("- Invalid token handling: ✅");
    console.log("- Token refresh: ✅");
    console.log("- User logout: ✅");
  } catch (error) {
    console.error(
      "❌ Auth test failed:",
      error.response?.data || error.message
    );

    if (error.response?.status === 500) {
      console.log("\n🔍 Possible issues:");
      console.log("- Check if server is running");
      console.log("- Verify database connection");
      console.log("- Check if JWT_SECRET is set in .env");
      console.log("- Check server logs for detailed errors");
    }

    if (error.response?.status === 400) {
      console.log("\n🔍 Validation issues:");
      console.log("- Check username length (3-20 characters)");
      console.log("- Check email format");
      console.log("- Check password requirements");
    }
  }
}

// Make sure server is running first
testAuth();
