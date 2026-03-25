# ⚔️ Akadi — Idle RPG

An AFK Arena–style idle RPG rebuilt as a modern web app.

## 🎮 Features

- Auto-battle with speed controls (1x/2x/3x)
- 12 heroes across 5 factions with unique skills
- Hero summoning with 1–5 star rarity
- Level up system with gold
- Boss fights every 10 stages
- Idle rewards while offline (up to 8 hours)
- Auto-save to localStorage
- Mobile-first design (works great on iPhone)
- Installable as PWA (Add to Home Screen)

## 📱 Deploy from iPhone — Step by Step

### Step 1: Create a GitHub Account
1. Open Safari → go to **github.com**
2. Tap **Sign up** and create an account

### Step 2: Create a New Repository
1. Tap the **+** icon (top right) → **New repository**
2. Name it `akadi-idle-rpg`
3. Check **"Add a README file"**
4. Tap **Create repository**

### Step 3: Upload Files
1. In your new repo, tap **"Add file"** → **"Upload files"**
2. Open the **Files** app on your iPhone
3. Find the downloaded zip → tap to unzip it
4. Go back to GitHub in Safari
5. Upload files in this order (you may need multiple uploads):

**Root files (upload first):**
- `package.json`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.js`
- `next.config.js`
- `.gitignore`

**Then create folders and upload contents:**
- `public/` → all icon images + manifest.json
- `src/app/` → globals.css, layout.tsx, page.tsx
- `src/lib/` → types.ts, heroes.ts, enemies.ts, combat.ts, store.ts, utils.ts
- `src/hooks/` → useGameLoop.ts
- `src/components/` → GameClient.tsx

> **Tip:** On GitHub mobile, tap "Add file" → "Create new file" and name it `src/app/globals.css` to auto-create folders. Then paste the content.

### Step 4: Deploy on Vercel
1. Open Safari → go to **vercel.com**
2. Tap **"Sign Up"** → **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub
4. Tap **"Add New Project"**
5. Find and select `akadi-idle-rpg`
6. Leave all settings as default
7. Tap **"Deploy"**
8. Wait 1–2 minutes for the build
9. You'll get a URL like `akadi-idle-rpg.vercel.app`

### Step 5: Play & Install on iPhone
1. Open your Vercel URL in Safari
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Now Akadi is on your home screen like a real app!

## 🎯 Game Mechanics

| System | Details |
|--------|---------|
| Combat | Turn-based by speed, auto-attacking with skill cooldowns |
| Factions | Lightbearer, Mauler, Wilder, Graveborn, Celestial |
| Roles | Tank, Warrior, Mage, Support, Ranger |
| Stages | Scaling difficulty, boss every 10 stages |
| Summoning | 1⭐ 50%, 2⭐ 30%, 3⭐ 15%, 4⭐ 4%, 5⭐ 1% |
| Idle | Earn gold & EXP offline for up to 8 hours |

## 🛠 Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- localStorage (saves)
- PWA manifest (installable)

## License

MIT
