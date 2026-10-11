---
name: anti-ai-slop-text
description: Write or clean up text so it reads as specific, useful and human-edited instead of generic "AI slop". Use this skill whenever Claude writes or edits any prose deliverable, such as documents, reports, PDFs, Word files, articles, blog posts, READMEs, scripts and video narration, emails, announcements, captions, product copy, proposals or school/academic writing, in any language (Indonesian and English patterns are covered). Also use it when the user asks to audit, review, humanize, tighten or "remove the AI feel" from a text, asks "does this sound like AI", or pastes a draft that feels padded, bombastic, repetitive or templated. Apply it even when the user does not mention AI, because most text Claude drafts benefits from it. Not for website visuals (use ai-slop-remover) and not for code logic.
---

# Anti AI Slop Text

AI slop in text is writing that looks finished but gives the reader little: long, polished, generic, repetitive, inflated, sometimes wrong. The goal of this skill is text where every sentence earns its place, whoever or whatever wrote the first draft.

Two things to keep straight from the start:

- **Slop is a quality problem, not an authorship verdict.** Humans write slop and edited AI text can be clean. Judge the text on substance, specificity and usefulness. Never tell the user "this was definitely written by AI", and never promise a text will pass an AI detector. Detectors are unreliable and this skill does not target them.
- **Substance beats style.** A text full of em dashes that is accurate, specific and useful is fine. A spotless text that says nothing, or states things that are not true, is the real slop. Fix in this order: facts and substance, then language, then structure, then formatting.

## Pick the mode

**Write mode.** The user wants new text. Apply the principles below while drafting, so the slop never appears. Do a quick self-check pass before delivering.

**Audit / rewrite mode.** The user supplies a draft, or asks "is this AI-sounding?". Scan, report what is actually wrong, then rewrite. If they only asked for an audit, give the audit and offer the rewrite instead of rewriting unasked.

If the request is ambiguous (a pasted draft with no instruction), default to rewrite mode and say in one line what you did.

## Writing principles

1. **Know the one point first.** Before drafting, be able to say in a sentence what the reader should learn or do. If the topic has no point yet, ask the user or say what is missing, instead of padding.
2. **Open with the thing itself.** Skip the definition-of-the-topic opener ("X is an important part of modern life") and the scene-setting paragraph. Start where the reader's question starts.
3. **Specific over general.** Prefer a name, number, date, example, constraint or observable behavior over an adjective. A sentence that would still be true if the topic were swapped for a different one is generic; cut it or make it specific.
4. **Never invent specifics to look specific.** Replacing "many users" with "73% of users" is fabrication unless the user gave that number. Use only facts from the user, the supplied files, or sources you actually checked. Where the draft needs a detail you do not have, leave a clearly marked gap and tell the user what to supply, or phrase it honestly without the detail.
5. **Say each thing once.** Repeating an idea with synonyms adds length, not meaning. Merge.
6. **Calibrate emphasis.** If everything is "crucial", nothing is. Reserve strong words for the few things that earn them, and show why instead of announcing importance.
7. **Plain verbs and plain nouns.** "Use" over "leverage", "show" over "showcase", "help" over "facilitate". In Indonesian, "pakai" over "memanfaatkan" and "bikin" over "menghadirkan" where the register allows it.
8. **Vary shape naturally.** Mix short and long sentences and let paragraph length follow content. Do not force a rhythm, and do not chase variation for its own sake either.
9. **Structure follows content.** Use headings, bullets and bold only when the reader will scan, compare or look something up. Flowing explanation stays in paragraphs. End when the content ends, with no recap unless the document is long enough that a reader needs one.
10. **Keep the writer's voice.** If the user has a tone (casual Indonesian slang, formal report, dry humor), match it. Removing slop must not flatten the voice into neutral beige.

## Audit workflow

1. **Read for substance first.** What does this text actually claim? Is anything vague, unsupported, or checkable-and-wrong? Fabricated consensus ("experts agree"), invented quotes, numbers and sources are the highest-priority findings, because they mislead.
2. **Run the scanner when the text is long enough to count** (roughly 300+ words and a file is available): `python scripts/scan_text.py <file>`. It reports phrase hits, em dash and bold density, heading density, contrast framing, sentence rhythm and leftover placeholders. It is a heuristic that points you at spots to read; it does not decide anything. For short texts, just read.
3. **Check against the pattern catalog** in `references/patterns.md` (substance, wording, sentence patterns, structure, formatting, context-specific notes). Note which patterns are really present. Do not assume a text has all of them.
4. **Score with `references/audit-checklist.md`** when the user wants a structured audit. Remember what the score means: editorial quality, not a probability of AI authorship.
5. **Filter false positives.** Formal register, perfect grammar, numbered lists in a tutorial, "selain itu" / "furthermore", a single em dash, or a long text are not slop by themselves. Pattern density and emptiness are the signal, not the presence of one item. See the false-positive list in the checklist reference.
6. **Rewrite.** Remove or replace each real problem. See "Rewriting rules" below and the before/after pairs in `references/rewrite-examples.md`.
7. **Self-check the rewrite** for new slop. A common failure is trading one pattern for another: deleting every em dash and replacing them with the same dramatic contrast structure, or swapping "crucial" for "pivotal". Reread the output once as a skeptical reader.

## Rewriting rules

- **Preserve meaning and facts.** Cutting filler must not change what the text claims. Keep names, numbers, quotes, citations, code, commands and legal or technical wording exactly as they were.
- **Delete before you rephrase.** If a sentence carries no information, remove it. Rephrasing an empty sentence just produces a different empty sentence.
- **Ask for missing specifics instead of guessing.** When the fix needs facts only the user has (what the product does, how many, who for), list the questions at the end. Do not paper over the gap with a nicer-sounding generality.
- **Keep the language and register.** Indonesian stays Indonesian, English stays English, mixed stays mixed. Do not formalize casual text or casualize a formal report.
- **Do not strip legitimate structure.** A tutorial's numbered steps, a spec's tables and a report's required sections stay. Remove only structure that exists to look organized.
- **Em dashes and other single tokens** are edited only where they are overused or doing dramatic work a comma would do. Never run a blanket find-and-replace.
- **Leave quoted material alone.** If the text quotes someone else's slop, it is a quote, not the author's prose.

## Format-specific notes

This skill governs the words. When the deliverable is a file, apply it to the text first, then hand off to the right file skill (docx, pdf, pptx, xlsx, or the docs type) for building.

- **Documents, reports, proposals:** headings only where a reader navigates by them; no automatic "Challenges" and "Future outlook" sections; summaries only when the document is long.
- **Slides:** one claim per slide in a sentence that could be said aloud; no filler subtitles.
- **Scripts and narration (video, podcast, voiceover):** write for the ear, short sentences, concrete nouns, no "in today's fast-paced world" opener.
- **README and technical docs:** state what it does, how to run it, and one real example. Skip mission-statement paragraphs and feature lists made of adjectives.
- **Emails and chat messages:** lead with the ask or the news; keep the sender's usual warmth level.
- **Marketing and SEO copy:** claims need proof (a number, a feature, a customer fact the user supplied). Do not repeat the keyword mechanically.
- **Academic writing:** plain precise verbs, claims tied to cited evidence, no inflated vocabulary added for sound.

## Audit output format

When the user asked for an audit (or for an audit plus rewrite), reply in this shape, in the user's language and tone:

1. **Verdict** in one or two sentences: how much of the text is empty, generic or risky, and the single biggest problem.
2. **Findings**, highest priority first. For each one, quote the short offending span, name the problem, and say what to do. Group repeats instead of listing every instance.
3. **Rewrite** (if wanted), complete, not excerpted.
4. **What I couldn't fix** (only if true): the facts or decisions the user must supply, as a short list.

Keep the report proportional. A 100-word paragraph does not need a 12-point audit.

## Reference files

- `references/patterns.md` has the full catalog of slop patterns in Indonesian and English with fixes and context-specific notes. Read it in audit mode, or when drafting a long piece.
- `references/rewrite-examples.md` has before/after pairs (website blurb, community announcement, report paragraph, script narration, README, email, academic paragraph). Read it when unsure how far to go.
- `references/audit-checklist.md` has the 12-indicator checklist, scoring guide, false-positive list and a report template. Read it when the user wants a structured audit.
- `scripts/scan_text.py` is the heuristic scanner described above.
