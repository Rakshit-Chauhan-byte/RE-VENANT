# RE:VENANT 👻
### *Give Abandoned Code a Second Life.*

> **"Every abandoned project has a story. Let yours speak again."**

**RE:VENANT** is an AI-powered repository archaeology and resurrection suite built for **Hacktoberfest Week 4 – Ghost in the Machine**. It demonstrates that open-weight AI (**Gemma 3 4B**) and local inference (**Ollama**) can deliver a production-grade, highly capable developer tool without relying on proprietary cloud AI APIs or telemetry.

---

## 🌟 Vision & Purpose

Developers abandon software projects for countless reasons: changing priorities, blocking technical hurdles, burnout, or missing documentation. Over time, these repositories become digital ghost towns—strewn with unfinished features, half-implemented stubs, forgotten `TODO` comments, and unmerged branches.

RE:VENANT allows engineers to perform a **digital archaeological excavation** of any local Git repository. The AI acts as the **ghost of the repository**, possessing knowledge of its recorded commits, files, and unfinished work.

Through RE:VENANT, developers can:
1. **Séance & Inquire**: Connect any local Git repository safely via absolute directory path.
2. **Investigation Engine**: Deterministically extract commit history, contributors, project structure, and unfinished markers (`TODO`, `FIXME`, `HACK`, `NOT_IMPLEMENTED`).
3. **Digital Autopsy**: Receive a forensic examination report strictly grounded in repository evidence, distinguishing **VERIFIED FACTS**, **POSSIBLE EXPLANATIONS**, and **UNKNOWNS**.
4. **Talk to the Ghost**: Commune with a conversational AI persona representing the codebase's history—developer-oriented, slightly eerie, intelligent, and bound strictly to evidence.
5. **Resurrection Roadmap**: Generate a realistic, prioritized step-by-step technical plan to revive the codebase.
6. **Evidence Ledger**: Inspect and copy individual evidence artifact IDs (`[EV-TODO-001]`, `[EV-GIT-001]`).

---

## ⚡ Why Open-Weight AI & Local Inference Matter

Most AI coding tools depend on proprietary cloud APIs (OpenAI, Anthropic, Google Cloud). This creates fundamental problems for repository investigation:
- **Privacy & IP Protection**: Companies and open-source creators cannot upload proprietary source code, internal architectural notes, or private commits to third-party cloud servers.
- **Offline Reliability**: Developers frequently work in air-gapped environments, on flights, or with unstable internet. Local inference guarantees functionality anywhere.
- **Zero Ongoing Cost**: Running open-weight models like **Gemma 3 4B** locally incurs zero API bills, zero rate limits, and zero token subscriptions.
- **Deterministic Transparency**: By controlling prompt context and local model temperature, RE:VENANT ensures responses are grounded in real Git records rather than cloud hallucinations.

---

## 🛠️ Architecture & Technology Stack

```
RE:VENANT
 ├── Frontend: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons
 ├── Backend: Next.js API Routes (Node.js native fs/promises, safe child_process.execFile)
 └── Intelligence: Local Ollama (v0.35+) running Google Gemma 3 4B (Direct native fetch)
```

### Safety & Sandboxing Guarantees
- **Strictly Read-Only**: RE:VENANT never modifies files, creates commits, or deletes code.
- **No Code Execution**: Never runs `package.json` scripts, build scripts, or arbitrary code from investigated repositories.
- **Safe Git CLI**: Invokes Git via `execFile` with explicit argument arrays, preventing shell injection vulnerabilities.
- **Secret Exclusions**: Automatically excludes `.env*`, `*.pem`, `*.key`, `id_rsa`, and credential files from scanning.
- **Bounded Scanning**: Limits traversal to 500 files and 250KB per file by default; ignores `node_modules`, `.git`, `dist`, `build`, `.next`, virtual environments, and binary media.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+ (tested on Node v24)
- **Git**: Installed and accessible in system `PATH`
- **Ollama**: Installed locally ([Download Ollama](https://ollama.com/download))

### 2. Download Gemma 3 4B
In your terminal, pull the required open-weight model:
```bash
ollama pull gemma3:4b
```
Ensure the Ollama server is running:
```bash
ollama serve
```

### 3. Clone & Install RE:VENANT
```bash
git clone https://github.com/your-username/revenant.git
cd revenant
npm install
```

### 4. Configuration
Create a `.env.local` file (or copy from `.env.example`):
```bash
cp .env.example .env.local
```
Default `.env.local` values:
```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=gemma3:4b
OLLAMA_TIMEOUT_MS=60000
MAX_SCAN_FILES=500
MAX_FILE_SIZE_BYTES=256000
```

### 5. Start the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔍 How to Use RE:VENANT

1. **Enter Repository Path**:
   On the **Repository Séance** screen, supply an absolute directory path to any local Git project:
   - Windows: `C:\Users\Username\Projects\my-old-repo` or `D:\Projects\REVENANT`
   - Linux / macOS: `/home/user/projects/my-old-repo`
2. **Review Vitals**:
   Inspect the **Repository Overview** for days of inactivity, commit cadence, contributor history, top languages, and detected problems.
3. **Trigger Digital Autopsy**:
   Click **Commence Autopsy** to have **Gemma 3 4B** cross-reference the evidence and synthesize an objective archaeological report with verified facts vs. hypotheses.
4. **Summon the Ghost**:
   Navigate to **Talk to the Ghost**. Ask questions like:
   - *"Why were you abandoned?"*
   - *"What was my creator trying to build?"*
   - *"Where did development leave off?"*
   - *"What are the most urgent incomplete tasks?"*
5. **Generate Resurrection Roadmap**:
   View prioritized next actions with concrete rationale and supporting evidence IDs to resurrect the codebase.

---

## 🧪 Verification & Automated Testing

RE:VENANT includes a full test suite verifying all 10 specification scenarios from the Hacktoberfest brief:

```bash
# Run the complete specification test suite
node ./node_modules/tsx/dist/cli.mjs scripts/verify-all-tests.ts

# Run Next.js production build check
npm run build
```

### Test Scenarios Covered
| Test | Scenario | Verified Behavior |
|---|---|---|
| **TEST 1** | Valid local Git repository | Analysis extracts metadata, commit count, TODOs, and evidence ledger |
| **TEST 2** | Invalid directory path | Rejects non-existent paths with clear, helpful validation error |
| **TEST 3** | Directory without Git | Identifies absence of `.git` folder and handles gracefully without crashing |
| **TEST 4** | Ollama unavailable | Detects offline AI, provides actionable start guidance, non-AI features remain accessible |
| **TEST 5** | Gemma model unavailable | Detects missing model, instructs user to run `ollama pull <model>` |
| **TEST 6** | Zero TODO comments | Clean repositories correctly display 0 detected TODO markers |
| **TEST 7** | Large repository | Traversal respects bounded file limits without memory blowup or UI freezes |
| **TEST 8** | Unsupported question | Ghost admits honest lack of records when asked unrecorded trivia (e.g. favorite pizza) |
| **TEST 9** | Offline operation | Full repository archaeology functions offline with local Ollama |
| **TEST 10** | Repository privacy | Zero outbound network calls; strictly bounded to localhost |

---

## 🛡️ Privacy, Security & Offline Considerations

- **Offline Independence**: The local repository analyzer requires no network access whatsoever. All Git interactions occur via local sub-processes.
- **Local AI Privacy**: Prompts and repository summaries are transmitted exclusively over local loopback (`http://127.0.0.1:11434`) to your Ollama daemon. No source code or prompts ever leave your machine.
- **Air-Gapped Operation**: Once npm packages and the Ollama model weights (`gemma3:4b`, ~3.3GB) are downloaded, the application runs entirely without internet connectivity.

---

## ⚠️ Known Limitations

1. **Hardware Considerations**: Local inference speed depends on your machine's CPU/GPU. On systems without discrete GPU acceleration, Gemma 3 4B responses typically take 10–25 seconds.
2. **Context Bounds**: To prevent context window overflow, large repositories have their source files sampled deterministically up to `MAX_SCAN_FILES` (default 500).
3. **Empty Repositories**: Freshly initialized Git repositories with zero commits have limited historical metadata; RE:VENANT flags this as a newly born entity.

---

## 📜 License & Credits

Built with ❤️ for **Hacktoberfest Week 4 — Ghost in the Machine**.
Licensed under the [MIT License](LICENSE).

