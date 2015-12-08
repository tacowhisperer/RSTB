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

// Animation variables and objects
    FRAME_COUNT = 50,

    fG          = new FrameGenerator (FRAME_COUNT),
    bgTw        = new AlphaColorTweener (BG_RGB, BG_RGB, IDLE_ALPHA, ACTIVE_ALPHA, FRAME_COUNT),
    txtTw       = new AlphaColorTweener (TXT_RGB, TXT_RGB, IDLE_ALPHA, ACTIVE_ALPHA, FRAME_COUNT),
    bS          = new ButtonState (bgTw, txtTw, fG),

// Initial CSS values for the button
    css = {
        'background-color':    bgRGBA0,
        'border':              txtBorder0,
        'border-radius':       BORDER_RADIUS,
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

// Create the button and style it
var cTSB = document.createElement ('p');
cTSB.id = 'customToggleSideButton';
cTSB.innerHTML = 'Hide';
for (var prop in css) {
    if (css.hasOwnProperty (prop)) cTSB.style[prop] = css[prop];
}

// Add the new button to the DOM and create a new reference to it
document.body.appendChild (cTSB);
var button = document.getElementById (cTSB.id);

/**
 * Wrapper for animation states for a button.
 *
 * Public Members:
 *     isPos - <Describes whether animation is positive or is negative> (Boolean)
 *     isAn  - <Describes whether the button is currently animating> (Boolean)
 *     bgT   - <Reference to the fed background color tweener> (AlphaColorTweener Object)
 *     txtT  - <Reference to the fed text color tweener> (AlphaColorTweener Object)
 *     fGen  - <Reference to the fed frame generator> (Frame Generator Object)
 */
function ButtonState (bgTweener, txtTweener, frameGenerator) {
    this.isPos = true;
    this.isAn  = false;
    this.bgT   = bgTweener;
    this.txtT  = txtTweener;
    this.fGen  = frameGenerator;
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
 *     addAnimation                  - [opts] <See the method for necessary details> (this obj)
 *     removeAnimation               - [animation] <Removes the animation from the animator> (this obj)
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
        loopAnimation = false;

    // Internal looping function. Must run this.play to start and this.pause to stop
    function animatorLoop () {
        for (var animation in animations) {if (animations.hasOwnProperty (animation)) {
            var a = animations[animation], fG = a[FRAME_GENERATOR];

            // Only update values if the animation if not paused
            if (!fG.isPaused ()) {
                if (!fG.isStarted ()) {
                    fG.start ();
                }

                // Stores the interpolated value in the last entry of the UPDATE_ARGS array
                var uA = a[UPDATE_ARGS], i = fG.next (a[ANIM_DIRECTION]).frame ();
                uA[uA.length - 1] = a[INTERPOLATOR](a[START_VALUE], a[END_VALUE], a[INTERPOL_TRANS](i));

                // Call the updator to do whatever it needs to do
                a[UPDATER].apply (a[UPDATER], uA);

                // Clear the interpolated value as it is no longer necessary
                uA[uA.length - 1] = null;
            }
        }}

        // Only loop if the loopAnimation variable is not false
        if (loopAnimation) loopAnimation = requestAnimationFrame (animatorLoop);
    }

    /**
     * Argument Object Required Key-Value Pairs:
     *     animationName - String of the name of the animation
     *     startValue    - Starting value of the data to be animated
     *     endValue      - Ending value of the data to be animated
     *     numFrames     - Number of frames (normalized to 60fps) that the animation should last
     *     interpolator  - Function that interpolates the starting and ending values. Its arguments
     *                     are in the following order: startValue, endValue, p where p is in [0, 1]
     *     updater       - Function called every time the animator is done calculating frame values
     *                     and is currently animating. Uses the arguments provided in the updaterArgs
     *                     array (if provided), along with the last argument being the return value
     *                     of the interpolator function (not to be confused with the interpolation
     *                     transform).
     *
     * Argument Object Optional Key-Value Pairs:
     *     interpolTransform  - Function that transforms the p argument of the interpolator to another 
     *                          value in [0, 1]. Example: function (v) {return 1 - Math.sqrt (1 - v * v);}
     *     updateArgs         - Array that will hold all of the arguments to be fed to the updater function.
     *                          Return value from the interpolator function is appended to the end of this
     *                          array.
     *     isActive           - True if the animation should be running, false otherwise. Defaults to true.
     *     animationDirection - True if the animation should be positive (0 -> 1), false otherwise (1 -> 0).
     *                          Defaults to true.
     */
    this.addAnimation = function (opts) {
        var iA = typeof opts.isActive == 'boolean'? opts.isActive : true,
            aD = typeof opts.animationDirection == 'boolean'? opts.animationDirection : true,
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
        if (iA) fG.pause ();

        // Store the animation in the animation object
        animations[opts.animationName] = [aD, sV, eV, ip, up, iT, uA, fG];

        return this;
    };

    // Removes an animation from the animations object.
    this.removeAnimation = function (animationName) {
        if (animations[animationName]) delete animations[animationName];

        return this;
    };

    // Begins the animator's update loop. Plays any animations in the immediatelyReplay array.
    this.play = function (immediatelyReplay) {
        if (!loopAnimation) {
            for (var i = 0; i < immediatelyReplay.length; i++) immediatelyReplay[i][FRAME_GENERATOR].play ();
            loopAnimation = requestAnimationFrame (animatorLoop);
        }

        return this;
    };

    // Pauses the animator's update loop and all animation's frame generators
    this.pause = function () {
        if (loopAnimation) {
            // Pause all frame generators
            for (var animation in animations) {if (animations.hasOwnProperty (animation)) {
                animations[animation][FRAME_GENERATOR].pause ();
            }}

            cancelAnimationFrame (loopAnimation);
            loopAnimation = false;
        }

        return this;
    };

    // Enables the specified animation to be updated in the animator's update loop. Does nothing
    // if the animation is not found in the animations object.
    this.playAnimation = function (animationName) {
        if (animations[animationName]) animations[animationName][IS_ACTIVE] = true;
        
        return this;
    };

    // Disables the specified animation from being updated in the animator's update loop. Does
    // nothing if the animation is not found in the animations object.
    this.pauseAnimation = function (animationName) {
        if (animations[animationName]) animations[animationName][IS_ACTIVE] = false;
        
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
 *     reset     - [] <Same as start but also sets the frame count to 0> (this object)
 *     pause     - [] <Pauses the internal clock, so .next() is constant> (this object)
 *     unpause   - [] <Unpauses from a paused state> (this object)
 *     isPaused  - [] <Returns whether or not this FrameGenerator is paused> (Boolean)
 *     isStarted - [] <Returns whether or not this FrameGenerator was started> (Boolean)
 *     next      - [neg] <Generates the next frame value. Goes backward if !!neg is true> (this object)
 *     frame     - [] <Returns the current frame value> (floating point value)
 */
function FrameGenerator (numFrames) {
    var n = numFrames,
        t_i = new Date ().getTime (),
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
            t_i = new Date ().getTime ();
        }

        return this;
    };

    // Resets the FrameGenerator to construction state. Needs .start() to work again
    this.reset = function () {
        isStarted = false;
        offset = 0;
        i_t = 0;

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
            // t_i = new Date ().getTime ();
            if (isStarted) offset += (new Date () - tPaused);
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
            var dt = (new Date ().getTime () - t_i - offset) * (neg? BACKWARD : FORWARD);
            i_t = rk4 (i_t, FPMS, dt, function () {return 0;})[0];

            // Does a bound check on the new value of i_t
            if (i_t < 0) i_t = 0;
            else if (i_t > n) i_t = n;

            // Sets the new t_i value for the next call
            t_i = new Date ().getTime () - offset;
        }

        return this;
    };

    // Returns the current frame number i_t
    this.frame = function () {return i_t;};

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

        var x1 = x,             v1 = v,             a1 = a (x, v, 0),
            x2 = x + C * v1,    v2 = v + C * a1,    a2 = a (x2, v2, C),
            x3 = x + C * v2,    v3 = v + C * a2,    a3 = a (x3, v3, C),
            x4 = x + v3 * dt,   v4 = v + a3 * dt,   a4 = a (x4, v4, dt);

        var xf = x + K * (v1 + 2 * v2 + 2 * v3 + v4),
            vf = v + K * (a1 + 2 * a2 + 2 * a3 + a4);
        
        return [xf, vf];
    };
}

/*
Frame Generator Test Code:
    var x = 0, fG = new FrameGenerator (6000);
    (function frameGeneratorEndlessLoop () {
        if (x > 0) {
            console.log (fG.next().frame());
        } else {
            console.log (fG.start().frame());
        }

        x++;
        setTimeout (frameGeneratorEndlessLoop, 1000);
    })()

    function pause () {
        fG.pause();
    }

    function unpause () {
        fG.unpause();
    }

    function reset () {
        x = 0;
        fG.reset();
    }
*/

/**
 * RGBA Color Tweener that linearly interpolates the starting and the ending color through 
 * the CIE-L*ab color space.
 *
 * Arguments:
 *     sRGB, eRGB - Array in the format [0-255, 0-255, 0-255] specifying the starting and 
 *                  ending RGB colors
 *     sAlf, eAlf - Value [0, 1] in float literal format specifying the starting and ending
 *                  alpha values for the CSS rgba props.
 *     num - the number of frames that the color will be fading
 *
 * Public Methods:
 *     colorAt - [i] <Calculates color and alpha interpolation at i/num> (valid CSS rgba string)
 */
function AlphaColorTweener (sRGB, eRGB, sAlf, eAlf, num) {
    var sLab = x2L (r2X (sRGB)),
        eLab = x2L (r2X (eRGB)),
        sA   = sAlf,
        eA   = eAlf,
        n    = num;

    // Returns the color interpolation at i as a hex value if hex is true, or as an 'rgb'
    this.colorAt = function (i) {
        if (i < 0) i = 0;
        var p = 1 - i / n, q = i / n, r = Math.round, a = p * sA + q * eA,
            cRGB = x2R (l2X ([p * sLab[0] + q * eLab[0], p * sLab[1] + q * eLab[1], p * sLab[2] + q * eLab[2]]));
        
        return 'rgba(' + r(cRGB[0]) + ', ' + r(cRGB[1]) + ', ' + r(cRGB[2]) + ', ' + a  + ')';
    };

    // Returns the current rgb value as its numerical value in [0, 16777215]
    function toHex (cRGB) {
        return cRGB[0] * 65536 + cRGB[1] * 256 + cRGB[2];
    };

    // Returns the array corresponding the xyz values of the input rgb array
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

    // Returns the array corresponding to the CIE-L*ab values of the input xyz array
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

    // Returns the array corresponding to the xyz values of the input CIE-L*ab array
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

    // Returns the array corresponding to the rgb values of the input xyz array
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
}

}})();
