# Rewrite examples

Contents: 1 Website blurb, 2 Community announcement, 3 Report paragraph, 4 Video script, 5 README, 6 Email, 7 Academic paragraph, 8 English product copy, 9 Short caption, 10 When to leave text alone, 11 When specifics are missing.

How to read these: the "After" versions only use facts that appear in, or are implied by, the "Before" or the stated context. Where a fix would need facts the author must supply, the example shows a gap marker or a question instead of an invented number. Do the same in real work.

---

## 1. Website blurb (Indonesian)

**Before**

> Website merupakan bagian penting dari perkembangan teknologi digital. Dengan berbagai fitur inovatif dan desain modern, website dapat meningkatkan pengalaman pengguna serta memberikan solusi yang efektif bagi berbagai kebutuhan di era digital.

Problems: no feature, no user, no need, no result. Generic opener, three vague adjectives, tail-clause claim.

**After** (assuming the site is a product catalog and these behaviors are true)

> Halaman katalog menampilkan 24 produk per halaman. Filter harga dan kategori bekerja tanpa memuat ulang halaman, dan pilihan filter tetap tersimpan saat pengguna membuka detail produk lalu kembali ke katalog.

Why it works: each sentence names behavior that can be checked. The numbers belong to the original example; if the real catalog differs, use the real figures or ask.

**If the real facts are unknown**, do not write a nicer vague version. Ask: "What does the site actually do for visitors? What's on the main page, and what can someone do there that they couldn't do before?"

---

## 2. Community announcement (Indonesian, casual)

**Before**

> Dengan bangga kami mengumumkan sebuah event spektakuler yang bukan hanya sekadar turnamen biasa, melainkan sebuah perayaan komunitas yang akan menyatukan para pemain dari berbagai penjuru! Nantikan keseruan tanpa batas, hadiah menarik, dan pengalaman tak terlupakan!

**After** (with details the organizer supplied: Saturday, 19.00 WIB, Discord stage, 4 vs 4)

> Turnamen 4 vs 4 digelar Sabtu jam 19.00 WIB, lewat stage di Discord kita. Daftar tim sebelum Jumat malam di channel #pendaftaran. Hadiahnya diumumkan di sana juga.

Notes:
- "Hadiahnya diumumkan di sana juga" is honest when prizes are not yet decided. "Hadiah menarik" is not.
- The community's casual voice is kept. If the original voice was loud and hype, a short punchy line is fine, as long as it says something: "Sabtu jam 19.00 WIB, 4 vs 4, daftar sebelum Jumat. Gas."
- Emoji are a register choice in a Discord post, not slop by themselves. Match the server's usual style.

---

## 3. Report paragraph (Indonesian, formal)

**Before**

> Pengelolaan data merupakan aspek yang sangat krusial dalam organisasi modern. Selain itu, pengelolaan data yang baik juga memiliki peran yang signifikan dalam meningkatkan efisiensi operasional. Oleh karena itu, dapat disimpulkan bahwa pengelolaan data harus menjadi prioritas utama.

Problems: three sentences, one idea, repeated with synonyms; conclusion repeats the premise; no organization, no data, no consequence.

**After** (with a fact the user provided: stock counts were kept in three separate spreadsheets and disagreed at month end)

> Stok barang dicatat di tiga spreadsheet berbeda, dan angkanya tidak sama saat tutup bulan. Tim gudang menghabiskan sekitar dua hari per bulan untuk mencocokkannya. Memusatkan pencatatan di satu sheet akan menghilangkan pekerjaan itu.

If "two days" was not in the user's material, drop that sentence or turn it into a question: "Berapa lama biasanya proses pencocokan itu?" Never fill it with a plausible guess.

The register stays formal; the fix was content, not slang.

---

## 4. Video script narration (Indonesian)

**Before**

> Di era digital yang serba cepat ini, pemrograman Roblox menjadi semakin penting dan krusial. Dalam video kali ini, kita akan mengeksplorasi berbagai konsep yang akan membawa kemampuan scripting kamu ke level selanjutnya!

**After**

> Script kamu error karena satu hal yang sama di sembilan dari sepuluh kasus: variabelnya nil. Kita bedah kenapa itu terjadi dan cara ngeceknya sebelum game kamu crash.

Notes:
- The opener now starts with a concrete situation the viewer recognizes.
- "Sembilan dari sepuluh" is a claim. Keep it only if the author means it as their experience; otherwise write "paling sering" or remove the ratio. When unsure, use the weaker honest wording.
- Narration is for the ear: short sentences, no stacked clauses.

---

## 5. README

**Before**

> # 🚀 SuperTool
> SuperTool is a powerful, flexible, and cutting-edge solution designed to revolutionize your workflow. With its seamless integration and robust feature set, SuperTool empowers developers to unlock their full potential.

**After** (facts supplied: it renames files in bulk from a CSV mapping)

> # SuperTool
> Renames files in bulk using a CSV that maps old names to new ones.
>
> ```
> supertool rename --map names.csv --dir ./photos
> ```
>
> Run with `--dry-run` first to see what would change.

Notes: what it does, how to run it, one safe habit. Mission-statement paragraph deleted, not rephrased. If the real flags differ, use the real ones; ask if unknown.

---

## 6. Email (English)

**Before**

> I hope this email finds you well. I wanted to reach out to touch base regarding the upcoming project timeline. It's important to note that we have several key deliverables that need to be addressed. Please let me know your thoughts at your earliest convenience. Thank you so much for your time and consideration!

**After** (supplied: the design files are due Friday and the sender needs a yes or no on moving the review to Thursday)

> Hi Sam, can we move the design review to Thursday? The files are due Friday and I'd like feedback before then. A yes or no is enough.

Notes: lead with the ask, give the reason, say what kind of reply is needed. If the sender's normal tone is warmer, keep a short greeting; the goal is not coldness.

---

## 7. Academic paragraph (English)

**Before**

> The intricate interplay between social media and adolescent well-being underscores the multifaceted nature of contemporary digital landscapes. Numerous studies have shown that this relationship plays a pivotal role in shaping mental health outcomes.

Problems: inflated vocabulary, "numerous studies" with no source, no claim anyone could test.

**After** (only if the author supplies the study and finding)

> [Author, year] followed [N] adolescents for [period] and found that [specific finding on social media use and wellbeing measure]. The effect was [size/direction], and held after controlling for [variable].

This version is deliberately a template with gaps. Without the study details, the honest rewrite is a request: "Which studies are you relying on? I can write the paragraph once I have the findings and the citations." Do not fabricate a study, a sample size or an effect size.

---

## 8. English product copy

**Before**

> Experience the next generation of productivity. Our revolutionary platform seamlessly integrates with your workflow to unlock unparalleled efficiency and drive meaningful results.

**After** (supplied: it syncs tasks between Google Calendar and a to-do app and sends a daily 8 a.m. summary)

> Syncs your Google Calendar with your to-do list, and sends one summary at 8 a.m. with what's due today.

One sentence, two checkable behaviors. If the user cannot supply behaviors, say that the copy cannot be made specific yet and ask what the product does.

---

## 9. Short caption (Indonesian)

**Before**

> Momen tak terlupakan bersama keluarga besar kami, yang menjadi bukti nyata bahwa kebersamaan adalah kunci kebahagiaan sejati. ✨💖🌟

**After**

> Kumpul keluarga di rumah nenek, 40 orang dan satu panci rendang yang habis dalam sepuluh menit.

Only valid if the detail is the author's. Without it, the rewrite is short and honest: "Kumpul keluarga di rumah nenek." A short plain caption beats a padded one.

---

## 10. When to leave text alone

Do not "fix" these:

- A formal government letter that uses "dengan hormat" and "sehubungan dengan". That is the genre.
- A tutorial's numbered list and bold UI labels.
- A legal clause with deliberately repetitive wording.
- A poem, lyric or quote the user is working with.
- A text with one em dash and one "selain itu".
- A long text where each paragraph carries distinct information.

Report these as fine. Inventing problems to look useful is its own failure.

---

## 11. When specifics are missing

Use this pattern when the original is empty and the user has not provided the facts:

1. Rewrite what can be written honestly (shorter, no inflation, no fake claims).
2. Mark the gap in the text with a plain bracket the user will notice, such as `[tambahkan: jumlah anggota]`, or leave it out and mention it in your reply.
3. End with 2 to 4 short questions whose answers would let you finish the text.

A shorter honest text with a clearly labeled gap is better than a longer text that sounds complete and is vague or invented.
