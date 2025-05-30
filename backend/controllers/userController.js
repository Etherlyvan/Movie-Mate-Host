// controllers/users.js
const User = require("../models/User");
const { uploadToCloudinary } = require("../utils/cloudinary");

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      displayName,
      bio,
      country,
      website,
      dateOfBirth,
      favoriteGenres,
      socialLinks,
      avatar,
    } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update profile fields
    const updateData = {};

    if (displayName !== undefined)
      updateData["profile.displayName"] = displayName;
    if (bio !== undefined) updateData["profile.bio"] = bio;
    if (country !== undefined) updateData["profile.country"] = country;
    if (website !== undefined) updateData["profile.website"] = website;
    if (avatar !== undefined) updateData["profile.avatar"] = avatar;
    if (dateOfBirth !== undefined)
      updateData["profile.dateOfBirth"] = dateOfBirth;
    if (favoriteGenres !== undefined)
      updateData["profile.favoriteGenres"] = favoriteGenres;
    if (socialLinks !== undefined)
      updateData["profile.socialLinks"] = socialLinks;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to cloudinary or your preferred storage
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "avatars",
      transformation: [
        { width: 400, height: 400, crop: "fill" },
        { quality: "auto" },
      ],
    });

    res.json({
      success: true,
      url: result.secure_url,
      message: "Avatar uploaded successfully",
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({
      message: "Failed to upload avatar",
      error: error.message,
    });
  }
};

module.exports = {
  updateProfile,
  uploadAvatar,
};
