window.videoInfo = null;

(() => {
    console.log('Loaded', document.location.host, window.frameElement, window.self !== window.top);
    if (document.location.host === 'player.zype.com') {
        const script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.textContent = `(() => {
            const waitForTheo = () => {
                console.debug('waiting');
                if (!window.theoplayer)
                    return;
                console.debug('ready', window.theoplayer);
                window.theoplayer.autoplay = true;
                clearInterval(int);
            }
            const int = setInterval(waitForTheo, 100);
        })();`;
        document.body.appendChild(script);
        console.log('theo', window.THEOplayer, window.theoplayer);
    }
})();

window.onmessage = function (message) {
    console.log(message, window.THEOplayer, window.theoplayer, window.theoplayer?.autoplay);
    if (message.origin !== 'https://player.zype.com') {
        return;
    }

    if (window.videoInfo === null) {
        window.videoInfo = {};
        loadVideoDetails().then(() => {});
    }
    if (!message.data || !message.data.startsWith('{')) {
        return;
    }
    let data;
    try {
        data = JSON.parse(message.data);
    } catch (e) {
        return;
    }
    if (!data.event || data.event !== 'zype:complete') {
        return;
    }
    loadNextVideo().then(() => {});
}

async function loadVideoDetails() {
    try {
        const iframe = document.querySelector('iframe.VideoPlayer-iFrame');
        if (!iframe) {
            console.warn('Player not found');
            return;
        }
        const idParts = iframe.id.split('_');
        if (idParts.length > 2) {
            const videoId = idParts[2];
            const srcParts = iframe.src.split('iframe/');
            if (srcParts.length > 1) {
                const accessToken = srcParts[1].split('/')[0];
                const apiUrl = `https://api.zype.com/videos/${videoId}?access_token=${accessToken}`;
                const r = await fetch(apiUrl);
                const json = await r.json();
                const title = json.response.title;
                const updatedAt = json.response.updated_at;
                const description = json.response.short_description;
                const duration = json.response.duration;
                let idx = 0;
                for (let i = json.response.thumbnails.length - 1; i >= 0; i--) {
                    if (json.response.thumbnails.height > 500) {
                        idx = i;
                        break;
                    }
                }
                const thumbnailUrl = json.response.thumbnails[idx].url;

                let channel = 'Unknown';
                let categoryname = 'Unknown';
                for (const category of json.response.categories) {
                    if (category.value && category.value.length) {
                        channel = category.value[0];
                        categoryname = category.title;
                        break;
                    }
                }

                window.videoInfo = {
                    title: title,
                    updatedAt: updatedAt,
                    description: description,
                    duration: duration,
                    thumbnailUrl: thumbnailUrl,
                    channel: channel,
                    category: categoryname,
                    url: location.href
                };
            } else {
                console.warn('Seems Nebula has changed the way videos are embedded, cannot find access token');
            }
        } else {
            console.warn('Seems Nebula has changed the way videos are embedded, cannot find video ID');
        }
    } catch (error) {
        console.error('Could not fetch video details from Zype', error);
    }
}

async function loadNextVideo() {
    let pl
    try {
        pl = await browser.storage.sync.get('playlist');
    } catch (error) {
        console.error('Could not load watch next data', error);
        return;
    }

    const playlist = pl.playlist;
    if (!playlist.length) {
        return;
    }
    const v = playlist[0];

    playlist.shift();
    await browser.storage.sync.set({playlist});

    //browser.tabs.update is only available in background scripts
    window.location.href = v.url;
}