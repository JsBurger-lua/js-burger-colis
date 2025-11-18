var minRot = -90,
    maxRot = 90,
    solveDeg = (Math.random() * 180) - 90,
    solvePadding = 4,
    maxDistFromSolve = 45,
    pinRot = 0,
    cylRot = 0,
    lastMousePos = 0,
    mouseSmoothing = 2,
    keyRepeatRate = 25,
    cylRotSpeed = 3,
    pinDamage = 20,
    pinHealth = 100,
    pinDamageInterval = 150,
    numPins = 1,
    userPushingCyl = false,
    gameOver = false,
    gamePaused = false,
    pin, cyl, driver, cylRotationInterval, pinLastDamaged;

$(function () {

    pin = $('#pin');
    cyl = $('#cylinder');
    driver = $('#driver');

    $('#wrap').show();

    $('body').on('mousemove', function (e) {
        if (lastMousePos && !gameOver && !gamePaused) {
            var pinRotChange = (e.clientX - lastMousePos) / mouseSmoothing;
            pinRot += pinRotChange;
            pinRot = Util.clamp(pinRot, maxRot, minRot);
            pin.css({ transform: "rotateZ(" + pinRot + "deg)" });
        }
        lastMousePos = e.clientX;
    });

    $('body').on('mouseleave', function () { lastMousePos = 0; });

    $('body').on('keydown', function (e) {
        if ((e.keyCode == 87 || e.keyCode == 83 || e.keyCode == 68 || e.keyCode == 37 || e.keyCode == 39) && !userPushingCyl && !gameOver && !gamePaused) {
            pushCyl();
        }
    });

$('body').on('keyup', function (e) {
    if (!gameOver) {
        if ([90, 81, 83, 68, 37, 38, 39, 40].includes(e.keyCode)) {
            unpushCyl();
        }
    }
});
    document.onkeyup = function (data) {
        if (data.which == 27 ) {
            console.log("EXIT FROM TEST SITE");
        }
    };
});

function pushCyl() {
    var distFromSolve = Math.abs(pinRot - solveDeg) - solvePadding;
    distFromSolve = Util.clamp(distFromSolve, maxDistFromSolve, 0);

    var cylRotationAllowance = Util.convertRanges(distFromSolve, 0, maxDistFromSolve, 1, 0.02);
    cylRotationAllowance = cylRotationAllowance * maxRot;

    clearInterval(cylRotationInterval);
    userPushingCyl = true;

    cylRotationInterval = setInterval(function () {
        cylRot += cylRotSpeed;
        if (cylRot >= maxRot) {
            cylRot = maxRot;
            clearInterval(cylRotationInterval);
            unlock();
        }
        else if (cylRot >= cylRotationAllowance) {
            cylRot = cylRotationAllowance;
            damagePin();
        }

        cyl.css({ transform: "rotateZ(" + cylRot + "deg)" });
        driver.css({ transform: "rotateZ(" + cylRot + "deg)" });

    }, keyRepeatRate);
}

function unpushCyl() {
    userPushingCyl = false;
    clearInterval(cylRotationInterval);
    cylRotationInterval = setInterval(function () {
        cylRot -= cylRotSpeed;
        cylRot = Math.max(cylRot, 0);

        cyl.css({ transform: "rotateZ(" + cylRot + "deg)" });
        driver.css({ transform: "rotateZ(" + cylRot + "deg)" });

        if (cylRot <= 0) clearInterval(cylRotationInterval);

    }, keyRepeatRate);
}

function damagePin() {
    if (!pinLastDamaged || Date.now() - pinLastDamaged > pinDamageInterval) {
        var tl = new TimelineLite();
        pinHealth -= pinDamage;
        pinLastDamaged = Date.now();

        tl.to(pin, 0.05, { rotationZ: pinRot - 2 });
        tl.to(pin, 0.05, { rotationZ: pinRot });

        if (pinHealth <= 0) breakPin();
    }
}

function breakPin() {
    var tl = new TimelineLite();
    gamePaused = true;
    clearInterval(cylRotationInterval);
    numPins--;

    var pinTop = pin.find('.top');
    var pinBott = pin.find('.bott');

    tl.to(pinTop, 0.7, { rotationZ: -400, x: -200, y: -100, opacity: 0 });
    tl.to(pinBott, 0.7, {
        rotationZ: 400, x: 200, y: 100, opacity: 0,
        onComplete: function () {
            if (numPins > 0) {
                gamePaused = false;
                reset();
            } else {
                outOfPins();
            }
        }
    }, 0);

    tl.play();
}

function reset() {
    cylRot = 0;
    pinHealth = 100;
    pinRot = 0;

    pin.css({ transform: "rotateZ(0deg)" });
    cyl.css({ transform: "rotateZ(0deg)" });
    driver.css({ transform: "rotateZ(0deg)" });

    TweenLite.to(pin.find('.top'), 0, { rotationZ: 0, x: 0, y: 0, opacity: 1 });
    TweenLite.to(pin.find('.bott'), 0, { rotationZ: 0, x: 0, y: 0, opacity: 1 });
}

function outOfPins() {
    gameOver = true;
    console.log("FAILED – No pins left");
}

var score = 0; // <-- Ajouter cette ligne au début

function unlock() {
    console.log("SUCCESS – Lock opened!");
    
    // Incrémenter le score
    score++;
    $('#Score span').text(score);

    // Reset le lockpick automatiquement après succès
    hardReset();

    // Générer un nouveau solveDeg
    solveDeg = (Math.random() * 180) - 90;
    pinRot = 1;
    cylRot = 1;
    lastMousePos = 0;
}

$("#resetBtn").on("click", function () {
    hardReset();
});
$('body').on('keydown', function (e) {
    // 🔥 TOUCHE A = RESET 🔥
    if (e.keyCode == 65) { // A pour reset (si tu veux)
        hardReset();
        return;
    }

    // Touches Z Q S D + Flèches pour pousser le cylindre
    if (!userPushingCyl && !gameOver && !gamePaused) {
        if ([90, 81, 83, 68, 37, 38, 39, 40].includes(e.keyCode)) {
            pushCyl();
        }
    }
});
$('#fondBtn').on('click', function() {
    $('body').toggleClass('night');

    if ($('body').hasClass('night')) {
        $(this).text('Mode Jour'); 
    } else {
        $(this).text('Mode Nuit');
    }
});


function hardReset() {
    console.log("RESET BUTTON PRESSED");

    gameOver = false;
    gamePaused = false;
    userPushingCyl = false;

    clearInterval(cylRotationInterval);

    pinRot = 0;
    cylRot = 0;
    pinHealth = 100;
    numPins = 1;
    pin.css({ transform: "rotateZ(0deg)" });
    cyl.css({ transform: "rotateZ(0deg)" });
    driver.css({ transform: "rotateZ(0deg)" });

    TweenLite.to(pin.find('.top'), 0, { rotationZ: 0, x: 0, y: 0, opacity: 1 });
    TweenLite.to(pin.find('.bott'), 0, { rotationZ: 0, x: 0, y: 0, opacity: 1 });

    console.log("RESET CONPLETE");
}

Util = {};
Util.clamp = function (val, max, min) {
    return Math.min(Math.max(val, min), max);
}
Util.convertRanges = function (OldValue, OldMin, OldMax, NewMin, NewMax) {
    return (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin;
}
