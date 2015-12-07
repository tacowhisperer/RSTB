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
 *     addAnimation - [opts] <See the method for necessary details.> (this Animator object)
 */
function Animator () {
    	// Used to keep track of animations
    var animations = {},

        // Indexing values for arrays inside of the animations array
        I                = -1,
        IS_ACTIVE        = ++I,
        ANIM_DIRECTION   = ++I,
        START_VALUE      = ++I,
        END_VALUE        = ++I,
        NUM_FRAMES       = ++I,
        INTERPOLATOR     = ++I,
        UPDATER          = ++I,
        INTERPOL_TRANS   = ++I,
        UPDATE_ARGS      = ++I,
        INTERPOL_RET_VAL = ++I;

    /**
     * Argument Object Required Key-Value Pairs:
     *     animationName      - String of the name of the animation
     *     startValue         - Starting value of the data to be animated
     *     endValue           - Ending value of the data to be animated
     *     numFrames          - Number of frames (normalized to 60fps) that the animation should last
     *     interpolator       - Function that interpolates the starting and ending values. Its arguments
     *                          are in the following order: startValue, endValue, p where p is in [0, 1]
     *     updater            - Function called every time the animator is done calculating frame values
     *                          and is currently animating. Uses the arguments provided in the updaterArgs
     *                          array (if provided), along with the last argument being the return value
     *                          of the interpolator function (not to be confused with the interpolation
     *                          transform).
     *
     * Argument Object Optional Key-Value Pairs:
     *     interpolTransform  - Function that transforms the p argument of the interpolator to another 
     *                          value in [0, 1]. Example: function (v) {return 1 - Math.sqrt (1 - v * v);}
     *     updateArgs         - Array that will hold all of the arguments to be fed to the updater function.
     *                          Return value from the interpolator function is appended to the end of this
     *                          array.
     *     isActive           - True if the animation should be updating, false otherwise. Defaults to true.
     *     animationDirection - True if the animation should be positive (0 -> 1), false otherwise (1 -> 0).
     *                          Defaults to true.
     */
    this.addAnimation = function (opts) {
    	var iA = typeof opts.isActive == 'boolean'? opts.isActive : true,
    		aD = typeof opts.animationDirection == 'boolean'? opts.animationDirection : true,
    	    sV = opts.startValue,
    		eV = opts.endValue,
    		nF = opts.numFrames,
    		ip = opts.interpolator,
    		up = opts.updater,
    		iT = opts.interpolTransform || function (v) {return v;},
    		uA = opts.updateArgs;
    		
    	// Create a new reference for the updater arguments and append a spot for the output of the interpolator function
    	uA = uA? (function (a) {var c = []; for (var i = 0; i < a.length; i++) {c.push (a[i])} return c;})(uA) : [];
    	uA.push (null);

    	// Store the animation in the animation object
    	animations[opts.animationName] = [iA, aD, sV, eV, nF, ip, up, iT, uA];

    	return this;
    };

    // Removes an animation from the animations object.
    this.removeAnimation = function (animationName) {
    	if (animations[animationName]) delete animations[animationName];

    	return this;
    };

    // Begins the animator's update loop
    this.play = function () {
    	return this;
    };

    // Pauses the animator's update loop
    this.pause = function () {
    	return this;
    };

    // Enables the specified animation to be updated in the animator's update loop. Does nothing
    // if the animation is not found in the animations object.
    this.playAnimation = function (animationName) {
    	return this;
    };

    // Disables the specified animation from being updated in the animator's update loop. Does
    // nothing if the animation is not found in the animations object.
    this.pauseAnimation = function (animationName) {
    	return this;
    };
}

/**
 * Normalizes variable framerates to 60fps using 4th order Runge-Kutta integration. This
 * implementation does not produce only integer values.
 *
 * Arguments:
 *     numFrames - the highest value that the generator should produce
 *
 * Public Methods:
 *     start - [] <Updates to the latest time in milliseconds> (this object)
 *     reset - [] <Same as start but also sets the frame count to 0> (this object)
 *     next  - [neg] <Generates the next frame value. Goes backward if !!neg is true> (this object)
 *     frame - [] <Returns the current frame value> (floating point value)
 */
function FrameGenerator (numFrames) {
    var n = numFrames,
        t_i = new Date ().getTime (),
        i_t = 0,
        FPMS = 3 / 50;

    // Starts the internal clock
    this.start = function () {
        t_i = new Date ().getTime ();

        return this;
    };

    // Resets the timer and frame counter
    this.reset = function () {
        t_i = new Date ().getTime ();
        i_t = 0;

        return this;
    };

    // Generates the next value for i_t. Counts backward if !!neg === true
    this.next = function (neg) {
        var dt = (new Date ().getTime () - t_i) * (neg? -1 : 1);
        i_t = rk4 (i_t, FPMS, dt, function () {return 0;})[0];

        // Does a bound check on the new value of i_t
        if (i_t < 0) i_t = 0;
        else if (i_t > n) i_t = n;

        // Sets the new t_i value for the next call
        t_i = new Date ().getTime ();

        return this;
    };

    // Returns the current frame number i_t
    this.frame = function () {
        return i_t;
    };

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