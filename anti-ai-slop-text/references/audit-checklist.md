# Audit checklist

Contents: 1 What the score means, 2 The 12 indicators, 3 Scoring guide, 4 False positives, 5 Evidence quality, 6 Report template.

---

## 1. What the score means

The checklist measures editorial quality: is this text specific, accurate, non-repetitive and useful to its reader? It does not measure whether a person or a model wrote it. Do not present the result as a probability of AI authorship. Human writers produce these problems all the time, and well-edited AI text can pass every item.

Fix order, always: accuracy and substance first, then wording, then structure, then formatting. A text with a lot of em dashes that is accurate, specific and useful is not slop. A tidy text that is empty or misleading can be a worse example.

---

## 2. The 12 indicators

Mark an indicator only when you can point to the span of text that shows it.

| # | Area | Indicator | Look for |
|---|---|---|---|
| 1 | Information | Long paragraphs that give no new fact | Reader finishes with nothing checkable or actionable |
| 2 | Repetition | The same idea repeated with synonyms | Three sentences that could be one |
| 3 | Specificity | No example, number, name or relevant detail | Text would stay true if the topic were swapped |
| 4 | Language | Bombastic or over-formal words | krusial, signifikan, komprehensif, pivotal, robust, leverage |
| 5 | Sentences | Contrast framing and rule-of-three repeating | "bukan sekadar X, melainkan Y" and "A, B, dan C" in most paragraphs |
| 6 | Transitions | Many connectors with no logical link | "Selain itu / Lebih lanjut / Moreover" opening sentence after sentence |
| 7 | Analysis | Explanation that only restates the previous fact | "Hal ini menunjukkan pentingnya…" |
| 8 | Structure | Every section follows the same mold | Definition, benefits, challenges, future, every time |
| 9 | Closing | Conclusion repeats the whole text | "Kesimpulan" or "In conclusion" that adds nothing |
| 10 | Accuracy | Unverified claims, quotes, numbers or sources | Fabricated consensus, citations that do not match |
| 11 | Voice | No viewpoint or editorial decision | Could have been written by nobody in particular |
| 12 | Relevance | Parts that do not serve the reader's need | Sections that answer a question nobody asked |

---

## 3. Scoring guide

Count marked indicators. Treat 10 (accuracy) as weightier than the others: one clear accuracy problem is a serious finding even if the count is low.

| Marked | Reading |
|---|---|
| 0 to 2 | Mostly fine. Mention the one or two issues and move on |
| 3 to 5 | Noticeable padding or templating. A targeted edit will help |
| 6 to 8 | Heavy. Plan a rewrite of structure and wording, and expect to need facts from the author |
| 9 to 12 | The text probably needs to be rebuilt from the author's actual facts rather than polished |

These bands are for communication, not measurement. Do not quote them as scientific thresholds.

When the `scripts/scan_text.py` output is available, use it to locate spans for indicators 4, 5, 6, 8, 9 and the formatting items. Indicators 1, 3, 7, 10, 11 and 12 need reading and judgment; the scanner cannot see them.

---

## 4. False positives

These alone are not evidence of slop:

- Perfect grammar and spelling.
- Formal register in a report, paper or official document.
- "Selain itu", "dengan demikian", "furthermore" used where the logical link is real.
- A few em dashes, or a single one.
- Numbered lists in tutorials and procedures.
- A long text. Length is not shallowness.
- Absence of typos.
- A high AI-detector score. Detectors make mistakes, especially after a text has been edited or when the model differs from what the detector was trained on.
- A lone rule-of-three or contrast sentence. Both are old, legitimate rhetoric.
- Headings and tables in a document that a reader navigates or compares.

If most of what you found is on this list, say the text is fine.

---

## 5. Evidence quality (be honest about the basis)

The pattern catalog draws on sources of different weight:

- A Wikipedia editorial guide about signs of AI writing: useful for recognizing patterns, an editorial aid and not a formal study.
- A 2026 article cataloguing 32 recurring patterns across model outputs: a practitioner list.
- An introductory article on AI slop (Coursera): general characterization: repetitive, generic, shallow, inaccurate or irrelevant text.
- A 2024 corpus-based study in Lingua comparing ChatGPT and human academic writing: more systematic evidence, limited to academic discourse and the models tested.
- A Search Engine Land content analysis: found a "Conclusion" heading had the strongest negative link with engagement, and em dashes alone did not reduce it.

AI slop is not a scientific term with a fixed definition. Patterns shift as models change. Present findings as "this reads as padded or templated" and not as "this is AI".

---

## 6. Report template

Use in the user's language and tone. Scale it down for short texts.

```
Verdict: <1 or 2 sentences: how much of the text is empty, generic or risky, and the biggest problem>

Findings (most important first)
1. <Accuracy or substance issue>: "<short quote>" -> <why it is a problem> -> <what to do>
2. <Wording or sentence-pattern issue>: "<short quote>" -> <fix>
3. <Structure or formatting issue>: <where> -> <fix>
(Group repeats; do not list every instance.)

Looks fine, leave alone: <legitimate things that might look like slop>

Rewrite: <the full revised text, if asked for or if the user pasted a draft with no other instruction>

Needs your input: <the facts or decisions only the author has, as 2 to 4 short questions>
```

Keep the "Looks fine" line when you saw things that resemble slop but are not. It stops the user from over-editing.
