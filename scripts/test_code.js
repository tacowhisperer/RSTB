// RGBA Interpolation Function Test Code:
var body = document.getElementsByTagName ('body')[0],
    sRGBA = 'rgba(255, 255, 255, 1.0)',
    eRGBA = 'rgba(0, 0, 0, 1.0)',
    percent = 0,
    konstant = 1;

function tP (p, TYPE) {
    var transformations = [
        function (x) {return x;},
        function (x) {return 0.5 * (1 - Math.cos (Math.PI * x));},
        function (x) {return Math.pow (Math.E, 4 * x) / Math.pow (Math.E, 4);}
    ];

    return transformations[TYPE](p);
}

function animateBgColor () {
    body.style.backgroundColor = rgbaInterpolate (sRGBA, eRGBA, tP (percent, 1));

    percent += konstant * 1/60;
    if (percent > 1) konstant = -1;
    else if (percent < 0) konstant = 1;
}

setInterval (animateBgColor, 50 / 3);

// Frame Generator Test Code:
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

// Animator Test Code:
var animator = new Animator (),
    
    animation0 = {
        animationName: 'Test 1',
        startValue: 0,
        endValue: 1,
        numFrames: 10,
        interpolator: function (a, b, p) {
            return (1 - p) * a + p * b;
        },
        updater: function (v) {
            console.log ('Test 1: ' + v);
        }
    },

    animation1 = {
        animationName: 'Test 2',
        startValue: 1,
        endValue: 0,
        numFrames: 10,
        interpolator: function (a, b, p) {
            return (1 - p) * a + p * b;
        },
        updater: function (v) {
            console.log ('Test 2: ' + v);
        }
    };

animator.addAnimation (animation0).addAnimation (animation1).start ();