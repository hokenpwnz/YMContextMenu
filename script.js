"use strict";

const API_URL = "https://ympulsesync-server.onrender.com/track";

let currentTrack = null;

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (char) {
        const symbols = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return symbols[char];
    });
}

function getCoverUrl(track) {
    if (!track || !track.cover) {
        return "";
    }

    let url = track.cover;

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }

    return url;
}

function openTrack() {
    if (!currentTrack || !currentTrack.url) {
        return;
    }

    window.open(
        currentTrack.url,
        "_blank",
        "noopener,noreferrer"
    );
}

function openYandexTrack() {
    if (!currentTrack || !currentTrack.yandex_url) {
        return;
    }

    window.open(
        currentTrack.yandex_url,
        "_blank",
        "noopener,noreferrer"
    );
}

async function copyTrack() {
    if (!currentTrack) {
        return;
    }

    const text =
        (currentTrack.artist || "") +
        " — " +
        (currentTrack.title || "");

    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        const textarea = document.createElement("textarea");

        textarea.value = text;
        document.body.appendChild(textarea);

        textarea.select();
        document.execCommand("copy");

        textarea.remove();
    }
}

async function updateTrack() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                "PulseSync HTTP " + response.status
            );
        }

        const data = await response.json();

        console.log(
            "LASTFM TRACK:",
            data.track
                ? data.track.artist + " - " + data.track.title
                : "none",
            "| status:",
            data.status,
            "| cover:",
            data.track && data.track.cover ? "yes" : "no"
        );

        const track = data.track;

        if (!track) {
            currentTrack = null;

            document.getElementById("app").innerHTML = `
                <div class="error">
                    Сейчас ничего не играет
                </div>
            `;

            return;
        }

        const artist =
            track.artist || "Неизвестный исполнитель";

        const title =
            track.title || "Без названия";

        const album =
            track.album || "";

        const cover =
            getCoverUrl(track);

        const url =
            track.url || "";

        const yandexUrl =
            track.yandex_url || "";

        currentTrack = {
            artist: artist,
            title: title,
            album: album,
            url: url,
            yandex_url: yandexUrl
        };

        const status =
            data.status === "playing"
                ? "▶ Сейчас играет"
                : "⏸ Пауза";

        document.getElementById("app").innerHTML = `
            <div class="card">

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

                    <div class="artist">
                        ${escapeHtml(artist)}
                    </div>

                    <div class="title">
                        ${escapeHtml(title)}
                    </div>

                    <div class="buttons">

                        ${
                            url
                                ? `
                                    <button
                                        class="open"
                                        id="open-button"
                                        type="button"
                                    >
                                        🎧 Открыть на Last.fm
                                    </button>
                                `
                                : ""
                        }

                        ${
                            yandexUrl
                                ? `
                                    <button
                                        class="yandex"
                                        id="yandex-button"
                                        type="button"
                                    >
                                        🎵 Яндекс Музыка
                                    </button>
                                `
                                : ""
                        }

                        <button
                            class="copy"
                            id="copy-button"
                            type="button"
                        >
                            📋 Скопировать
                        </button>

                    </div>

                    <div class="status">
                        ${status}
                    </div>

                </div>

            </div>
        `;

        const openButton =
            document.getElementById("open-button");

        const yandexButton =
            document.getElementById("yandex-button");

        const copyButton =
            document.getElementById("copy-button");

        if (openButton) {
            openButton.addEventListener(
                "click",
                openTrack
            );
        }

        if (yandexButton) {
            yandexButton.addEventListener(
                "click",
                openYandexTrack
            );
        }

        if (copyButton) {
            copyButton.addEventListener(
                "click",
                copyTrack
            );
        }

    } catch (error) {
        console.error(
            "PulseSync error:",
            error
        );

        document.getElementById("app").innerHTML = `
            <div class="error">
                ❌ Не удалось получить данные
                от PulseSync
            </div>
        `;
    }
}

updateTrack();

setInterval(
    updateTrack,
    2000
);
