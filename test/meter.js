/*
 * Sanity checks for the slop meter in scanner.js.
 *
 * Usage: node test/meter.js
 *
 * The meter is web-only (scan_text.py has no equivalent), so this test pins the
 * behaviour: bad text lands high, plain specific text lands low, empty text is
 * zero, and the score never leaves 0-100.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var Scanner = require('../scanner.js');

var root = path.join(__dirname, '..');
var failures = 0;

function check(name, ok, detail) {
  if (!ok) { failures++; }
  console.log((ok ? 'ok     ' : 'FAIL   ') + name + (detail ? '  ' + detail : ''));
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function meterOf(text) {
  return Scanner.meter(Scanner.analyze(text));
}

var CLEAN = [
  'The scanner reads a text file and counts stock phrases, em dashes, bold spans and headings.',
  'It prints one line per metric and a short list of spots worth reading twice.',
  'Run it with python3 scan_text.py draft.txt. Add --json when another script needs the numbers.',
  'It does not guess who wrote the text. Texts under 120 words give unreliable densities, so read those directly.',
  'The phrase lists live at the top of the file, one list per language. To add a phrase, append it to the list and run the sample text through to see the new hit.',
  'Thresholds sit next to the signals they trigger, so changing one means editing one line.'
].join(' ');

var sample = meterOf(read('examples/sample-slop.txt'));
check('sample-slop.txt is high', sample.level === 'high', JSON.stringify(sample));

var tesla = meterOf(read('examples/tesla-slop.txt'));
check('tesla-slop.txt is high', tesla.level === 'high', JSON.stringify(tesla));

var clean = meterOf(CLEAN);
check('plain specific text is low', clean.level === 'low' && clean.score < 25, JSON.stringify(clean));

var readme = meterOf(read('README.md'));
check('README.md is low', readme.level === 'low', JSON.stringify(readme));

var empty = meterOf('   \n  ');
check('empty text scores 0', empty.score === 0 && empty.level === 'low', JSON.stringify(empty));

check('short text is flagged', meterOf('In conclusion, this is crucial.').short === true);
check('long text is not flagged short', sample.short === false);

var stuffed = new Array(200).join('crucial pivotal robust seamless. ');
var big = meterOf(stuffed + '\n[Insert name here]\n' +
  'It is not just fast but cheap. It is not only a tool but a platform.\n' +
  'Moreover, a. Furthermore, b. Additionally, c. Consequently, d.\n' +
  '## Conclusion\n');
check('score is capped at 100', big.score === 100, JSON.stringify(big));

var low = Scanner.meter({ metrics: { words: 300, phrase_hits_per_1000_words: 0, contrast_framing: 0, transition_openers: 0 }, placeholders: [], closingHeadings: [] });
var mid = Scanner.meter({ metrics: { words: 300, phrase_hits_per_1000_words: 25, contrast_framing: 0, transition_openers: 0 }, placeholders: [], closingHeadings: [] });
var high = Scanner.meter({ metrics: { words: 300, phrase_hits_per_1000_words: 50, contrast_framing: 0, transition_openers: 0 }, placeholders: [], closingHeadings: [] });
check('level boundaries: 0 low, 30 medium, 60 high',
  low.level === 'low' && mid.level === 'medium' && high.level === 'high',
  low.score + ' / ' + mid.score + ' / ' + high.score);

process.exit(failures ? 1 : 0);
