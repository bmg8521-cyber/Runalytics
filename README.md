# Runalytics
**Runalytics is a lightweight, client‑side running tracker that helps recreational and competitive runners record workouts, visualize trends, and estimate physiological metrics (VO2 and running efficiency) without requiring a server‑side database. It pairs secure user sign-in (Firebase Auth) with local, per‑user storage and Chart.js visualizations.**

**Vision**
Problem: Runners want a private, inexpensive way to track workouts.
Why this approach: A local client app provides privacy and immediacy while still allowing a simple authentication layer (Firebase Auth) so users can keep runs separated by account.

**System Architecture*
Frontend: Static HTML/CSS/JS served via GitHub Pages. Core pages: signup.html, login.html, runreport.html (run list + add modal), and progress.html (charts).
Auth: Firebase Authentication handles signup/login flows. On successful auth the app stores currentUID in localStorage.
Storage: localStorage, no server database is used for run records.
Visualization: Chart.js renders time series charts on progress.html.
Deployment: GitHub Pages (branch gh-pages) hosts the static assets.

**Model‑View‑Controller**
Model: localStorage object runData_<uid> (parallel arrays for dates, miles, pace, RPE, time, hrRest, hrMax, avgHR, calcVO2, runningEff).
View: HTML pages and Chart.js charts.
Controller: firebase.js — mediates auth, input validation, calculations, storage updates, and chart re-rendering.
Technical Stack & Rationale
Languages/Frameworks: HTML, CSS, vanilla JavaScript (ES modules). Chosen for minimal complexity.
Authentication: Firebase Auth — Quick, secure
Storage: Browser localStorage for per‑user persistence. Tradeoff: no centralized backup or cross-device sync; benefit: privacy, zero server costs.
Hosting: GitHub Pages — ideal for static apps, free HTTPS and CI compatibility.

**Key Algorithms**
Parsing pace (m:ss → decimal minutes): O(1) per input, constant work to split and convert.
Adding a run (handleRunFormSubmission): O(1) work per field; then saveUserRunData performs a sort by date:
Combine parallel arrays into objects and sort by Date — sorting is O(n log n) for n runs.
Rebuild arrays from the sorted objects — O(n). Overall save complexity: O(n log n) dominated by sort.
Recomputing metrics on load (loadAndRenderCharts): Iterates each run to compute calcVO2 and runningEff — O(n). Uses constant extra memory per run and replaces arrays in place.
Chart rendering: Chart.js draws in O(n) per dataset (drawing cost depends on canvas and Chart internal work). Memory usage is O(n) to hold series arrays.

**Installation**
You do not need Node or Anaconda to run it locally.
Open https://bmg8521-cyber.github.io/Runalytics/ in your browser

**Challenges & Iterations**
VO2 consistency: Multiple VO2 formulas were present; consolidated to the Uth heart‑rate method (calcVO2 = 15.3 * HRmax/HRrest). Implemented recompute on load to sanitize historic entries.
Running efficiency metric: Standardized to mph / avgHR with mph = 60 / pace (pace in min/mile). Stored as runningEff with 4 decimal places.
Persistent sorting & corruption bug: A previously pushed undefined variable caused corrupt saves. Fix: centralize save logic in saveUserRunData which combines arrays, sorts by date, and writes a normalized object.

Security & Privacy
Authentication: Firebase Auth only handles sign‑in. Credentials are not stored in the repo.
Runs are stored locally per user.

