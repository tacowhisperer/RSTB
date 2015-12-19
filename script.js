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

// Easy-to-manipulate animation variables
    TXT_ANIMATION   = 'Text Color Animation',
    BG_ANIMATION    = 'Background Color Animation',
    HOVER_FRAME_DUR = 15,

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
    css = {
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
    };

// Store the side class array display style for all side class elements
var sCDS = [];
for (var i = 0; i < rSCA.length; i++) sCDS.push (rSCA[i].style.display);

// Create the button and style it
var cTSB = document.createElement ('p');
    cTSB.id = 'customToggleSideButton';
    cTSB.innerHTML = 'Hide';
    for (var prop in css) {
        cTSB.style[prop] = css[prop];
    }

// Add the new button to the DOM and create a new reference to it
document.body.appendChild (cTSB);
var button = document.getElementById (cTSB.id);

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
var hide = false, onButton = false, notHoveredYet = true;

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
button.addEventListener ("mousedown", function () {
    animator.pause ().endAnimation (TXT_ANIMATION).endAnimation (BG_ANIMATION);
    button.style.color = bgRGBA1;
    button.style.border = bgBorder1;
    button.style.backgroundColor = txtRGBA1;
});

// Handles mouseup animation, toggle functionality, and setting storage on the local machine
button.addEventListener ("mouseup", function () {
    if (onButton) {
        // Sidebar visibility code
        hide = !hide;

        // Toggle functionality and setting storage
        togglerHelper ();

        // Animation handling code
        button.style.color = txtRGBA1;
        button.style.border = txtBorder1;
        button.style.backgroundColor = bgRGBA1;
    }
});

// Reloads the settings from the previous page load
chrome.storage.local.get ('isHidden', function (settings) {
    if (chrome.runtime.lastError) console.error (chrome.runtime.lastError);
    else hide = settings.isHidden;

    togglerHelper ();
});

// Handles toggle functionality and setting storage on the local machine
function togglerHelper () {
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
}

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

/**
 * Generic animator that animates from one state to another state based on the interpolating
 * function fed during construction (defaults to linear if none provided). Handles positive,
 * negative, and stopped animation without the need to create a custom loop to change states.
 *
 * Note that this uses frame counts normalized to 60fps rather than time durations to calculate
 * states.
 *
 * Arguments:
 *     none
 *
 * Public Methods:
 *     addAnimation                  - [opts] <See below for necessary details> (this obj)
 *                             Argument Object Required Key-Value Pairs:
 *                                 animationName - String of the name of the animation
 *                                 startValue    - Starting value of the data to be animated
 *                                 endValue      - Ending value of the data to be animated
 *                                 numFrames     - Number of frames (normalized to 60fps) that the animation should last
 *                                 interpolator  - Function that interpolates the starting and ending values. Its arguments
 *                                                 are in the following order: startValue, endValue, p where p is in [0, 1]
 *                                 updater       - Function called every time the animator is done calculating frame values
 *                                                 and is currently animating. Uses the arguments provided in the updaterArgs
 *                                                 array (if provided), along with the last argument being the return value
 *                                                 of the interpolator function (not to be confused with the interpolation
 *                                                 transform).
 *
 *                             Argument Object Optional Key-Value Pairs:
 *                                 interpolTransform - Function that transforms the p argument of the interpolator to another 
 *                                                     value in [0, 1]. Example: function (v) {return 1 - Math.sqrt (1 - v * v);}
 *                                 updateArgs        - Array that will hold the arguments to be fed to the updater function.
 *                                                     Return value from the interpolator function is appended to the end of this
 *                                                     array.
 *                                 isActive          - True if the animation should be running, false otherwise. Defaults to true.
 *                                 animateNegatively - True if the animation should be negative (1 -> 0), false otherwise (0 -> 1)
 *                                                     Defaults to false.
 *     removeAnimation               - [animation] <Removes the animation from the animator> (this obj)
 *     start                         - [] <Starts the animator main loop> (this obj)
 *     play                          - [immediatelyReplay] <Reenables the main loop and plays animations in fed array> (this obj)
 *     pause                         - [] <Disables the main loop and pauses all animations> (this obj)
 *     playAnimation                 - [animation] <Allows the main loop to play the specified animation> (this obj)
 *     pauseAnimation                - [animation] <Disables the main loop from playing the specified animation> (this obj)
 *     setAnimationForward           - [animation] <Makes the specified animation animate positively [0 -> 1]> (this obj)
 *     setAnimationBackward          - [animation] <Makes the specified animation animate negatively [1 -> 0]> (this obj)
 *     updateAnimationUpdateArgs     - [animation, updateArgs] <Updates the animation's updateArgs array> (this obj)
 *     updateAnimationUpdateFunction - [animation, updateFunc] <Updates the animation's update function> (this obj)
 */
function Animator () {
    // Used to keep track of animations
    var animations = {},

        // Indexing values for arrays inside of the animations array
        I               = -1,
        ANIM_DIRECTION  = ++I,
        START_VALUE     = ++I,
        END_VALUE       = ++I,
        INTERPOLATOR    = ++I,
        UPDATER         = ++I,
        INTERPOL_TRANS  = ++I,
        UPDATE_ARGS     = ++I,
        FRAME_GENERATOR = ++I,

        // Used for keeping track of the internal loop
        animIsStarted = false,
        loopAnimation = false;

    // Internal looping function. Must run this.play to start and this.pause to stop
    function animatorLoop () {
        for (var animation in animations) {
            var a = animations[animation], fG = a[FRAME_GENERATOR];

            // Start the fG if it is not already started
            if (!fG.isStarted ()) fG.start ();

            // Only update values if the animation if not paused
            if (!fG.isPaused ()) {

                // Stores the interpolated value in the last entry of the UPDATE_ARGS array
                var uA = a[UPDATE_ARGS], p = fG.next (a[ANIM_DIRECTION]).percent ();
                uA[uA.length - 1] = a[INTERPOLATOR](a[START_VALUE], a[END_VALUE], a[INTERPOL_TRANS](p));

                // Call the updator to do whatever it needs to do
                a[UPDATER].apply (a[UPDATER], uA);

                // Clear the interpolated value as it is no longer necessary
                uA[uA.length - 1] = null;
            }
        }

        // Only loop if the loopAnimation variable is not false
        if (loopAnimation) loopAnimation = requestAnimationFrame (animatorLoop);
    }

    // Starts the animator loop
    this.start = function () {
        if (!animIsStarted) {
            animIsStarted = true;
            loopAnimation = requestAnimationFrame (animatorLoop);
        }

        return this;
    }

    // Adds an animation plain object to the animator. Animations have no particular order.
    this.addAnimation = function (opts) {
        var iA = typeof opts.isActive == 'boolean'? opts.isActive : true,
            aD = typeof opts.animateNegatively == 'boolean'? opts.animateNegatively : false,
            sV = opts.startValue,
            eV = opts.endValue,
            ip = opts.interpolator,
            up = opts.updater,
            iT = opts.interpolTransform || function (v) {return v;},
            uA = opts.updateArgs,
            fG = new FrameGenerator (opts.numFrames);
            
        // Create a new reference for the updater arguments and append a spot for the output of the interpolator function
        uA = uA? copyUpdateArgumentArray (uA) : [null];

        // Pause the FrameGenerator if the animation should not be active
        if (!iA) fG.pause ();

        // Store the animation in the animation object
        animations[opts.animationName] = [aD, sV, eV, ip, up, iT, uA, fG];

        return this;
    };

    // Removes an animation from the animations object.
    this.removeAnimation = function (animationName) {
        if (animations[animationName]) delete animations[animationName];

        return this;
    };

    // Begins the animator's update loop. Plays any animations labeled in the immediatelyReplay array by their string name.
    this.play = function (immediatelyReplay) {
        if (!loopAnimation) {
            if (immediatelyReplay) {
                for (var i = 0; i < immediatelyReplay.length; i++) animations[immediatelyReplay[i]][FRAME_GENERATOR].unpause ();
            }

            loopAnimation = requestAnimationFrame (animatorLoop);
        }

        return this;
    };

    // Pauses the animator's update loop and all animation's frame generators
    this.pause = function () {
        if (loopAnimation) {
            // Pause all frame generators
            for (var animation in animations) {
                animations[animation][FRAME_GENERATOR].pause ();
            }

            cancelAnimationFrame (loopAnimation);
            loopAnimation = false;
        }

        return this;
    };

    // Enables the specified animation to be updated in the animator's update loop. Does nothing
    // if the animation is not found in the animations object.
    this.playAnimation = function (animationName) {
        var a = animations[animationName];
        if (a && a[FRAME_GENERATOR].isPaused ()) a[FRAME_GENERATOR].unpause ();
        
        return this;
    };

    // Disables the specified animation from being updated in the animator's update loop. Does
    // nothing if the animation is not found in the animations object.
    this.pauseAnimation = function (animationName) {
        var a = animations[animationName];
        if (a && !a[FRAME_GENERATOR].isPaused ()) a[FRAME_GENERATOR].pause ();
        
        return this;
    };

    // Makes the specified animation's direction positive. Does nothing if the animation is not
    // found in the animations object.
    this.setAnimationForward = function (animationName) {
        if (animations[animationName]) animations[animationName][ANIM_DIRECTION] = true;
        
        return this;
    };

    // Makes the specified animation's direction negative. Does nothing if the animation is not
    // found in the animations object
    this.setAnimationBackward = function (animationName) {
        if (animations[animationName]) animations[animationName][ANIM_DIRECTION] = false;
        
        return this;
    };

    // Resets an animation to its initial state
    this.resetAnimation = function (animationName) {
        if (animations[animationName]) animations[animationName][FRAME_GENERATOR].reset ();

        return this;
    };

    // Sets an animation to its final state
    this.endAnimation = function (animationName) {
        if (animations[animationName]) animations[animationName][FRAME_GENERATOR].end ();

        return this;
    };

    // Updates the update function argument array for the specified animation
    this.updateAnimationUpdateArgs = function (animationName, newUpdateArgs) {
        if (animations[animationName]) {
            animations[UPDATE_ARGS] = copyUpdateArgumentArray (newUpdateArgs);
        }

        return this;
    };

    // Updates the update function to the specified function for the specified animation
    this.updateAnimationUpdateFunction = function (animationName, newUpdateFunction) {
        if (animations[animationName]) {
            animations[UPDATER] = newUpdateFunction;
        }

        return this;
    };

    // Used to make a shallow copy of an update argument array, which includes a spot for the
    // interpolator's output for the update function
    function copyUpdateArgumentArray (array) {
        var ret = [];
        for (var i = 0; i < arra.length; i++) ret.push (array[i]);
        ret.push (null);

        return ret;
    }

    /**
     * Normalizes variable framerates to 60fps using 4th order Runge-Kutta integration. This
     * implementation does not produce only integer values.
     *
     * Arguments:
     *     numFrames - the highest value that the generator should produce
     *
     * Public Methods:
     *     start     - [] <Updates to the latest time in milliseconds> (this object)
     *     reset     - [] <Sets the frame count to 0> (this object)
     *     end       - [] <Sets the frame count to the max frame value> (this object)
     *     pause     - [] <Pauses the internal clock, so .next() is constant> (this object)
     *     unpause   - [] <Unpauses from a paused state> (this object)
     *     isPaused  - [] <Returns whether or not this FrameGenerator is paused> (Boolean)
     *     isStarted - [] <Returns whether or not this FrameGenerator was started> (Boolean)
     *     next      - [neg] <Generates the next frame value. Goes backward if !!neg is true> (this object)
     *     frame     - [] <Returns the current frame value> (floating point value)
     */
    function FrameGenerator (numFrames) {
        var n = numFrames,
            t_i = Date.now (),
            i_t = 0,
            offset = 0,         // Offsets new values of time by the amount of time paused
            isStarted = false,  // Used to determine if the frame generator is "started"
            isNotPaused = true,
            tPaused = t_i,      // Used to store the time when paused
            FPMS = 3 / 50,
            BACKWARD = -1,
            FORWARD = 1;

        // Starts the internal clock
        this.start = function () {
            if (!isStarted) {
                offset = 0;
                isStarted = true;
                t_i = Date.now ();
            }

            return this;
        };

        // Resets the FrameGenerator to construction state.
        this.reset = function () {
            offset = 0;
            i_t = 0;

            return this;
        };

        // Sets the FrameGenerator to the maximum frame value
        this.end = function () {
            offset = 0;
            i_t = n;

            return this;
        };

        // Pauses the FrameGenerator such that calling next on it will not change the value of the frame
        this.pause = function () {
            if (isNotPaused) {
                tPaused = t_i;
                isNotPaused = false;
            }

            return this;
        };

        // Unpauses the FrameGenerator
        this.unpause = function () {
            if (!isNotPaused) {
                if (isStarted) offset += (Date.now () - tPaused);
                isNotPaused = true;
            }

            return this;
        };

        // Returns whether this FrameGenerator is paused
        this.isPaused = function () {return !isNotPaused;};

        // Returns whether this FrameGenerator is started
        this.isStarted = function () {return isStarted;};

        // Generates the next value for i_t. Counts backward if !!neg === true
        this.next = function (neg) {
            if (isNotPaused && isStarted) {
                var dt = (Date.now () - t_i - offset) * (neg? BACKWARD : FORWARD);
                i_t = rk4 (i_t, FPMS, dt, function () {return 0;})[0];

                // Does a bound check on the new value of i_t
                if (i_t < 0) i_t = 0;
                else if (i_t > n) i_t = n;

                // Sets the new t_i value for the next call
                t_i = Date.now () - offset;
            }

            return this;
        };

        // Returns the current frame number i_t
        this.frame = function () {return i_t;};

        // Returns frame information as a percentage from [0, 1]
        this.percent = function () {return i_t / n;};

        /**
         * Performs Runge-Kutta integration for a discrete value dt. Used for normalizing i in animation
         * across different framerates by different machines.
         *
         * Arguments:
         *     x  - initial position
         *     v  - initial velocity
         *     dt - timestep
         *     a  - acceleration function handler
         *
         * Returns:
         *     [xf, vf] - array containing the next position and velocity
         */
        function rk4 (x, v, dt, a) {
            var C = 0.5 * dt, K = dt / 6;

            var x1 = x,             v1 = v,             a1 = a (x1, v, 0),
                x2 = x + C * v1,    v2 = v + C * a1,    a2 = a (x2, v2, C),
                x3 = x + C * v2,    v3 = v + C * a2,    a3 = a (x3, v3, C),
                x4 = x + v3 * dt,   v4 = v + a3 * dt,   a4 = a (x4, v4, dt);

            var xf = x + K * (v1 + 2 * v2 + 2 * v3 + v4),
                vf = v + K * (a1 + 2 * a2 + 2 * a3 + a4);
            
            return [xf, vf];
        };

        // Returns a string value for this object in the format 'FG: <frame i/n> <is (not )paused> <FPMS*1000fps>'
        this.toString = function () {
            return isStarted?'FG: <frame '+i_t+'/'+n+'> <is '+(isNotPaused?'not ':'')+'paused> <'+(FPMS*1000)+'fps>':'FG: <>';
        };
    }
}

// Print the RSTB logo to the Chrome console in an awesome assortment of colors
var UP = "background-color:rgb(84,84,84);";
console.log('%c        ' +
            '%c                                                ' +
            '%c        ', '', UP, '');
console.log('%c    ' +
            '%c    ' +
            '%c                                                ' +
            '%c    ' +
            '%c    ', '', UP, '', UP, '');
console.log('%c    ' +
            '%c                                                        ' +
            '%c    ', UP, '', UP);
console.log('%c    ' +
            '%c   ' +
            '%c            ' +
            '%c ' +
            '%c            ' +
            '%c ' +
            '%c            ' +
            '%c ' +
            '%c        ' +
            '%c      ' +
            '%c    ', UP, '', UP, '', UP, '', UP, '', UP, '', UP);
console.log('%c    ' +
            '%c   ' +
            '%c    ' +
            '%c    ' +
            '%c    ' +
            '%c ' +
            '%c    ' +
            '%c             ' +
            '%c    ' +
            '%c     ' +
            '%c    ' +
            '%c    ' +
            '%c    ' +
            '%c  ' +
            '%c    ', UP, '', UP, '', UP, '', UP, '', UP, '', UP, '', UP, '', UP);
console.log('%c    ' +
            '%c   ' +
            '%c        ' +
            '%c     ' +
            '%c            ' +
            '%c     ' +
            '%c    ' +
            '%c     ' +
            '%c        ' +
            '%c      ' +
            '%c    ', UP, '', UP, '', UP, '', UP, '', UP, '', UP);
console.log('%c    ' +
            '%c   ' +
            '%c    ' +
            '%c    ' +
            '%c    ' +
            '%c         ' +
            '%c    ' +
            '%c     ' +
            '%c    ' +
            '%c     ' +
            '%c    ' +
            '%c    ' +
            '%c    ' +
            '%c  ' +
            '%c    ', UP, '', UP, '', UP, '', UP, '', UP, '', UP, '', UP, '', UP);
console.log('%c    ' +
            '%c   ' +
            '%c    ' +
            '%c    ' +
            '%c    ' +
            '%c ' +
            '%c            ' +
            '%c     ' +
            '%c    ' +
            '%c     ' +
            '%c        ' +
            '%c      ' +
            '%c    ', UP, '', UP, '', UP, '', UP, '', UP, '', UP, '', UP);
console.log('%c    ' +
            '%c                                                        ' +
            '%c    ', UP, '', UP);
console.log('%c    ' +
            '%c    ' +
            '%c                                                ' +
            '%c    ' +
            '%c    ', '', UP, '', UP, '');
console.log('%c        ' +
            '%c                                                ' +
            '%c        ', '', UP, '');

}})();
