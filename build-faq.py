"""faq.md -> website/assets/faq-data.js 변환 스크립트

faq.md를 고친 뒤 아래 명령을 실행하면 홈페이지 챗봇 답변이 함께 바뀝니다.
    python build-faq.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
src = (ROOT / "faq.md").read_text(encoding="utf-8")

items = []
category = ""
for block in re.split(r"\n(?=## |### )", src):
    block = block.strip()
    if block.startswith("## "):
        category = re.sub(r"\s*\(Q\d+~Q\d+\)", "", block[3:].splitlines()[0]).strip()
        continue
    m = re.match(r"### (Q\d{3})\.\s*(.+?)\n(.+)", block, re.S)
    if not m:
        continue
    qid, question, answer = m.group(1), m.group(2).strip(), m.group(3).strip()
    answer = re.split(r"\n---", answer)[0].strip()
    items.append({"id": qid, "c": category, "q": question, "a": answer})

out = ROOT / "website" / "assets" / "faq-data.js"
out.write_text(
    "// 자동 생성 파일: faq.md를 고친 뒤 `python build-faq.py`로 다시 만드세요.\n"
    "window.FAQ_DATA = " + json.dumps(items, ensure_ascii=False, indent=0) + ";\n",
    encoding="utf-8",
)
print(f"{len(items)}개 문항 -> {out}")
