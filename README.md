# Runalytics

Runalytics is a small client-side running tracker that uses Firebase Authentication and browser `localStorage` to store per-user run data.

Key features:
- Add runs via a modal form (date, miles, pace, RPE, time, resting/max/average HR).
- VO2 Max calculated using the Uth formula: `15.3 * (HRmax / HRrest)`.
- Running efficiency calculated as `mph / avgHR` (mph = `60 / pace`).
- Charts rendered on `progress.html` using Chart.js.

Local dev / publish notes
- The project currently stores run data in localStorage under the key `runData_<uid>` after a successful login.
- To publish to GitHub:
  1. Create a new repository on GitHub (do not include angle brackets in URLs).
  2. In this repo directory, add the remote and push:

```bash
# set the remote (replace the URL below with your repository URL)
git remote add origin https://github.com/<your-username>/Runalytics.git
# ensure the local branch is named 'main'
git branch -M main
# push the current commit
git push -u origin main
```

If you'd like, provide a GitHub repo URL or a PAT and I can add the remote or create the repo for you.

Files edited during the recent work: `firebase.js`, `runreport.html`, `runreport.css`.

If you want me to push the existing local commit to GitHub, reply with the repository URL (HTTPS or SSH) or provide a PAT and I'll proceed.
