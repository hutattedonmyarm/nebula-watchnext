if (window.videoInfo && window.videoInfo.title) {
    console.log('videoinfo already exists', window.videoInfo, location.href);
    window.videoInfo;
} else {
    console.log('parsing videoinfo from dom', location.href);
    let el = document.querySelector('meta[property="og:title"]');
    let title = null;
    if (el) {
        title = el.getAttribute('content');
    } else {
        el = document.querySelector('head title');
        if (el) {
            title = el.innerText;
        }
    }
    if (!title) {
        el = document.querySelector('.App > div > div div > h2');
        if (el) {
            title = el.innerText;
        }
    }
    title = title ?? 'Unknown';
    let channel = null;
    let category = null;
    const creatorDivs = document.querySelectorAll('.App > div a h2');
    if (creatorDivs.length == 2) {
        channel = creatorDivs[0].innerText;
        category = creatorDivs[1].innerText;
    }
    window.videoInfo = {
      title: title,
      updatedAt: null,
      description: null,
      duration: 0,
      thumbnailUrl: null,
      channel: channel,
      category: category,
      url: location.href
    };
    window.videoInfo;
}