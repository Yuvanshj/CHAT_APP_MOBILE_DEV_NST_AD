# Chat App — Mobile Development (NST AD)

A complete, production-grade mobile chat application built with **React Native (JavaScript)**, **Expo SDK 58**, and **React Navigation 7**, adapted and enhanced from the reference repository architecture.

---

## 📱 Features

1. **User Discovery & Profile Inspection**:
   - Live registered user listing (`GET /user`).
   - Real-time search by username, bio, and email.
   - User profile resolution (`GET /user/profile?user_id={userId}`).
   - Multi-user selection and deselection chips.

2. **Conversation Management**:
   - Direct Messages (DM) with individual users.
   - Group chats with custom conversation naming and multi-participant selection.
   - Real-time conversation list with creator attribution and member counts (`GET /conversation`, `POST /conversation`).
   - Pull-to-refresh and empty/loading states.

3. **Rich Messaging Interface**:
   - Message history with timestamps, sender tags, and ownership alignment (`GET /message?conversation_id={id}`).
   - Right-aligned bubbles for own messages, left-aligned bubbles with participant avatars for incoming messages.
   - Real-time polling with lifecycle awareness (pauses automatically when screen is blurred/unmounted).
   - Optimistic message sending with delivery status indicators (`sending`, `sent`, `error`).
   - Conversation details modal with full participant roster and creator tags.

4. **Image & Media Sharing**:
   - Gallery picker (`expo-image-picker`) with cropping, aspect ratio control, and image metadata.
   - In-chat attachment sheet (`AttachmentMenu`) to stage and send photos.
   - Image message rendering with automatic base64 / data-URI / URL normalization.
   - Full-screen lightbox preview (`ImagePreviewModal`).

5. **Dual Camera Experiences**:
   - **Native Camera (`CameraScreen`)**: Launches system camera UI for quick, high-resolution photo capture with retake and direct chat sharing.
   - **Custom Camera (`RawCameraScreen`)**: Live custom viewfinder built with `expo-camera` (`CameraView`), featuring front/back camera flipping, custom shutter controls, preview overlays, and hardware lifecycle management.

6. **Configurable Backend & Security**:
   - Zero hardcoded local IPs or credentials.
   - Environment variable support (`EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_API_AUTH_TOKEN`).
   - Runtime **Backend Settings Modal** accessible directly in the app to test server connectivity and switch endpoints on the fly (Localhost, Android emulator `10.0.2.2`, or physical device LAN IP).

---

## 🏗️ Project Architecture

```
src/
  features/
    chat/
      components/
        AttachmentMenu.js        # Action sheet for image attachment options
        ConversationCard.js      # Conversation list item card with badges
        ImagePreviewModal.js     # Full-screen photo lightbox viewer
        MessageBubble.js         # Message bubble with text & image attachment
        MessageInput.js          # Multiline message composer with attachment preview
        ParticipantAvatar.js     # Dynamic color avatar with initials
        ServerConfigModal.js     # Live runtime backend URL & auth configuration
        UserCard.js              # Selectable user card with checkbox
      constants/
        chatConstants.js         # Defaults, timeouts, and polling intervals
        theme.js                 # Design tokens (colors, spacing, radius, fonts)
      context/
        AuthContext.js           # App-wide authentication & API configuration state
      hooks/
        useConversations.js      # Conversation list & creator resolution hook
        useMessages.js           # Message history, sending, & polling hook
        useUsers.js              # User discovery, selection, & conversation creation
      navigation/
        ChatStackNavigator.js    # Stack: ConversationList -> ChatScreen
        RootNavigator.js         # Bottom tabs: Chats, Users, Gallery, Camera, Live View
      services/
        apiClient.js             # Centralized HTTP fetch client with error normalization
        chatApi.js               # Conversation and messaging endpoints
        userApi.js               # User list and profile endpoints
      types/
        chat.js                  # Conversation & Message schemas
        navigation.js            # Route name constants
        user.js                  # User model constants
      utils/
        dateHelpers.js           # Timestamps and relative time formatting
        imageHelpers.js          # Base64 and image URI normalization
        messageHelpers.js        # Robust API payload normalizers
screens/                         # Backwards-compatible re-exports for reference project
  AllUsers.jsx
  CameraScreen.jsx
  ChatScreen.jsx
  ConversationScreen.jsx
  ImagePicker.jsx
  RawCameraScreen.jsx
  Stack.jsx
App.js                           # Application root entry point
index.js                         # Expo root registration
server.js                        # Built-in mock API server for local testing
```

---

## 🔌 API Endpoints Integrated

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/user` | Fetch registered users |
| `GET` | `/user/profile?user_id={id}` | Fetch user profile (name, bio, avatar) |
| `GET` | `/conversation` | Fetch all conversations |
| `POST` | `/conversation` | Create conversation (`{ type, name, participants_ids }`) |
| `GET` | `/message?conversation_id={id}` | Fetch message history for a conversation |
| `POST` | `/message` | Send text or image message (`{ conversation_id, content?, imageInfo? }`) |

---

## ⚙️ Configuration & Environment

Create a `.env` file in the root directory (or use `.env.example` as a template):

```bash
# Web or iOS Simulator:
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# Android Emulator (Android maps host localhost to 10.0.2.2):
# EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000

# Physical Device (replace with your development computer's LAN IP):
# EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3000

# Auth credentials header (e.g., Basic Auth or Bearer token):
EXPO_PUBLIC_API_AUTH_TOKEN=Basic first:second
```

> **Tip**: You can also change the API URL and test server connectivity at any time inside the app by tapping the ⚙️ icon in the top header of the **Conversations** tab!

---

## 🚀 Running the Application

### 1. Install dependencies
```bash
npm install
```

### 2. Start the backend server (Terminal 1)
```bash
npm run server
```

### 3. Start the Expo app (Terminal 2)
```bash
npm start
```

### 4. Target platforms:
- **iOS Simulator**: Press `i` in the Expo terminal (macOS with Xcode).
- **Android Emulator**: Press `a` in the Expo terminal (Android Studio).
- **Web Browser**: Press `w` in the Expo terminal.
- **Physical Device**: Scan the QR code using the **Expo Go** app on iOS or Android.

---

## 🧪 Testing & Verification

Run the automated test suite:

```bash
npm test
```
