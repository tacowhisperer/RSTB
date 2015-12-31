/**
 * Creates the side toggling button on the lower right corner of the window on Reddit
 * and enables the functions that show or hide the sidebar on click. 
 *
 * Most of the code in this file is for animating the transparency and color on hover
 * and click for aesthetic purposes. Full functionality can be achieved through jQuery,
 * but has been abandoned for slight performance boostage and code exercise.
 *
 * The initializing code below only runs if there exists a "side" class in the Reddit
 * page. As a sidenote, rSCA stands for Reddit Side Class Array.
 *
 * Public Methods Description Format: method - [arguments] <short description> (return value)
 */
(function () {var rSCA; if (rSCA = document.getElementsByClassName ('side')) {

    // Easy-to-manipulate values for the button. Units are separate for potential math operations
var BG_RGB             = [255, 255, 255],
    TXT_RGB            = [0, 0, 0],
    BUTTON_MARGIN      = 7,          BM_UN  = 'px',
    BORDER_RADIUS      = 3,          BR_UN  = 'px',
    PADDING_LR         = 4,          PLR_UN = 'px',
    PADDING_TB         = 3,          PTB_UN = 'px',
    BORDER_THICKNESS   = 1,          BT_UN  = 'px',
    BORDER_TYPE        = 'solid',
    CURSOR_TYPE        = 'pointer',
    POSITION_TYPE      = 'fixed',
    USER_SELECT        = 'none',
    IDLE_ALPHA         = 0.25,
    ACTIVE_ALPHA       = 1.0,

    // Easy-to-manipulate RSTB menu variables and CSS values. Units are separate for potential math operations
    MENU_TAB_TEXT       = 'RSTB',
    MENU_TD_TEXT        = 'Hide for Widescreen: ',
    MENU_BG_DAY         = [243, 243, 243],
    MENU_STROKE_DAY     = [22, 22, 22],
    MENU_BG_NIGHT       = [22, 22, 22],
    MENU_STROKE_NIGHT   = [243, 243, 243],
    MENU_STROKE_WIDTH   = 0.5,       MSW_UN = 'px',
    MENU_WIDTH          = 175,       MW_UN  = 'px',
    MENU_HEIGHT         = 45,        MH_UN  = 'px',
    MENU_IDLE_ALPHA     = 0,
    MENU_ACTIVE_ALPHA   = 1,
    MENU_ARROW_HEIGHT   = 10,
    MENU_ARROW_HALF_LEN = 7.5,
    MENU_FRAME_DURATION = 5,
    MHW                 = MENU_WIDTH / 2,

    // Easy-to-manipulate animation variables
    TXT_ANIMATION   = 'Text Color Animation',
    BG_ANIMATION    = 'Background Color Animation',
    HOVER_FRAME_DUR = 15,

    MENU_DISP_BG_ANIMATION = 'Displayability Background Animation',
    MENU_NOB_BG_ANIMATION  = 'Displayability Button Nob Background Animation',
    MENU_NOB_POSITION_ANIMATION = 'Displayability Button Nob Position Animation',
    MENU_TOGGLE_FRAME_DUR  = 8,

    // Ratio of side to body that will determine whether or not the button should appear
    SIDE_TO_BODY_RATIO = 0.342,

    // String concatenations for main button CSS values
    bgRGBA0    = 'rgba(' + BG_RGB + ',' + IDLE_ALPHA + ')',
    bgRGBA1    = 'rgba(' + BG_RGB + ',' + ACTIVE_ALPHA + ')',
    txtRGBA0   = 'rgba(' + TXT_RGB + ',' + IDLE_ALPHA + ')',
    txtRGBA1   = 'rgba(' + TXT_RGB + ',' + ACTIVE_ALPHA + ')',

    borderAnim = BORDER_THICKNESS + BT_UN + ' ' + BORDER_TYPE + ' ',
    bgBorder0  = borderAnim + bgRGBA0,
    bgBorder1  = borderAnim + bgRGBA1,
    txtBorder0 = borderAnim + txtRGBA0,
    txtBorder1 = borderAnim + txtRGBA1,

    // Animation object constructions
    hoverAnimator   = new Animator (),
    displayAnimator = new Animator (),
    interpolTrans   = function (x) {return 0.5 * (1 - Math.cos (Math.PI * x));},
    isAct           = false,

    // Initial CSS values for the button
    buttonCSS = {
        'background-color':    bgRGBA0,
        'border':              txtBorder0,
        'border-radius':       BORDER_RADIUS + BR_UN,
        'bottom':              BUTTON_MARGIN + BM_UN,
        'color':               txtRGBA0,
        'cursor':              CURSOR_TYPE,
        'padding-left':        PADDING_LR + PLR_UN,
        'padding-right':       PADDING_LR + PLR_UN,
        'padding-top':         PADDING_TB + PTB_UN,
        'padding-bottom':      PADDING_TB + PTB_UN,
        'position':            POSITION_TYPE,
        'right':               BUTTON_MARGIN + BM_UN,
        '-webkit-user-select': USER_SELECT,
        'z-index':             Number.MAX_SAFE_INTEGER || 509031400070006
    },

    // Points that define the outline of the SVG for the RSTB Menu
    menuSVGPoints = '0,' + MENU_ARROW_HEIGHT + ' ' +
                    (MHW - MENU_ARROW_HALF_LEN) + ',' + MENU_ARROW_HEIGHT + ' ' +
                    MHW + ',0 ' +
                    (MHW + MENU_ARROW_HALF_LEN) + ',' + MENU_ARROW_HEIGHT + ' ' +
                    MENU_WIDTH + ',' + MENU_ARROW_HEIGHT + ' ' +
                    MENU_WIDTH + ',' + MENU_HEIGHT + ' ' +
                    '0,' + MENU_HEIGHT,

    // Variables that require checking for RES
    menuDivCSS,
    menuSVGCSS,
    menuSpacerCSS,
    menuDTOCSS,
    rNST,           // Reddit Night Switch Toggle
    isNightMode,
    menuSVG,
    rstbMenuSVG,
    rstbMenuSVGPolygon,
    rstbMenuSpacer,
    rstbMenuDisplayabilityToggleOption,
    rstbMenuDisplayabilityToggleButtonWrapper,
    rstbMenuDisplayabilityToggleButtonNob,
    rstbMenuDisplayabilityAnimatingForward = false;


// Create the RSTB tab menu reference and append it to Reddit's tab menu
var redditHeader = document.getElementById ('header'),
    tabMenu = document.getElementsByClassName ('tabmenu')[0],
    rstbTab = document.createElement ('li'),
    rstbMenuDiv = document.createElement ('div');

rstbTab.innerHTML = '<a href="javascript:void(0)" id="rstbmenulink" class="choice">' + MENU_TAB_TEXT + '</a>';
tabMenu.appendChild (rstbTab);

rstbMenuDiv.setAttribute ('id', 'rstbmenudiv');
rstbMenuDiv.setAttribute ('style', 'display:none;');
document.body.appendChild (rstbMenuDiv);

// Create the RSTB menu reference and add the menu to it
var rstbMenuLink = document.getElementById ('rstbmenulink');
rstbMenuDiv = document.getElementById ('rstbmenudiv');

// Polls for RES. Gives up after 200ms
var timeAtPoll = Date.now (), resIsInstalled = false;
function pollForRES () {

    // Handles the case where the function should continue polling
    if (Date.now () - timeAtPoll <= 200) {
        rNST = document.getElementById ('nightSwitchToggle');
        if (rNST) {
            isNightMode = rNST.className.match (/enabled$/i)? true : false;

            setUpRSTBMenu ();
            resIsInstalled = true;
        }

        else requestAnimationFrame (pollForRES);
    }

    // Handles the case where polling failed to detect the RES extension in less than 400ms
    else {
        isNightMode = document.URL.match (/^https?:\/\/nm\./i)? true : false;
        setUpRSTBMenu ();
    }

    function setUpRSTBMenu () {
        var xml = ' xmlns="http://www.w3.org/2000/svg"',
        menuSVG   = '<div id="rstbmenusvg"><svg width="' + MENU_WIDTH + MW_UN + '" height="' + MENU_HEIGHT + MH_UN + '"' + xml +
                      'stroke-linejoin="miter">' +
                        '<g>' +
                            '<polygon points="' + menuSVGPoints + '" fill="rgba(' +
                              (isNightMode? MENU_BG_NIGHT : MENU_BG_DAY) + ',' + IDLE_ALPHA + ')" id="rstbmenusvgpolygon"/>' +
                        '</g>' +
                    '</svg></div>',

        rstbMenuSpacerHTML = '<div id="rstbmenuspacer"></div>',
        rstbMenuDisplayabilityToggleOptionHTML  =   '<div id="rstbmenudisplayabilitytoggleoption" class="rstbmenuoption">' +
                                                        MENU_TD_TEXT + '<div id="rstbmenudisplayabilitytogglebuttonwrapper">' +
                                                            '<div id="rstbmenudisplayabilitytogglebuttonnob">' +
                                                            '</div>' +
                                                        '</div>' +
                                                    '</div>';

        menuDivCSS = {
            'height': MENU_HEIGHT + MH_UN,
            'left': 0,               // Will dynamically change with event.clientX (mouse x)
            'top': 0,                // Will dynamically change with event.clientY (mouse y)
            'width': MENU_WIDTH + MW_UN,
            'z-index': 100
        };

        menuSVGCSS = {
            'svg': {
                'left': 0,
                'margin': 0,
                'padding': 0,
                'position': 'fixed',
                'top': 0
            },

            'polygon': {
                // 'cursor': 'pointer',
                'stroke': 'rgba(' + (isNightMode? MENU_STROKE_NIGHT : MENU_STROKE_DAY) + ',' + IDLE_ALPHA + ')',
                'stroke-width': MENU_STROKE_WIDTH + MSW_UN
            }
        };

        menuSpacerCSS = {
            'height': MENU_ARROW_HEIGHT + MH_UN,
            'margin': 0,
            'padding': 0,
            'top': 0,
            'width': '100%'
        };

        menuDTOCSS = {

        };

        for (var prop in menuDivCSS) rstbMenuDiv.style[prop] = menuDivCSS[prop];
        rstbMenuDiv.innerHTML = rstbMenuSpacerHTML + menuSVG + rstbMenuDisplayabilityToggleOptionHTML;

        rstbMenuSVGPolygon = document.getElementById ('rstbmenusvgpolygon');
        rstbMenuSpacer = document.getElementById ('rstbmenuspacer');
        rstbMenuDisplayabilityToggleOption = document.getElementById ('rstbmenudisplayabilitytoggleoption');
        rstbMenuDisplayabilityToggleButton = document.getElementById ('rstbmenudisplayabilitytogglebutton');
        rstbMenuDisplayabilityToggleButtonWrapper = document.getElementById ('rstbmenudisplayabilitytogglebuttonwrapper');
        rstbMenuDisplayabilityToggleButtonNob = document.getElementById ('rstbmenudisplayabilitytogglebuttonnob');

        for (var prop in menuSVGCSS.svg) rstbMenuDiv.style[prop] = menuSVGCSS.svg[prop];
        for (var prop in menuSVGCSS.polygon) rstbMenuSVGPolygon.style[prop] = menuSVGCSS.polygon[prop];

        for (var prop in menuSpacerCSS) rstbMenuSpacer.style[prop] = menuSpacerCSS[prop];

        // Set up click functionality for the RSTB Tab Menu
        rstbMenuLink.addEventListener ('mousedown', function (e) {
            if (e.target == rstbMenuLink) {
                displayMenu (e.clientX, e.clientY);
            }
        });

        // Set up menu displayability option functionality in the RSTB Menu
        rstbMenuDisplayabilityToggleButtonWrapper.addEventListener ('mousedown', function () {
            if (notEnabledYet) {
                displayAnimator .playAnimation (rstbMenuBGAnimation)
                                .playAnimation (rstbMenuNobBGAnimation)
                                .playAnimation (rstbMenuNobPosAnimation);
                notEnabledYet = false;
            }

            rstbMenuDisplayabilityAnimatingForward = !rstbMenuDisplayabilityAnimatingForward;
            if (rstbMenuDisplayabilityAnimatingForward) {
                displayAnimator .setAnimationForward (rstbMenuBGAnimation)
                                .setAnimationForward (rstbMenuNobBGAnimation)
                                .setAnimationForward (rstbMenuNobPosAnimation);
            }

            else {
                displayAnimator .setAnimationBackward (rstbMenuBGAnimation)
                                .setAnimationBackward (rstbMenuNobBGAnimation)
                                .setAnimationBackward (rstbMenuNobPosAnimation);
            }

            // Stores the new setting so that it is remembered on the next page load
            buttonEnablerEnabled = !buttonEnablerEnabled;
            chrome.storage.local.set ({enablerEnabled:buttonEnablerEnabled}, function () {
                if (chrome.runtime.lastError) console.error (chrome.runtime.lastError);
            });

            toggleDisplayability ();
        });

        // Hide the RSTB Menu if the user scrolls, resizes the window, or clicks the main body
        var listingChooser = document.getElementsByClassName ('listing-chooser')[0];
        window.addEventListener ('scroll', hideMenu);
        window.addEventListener ('resize', hideMenu);
        if (listingChooser) listingChooser.addEventListener ('mousedown', hideMenu);
    }
}


// Animates the menu into visibility
function displayMenu (left, top) {
    isNightMode  =  resIsInstalled? 
                        rNST.className.match (/enabled$/i)? true : false :
                        document.URL.match (/^https?:\/\/nm\./i)? true : false;

    var rgba = 'rgba(' + (isNightMode? MENU_BG_NIGHT : MENU_BG_DAY) + ',' + ACTIVE_ALPHA + ')',
        topValue = Math.max (redditHeader.offsetHeight, tabMenu.getBoundingClientRect ().bottom) - window.scrollY;

    rstbMenuDiv.style.top  = topValue + MH_UN;
    rstbMenuDiv.style.left = (left - MHW) + MW_UN;
    rstbMenuDiv.style.position = 'fixed';
    rstbMenuDiv.style.display = 'block';

    rstbMenuSVGPolygon.setAttribute ('fill', rgba);
    rstbMenuSVGPolygon.style.stroke = 'rgba(' + (isNightMode? MENU_STROKE_NIGHT : MENU_STROKE_DAY) + ',' + ACTIVE_ALPHA + ')';
}

// Animates the menu away from visibility
function hideMenu (e) {
    isNightMode  =  resIsInstalled?
                        rNST.className.match (/enabled$/i)? true : false :
                        document.URL.match (/^https?:\/\/nm\./i)? true : false;

    var rgba = 'rgba(' + (isNightMode? MENU_BG_NIGHT : MENU_BG_DAY) + ',' + IDLE_ALPHA + ')';
    rstbMenuDiv.style.display = 'none';

    rstbMenuSVGPolygon.setAttribute ('fill', rgba);
    rstbMenuSVGPolygon.style.stroke = 'rgba(' + (isNightMode? MENU_STROKE_NIGHT : MENU_STROKE_DAY) + ',' + IDLE_ALPHA + ')';
}



// Store the side class array display style for all side class elements
var sCDS = [];
for (var i = 0; i < rSCA.length; i++) sCDS.push (rSCA[i].style.display);

// Create the button and style it
var cTSB = document.createElement ('p');
    cTSB.id = 'customToggleSideButton';
    cTSB.innerHTML = 'Hide';
    for (var prop in buttonCSS) {
        cTSB.style[prop] = buttonCSS[prop];
    }

// Add the new button to the DOM, create a new reference to it, and save its CSS display property to the sCDS array
document.body.appendChild (cTSB);
var button = document.getElementById (cTSB.id);
sCDS.push (button.style.display);



// Create the animation objects
var txtAnimation = {
        animationName:     TXT_ANIMATION,
        startValue:        [TXT_RGB[0], TXT_RGB[1], TXT_RGB[2], IDLE_ALPHA],
        endValue:          [TXT_RGB[0], TXT_RGB[1], TXT_RGB[2], ACTIVE_ALPHA],
        numFrames:         HOVER_FRAME_DUR,
        interpolator:      rgbaInterpolate,
        updater:           txtRGBAUpdate,
        interpolTransform: interpolTrans,
        isActive:          isAct
    },

    bgAnimation = {
        animationName:     BG_ANIMATION,
        startValue:        [BG_RGB[0], BG_RGB[1], BG_RGB[2], IDLE_ALPHA],
        endValue:          [BG_RGB[0], BG_RGB[1], BG_RGB[2], ACTIVE_ALPHA],
        numFrames:         HOVER_FRAME_DUR,
        interpolator:      rgbaInterpolate,
        updater:           bgRGBAUpdate,
        interpolTransform: interpolTrans,
        isActive:          isAct
    };

hoverAnimator.addAnimation (txtAnimation).addAnimation (bgAnimation).start ();

var rstbMenuBGAnimation = {
        animationName:     MENU_DISP_BG_ANIMATION,
        startValue:        [187, 157, 157, ACTIVE_ALPHA],    // Ported straight from menu.css
        endValue:          [157, 187, 157, ACTIVE_ALPHA],
        numFrames:         MENU_FRAME_DURATION,
        interpolator:      rgbaInterpolate,
        updater:           rstbDisplayabilityBGUpdate,
        interpolTransform: interpolTrans,
        isActive:          isAct
    },

    rstbMenuNobBGAnimation = {
        animationName:     MENU_NOB_BG_ANIMATION,
        startValue:        [125, 95, 95, ACTIVE_ALPHA],      // Ported straight from menu.css
        endValue:          [95, 125, 95, ACTIVE_ALPHA],
        numFrames:         MENU_FRAME_DURATION,
        interpolator:      rgbaInterpolate,
        updater:           rstbDisplayabilityNobBGUpdate,
        interpolTransform: interpolTrans,
        isActive:          isAct
    },

    rstbMenuNobPosAnimation = {
        animationName:     MENU_NOB_POSITION_ANIMATION,
        startValue:        2,                                // Ported straight from menu.css
        endValue:          18,
        numFrames:         MENU_FRAME_DURATION,
        interpolator:      positionInterpolate,
        updater:           rstbDisplayabilityNobPosUpdate,
        interpolTransform: interpolTrans,
        isActive:          isAct
    };

displayAnimator .addAnimation (rstbMenuBGAnimation)
                .addAnimation (rstbMenuNobBGAnimation)
                .addAnimation (rstbMenuNobPosAnimation).start ();


// Hover, click, and menu option variables
var hide = false,
    onButton = false, 
    notHoveredYet = true, 
    notEnabledYet = true, 
    buttonEnablerEnabled = false, 
    buttonEnabled = false;

// Handles making the button visible or invisible based on the sidebar to HTML body width ratio
var body = document.getElementsByTagName ('body')[0];
window.addEventListener ('resize', toggleDisplayability);

function toggleDisplayability () {
    if (buttonEnablerEnabled) {
        var broke = false;

        // Checks each side class element to make sure that it is taking enough screen space before enabling the button
        for (var i = 0; i < rSCA.length; i++) {
            var check1 = rSCA[i].style.display == 'none',
                check2 = rSCA[i].getBoundingClientRect ().left / body.getBoundingClientRect ().right >= 1 - SIDE_TO_BODY_RATIO,
                check3 = (rSCA[i].offsetWidth / body.offsetWidth) >= SIDE_TO_BODY_RATIO;

            if (check1 || check3) {
                buttonEnabled = true;
                button.style.display = sCDS[sCDS.length - 1];
                broke = true;
                break;
            }
        }

        if (!broke) {
            buttonEnabled = false;
            button.style.display = 'none';
            hoverAnimator.pause ();
        }
    } else {
        // Make sure that the button is always visible otherwise
        buttonEnabled = true;
    }
}


// Handles mouseenter animation
button.addEventListener ("mouseenter", function () {
    onButton = true;

    // Used for starting the hover animation for the first time
    if (notHoveredYet) {
        hoverAnimator.playAnimation (TXT_ANIMATION)
                .playAnimation (BG_ANIMATION);
        notHoveredYet = false;
    }

    hoverAnimator.setAnimationForward (TXT_ANIMATION)
            .setAnimationForward (BG_ANIMATION)
            .play ([TXT_ANIMATION, BG_ANIMATION]);
});

// Handles mouseleave animation
button.addEventListener ("mouseleave", function () {
    onButton = false;
    hoverAnimator.setAnimationBackward (TXT_ANIMATION)
            .setAnimationBackward (BG_ANIMATION)
            .play ([TXT_ANIMATION, BG_ANIMATION]);
});

// Handles mousedown animation
button.addEventListener ("mousedown", function () {
    hoverAnimator.pause ().endAnimation (TXT_ANIMATION).endAnimation (BG_ANIMATION);
    button.style.color = bgRGBA1;
    button.style.border = bgBorder1;
    button.style.backgroundColor = txtRGBA1;

});


// Handles mouseup animation, toggle functionality, and setting storage on the local machine. Cancels firing the menu if
// mouseup before critical time.
var LEFT_CLICK = 1, MIDDLE_CLICK = 2, RIGHT_CLICK = 3;
button.addEventListener ("mouseup", function (e) {
    if (onButton) {
        if (e.which == LEFT_CLICK) {
            // Sidebar visibility flag
            hide = !hide;

            // Toggle functionality and setting storage
            togglerHelper ();

            // Animation handling code
            button.style.color = txtRGBA1;
            button.style.border = txtBorder1;
            button.style.backgroundColor = bgRGBA1;

            // Make the button disappear if not taking up too much screen space
            toggleDisplayability ();
        }
    }
});



// Reloads the isHidden setting from the previous page load
chrome.storage.local.get ('isHidden', function (settings) {
    if (chrome.runtime.lastError) console.error (chrome.runtime.lastError);
    else hide = settings.isHidden;

    togglerHelper ();
});

// Reloads the buttonEnablerEnabled setting from the previous page load
chrome.storage.local.get ('enablerEnabled', function (settings) {
    if (chrome.runtime.lastError) console.error (chrome.runtime.lastError);
    else buttonEnablerEnabled = settings.enablerEnabled;

    rstbMenuDisplayabilityAnimatingForward = buttonEnablerEnabled? true : false;
    toggleDisplayability ();
});



// Handles toggle functionality and setting storage on the local machine
function togglerHelper () {if (buttonEnabled) {
    if (hide) {
        button.innerHTML = 'Show';
        for (var i = 0; i < rSCA.length; i++) rSCA[i].style.display = 'none';
    }

    else {
        button.innerHTML = 'Hide';
        for (var i = 0; i < rSCA.length; i++) rSCA[i].style.display = sCDS[i];
    }

    // Option storage handling code
    chrome.storage.local.set ({isHidden: hide}, function () {
        if (chrome.runtime.lastError) console.error (chrome.runtime.lastError);
    });
}}



// Updates the button text color
function txtRGBAUpdate (rgba) {
    button.style.color = rgba;
    button.style.border = borderAnim + rgba;
}

// Updates the button background color
function bgRGBAUpdate (rgba) {
    button.style.backgroundColor = rgba;
}

// Updates the option background color
function rstbDisplayabilityBGUpdate (rgba) {
    // Placed inside of undefined check because of polling
    if (rstbMenuDisplayabilityToggleButtonWrapper) rstbMenuDisplayabilityToggleButtonWrapper.style.backgroundColor = rgba;
}

// Updates the option nob background color
function rstbDisplayabilityNobBGUpdate (rgba) {
    // Placed inside of undefined check because of polling
    if (rstbMenuDisplayabilityToggleButtonNob) rstbMenuDisplayabilityToggleButtonNob.style.backgroundColor = rgba;
}

// Updates the option button nob position
function rstbDisplayabilityNobPosUpdate (pos) {
    // Placed inside of undefined check because of polling
    if (rstbMenuDisplayabilityToggleButtonNob) rstbMenuDisplayabilityToggleButtonNob.style.left = pos;
}

// Polls for RES after everything has been defined
pollForRES ();

// Prints the RSTB logo to the Chrome console in an awesome assortment of colors
logRSTBLogo ();

}})();

// <svg width="300" height="120" xmlns="http://www.w3.org/2000/svg">
//  <g>
//   <title>Layer 1</title>
//   <polygon id="svg_2" fill="rgba(127,127,127,0.5)" points="0,40 120,40 150,0 180,40 300,40 300,120 0,120"/>
//  </g>
// </svg>
