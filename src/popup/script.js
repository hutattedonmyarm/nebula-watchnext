const tableId = 'upnext';
const addButtonId = 'addvideo';
document.addEventListener("DOMContentLoaded", function() {

    displayWatchNext().then(() => {});
    document.getElementById(addButtonId).onclick = function() {
        addCurrentVideo().then(() => {});
    }
});

async function removeVideo(index) {
    console.log('removing video', index);
    const playlist = await loadWatchNext();
    playlist.splice(index, 1);
    await browser.storage.sync.set({playlist});
    await displayWatchNext();
}

async function displayWatchNext() {
    const table = document.getElementById(tableId);
    const body = table.querySelector('tbody');
    body.innerHTML = '';

    const playlist = await loadWatchNext();
    if (!playlist.length) {
        body.innerHTML = '<span class="emptylist">No videos have been added yet</span>';
    }
    let index = -1;
    for (const video of playlist) {
        console.log('inserting video', video);
        index++;
        if (!video) {
            continue;
        }
        const row = body.insertRow();
        const thumbCell = row.insertCell();
        if (video.thumbnailUrl) {
            const thumb = document.createElement('img');
            thumb.classList.add('thumbnail')
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

        const deleteCell = row.insertCell();
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'X';
        deleteBtn.classList.add('delete');
        deleteBtn.dataset.index = index;
        deleteBtn.onclick = function() {
            removeVideo(this.dataset.index).then(() => {});
        }
        deleteCell.appendChild(deleteBtn);

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
    try {
        const script = {code: 'location.pathname;'};
        const result = await browser.tabs.executeScript(script);
        console.log(result);
        if (!result[0].startsWith('/videos/')) {
            return;
        }
    } catch (error) {
        console.warn("Couldn't load url of current page, trying anyways", error);
    }

    const videoInfo = await getVideoTitle();
    if (!videoInfo || !videoInfo.title) {
        console.error('Could not load video info');
        return;
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

