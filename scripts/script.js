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
    MENU_TAB_TEXT       = 'RSTB Options',
    MENU_BG_DAY         = [255, 255, 255],
    MENU_BG_NIGHT       = [0, 0, 0],
    MENU_WIDTH          = 300,       MW_UN = 'px',
    MENU_HEIGHT         = 80,        MH_UN = 'px',
    MENU_IDLE_ALPHA     = 0,
    MENU_ACTIVE_ALPHA   = 1,
    MENU_ARROW_HEIGHT   = 40,
    MENU_ARROW_HALF_LEN = 30,
    MENU_FRAME_DURATION = 15,
    MHW                 = MENU_WIDTH / 2,

    // Easy-to-manipulate animation variables
    TXT_ANIMATION   = 'Text Color Animation',
    BG_ANIMATION    = 'Background Color Animation',
    HOVER_FRAME_DUR = 15,

    // Ratio of side to body that will determine whether or not the button should appear
    SIDE_TO_BODY_RATIO = 0.342,

    // String concatenations for CSS values
    bgRGBA0    = 'rgba(' + BG_RGB + ',' + IDLE_ALPHA + ')',
    bgRGBA1    = 'rgba(' + BG_RGB + ',' + ACTIVE_ALPHA + ')',
    txtRGBA0   = 'rgba(' + TXT_RGB + ',' + IDLE_ALPHA + ')',
    txtRGBA1   = 'rgba(' + TXT_RGB + ',' + ACTIVE_ALPHA + ')',

    borderAnim = BORDER_THICKNESS + BT_UN + ' ' + BORDER_TYPE + ' ',
    bgBorder0  = borderAnim + bgRGBA0,
    bgBorder1  = borderAnim + bgRGBA1,
    txtBorder0 = borderAnim + txtRGBA0,
    txtBorder1 = borderAnim + txtRGBA1,

    // Animation and animator construction
    animator      = new Animator (),
    interpolTrans = function (x) {return 0.5 * (1 - Math.cos (Math.PI * x));},
    isAct         = false,

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
    menuCSS,
    rNST,           // Reddit Night Switch Toggle
    isNightMode,
    menuSVG;



// Create the RSTB tab menu reference and append it to Reddit's tab menu
var tabMenu = document.getElementsByClassName ('tabmenu')[0], rstbTab = document.createElement ('li');
rstbTab.innerHTML = '<a href="javascript:void(0)" id="rstbmenulink" class="choice">' + MENU_TAB_TEXT +
    '<div id="rstbmenudiv" style="display:none;"></div></a>';
tabMenu.appendChild (rstbTab);

// Create the RSTB menu reference and add the menu to it
var rstbMenuDiv = document.getElementById ('rstbmenudiv');

// Polls for RES. Gives up after 400ms
var timeAtPoll = Date.now (), resIsInstalled = false;
function pollForRES () {
    // Handles the case where the function should continue polling
    if (Date.now () - timeAtPoll <= 400) {
        rNST = document.getElementById ('nightSwitchToggle');
        if (rNST) {
            isNightMode = rNST.className.match (/enabled$/i)? true : false;

            menuSVG   = '<svg width="' + MENU_WIDTH + MW_UN + '" height="' + MENU_HEIGHT + MH_UN + '" id="rstbmenusvg"/>' +
                            '<polygon points="' + menuSVGPoints + '" fill="rgba(' +
                                (isNightMode? MENU_BG_NIGHT : MENU_BG_DAY) + ',' + IDLE_ALPHA + ')" id="rstbmenusvgpolygon"/>' +
                        '</svg>';

            setUpMenuCSS ();
            resIsInstalled = true;
        }

        else requestAnimationFrame (pollForRES);
    }

    // Handles the case where polling failed to detect the RES extension in less than 400ms
    else {
        isNightMode = document.URL.match (/^https?:\/\/nm\./i)? true : false;

        menuSVG   = '<svg width="' + MENU_WIDTH + MW_UN + '" height="' + MENU_HEIGHT + MH_UN + '" id="rstbmenusvg"/>' +
                        '<polygon points="' + menuSVGPoints + '" fill="rgba(' +
                            (isNightMode? MENU_BG_NIGHT : MENU_BG_DAY) + ',' + IDLE_ALPHA + ')" id="rstbmenusvgpolygon"/>' +
                    '</svg>';

        setUpMenuCSS ();
    }

    function setUpMenuCSS () {
        menuCSS = {
            'display': 'none',
            'height': (MENU_HEIGHT + MENU_ARROW_HEIGHT) + MH_UN,
            'left': 0,               // Will dynamically change with event.clientX (mouse x)
            'position': 'absolute',
            'top': 0,                // Will dynamically change with event.clientY (mouse y)
            'width': MENU_WIDTH + MW_UN
        };

        for (var prop in menuCSS) rstbMenuDiv.style[prop] = menuCSS[prop];
    }
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

animator.addAnimation (txtAnimation).addAnimation (bgAnimation).start ();



// Hover and click variables
var hide = false, onButton = false, notHoveredYet = true, buttonEnabled = false;

// Handles making the button visible or invisible based on the sidebar to HTML body width ratio
var body = document.getElementsByTagName ('body')[0];
window.addEventListener ('resize', toggleDisplayability);

function toggleDisplayability () {
    var broke = false;

    // Checks each side class element to make sure that it is taking enough screen space before enabling the button
    for (var i = 0; i < rSCA.length; i++) {        
        if (rSCA[i].offsetWidth === 0 || (rSCA[i].offsetWidth / body.offsetWidth) > SIDE_TO_BODY_RATIO) {
            buttonEnabled = true;
            button.style.display = sCDS[sCDS.length - 1];
            broke = true;
            break;
        }
    }

    if (!broke) {
        buttonEnabled = false;
        button.style.display = 'none';
        animator.pause ();
    }
}

toggleDisplayability ();



// Handles mouseenter animation
button.addEventListener ("mouseenter", function () {
    onButton = true;

    // Used for starting the hover animation for the first time
    if (notHoveredYet) {
        animator.playAnimation (TXT_ANIMATION)
                .playAnimation (BG_ANIMATION);
        notHoveredYet = false;
    }

    animator.setAnimationForward (TXT_ANIMATION)
            .setAnimationForward (BG_ANIMATION)
            .play ([TXT_ANIMATION, BG_ANIMATION]);
});

// Handles mouseleave animation
button.addEventListener ("mouseleave", function () {
    onButton = false;
    animator.setAnimationBackward (TXT_ANIMATION)
            .setAnimationBackward (BG_ANIMATION)
            .play ([TXT_ANIMATION, BG_ANIMATION]);
});

// Handles mousedown animation
var timeAtDown = 0;
button.addEventListener ("mousedown", function () {
    animator.pause ().endAnimation (TXT_ANIMATION).endAnimation (BG_ANIMATION);
    button.style.color = bgRGBA1;
    button.style.border = bgBorder1;
    button.style.backgroundColor = txtRGBA1;

    // Capture the time at mouse down and fire the menu
    timeAtDown = Date.now ();

});

function displayMenu () {

}

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

// Reloads the settings from the previous page load
chrome.storage.local.get ('isHidden', function (settings) {
    if (chrome.runtime.lastError) console.error (chrome.runtime.lastError);
    else hide = settings.isHidden;

    togglerHelper ();
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

// Prints the RSTB logo to the Chrome console in an awesome assortment of colors
logRSTBLogo ();

}})();

// <svg width="300" height="120" xmlns="http://www.w3.org/2000/svg">
//  <g>
//   <title>Layer 1</title>
//   <polygon id="svg_2" fill="rgba(127,127,127,0.5)" points="0,40 120,40 150,0 180,40 300,40 300,120 0,120"/>
//  </g>
// </svg>
