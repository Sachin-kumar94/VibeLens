const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  theme: { type: String, default: 'dark', enum: ['dark', 'light'] },
  createdAt: { type: Date, default: Date.now }
});

const AnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  timestamp: { type: Date, default: Date.now },
  primaryEmotion: { type: String, required: true },
  confidenceScore: { type: Number, required: true },
  emotions: {
    Happy: Number,
    Neutral: Number,
    Sad: Number,
    Angry: Number,
    Fear: Number,
    Surprise: Number,
    Disgust: Number
  },
  facesDetectedCount: { type: Number, default: 0 },
  sceneType: { type: String, required: true },
  sceneConfidence: { type: Number, required: true },
  objectsDetected: [String],
  colorTone: { type: String, required: true },
  colors: [String],
  colorInterpretation: String,
  overallVibe: { type: String, required: true },
  vibeConfidence: { type: Number, default: 0.90 },
  captions: [{
    style: String,
    text: String
  }],
  hashtags: [String],
  musicRecommendations: [{
    title: String,
    artist: String,
    genre: String,
    vibe: String
  }]
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Analysis: mongoose.model('Analysis', AnalysisSchema)
};
