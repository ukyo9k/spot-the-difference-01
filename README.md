# Lantern Lane — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/ukyo9k/spot-the-difference-01/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/ukyo9k/spot-the-difference-01/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Built for the [make.fun](https://make.fun) bounty [“Make the best spot the difference game”](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451) ($50 in USDC).

An original spot-the-difference game that runs entirely offline in a desktop browser: two near-identical pictures side by side, drawn in code — no photos, no borrowed characters, no network requests. Find all 7 differences in each of three hand-drawn scenes before the clock runs out.

## The three scenes

1. **Lantern Lane** — a night market alley strung with paper lanterns, an orange cat on a crate, and a shop awning.
2. **Tea Garden** — a quiet garden with a koi pond, a little pagoda, a cherry tree and a stone lantern.
3. **Lighthouse Cove** — a sunset coast with a striped lighthouse, a sailboat and a palm on the rocks.

Each scene hides 7 differences (21 in all): things that vanish, change colour, lose a light, or quietly move. Some are fair and quick; some — a single bridge plank, one blossom cluster — reward a slow second look.

## How it plays

- **Click** a difference on either picture to mark it with a green ring and a check. Found differences stay marked; the counter shows how many remain.
- **Wrong clicks** cost 5 seconds and 10 points, and leave a red X where you clicked.
- **Hints** (H, 3 per level, 25 points each) pulse a golden ring around one difference you haven't found yet.
- **Timer**: 2:30 per level. Clearing a level banks a time bonus of 2 points per second left.
- **Keyboard**: arrow keys move the crosshair (Tab switches picture), Enter/Space checks a spot, H hint, R restart level, M sound.
- **Sound**: soft synthesized pops, buzzes and jingles via WebAudio — no audio files.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

Or open `game/index.html` from any static server. The game makes no network request at all.

A demo board for screenshots: `?level=2&found=3` starts level 2 with its first 3 differences already found — the same state a player reaches by finding them.

## Layout

- `game/index.html` — page, HUD, panels and overlay
- `game/styles.css` — layout and look
- `game/src/main.js` — entry point
- `game/src/game.js` — state, input, timer, scoring, hints, markers
- `game/src/levels.js` — the three levels and their 21 differences
- `game/src/scenes.js` — the three scenes, drawn twice (base + changed)
- `game/src/audio.js` — synthesized sound effects (WebAudio, no files)
- `main.ts` — hands the game in: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — 4 real renders of the game running in a browser
