# VibeLens REST API Specification

This document contains descriptions, payload criteria, and response bodies for all primary REST endpoints in the VibeLens platform.

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user profile.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Sachin Arya",
    "email": "sachin224466arya@gmail.com",
    "password": "secure_password_123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "user-9x8f7",
      "name": "Sachin Arya",
      "email": "sachin224466arya@gmail.com",
      "theme": "dark",
      "createdAt": "2026-07-10T09:44:44.000Z"
    }
  }
  ```

### `POST /api/auth/login`
Authenticates a user session.

- **Request Body**:
  ```json
  {
    "email": "sachin224466arya@gmail.com",
    "password": "secure_password_123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "user-9x8f7",
      "name": "Sachin Arya",
      "email": "sachin224466arya@gmail.com",
      "theme": "dark",
      "createdAt": "2026-07-10T09:44:44.000Z"
    }
  }
  ```

---

## 2. AI & Image Analysis Endpoints

### `POST /api/analyze/image`
Submits a base64 image bitmap to the Gemini multimodal vision pipeline to generate psychological emotion diagnostics.

- **Request Body**:
  ```json
  {
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "language": "English"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "result": {
      "id": "analysis-m3k8s",
      "timestamp": "2026-07-10T09:44:44.000Z",
      "primaryEmotion": "Happy",
      "confidenceScore": 0.95,
      "emotions": {
        "Happy": 0.95,
        "Neutral": 0.03,
        "Sad": 0.01,
        "Angry": 0.01
      },
      "facesDetectedCount": 1,
      "sceneType": "Beach",
      "sceneConfidence": 0.92,
      "objectsDetected": ["surfboard", "ocean waves", "sun hat"],
      "colorTone": "Warm Tone",
      "colors": ["#f39c12", "#3498db"],
      "colorInterpretation": "Bright oceanic blues paired with hot sand golds reflect summery vibes.",
      "overallVibe": "Energetic",
      "vibeConfidence": 0.94,
      "captions": [
        { "style": "Instagram", "text": "Ocean air, salty hair, and endless golden vibes. 🌊✨" }
      ],
      "hashtags": ["beachvibe", "summermood"],
      "musicRecommendations": [
        { "title": "Sunset Lover", "artist": "Petit Biscuit", "genre": "Electronic", "vibe": "Aesthetic" }
      ]
    }
  }
  ```

---

## 3. History & Diagnostics Endpoints

### `GET /api/history`
Returns all past analysis records.

- **Response (200 OK)**:
  ```json
  {
    "history": [
      {
        "id": "analysis-m3k8s",
        "primaryEmotion": "Happy",
        "overallVibe": "Energetic"
      }
    ]
  }
  ```

### `DELETE /api/history/:id`
Deletes a specific history record from the local JSON database archive.

- **Response (200 OK)**:
  ```json
  {
    "success": true
  }
  ```
