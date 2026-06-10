# CurrHub — GenAI Curriculum Generator & Study Companion

CurrHub is a full-stack React web application that uses artificial intelligence to generate comprehensive, semester-wise educational curricula for college faculty and personalized study companion roadmaps for students.

It is powered by Vite, React, Tailwind CSS, Firebase (Auth + Firestore), and the Groq API (using the LLaMA 3.3 70B model).

---

## Technical Specifications

### Required Node.js Version
- **Node.js**: `v18.0.0` or higher (Recommended: `v20.x` or latest LTS).
- **npm**: `v9.x` or higher.

---

## Installation & Setup

### 1. Clone & Install Dependencies
Navigate to the root directory and install dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to create a `.env` file:
```bash
cp .env.example .env
```
Open the `.env` file and replace the placeholders with your Firebase credentials and Groq API key:
```env
# Firebase Configurations
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Groq API Configuration
# Get your API key from https://console.groq.com/
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
```

---

## Services Configuration

### 1. Firebase Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and create a project named `CurrHub`.
3. In the left panel, navigate to **Build** -> **Authentication**, click **Get Started**, and enable the **Email/Password** sign-in provider.
4. Navigate to **Build** -> **Firestore Database** and click **Create Database**. Start in **Test Mode** (or Production Mode with the rules below).
5. Register a Web App in the Project Overview dashboard to retrieve the config keys and paste them into `.env`.

#### Recommended Cloud Firestore Security Rules
To secure user directories, restrict curriculum listings to organizations, and ensure data integrity, publish the following rules in your Firestore rules console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: Checks if the user is authenticated
    function isAuth() {
      return request.auth != null;
    }

    // Helper: Gets the current user profile from users collection
    function getUserProfile() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    // Rules for users collection
    match /users/{userId} {
      allow read, write: if isAuth();
    }

    // Rules for curricula collection
    match /curricula/{curriculumId} {
      allow read: if isAuth() && getUserProfile().college == resource.data.college;
      allow create: if isAuth() && getUserProfile().role == 'Faculty';
      allow update, delete: if isAuth() && request.auth.uid == resource.data.publishedBy;
    }

    // Rules for comments collection
    match /comments/{commentId} {
      allow read: if isAuth() && getUserProfile().college == resource.data.college;
      allow create: if isAuth() && getUserProfile().college == request.resource.data.college;
      allow delete: if isAuth() && request.auth.uid == resource.data.studentUid;
    }

    // Rules for generationHistory collection
    match /generationHistory/{historyId} {
      allow read: if isAuth() && request.auth.uid == resource.data.facultyUid;
      allow create: if isAuth() && getUserProfile().role == 'Faculty';
    }

    // Rules for sageHistory collection
    match /sageHistory/{historyId} {
      allow read, write: if isAuth() && request.auth.uid == resource.data.studentUid;
    }

    // Rules for viewHistory collection
    match /viewHistory/{historyId} {
      allow read: if isAuth() && request.auth.uid == resource.data.studentUid;
      allow create: if isAuth();
    }
  }
}
```

### 2. Groq LLaMA 3.3 Setup
1. Go to the [Groq Console](https://console.groq.com/).
2. Create an account and navigate to **API Keys** section.
3. Generate a new API Key and add it to the `.env` file as `VITE_GROQ_API_KEY`.
4. The application uses the `llama-3.3-70b-versatile` model.

---

## Running Locally

To run the development server:
```bash
npm run dev
```

The application will launch on your local host (usually `http://localhost:5173/`).

To compile and build the production bundle:
```bash
npm run build
```
The optimized bundle will be created inside the `dist/` directory.
