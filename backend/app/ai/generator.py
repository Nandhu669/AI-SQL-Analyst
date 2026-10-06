"""
generator.py — Coordinates schema injection, LLM generation, JSON extraction, and AST safety validation.
"""

import json
import re
from typing import Any
import sqlglot
from sqlglot import ErrorLevel
from sqlglot import expressions as exp

from app.ai.client import call_openrouter
from app.ai.prompts import build_system_prompt, format_schema_for_prompt


def extract_json_payload(text: str) -> dict[str, Any]:
    """
    Robustly extracts and parses JSON from LLM output, handling reasoning tokens,
    markdown fences, and raw SQL blocks.
    """
    clean = text.strip()

    # 1. Search for markdown code fences (```json ... ``` or ``` ... ```) containing "sql"
    fences = re.findall(r"```(?:json)?\s*([\s\S]*?)\s*```", clean, re.IGNORECASE)
    for fence in reversed(fences):
        fence_str = fence.strip()
        try:
            parsed = json.loads(fence_str)
            if isinstance(parsed, dict) and "sql" in parsed:
                return parsed
        except Exception:
            # If the code fence contains raw SQL instead of JSON
            if re.search(r"^\s*(SELECT|WITH)\b", fence_str, re.IGNORECASE):
                return {
                    "sql": fence_str,
                    "explanation": "Generated query based on user question.",
                }

    # 2. Search for any JSON object containing "sql"
    json_candidates = re.findall(r"(\{[^{}]*\"sql\"[\s\S]*?\})", clean)
    for jc in reversed(json_candidates):
        try:
            parsed = json.loads(jc)
            if isinstance(parsed, dict) and "sql" in parsed:
                return parsed
        except Exception:
            continue

    # 3. Direct JSON parsing on entire string
    try:
        parsed = json.loads(clean)
        if isinstance(parsed, dict) and "sql" in parsed:
            return parsed
    except Exception:
        pass

    # 4. Fallback: Search for any standalone SELECT / WITH statement in the text
    sql_match = re.search(r"\b(SELECT\b[\s\S]*?;)", clean, re.IGNORECASE)
    if sql_match:
        return {
            "sql": sql_match.group(1).strip(),
            "explanation": "Extracted query from model response.",
        }

    raise ValueError(f"Could not parse valid JSON or SQL from LLM response (length {len(clean)})")


async def generate_sql_from_question(
    question: str,
    tables: list[Any],
) -> tuple[str, str]:
    """
    Main AI generation pipeline:
      1. Injects table schema into system prompt
      2. Calls OpenRouter free-tier LLM
      3. Parses JSON and extracts 'sql' and 'explanation'
      4. Validates read-only SELECT safety with sqlglot AST
      5. Returns (sql, explanation)
    """
    schema_text = format_schema_for_prompt(tables)
    system_prompt = build_system_prompt(schema_text)

    # Call OpenRouter LLM
    raw_response = await call_openrouter(system_prompt, question)

    # Parse JSON
    parsed = extract_json_payload(raw_response)
    sql = parsed.get("sql", "").strip()
    explanation = parsed.get("explanation", "Generated query for your question.")

    if not sql:
        raise ValueError("Model returned an empty SQL query.")

    # Strip any markdown code fences that may have been placed inside the "sql" field
    sql = re.sub(r"^```(?:sql)?\s*", "", sql, flags=re.IGNORECASE)
    sql = re.sub(r"\s*```$", "", sql).strip()

    # Clean comment lines for safety check
    clean_lines = [
        line for line in sql.splitlines()
        if not line.strip().startswith("--")
    ]
    sql_for_validation = "\n".join(clean_lines).strip().rstrip(";").strip()

    # Verify read-only AST safety with automatic preamble extraction
    try:
        ast = sqlglot.parse_one(sql_for_validation, error_level=ErrorLevel.RAISE)
        if not isinstance(ast, exp.Select):
            raise ValueError(f"Safety violation: Model generated a non-SELECT query ({type(ast).__name__})")
    except Exception as first_ast_err:
        # Attempt to isolate pure SELECT statement from any preamble or commentary
        match = re.search(r"\b(SELECT\b[\s\S]+?\bFROM\b[\s\S]+?)(?:;|\Z)", sql_for_validation, re.IGNORECASE)
        if match:
            candidate_sql = match.group(0).strip().rstrip(";").strip()
            try:
                ast = sqlglot.parse_one(candidate_sql, error_level=ErrorLevel.RAISE)
                if isinstance(ast, exp.Select):
                    sql = candidate_sql
                    sql_for_validation = candidate_sql
            except Exception:
                raise ValueError(f"Invalid generated SQL: {first_ast_err}")
        else:
            raise ValueError(f"Invalid generated SQL: {first_ast_err}")

    # Ensure clean ending semicolon
    if not sql.endswith(";"):
        sql += ";"

    return sql, explanation
