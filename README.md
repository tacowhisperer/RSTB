# RSTB
Reddit Side Toggle Button for Chrome

## About
This is the source code behind the [Reddit Sidebar Toggle Button Chrome extension](https://chrome.google.com/webstore/detail/reddit-sidebar-toggle-but/hcajnaeckhhlidlnnfmbffhjncabmlkg). The purpose of this button is to make it easier to view Reddit while viewing the page on a relatively narrow screen. This problem arises mainly for users that like to have multiple windows at the same time, but also want to keep engaging (or not) with Reddit.

## Features
For now, the button simply removes the sidebar's visibility by toggling the `display` CSS between `none` when not wanted and its default value when wanted. Once toggled, it saves the state of the sidebar to the local machine via Chrome's storage API so that refreshing the page does not require re-clicking the button every time. All of this works without worrying about interference with the RES extension.

![demo](https://raw.github.com/tacowhisperer/RSTB/master/store_images/screenshot.png)

## Incoming Features
The next step in the button's development is adding a menu for toggling a new features that removes the button when toggling the sidebar would not make sense (is not taking up enough space of the screen). This new feature seemed too arbitrary to just add, so much care is being taken so that it is not imposed on users that want the button to be visible at all times. Stay tuned for more updates.

## Why so much custom code when there's libraries to ease development?
The first iteration of this extension indeed used jQuery, but Reddit already loads the library in the standard DOM, and it seemed redundant to load jQuery again in the extension's environment, so a lot of time went into removing that dependency from the extension, such as having a generic animator. A key item to highlight is that this project is more of an exercise than anything. This means that full commercial functionality and fully stable features are not a priority at the time of this writing. Everything released on the Chrome store has been tested, but cannot be guaranteed to not have some weird bug or some flaw. That being said, any bugs brought to my attention will be addressed as soon as possible.