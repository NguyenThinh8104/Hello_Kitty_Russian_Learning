# Russian Kitty · Русский A1

An English–Russian study app for the 2017 second edition of **I Love Russian for Beginners / Я люблю русский язык**. The interface, instructions, vocabulary meanings, feedback, settings, and errors are in English. Russian lesson passages, model answers, and spelling rules are retained.

## Open the Windows app

Open `artifacts/native/win-unpacked/Russian Kitty.exe`, or extract **Russian-Kitty-Windows.zip** and open the exe inside its folder. Keep all companion files together. The packaged app includes lessons and the personal PDF supplied for this project; .NET, Safari, and a local server are not required. The Windows executable is not signed with a commercial certificate.

## Build an iPad IPA from Windows

**Verified build:** [GitHub Actions run 45256001239](https://github.com/NguyenThinh8104/Hello_Kitty_Russian_Learning/actions/runs/45256001239) archived successfully with Xcode and produced an unsigned arm64 IPA. A verified local copy is at `artifacts/ios/Russian-Kitty-unsigned.ipa`. SHA-256: `494fc4e4fff970a4dd260d22653a45da0476274e1175a8766f78ae854269a621`. Native speech, recording, PDF, filesystem, and sharing frameworks are included. The downloaded archive was checked for integrity, Mach-O architecture, English page metadata, permission strings, and the absence of the private PDF.

Source repository: [Hello_Kitty_Russian_Learning](https://github.com/NguyenThinh8104/Hello_Kitty_Russian_Learning).

Use **Actions > Russian Kitty - Build iPad IPA > Run workflow**. GitHub provides a macOS runner with Xcode; the Windows computer controls the process without installing Xcode locally. A push that changes `.github/ipa-build-request.txt` also requests a build. Ordinary source edits do not automatically start another run. New requests replace older builds for the same branch.

After a successful run, download **Russian-Kitty-iPad-unsigned** from Artifacts and extract `Russian-Kitty-unsigned.ipa`. This is a compiled arm64 application, **unsigned**. Sign and install it using your own Apple account and a compatible Windows sideloading tool; opening an unsigned IPA directly on an iPad will not install it. Follow the [official AltStore Windows instructions](https://faq.altstore.io/altstore-classic/how-to-install-altstore-windows). Free personal signing has renewal limits. No Apple password, certificate, or signing key is needed by this build workflow.

The public GitHub source excludes the personal textbook PDF. On iPad, add your copy through **Settings > Add textbook PDF from Files** (up to 60 MB). It stays on the device. Source for a local Mac build can include the private PDF separately. More detailed setup notes are in `BUILD-IPA-TREN-WINDOWS.md` and `CAI-IPAD-MAC-M1.md`.

## Practice content

- 14 chapters follow the textbook's contents and printed page numbers.
- 126 typed listening questions and 126 typed reading questions, using 84 distinct passages.
- 84 speaking phrases and 42 writing prompts with model responses.
- 112 selected vocabulary entries, Russian stress marks, and all 33 alphabet letters.
- Three practice sets per listening/reading/writing skill, separate drafts and scores, retry only incorrect answers, and JSON backup/restore.
- Hello Kitty study background and accessible error/set-selection dialogs.

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

Practice audio uses the Google Translate web reading endpoint, fixed to Russian (`tl=ru`). Passages are split into chunks up to 180 characters. Recent MP3 clips are cached in memory for replay; new clips need Internet. This is an undocumented Translate web endpoint, not Google Cloud TTS or original textbook audio. It may be limited or changed by Google. Failures are shown clearly; the app does not silently switch to another voice.

The iPad shell uses Apple speech recognition through `@capgo/capacitor-speech-recognition` and native recording through `capacitor-voice-recorder`. Allow Microphone and Speech Recognition when prompted. Apple may process recognized audio online. Windows supports microphone recording and playback; live Chromium recognition is not assumed to work. Recording stops after 30 seconds. Speech scores compare recognized words with the model; they do not assess phonetics, stress, or intonation.

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
node --test tests/practice.test.mjs tests/sessions.test.mjs tests/audio.test.mjs tests/native-providers.test.mjs
node --test tests/api.test.mjs
```

30 tests cover grading, all practice sets, model word counts, backups and progress migration, Google chunking/cache/failures, native adapter behavior, consent, API failures, and private PDF access. Integration tests use local provider fixtures. `scripts/audit-app-language.mjs` checks learner text for remaining Vietnamese fragments.

The Windows app has been run with successful Google Translate playback and in-app PDF viewing. The English–Russian iOS app has also been compiled and archived successfully on GitHub; its unsigned IPA was downloaded and verified. Signing and installation are separate steps. Microphone, recognition, PDF import, rotation, offline behavior, and backup sharing still require testing on a real iPad.

To package the explicit source allowlists and Windows folder, run `scripts/package-deliverables.py` with Python 3.11+. The GitHub ZIP excludes the textbook; the private Mac source ZIP may include it. The generated Hello Kitty background prompt is recorded in `scripts/hello-kitty-background-prompt.txt`.
