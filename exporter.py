"""
AgentFlow AI - Exporter Module
"""
import json
import csv
import io
from typing import List, Dict, Any

def export_to_jsonl(records: List[Dict[str, Any]]) -> str:
    lines = []
    for r in records:
        entry = {
            "id": r.get("id"),
            "topic": r.get("topic"),
            "difficulty": r.get("difficulty"),
            "question": r.get("question"),
            "answer": r.get("answer"),
            "source_url": r.get("source_url"),
            "quality_score": r.get("quality_score")
        }
        lines.append(json.dumps(entry, ensure_ascii=False))
    return "\n".join(lines)

def export_to_csv(records: List[Dict[str, Any]]) -> str:
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
    headers = ["id", "topic", "difficulty", "question", "answer", "quality_score", "source_url"]
    writer.writerow(headers)

    for r in records:
        writer.writerow([
            r.get("id", ""),
            r.get("topic", ""),
            r.get("difficulty", ""),
            r.get("question", ""),
            r.get("answer", ""),
            r.get("quality_score", ""),
            r.get("source_url", "")
        ])

    return output.getvalue()
