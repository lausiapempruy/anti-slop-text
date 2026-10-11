#!/usr/bin/env python3
"""Heuristic scanner for AI-slop signals in prose (Indonesian + English).

Usage:
    python scan_text.py FILE [--json]
    cat draft.txt | python scan_text.py - [--json]

This is a pointer, not a judge. It highlights spans worth reading and gives
rough density numbers. A hit proves nothing alone; clusters in text that also
says little are the signal. It never estimates whether a human or a model wrote
the text.
"""
import argparse
import json
import re
import statistics
import sys

PHRASES = {
    "id": [
        "di era digital", "di era modern", "dunia yang serba cepat", "seiring berkembangnya",
        "penting untuk dipahami", "perlu diketahui bahwa", "perlu dicatat bahwa",
        "tidak dapat dimungkiri", "tidak bisa dipungkiri", "tak dapat dipungkiri",
        "krusial", "signifikan", "komprehensif", "holistik", "esensial", "fundamental",
        "menenun", "mosaik", "lanskap", "permadani",
        "menghadirkan", "mengoptimalkan", "memfasilitasi", "mengeksplorasi",
        "mengimplementasikan", "memanfaatkan",
        "bukti nyata", "menandai babak baru", "tonggak penting", "tonggak sejarah",
        "masa depan yang cerah", "tanpa batas", "revolusioner", "inovatif",
        "dengan demikian, dapat disimpulkan", "dapat disimpulkan bahwa",
        "secara keseluruhan", "sebagai penutup",
        "meskipun demikian, perlu", "para ahli sepakat", "banyak pengamat",
        "berbagai penelitian membuktikan", "diliput berbagai media",
    ],
    "en": [
        "in today's fast-paced", "ever-evolving", "in the realm of", "rich tapestry",
        "it's important to note", "it is important to note", "it's worth noting",
        "it is worth noting", "it is worth mentioning",
        "delve", "crucial", "pivotal", "intricate", "tapestry", "landscape",
        "underscore", "showcase", "leverage", "robust", "seamless", "multifaceted",
        "testament to", "plays a crucial role", "plays a pivotal role",
        "navigating the complexities", "unlock the", "game-changer", "revolutionize",
        "cutting-edge", "next-generation", "unparalleled",
        "in conclusion", "overall,", "ultimately,",
        "experts agree", "studies show", "numerous studies",
        "i hope this email finds you well",
    ],
}

TRANSITIONS = [
    "selain itu", "lebih lanjut", "di sisi lain", "oleh karena itu", "dengan demikian",
    "moreover", "furthermore", "additionally", "in addition", "consequently",
]

CONTRAST_PATTERNS = [
    r"\bbukan (?:hanya|sekadar|sekedar|cuma)\b[^.!?\n]{0,120}\b(?:tetapi|namun|melainkan|tapi)\b",
    r"\bbukan\b[^.!?\n]{0,80}\b(?:melainkan)\b",
    r"\bnot (?:just|only|merely|simply)\b[^.!?\n]{0,120}\b(?:but|it's|it is)\b",
    r"\b(?:it's|it is|this is|that's) not\b[^.!?\n]{0,80}[,;—-]\s*(?:it's|it is|it)\b",
    r"\b(?:isn't|aren't)\b[^.!?\n]{0,60}[,;—-]\s*(?:it's|it is|they're)\b",
]

PLACEHOLDER_PATTERNS = [
    r"\[(?:insert|add|your|masukkan|tambahkan|isi)[^\]]{0,60}\]",
    r"\bhere(?:'s| is) (?:your|the|a) (?:revised|updated|article|draft|version)\b",
    r"\bsure!?\s+here",
    r"\bas an ai\b",
    r"\bberikut (?:adalah )?(?:artikel|versi|draf)\b",
]

CLOSING_HEADING = re.compile(
    r"^\s{0,3}#{1,6}\s*(?:\W*\s*)?(kesimpulan|penutup|simpulan|conclusion|in conclusion|"
    r"final thoughts|secara keseluruhan|kesimpulannya|wrapping up)\b",
    re.IGNORECASE,
)
EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿⭐⬆✅]")
HEADING = re.compile(r"^\s{0,3}#{1,6}\s+\S")
BULLET = re.compile(r"^\s*(?:[-*+•]|\d+[.)])\s+\S")
BOLD = re.compile(r"\*\*[^*\n]+\*\*|__[^_\n]+__")


def strip_code(text):
    text = re.sub(r"```.*?```", " ", text, flags=re.DOTALL)
    return re.sub(r"`[^`\n]+`", " ", text)


def sentences(text):
    plain = re.sub(r"^\s{0,3}#{1,6}\s+.*$", "", text, flags=re.MULTILINE)
    plain = re.sub(r"^\s*(?:[-*+•]|\d+[.)])\s+", "", plain, flags=re.MULTILINE)
    parts = re.split(r"(?<=[.!?])\s+|\n{2,}", plain)
    return [p.strip() for p in parts if len(p.split()) >= 3]


def count_phrase(text_lower, phrase):
    if re.fullmatch(r"[a-z' -]+", phrase):
        pattern = r"\b" + re.escape(phrase)
        if phrase.endswith(("s", "e", "t", "n", "d", "y")):
            pattern += r"\w{0,3}\b"
        else:
            pattern += r"\b"
    else:
        pattern = re.escape(phrase)
    return len(re.findall(pattern, text_lower))


def analyze(raw):
    text = strip_code(raw)
    words = re.findall(r"\w+(?:['’-]\w+)*", text)
    wc = len(words)
    per_k = (lambda n: round(n * 1000.0 / wc, 1)) if wc else (lambda n: 0.0)
    lower = text.lower()

    phrase_hits = {}
    for lang, items in PHRASES.items():
        for ph in items:
            c = count_phrase(lower, ph)
            if c:
                phrase_hits[ph] = phrase_hits.get(ph, 0) + c
    phrase_total = sum(phrase_hits.values())

    transition_hits = {}
    for tr in TRANSITIONS:
        c = len(re.findall(r"(?:^|[.!?]\s+|\n)" + re.escape(tr) + r"\b", lower))
        if c:
            transition_hits[tr] = c
    transition_total = sum(transition_hits.values())

    contrast = []
    for pat in CONTRAST_PATTERNS:
        for m in re.finditer(pat, text, flags=re.IGNORECASE):
            contrast.append(m.group(0).strip()[:140])

    placeholders = []
    for pat in PLACEHOLDER_PATTERNS:
        for m in re.finditer(pat, text, flags=re.IGNORECASE):
            placeholders.append(m.group(0).strip()[:100])

    lines = text.split("\n")
    nonblank = [ln for ln in lines if ln.strip()]
    headings = [ln for ln in nonblank if HEADING.match(ln)]
    bullets = [ln for ln in nonblank if BULLET.match(ln)]
    emoji_headings = [ln.strip() for ln in headings if EMOJI.search(ln)]
    closing = [ln.strip() for ln in nonblank if CLOSING_HEADING.match(ln)]
    em_dashes = text.count("—")
    bold_count = len(BOLD.findall(text))
    raw_markdown = bool(re.search(r"\*\*[^*\n]+\*\*|^#{1,6}\s", raw, flags=re.MULTILINE))

    sents = sentences(text)
    lens = [len(s.split()) for s in sents]
    mean_len = round(statistics.mean(lens), 1) if lens else 0
    sd = statistics.pstdev(lens) if len(lens) > 1 else 0
    cv = round(sd / mean_len, 2) if mean_len else 0

    paras = [p for p in re.split(r"\n\s*\n", text) if len(p.split()) >= 5 and not HEADING.match(p.strip())]
    plens = [len(p.split()) for p in paras]
    pmean = statistics.mean(plens) if plens else 0
    pcv = round(statistics.pstdev(plens) / pmean, 2) if len(plens) > 2 and pmean else 0

    metrics = {
        "words": wc,
        "sentences": len(sents),
        "avg_sentence_words": mean_len,
        "sentence_length_variation": cv,
        "paragraphs": len(paras),
        "paragraph_length_variation": pcv,
        "em_dashes": em_dashes,
        "em_dashes_per_1000_words": per_k(em_dashes),
        "bold_spans": bold_count,
        "bold_per_1000_words": per_k(bold_count),
        "headings": len(headings),
        "headings_per_1000_words": per_k(len(headings)),
        "bullet_lines": len(bullets),
        "bullet_share_of_lines": round(len(bullets) / len(nonblank), 2) if nonblank else 0,
        "emoji_headings": len(emoji_headings),
        "phrase_hits_total": phrase_total,
        "phrase_hits_per_1000_words": per_k(phrase_total),
        "transition_openers": transition_total,
        "contrast_framing": len(contrast),
    }

    signals = []
    if wc < 120:
        signals.append("Text is short (under 120 words); density numbers are unreliable. Read it directly.")
    if placeholders:
        signals.append("Leftover meta text or placeholders found: remove them.")
    if wc >= 120 and phrase_total and metrics["phrase_hits_per_1000_words"] >= 6:
        signals.append("High density of stock phrases and inflated vocabulary. Check which ones say nothing.")
    elif phrase_total >= 3:
        signals.append("Several stock phrases present. Check whether each carries meaning.")
    if len(contrast) >= 2:
        signals.append("Contrast framing ('not just X but Y') appears more than once. Check for a repeated template.")
    if wc >= 200 and metrics["em_dashes_per_1000_words"] >= 10:
        signals.append("Many em dashes. Fine if purposeful; edit only the ones a comma or period would replace.")
    if wc >= 200 and metrics["bold_per_1000_words"] >= 15:
        signals.append("Heavy bold use. If nearly everything is bold, nothing stands out.")
    if wc >= 200 and metrics["headings_per_1000_words"] >= 12:
        signals.append("Dense headings. Check whether the text reads as a stack of cards.")
    if wc >= 100 and metrics["bullet_share_of_lines"] >= 0.6:
        signals.append("Mostly bullet lines. Fine for lists; check whether flowing explanation was chopped up.")
    if emoji_headings and len(emoji_headings) >= max(3, len(headings) // 2):
        signals.append("Emoji on most headings. Check this matches the document's register.")
    if closing:
        signals.append("Closing heading found ('Conclusion' or similar). Check it adds something beyond a recap.")
    if transition_total >= 3 and sents and transition_total / len(sents) >= 0.15:
        signals.append("Many sentences open with stock connectors. Check the logical links are real.")
    if len(sents) >= 8 and cv and cv < 0.3:
        signals.append("Sentence lengths are very uniform. Check for a monotone, mold-like rhythm.")
    if raw_markdown:
        signals.append("Markdown syntax present. Confirm the destination renders markdown (plain txt, email or chat paste may not).")

    return {
        "metrics": metrics,
        "signals": signals,
        "phrase_hits": dict(sorted(phrase_hits.items(), key=lambda kv: -kv[1])),
        "transition_hits": transition_hits,
        "contrast_examples": contrast[:8],
        "placeholders": placeholders[:8],
        "closing_headings": closing,
        "emoji_headings": emoji_headings[:6],
    }


def print_report(res):
    m = res["metrics"]
    print("SLOP SCAN (heuristic, a pointer and not a verdict)")
    print("-" * 52)
    print(f"words: {m['words']}   sentences: {m['sentences']}   paragraphs: {m['paragraphs']}")
    print(f"avg sentence length: {m['avg_sentence_words']} words   variation: {m['sentence_length_variation']}")
    print(f"em dashes: {m['em_dashes']} ({m['em_dashes_per_1000_words']}/1000w)   "
          f"bold: {m['bold_spans']} ({m['bold_per_1000_words']}/1000w)")
    print(f"headings: {m['headings']} ({m['headings_per_1000_words']}/1000w)   "
          f"bullet lines: {m['bullet_lines']} ({int(m['bullet_share_of_lines'] * 100)}% of lines)")
    print(f"stock phrase hits: {m['phrase_hits_total']} ({m['phrase_hits_per_1000_words']}/1000w)   "
          f"connector openers: {m['transition_openers']}   contrast framing: {m['contrast_framing']}")
    if res["phrase_hits"]:
        top = ", ".join(f"{k} x{v}" for k, v in list(res["phrase_hits"].items())[:12])
        print(f"phrases: {top}")
    if res["contrast_examples"]:
        print("contrast framing examples:")
        for ex in res["contrast_examples"]:
            print(f"  - {ex}")
    if res["placeholders"]:
        print("placeholders / meta text:")
        for ph in res["placeholders"]:
            print(f"  - {ph}")
    if res["closing_headings"]:
        print("closing headings: " + "; ".join(res["closing_headings"]))
    print("-" * 52)
    if res["signals"]:
        print("Worth a closer read:")
        for s in res["signals"]:
            print(f"  * {s}")
    else:
        print("No strong signals. Still read the text for substance; the scanner cannot judge that.")
    print("Reminder: these numbers say nothing about who wrote the text.")


def main():
    ap = argparse.ArgumentParser(description="Heuristic AI-slop signal scanner for prose.")
    ap.add_argument("file", help="path to a text or markdown file, or - for stdin")
    ap.add_argument("--json", action="store_true", help="print machine-readable JSON")
    args = ap.parse_args()
    try:
        raw = sys.stdin.read() if args.file == "-" else open(args.file, encoding="utf-8").read()
    except (OSError, UnicodeDecodeError) as exc:
        print(f"Cannot read input: {exc}", file=sys.stderr)
        return 1
    if not raw.strip():
        print("Input is empty.", file=sys.stderr)
        return 1
    res = analyze(raw)
    if args.json:
        print(json.dumps(res, ensure_ascii=False, indent=2))
    else:
        print_report(res)
    return 0


if __name__ == "__main__":
    sys.exit(main())
