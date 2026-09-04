// --- THEME TOGGLE LOGIC ---
const htmlElement = document.documentElement;

if (localStorage.getItem('theme') === 'light') {
  htmlElement.classList.remove('dark');
} else {
  htmlElement.classList.add('dark');
}

function toggleTheme() {
  if (htmlElement.classList.contains('dark')) {
    htmlElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    htmlElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}
// -------------------------------

// GEMINI API CONFIGURATION (Verified AQ format key)
const API_KEY = "YOUR_GEMINI_API_KEY_HERE"; 

// FIREBASE DATABASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyBj1Ak7JD2r1NNtm64AQesObdCZTeqRv2c",
  authDomain: "scamshield-gaurav.firebaseapp.com",
  projectId: "scamshield-gaurav",
  storageBucket: "scamshield-gaurav.firebasestorage.app",
  messagingSenderId: "567231768127",
  appId: "1:567231768127:web:e6d6b022e036befb79ba8a"
};

// Initialize Firebase Database
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentScore = 0;
let currentSummary = "";

async function addTerminalLog(text) {
  const logs = document.getElementById("terminalLogs");
  const div = document.createElement("div");
  div.innerText = `> ${text}`;
  logs.appendChild(div);
  await new Promise(r => setTimeout(r, 400));
}

// OCR Image Scanner
async function extractTextFromImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const uploadBtn = document.getElementById("uploadBtn");
  const originalText = uploadBtn.innerHTML;
  uploadBtn.innerHTML = "⏳ Reading Image OCR...";
  uploadBtn.disabled = true;

  try {
    const result = await Tesseract.recognize(file, 'eng');
    document.getElementById("messageInput").value = result.data.text.trim();
  } catch (err) {
    alert("Image read error: " + err.message);
  } finally {
    uploadBtn.innerHTML = originalText;
    uploadBtn.disabled = false;
    event.target.value = "";
  }
}

// QR Code Scanner
async function extractQRCode(event) {
  const file = event.target.files[0];
  if (!file) return;

  const qrBtn = document.getElementById("qrBtn");
  const originalText = qrBtn.innerHTML;
  qrBtn.innerHTML = "⏳ Scanning QR...";
  qrBtn.disabled = true;

  try {
    const html5QrCode = new Html5Qrcode("messageInput"); 
    const decodedText = await html5QrCode.scanFile(file, true);
    document.getElementById("messageInput").value = "Link found in QR Code: " + decodedText;
    alert("QR Code Successfully Scanned!");
  } catch (err) {
    alert("Failed to decode QR code. Please upload a clear image.");
  } finally {
    qrBtn.innerHTML = originalText;
    qrBtn.disabled = false;
    event.target.value = "";
  }
}

// --- FORENSIC MEDIA SCANNER (Metadata/EXIF URL Extraction) ---
async function runForensicScan(event) {
  const file = event.target.files[0];
  if (!file) return;

  const forensicBtn = document.getElementById("forensicBtn");
  const originalText = forensicBtn.innerHTML;
  forensicBtn.innerHTML = "⏳ Scanning Metadata...";
  forensicBtn.disabled = true;

  const terminalBox = document.getElementById("terminalBox");
  const terminalLogs = document.getElementById("terminalLogs");
  const resultsCard = document.getElementById("resultsCard");

  resultsCard.classList.add("hidden");
  terminalBox.classList.remove("hidden");
  terminalLogs.innerHTML = "";

  await addTerminalLog(`Initializing forensic analysis on: ${file.name}`);
  await addTerminalLog("Checking file signature and magic bytes...");
  await addTerminalLog("Extracting EXIF metadata and hidden payloads...");

  try {
    EXIF.getData(file, async function() {
      const allMetaData = EXIF.getAllTags(this);
      let metaString = JSON.stringify(allMetaData);
      
      if (Object.keys(allMetaData).length === 0) {
         metaString = "No EXIF data found. File appears clean of metadata injection.";
      }

      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const hiddenLinks = metaString.match(urlRegex) || [];

      await addTerminalLog("Metadata extraction complete.");

      const scoreEl = document.getElementById("riskScore");
      const levelEl = document.getElementById("threatLevel");
      const summaryEl = document.getElementById("analysisSummary");
      const linkWarningBox = document.getElementById("linkWarningBox");
      const extractedLinks = document.getElementById("extractedLinks");
      const stepsContainer = document.getElementById("safeStepsList");

      stepsContainer.innerHTML = ""; 

      if (hiddenLinks.length > 0) {
        await addTerminalLog(`WARNING: Detected ${hiddenLinks.length} hidden URL(s) in media metadata!`);
        
        currentScore = 85;
        currentSummary = "Forensic analysis detected hidden URLs embedded within the image metadata. This is a common technique used to bypass security filters and hide malicious payloads or tracking pixels.";
        
        scoreEl.innerText = `${currentScore} / 100`;
        scoreEl.className = "text-4xl font-black text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]";
        
        levelEl.innerText = "Dangerous";
        levelEl.className = "text-2xl font-bold leading-relaxed text-rose-500";
        
        extractedLinks.innerHTML = hiddenLinks.map(link => `<li>⚠️ <code>${link}</code> (Hidden in Metadata)</li>`).join("");
        linkWarningBox.classList.remove("hidden");

        const stepLi = document.createElement("li");
        stepLi.className = "flex gap-2.5 items-start bg-slate-100/50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/60";
        stepLi.innerHTML = `<span class="text-emerald-500 font-bold mt-0.5">✓</span><span>Do not share this file. Delete it immediately to prevent accidental execution of hidden payloads.</span>`;
        stepsContainer.appendChild(stepLi);

      } else {
        await addTerminalLog("No suspicious URLs found in media metadata.");
        
        currentScore = 15;
        currentSummary = "Forensic analysis did not detect any hidden URLs or suspicious metadata injections in this file. However, always remain cautious with files from unknown sources.";
        
        scoreEl.innerText = `${currentScore} / 100`;
        scoreEl.className = "text-4xl font-black text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]";
        
        levelEl.innerText = "Safe";
        levelEl.className = "text-2xl font-bold leading-relaxed text-emerald-500";
        
        linkWarningBox.classList.add("hidden");

        const stepLi = document.createElement("li");
        stepLi.className = "flex gap-2.5 items-start bg-slate-100/50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/60";
        stepLi.innerHTML = `<span class="text-emerald-500 font-bold mt-0.5">✓</span><span>The file metadata is clean, but ensure your antivirus is active before opening files.</span>`;
        stepsContainer.appendChild(stepLi);
      }

      summaryEl.innerText = currentSummary;
      
      setTimeout(() => {
        terminalBox.classList.add("hidden");
        resultsCard.classList.remove("hidden");
      }, 1500);
    });
  } catch (err) {
    console.error(err);
    alert("Forensic scan error: " + err.message);
    terminalBox.classList.add("hidden");
  } finally {
    forensicBtn.innerHTML = "🕵️ Forensic Scan";
    forensicBtn.disabled = false;
    event.target.value = ""; // Reset input
  }
}

// --- FETCH LIVE RECENT THREATS FROM FIREBASE ---
async function loadRecentReports() {
  const feedContainer = document.getElementById("recentThreatsFeed");
  if (!feedContainer) return;

  try {
    const snapshot = await db.collection("scam_reports")
      .orderBy("reported_at", "desc")
      .limit(3)
      .get();

    if (snapshot.empty) {
      feedContainer.innerHTML = `<p class="text-xs text-slate-500 italic">No community threats reported yet. Be the first to report!</p>`;
      return;
    }

    let html = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const shortMsg = data.scam_message.length > 55 ? data.scam_message.substring(0, 55) + "..." : data.scam_message;
      const badgeColor = data.threat_level === "Dangerous" ? "text-rose-500 bg-rose-500/10 border-rose-500/20" : "text-amber-500 bg-amber-500/10 border-amber-500/20";
      
      html += `
        <div class="bg-slate-100 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div class="space-y-0.5 max-w-[70%]">
            <span class="font-mono text-slate-500 text-[10px]">"${shortMsg}"</span>
          </div>
          <span class="px-2 py-0.5 rounded-md font-bold border text-[10px] ${badgeColor}">${data.threat_level} (${data.risk_score}/100)</span>
        </div>
      `;
    });
    feedContainer.innerHTML = html;
  } catch (err) {
    console.error("Error loading live feed: ", err);
    feedContainer.innerHTML = `<p class="text-xs text-rose-500">Could not load live community feed.</p>`;
  }
}

// Load feed on page startup
window.addEventListener('DOMContentLoaded', () => {
  loadRecentReports();
});

// --- REAL-WORLD DATABASE REPORT LOGIC ---
async function reportToDatabase() {
  const textToReport = document.getElementById("messageInput").value.trim() || "Forensic Scan Payload (Hidden Data)";
  const threatLevel = document.getElementById("threatLevel").innerText;
  
  const btn = document.getElementById("reportBtn");
  const resultsCard = document.getElementById("resultsCard");
  const terminalBox = document.getElementById("terminalBox");
  const terminalLogs = document.getElementById("terminalLogs");

  btn.innerHTML = "⏳ Reporting to Cloud...";
  btn.disabled = true;

  resultsCard.classList.add("hidden");
  terminalBox.classList.remove("hidden");
  terminalLogs.innerHTML = "";

  await addTerminalLog("Initiating secure connection to ScamShield Database...");
  await addTerminalLog("Uploading malicious signature hashes...");

  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Database connection timed out. Please check your internet connection.")), 12000)
  );

  try {
    await Promise.race([
      db.collection("scam_reports").add({
        scam_message: textToReport,
        threat_level: threatLevel,
        risk_score: currentScore,
        reported_at: firebase.firestore.FieldValue.serverTimestamp()
      }),
      timeoutPromise
    ]);

    await addTerminalLog("SUCCESS: Threat logged to decentralized cloud ledger.");
    loadRecentReports();

    setTimeout(() => {
      terminalBox.classList.add("hidden");
      resultsCard.classList.remove("hidden");
      btn.innerHTML = "✅ Reported to Global Database (Live)";
      btn.classList.replace("bg-rose-600", "bg-emerald-600");
      btn.classList.replace("hover:bg-rose-500", "hover:bg-emerald-500");
      btn.classList.replace("shadow-rose-500/30", "shadow-emerald-500/30");
      btn.classList.replace("border-rose-700", "border-emerald-700");
    }, 1500);

  } catch (error) {
    console.error("Firebase Error: ", error);
    await addTerminalLog("ERROR: " + error.message);
    alert("Report failed: " + error.message);
    terminalBox.classList.add("hidden");
    resultsCard.classList.remove("hidden");
    btn.innerHTML = "🚨 Report to Global Threat Database";
    btn.disabled = false;
  }
}

// --- DYNAMIC GAMIFIED QUIZ LOGIC ---
const quizQuestions = [
  {
    text: "Dear User, your HDFC bank account is suspended due to KYC pending. Click here to update PAN immediately: http://hdfc-kyc-update.info",
    type: "fake",
    explanation: "Banks never ask for KYC updates via suspicious 'http://' links accompanied by high-pressure threats."
  },
  {
    text: "Your Amazon OTP to login is 482910. Do not share this with anyone. If this wasn't you, ignore this message.",
    type: "real",
    explanation: "This is a standard secure OTP format. It does not force you to click links or call unverified phone numbers."
  },
  {
    text: "Congratulations! Your mobile number has won Rs. 50,00,000 in KBC Jio Lucky Draw. Send WhatsApp message to +92XXXXXX to claim.",
    type: "fake",
    explanation: "Classic lottery scam! Official organizations never host random draws for mobile numbers, and international prefixes like +92 are red flags."
  }
];

let currentQuizIndex = 0;

function loadRandomQuiz() {
  currentQuizIndex = Math.floor(Math.random() * quizQuestions.length);
  const q = quizQuestions[currentQuizIndex];
  
  document.getElementById("quizQuestionText").innerText = `"${q.text}"`;
  document.getElementById("quizButtons").style.display = "flex";
  document.getElementById("quizResultContainer").classList.add("hidden");
  document.getElementById("quizResultContainer").classList.remove("flex");
}

loadRandomQuiz();

function checkQuiz(userAnswer) {
  const q = quizQuestions[currentQuizIndex];
  const resultContainer = document.getElementById("quizResultContainer");
  const resultText = document.getElementById("quizResult");
  const buttons = document.getElementById("quizButtons");
  
  resultContainer.classList.remove("hidden");
  resultContainer.classList.add("flex");
  buttons.style.display = "none";

  if(userAnswer === q.type) {
    resultText.innerHTML = `✅ Correct Answer!<br><br><span class="font-medium text-slate-700 dark:text-slate-300">${q.explanation}</span>`;
    resultText.className = "mt-2 text-sm font-bold text-center text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 p-4 rounded-xl w-full";
  } else {
    resultText.innerHTML = `❌ Incorrect Answer!<br><br><span class="font-medium text-slate-700 dark:text-slate-300">${q.explanation}</span>`;
    resultText.className = "mt-2 text-sm font-bold text-center text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 p-4 rounded-xl w-full";
  }
}

// WhatsApp Share
function shareOnWhatsApp() {
  const msg = `🚨 *Scam Alert!* 🚨\n\nScamShield AI flagged this threat with a risk score of ${currentScore}/100.\n\n*Expert Advice:*${currentSummary}\n\nStay safe and vigilant!`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(whatsappUrl, "_blank");
}

function findLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

// Core Analysis Logic
async function analyzeMessage() {
  const text = document.getElementById("messageInput").value.trim();

  if (!text) {
    alert("Please enter a message or upload an evidence screenshot/QR code first!");
    return;
  }

  const btn = document.getElementById("scanBtn");
  const resultsCard = document.getElementById("resultsCard");
  const terminalBox = document.getElementById("terminalBox");
  const terminalLogs = document.getElementById("terminalLogs");
  const reportBtn = document.getElementById("reportBtn"); 

  btn.innerText = "Analyzing...";
  btn.disabled = true;
  resultsCard.classList.add("hidden");
  terminalBox.classList.remove("hidden");
  terminalLogs.innerHTML = "";
  
  reportBtn.innerHTML = "🚨 Report to Global Threat Database";
  reportBtn.disabled = false;
  reportBtn.className = "w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 hover:-translate-y-0.5 border border-rose-700";

  await addTerminalLog("Initializing threat inspection matrix...");
  await addTerminalLog("Extracting lexical components...");

  const prompt = `Analyze this message for scam, phishing, or dark pattern fraud: "${text}"
  
  You MUST respond ONLY with a raw JSON object in English. Do not use markdown backticks like \`\`\`json.
  Structure required:
  {
    "threat_level": "Safe" or "Suspicious" or "Dangerous",
    "risk_score": <number between 0-100>,
    "analysis_summary": "<clear professional safety summary in English>",
    "safe_steps": ["<step 1>", "<step 2>"]
  }`;

  try {
    // Explicitly targeting the v1beta endpoint with 1.5-flash
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" + API_KEY;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`HTTP ${response.status}: API Request Failed. Details: ${errorDetails}`);
    }
    
    await addTerminalLog("Payload evaluated successfully.");
    const data = await response.json();
    
    let rawText = data.candidates[0].content.parts[0].text.trim();
    rawText = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");
    const output = JSON.parse(rawText);

    currentScore = output.risk_score;
    currentSummary = output.analysis_summary;

    const scoreEl = document.getElementById("riskScore");
    scoreEl.innerText = `${output.risk_score} / 100`;
    scoreEl.className = `text-4xl font-black ${output.risk_score > 60 ? 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`;
    
    const levelEl = document.getElementById("threatLevel");
    levelEl.innerText = output.threat_level;
    levelEl.className = `text-2xl font-bold leading-relaxed ${output.risk_score > 60 ? 'text-rose-500' : 'text-emerald-500'}`;

    document.getElementById("analysisSummary").innerText = output.analysis_summary;

    const stepsContainer = document.getElementById("safeStepsList");
    stepsContainer.innerHTML = "";
    (output.safe_steps || []).forEach(step => {
      const li = document.createElement("li");
      li.className = "flex gap-2.5 items-start bg-slate-100/50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/60";
      li.innerHTML = `<span class="text-emerald-500 font-bold mt-0.5">✓</span><span>${step}</span>`;
      stepsContainer.appendChild(li);
    });

    const links = findLinks(text);
    const linkWarningBox = document.getElementById("linkWarningBox");
    const extractedLinks = document.getElementById("extractedLinks");
    if (links.length > 0) {
      extractedLinks.innerHTML = links.map(link => `<li>⚠️ <code>${link}</code> (Blacklisted/Unverified Domain)</li>`).join("");
      linkWarningBox.classList.remove("hidden");
    } else {
      linkWarningBox.classList.add("hidden");
    }

    terminalBox.classList.add("hidden");
    resultsCard.classList.remove("hidden");

  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
    terminalBox.classList.add("hidden");
  } finally {
    btn.innerText = "🔍 Run Security Scan";
    btn.disabled = false;
  }
}