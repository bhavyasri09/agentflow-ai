"""
AgentFlow AI - Data Cleaner Module
Handles deduplication, whitespace normalization, and schema validation.
"""
from typing import List, Dict, Any, Tuple

def normalize_whitespace(text: str) -> str:
    if not text:
        return ""
    return " ".join(text.strip().split())

def clean_dataset_records(
    records: List[Dict[str, Any]],
    quality_threshold: float = 3.5
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], Dict[str, Any]]:
    accepted = []
    rejected = []
    seen_normalized_questions = set()
    
    dup_count = 0
    malformed_count = 0
    total_score = 0.0

    for r in records:
        # Schema validation
        q_raw = r.get("question")
        a_raw = r.get("answer")
        if not q_raw or not a_raw or not isinstance(q_raw, str) or not isinstance(a_raw, str):
            malformed_count += 1
            rejected.append({
                **r,
                "status": "rejected",
                "rejection_reason": "Malformed: Missing or invalid question/answer"
            })
            continue

        q = normalize_whitespace(q_raw)
        a = normalize_whitespace(a_raw)

        # Exact / normalized duplicate detection
        norm_key = q.lower().replace(" ", "")
        if norm_key in seen_normalized_questions:
            dup_count += 1
            rejected.append({
                **r,
                "question": q,
                "answer": a,
                "status": "rejected",
                "rejection_reason": "Exact duplicate question removed"
            })
            continue
        seen_normalized_questions.add(norm_key)

        score = r.get("quality_score", 4.0)
        total_score += score

        record_clean = {
            **r,
            "question": q,
            "answer": a,
            "quality_score": score
        }

        if score >= quality_threshold and r.get("status") != "rejected":
            accepted.append({**record_clean, "status": "accepted"})
        else:
            rejected.append({
                **record_clean,
                "status": "rejected",
                "rejection_reason": r.get("rejection_reason", f"Score {score} < {quality_threshold}")
            })

    total_valid = len(accepted) + len(rejected)
    metrics = {
        "totalGenerated": len(records),
        "accepted": len(accepted),
        "rejected": len(rejected),
        "duplicatesRemoved": dup_count,
        "malformedRemoved": malformed_count,
        "avgQualityScore": round(total_score / max(total_valid, 1), 1)
    }

    return accepted, rejected, metrics
