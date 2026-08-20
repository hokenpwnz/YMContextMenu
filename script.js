"use strict";

let currentTrack = null;

// ==================================================
// Безопасный вывод текста
// ==================================================

function escapeHtml(text) {
return String(text).replace(/[&<>"']/g, function (char) {
const symbols = {
"&": "&",
"<": "<",
">": ">",
'"': """,
"'": "'"
};

```
    return symbols[char];
});
```

}

// ==================================================
// URL поиска трека в Яндекс Музыке
// ==================================================

function getTrackUrl(track) {

```
const artist =
    track?.artist ||
    "";

const title =
    track?.title ||
    "";

if (!title) {
    return "";
}

const query =
    encodeURIComponent(
        artist + " " + title
    );

return (
    "https://music.yandex.ru/search?text=" +
    query
);
```

}

// ==================================================
// Обложка
// ==================================================

function getCoverUrl(track) {

```
if (!track?.cover) {
    return "";
}

let url = track.cover;

// Last.fm обычно отдаёт полный URL.
// Если вдруг пришёл адрес без протокола —
// добавляем https://.
if (
    !url.startsWith("http://") &&
    !url.startsWith("https://")
) {
    url = "https://" + url;
}

return url;
```

}

// ==================================================
// Открыть трек в Яндекс Музыке
// ==================================================

function openTrack() {

```
if (!currentTrack?.url) {
    return;
}

window.open(
    currentTrack.url,
    "_blank",
    "noopener,noreferrer"
);
```

}

// ==================================================
// Скопировать название
// ==================================================

async function copyTrack() {

```
if (!currentTrack) {
    return;
}

const artist =
    currentTrack.artist ||
    "";

const title =
    currentTrack.title ||
    "";

const text =
    artist +
    " — " +
    title;

try {

    await navigator.clipboard.writeText(
        text
    );

}
catch (error) {

    const textarea =
        document.createElement(
            "textarea"
        );

    textarea.value = text;

    document.body.appendChild(
        textarea
    );

    textarea.select();

    document.execCommand(
        "copy"
    );

    textarea.remove();
}
```

}

// ==================================================
// Получение данных PulseSync
// ==================================================

async function updateTrack() {

```
try {

    const response =
        await fetch(
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


    // ==================================================
    // Ничего не играет
    // ==================================================

    if (!track) {

        document.getElementById(
            "app"
        ).innerHTML = `
            <div class="error">
                Сейчас ничего не играет
            </div>
        `;

        currentTrack = null;

        return;
    }


    // ==================================================
    // Исполнитель
    // ==================================================

    const artist =
        track.artist ||
        "Неизвестный исполнитель";


    // ==================================================
    // Название
    // ==================================================

    const title =
        track.title ||
        "Без названия";


    // ==================================================
    // URL Яндекс Музыки
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


    // ==================================================
    // HTML
    // ==================================================

    document.getElementById(
        "app"
    ).innerHTML = `

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

                </div>

                <div class="status">
                    ${status}
                </div>

            </div>

        </div>
    `;


    // ==================================================
    // Обработчики кнопок
    // ==================================================

    const openButton =
        document.getElementById(
            "open-button"
        );

    const copyButton =
        document.getElementById(
            "copy-button"
        );


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


    document.getElementById(
        "app"
    ).innerHTML = `

        <div class="error">

            ❌ Не удалось получить данные
            от PulseSync

        </div>

    `;
}
```

}

// ==================================================
// Запуск
// ==================================================

updateTrack();

// ==================================================
// Обновление каждые 2 секунды
// ==================================================

setInterval(
updateTrack,
2000
);
