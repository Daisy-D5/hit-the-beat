
#### A rhythm-based game collection built with **React**
#### Featuring:
#### 🥁 **Hit The Beat** - reaction-based rhythm game play
#### 🔢 **Hit The Math** - arithmetic times tables maths game play 


#### ---


## PREVIEW

[Hit The Beat Screenshots](./public/images/beat-drum.png) [](./public/images/beat-metal.png) [](./public/images/beat-neon.png) [](./public/images/beat-pause.png)

[Hit The Math Screenshot](./public/images/math1.png) [](./public/images/math2.png) [](./public/images/math3.png)


## LIVE DEMO
[Play the game here]([https://your-link.com](https://hit-the-beat.netlify.app/rhythm))


#### ---


## GAME MODES

### Hit the Beat
#### A classic rhythm reaction game:
#### - Hit the correct drum pad in time
#### - Build combos and score streaks
#### - Survive as long as possible


### Hit the Math
#### A fast-paced maths challenge built on the same engine:
#### - Solve arithmetic problems under time pressure
#### - Hit the correct answer on the drum pads
#### - Combines **mental maths + reaction speed**


#### ---


## HOW TO PLAY

### Hit The Beat
#### 1. Press **Start**
#### 2. A drum pad will light up
#### 3. Hit the correct drum or key before time runs out
#### 4. Score points, trigger combos, and survive as long as you can

#### Miss a beat and it’s **game over**.


### Hit The Math
#### 1. Press **Start**
#### 2. A maths question appears 
#### 3. Choose the correct answer from 4 options
#### 4. Answer quickly to maximise score

#### Wrong answer or timeout = **game over**


#### ---


## SCORING SYSTEM 

### Base Score
#### - Each correct action = **+1 point**

### Combo System
#### Built streaks to unlock bonus tiers:

#### | Hits  | Bonus | Tier  |
#### |------:|------:|-------|
#### | 25    | +5    | Warm  |
#### | 50    | +5    | Warm  |
#### | 75    | +5    | Warm  |
#### | 100   | +10   | Hot   |
#### | 125   | +10   | Hot   |
#### | 150   | +15   | Hot   |
#### | 175   | +15   | Hot   |
#### | 200   | +20   | Mega  |
#### | 225   | +20   | Mega  |
#### | 250   | +25   | Mega  |
#### ...

#### Each tier:
#### - Adds bonus points
#### - Triggers sound + animation
#### - Trigger optional haptics

### Super Combos (Endless Mode)
#### After **300 hits**:
#### - Every +50 hits:
####   - +30 combo points
####   - Super combo activation
####   - Enhanced effects & haptics


#### ---


## DIFFICULTY SYSTEM

#### Choose a fixed difficulty level or adaptive auto mode:
#### - Easy
#### - Medium
#### - Hard
#### - Expert
#### - Auto (dynamic scaling)

#### Higher levels reduce reaction time and increase intensity.


#### ---


## MATH MODE FEATURES

### Question Types
#### - Easy → Expert: Multiplication only
#### - Master: Random mix of Multiplication and Division
#### - Auto (dynamic scaling)

#### Higher the level higher the multiplier (×).
#### Division questions always result in **whole numbers**.


### 5-Second Challenge Mode (Optional)
#### Enable the 5-second timer in settings for extra challenge:
#### - 5 second limit per question
#### - Final seconds trigger warning sound
#### - Timeout reveals correct answer

#### **PERFECT bonus (+5)** for fast answers.


#### ---


## EDUCATIONAL FOCUS

#### Hit the Math introduces light educational automation:
#### - Randomised question generation
#### - Adaptive difficulty (Auto mode)
#### - Instant answer validation and feedback system

#### Designed to make practising arithmetic:
#### - Faster
#### - More engaging
#### - More reactive than traditional drills


#### ---


## HAPTICS (Optional)

#### - Device vibration for combo tiers
#### - Custom patterns per tier
#### - Toggle ON/OFF in settings
#### - Saved in localStorage

#### Haptics are automatically disabled on unsupported devices.


#### ---


## AUDIO SYSTEM

#### - Optional looping background beats
#### - Dynamic sound effects:
####   - Hits
####   - Combo tiers
####   - Feedback
#### - Music fades out smoothly on game over


#### ---


## VISUAL THEMES (Hit The Beat only)

#### Choose between multiple visual themes in settings:
#### - Drum
#### - Metal
#### - Neon
#### - Retro

#### Each theme affects visual and sound design.


#### ---


## ARCHITECTURE HIGHLIGHTS 

### React functional components
#### - Custom hooks: 
####   - 'useAudioSystem'
####   - 'useComboSystem'
####   - 'useFiveSecondTimer'
####   - 'useGameEngine'
####   - 'useGameLoop'
####   - 'useScoreSystem'
#### - Clean separation of:
####   - Game logic
####   - Audio handling
####   - UI components
#### - State-driven animations
#### - Keyboard + click input support


#### ---


## TECH STACK 

#### - React
#### - JavaScript (ES6+)
#### - CSS (custom animations & responsive design)


#### --- 


## GETTING STARTED

### Install & Run Locally:
#### ```bash
#### npm install
#### npm start


#### ---


## CREDITS

#### Made with ❤️ and rhythm.
#### Inspired by arcade rhythm and boxing music games, with a twist of interactive learning.
#### Designed to be fast, fun, educational and endlessly replayable.
#### Created by Daisy-D5.


## ENJOY THE BEAT!
