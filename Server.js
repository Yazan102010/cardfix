// Import necessary packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config(); // Load environment variables

// Declare the 'app' object
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());  // Ensure JSON parsing is enabled for POST requests

const PORT = process.env.PORT || 4000;

// Connect to MongoDB using environment variable for URI
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

// Define the Profile Schema
const profileSchema = new mongoose.Schema({
    name: String,
    jobTitle: String,
    profileImage: String,
    headerImage: String,
    phone: String,   // Add phone field
    email: String,   // Add email field
    socialLinks: {
        website: String,  // Add website link
        instagram: String,
        facebook: String,
        telegram: String,
        tiktok: String,
        youtube: String,
        whatsapp: String,
        maps: String,
        snapchat: String,
    },
});

const Profile = mongoose.model("Profile", profileSchema);

// Routes

// Create a new profile
app.post("/api/save-profile", async (req, res) => {
    const { name, jobTitle, profileImage, headerImage, phone, email, socialLinks } = req.body;

    // Generate a profile key based on the name (slug format)
    const profileKey = name.toLowerCase().replace(/\s+/g, '-'); // Convert spaces to hyphens

    const newProfile = new Profile({
        name,
        jobTitle,
        profileImage,
        headerImage,
        phone,
        email,
        socialLinks,
    });

    try {
        const savedProfile = await newProfile.save();
        res.status(201).json({ profileKey, message: 'Profile saved successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all profiles
app.get("/", async (req, res) => {
    try {
        const profiles = await Profile.find();
        res.status(200).json(profiles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a profile by unique name (profileKey)
// Route to fetch a profile by profileKey
app.get("/:profileKey", async (req, res) => {
    const profileKey = req.params.profileKey;
    try {
        const profile = await Profile.findOne({ name: profileKey });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", error });
    }
});

// Delete a profile by name
app.delete("/api/profiles/:profileKey", async (req, res) => {
    const { profileKey } = req.params;

    try {
        const profile = await Profile.findOneAndDelete({
            name: new RegExp(`^${profileKey.replace('-', ' ')}$`, 'i')
        });

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.status(200).json({ message: "Profile deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a profile by profileName (fetching from database now)
app.get('/profile/:profileName', async (req, res) => {
    const { profileName } = req.params;

    try {
        // Fetch profile data from the database based on profileName
        const profile = await Profile.findOne({ name: new RegExp(`^${profileName.replace('-', ' ')}$`, 'i') });

        if (profile) {
            res.json(profile);  // Return the profile data as JSON
        } else {
            res.status(404).json({ message: 'Profile not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Update an existing profile by name (or profile key)
// Update profile by profile key
app.put("/api/update-profile/:profileKey", async (req, res) => {
    const profileKey = req.params.profileKey;
    const { name, jobTitle, profileImage, headerImage, phone, email, socialLinks } = req.body;

    try {
        const updatedProfile = await Profile.findOneAndUpdate(
            { name: new RegExp(`^${profileKey}$`, "i") },
            { name, jobTitle, profileImage, headerImage, phone, email, socialLinks },
            { new: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
