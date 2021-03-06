# RSTB
Reddit Side Toggle Button for Chrome

## About
This is the source code behind the [Reddit Sidebar Toggle Button Chrome extension](https://chrome.google.com/webstore/detail/reddit-sidebar-toggle-but/hcajnaeckhhlidlnnfmbffhjncabmlkg). The purpose of this button is to make it easier to view Reddit while viewing the page on a relatively narrow screen. This problem arises mainly for users that like to have multiple windows at the same time, but also want to keep engaging (or not) with Reddit.

## Features
For now, the button simply removes the sidebar's visibility by toggling the `display` CSS between `none` when not wanted and its default value when wanted. Once toggled, it saves the state of the sidebar to the local machine via Chrome's storage API so that refreshing the page does not require re-clicking the button every time. All of this works without worrying about interference with the RES extension.

![demo](https://raw.github.com/tacowhisperer/RSTB/master/store_images/screenshot.png)

## Incoming Features
The next step in the button's development is adding a menu for toggling a new feature that removes the button when toggling the sidebar would not make sense (is not taking up enough space of the screen). This new feature seemed too arbitrary to just add, so a toggle-able option is being developed that allows users to choose whether they want it or not.

## Update
The current version now has a working menu that toggles this new feature from the **Incoming Features**. Note that the existence of the gap between the menu and the tab button that sometimes appears is due to the custom CSS that Reddit mods use on their subs, so not much can be done about it, except turning off a subreddit's custom CSS if it becomes a nuisance. Design of the menu is loosely based on the toggle found in YouTube videos to disable video annotations.
