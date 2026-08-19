Skip to content
hokenpwnz
YMContextMenu
Repository navigation
Code
Issues
Pull requests
Actions
Projects
Security and quality
Insights
Settings
Commit 88eefb4
hokenpwnz
hokenpwnz
authored
48 minutes ago
·
·
Verified
Update script.js
main
1 parent 
8fb4639
 commit 
88eefb4
1 file changed

+122
-47
Lines changed: 122 additions & 47 deletions
File tree
Filter files…
script.js
Search within code
 
‎script.js‎
+122
-47
Lines changed: 122 additions & 47 deletions
Original file line number	Diff line number	Diff line change
@@ -1,3 +1,4 @@
```javascript
"use strict";
let currentTrack = null;
@@ -27,14 +28,15 @@ function escapeHtml(text) {
// ==================================================
function getTrackUrl(track) {
    const albumId =
        track?.album_id ||
        track?.albums?.[0]?.id;
    const trackId =
        track?.track_id ||
        track?.realId ||
        track?.id;
    // Сервер теперь сам формирует готовый URL.
    if (track?.url) {
        return track.url;
    }
    // Запасной вариант.
    const albumId = track?.album_id;
    const trackId = track?.track_id;
    if (!albumId || !trackId) {
        return "";
@@ -54,25 +56,45 @@ function getTrackUrl(track) {
// ==================================================
function getCoverUrl(track) {
    if (!track?.cover) {
        return "";
    }
    return "https://ympulsesync-server.onrender.com/cover";
    let url = track.cover;
    // Если сервер вдруг отдаст URL без протокола.
    if (
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {
        url = "https://" + url;
    }
    // На всякий случай поддерживаем старый формат Yandex.
    url = url.replace(
        "%%",
        "200x200"
    );
    return url;
}
// ==================================================
// Открыть трек
// ==================================================
function openTrack() {
    if (!currentTrack?.url) {
        return;
    }
    window.open(
        currentTrack.url,
        "_blank"
        "_blank",
        "noopener,noreferrer"
    );
}
@@ -82,6 +104,7 @@ function openTrack() {
// ==================================================
async function copyTrack() {
    if (!currentTrack) {
        return;
    }
@@ -92,19 +115,28 @@ async function copyTrack() {
        currentTrack.title;
    try {
        await navigator.clipboard.writeText(text);
        await navigator.clipboard.writeText(
            text
        );
    }
    catch (error) {
        const textarea =
            document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        document.body.appendChild(
            textarea
        );
        textarea.select();
        document.execCommand("copy");
        document.execCommand(
            "copy"
        );
        textarea.remove();
    }
@@ -116,17 +148,8 @@ async function copyTrack() {
// ==================================================
async function updateTrack() {
    try {
        /*
         * Пока оставляем локальный адрес.
         *
         * ВАЖНО:
         * Twitch Extension не сможет нормально использовать
         * 127.0.0.1 пользователя как удалённый сервер.
         *
         * Этот адрес нужен для локального тестирования.
         */
    try {
        const response = await fetch(
            "https://ympulsesync-server.onrender.com/track",
@@ -138,6 +161,7 @@ async function updateTrack() {
        if (!response.ok) {
            throw new Error(
                "PulseSync HTTP " +
                response.status
@@ -153,9 +177,15 @@ async function updateTrack() {
            data.track;
        // ==================================================
        // Ничего не играет
        // ==================================================
        if (!track) {
            document.getElementById("app").innerHTML = `
            document.getElementById(
                "app"
            ).innerHTML = `
                <div class="error">
                    Сейчас ничего не играет
                </div>
@@ -167,51 +197,85 @@ async function updateTrack() {
        }
        // ==================================================
        // Исполнитель
        // ==================================================
        const artist =
    track.artist ||
    (track.artists || [])
        .map(function (artist) {
            return artist.name;
        })
        .join(", ") ||
    "Неизвестный исполнитель";
            track.artist ||
            "Неизвестный исполнитель";
        // ==================================================
        // Название
        // ==================================================
        const title =
            track.title ||
            "Без названия";
        // ==================================================
        // URL
        // ==================================================
        const url =
            getTrackUrl(track);
        // ==================================================
        // Обложка
        // ==================================================
        const cover =
            getCoverUrl(track);
        // ==================================================
        // Сохраняем текущий трек
        // ==================================================
        currentTrack = {
            artist: artist,
            title: title,
            url: url
        };
        // ==================================================
        // Статус
        // ==================================================
        const status =
            data.status === "playing"
                ? "▶ Сейчас играет"
                : "⏸ Пауза";
        document.getElementById("app").innerHTML = `
        // ==================================================
        // HTML
        // ==================================================
        document.getElementById(
            "app"
        ).innerHTML = `

            <div class="card">

                <img
                    class="cover"
                    src="${escapeHtml(cover)}"
                    alt=""
                >
                ${
                    cover
                        ? `
                            <img
                                class="cover"
                                src="${escapeHtml(cover)}"
                                alt=""
                            >
                        `
                        : ""
                }

                <div class="info">

@@ -228,13 +292,15 @@ async function updateTrack() {
                        <button
                            class="open"
                            id="open-button"
                            type="button"
                        >
                            🎧 Открыть в Яндекс Музыке
                        </button>

                        <button
                            class="copy"
                            id="copy-button"
                            type="button"
                        >
                            📋 Скопировать
                        </button>
@@ -251,21 +317,23 @@ async function updateTrack() {
        `;
        /*
         * Вешаем обработчики через JS.
         *
         * Это важно для Twitch CSP:
         * никаких onclick="..." внутри HTML.
         */
        // ==================================================
        // Обработчики кнопок
        // ==================================================
        const openButton =
            document.getElementById("open-button");
            document.getElementById(
                "open-button"
            );
        const copyButton =
            document.getElementById("copy-button");
            document.getElementById(
                "copy-button"
            );
        if (openButton) {
            openButton.addEventListener(
                "click",
                openTrack
@@ -274,12 +342,14 @@ async function updateTrack() {
        if (copyButton) {
            copyButton.addEventListener(
                "click",
                copyTrack
            );
        }
    }
    catch (error) {
@@ -289,7 +359,9 @@ async function updateTrack() {
        );
        document.getElementById("app").innerHTML = `
        document.getElementById(
            "app"
        ).innerHTML = `

            <div class="error">

@@ -310,9 +382,12 @@ async function updateTrack() {
updateTrack();
// Обновляем каждые 2 секунды
// ==================================================
// Обновление каждые 2 секунды
// ==================================================
setInterval(
    updateTrack,
    2000
);
);
```
0 commit comments
Comments
0
 (0)
Comment
You're not receiving notifications from this thread.

 
