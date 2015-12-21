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

            menuCSS = {
                'height': (MENU_HEIGHT + MENU_ARROW_HEIGHT) + MH_UN,
                'position': 'absolute',
                'width': MENU_WIDTH + MW_UN
            };

            resIsInstalled = true;
        }

        else requestAnimationFrame (pollForRES);
    }

    // Handles the case where polling failed to detect the RES extension in less than 400ms
    else {
        isNightMode = document.URL.match (/^https?:\/\/nm\./i)? true : false;
        menuCSS = {

        };
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



/**
 * Takes as input 2 RGBA arrays [0-255, 0-255, 0-255, 0-1] and returns the interpolated
 * RGBA string at q percent through the CIE*Lab color space.
 *
 * Arguments:
 *     sRGBA - Starting RGBA array of the interpolation
 *     eRGBA - Ending RGBA array of the interpolation
 *     q     - Percentage (domain: [0, 1]) of the progress of the interpolation through CIE*Lab color space
 *
 * Returns:
 *     CSS-valid RGBA string with the interpolated value ready to go.
 */
function rgbaInterpolate (sRGBA, eRGBA, q) {
    var I = 0,
        RED    = I++,
        L_STAR = RED,

        GREEN  = I++,
        A_STAR = GREEN,
        
        BLUE   = I++,
        B_STAR = BLUE,
        
        ALPHA = I++;

    q = q < 0? 0 : q > 1? 1 : q;
    var p = 1 - q,
        r = Math.round,

        sL = x2L (r2X (sRGBA)),
        eL = x2L (r2X (eRGBA)),

        iL = q * sL[L_STAR] + p * eL[L_STAR],
        ia = q * sL[A_STAR] + p * eL[A_STAR],
        ib = q * sL[B_STAR] + p * eL[B_STAR],
        alphaValue = q * sRGBA[ALPHA] + p * eRGBA[ALPHA],

        iRGBA = x2R (l2X ([iL, ia, ib, alphaValue]));
    
    // Returns the array corresponding to the XYZ values of the input RGB array
    function r2X (rgb) {
        var R = rgb[0] / 255,
            G = rgb[1] / 255,
            B = rgb[2] / 255;

        R = 100 * (R > 0.04045? Math.pow ((R + 0.055) / 1.055, 2.4) : R / 12.92);
        G = 100 * (G > 0.04045? Math.pow ((G + 0.055) / 1.055, 2.4) : G / 12.92);
        B = 100 * (B > 0.04045? Math.pow ((B + 0.055) / 1.055, 2.4) : B / 12.92);

        var X = R * 0.4124 + G * 0.3576 + B * 0.1805,
            Y = R * 0.2126 + G * 0.7152 + B * 0.0722,
            Z = R * 0.0193 + G * 0.1192 + B * 0.9505;

        return [X, Y, Z];
    }

    // Returns the array corresponding to the CIE-L*ab values of the input XYZ array
    function x2L (xyz) {
        var X = xyz[0] / 95.047,
            Y = xyz[1] / 100,
            Z = xyz[2] / 108.883,
            T = 1 / 3,
            K = 16 / 116;

        X = X > 0.008856? Math.pow (X, T) : (7.787 * X) + K;
        Y = Y > 0.008856? Math.pow (Y, T) : (7.787 * Y) + K;
        Z = Z > 0.008856? Math.pow (Z, T) : (7.787 * Z) + K;

        var L = (116 * Y) - 16,
            a = 500 * (X - Y),
            b = 200 * (Y - Z);

        return [L, a, b];
    }

    // Returns the array corresponding to the XYZ values of the input CIE-L*ab array
    function l2X (Lab) {
        var Y = (Lab[0] + 16) / 116,
            X = Lab[1] / 500 + Y,
            Z = Y - Lab[2] / 200,
            K = 16 / 116;

        X = 95.047 * ((X * X * X) > 0.008856? X * X * X : (X - K) / 7.787);
        Y = 100 * ((Y * Y * Y) > 0.008856? Y * Y * Y : (Y - K) / 7.787);
        Z = 108.883 * ((Z * Z * Z) > 0.008856? Z * Z * Z : (Z - K) / 7.787);

        return [X, Y, Z];
    }

    // Returns the array corresponding to the RGB values of the input XYZ array
    function x2R (xyz) {
        var X = xyz[0] / 100,
            Y = xyz[1] / 100,
            Z = xyz[2] / 100,
            T = 1 / 2.4;

        var R = X *  3.2406 + Y * -1.5372 + Z * -0.4986,
            G = X * -0.9689 + Y *  1.8758 + Z *  0.0415,
            B = X *  0.0557 + Y * -0.2040 + Z *  1.0570;

        R = 255 * (R > 0.0031308? 1.055 * Math.pow (R, T) - 0.055 : 12.92 * R);
        G = 255 * (G > 0.0031308? 1.055 * Math.pow (G, T) - 0.055 : 12.92 * G);
        B = 255 * (B > 0.0031308? 1.055 * Math.pow (B, T) - 0.055 : 12.92 * B);

        return [R, G, B];
    }

    return 'rgba(' + r(iRGBA[RED]) + ',' + r(iRGBA[GREEN]) + ',' + r(iRGBA[BLUE]) + ',' + alphaValue + ')';
}

// Updates the button
function txtRGBAUpdate (rgba) {
    button.style.color = rgba;
    button.style.border = borderAnim + rgba;
}

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