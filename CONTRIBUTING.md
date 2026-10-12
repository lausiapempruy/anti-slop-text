# Contributing

Issues and pull requests are welcome. The most useful kinds:

1. **False positives.** A good text that the scanner or the pattern catalog flags unfairly. Open an issue with the text (or a short excerpt) and say why it is fine.
2. **Missed slop.** A pattern that keeps showing up and is not in `references/patterns.md`. Include two or three real examples and what a fix looks like.
3. **Indonesian and other languages.** Indonesian patterns exist today. Examples in other languages need a native reader to judge them, so say which language you read well.
4. **Rewrite examples.** Before/after pairs for `references/rewrite-examples.md`. The "after" must keep every fact of the "before". Do not add invented numbers or quotes.

## Rules for changes

- Keep the principle that slop is a quality problem, not an authorship verdict. No changes that claim to detect AI authorship or to beat detectors.
- `scripts/scan_text.py` stays dependency-free and runs on plain Python 3.
- Phrase lists are pointers. Adding a word is fine, but say in the pull request why it signals emptiness and not just formality.
- Run the scanner on `examples/sample-slop.txt` before and after your change and paste both outputs in the pull request.
- Write the docs the way the skill says to write: specific, no padding.

## Local check

```bash
python3 anti-ai-slop-text/scripts/scan_text.py examples/sample-slop.txt
node test/parity.js
```

The first should run without errors and flag the placeholder, the closing heading and the contrast framing in the sample. The second must print `ok` for the sample. It needs Node 14 or newer and nothing else.

If you add a phrase or change a threshold, change it in both `scan_text.py` and `scanner.js`, then run the parity check on a few real documents:

```bash
node test/parity.js README.md anti-ai-slop-text/SKILL.md
```

`scanner.js` and the script in `index.html` are plain ES5: no `let`, `const`, arrow functions or build tools.
