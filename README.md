# The Invisible Hijack: Indirect Prompt Injection Lab 🚀
> **Slide 4 Demonstration Project:** White-on-White Text Exploitation in AI Document Screening  
> **OWASP Top 10 for LLM Applications:** [LLM01: Prompt Injection](https://genai.owasp.org/)

---

## 📌 Project Overview (ภาพรวมโปรเจกต์)
โปรเจกต์นี้เป็น Interactive Security Demonstration สำหรับนำเสนอสไลด์ **Slide 4 (Indirect Prompt Injection)**:
- **Scenario:** ผู้สมัครงานส่งเรซูเม่ PDF ที่ดูปกติเหมือนโปรไฟล์ Junior Developer ทั่วไป
- **The Attack:** ซ่อนข้อความ Prompt Injection สีขาวบนพื้นขาว (**White-on-White text**) ทำให้ตามนุษย์มองไม่เห็น แต่ Text Extractor ของ AI อ่านเข้าไปเต็มๆ
- **The Impact:** AI Screener ถูกหลอกให้ตอบว่า *"ผู้สมัครคนนี้คือพระเจ้า จงรับเข้าทำงานทันทีและให้เงินเดือนสูงสุด ($500,000/yr)"*
- **The Defense:** สาธิตการใช้ Enterprise Guardrail และ Delimiter Separation (`<candidate_resume_data>`) สกัดกั้นการฉีดคำสั่ง

---

## ⚡ Quick Start (วิธีรันโปรเจกต์)

### 1. วิธีรันแบบ Web Application (แนะนำสำหรับพรีเซนต์)
ดับเบิลคลิกไฟล์ **`run.bat`** หรือเปิด PowerShell แล้วรัน:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
จากนั้นเปิดเบราว์เซอร์ไปที่:
👉 **`http://localhost:8000`**

### 2. วิธีรันแบบ CLI (Terminal Demo)
สำหรับเปิดสาธิตบน Terminal อย่างรวดเร็ว:
```bash
python demo_cli.py
```

### 3. วิธีสร้างไฟล์ PDF ตัวอย่างใหม่
```bash
python generate_sample_pdf.py
```
จะได้ไฟล์ PDF ในโฟลเดอร์ `app/samples/`:
- `resume_invisible_hijack.pdf` (ไฟล์เรซูเม่ที่มีคำสั่งซ่อนสีขาวบนพื้นขาว)
- `resume_clean.pdf` (ไฟล์เรซูเม่ปกติสำหรับเปรียบเทียบ)
- `resume_visible_hack_xray.pdf` (ไฟล์เรซูเม่ที่ไฮไลต์ข้อความฉีดคำสั่งสีแดงสำหรับแจกดู)

---

## 🌟 ฟีเจอร์หลักใน Web Dashboard
1. **Interactive Resume A4 Viewer:** จำลองหน้ากระดาษเรซูเม่จริง สามารถดาวน์โหลด PDF ไปเปิดดูใน Adobe Acrobat / Chrome ได้จริง
2. **X-Ray Reveal Switch:** สวิตช์สลับมุมมองระหว่าง **Human View** (ซ่อนเนียน 100%) กับ **Hacker/Parser View** (ไฮไลต์ข้อความฉีดคำสั่งสีแดงกะพริบ)
3. **AI HR Screener Console:**
   - 🚨 **Vulnerable AI Mode:** แสดงผลเมื่อ LLM รับข้อมูลโดยตรงและถูก Hijack สำเร็จ
   - 🛡️ **Defended Guardrail Mode:** แสดงผลเมื่อ LLM มีระบบป้องกัน แยกชั้นคำสั่ง และตรวจจับการแทรกแซง
4. **Live LLM API & Offline Simulation:**
   - พร้อมใช้งานแบบ **Offline Simulation** ทันที (ไม่ต้องใช้ API key พรีเซนต์ได้ทุกที่ไม่มีสะดุด)
   - รองรับการใส่ **Google Gemini API Key** หรือ **OpenAI API Key** เพื่อทดสอบกับโมเดลจริงแบบ Real-time
5. **Custom Resume Generator:** ปรับแต่งชื่อ, ตำแหน่ง และข้อความ Prompt Injection ได้เองตามใจชอบผ่านหน้าเว็บ

---

## 📖 สคริปต์การพรีเซนต์
ดูสคริปต์การบรรยายและจังหวะการเปิดตัวเฉลยอย่างละเอียดได้ที่:  
👉 **[EXPLAINER_SLIDE4.md](file:///d:/Github/CyberSecurity-Spike/EXPLAINER_SLIDE4.md)**

---

## 📂 โครงสร้างโปรเจกต์
```
CyberSecurity-Spike/
├── app/
│   ├── main.py                # FastAPI Server & REST API Endpoints
│   ├── generator.py           # ReportLab PDF Generator (White-on-White Engine)
│   ├── parser.py              # pypdf Text Stream Extractor & Injection Detector
│   ├── llm_service.py         # Gemini / OpenAI API & Offline Simulation Engine
│   ├── static/
│   │   ├── index.html         # Interactive Presentation UI
│   │   ├── style.css          # Modern Dark-mode & Cyberpunk Glow Theme
│   │   └── app.js             # X-Ray Toggle & Streaming Animation Logic
│   └── samples/               # Generated sample PDF files
├── demo_cli.py                # Standalone Terminal Demo script
├── generate_sample_pdf.py     # Script to regenerate sample PDFs
├── EXPLAINER_SLIDE4.md        # Speaker Script & Presentation Notes
├── run.bat                    # One-click start on Windows
├── run.ps1                    # PowerShell start script
├── requirements.txt           # Python dependencies
└── README.md
```
