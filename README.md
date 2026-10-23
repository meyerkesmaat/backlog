# Backlog

My game and TV log: a dashboard, library, backlog with play order, journal and a shows tracker.
It runs entirely in the browser and works as an iPhone home-screen app.

- **Live site:** served by GitHub Pages from the `docs/` folder.
- **Your data** is saved in the browser of each device. Use **Data → Export backup / Import backup** to move it between devices.

## Updating

```
node tools/build.js
```

This rebuilds `docs/` from `src/app.html` (the app) and `src/data.json` (the starting data).
Commit and push, and GitHub Pages publishes it within a minute or two.
The version stamp at the bottom of the **Data** menu shows which build a device is running.

## Sources

- Covers: Wikipedia
- Game lengths: HowLongToBeat (Main + Extra)
- Show info and episode lengths: TVmaze
