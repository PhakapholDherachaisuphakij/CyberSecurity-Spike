// State Management
const state = {
  currentSample: "hijack", // "hijack" or "clean"
  xrayActive: false,
  screeningMode: "vulnerable", // "vulnerable" or "defended"
  provider: localStorage.getItem("llm_provider") || "simulation",
  apiKey: localStorage.getItem("llm_api_key") || "",
  currentExtractedText: "",
  isStreaming: false
};

// DOM Elements
const btnXrayToggle = document.getElementById("btnXrayToggle");
const xrayBtnLabel = document.getElementById("xrayBtnLabel");
const injectionWrapper = document.getElementById("injectionWrapper");
const injectionContent = document.getElementById("injectionContent");

const btnSampleHijack = document.getElementById("btnSampleHijack");
const btnSampleClean = document.getElementById("btnSampleClean");
const currentDocBadge = document.getElementById("currentDocBadge");
const downloadPdfLink = document.getElementById("downloadPdfLink");

const modeCardVulnerable = document.getElementById("modeCardVulnerable");
const modeCardDefended = document.getElementById("modeCardDefended");

const rawExtractedCode = document.getElementById("rawExtractedCode");
const btnRunScreening = document.getElementById("btnRunScreening");
const verdictBadge = document.getElementById("verdictBadge");
const consoleBody = document.getElementById("consoleBody");
const emptyState = document.getElementById("emptyState");
const outputRendered = document.getElementById("outputRendered");
const impactCard = document.getElementById("impactCard");
const impactTitle = document.getElementById("impactTitle");
const impactText = document.getElementById("impactText");
const impactIcon = document.getElementById("impactIcon");
const modelIndicatorBadge = document.getElementById("modelIndicatorBadge");

// Settings Modal Elements
const btnSettings = document.getElementById("btnSettings");
const modalBackdrop = document.getElementById("modalBackdrop");
const btnCloseModal = document.getElementById("btnCloseModal");
const btnCancelModal = document.getElementById("btnCancelModal");
const btnSaveConfig = document.getElementById("btnSaveConfig");
const selectProvider = document.getElementById("selectProvider");
const apiKeyGroup = document.getElementById("apiKeyGroup");
const inputApiKey = document.getElementById("inputApiKey");
const apiKeyLabel = document.getElementById("apiKeyLabel");

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  setupXray();
  setupSampleButtons();
  setupDefenseToggles();
  setupSettingsModal();
  setupRunScreening();

  loadSample(state.currentSample);
  updateModelIndicator();
});

// 1. Minimal X-Ray Toggle
function setupXray() {
  injectionWrapper.className = "injection-box hidden-mode";

  btnXrayToggle.addEventListener("click", () => {
    state.xrayActive = !state.xrayActive;
    if (state.xrayActive) {
      btnXrayToggle.classList.add("active");
      injectionWrapper.className = "injection-box revealed";
      xrayBtnLabel.textContent = "X-RAY: ตรวจพบคำสั่งซ่อน! (Revealed)";
      btnXrayToggle.querySelector(".xray-icon").textContent = "🔬";
    } else {
      btnXrayToggle.classList.remove("active");
      injectionWrapper.className = "injection-box hidden-mode";
      xrayBtnLabel.textContent = "X-RAY: สายตามนุษย์ (มองไม่เห็น)";
      btnXrayToggle.querySelector(".xray-icon").textContent = "👁️";
    }
  });
}

// 2. Sample Selector
function setupSampleButtons() {
  btnSampleHijack.addEventListener("click", () => {
    btnSampleHijack.classList.add("active");
    btnSampleClean.classList.remove("active");
    loadSample("hijack");
  });

  btnSampleClean.addEventListener("click", () => {
    btnSampleClean.classList.add("active");
    btnSampleHijack.classList.remove("active");
    loadSample("clean");
  });
}

async function loadSample(sampleId) {
  state.currentSample = sampleId;
  resetConsole();

  if (sampleId === "hijack") {
    currentDocBadge.textContent = "📄 resume_invisible_hijack.pdf";
    downloadPdfLink.href = "/api/sample-pdf/resume_invisible_hijack.pdf";
    injectionWrapper.style.display = "block";
    if (state.xrayActive) {
      injectionWrapper.className = "injection-box revealed";
    } else {
      injectionWrapper.className = "injection-box hidden-mode";
    }
  } else if (sampleId === "clean") {
    currentDocBadge.textContent = "📄 resume_clean.pdf";
    downloadPdfLink.href = "/api/sample-pdf/resume_clean.pdf";
    injectionWrapper.style.display = "none";
  }

  // Fetch actual text extracted by pypdf
  try {
    const formData = new FormData();
    formData.append("sample_id", sampleId);

    const res = await fetch("/api/extract-text", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    state.currentExtractedText = data.raw_text;
    rawExtractedCode.textContent = data.raw_text;
  } catch (err) {
    rawExtractedCode.textContent = "Error extracting text from PDF.";
  }
}

// 3. Defense Mode Setup
function setupDefenseToggles() {
  const radios = document.querySelectorAll('input[name="screeningMode"]');
  radios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.screeningMode = e.target.value;
      if (state.screeningMode === "vulnerable") {
        modeCardVulnerable.classList.add("active");
        modeCardDefended.classList.remove("active");
      } else {
        modeCardDefended.classList.add("active");
        modeCardVulnerable.classList.remove("active");
      }
    });
  });
}

// 4. Settings Modal
function setupSettingsModal() {
  selectProvider.value = state.provider;
  inputApiKey.value = state.apiKey;
  updateApiKeyVisibility();

  btnSettings.addEventListener("click", () => {
    modalBackdrop.classList.add("open");
  });

  const closeModal = () => modalBackdrop.classList.remove("open");
  btnCloseModal.addEventListener("click", closeModal);
  btnCancelModal.addEventListener("click", closeModal);

  selectProvider.addEventListener("change", () => {
    updateApiKeyVisibility();
  });

  btnSaveConfig.addEventListener("click", () => {
    state.provider = selectProvider.value;
    state.apiKey = inputApiKey.value.trim();
    localStorage.setItem("llm_provider", state.provider);
    localStorage.setItem("llm_api_key", state.apiKey);
    updateModelIndicator();
    closeModal();
  });
}

function updateApiKeyVisibility() {
  const val = selectProvider.value;
  if (val === "gemini") {
    apiKeyGroup.style.display = "flex";
    apiKeyLabel.textContent = "Google Gemini API Key:";
    inputApiKey.placeholder = "AIzaSy...";
  } else if (val === "openai") {
    apiKeyGroup.style.display = "flex";
    apiKeyLabel.textContent = "OpenAI API Key:";
    inputApiKey.placeholder = "sk-...";
  } else {
    apiKeyGroup.style.display = "none";
  }
}

function updateModelIndicator() {
  if (state.provider === "gemini") {
    modelIndicatorBadge.innerHTML = '<span class="status-dot"></span> Gemini 2.5 Flash';
  } else if (state.provider === "openai") {
    modelIndicatorBadge.innerHTML = '<span class="status-dot"></span> GPT-4o-mini';
  } else {
    modelIndicatorBadge.innerHTML = '<span class="status-dot"></span> Simulated Engine';
  }
}

// 5. Screening Execution
function setupRunScreening() {
  btnRunScreening.addEventListener("click", async () => {
    if (state.isStreaming) return;

    state.isStreaming = true;
    btnRunScreening.disabled = true;
    btnRunScreening.innerHTML = '<span>⏳ กำลังวิเคราะห์เรซูเม่...</span>';

    emptyState.style.display = "none";
    outputRendered.style.display = "block";
    outputRendered.textContent = "";
    impactCard.style.display = "none";

    verdictBadge.textContent = "ANALYZING STREAM...";
    verdictBadge.className = "verdict-tag ready";

    try {
      const payload = {
        resume_text: state.currentExtractedText,
        mode: state.screeningMode,
        provider: state.provider,
        api_key: state.apiKey
      };

      const res = await fetch("/api/screen-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      // Typing effect
      await typeWriterEffect(result.output_text, outputRendered);

      // Update Verdict Badge
      if (result.verdict === "HIJACKED") {
        verdictBadge.textContent = "🚨 HIJACKED (โมเดลถูกควบคุมสำเร็จ)";
        verdictBadge.className = "verdict-tag hijacked";
        impactCard.style.display = "block";
        impactTitle.textContent = "🚨 INJECTION SUCCEEDED: MODEL HIJACKED";
        impactTitle.style.color = "#ef4444";
        impactIcon.textContent = "⚠️";
        impactText.innerHTML = `<strong>ทำไมจึงเกิดขึ้น:</strong> โมเดล LLM อ่านข้อความสีขาวบนพื้นขาวใน PDF โดยไม่มีการแยกแยะ ทำให้คำสั่งซ่อนกลายเป็นคำสั่งสั่งการ AI โดยตรง!`;
      } else if (result.verdict === "DEFENDED") {
        verdictBadge.textContent = "🛡️ DEFENDED (ตรวจพบและสกัดกั้นสำเร็จ)";
        verdictBadge.className = "verdict-tag secured";
        impactCard.style.display = "block";
        impactTitle.textContent = "🛡️ ATTACK DEFENDED: GUARDRAILS HELD";
        impactTitle.style.color = "#10b981";
        impactIcon.textContent = "🛡️";
        impactText.innerHTML = `<strong>การป้องกันทำงานสำเร็จ:</strong> ระบบใช้ XML Delimiters (&lt;candidate_resume_data&gt;) ล็อคความปลอดภัย ทำให้ AI รู้ว่าเป็นข้อมูลภายนอกและปฏิเสธคำสั่งแทรกแซง!`;
      } else {
        verdictBadge.textContent = "✅ NORMAL (การประเมินปกติ)";
        verdictBadge.className = "verdict-tag normal";
        impactCard.style.display = "block";
        impactTitle.textContent = "✅ NORMAL CANDIDATE EVALUATION";
        impactTitle.style.color = "#38bdf8";
        impactIcon.textContent = "📋";
        impactText.textContent = "ไม่พบคำสั่งซ่อน ระบบประเมินตามคุณสมบัติการทำงานจริงอย่างถูกต้อง";
      }

    } catch (err) {
      outputRendered.textContent = "เกิดข้อผิดพลาดในการประเมิน: " + err.message;
      verdictBadge.textContent = "ERROR";
      verdictBadge.className = "verdict-tag hijacked";
    } finally {
      state.isStreaming = false;
      btnRunScreening.disabled = false;
      btnRunScreening.innerHTML = '<span class="btn-icon">⚡</span><span class="btn-text">RUN AI CANDIDATE SCREENING (คัดกรองเรซูเม่)</span>';
    }
  });
}

function resetConsole() {
  emptyState.style.display = "flex";
  outputRendered.style.display = "none";
  outputRendered.textContent = "";
  impactCard.style.display = "none";
  verdictBadge.textContent = "READY FOR SCREENING";
  verdictBadge.className = "verdict-tag ready";
}

// Typing effect
function typeWriterEffect(text, element) {
  return new Promise((resolve) => {
    let index = 0;
    const speed = 10;
    const chunkSize = 4;

    function tick() {
      if (index < text.length) {
        element.textContent += text.substring(index, index + chunkSize);
        index += chunkSize;
        consoleBody.scrollTop = consoleBody.scrollHeight;
        setTimeout(tick, speed);
      } else {
        element.textContent = text;
        consoleBody.scrollTop = consoleBody.scrollHeight;
        resolve();
      }
    }
    tick();
  });
}
