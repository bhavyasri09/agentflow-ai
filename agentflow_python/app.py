"""
AgentFlow AI - Automated AI Training Data Generator
Streamlit Application Frontend
"""
import streamlit as st
import pandas as pd
import os
from dotenv import load_dotenv

from research import perform_web_research
from generator import generate_dataset_records
from evaluator import evaluate_dataset_records
from data_cleaner import clean_dataset_records
from exporter import export_to_jsonl, export_to_csv

load_dotenv()

st.set_page_config(
    page_title="AgentFlow AI - Automated AI Training Data Generator",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom header styling
st.markdown("""
    <style>
    .main-header {
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        font-weight: 700;
        letter-spacing: -0.02em;
    }
    </style>
""", unsafe_allow_html=True)

st.title("AgentFlow AI")
st.caption("From Web Research to AI-Ready Training Data")

# Sidebar Configuration
with st.sidebar:
    st.header("Pipeline Configuration")
    topic = st.text_input(
        "Research Topic",
        value="Retrieval-Augmented Generation (RAG) Evaluation",
        help="Subject domain to research and build training QA pairs for."
    )
    count = st.slider("Target Q&A Pairs", min_value=4, max_value=20, value=8, step=2)
    difficulty = st.selectbox("Difficulty Level", ["Beginner", "Intermediate", "Advanced"], index=1)
    language = st.selectbox("Output Language", ["English", "Spanish", "French", "German", "Japanese"])
    num_sources = st.slider("Web Sources to Retrieve", min_value=2, max_value=6, value=4)
    threshold = st.slider("Quality Score Threshold", min_value=2.0, max_value=4.5, value=3.5, step=0.1)

    st.markdown("---")
    st.subheader("API Keys (Optional)")
    tavily_key = st.text_input("Tavily API Key", type="password", value=os.getenv("TAVILY_API_KEY", ""))
    nebius_key = st.text_input("Nebius AI API Key", type="password", value=os.getenv("NEBIUS_API_KEY", ""))
    nebius_model = st.selectbox(
        "Nebius Model (Token Factory)",
        [
            "nvidia/Llama-3.1-Nemotron-70B-Instruct",
            "Qwen/Qwen3.5-397B-A17B",
            "nvidia/Llama-3.1-Nemotron-70B-Reward",
            "meta-llama/Llama-3.3-70B-Instruct",
            "Qwen/Qwen2.5-72B-Instruct",
            "mistralai/Mistral-7B-Instruct-v0.3",
            "deepseek-ai/DeepSeek-V3"
        ]
    )

    generate_btn = st.button("⚡ Generate Dataset", type="primary", use_container_width=True)

# Main Processing Flow
if generate_btn and topic.strip():
    with st.status("Executing AgentFlow Pipeline...", expanded=True) as status:
        st.write("🔍 Phase 1: Conducting web research via Tavily Search...")
        sources, is_live_search = perform_web_research(topic, num_sources, tavily_key)
        st.write(f"✓ Retrieved {len(sources)} grounded source documents ({'Live Web Search' if is_live_search else 'Grounded Demo Corpus'}).")

        st.write(f"🧠 Phase 2: Generating {count} candidate Q&A pairs grounded in sources...")
        raw_records = generate_dataset_records(topic, count, difficulty, language, sources, nebius_key, nebius_model)
        st.write(f"✓ Synthesized {len(raw_records)} candidate QA pairs.")

        st.write("⚖️ Phase 3: Evaluating 5-dimensional quality metrics (relevance, completeness, consistency, clarity, duplicates)...")
        evaluated_records = evaluate_dataset_records(raw_records, topic, sources, quality_threshold=threshold)
        st.write("✓ Completed automated quality evaluation.")

        st.write("✨ Phase 4: Cleaning dataset, pruning duplicate questions, and normalizing schema...")
        cleaned_records, rejected_records, metrics = clean_dataset_records(evaluated_records, quality_threshold=threshold)
        st.write(f"✓ Accepted {len(cleaned_records)} records, rejected {len(rejected_records)}.")

        status.update(label="Pipeline execution complete!", state="complete", expanded=False)

    st.session_state["accepted"] = cleaned_records
    st.session_state["rejected"] = rejected_records
    st.session_state["metrics"] = metrics
    st.session_state["sources"] = sources
    st.session_state["topic"] = topic

# Display Workspace when data exists
if "accepted" in st.session_state:
    metrics = st.session_state["metrics"]
    accepted = st.session_state["accepted"]
    rejected = st.session_state["rejected"]
    sources = st.session_state["sources"]

    # Metrics Row
    m1, m2, m3, m4, m5 = st.columns(5)
    m1.metric("Total Generated", metrics["totalGenerated"])
    m2.metric("Accepted", metrics["accepted"])
    m3.metric("Rejected", metrics["rejected"])
    m4.metric("Duplicates Pruned", metrics["duplicatesRemoved"])
    m5.metric("Avg Quality", f"{metrics['avgQualityScore']} / 5.0")

    tab_accepted, tab_rejected, tab_sources, tab_export = st.tabs([
        f"Accepted Records ({len(accepted)})",
        f"Rejected Records ({len(rejected)})",
        f"Web Sources ({len(sources)})",
        "Export Dataset"
    ])

    with tab_accepted:
        if accepted:
            df_acc = pd.DataFrame(accepted)
            st.dataframe(
                df_acc[["id", "difficulty", "question", "answer", "quality_score", "source_url"]],
                use_container_width=True
            )
        else:
            st.warning("No records passed the quality threshold. Consider lowering the threshold slider.")

    with tab_rejected:
        if rejected:
            df_rej = pd.DataFrame(rejected)
            st.dataframe(
                df_rej[["id", "question", "quality_score", "rejection_reason"]],
                use_container_width=True
            )
        else:
            st.success("All generated records met the acceptance threshold!")

    with tab_sources:
        for idx, src in enumerate(sources, 1):
            with st.expander(f"Source {idx}: {src['title']}"):
                st.write(f"**URL:** [{src['url']}]({src['url']})")
                st.write(f"**Snippet:** {src['snippet']}")

    with tab_export:
        st.subheader("Download Training Data")
        c1, c2 = st.columns(2)
        
        jsonl_data = export_to_jsonl(accepted)
        csv_data = export_to_csv(accepted)
        
        c1.download_button(
            "⬇️ Download JSONL (JSON Lines)",
            data=jsonl_data,
            file_name=f"agentflow_{topic.replace(' ', '_').lower()}.jsonl",
            mime="application/x-ndjson",
            use_container_width=True
        )
        c2.download_button(
            "⬇️ Download CSV",
            data=csv_data,
            file_name=f"agentflow_{topic.replace(' ', '_').lower()}.csv",
            mime="text/csv",
            use_container_width=True
        )

        st.caption("JSONL is ideal for LLM fine-tuning datasets (OpenAI, HuggingFace, Anthropic). CSV is suitable for tabular analysis and spreadsheets.")
else:
    st.info("👈 Enter a topic in the sidebar and click 'Generate Dataset' to start the pipeline.")
