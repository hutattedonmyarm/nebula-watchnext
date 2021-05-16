window.videoInfo = null;

(() => {
    if (document.location.host === 'player.zype.com') {
        var storageItem = browser.storage.sync.get('autoplay');
        storageItem.then((res) => {
            console.log('autoplay option', res);
            if (res.autoplay !== undefined && res.autoplay === true) {
                const script = document.createElement('script');
                script.setAttribute('type', 'text/javascript');
                script.textContent = `(() => {
                    const waitForTheo = () => {
                        console.debug('waiting for player');
                        if (!window.theoplayer)
                            return;
                        console.debug('player ready');
                        window.theoplayer.autoplay = true;
                        clearInterval(int);
                    }
                    const int = setInterval(waitForTheo, 100);
                })();`;
                document.body.appendChild(script);
            }
        });
    }
})();

window.onmessage = function (message) {
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
    let autoplay = false;
    try {
        const autoplayObj = await browser.storage.sync.get('autoplay');
        autoplay = autoplayObj.autoplay || false;
    } catch (error) {
        console.error('Could not load autoplay data', error);
        return;
    }
    if (!autoplay) {
        return;
    }

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