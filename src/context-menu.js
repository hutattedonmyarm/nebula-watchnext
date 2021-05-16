browser.contextMenus.create({
    id: "remove-me",
    title: browser.i18n.getMessage("addThisVideoContextMenu"),
    contexts: ["link"],
    targetUrlPatterns: ["*://*.nebula.app/videos/*"],
    icons: {
      "16": "icons/page_action_19.png",
      "32": "icons/page_action_19.png"
    }
});


browser.contextMenus.onClicked.addListener((info, tab) => {
  let urlParts = info.linkUrl.split('videos');
    if (urlParts.length < 2) {
      console.warn('Probably an invalid video url', info.linkUrl);
      return;
    }
    let relUrl = '/videos' + urlParts[1];
    fetchVideoInfo(tab.id, info.frameId, relUrl)
    .then((res) => {
      if (!res) {
        console.error('Could not laod videoinfo for', info.linkUrl);
        return;
      }
      res.url = info.linkUrl;
      addVideo(res).then(() => {});
    });

});

async function fetchVideoInfo(tabId, frameId, url) {
  const res = await browser.tabs.executeScript(tabId, {
    frameId: frameId,
    code: `
      var videoInfo = {};
      var anchors = document.querySelectorAll('a[href="${url}"]');
      console.log('anchors', anchors);
      // If this exists, we're on a creator page
      var followButton = document.querySelector('#NebulaApp > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > button');
      for (const anchor of anchors) {
          if (!videoInfo.thumbnailUrl) {
              const thumbnail = anchor.querySelector('picture img');
              if (thumbnail) {
                  videoInfo.thumbnailUrl = thumbnail.src;
              }
          }
          if (!videoInfo.duration) {
              const timeContainer = anchor.querySelector('div:nth-of-type(1) div:nth-of-type(1)');
              if (timeContainer) {
                  const timeLines = timeContainer.innerText.split('\\n');
                  if (timeLines.length > 1) {
                      const totalSecs = timeLines[1]
                          .split(':')
                          .reverse()
                          .map(x => parseInt(x))
                          .reduce((total, current, index) => total + current * Math.pow(60, index), 0);
                      videoInfo.duration = totalSecs;
                  }

              }
          }
          if (!videoInfo.title) {
            //Title is in a different position on creator pages
              const titleContainer = followButton
                ? anchor.querySelector('div:nth-of-type(2) > div:nth-of-type(1)')
                : anchor.querySelector('div:nth-of-type(2) > div:nth-of-type(2)');
              if (titleContainer) {
                  videoInfo.title = titleContainer.innerText;
              }
          }
          if (!videoInfo.category && followButton) {
              const categoryContainer = document.querySelector('#NebulaApp > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > h2:nth-of-type(2)');
              if (categoryContainer) {
                  videoInfo.category = categoryContainer.innerText;
              }
          }
          if (!videoInfo.channel) {
              let potentialChannelContainer = null;
              if (!followButton) {
                potentialChannelContainer = anchor.querySelector('div:nth-of-type(3) span');
                const durationContainer = anchor.querySelector('div:nth-of-type(1) div:nth-of-type(1)');
                // Slightly different layout on the home page
                if (potentialChannelContainer && durationContainer && durationContainer.innerText.split('\\n')[0] === potentialChannelContainer.innerText) {
                  potentialChannelContainer = anchor.querySelector('div:nth-of-type(2) > div:nth-of-type(3) > span:nth-of-type(1)');
                }
              }
              const channelContainer = followButton
              ? document.querySelector('#NebulaApp > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > h2:nth-of-type(1)')
              : potentialChannelContainer;
              if (channelContainer) {
                  videoInfo.channel = channelContainer.innerText;
              }
          }
      }
      console.log(videoInfo);
      videoInfo;`,
  });
  return res[0];
}

async function addVideo(videoInfo) {
  let pl;
  try {
      pl = await browser.storage.sync.get('playlist');
  } catch (error) {
      console.error('Could not load watch next data', error);
      return;
  }
  const playlist = pl.playlist || [];
  for (const video of playlist) {
    if (!video) {
        return;
    }
    if (video.url === videoInfo.url) {
        console.warn('Video with the same URL already in watchlist, will skip');
        return;
    }
}
  playlist.push(videoInfo);
  await browser.storage.sync.set({playlist});
}