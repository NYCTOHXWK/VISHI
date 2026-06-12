19 YEARS, 19 CHAPTERS — SETUP GUIDE

1. How to change her name
Open js/config.js and edit girlName under the comment: // CHANGE HER NAME HERE

2. How to change birthday date
Open js/config.js and edit birthdayDate plus unlockSettings.finalUnlock under: // CHANGE BIRTHDAY DATE HERE
The default final unlock is 18 June 2026 at 00:00:00 Asia/Kolkata, stored as 2026-06-18T00:00:00+05:30.
The pre-final unlock is unlockSettings.preFinalUnlock: 2026-06-17T23:45:00+05:30.

3. How to change usernames
Open js/config.js and edit the username fields under:
// CHANGE ADMIN USERNAME HERE
// CHANGE BIRTHDAY GIRL USERNAME HERE

4. How to change passwords
Plaintext passwords are not stored. js/config.js stores SHA-256 passwordHash values only.
Default hashes are for the temporary password: change_me
To change a password, generate a SHA-256 hash for the new password and paste it into passwordHash under:
// CHANGE ADMIN PASSWORD HERE
// CHANGE BIRTHDAY GIRL PASSWORD HERE
Example terminal command:
python3 -c "import hashlib; print(hashlib.sha256(b'YOUR_NEW_PASSWORD').hexdigest())"

5. Where to place photos
Place local photos in assets/images/ and name them ch1.jpg through ch19.jpg, or edit each chapter image path in js/config.js.
The actual photo files are intentionally not committed because Codex PRs do not support binary media files. Add them locally or in your deployment after merging.
Every chapter media area includes the comment: Replace with your personal image.

6. Where to place videos
Place the surprise video at assets/videos/surprise.mp4, or change media.videoPath in js/config.js.
The actual video file is intentionally not committed because Codex PRs do not support binary media files. Add it locally or in your deployment after merging.
The final chapter includes the comment: Replace with your personal video.

7. Where to place music
Place background music at assets/audio/background.mp3 and birthday music at assets/audio/birthday-song.mp3, or edit media.musicPath and media.birthdaySongPath in js/config.js.
The actual audio files are intentionally not committed because Codex PRs do not support binary media files. Add them locally or in your deployment after merging.
If audio is missing, the site disables the music control gracefully.

8. How the unlock system works
On first successful experience load, the website stores journeyStart and a validated unlock schedule in localStorage.
Chapter 1 unlocks immediately. Chapters 2 through 18 are spaced evenly from journeyStart until PRE_FINAL_UNLOCK: 17 June 2026 23:45:00 Asia/Kolkata. Chapter 19 unlocks exactly at FINAL_UNLOCK: 18 June 2026 00:00:00 Asia/Kolkata.
If first launch happens after PRE_FINAL_UNLOCK, Chapters 1–18 unlock immediately and Chapter 19 remains locked until midnight.
The schedule is not recalculated unless the admin resets progress. The client validates schedule shape and final timestamps to deter tampering.

9. How admin login works
Open login.html and sign in with the admin credentials from js/config.js. Admin users are routed to admin-dashboard.html. Birthday-girl users are routed to index.html.
Direct access to admin-dashboard.html and debug-mobile.html is blocked unless the active validated session has role "admin".
Sensitive admin actions require admin password re-authentication.

10. Private mode and security notes
privateMode.enabled in js/config.js enables deterrents: right-click blocking, image drag blocking, protected text selection blocking, brief blur on tab loss, and a recipient watermark.
These are deterrents only and do not provide absolute protection against screenshots, developer tools, or a determined user.

11. Offline support
The service worker caches HTML, CSS, JavaScript, setup notes, and chapter pages after the first successful load. Personal media is runtime-cached when the real files exist, but it is not precached so missing private media cannot break service worker installation. For service workers, serve the site over HTTPS or localhost.

12. Vercel security
vercel.json adds CSP, HSTS, clickjacking protection, referrer policy, permissions policy, cross-origin policies, no-index headers, and no-store caching for sensitive pages.
robots.txt disallows all crawlers.
