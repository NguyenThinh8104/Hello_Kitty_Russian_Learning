# Aymi Russian 1.2 · Русский A1

An iPad and Windows Russian A1 study app for the 2017 second edition of **I Love Russian for Beginners / Я люблю русский язык**. Choose **English or Tiếng Việt** in the header or Settings. Russian lesson text is retained. The selected interface language is saved on the device.

Version 1.2 uses the unchanged wallpaper supplied by the user, a floating sidebar and toolbar, softer study cards and dialogs, and four skill shortcuts. The sidebar greeting is `ураааааааа`. Layouts are checked at 1180×820 and 820×1180.

## Open the Windows app

Open `artifacts/aymi-native/win-unpacked/Aymi Russian.exe`, or extract **Aymi-Russian-Windows.zip** and open the exe inside its folder. Keep all companion files together. The packaged app includes lessons and the personal PDF supplied for this project; .NET, Safari, and a local server are not required. The Windows executable is not signed with a commercial certificate.

## Build an iPad IPA from Windows

**Previous verified 1.1 build:** [GitHub Actions run 45340390076](https://github.com/NguyenThinh8104/Hello_Kitty_Russian_Learning/actions/runs/45340390076) succeeded. The downloaded `artifacts/ios/Aymi-Russian-unsigned.ipa` was checked for SHA-256 integrity, Aymi Russian display name, arm64 Mach-O code, native speech frameworks, and exclusion of the private PDF. SHA-256: `4582b5b8b6ff01a71f10616b1ecb0b8685a30ee90d8818f5d113e47eda0ef5c6`. It remains unsigned; sign it using your existing installation method.

Source repository: [Hello_Kitty_Russian_Learning](https://github.com/NguyenThinh8104/Hello_Kitty_Russian_Learning).

Use **Actions > Aymi Russian - Build iPad IPA > Run workflow**. GitHub provides a macOS runner with Xcode; the Windows computer controls the process without installing Xcode locally. A push that changes `.github/ipa-build-request.txt` also requests a build. Ordinary source edits do not automatically start another run. New requests replace older builds for the same branch.

After a successful run, download **Aymi-Russian-iPad-unsigned** from Artifacts and extract `Aymi-Russian-unsigned.ipa`. This is a compiled arm64 application, **unsigned**. Sign and install it using your own Apple account and a compatible Windows sideloading tool; opening an unsigned IPA directly on an iPad will not install it. Follow the [official AltStore Windows instructions](https://faq.altstore.io/altstore-classic/how-to-install-altstore-windows). Free personal signing has renewal limits. No Apple password, certificate, or signing key is needed by this build workflow.

The public GitHub source excludes the personal textbook PDF. On iPad, add your copy through **Settings > Add textbook PDF from Files** (up to 60 MB). It stays on the device. Source for a local Mac build can include the private PDF separately. More detailed setup notes are in `BUILD-IPA-TREN-WINDOWS.md` and `CAI-IPAD-MAC-M1.md`.

## Practice content

- 14 chapters follow the textbook's contents and printed page numbers.
- 126 typed listening questions and 126 reading questions requiring full Russian sentences, using 84 distinct passages. Reading text and answers have independent scroll areas. Model matching accepts listed alternatives; other correct formulations may require teacher review.
- Eight speaking topics from the supplied DOCX, with guiding questions, model monologues, editable speech recognition, recording, and online transcript corrections.
- 42 writing prompts with model responses; 14 grammar units and 42 grammar exercises.
- 814 chapter vocabulary cards (721 different words/expressions), covering all 14 end-of-chapter glossaries plus introductory and selected practice vocabulary. Russian stress marks, English/Vietnamese meanings, 143 local illustrations, and Google audio. All 33 alphabet letters are retained.
- Three practice sets per listening/reading/writing skill, separate drafts and scores, retry only incorrect answers, and JSON backup/restore.
- The user-supplied Hello Kitty logo, pink/bow theme, accessible dialogs, and iPad portrait/landscape layouts.
- Seekable audio tracks, five-second rewind/forward, speed controls, and repeat.

Texts and questions are original supplementary practice aligned with selected textbook topics. They are not a complete digitization of the book or official textbook questions. Chapter 14 uses original short A1 stories. Independent review by a native Russian instructor has not been completed.

| Chapter | Textbook title | Printed pages |
|---|---|---|
| 1 | Привет! | 6–15 |
| 2 | Кто вы? | 16–25 |
| 3 | Моя семья | 26–41 |
| 4 | Живу, учусь, работаю | 42–53 |
| 5 | Города, страны | 54–65 |
| 6 | Что вы делали вчера? | 66–75 |
| 7 | Ресторан | 76–89 |
| 8 | Мой день | 90–103 |
| 9 | Кино. Музыка. Театр | 104–119 |
| 10 | Дом, квартира | 120–133 |
| 11 | В университете | 134–145 |
| 12 | День рождения | 146–159 |
| 13 | В городе | 160–175 |
| 14 | Читаем русскую литературу | 176–185 |

The provided scan has 192 PDF pages; PDF page number = printed page + 1. The original audio catalog contains 41 verified Module 1 tracks for chapters 1–13 from [Liden & Denz](https://resources.lidenz.ru/audio/a1v2/l1/m1/). These recordings are separate from the supplementary questions. No Module 1 recording was verified for chapter 14.

## Audio, speech, and writing

Practice audio uses the Google Translate web reading endpoint, fixed to Russian (`tl=ru`). Passages are fetched in chunks up to 180 characters, decoded, and combined into one PCM WAV timeline for seeking. Single words use MP3 directly. Recent MP3 clips are cached in memory; new clips need Internet. On iPad, tap the native Play control if automatic playback is restricted. This is an undocumented Translate web endpoint, not Google Cloud TTS or original textbook audio. It may be limited or changed by Google. Failures are shown clearly; the app does not silently switch to another voice.

The iPad shell uses Apple speech recognition through `@capgo/capacitor-speech-recognition` and native recording through `capacitor-voice-recorder`. Allow Microphone and Speech Recognition when prompted. Apple may process recognized audio online. Windows supports microphone recording and playback; live Chromium recognition is not assumed to work. Topic recognition/recording allows up to two minutes per take. Apple may finish recognition earlier; tap Start / continue to append another take. Review recognition errors before sending the transcript to LanguageTool. Feedback concerns the transcript, not pronunciation, fluency, or topic completeness. No fake pronunciation score is shown.

Writing is sent to LanguageTool only after explicit consent and pressing Check. Text is limited to 5,000 characters; corrections can be applied individually. Service failures do not become a false clean result. LanguageTool checks spelling and selected grammar rules, not full CEFR quality or whether the response answers the task. See its [API terms](https://dev.languagetool.org/public-http-api) and [privacy policy](https://languagetool.org/legal/privacy).

Progress and drafts remain on each device. Export/import JSON to transfer between the browser and installed apps; there is no account synchronization. Backups from earlier versions remain compatible. Grading distinguishes е/ё by default, preserves case endings, and rejects Latin lookalikes.

## Development

Node.js 24 LTS is recommended for the installed app. On a Mac, Xcode 26+ and CocoaPods are also required for iOS.

```bash
cd NgaNgo.App
npm ci
npm run windows
# On macOS:
npm run ios:sync
npx cap open ios
# Or build an unsigned IPA:
cd ..
bash scripts/build-ios-unsigned.sh
```

The installed app bundles its interface locally. Native HTTP/Electron main-process adapters call fixed Google Translate and LanguageTool endpoints; no ASP.NET server is required. The Electron bridge uses context isolation, disabled renderer Node integration, restricted IPC routes, and audio-only microphone permissions.

For the optional ASP.NET preview, use .NET SDK 9:

```powershell
dotnet run --project NgaNgo.Web --launch-profile http
```

Open `http://localhost:5188`, or run `NgaNgo.Web` from the solution in Visual Studio. Do not open `wwwroot/index.html` with a file URL. On Windows SDK installations with a workload resolver error, set `MSBuildEnableWorkloadResolver=false`. Browser microphone access on a remote iPad preview needs trusted HTTPS; the installed iPad app does not use this preview flow.

Optional OpenAI recording transcription belongs to the web backend only. Configure `Speech__ApiKey` and optionally `Speech__Model`; never put keys in frontend files. It has not been live-tested without a key. `appsettings.Local.json`, App_Data, caches, and build artifacts are excluded from Git. The web server supports private PDF range requests, same-origin API protection, request limits, and rate limits. Add authentication and user quotas before exposing a paid-key backend to a class.

## Validation

```powershell
dotnet build Nga_Ngo_Cung_Toi.sln
node --test tests/practice.test.mjs tests/sessions.test.mjs tests/audio.test.mjs tests/native-providers.test.mjs tests/enhancements.test.mjs
node --test tests/api.test.mjs
```

37 tests cover grading, all practice sets, model word counts, backups and progress migration, Google chunking/cache/failures, native adapter behavior, consent, API failures, and private PDF access. Integration tests use local provider fixtures. Glossary stress, bilingual meanings, local illustrations, full-sentence reading, grammar, topic mapping, PCM audio, and new backup fields also have checks.

The Windows app has been run with successful Google Translate playback and in-app PDF viewing. Aymi Russian 1.1 was compiled and archived on GitHub, downloaded, and verified. The packaged Windows 1.1 application was opened successfully on this computer. See the workflow and `artifacts/ios/verification.json`. Signing and installation are separate steps. Microphone, recognition, PDF import, rotation, offline behavior, and backup sharing still require testing on a real iPad.

To package the explicit source allowlists and Windows folder, run `scripts/package-deliverables.py` with Python 3.11+. The GitHub ZIP excludes the textbook; the private Mac source ZIP may include it. The generated Hello Kitty background prompt is recorded in `scripts/hello-kitty-background-prompt.txt`.

## Vocabulary provenance and assets

The chapter glossary lists were visually checked against the supplied scan; chapter 13’s glossary is on printed page 174. Greetings/numbers and additional practice entries are labeled separately from glossary page references. Inflected forms and repeated words are retained where the textbook uses them. This is coverage of the chapter glossaries, not an assertion that every running word in the entire book is a separate flashcard.

Accents and English glosses derive from OpenRussian (CC BY-SA 4.0), with context corrections and Vietnamese explanations. Noto Emoji illustrations are Apache 2.0 and Noto Sans is SIL OFL 1.1. See `NgaNgo.Web/wwwroot/licenses/ATTRIBUTION.md`. The user-supplied original logo is used unchanged; platform icon exports are resized copies.

`scripts/vocabulary-source.json` records reviewed chapter entries. `scripts/vocabulary-reviewed.tsv` corrects ambiguous dictionary senses, translations, and stress. The optional development generator expects the four OpenRussian TSV/CSV files in `.cache/ocr`; production builds use the committed vocabulary-data.js and never translate learner data for these cards.
