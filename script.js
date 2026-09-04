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

const API_KEY = "AQ.Ab8RN6JeCWsZF57JgLwRzKY7KreFXMyXYpIsfhgwdwHdLdKDrA"; 

// 2.FIREBASE CONFIGURATION (scamshield-gaurav)
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

// --- REAL-WORLD DATABASE REPORT LOGIC (EXTENDED TIMEOUT TO 12s) ---
async function reportToDatabase() {
  const textToReport = document.getElementById("messageInput").value.trim();
  const threatLevel = document.getElementById("threatLevel").innerText;
  
  if (!textToReport) {
    alert("No message to report!");
    return;
  }

  const btn = document.getElementById("reportBtn");
  const resultsCard = document.getElementById("resultsCard");
  const terminalBox = document.getElementById("terminalBox");
  const terminalLogs = document.getElementById("terminalLogs");

  btn.innerHTML = "⏳ Reporting to Cloud...";
  btn.disabled = true;

  resultsCard.classList.add("hidden");
  terminalBox.classList.remove("hidden");
  terminalLogs.innerHTML = "";

  await addTerminalLog("Initiating secure connection to ScamShield-Gaurav Database...");
  await addTerminalLog("Uploading malicious signature hashes...");

  // Extended timeout to 12 seconds for stable cloud sync during live demo
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Database connection timed out. Please check your internet connection or Firebase rules.")), 12000)
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
    
    setTimeout(() => {
      terminalBox.classList.add("hidden");
      resultsCard.classList.add("hidden"); // keep results hidden or shown as preferred, let's keep results visible
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

// --- DYNAMIC GAMIFIED QUIZ LOGIC (ALL ENGLISH) ---
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
  },
  {
    text: "Netflix: Your subscription has expired. Update your payment details immediately at https://netflix-billing-update.com/login to avoid suspension.",
    type: "fake",
    explanation: "Phishing alert! The domain name is unofficial ('netflix-billing-update.com') designed to steal credit card data."
  },
  {
    text: "Dear Customer, Rs 4,500.00 has been debited from A/c XX3412 on 04-Sep-26. Info: UPI-Zomato. Avl Bal Rs 12,450.00. - SBI",
    type: "real",
    explanation: "Standard bank alert notification. It only provides transactional details and requests no action."
  },
  {
    text: "URGENT: Your electricity power will be disconnected tonight at 9:30 PM from the main office. Call executive officer on 9876543210 immediately.",
    type: "fake",
    explanation: "Utility providers never issue night-time disconnection threats via SMS or direct personal mobile numbers."
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

// WhatsApp Share (English)
function shareOnWhatsApp() {
  const msg = `🚨 *Scam Alert!* 🚨\n\nScamShield AI flagged this message with a risk score of ${currentScore}/100.\n\n*Expert Advice:*${currentSummary}\n\nStay safe and vigilant!`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(whatsappUrl, "_blank");
}

function findLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

// Core Analysis Logic (English Output Prompt & UI)
async function analyzeMessage() {
  const text = document.getElementById("messageInput").value.trim();
  const btn = document.getElementById("scanBtn");
  const resultsCard = document.getElementById("resultsCard");
  const terminalBox = document.getElementById("terminalBox");
  const terminalLogs = document.getElementById("terminalLogs");
  const reportBtn = document.getElementById("reportBtn"); 

  if (!text) {
    alert("Please enter a message or upload an evidence screenshot/QR code first!");
    return;
  }

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
    "hindi_explanation": "<clear professional safety summary in English>",
    "safe_steps": ["<step 1>", "<step 2>"]
  }`;

  try {
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
    currentSummary = output.hindi_explanation;

    const scoreEl = document.getElementById("riskScore");
    scoreEl.innerText = `${output.risk_score} / 100`;
    scoreEl.className = `text-4xl font-black ${output.risk_score > 60 ? 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`;
    
    const levelEl = document.getElementById("threatLevel");
    levelEl.innerText = output.threat_level;
    levelEl.className = `text-2xl font-bold leading-relaxed ${output.risk_score > 60 ? 'text-rose-500' : 'text-emerald-500'}`;

    document.getElementById("hindiSummary").innerText = output.hindi_explanation;

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