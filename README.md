# RSTB
Reddit Side Toggle Button for Chrome

## About
This is the source code behind the [Reddit Sidebar Toggle Button Chrome extension](https://chrome.google.com/webstore/detail/reddit-sidebar-toggle-but/hcajnaeckhhlidlnnfmbffhjncabmlkg). The purpose of this button is to make it easier to view Reddit while viewing the page on a relatively narrow screen. This problem arises mainly for users that like to have multiple windows at the same time, but also want to keep engaging (or not) with Reddit.

## Features
For now, the button simply removes the sidebar's visibility by toggling the `display` CSS between `none` when not wanted and its default value when wanted. Once toggled, it saves the state of the sidebar to the local machine via Chrome's storage API so that refreshing the page does not require re-clicking the button every time. All of this works without worrying about interference with the RES extension.

![demo](https://raw.github.com/tacowhisperer/RSTB/screenshot.png)

## Why so much code?
For those of you that wonder why there is so much code in such a little button -- a large chunk of the code is devoted to animating the button's CSS when hovering over it without depending on jQuery for ease-of-use. The first iteration of this extension indeed used jQuery, but Reddit already loads the library in the standard DOM, and it seemed redundant to load jQuery again in the extension's environment, so a lot of time went into having a generic animator work in an efficient manner. The animator found in this repo is by no means complete; it is only at its beginning stages. With enough time, however, it might become good enough to use in contexts outside of web development (did somebody say Node.js?).