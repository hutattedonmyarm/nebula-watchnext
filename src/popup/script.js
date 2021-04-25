const tableId = 'upnext';
const addButtonId = 'addvideo';
document.addEventListener("DOMContentLoaded", function() {

    displayWatchNext().then(() => {});
    document.getElementById(addButtonId).onclick = function() {
        addCurrentVideo().then(() => {});
    }
});

async function displayWatchNext() {
    const table = document.getElementById(tableId);
    const body = table.querySelector('tbody');
    body.innerHTML = '';

    const playlist = await loadWatchNext();
    for (const video of playlist) {
        console.log('inserting video', video);
        if (!video) {
            continue;
        }
        const row = body.insertRow();
        const thumbCell = row.insertCell();
        if (video.thumbnailUrl) {
            const thumb = document.createElement('img');
            thumb.src = video.thumbnailUrl;
            const href = document.createElement('a');
            href.href = video.url;
            href.appendChild(thumb);
            thumbCell.appendChild(href);
        }
        let detailCell = row.insertCell();
        const title = document.createElement('span');
        title.innerText = video.title;
        title.classList.add('videotitle');
        const channel = document.createElement('span');
        channel.innerText = video.channel;
        channel.classList.add('channel');
        const description = document.createElement('span');
        description.innerText = video.description;
        detailCell.appendChild(title);
        detailCell.appendChild(channel);
        detailCell.appendChild(description);
        console.log(thumbCell, detailCell, title, row);
    }
}

async function loadWatchNext() {
    let pl;
    try {
        pl = await browser.storage.sync.get('playlist');
    } catch (error) {
        console.error('Could not load watch next data', error);
        return;
    }
    console.log('loaded queue', pl);
    const playlist = pl.playlist || [];
    return playlist;
}

async function addCurrentVideo() {
    const videoInfo = await getVideoTitle();
    if (!videoInfo || !videoInfo.title) {
        console.error('Could not load video info');
    }
    await addVideo(videoInfo);
}

async function addVideo(videoInfo) {
    let pl;
    try {
        pl = await browser.storage.sync.get('playlist');
    } catch (error) {
        console.error('Could not load watch next data', error);
        return;
    }
    console.log('current queue', pl);
    const playlist = pl.playlist || [];
    //videoInfo.url = 'https://google.com';
    playlist.push(videoInfo);
    await browser.storage.sync.set({playlist});
    await displayWatchNext();
}

async function getVideoTitle() {
    console.log('getvideotitle');

    const script = {file: "/popup/get_video_info.js"};
    const result = await browser.tabs.executeScript(script);
    console.log('executed script result', result);
    return result[0];
}

function logTabs(tabs) {
    console.log(tabs)
  }

