# anti-ai-slop-text

A Claude skill that makes written text specific, useful and human-edited instead of generic "AI slop". It works on English and Indonesian text, in two modes:

- **Write mode:** Claude drafts with the principles applied, then self-checks before delivering.
- **Audit / rewrite mode:** you paste a draft, Claude reports what is actually wrong, then rewrites it.

The skill treats slop as a quality problem, not an authorship verdict. It never claims a text "was written by AI" and it does not try to beat AI detectors. It judges substance, specificity and usefulness, in that order: facts first, then wording, then structure, then formatting.

## What is in the box

```
anti-ai-slop-text/
├── SKILL.md                      # entry point: modes, writing principles, audit workflow
├── references/
│   ├── patterns.md               # catalog of slop patterns (ID + EN) with fixes
│   ├── rewrite-examples.md       # before/after pairs: blurb, announcement, README, email...
│   └── audit-checklist.md        # 12-indicator checklist, scoring, false-positive list
└── scripts/
    └── scan_text.py              # heuristic scanner, Python 3, no dependencies
examples/
└── sample-slop.txt               # deliberately bad text to try the scanner on
```

## Install

**Claude Code.** Copy the skill folder into your skills directory:

```bash
# for all your projects
cp -r anti-ai-slop-text ~/.claude/skills/

# or for one project only
cp -r anti-ai-slop-text /path/to/your/project/.claude/skills/
```

**Claude (web / desktop app).** Zip the inner `anti-ai-slop-text/` folder (the one that contains `SKILL.md`, not the repo root) and upload it through the Skills section of Claude's settings.

## Use

Once installed, Claude picks the skill up by itself when it writes or edits prose, so you do not have to mention it. You can also ask directly:

- `/anti-ai-slop-text` followed by a draft, to audit and rewrite it
- "does this sound like AI?" with a pasted text
- "tighten this README" or "bersihin pengumuman ini"

If you only want an audit, say so. Claude then reports findings and offers the rewrite instead of rewriting unasked.

## The scanner

`scan_text.py` is a pointer, not a judge. It highlights spans worth reading and prints rough densities: stock phrases, em dashes, bold and heading density, "not just X but Y" framing, sentence rhythm, leftover placeholders. It never estimates whether a human or a model wrote the text.

```bash
python3 anti-ai-slop-text/scripts/scan_text.py examples/sample-slop.txt
python3 anti-ai-slop-text/scripts/scan_text.py draft.txt --json
cat draft.txt | python3 anti-ai-slop-text/scripts/scan_text.py -
```

Output on the bundled sample (259 words):

```
words: 259   sentences: 18   paragraphs: 7
stock phrase hits: 42 (162.2/1000w)   connector openers: 6   contrast framing: 3
placeholders / meta text:
  - [Insert your company name here]
closing headings: ## Conclusion
```

A single hit means little. Clusters of hits in text that also says nothing are the signal.

## What the skill will and will not do

It will:

- cut sentences that carry no information, before rephrasing anything
- keep names, numbers, quotes, code and legal wording exactly as written
- keep the language and register: Indonesian stays Indonesian, casual stays casual
- ask you for missing facts instead of inventing them

It will not:

- swap "many users" for "73% of users" unless you gave that number
- run a blanket find-and-replace on em dashes or any other single token
- flatten your voice into neutral beige
- promise that a text passes an AI detector

## Contributing

New patterns, better Indonesian examples and false-positive reports are the most useful contributions. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
