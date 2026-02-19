# Runalytics

Runalytics is a small client-side running tracker that uses Firebase Authentication and browser `localStorage` to store per-user run data.

Key features:
- Add runs via a modal form (date, miles, pace, RPE, time, resting/max/average HR).
- VO2 Max calculated using the Uth formula: `15.3 * (HRmax / HRrest)`.
- Running efficiency calculated as `mph / avgHR` (mph = `60 / pace`).
- Charts rendered on `progress.html` using Chart.js.

Open with this link:
https://bmg8521-cyber.github.io/Runalytics/
