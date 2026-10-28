"""
AgentFlow AI - Test Suite
Supports both standard library `python3 -m unittest test_agentflow.py` and `pytest`.
Covers JSON parsing, duplicate removal, quality-threshold filtering, and exports.
"""
import unittest
import json
from data_cleaner import clean_dataset_records, normalize_whitespace
from exporter import export_to_jsonl, export_to_csv
from evaluator import evaluate_dataset_records
from generator import parse_model_json

class TestAgentFlow(unittest.TestCase):
    def test_normalize_whitespace(self):
        raw = "  What   is   \n\n RAG?   "
        self.assertEqual(normalize_whitespace(raw), "What is RAG?")

    def test_missing_or_malformed_fields(self):
        records = [
            {"id": "valid-1", "question": "What is AI?", "answer": "Artificial intelligence.", "topic": "Tech", "source_url": "https://a.com", "quality_score": 4.5},
            {"id": "bad-1", "question": "", "answer": "Answer with no question", "topic": "Tech", "source_url": "https://a.com", "quality_score": 4.0},
            {"id": "bad-2", "question": "Question without answer", "answer": None, "topic": "Tech", "source_url": "https://a.com", "quality_score": 4.0},
        ]
        accepted, rejected, metrics = clean_dataset_records(records, quality_threshold=3.0)
        self.assertEqual(len(accepted), 1)
        self.assertEqual(accepted[0]["id"], "valid-1")
        self.assertEqual(metrics["malformedRemoved"], 2)
        self.assertEqual(len(rejected), 2)

    def test_duplicate_removal(self):
        records = [
            {"id": "1", "question": "What is RAG?", "answer": "Retrieval Augmented Generation.", "topic": "RAG", "source_url": "https://a.com", "quality_score": 4.5},
            {"id": "2", "question": "What   is   RAG?  ", "answer": "Same concept.", "topic": "RAG", "source_url": "https://a.com", "quality_score": 4.5},
        ]
        accepted, rejected, metrics = clean_dataset_records(records, quality_threshold=3.0)
        self.assertEqual(len(accepted), 1)
        self.assertEqual(metrics["duplicatesRemoved"], 1)
        self.assertEqual(len(rejected), 1)

    def test_quality_threshold_filtering(self):
        records = [
            {"id": "high", "question": "Detailed Q?", "answer": "High quality answer with substantive detail.", "topic": "AI", "source_url": "https://a.com", "quality_score": 4.8},
            {"id": "low", "question": "Vague Q?", "answer": "Brief text.", "topic": "AI", "source_url": "https://a.com", "quality_score": 2.2},
        ]
        accepted, rejected, metrics = clean_dataset_records(records, quality_threshold=3.5)
        self.assertEqual(len(accepted), 1)
        self.assertEqual(accepted[0]["id"], "high")
        self.assertEqual(len(rejected), 1)
        self.assertEqual(rejected[0]["id"], "low")

    def test_jsonl_export_format(self):
        records = [
            {"id": "af-1", "question": "Q1", "answer": "A1", "topic": "Topic", "difficulty": "Beginner", "source_url": "https://src.com", "quality_score": 4.5},
            {"id": "af-2", "question": "Q2", "answer": "A2", "topic": "Topic", "difficulty": "Advanced", "source_url": "https://src.com", "quality_score": 4.0}
        ]
        jsonl = export_to_jsonl(records)
        lines = jsonl.strip().split("\n")
        self.assertEqual(len(lines), 2)
        
        first = json.loads(lines[0])
        self.assertEqual(first["id"], "af-1")
        self.assertEqual(first["question"], "Q1")
        self.assertEqual(first["answer"], "A1")

    def test_csv_export_format(self):
        records = [
            {"id": "af-1", "question": 'Is this "quoted"?', "answer": "Yes, it is.", "topic": "Test", "difficulty": "Intermediate", "source_url": "https://src.com", "quality_score": 4.2}
        ]
        csv_str = export_to_csv(records)
        self.assertIn("id,topic,difficulty,question,answer,quality_score,source_url", csv_str)
        self.assertIn('""quoted""', csv_str)

    def test_parse_model_json_resilience(self):
        fenced_raw = '```json\n{"dataset": [{"question": "Q", "answer": "A"}]}\n```'
        parsed = parse_model_json(fenced_raw)
        self.assertEqual(len(parsed), 1)
        self.assertEqual(parsed[0]["question"], "Q")

        array_raw = '[{"question": "Q2", "answer": "A2"}]'
        parsed_array = parse_model_json(array_raw)
        self.assertEqual(len(parsed_array), 1)
        self.assertEqual(parsed_array[0]["question"], "Q2")

if __name__ == "__main__":
    unittest.main()
