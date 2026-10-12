/*
 * Checks that scanner.js (browser port) gives the same numbers as
 * anti-ai-slop-text/scripts/scan_text.py on the same text.
 *
 * Usage: node test/parity.js [file ...]
 * With no arguments it runs on examples/sample-slop.txt.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var Scanner = require('../scanner.js');

var root = path.join(__dirname, '..');
var py = path.join(root, 'anti-ai-slop-text', 'scripts', 'scan_text.py');
var files = process.argv.slice(2);
if (!files.length) { files = [path.join(root, 'examples', 'sample-slop.txt')]; }

var failures = 0;

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

files.forEach(function (file) {
  var raw = fs.readFileSync(file, 'utf8');
  var js = Scanner.analyze(raw);
  var ref = JSON.parse(cp.execFileSync('python3', ['-I', py, file, '--json'], { encoding: 'utf8' }));

  var jsPhrases = {};
  js.phraseList.forEach(function (p) { jsPhrases[p[0]] = p[1]; });
  var jsSignals = js.signalKeys.map(function (k) { return Scanner.signalsEn[k]; });

  var checks = [
    ['metrics', js.metrics, ref.metrics],
    ['signals', jsSignals, ref.signals],
    ['phrase_hits', jsPhrases, ref.phrase_hits],
    ['transition_hits', js.transitionHits, ref.transition_hits],
    ['contrast_examples', js.contrastExamples, ref.contrast_examples],
    ['placeholders', js.placeholders, ref.placeholders],
    ['closing_headings', js.closingHeadings, ref.closing_headings]
  ];

  checks.forEach(function (c) {
    var ok = same(c[1], c[2]);
    if (!ok) {
      failures++;
      console.log('FAIL ' + path.basename(file) + ' / ' + c[0]);
      console.log('  js:  ' + JSON.stringify(c[1]));
      console.log('  py:  ' + JSON.stringify(c[2]));
    }
  });
  console.log((failures ? 'checked ' : 'ok     ') + path.basename(file) +
    ' (' + js.metrics.words + ' words, ' + js.ranges.length + ' marked spans)');
});

process.exit(failures ? 1 : 0);
