# ✨ Immersive Interactive React Birthday Celebration App ✨

A modern, highly engaging, multi-page React birthday celebration application built with interactive 3D elements, dynamic physics, particle systems, celebratory confetti & fireworks, and a pure Web Audio API synthesizer engine.

---

## 🚀 Quick Start & How to Run

To run the application locally without requiring complex build tooling or dependency installation:

```bash
# Start a local static web server
python3 -m http.server 8080
```

Open your browser and navigate to **`http://localhost:8080`**.

---

## 🌟 Interactive Features & Multi-Page Highlights

| Scene / Page | Key Features & Interactive Mechanics |
| :--- | :--- |
| **1. 🌟 Grand Invitation & Countdown** | • Interactive 3D unfolding envelope with golden wax seal stamp.<br>• Live countdown ticker to the birthday milestone.<br>• Ambient celestial starfield with interactive cursor stardust trail. |
| **2. 🎂 Cake & Candle Ceremony** | • Multi-tiered frosted 3D cake on an elegant metallic pedestal.<br>• Interactive flame flickers (tap candles to extinguish with realistic smoke puff animations).<br>• Fanfare audio, fireworks confetti explosion & "Cast a Wish to the Stars" modal. |
| **3. 📸 Memory Storybook & Timeline** | • 3D Polaroid tilt cards with washi tape, organic rotations, and hover physics.<br>• Category filters (*Adventure, Friendship, Memories, Fun, Celebration*).<br>• Fullscreen lightbox viewer with photo captions & custom card creator. |
| **4. 💌 Secret Surprise & Scratch Card** | • Real-time HTML5 canvas metallic foil scratch-off card.<br>• 3D animated unboxing gift box with floating celebratory coupons.<br>• Heartfelt vintage typewriter letter with wax seal signature. |
| **5. 🎈 Interactive Cosmic Wish Wall** | • Floating masonry neon sticky notes and guestbook capsules.<br>• Live emoji reactions (❤️, 🔥, 🎉) with instant counter feedback.<br>• "Pin a Wish" modal with color customizer and avatar selector. |
| **6. 🎮 Celebration Arcade** | • **Balloon Pop Frenzy**: Time-attack balloon popping game with combo streaks and champion trophies.<br>• **Birthday Star Trivia Quiz**: Interactive multiple-choice trivia challenge. |

---

## 🎵 Sound & Audio Engine (`src/services/soundEngine.js`)

- **Built-in Web Audio API Synthesizer**: Zero external MP3 downloads required!
- **Sound Effects Included**:
  - `playPop()`: Crisp balloon pop sound
  - `playBlow()`: Candle wind puff
  - `playFanfare()`: Multi-note celebration fanfare
  - `playSparkle()`: Shimmering stardust chimes
  - `startBirthdayMelody()`: Music box melody loop with animated equalizer bars in the top navbar.

---

## 🎨 Theme Customizer

Switch seamlessly between 4 curated aesthetic palettes anytime from the top bar:
1. **🌌 Cosmic Midnight**: Deep purples, starlight indigo, glowing violet neon.
2. **🌸 Rose Gold Dream**: Warm blush pinks, ruby accents, soft champagne golds.
3. **⚡ Neon Cyberpunk**: High-contrast cyan, electric magenta, emerald sparks.
4. **🌅 Golden Sunset**: Amber glow, warm flame gradients, deep crimson tones.

---

## 🛠️ How to Customize for Future Ideation

All personalized content is centralized in a single file: **[`src/data/birthdayData.js`](./src/data/birthdayData.js)**.

You can easily customize:
- **Person of Honor**: Name, age, birthdate, zodiac sign, nickname.
- **Invitation Text**: Subheadings, letter previews, badges.
- **Cake Configuration**: Number of candles, cake flavor name, ceremony prompts.
- **Memories**: Add or swap photos, captions, dates, and category tags.
- **Secret Letter**: Custom messages, sender names, scratch card hints.
- **Wish Wall**: Initial guestbook notes, avatars, and timestamps.
- **Arcade Trivia**: Custom personal questions and fun facts.
