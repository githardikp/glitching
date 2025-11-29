# GLITCHING: Tech-Noir Divination Tool

> *"The System has already spoken."*

**GLITCHING** is an experimental React Native application that reimagines the ancient Chinese divination text, the **I Ching**, through a lens of cyberpunk aesthetics and digital entropy. It replaces traditional coin tossing with digital chaos and standard readings with "Glitch Speak"—a cryptic, terminal-style interpretation of the hexagrams.

---

## 🚀 Key Features

### 1. Entropy-Based Divination
Instead of random algorithms, the app is designed to harvest entropy from the device itself (gyroscope data, battery levels, system time) to seed the generation of the hexagram, creating a unique "digital ritual."

### 2. The Glitch Ritual (Visuals)
The core interaction is a "Press & Hold" ritual. As the user maintains contact with the screen:
- **React Native Skia** renders a custom GLSL shader that distorts the reality of the UI.
- **Reanimated** drives a chaotic screen shake and intensifies the distortion parameters.
- The tension builds for 3 seconds until the "SNAP"—generating the reading.

### 3. "The System" (Persistence)
Adhering to the solemnity of daily divination, the app uses **MMKV** to enforce a "Daily Lock."
- If a user has already generated a reading for the day, the system refuses to generate a new one.
- Returning users are greeted with their persistent daily fate.

### 4. A24 / Cyberpunk Aesthetic
- **Typography**: Uses *Space Mono* for a raw, monospaced terminal look.
- **Palette**: High-contrast "Terminal Green" (`#39FF14`) and "Error Red" (`#FF0055`) on an "Almost Black" (`#080808`) void.
- **UI Components**: Custom typewriter text effects and sharp, brutalist layout primitives (no rounded corners).

---

## 🛠 Technical Architecture

The project is built with **React Native** (via Expo) and utilizes modern, high-performance libraries for graphics and state.

| Category | Technology | Purpose |
|----------|------------|---------|
| **Core** | React Native / Expo | Cross-platform mobile framework. |
| **Graphics** | @shopify/react-native-skia | High-performance 2D graphics and GLSL shader rendering. |
| **Animation** | react-native-reanimated | 120fps driver for gestures and UI animations. |
| **Gestures** | react-native-gesture-handler | Handling complex touch interactions (Long Press, Pan). |
| **Storage** | react-native-mmkv | Ultra-fast synchronous storage for persisting daily state. |
| **Typography** | expo-font | Loading custom Google Fonts (Space Mono). |
| **Sound** | expo-av | Audio playback engine for UI feedback (Placeholder). |

> **Note on State Management**: While `zustand` is installed, the current iteration leverages local component state and MMKV for persistence to maintain a lightweight footprint.

---

## 📂 Directory Structure

```text
glitching/
├── App.tsx                 # Entry point. Orchestrates Gestures, Animation, and MMKV logic.
├── src/
│   ├── components/
│   │   ├── GlitchScreen.tsx # The Skia Canvas component running the GLSL distortion shader.
│   │   └── Typewriter.tsx   # Text component simulating terminal output with typing effect.
│   ├── constants/
│   │   └── theme.ts         # Centralized design tokens (Colors, Layouts).
│   ├── data/
│   │   └── tech_noir_meanings.json # The content database: I Ching hexagrams rewritten as 'Glitch Speak'.
│   ├── hooks/
│   │   └── useEntropy.ts    # Logic for harvesting device sensor data to generate a random seed.
│   └── utils/
│       └── ichingLogic.ts   # Pure functions for Hexagram calculation (Coin method simulation).
```

---

## 🧩 Key Modules Explained

### `src/components/GlitchScreen.tsx`
This component hosts the **Skia Canvas**. It compiles a custom GLSL Runtime Effect that manipulates pixel coordinates based on a `u_distortion` uniform.
- **Input**: `distortion` (Reanimated SharedValue).
- **Output**: A procedurally generated "broken screen" visual that reacts to user touch intensity.

### `App.tsx`
The application brain. It:
1.  Initializes the **Gesture Handler** to detect the specific "hold" interaction.
2.  Manages **Reanimated** shared values (`distortion`, `shakeX`, `shakeY`) to drive the loop.
3.  Checks **MMKV** storage on mount to enforce the daily reading rule.
4.  Coordinates the transition between the "Idle," "Glitching," and "Result" states.
5.  Implements the **Daily Cache** check:
    ```typescript
    const stored = storage.getString(getTodayKey());
    if (stored) {
       // Lock the system and show previous reading
    }
    ```

### `src/hooks/useEntropy.ts`
Encapsulates the randomness logic.
- *Current State*: Uses a fallback algorithm combining battery level and high-precision timestamps.
- *Future Roadmap*: Fully integrate high-frequency gyroscope sampling for "True Randomness."

---

## 📦 Installation & Setup

**Important**: This project uses native modules (`react-native-mmkv`, `@shopify/react-native-skia`) that are **not supported** in the standard Expo Go app. You must use a **Development Build**.

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd glitching
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Install Pods (iOS only)**
    ```bash
    npx pod-install
    ```

4.  **Run the App (Development Build)**
    ```bash
    # For iOS Simulator / Device
    npx expo run:ios
    
    # For Android Emulator / Device
    npx expo run:android
    ```

### ⚠️ Troubleshooting

**"Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'NitroMmkv' could not be found"**
- **Cause**: The native code for MMKV or Skia hasn't been compiled into your app binary.
- **Fix**: 
  1. Stop the metro bundler (`Ctrl+C`).
  2. Rebuild the native app: `npx expo run:ios` (or `android`).
  3. Start with clear cache: `npx expo start -c`.

---

## 🔮 Future Roadmap
- [ ] **Audio Integration**: Complete the `Typewriter` sound effects using `expo-av`.
- [ ] **Haptics**: Add heavy vibration feedback during the glitch phase.
- [ ] **Share Feature**: Export the generated "Glitch Art" as an image.