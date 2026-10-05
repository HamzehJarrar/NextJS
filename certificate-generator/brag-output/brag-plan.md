# /brag plan — مولّد الشهادات (Certificate Generator)

## Rubric

- **What is it?** A browser-only tool that turns an Excel list of names into a designed certificate PDF for every participant, in one click.
- **Who is it for?** Trainers, bootcamps and course organizers (Arabic-first, also English) who currently type each participant's name into Word, one by one.
- **What sets it apart?** Arabic done right (letters drawn on canvas so they connect, which browser PDF libraries get wrong), and it runs entirely in the browser: no server, files never leave the device.
- **Most impressive / funniest claim:** One Excel file in, one ZIP out, with a separate PDF named after each person. Nobody types a name by hand.
- **Visual hook:** A stack of real certificates dealt like cards. Every card is identical except the name, and the ID ticks up: CERT-2026-0001, 0002…
- **Real UI to show:** the drop zone with the real sample file, the live certificate preview switching template, color and font, the ZIP button, the progress bar ("عم نجهّز 3 من 4…"), and the output PDFs named `1-سارة محمود.pdf`…
- **Tone:** `default`: punchy, playful, clean. Warm paper palette, gold certificate, amber UI.
- **Share caption:** "شهادة لكل مشارك، من ملف Excel واحد. ولا اسم بتكتبه بإيدك."

## Angle

The pain everyone knows: 200 names, 200 certificates, typed by hand. The app makes it one upload and one click. Show the product doing exactly that, with its real certificates, real copy and real sample data.

## Visual identity (from the code)

- Background: paper `#f4f1ea` with the app's grain overlay; ink `#1f1c17`.
- Certificate gold `#b08d3a` (the default `primaryColor`); UI amber-700 `#b45309`.
- Fonts: Cairo 800 for headlines (also the certificate font), IBM Plex Sans Arabic for UI text.
- Real assets: `lib/drawCertificate.js` renders every certificate; the app's compiled CSS styles the UI panels; names come from `public/sample-participants.xlsx`.

## Format

Landscape 1920×1080, 30fps, 21.43s (exactly 10 bars at 112 BPM, so every cut lands on the beat).

## Storyboard

| # | Time | Scene | On screen | Motion | Sound |
|---|---|---|---|---|---|
| 1 | 0.00–3.21 | **Hook** | Real classic certificates dealt into a fanned stack, a different name on each, ID ticking up. Text: "شهادة لكل مشارك." then "ولا اسم بتكتبه بإيدك." | Cards fly in, accelerating; text lines rise in and hold | Soft paper swish per card, quiet pad + pluck intro |
| 2 | 3.21–6.43 | **Reveal** | 🎓 مولّد الشهادات (real header) + "من ملف Excel… لشهادة PDF لكل واحد" | Stack drops away, dip to paper, title scales in, subtitle word by word | Drums enter on the cut |
| 3 | 6.43–10.71 | **Upload** | Real step card "1. ملف المشاركين" with drop zone; `sample-participants.xlsx` dragged in by a cursor; zone turns amber; "تم تحميل: sample-participants.xlsx"; the 4 real names cascade out | Cursor drag, drop, rows stagger in | Soft click on grab, drop thump, light ticks per name |
| 4 | 10.71–15.00 | **Design** | Real step "2. تصميم الشهادة" with the live preview for ليان يوسف (her sample row has course "تصميم واجهات المستخدم"); chips: template كلاسيكي → عصري → بسيط, color gold → teal, font Cairo → Amiri → Aref Ruqaa. Caption: "٣ قوالب · ١٢ خط · أي لون" | Cursor clicks each chip, certificate swaps on each click | Tuned click per change |
| 5 | 15.00–18.21 | **Download** | Real step "3. التنزيل": ZIP button "ZIP: ملف PDF لكل واحد (4)" pressed; progress bar with "عم نجهّز 1…4 من 4…"; 4 real PDF thumbnails pop out named `1-سارة محمود.pdf` … `4-Omar Hassan.pdf` | Press, bar fills, files pop in a row | Press click, rising ticks, success chime in key |
| 6 | 18.21–21.43 | **Outro** | 🎓 مولّد الشهادات + "كله بالمتصفح. ملفاتك ما بتطلع من جهازك." + "عربي · English" | Files fold away, title settles, hold | Final chord, ring-out |

Durations: 3.21 + 3.21 + 4.29 + 4.29 + 3.21 + 3.21 = 21.43s.

## Music

Original synthesized track: D major, 112 BPM, progression D – A – Bm – G repeating, warm electric-piano pluck arpeggio, soft pad, round sub bass. Bars 1–2 intro (pad + pluck), drums (soft kick, shaker, light clap on 2 & 4) from the Reveal cut, final bar is a held D chord ringing out. Sound effects are pitched to the key (clicks on D/A, chime D–F#–A–D) and mixed under the music.
