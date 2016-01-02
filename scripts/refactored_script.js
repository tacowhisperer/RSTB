/**
 * Creates the side toggling button on the lower right corner of the window on Reddit
 * and enables the functions that show or hide the sidebar on click.
 *
 * Most of the code in this file is for animating the transparency and color on hover
 * and click for aesthetic purposes. Full functionality can be achieved through jQuery,
 * but has been abandoned for slight performance boostage and code exercise.
 *
 * The initializing code below only runs if there exists a "side" class in the Reddit
 * page. As a sidenote, redditSCA stands for Reddit Side Class Array.
 *
 * Public Methods Description Format: method - [arguments] <short description> (return value)
 */
if (redditSCA.length) {

// Create the button and menu elements and add them to the page
var rstbTab = document.createElement ('li'),
	rstbMenuDiv = document.createElement ('div');

// Create the tab that goes in the Reddit Tab Menu
rstbTab.innerHTML = '<a href="javascript:void(0)" id="rstbmenulink" class="choice">' + MENU_TAB_TEXT + '</a>';
redditTabMenu.appendChild (rstbTab);

// Create the RSTB Menu that will appear when the tab is clicked
rstbMenuDiv.setAttribute ('id', 'rstbmenudiv');
rstbMenuDiv.setAttribute ('style', 'display:none;');
body.appendChild (rstbMenuDiv);
rstbMenuDiv.innerHTML = rstbMenuSpacerHTML + svgCode + rstbMenuDisplayabilityToggleOptionHTML;

// Create the RSTB
var rSTB = document.createElement ('p');
rSTB.id = 'redditSideToggleButton';
rSTB.innerHTML = 'Hide';
for (var prop in buttonCSS) rSTB.style[prop] = buttonCSS[prop];

// Add the RSTB to the DOM and save its display CSS property
body.appendChild (rSTB);
sCDS.push (rSTB.style.display);

// Set the el object DOM references
el = getDomElementReferencesFor (rstbElements);



// Add the animations to the animators
hoverAnimator.addAnimation (txtAnimation)
			 .addAnimation (bgAnimation)
			 .start ();

displayAnimator.addAnimation (rstbMenuBGAnimation)
			   .addAnimation (rstbMenuNobBGAnimation)
			   .addAnimation (rstbMenuNobPosAnimation)
			   .start ();



// Set up the mouse handlers for the button and the displayability menu

// Shows or hides the button based on the settings provided by the user
window.addEventListener ('scroll', hideRSTBMenu);
window.addEventListener ('resize', hideRSTBMenu);
if (redditListingChooser) redditListingChooser.addEventListener ('mousedown', hideRSTBMenu);

window.addEventListener ('resize', executeButtonDisplayability);
function executeButtonDisplayability () {
    // Ensures that the button is visible if the side classes are not
    var requiresButtonFunctionality = false;
    for (var i = 0; i < redditSCA.length; i++) {
        var invisibleByDisplay = redditSCA.style.display == 'none',
            isAnnoyinglyBig = (redditSCA[i].offsetWidth / body.offsetWidth) >= SIDE_TO_BODY_RATIO;

        if (invisibleByDisplay || isAnnoyinglyBig) {
            requiresButtonFunctionality = true;
            break;
        }
    }

    if (requiresButtonFunctionality || bT.holdsTrue ('buttonAlwaysDisplayed')) {
        el.redditSideToggleButton.style.display = sCDS[sCDS.length - 1];
        bT.makeTrue ('buttonIsDisplayedNow');
    }

    else {
        el.redditSideToggleButton.style.display = 'none';
        hoverAnimator.pause ();
        bT.makeFalse ('buttonIsDisplayedNow');
    }
}




// Poll for RES to correctly set the resIsInstalled and the isNightMode bT booleans
pollForRES ();

// Finish initialization by reloading the settings from the previous page reload, if any
reloadSettingsFromLocalStorage (toggleSidebar, toggleButtonVisibility);

}
