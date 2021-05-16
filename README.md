This [Firefox extension](https://addons.mozilla.org/en-US/firefox/addon/nebula-watchnext/) adds a "Watch Next" feature to the [Nebula](https://nebula.app) straming service. After finishing a video, the next one in the list is automatically queued.

A page action, that is a button in your address bar, lists your current "Watch Next" list and allows you to add the currently opened video to the list.
Right clicking on a video from the featured page, your library, or a creator's page allows adding the video to your list too.

It is in an early development stage, so while the base functionality works, there are a bunch of rough edges. Mainly:

- ~~Adding a video from a creator's page messes up the title and creator name #1~~
- ~~Clicking a video in the Watch Next list doesn't automatically remove it #2~~
- ~~Duplicates are not yet filtered from the Watch Next list #3~~
- ~~No grace period, once a video ends the next in the list will load and remove it from the list #4~~
- The icon is pretty unusable #5
- Fullscreen is not preserved #6

In addition, some notes:

- Chrome, or any Chrome-based browsers are not yet supported. I might get to it some day though
- Nebula doesn't really provide the video details in an accessible way, so I'm using a bunch of fairly ugly methods, relying on internal behaviour. Channel names, video titles, etc may break at any given moment

Pull requests welcome at any time!

An explanation for permissions:

- Browser storage is needed to save the list
- Context menu to add videos from the context menu
- Data on nebula.app: To read the video URL and details
- Data on api.zype.com: To load video details