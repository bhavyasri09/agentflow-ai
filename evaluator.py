"""
AgentFlow AI - Evaluator Module
"""
from typing import List, Dict, Any, Tuple

def tokenize(text: str) -> List[str]:
    return [w.strip() for w in text.lower().split() if len(w.strip()) > 2]

def jaccard_similarity(tokens_a: List[str], tokens_b: List[str]) -> float:
    if not tokens_a or not tokens_b:
        return 0.0
    set_a = set(tokens_a)
    set_b = set(tokens_b)
    intersection = len(set_a.intersection(set_b))
    union = len(set_a.union(set_b))
    return intersection / union if union > 0 else 0.0

def evaluate_dataset_records(
    records: List[Dict[str, Any]],
    topic: str,
    sources: List[Dict[str, Any]],
    quality_threshold: float = 3.5
) -> List[Dict[str, Any]]:
    evaluated = []
    seen_q_tokens: List[Tuple[str, List[str]]] = []

    for r in records:
        q = r.get("question", "").strip()
        a = r.get("answer", "").strip()
        q_tokens = tokenize(q)

        is_duplicate = False
        duplicate_score = 0.0
        dup_of_id = ""

        for prev_id, prev_tokens in seen_q_tokens:
            sim = jaccard_similarity(q_tokens, prev_tokens)
            if sim > duplicate_score:
                duplicate_score = sim
                dup_of_id = prev_id
            if sim >= 0.85:
                is_duplicate = True
                break

        if not is_duplicate:
            seen_q_tokens.append((r.get("id", ""), q_tokens))

        topic_tokens = tokenize(topic)
        content_tokens = tokenize(f"{q} {a}")
        matched_hits = sum(1 for t in topic_tokens if t in content_tokens)
        relevance = 5.0 if matched_hits >= len(topic_tokens) * 0.7 else (4.0 if matched_hits > 0 else 2.5)

        word_count = len(a.split())
        if word_count < 10:
            completeness = 1.5
        elif word_count < 20:
            completeness = 2.8
        elif word_count >= 35:
            completeness = 4.8
        else:
            completeness = 3.8

        consistency = 4.4
        clarity = 4.5
        if not (q.endswith("?") or q.endswith(".")):
            clarity -= 0.5
        if a and not a[0].isupper():
            clarity -= 0.4

        composite = 0.25 * relevance + 0.3 * completeness + 0.25 * consistency + 0.2 * clarity
        if is_duplicate:
            composite = min(composite, 2.0)
        composite = round(composite, 1)

        status = "accepted"
        rejection_reason = None
        if is_duplicate:
            status = "rejected"
            rejection_reason = f"Duplicate question detected ({int(duplicate_score * 100)}% match with {dup_of_id})"
        elif composite < quality_threshold:
            status = "rejected"
            rejection_reason = f"Quality score ({composite}) below threshold ({quality_threshold})"

        evaluated.append({
            **r,
            "quality_score": composite,
            "score_breakdown": {
                "relevance": relevance,
                "completeness": completeness,
                "consistency": consistency,
                "clarity": clarity,
                "is_duplicate": is_duplicate,
                "duplicate_score": duplicate_score
            },
            "status": status,
            "rejection_reason": rejection_reason
        })

    return evaluated
