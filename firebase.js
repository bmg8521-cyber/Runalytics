// FIREBASE SETUP
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
 getAuth,
 createUserWithEmailAndPassword,
 signInWithEmailAndPassword,
 fetchSignInMethodsForEmail,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";


const firebaseConfig = {
 apiKey: "AIzaSyADae4lQxSEwbVakZY-h6ym8iCUkVVdbM0",
 authDomain: "runalyticsstemposium.firebaseapp.com",
 projectId: "runalyticsstemposium",
 storageBucket: "runalyticsstemposium.firebasestorage.app",
 messagingSenderId: "149435688833",
 appId: "1:149435688833:web:e1215b896a85c918eb2a80",
 measurementId: "G-PC2WDX7NE3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ELEMENTS
const message = document.getElementById("message");
const signUpBtn = document.getElementById("signUpBtn");
const signInBtn = document.getElementById("signInBtn");
const addBtn = document.getElementById("addBtn");
const homeAddBtn = document.getElementById("homeAddBtn");
const dateDisplay = document.getElementById("selectedDateDisplay");

// SIGN UP
if (signUpBtn) {
 signUpBtn.addEventListener("click", async () => {
   const email = document.getElementById("email").value.trim().toLowerCase();
   const password = document.getElementById("password").value;

   try {
     const methods = await fetchSignInMethodsForEmail(auth, email);
     if (methods.length > 0) {
      message.textContent = "Account already exists. Please log in.";
       return;
     }

     const userCred = await createUserWithEmailAndPassword(auth, email, password);
     localStorage.setItem("currentUID", userCred.user.uid);

    message.style.color = "green";
    message.textContent = "Account created! Redirecting...";
     setTimeout(() => (window.location.href = "runreport.html"), 1500);
   } catch (error) {
     message.textContent = error.message;
   }
 });
}

// LOGIN
if (signInBtn) {
 signInBtn.addEventListener("click", async (e) => {
   console.log("signInBtn clicked");
   e.preventDefault();

   const email = document.getElementById("email").value.trim().toLowerCase();
   const password = document.getElementById("password").value;

     if (!email || !password) {
     message.textContent = "Please enter both email and password.";
     message.style.color = "red";
     return;
   }

   try {
     const userCred = await signInWithEmailAndPassword(auth, email, password);
     localStorage.setItem("currentUID", userCred.user.uid);

    message.style.color = "green";
    message.textContent = "Logged in! Redirecting...";
     setTimeout(() => (window.location.href = "runreport.html"), 1500);
   } catch (error) {
     if (error.code === "auth/user-not-found") {
      message.textContent = "No account found. Please sign up.";
     } else if (error.code === "auth/wrong-password") {
      message.textContent = "Incorrect password.";
     } else {
      message.textContent = error.message;
     }
     message.style.color = "red";
   }
 });
 console.log("signInBtn exists:", !!signInBtn);
}

// RUN DATA HELPERS
function getCurrentUID() {
 return localStorage.getItem("currentUID");
}

function getUserRunData(uid) {
 return JSON.parse(localStorage.getItem(`runData_${uid}`)) || {
  dates: [],
  miles: [],
   vo2max: [],   // original user-entered VO2 (kept if you want)
   pace: [],
   rpe: [],
   time: [],
   // NEW arrays for calculated metrics:
   calcVO2: [],      // VO2 computed by heart-rate method (Uth formula: 15.3 * HRmax/HRrest)
   runningEff: [],   // running efficiency (mph divided by avg HR)
   hrRest: [],
   hrMax: [],
   avgHR: [],
 };
}

// UPDATED: Sort by date before saving AND include new fields
function saveUserRunData(uid, data) {
 // combine into objects with Date for sorting
 const combined = data.dates.map((dateStr, i) => ({
   dateObj: new Date(dateStr),
   dateStr: dateStr,
  miles: data.miles[i],
   vo2max: data.vo2max[i],
   pace: data.pace[i],
   rpe: data.rpe[i],
   time: data.time[i],
    // ensure calcVO2 stored value is used if present; otherwise null
    calcVO2: data.calcVO2 ? data.calcVO2[i] : null,
    runningEff: data.runningEff ? data.runningEff[i] : null,
    hrRest: data.hrRest ? data.hrRest[i] : null,
    hrMax: data.hrMax ? data.hrMax[i] : null,
    avgHR: data.avgHR ? data.avgHR[i] : null,
 }));

 // sort ascending (oldest first)
 combined.sort((a, b) => a.dateObj - b.dateObj);

 // reassign arrays in sorted order
 data.dates = combined.map((r) => r.dateStr);
 data.miles = combined.map((r) => r.miles);
 data.vo2max = combined.map((r) => r.vo2max);
 data.pace = combined.map((r) => r.pace);
 data.rpe = combined.map((r) => r.rpe);
 data.time = combined.map((r) => r.time);
 data.calcVO2 = combined.map((r) => r.calcVO2);
 data.runningEff = combined.map((r) => r.runningEff);
   data.hrRest = combined.map((r) => r.hrRest);
   data.hrMax = combined.map((r) => r.hrMax);
   data.avgHR = combined.map((r) => r.avgHR);

 localStorage.setItem(`runData_${uid}`, JSON.stringify(data));
 window.dispatchEvent(new Event("runDataUpdated"));
}

// Helper: validate numeric input
function toNumberOrNull(v) {
 const n = parseFloat(String(v).trim());
 return Number.isFinite(n) ? n : null;
}

// ADD RUN (Runreport Page) — use inline modal if present, fallback to the dynamic modal
function handleRunFormSubmission(form, overlayElement) {
  const uid = getCurrentUID();
  if (!uid) return alert("Not logged in!");

  const dateInput = form.elements["date"].value.trim();
  if (!dateInput) return alert("Date is required!");
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return alert("Invalid date format!");
  const formattedDate = date.toLocaleDateString("en-US");

  const milesRaw = form.elements["miles"].value.trim();
  const paceRaw = form.elements["pace"].value.trim();
  const rpeRaw = form.elements["rpe"].value.trim();
  const timeRaw = form.elements["time"].value.trim();

  if (!milesRaw || !paceRaw || !rpeRaw || !timeRaw) return alert("Please fill all required fields!");

  const miles = toNumberOrNull(milesRaw);
  const rpe = toNumberOrNull(rpeRaw);
  const timeMin = toNumberOrNull(timeRaw);
  if (miles === null || rpe === null || timeMin === null) return alert("Numeric fields must be valid numbers.");

  // parse pace
  let pace = null;
  const p = String(paceRaw).trim();
  if (p.includes(":")) {
    const parts = p.split(":").map((x) => parseFloat(x));
    if (parts.length === 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) pace = parts[0] + parts[1] / 60;
  } else {
    pace = toNumberOrNull(p);
  }
  if (pace === null) return alert("Invalid pace format.");

  const hrRest = toNumberOrNull(form.elements["hrRest"].value.trim());
  const hrMax = toNumberOrNull(form.elements["hrMax"].value.trim());
  if (hrRest === null || hrMax === null || hrRest <= 0) return alert("Invalid heart rate values entered for VO2 calculation.");

  const calcVO2 = 15.3 * (hrMax / hrRest);

  const avgHR = toNumberOrNull(form.elements["avgHR"].value.trim());
  if (avgHR === null || avgHR <= 0) return alert("Invalid average heart rate value.");

  const runningEff = (pace > 0 && avgHR > 0) ? (60 / pace) / avgHR : null;

  const data = getUserRunData(uid);
  data.dates.push(formattedDate);
  data.miles.push(miles);
  data.pace.push(pace);
  data.rpe.push(rpe);
  data.time.push(timeMin);
  data.hrRest.push(hrRest);
  data.hrMax.push(hrMax);
  data.calcVO2.push(Number.isFinite(calcVO2) ? Number(calcVO2.toFixed(2)) : null);
  data.runningEff.push(Number.isFinite(runningEff) ? Number(runningEff.toFixed(4)) : null);
  if (!data.avgHR) data.avgHR = [];
  data.avgHR.push(avgHR);

  saveUserRunData(uid, data);
  if (overlayElement) overlayElement.style.display = "none";
  alert("Run saved for " + formattedDate);
}

function showAddRunModal() {
  const inlineOverlay = document.getElementById("addRunOverlay");
  const inlineForm = document.getElementById("addRunForm");
  if (inlineOverlay && inlineForm) {
    inlineOverlay.style.display = "flex";
    if (!inlineForm.dataset.inited) {
      const cancelBtn = inlineForm.querySelector("#cancelAdd");
      if (cancelBtn) cancelBtn.addEventListener("click", () => (inlineOverlay.style.display = "none"));
      inlineForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleRunFormSubmission(inlineForm, inlineOverlay);
      });
      inlineForm.dataset.inited = "1";
    }
    return;
  }

  // Fallback: if no inline modal present, create a quick dynamic modal (keeps previous behavior)
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.left = 0;
  overlay.style.top = 0;
  overlay.style.right = 0;
  overlay.style.bottom = 0;
  overlay.style.background = "rgba(0,0,0,0.5)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = 9999;

  const form = document.createElement("form");
  form.style.background = "#fff";
  form.style.padding = "20px";
  form.style.borderRadius = "8px";
  form.style.width = "320px";
  form.style.boxShadow = "0 6px 18px rgba(0,0,0,0.2)";

  form.innerHTML = `
    <h3 style="margin-top:0">Add Run</h3>
    <label>Date (MM/DD/YYYY)<br><input name="date" required placeholder="MM/DD/YYYY"></label><br><br>
    <label>Distance (miles)<br><input name="miles" required inputmode="decimal" placeholder="e.g. 3.1"></label><br><br>
    <label>Pace (m:ss)<br><input name="pace" required placeholder="e.g. 8:30"></label><br><br>
    <label>RPE (1-10)<br><input name="rpe" required inputmode="numeric" placeholder="6"></label><br><br>
    <label>Duration (minutes)<br><input name="time" required inputmode="decimal" placeholder="45"></label><br><br>
    <label>Resting HR (bpm)<br><input name="hrRest" required inputmode="numeric" placeholder="60"></label><br><br>
    <label>Max HR (bpm)<br><input name="hrMax" required inputmode="numeric" placeholder="180"></label><br><br>
    <label>Average HR (bpm)<br><input name="avgHR" required inputmode="numeric" placeholder="150"></label><br><br>
    <div style="text-align:right">
      <button type="button" id="cancelAdd" style="margin-right:8px">Cancel</button>
      <button type="submit">Save Run</button>
    </div>
  `;

  overlay.appendChild(form);
  document.body.appendChild(overlay);

  form.querySelector("#cancelAdd").addEventListener("click", () => overlay.remove());
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleRunFormSubmission(form, overlay);
  });
}

if (addBtn) addBtn.addEventListener("click", showAddRunModal);
if (homeAddBtn) homeAddBtn.addEventListener("click", showAddRunModal);


// PROGRESS PAGE CHARTS
document.addEventListener("DOMContentLoaded", () => {
 const chartsContainer = document.getElementById("chartsContainer");
 if (!chartsContainer) return;

 function loadAndRenderCharts() {
   const uid = getCurrentUID();
   if (!uid) return;

   const runData = getUserRunData(uid);
   if (!runData.dates || runData.dates.length === 0) {
     chartsContainer.innerHTML =
       "<p style='color:red; text-align:center;'>No run data available.</p>";
     return;
   }

   // DO NOT wipe out canvases. They already exist in progress.html

  // Recompute calcVO2 from stored hrMax/hrRest using Uth formula: 15.3 * (HRmax / HRrest)
  // Also recompute running efficiency using mph/avgHR (mph = 60/pace).
  // If we find any differing values, persist the corrected values so charts match the formula.
  try {
    let recomputed = false;
    const newCalc = [];
    const newRunning = [];
    (runData.dates || []).forEach((_, i) => {
      // calc VO2 (Uth formula)
      const rawMax = runData.hrMax && runData.hrMax[i];
      const rawRest = runData.hrRest && runData.hrRest[i];
      const maxN = rawMax !== undefined && rawMax !== null ? parseFloat(rawMax) : NaN;
      const restN = rawRest !== undefined && rawRest !== null ? parseFloat(rawRest) : NaN;
      let vo2v = null;
      if (Number.isFinite(maxN) && Number.isFinite(restN) && restN > 0) {
        vo2v = Number((15.3 * (maxN / restN)).toFixed(2));
      } else {
        const existing = runData.calcVO2 && runData.calcVO2[i] !== undefined ? parseFloat(runData.calcVO2[i]) : null;
        vo2v = Number.isFinite(existing) ? Number(existing.toFixed(2)) : null;
      }
      newCalc.push(vo2v);

      // recompute running efficiency = (60/pace)/avgHR
      const rawPace = runData.pace && runData.pace[i];
      const rawAvg = runData.avgHR && runData.avgHR[i];
      const paceN = rawPace !== undefined && rawPace !== null ? parseFloat(rawPace) : NaN;
      const avgN = rawAvg !== undefined && rawAvg !== null ? parseFloat(rawAvg) : NaN;
      let runv = null;
      if (Number.isFinite(paceN) && paceN > 0 && Number.isFinite(avgN) && avgN > 0) {
        runv = Number(((60 / paceN) / avgN).toFixed(4));
      } else {
        const existingR = runData.runningEff && runData.runningEff[i] !== undefined ? parseFloat(runData.runningEff[i]) : null;
        runv = Number.isFinite(existingR) ? Number(existingR.toFixed(4)) : null;
      }
      newRunning.push(runv);

      if (runData.calcVO2[i] !== vo2v || runData.runningEff[i] !== runv) recomputed = true;
    });

    if (recomputed) {
      runData.calcVO2 = newCalc;
      runData.runningEff = newRunning;
      saveUserRunData(uid, runData);
      // saveUserRunData will dispatch runDataUpdated which will cause charts to re-render.
      return;
    }
    // use normalized values for rendering
    runData.calcVO2 = newCalc;
    runData.runningEff = newRunning;
  } catch (e) {
    console.error("Error recomputing calcVO2/runningEff:", e);
  }

  function createChart(id, label, data, color, yRange) {
 // Skip empty charts
 if (!data || data.length === 0) {
   console.log(`Skipping chart: ${label} (no data)`);
   return;
 }

 const ctx = document.getElementById(id);
 if (!ctx) {
   console.log(`Canvas not found: ${id}`);
   return;
 }

   new Chart(ctx, {
   type: "line",
   data: {
     labels: runData.dates,
     datasets: [{ label, data, borderColor: color, fill: false }],
   },
   options: {
     scales: {
       x: { title: { display: true, text: "Date" } },
       y: (function () {
         // build y-axis options: if yRange provided use it, otherwise default to beginAtZero
         const opts = {};
         if (yRange && typeof yRange.min !== "undefined") opts.min = yRange.min;
         if (yRange && typeof yRange.max !== "undefined") opts.max = yRange.max;
         if (typeof opts.min === "undefined" && typeof opts.max === "undefined") opts.beginAtZero = true;
         return opts;
       })(),
     },
   },
 });
}

  // Normalize calcVO2 values to numbers (some entries may be stored as strings/null)
  const calcVO2Data = (runData.calcVO2 || []).map((v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  });
  createChart("calcVO2Chart", "Calculated VO2 Max", calcVO2Data, "#ff7f0e");
  createChart("rpeChart", "RPE", runData.rpe, "#9467bd");
  // Time chart removed per user request.
  // Running Efficiency chart: auto y-axis (values are small: mph/avgHR)
  createChart("runningEffChart", "Running Efficiency", runData.runningEff, "#7f7fff");
 }

 loadAndRenderCharts();
 window.addEventListener("runDataUpdated", loadAndRenderCharts);
});

// RUNREPORT: render run list with delete capability
// Ensure the run list is only rendered on the run report page
if (document.body.classList.contains("run-report-page")) {
  function renderRunButtons() {
    // prefer the explicit `buttonContainer` used on the run report page
    let container = document.getElementById("buttonContainer") || document.getElementById("runButtonsContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "runButtonsContainer";
      document.body.appendChild(container);
    }

    container.innerHTML = "";
    const uid = getCurrentUID();
    if (!uid) return;

    const data = getUserRunData(uid);
    if (!data.dates || data.dates.length === 0) {
      container.innerHTML = "<p style='text-align:center;color:#666'>No saved runs.</p>";
      return;
    }

    data.dates.forEach((dateStr, i) => {
      const row = document.createElement("div");
      row.className = "run-entry";
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.margin = "6px 0";

      const btn = document.createElement("button");
      btn.textContent = dateStr;
      btn.style.flex = "1";
      btn.style.padding = "8px 12px";
      btn.style.borderRadius = "6px";
      btn.style.border = "1px solid #ccc";
      btn.style.background = "#fff";
      btn.style.cursor = "pointer";

      // tooltip showing run details
      const miles = data.miles[i] !== undefined ? data.miles[i] : "—";
      const avgHRVal = data.avgHR && data.avgHR[i] !== undefined ? data.avgHR[i] : "—";
      const calcVO2 = data.calcVO2 && data.calcVO2[i] !== undefined ? data.calcVO2[i] : "—";
      const hrRestVal = data.hrRest && data.hrRest[i] !== undefined ? data.hrRest[i] : "—";
      const hrMaxVal = data.hrMax && data.hrMax[i] !== undefined ? data.hrMax[i] : "—";
      const pace = data.pace && data.pace[i] !== undefined ? data.pace[i] : "—";
      const rpe = data.rpe && data.rpe[i] !== undefined ? data.rpe[i] : "—";
      const time = data.time && data.time[i] !== undefined ? data.time[i] : "—";
      const runEff = data.runningEff && data.runningEff[i] !== undefined ? data.runningEff[i] : "—";
    btn.title = `Miles: ${miles}\nAvg HR: ${avgHRVal}\nHR Rest: ${hrRestVal}\nHR Max: ${hrMaxVal}\nCalculated VO2: ${calcVO2}\nPace: ${pace}\nRPE: ${rpe}\nTime (min): ${time}\nRunning Efficiency: ${runEff}`;
      btn.addEventListener("click", () => alert(btn.title));

      const del = document.createElement("button");
      del.textContent = "×";
      del.title = "Delete this run";
      del.className = "delete-button";
      del.style.marginLeft = "8px";
      del.style.padding = "6px 10px";
      del.style.border = "none";
      del.style.background = "transparent";
      del.style.color = "#c22";
      del.style.fontSize = "18px";
      del.style.cursor = "pointer";

      del.addEventListener("click", () => {
        if (!confirm(`Delete run on ${dateStr}? This cannot be undone.`)) return;
        const keys = [
          "dates",
          "miles",
          "vo2max",
          "pace",
          "rpe",
          "time",
          "calcVO2",
          "runningEff",
          "hrRest",
          "hrMax",
          "avgHR",
        ];
        keys.forEach((k) => {
          if (Array.isArray(data[k])) data[k].splice(i, 1);
        });
        saveUserRunData(uid, data);
        // render will be triggered by runDataUpdated, but call now to update UI instantly
        renderRunButtons();
      });

      row.appendChild(btn);
      row.appendChild(del);
      container.appendChild(row);
    });
  }

  // wire rendering to lifecycle and updates
  document.addEventListener("DOMContentLoaded", () => {
    renderRunButtons();
    window.addEventListener("runDataUpdated", renderRunButtons);
  });
}

console.log("Current UID:", getCurrentUID());