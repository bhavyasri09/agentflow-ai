# AgentFlow AI — Automated AI Training Data Generator
> **From Web Research to AI-Ready Training Data**
> **Hackathon Track:** Coding and Agentic Engineering
> **Powered by:** Nebius Token Factory & NVIDIA Open Source Models (`nvidia/Llama-3.1-Nemotron-70B-Instruct`)
> **License:** Apache License 2.0 (Open Source)

AgentFlow AI automates the end-to-end pipeline of generating high-quality supervised fine-tuning (SFT) datasets, instruction-tuning pairs, and evaluation benchmarks from web research.

---

## 1. Project Overview & Features

When training or fine-tuning Large Language Models, high-quality, grounded instruction data is critical to mitigate hallucinations and ensure domain expertise. AgentFlow AI solves this by coordinating research, synthesis, automated evaluation, cleaning, and export in a single workflow:

- **A. Grounded Web Research**: Connects with the **Tavily Search API** to fetch real-world papers, documentation, and articles. If API keys are not supplied, runs in **Grounded Demo Mode** referencing verified technical corpora (e.g., arXiv, NIST, IEEE).
- **B. Model Synthesis via Nebius Token Factory & NVIDIA Open Source Model**:
  - Connects with **Nebius Token Factory** (`https://api.nebius.ai/v1/chat/completions`) using OpenAI-compatible SDK/HTTP format.
  - Powered primarily by **`nvidia/Llama-3.1-Nemotron-70B-Instruct`** — NVIDIA's premier open-source model tailored for high-accuracy reasoning, instruction following, and synthetic dataset generation.
  - Also supports `nvidia/Llama-3.1-Nemotron-70B-Reward` for automated quality scoring, alongside `meta-llama/Llama-3.3-70B-Instruct` and `Qwen/Qwen2.5-72B-Instruct`.
- **C. 5-Dimensional Quality Evaluation**:
  - *Topical Relevance (1–5)*: Lexical and semantic match with the target domain.
  - *Answer Completeness (1–5)*: Structural depth, token measure, and explanatory markers.
  - *Source Consistency (1–5)*: N-gram alignment against retrieved source excerpts.
  - *Linguistic Clarity (1–5)*: Proper punctuation, capitalization, sentence cadence, and absence of run-on text.
  - *Duplicate Detection*: Jaccard token overlap to catch repetitive question-answer pairs.
- **D. Automated Data Cleaning**:
  - Strips exact and near-duplicate questions.
  - Normalizes whitespace and line endings.
  - Rejects malformed or incomplete records.
  - Filters records below the user-configurable acceptance threshold (default $\ge 3.5$).
- **E. Interactive Dataset Preview & Editing**:
  - Filter across Accepted, Rejected, and All records.
  - Search by keyword or filter by difficulty.
  - Inline question and answer editing with instant save.
  - Inspect full 5-point evaluation score cards.
  - Add custom verified training pairs manually.
- **F. Production Export**:
  - **JSONL (JSON Lines)**: Standard format for Hugging Face datasets, OpenAI fine-tuning, and Axolotl.
  - **CSV (RFC 4180)**: Escaped format for spreadsheets and Pandas dataframes.
  - One-click file download and clipboard copy with live format previews.

---

## 2. Architecture & Workflow

```
[User Topic Input & Settings]
              │
              ▼
    [1. Web Research] ───────► (Tavily Search API or Grounded Corpus)
              │
              ▼
    [2. AI Generation] ──────► (Nebius Token Factory: nvidia/Llama-3.1-Nemotron-70B-Instruct)
              │
              ▼
    [3. Quality Evaluator] ──► (5-Metric Scoring + Heuristic Breakdown)
              │
              ▼
    [4. Data Cleaner] ───────► (Deduplication, Whitespace, Threshold Filter)
              │
              ▼
    [5. Interactive Preview] ─► (Inline Edits, Custom Pairs, Inspect Modal)
              │
              ▼
    [6. Export] ─────────────► (JSONL / CSV / Clipboard)
```

---

## 3. Prerequisites

- **macOS** (Apple Silicon or Intel)
- **Python 3.10+** (verify with `python3 --version`)
- **VS Code** with the Python extension installed
- **Node.js 18+** & **npm** (for running the React web applet)

---

## 4. Step-by-Step Setup on macOS & VS Code

### Step 1: Open Terminal in VS Code
Open VS Code, press `` Ctrl + ` `` or `Cmd + Shift + P` and select `View: Toggle Terminal`.

### Step 2: Navigate to Project Directory
```bash
cd agentflow_python
```

### Step 3: Create and Activate a Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 4: Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 5: Configure Environment Variables
Copy the example environment file and add your API keys:
```bash
cp .env.example .env
```

Open `.env` in VS Code and supply your credentials:
```env
# Tavily Search API Key (Free tier at https://tavily.com)
TAVILY_API_KEY="tvly-your-tavily-api-key"

# Nebius AI API Key (from https://nebius.com)
NEBIUS_API_KEY="v1.neb-your-nebius-api-key"

# Default Nebius Model (NVIDIA Open Source Model)
NEBIUS_MODEL="nvidia/Llama-3.1-Nemotron-70B-Instruct"
```

*Note: If you leave the keys empty, AgentFlow AI automatically runs in **Grounded Demo Mode** with complete offline mock data.*

### Step 6: Launch the Streamlit App
```bash
streamlit run app.py
```
Streamlit will automatically open your default browser at `http://localhost:8501`.

---

## 5. Running the React Web Application (AI Studio)

AgentFlow AI is also built as a modern, interactive React/Vite single-page application:

```bash
# In the root repository:
npm install
npm run build
npm run dev
```
Visit `http://localhost:3000` to interact with the responsive React interface.

---

## 6. How to Run Automated Tests

The testing suite covers JSON parsing, duplicate detection, malformed field handling, quality-threshold filtering, and export serialization:

```bash
python3 -m unittest -v test_agentflow.py
```

Expected output:
```
test_csv_export_format (test_agentflow.TestAgentFlow) ... ok
test_duplicate_removal (test_agentflow.TestAgentFlow) ... ok
test_jsonl_export_format (test_agentflow.TestAgentFlow) ... ok
test_missing_or_malformed_fields (test_agentflow.TestAgentFlow) ... ok
test_normalize_whitespace (test_agentflow.TestAgentFlow) ... ok
test_parse_model_json_resilience (test_agentflow.TestAgentFlow) ... ok
test_quality_threshold_filtering (test_agentflow.TestAgentFlow) ... ok

----------------------------------------------------------------------
Ran 7 tests in 0.002s
OK
```

---

## 7. Example Output

### JSONL Format (`agentflow_dataset.jsonl`)
```json
{"id":"af-001","topic":"Retrieval-Augmented Generation (RAG) Evaluation","difficulty":"Intermediate","question":"How do hybrid retrieval and reranking mechanisms enhance accuracy in RAG?","answer":"In RAG pipelines, hybrid retrieval integrates dense semantic embeddings with sparse BM25 keyword matching. A cross-encoder reranking stage scores candidate passages based on joint token interaction, filtering out spurious semantic matches and preserving factual alignment.","source_url":"https://arxiv.org/abs/2005.11401","quality_score":4.5}
{"id":"af-002","topic":"Retrieval-Augmented Generation (RAG) Evaluation","difficulty":"Intermediate","question":"How can catastrophic hallucinations be systematically audited in RAG architectures?","answer":"Mitigation relies on ground-truth anchoring, reference citation validation, strict temperature constraints (≤0.2), and multi-turn rejection sampling where generated statements are validated against source indices.","source_url":"https://docs.ragas.io/en/stable/concepts/metrics/","quality_score":4.4}
```

### CSV Format (`agentflow_dataset.csv`)
```csv
id,topic,difficulty,question,answer,quality_score,source_url
"af-001","Retrieval-Augmented Generation (RAG) Evaluation","Intermediate","How do hybrid retrieval and reranking mechanisms enhance accuracy in RAG?","In RAG pipelines, hybrid retrieval integrates dense semantic embeddings with sparse BM25 keyword matching.","4.5","https://arxiv.org/abs/2005.11401"
```

---

## 8. Current Limitations & Safety Boundary

1. **Automated vs. Human Verification**: Quality scores are generated via algorithmic heuristics (lexical density, syntactic length, n-gram overlap, and source grounding). They do not constitute guaranteed subject-matter certification. Critical enterprise datasets should undergo human-in-the-loop review.
2. **Context Window Limits**: When providing numerous lengthy web sources, context chunking or selective passage retrieval is applied to prevent exceeding model input tokens.
3. **External API Availability**: If Tavily or Nebius AI encounters network latency or quota limits, AgentFlow AI gracefully falls back to grounded reference datasets without failing the user session.

---

## 9. Hackathon Submission Compliance & Checklist

- [x] **Nebius Token Factory & NVIDIA Open Source Model**: Runs on Nebius Token Factory with `nvidia/Llama-3.1-Nemotron-70B-Instruct` as primary generative engine.
- [x] **Track**: **Coding and Agentic Engineering** (Autonomous end-to-end multi-agent dataset engineering).
- [x] **Visible Open-Source License**: Apache License 2.0 (see `LICENSE`).
- [x] **Public Working Demo URL**: `https://ais-pre-qjqdd2zq77dy4ryt3uq4ow-457708047485.asia-southeast1.run.app`
- [x] **3-Minute YouTube Video Script**: Built into the in-app "Submission Kit" modal with timed 2m45s talking points.
- [x] **Specific Feedback for Nebius & NVIDIA**: Structured technical feedback on Nebius Token Factory latency, JSON mode, and Nemotron instruction adherence documented in `SubmissionKitModal.tsx`.
- [x] **Automated Tests**: 7/7 unit tests passing covering schema validation, deduplication, thresholding, and exports.
