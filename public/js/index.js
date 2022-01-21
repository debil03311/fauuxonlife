// HTML Elements

const e_songDetails = {
    title: document.getElementById("current-title"),
    date: document.getElementById("current-date"),
    artist: document.getElementById("current-artist"),
    album: document.getElementById("current-album"),
}

const e_songList = {
    next: document.getElementById("list-next"),
    current: document.getElementById("list-current"),
    previous: document.getElementById("list-previous"),
}

const e_listeners = {
    current: document.querySelector(".listeners.current"),
    peak: document.querySelector(".listeners.peak"),
}

const e_audio = document.getElementById("audio");
const e_corsMessage = document.getElementById("cors-message");
const e_player = document.getElementById("player");
const e_progressBar = document.getElementById("progress-bar");
const e_volumeBar = document.getElementById("volume-bar");
const e_channels = document.querySelectorAll(".channel");

/**
 * Return a random integer between 0 and a given limit.
 * @param {int} limit - The maximum returnable integer
 */

const rRng=(limit)=> Math.floor(Math.random() * limit);

/**
 * Return a random item from a given array.
 * @param {Array} array - The maximum returnable integer
 */

const rArr=(array)=> array[rRng(array.length)];

// :^)

const lainon = {
    life: "https://lainon.life/",
}

// Set a random background image

const backgrounds = [
    "bg205.gif",
    "bg_307.gif",
    "bg_315.gif",
    "patternTV2.gif",
];

document.body.style.setProperty(
    "background-image",
    `url("./public/asset/${rArr(backgrounds)}")`
);

// Default settings

let isPlaying = false;
let currentChannel = "cafe";
let progressStep = 0;

/**
 * Send a GET request to lainon.life, then do stuff with the reponse.
 * @returns {Object} data - Information about the present radio state
 */

async function fetchData() {
    const data = await
        fetch(`https://lainon.life/playlist/${currentChannel.toLowerCase()}.json`)
        .then((response)=> response.json())
        .catch((ERROR)=> {
            console.error(ERROR);
            e_corsMessage.classList.remove("hidden");
        });

    parseData(data);
    return data;
}

/**
 * Parse the reponse data from lainon.life and display it on the page.
 * @param {Object} radioData - Present state of the lainon.life radio.
 */

function parseData(radioData) {
    // Update listeners
    for (const listenerType in radioData.listeners) {
        e_listeners[listenerType].innerText = radioData.listeners[listenerType]
    }

    // Go over the radioData object.
    // If the object exists, set the corresponding element's
    // innerText to its value, or otherwise to say that it
    // wasn't found.

    for (const itemType in e_songDetails) {
        e_songDetails[itemType].innerText = (
            (radioData.current[itemType])
                ? radioData.current[itemType]
                : `${itemType.toUpperCase()} NOT FOUND`
        );
    }

    // Current song's length in seconds
    const songLength = radioData.current.time;

    // Increment for the progress bar as a percentage of 100
    progressStep = (1/songLength) * 100;
    
    // Set the progress bar to display the current song's elapsed time
    e_progressBar.style.setProperty(
        "width",
        (progressStep * Math.floor(radioData.elapsed)) + "%"
    );

    // Clear the entire song list
    for (const element in e_songList)
        e_songList[element].innerHTML = "";

    // Fill in the upcoming songs
    for (const song of radioData.after) {
        const e_songEntry = document.createElement("div");
        e_songEntry.className = "song-entry";

        e_songEntry.innerHTML = `
            <div class="entry-details">
                <span class="entry-artist">${song.artist}</span>
                -
                <span class="entry-title">${song.title}</span>
            </div>
            <span class="entry-length">${toMinSec(song.time).join(":")}</span>
        `;

        e_songList.next.appendChild(e_songEntry);
    }

    // Display the current song in the song list
    e_songList.current.innerHTML = `
        <div class="song-entry">
            <div class="entry-details">
                <span class="entry-artist">${radioData.current.artist}</span>
                -
                <span class="entry-title">${radioData.current.title}</span>
            </div>
            <span class="entry-length">${toMinSec(radioData.current.time).join(":")}</span>
        </div>
    `;

    // Fill in the previous songs
    for (const song of radioData.before) {
        const e_songEntry = document.createElement("div");
        e_songEntry.className = "song-entry";

        e_songEntry.innerHTML = `
            <div class="entry-details">
                <span class="entry-artist">${song.artist}</span>
                -
                <span class="entry-title">${song.title}</span>
            </div>
            <span class="entry-length">${toMinSec(song.time).join(":")}</span>
        `;

        e_songList.previous.appendChild(e_songEntry);
    }
}

/**
 * Convert seconds to minutes.
 * @param {int} totalSeconds - Any amount of seconds
 * @returns {Array} [minutes, seconds]
 */

function toMinSec(totalSeconds) {
    return [
        padZero(Math.floor(totalSeconds/60)),
        padZero(totalSeconds % 60)
    ];
}

/**
 * Prefixes single digits with a "0".
 * @param {} integer
 * @returns {String} Input number converted to a string
 */

function padZero(integer) {
    return (integer < 10)
        ? "0" + integer
        : "" + integer
}

/**
 * Change to a different radio channel.
 * @param {String} channelName
 */

function switchChannel(channelName) {
    // Remove active class from all DOM channel elements
    e_channels.forEach((el)=> el.classList.remove("active"));

    // Add it to the clicked one
    document.getElementById(channelName).classList.add("active");

    currentChannel = channelName;
    e_audio.src = `https://lainon.life/radio/${currentChannel}.ogg`;
    e_audio.play();
    fetchData();

    isPlaying = true;
}

// Change the volume

let volumeUpdate; // Interval container

function setVolume(mouseEvent) {
    // If anything other than LMB is pressed, return early
    if (mouseEvent.buttons != 1) return;

    // Horizontal coordinate of the click
    const clickPosition = mouseEvent.offsetX;

    // Calculate new bar position and volume
    let volumeBarWidth = (100 / mouseEvent.target.clientWidth) * clickPosition;
    let audioVolume = (1 / mouseEvent.target.clientWidth) * clickPosition;

    // Resize the volume bar to the new width
    e_volumeBar.style.setProperty(
        "width",
        `${volumeBarWidth}%`
    );

    // Set the audio volume
    e_audio.volume = audioVolume;
}

e_player.onmousemove = setVolume;
e_player.onmousedown = setVolume;


// Refresh radio data when the tab is focused

window.onfocus=()=> {
    if (isPlaying) fetchData();
}

// Update the progress bar every second
const updateProgressBar = setInterval(()=> {
    // Current percentage
    const width = parseFloat(e_progressBar.style.width);

    // Future percentage
    const futureWidth = width + progressStep;

    // If the future percentage doesn't exceed 100%
    // increment the progress bar.

    if (futureWidth < 100) {
        e_progressBar.style.setProperty(
            "width",
            futureWidth + "%"
        );
    }

    // Otherwise, if it does exceed 100%, that means
    // the song has changed, so fetch the new data.

    else if (futureWidth >= 100)
        fetchData();
}, 1000);