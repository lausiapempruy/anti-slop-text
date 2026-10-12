/*
 * scanner.js - heuristic AI-slop signal scanner for prose (Indonesian + English).
 *
 * A browser and Node port of anti-ai-slop-text/scripts/scan_text.py. Same phrase
 * lists, same thresholds, same metrics. On top of the Python output it also
 * returns character ranges, so a page can mark the spans it found.
 *
 * It is a pointer, not a judge. It never estimates whether a human or a model
 * wrote the text.
 *
 * ES5 on purpose: no build step, runs in old browsers and in Node.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SlopScanner = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PHRASES = {
    id: [
      'di era digital', 'di era modern', 'dunia yang serba cepat', 'seiring berkembangnya',
      'penting untuk dipahami', 'perlu diketahui bahwa', 'perlu dicatat bahwa',
      'tidak dapat dimungkiri', 'tidak bisa dipungkiri', 'tak dapat dipungkiri',
      'krusial', 'signifikan', 'komprehensif', 'holistik', 'esensial', 'fundamental',
      'menenun', 'mosaik', 'lanskap', 'permadani',
      'menghadirkan', 'mengoptimalkan', 'memfasilitasi', 'mengeksplorasi',
      'mengimplementasikan', 'memanfaatkan',
      'bukti nyata', 'menandai babak baru', 'tonggak penting', 'tonggak sejarah',
      'masa depan yang cerah', 'tanpa batas', 'revolusioner', 'inovatif',
      'dengan demikian, dapat disimpulkan', 'dapat disimpulkan bahwa',
      'secara keseluruhan', 'sebagai penutup',
      'meskipun demikian, perlu', 'para ahli sepakat', 'banyak pengamat',
      'berbagai penelitian membuktikan', 'diliput berbagai media'
    ],
    en: [
      'in today\'s fast-paced', 'ever-evolving', 'in the realm of', 'rich tapestry',
      'it\'s important to note', 'it is important to note', 'it\'s worth noting',
      'it is worth noting', 'it is worth mentioning',
      'delve', 'crucial', 'pivotal', 'intricate', 'tapestry', 'landscape',
      'underscore', 'showcase', 'leverage', 'robust', 'seamless', 'multifaceted',
      'testament to', 'plays a crucial role', 'plays a pivotal role',
      'navigating the complexities', 'unlock the', 'game-changer', 'revolutionize',
      'cutting-edge', 'next-generation', 'unparalleled',
      'in conclusion', 'overall,', 'ultimately,',
      'experts agree', 'studies show', 'numerous studies',
      'i hope this email finds you well'
    ]
  };

  var TRANSITIONS = [
    'selain itu', 'lebih lanjut', 'di sisi lain', 'oleh karena itu', 'dengan demikian',
    'moreover', 'furthermore', 'additionally', 'in addition', 'consequently'
  ];

  var CONTRAST_PATTERNS = [
    /\bbukan (?:hanya|sekadar|sekedar|cuma)\b[^.!?\n]{0,120}\b(?:tetapi|namun|melainkan|tapi)\b/gi,
    /\bbukan\b[^.!?\n]{0,80}\b(?:melainkan)\b/gi,
    /\bnot (?:just|only|merely|simply)\b[^.!?\n]{0,120}\b(?:but|it's|it is)\b/gi,
    /\b(?:it's|it is|this is|that's) not\b[^.!?\n]{0,80}[,;—\-]\s*(?:it's|it is|it)\b/gi,
    /\b(?:isn't|aren't)\b[^.!?\n]{0,60}[,;—\-]\s*(?:it's|it is|they're)\b/gi
  ];

  var PLACEHOLDER_PATTERNS = [
    /\[(?:insert|add|your|masukkan|tambahkan|isi)[^\]]{0,60}\]/gi,
    /\bhere(?:'s| is) (?:your|the|a) (?:revised|updated|article|draft|version)\b/gi,
    /\bsure!?\s+here/gi,
    /\bas an ai\b/gi,
    /\bberikut (?:adalah )?(?:artikel|versi|draf)\b/gi
  ];

  var CLOSING_HEADING = /^\s{0,3}#{1,6}\s*(?:\W*\s*)?(kesimpulan|penutup|simpulan|conclusion|in conclusion|final thoughts|secara keseluruhan|kesimpulannya|wrapping up)\b/i;
  var EMOJI = /[\uD83C-\uD83E][\uDC00-\uDFFF]|[☀-➿⭐⬆✅]/;
  var HEADING = /^\s{0,3}#{1,6}\s+\S/;
  var BULLET = /^\s*(?:[-*+•]|\d+[.)])\s+\S/;
  var BOLD = /\*\*[^*\n]+\*\*|__[^_\n]+__/g;
  var WORD = /[A-Za-z0-9_À-ɏ]+(?:['’\-][A-Za-z0-9_À-ɏ]+)*/g;

  /* English wording of each signal; the same strings the Python CLI prints. */
  var SIGNALS_EN = {
    short: 'Text is short (under 120 words); density numbers are unreliable. Read it directly.',
    placeholder: 'Leftover meta text or placeholders found: remove them.',
    phrases_high: 'High density of stock phrases and inflated vocabulary. Check which ones say nothing.',
    phrases_some: 'Several stock phrases present. Check whether each carries meaning.',
    contrast: 'Contrast framing (\'not just X but Y\') appears more than once. Check for a repeated template.',
    emdash: 'Many em dashes. Fine if purposeful; edit only the ones a comma or period would replace.',
    bold: 'Heavy bold use. If nearly everything is bold, nothing stands out.',
    headings: 'Dense headings. Check whether the text reads as a stack of cards.',
    bullets: 'Mostly bullet lines. Fine for lists; check whether flowing explanation was chopped up.',
    emoji: 'Emoji on most headings. Check this matches the document\'s register.',
    closing: 'Closing heading found (\'Conclusion\' or similar). Check it adds something beyond a recap.',
    connectors: 'Many sentences open with stock connectors. Check the logical links are real.',
    uniform: 'Sentence lengths are very uniform. Check for a monotone, mold-like rhythm.',
    markdown: 'Markdown syntax present. Confirm the destination renders markdown (plain txt, email or chat paste may not).'
  };

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function blank(match) {
    return match.replace(/[^\n]/g, ' ');
  }

  /*
   * Code spans are removed before scanning. With keepOffsets they become spaces of
   * the same length, so character ranges still line up with the raw text. Without
   * it they become one space, exactly like scan_text.py, so the numbers match it.
   */
  function stripCode(text, keepOffsets) {
    var rep = keepOffsets ? blank : ' ';
    text = text.replace(/```[\s\S]*?```/g, rep);
    return text.replace(/`[^`\n]+`/g, rep);
  }

  function countWords(s) {
    var parts = s.split(/\s+/), n = 0, i;
    for (i = 0; i < parts.length; i++) {
      if (parts[i]) { n++; }
    }
    return n;
  }

  function sentences(text) {
    var plain = text.replace(/^[ \t]{0,3}#{1,6}\s+.*$/gm, '');
    plain = plain.replace(/^\s*(?:[-*+•]|\d+[.)])\s+/gm, '');
    plain = plain.replace(/([.!?])\s+/g, '$1\u0001').replace(/\n{2,}/g, '\u0001');
    var parts = plain.split('\u0001'), out = [], i, p;
    for (i = 0; i < parts.length; i++) {
      p = parts[i].replace(/^\s+|\s+$/g, '');
      if (countWords(p) >= 3) { out.push(p); }
    }
    return out;
  }

  function phraseRegex(phrase) {
    var p;
    if (/^[a-z' \-]+$/.test(phrase)) {
      p = '\\b' + escapeRe(phrase);
      p += /[sentdy]$/.test(phrase) ? '\\w{0,3}\\b' : '\\b';
    } else {
      p = escapeRe(phrase);
    }
    return new RegExp(p, 'gi');
  }

  var PHRASE_LIST = (function () {
    var out = [], lang, i, items;
    for (lang in PHRASES) {
      if (Object.prototype.hasOwnProperty.call(PHRASES, lang)) {
        items = PHRASES[lang];
        for (i = 0; i < items.length; i++) {
          out.push({ phrase: items[i], re: phraseRegex(items[i]) });
        }
      }
    }
    return out;
  }());

  function findAll(re, text) {
    var out = [], m;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      out.push({ s: m.index, e: m.index + m[0].length, t: m[0] });
      if (m[0].length === 0) { re.lastIndex++; }
    }
    return out;
  }

  function mean(a) {
    var s = 0, i;
    if (!a.length) { return 0; }
    for (i = 0; i < a.length; i++) { s += a[i]; }
    return s / a.length;
  }

  function pstdev(a) {
    var m = mean(a), s = 0, i;
    if (!a.length) { return 0; }
    for (i = 0; i < a.length; i++) { s += (a[i] - m) * (a[i] - m); }
    return Math.sqrt(s / a.length);
  }

  function round(n, d) {
    var f = Math.pow(10, d);
    return Math.round(n * f) / f;
  }

  /* Pick non-overlapping ranges, strongest kind first, then return them in text order. */
  function resolveRanges(cands) {
    var sorted = cands.slice().sort(function (a, b) {
      if (b.pri !== a.pri) { return b.pri - a.pri; }
      if ((b.e - b.s) !== (a.e - a.s)) { return (b.e - b.s) - (a.e - a.s); }
      return a.s - b.s;
    });
    var kept = [], i, j, c, clash;
    for (i = 0; i < sorted.length; i++) {
      c = sorted[i];
      clash = false;
      for (j = 0; j < kept.length; j++) {
        if (c.s < kept[j].e && kept[j].s < c.e) { clash = true; break; }
      }
      if (!clash) { kept.push(c); }
    }
    kept.sort(function (a, b) { return a.s - b.s; });
    return kept;
  }

  function analyzeText(raw, text) {
    var words = text.match(WORD) || [];
    var wc = words.length;
    function perK(n) { return wc ? round(n * 1000 / wc, 1) : 0; }

    var cands = [];
    var i, j, k, hits, m;

    /* stock phrases */
    var phraseHits = {}, phraseTotal = 0;
    for (i = 0; i < PHRASE_LIST.length; i++) {
      hits = findAll(PHRASE_LIST[i].re, text);
      if (hits.length) {
        phraseHits[PHRASE_LIST[i].phrase] = (phraseHits[PHRASE_LIST[i].phrase] || 0) + hits.length;
        phraseTotal += hits.length;
        for (j = 0; j < hits.length; j++) {
          cands.push({ s: hits[j].s, e: hits[j].e, kind: 'phrase', pri: 3 });
        }
      }
    }

    /* connector openers */
    var transitionHits = {}, transitionTotal = 0, re;
    for (i = 0; i < TRANSITIONS.length; i++) {
      re = new RegExp('(^|[.!?]\\s+|\\n)(' + escapeRe(TRANSITIONS[i]) + ')\\b', 'gi');
      m = null;
      hits = 0;
      while ((m = re.exec(text)) !== null) {
        hits++;
        cands.push({
          s: m.index + m[1].length,
          e: m.index + m[1].length + m[2].length,
          kind: 'conn',
          pri: 1
        });
      }
      if (hits) {
        transitionHits[TRANSITIONS[i]] = hits;
        transitionTotal += hits;
      }
    }

    /* contrast framing */
    var contrast = [];
    for (i = 0; i < CONTRAST_PATTERNS.length; i++) {
      hits = findAll(CONTRAST_PATTERNS[i], text);
      for (j = 0; j < hits.length; j++) {
        contrast.push(hits[j].t.replace(/^\s+|\s+$/g, '').slice(0, 140));
        cands.push({ s: hits[j].s, e: hits[j].e, kind: 'contrast', pri: 4 });
      }
    }

    /* placeholders and meta text */
    var placeholders = [];
    for (i = 0; i < PLACEHOLDER_PATTERNS.length; i++) {
      hits = findAll(PLACEHOLDER_PATTERNS[i], text);
      for (j = 0; j < hits.length; j++) {
        placeholders.push(hits[j].t.replace(/^\s+|\s+$/g, '').slice(0, 100));
        cands.push({ s: hits[j].s, e: hits[j].e, kind: 'ph', pri: 5 });
      }
    }

    /* line based checks */
    var lines = text.split('\n');
    var nonblank = [], headings = [], bullets = [], emojiHeadings = [], closing = [];
    var offset = 0, line, lead, endPos;
    for (i = 0; i < lines.length; i++) {
      line = lines[i];
      if (line.replace(/\s+/g, '')) {
        nonblank.push(line);
        if (HEADING.test(line)) {
          headings.push(line);
          if (EMOJI.test(line)) { emojiHeadings.push(line.replace(/^\s+|\s+$/g, '')); }
        }
        if (BULLET.test(line)) { bullets.push(line); }
        if (CLOSING_HEADING.test(line)) {
          closing.push(line.replace(/^\s+|\s+$/g, ''));
          lead = line.length - line.replace(/^\s+/, '').length;
          endPos = line.replace(/\s+$/, '').length;
          cands.push({ s: offset + lead, e: offset + endPos, kind: 'close', pri: 2 });
        }
      }
      offset += line.length + 1;
    }

    var emDashes = text.split('—').length - 1;
    var boldCount = (text.match(BOLD) || []).length;
    var rawMarkdown = /\*\*[^*\n]+\*\*|^#{1,6}\s/m.test(raw);

    var sents = sentences(text);
    var lens = [];
    for (i = 0; i < sents.length; i++) { lens.push(countWords(sents[i])); }
    var meanLen = lens.length ? round(mean(lens), 1) : 0;
    var sd = lens.length > 1 ? pstdev(lens) : 0;
    var cv = meanLen ? round(sd / meanLen, 2) : 0;

    var rawParas = text.split(/\n\s*\n/), plens = [];
    for (i = 0; i < rawParas.length; i++) {
      if (countWords(rawParas[i]) >= 5 && !HEADING.test(rawParas[i].replace(/^\s+|\s+$/g, ''))) {
        plens.push(countWords(rawParas[i]));
      }
    }
    var pmean = mean(plens);
    var pcv = (plens.length > 2 && pmean) ? round(pstdev(plens) / pmean, 2) : 0;

    var metrics = {
      words: wc,
      sentences: sents.length,
      avg_sentence_words: meanLen,
      sentence_length_variation: cv,
      paragraphs: plens.length,
      paragraph_length_variation: pcv,
      em_dashes: emDashes,
      em_dashes_per_1000_words: perK(emDashes),
      bold_spans: boldCount,
      bold_per_1000_words: perK(boldCount),
      headings: headings.length,
      headings_per_1000_words: perK(headings.length),
      bullet_lines: bullets.length,
      bullet_share_of_lines: nonblank.length ? round(bullets.length / nonblank.length, 2) : 0,
      emoji_headings: emojiHeadings.length,
      phrase_hits_total: phraseTotal,
      phrase_hits_per_1000_words: perK(phraseTotal),
      transition_openers: transitionTotal,
      contrast_framing: contrast.length
    };

    var sig = [];
    if (wc < 120) { sig.push('short'); }
    if (placeholders.length) { sig.push('placeholder'); }
    if (wc >= 120 && phraseTotal && metrics.phrase_hits_per_1000_words >= 6) {
      sig.push('phrases_high');
    } else if (phraseTotal >= 3) {
      sig.push('phrases_some');
    }
    if (contrast.length >= 2) { sig.push('contrast'); }
    if (wc >= 200 && metrics.em_dashes_per_1000_words >= 10) { sig.push('emdash'); }
    if (wc >= 200 && metrics.bold_per_1000_words >= 15) { sig.push('bold'); }
    if (wc >= 200 && metrics.headings_per_1000_words >= 12) { sig.push('headings'); }
    if (wc >= 100 && metrics.bullet_share_of_lines >= 0.6) { sig.push('bullets'); }
    if (emojiHeadings.length && emojiHeadings.length >= Math.max(3, Math.floor(headings.length / 2))) {
      sig.push('emoji');
    }
    if (closing.length) { sig.push('closing'); }
    if (transitionTotal >= 3 && sents.length && transitionTotal / sents.length >= 0.15) {
      sig.push('connectors');
    }
    if (sents.length >= 8 && cv && cv < 0.3) { sig.push('uniform'); }
    if (rawMarkdown) { sig.push('markdown'); }

    var phraseList = [];
    for (k in phraseHits) {
      if (Object.prototype.hasOwnProperty.call(phraseHits, k)) {
        phraseList.push([k, phraseHits[k]]);
      }
    }
    phraseList.sort(function (a, b) { return b[1] - a[1]; });

    return {
      metrics: metrics,
      signalKeys: sig,
      phraseList: phraseList,
      transitionHits: transitionHits,
      contrastExamples: contrast.slice(0, 8),
      placeholders: placeholders.slice(0, 8),
      closingHeadings: closing,
      emojiHeadings: emojiHeadings.slice(0, 6),
      ranges: resolveRanges(cands)
    };
  }

  function analyze(raw) {
    var res = analyzeText(raw, stripCode(raw, false));
    if (raw.indexOf('`') !== -1) {
      /* numbers come from the scan_text.py compatible pass, ranges from the offset-safe one */
      res.ranges = analyzeText(raw, stripCode(raw, true)).ranges;
    }
    return res;
  }

  return {
    analyze: analyze,
    signalsEn: SIGNALS_EN
  };
}));
