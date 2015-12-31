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

rstbTab.innerHTML = '<a href="javascript:void(0)" id="rstbmenulink" class="choice">' + MENU_TAB_TEXT + '</a>';
tabMenu.appendChild (rstbTab);

rstbMenuDiv.setAttribute ('id', 'rstbmenudiv');
rstbMenuDiv.setAttribute ('style', 'display:none;');
body.appendChild (rstbMenuDiv);

var rSTB = document.createElement ('p');
rSTB.id = 'redditSideToggleButton';
rSTB.innerHTML = 'Hide';
for (var prop in buttonCSS) rSTB.style[prop] = buttonCSS[prop];



// Add the animations to the animators
hoverAnimator.addAnimation (txtAnimation)
			 .addAnimation (bgAnimation)
			 .start ();

displayAnimator.addAnimation (rstbMenuBGAnimation)
			   .addAnimation (rstbMenuNobBGAnimation)
			   .addAnimation (rstbMenuNobPosAnimation)
			   .start ();

}