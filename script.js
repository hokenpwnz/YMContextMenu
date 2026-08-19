"use strict";

let currentTrack = null;


// ==================================================
// Безопасный вывод текста
// ==================================================

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


// ==================================================
// URL трека Яндекс Музыки
// ==================================================

function getTrackUrl(track) {
    const albumId =
        track?.album_id ||
        track?.albums?.[0]?.id;

    const trackId =
        track?.track_id ||
        track?.realId ||
        track?.id;

    if (!albumId || !trackId) {
        return "";
    }

    return (
        "https://music.yandex.ru/album/" +
        albumId +
        "/track/" +
        trackId
    );
}


// ==================================================
// Обложка
// ==================================================

function getCoverUrl(track) {
    const uri =
        track?.coverUri ||
        track?.albums?.[0]?.coverUri;

    if (!uri) {
        return "";
    }

    return uri.replace("%%", "200x200");
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
    );
}


// ==================================================
// Скопировать название
// ==================================================

async function copyTrack() {
    if (!currentTrack) {
        return;
    }

    const text =
        currentTrack.artist +
        " — " +
        currentTrack.title;

    try {
        await navigator.clipboard.writeText(text);
    }
    catch (error) {
        const textarea =
            document.createElement("textarea");

        textarea.value = text;

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand("copy");

        textarea.remove();
    }
}


// ==================================================
// Получение данных PulseSync
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

        const response = await fetch(
            "https://ympulsesync-server.onrender.com/track",
            {
                method: "GET",
                cache: "no-store"
            }
        );


        if (!response.ok) {
            throw new Error(
                "PulseSync HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        const track =
            data.track;


        if (!track) {

            document.getElementById("app").innerHTML = `
                <div class="error">
                    Сейчас ничего не играет
                </div>
            `;

            currentTrack = null;

            return;
        }


        const artist =
    track.artist ||
    (track.artists || [])
        .map(function (artist) {
            return artist.name;
        })
        .join(", ") ||
    "Неизвестный исполнитель";


        const title =
            track.title ||
            "Без названия";


        const url =
            getTrackUrl(track);


        const cover =
            getCoverUrl(track);


        currentTrack = {
            artist: artist,
            title: title,
            url: url
        };


        const status =
            data.status === "playing"
                ? "▶ Сейчас играет"
                : "⏸ Пауза";


        document.getElementById("app").innerHTML = `

            <div class="card">

                <img
                    class="cover"
                    src="${escapeHtml(cover)}"
                    alt=""
                >

                <div class="info">

                    <div class="artist">
                        ${escapeHtml(artist)}
                    </div>

                    <div class="title">
                        ${escapeHtml(title)}
                    </div>

                    <div class="buttons">

                        <button
                            class="open"
                            id="open-button"
                        >
                            🎧 Открыть в Яндекс Музыке
                        </button>

                        <button
                            class="copy"
                            id="copy-button"
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


        /*
         * Вешаем обработчики через JS.
         *
         * Это важно для Twitch CSP:
         * никаких onclick="..." внутри HTML.
         */

        const openButton =
            document.getElementById("open-button");

        const copyButton =
            document.getElementById("copy-button");


        if (openButton) {
            openButton.addEventListener(
                "click",
                openTrack
            );
        }


        if (copyButton) {
            copyButton.addEventListener(
                "click",
                copyTrack
            );
        }

    }
    catch (error) {

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


// ==================================================
// Запуск
// ==================================================

updateTrack();


// Обновляем каждые 2 секунды

setInterval(
    updateTrack,
    2000
);