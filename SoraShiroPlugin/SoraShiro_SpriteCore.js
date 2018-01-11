//=============================================================================
// SoraShiro - Sprite Core
// SoraShiro_SpriteCore.js
//=============================================================================

var Sora = Sora || {};
Sora.SpriteCore = Sora.SpriteCore || {};
Sora.SpriteCore.version = 1.00;

//=============================================================================
/*:
* @plugindesc v1.00 Sprite Core
* @author Sora Shiro
* 
* @help
* ============================================================================
* Introduction
* ============================================================================
*
* Sprite core code.
*
* ============================================================================
* Changelog
* ============================================================================
*
* Version 1.00:
* - Finish
*/
//=============================================================================

//=============================================================================
// Sprite_SoraAvgAnimate
//=============================================================================			

function Sprite_SoraAvgAnimate() {
    this.initialize.apply(this, arguments);
}

Sprite_SoraAvgAnimate.prototype = Object.create(Sprite.prototype);
Sprite_SoraAvgAnimate.prototype.constructor = Sprite_SoraAvgAnimate;

Sprite_SoraAvgAnimate.prototype.initialize = function () {
    Sprite.prototype.initialize.call(this);
    this._attrChangeTasks = [];
    this._filePrefix = "";
    this._touching = false;
    this._clickHandler = null;
    this._touchingBitmap = null;
    this._normalBitmap = null;
    this._justClickedBitmap = null;
    this._clickToNormal = 60;
};

Sprite_SoraAvgAnimate.prototype.update = function () {
    Sprite.prototype.update.call(this);
    this.updateAnimation();
    this.processTouch();
    this.processJustClick();
    this.updateBitmap();
};

Sprite_SoraAvgAnimate.prototype.updateAnimation = function () {
    for (var i = 0; i < this._attrChangeTasks.length; i++) {
        var changeTask = this._attrChangeTasks[i];
        var duration = changeTask['duration'];
        var ticker = changeTask['ticker'];
        ticker++;
        if (ticker > duration) {
            this._attrChangeTasks.splice(i, 1);
            var finishCallback = changeTask['finishCallback'];
            if (finishCallback && (typeof finishCallback === "function")) {
                finishCallback();
            }
            continue;
        }
        var attrName = changeTask['attrName'];
        var from = changeTask['from'];
        var to = changeTask['to'];
        var interpolator = changeTask['interpolator'];
        changeTask['ticker'] = ticker;
        var calcRate = interpolator(ticker / duration);
        var distance = (to - from) * calcRate;
        now = from + distance;
        switch (changeTask.type) {
            case "attr":
                this[attrName] = now;
                break;
            case "method":
                var tone = this.getColorTone();
                switch (attrName) {
                    case "rgb":
                        tone[0] = now;
                        tone[1] = now;
                        tone[2] = now;
                        this.setColorTone(tone);
                        break;
                    case "grey":
                        tone[3] = now;
                        this.setColorTone(tone);
                        break;
                    case "scaleX":
                        this['scale']['x'] = now;
                        break;
                    case "scaleY":
                        this['scale']['y'] = now;
                        break;
                }
                break;
        }
        var calculateCallback = changeTask['calculateCallback'];
        if (calculateCallback && (typeof calculateCallback === "function")) {
            calculateCallback();
        }
    }
};

Sprite_SoraAvgAnimate.prototype.processTouch = function () {
    if (this.isActive()) {
        if (TouchInput.isTriggered() && this.isButtonTouched()) {
            this._touching = true;
        }
        if (this._touching) {
            if (TouchInput.isReleased() || !this.isButtonTouched()) {
                this._touching = false;
                if (TouchInput.isReleased()) {
                    this.callClickHandler();
                    this._justClicked = true;
                    this._justClickedTick = 0;
                }
            }
        }
    } else {
        this._touching = false;
    }
};

Sprite_SoraAvgAnimate.prototype.processJustClick = function () {
    if (this._justClicked) {
        this._justClickedTick++;
        if (this._justClickedTick > this._clickToNormal) {
            this._justClicked = false;
        }
    }
}

Sprite_SoraAvgAnimate.prototype.updateBitmap = function () {
    if (this._touching && this._touchingBitmap) {
        this.bitmap = this._touchingBitmap;
    } else if (this._justClicked && this._justClickedBitmap) {
        this.bitmap = this._justClickedBitmap;
    } else if (this._normalBitmap) {
        this.bitmap = this._normalBitmap;
    }
};

Sprite_SoraAvgAnimate.prototype.isActive = function () {
    var node = this;
    while (node) {
        if (!node.visible) {
            return false;
        }
        node = node.parent;
    }
    return true;
};

Sprite_SoraAvgAnimate.prototype.isButtonTouched = function () {
    var x = this.canvasToLocalX(TouchInput.x);
    var y = this.canvasToLocalY(TouchInput.y);
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
};

Sprite_SoraAvgAnimate.prototype.canvasToLocalX = function (x) {
    var node = this;
    while (node) {
        x -= node.x;
        node = node.parent;
    }
    return x;
};

Sprite_SoraAvgAnimate.prototype.canvasToLocalY = function (y) {
    var node = this;
    while (node) {
        y -= node.y;
        node = node.parent;
    }
    return y;
};

Sprite_SoraAvgAnimate.prototype.setClickHandler = function (method) {
    this._clickHandler = method;
};

Sprite_SoraAvgAnimate.prototype.callClickHandler = function () {
    if (this._clickHandler) {
        this._clickHandler();
    }
};

Sprite_SoraAvgAnimate.prototype.addSpriteChangeTask = function (changeTask) {
    // Check Repeat
    for (var i = 0; i < this._attrChangeTasks.length; i++) {
        var changeTask = this._attrChangeTasks[i];
        var aName = changeTask.attrName;
        if (aName === attrName) {
            this._attrChangeTasks.splice(i, 1);
            continue;
        }
    }
    // Handle `< 1`
    if (changeTask.duration < 1) changeTask.duration = 1;
    this._attrChangeTasks.push(changeTask);
    var attrName = changeTask.attrName;
    var from = changeTask.from;
    switch (changeTask.type) {
        case "attr":
            this[attrName] = from;
            break;
        case "method":
            var tone = this.getColorTone();
            switch (attrName) {
                case "rgb":
                    tone[0] = from;
                    tone[1] = from;
                    tone[2] = from;
                    this.setColorTone(tone);
                    break;
                case "grey":
                    tone[3] = from;
                    this.setColorTone(tone);
                    break;
                case "scaleX":
                    this['scale']['x'] = from;
                    break;
                case "scaleY":
                    this['scale']['y'] = from;
                    break;
            }
            break;
    }
    this[attrName] = from;
};

//=============================================================================
// Task_SpriteChange
//=============================================================================			

function Task_SpriteChange() {
    this.initialize.apply(this, arguments);
}

Task_SpriteChange.prototype = Object.create(Object.prototype);
Task_SpriteChange.prototype.constructor = Sprite_SoraAvgAnimate;

Task_SpriteChange.prototype.initialize = function () {
    this.type = "attr";
    this.attrName = "opacity";
    this.from = 255;
    this.to = 0;
    this.interpolator = Sora.SpriteCore.getInterpolatorByAbbr('AD');
    this.ticker = 0;
    this.duration = 60;
    this.finishCallback = null;
    this.calculateCallback = null;
};

Task_SpriteChange.createNoCallbackTask = function (type, attrName, from, to, interpolator, duration) {
    var task = new Task_SpriteChange();
    task.type = type;
    task.attrName = attrName;
    task.from = from;
    task.to = to;
    task.interpolator = interpolator;
    task.duration = duration;
    return task;
};

Task_SpriteChange.prototype.setType = function (callback) {
    this.type = type;
    return this;
};

Task_SpriteChange.prototype.setAttrName = function (callback) {
    this.attrName = attrName;
    return this;
};

Task_SpriteChange.prototype.setFrom = function (callback) {
    this.from = from;
    return this;
};

Task_SpriteChange.prototype.setTo = function (callback) {
    this.to = to;
    return this;
};

Task_SpriteChange.prototype.setInterpolator = function (callback) {
    this.interpolator = interpolator;
    return this;
};

Task_SpriteChange.prototype.setDuration = function (callback) {
    this.duration = duration;
    return this;
};

Task_SpriteChange.prototype.setFinishCallback = function (callback) {
    this.finishCallback = callback;
    return this;
};

Task_SpriteChange.prototype.setCalculateCallback = function (callback) {
    this.calculateCallback = callback;
    return this;
};


//=============================================================================
// Animation Interpolator
//=============================================================================

Sora.SpriteCore.getInterpolatorByAbbr = function (abbr) {
    var key = abbr.toLocaleUpperCase();
    var result = Sora.SpriteCore.InterpolatorTable[key];
    if (result == null) {
        console.error("There is no Interpolator's abbr is" + abbr + "!!");
    }
    return Sora.SpriteCore.InterpolatorTable[key];
};

// Basic

Sora.SpriteCore._LinearInterpolator = function (x) {
    return x;
}

Sora.SpriteCore._SmoothStepInterpolator = function (x) {
    return x * x * (3.0 - 2.0 * x);
}

Sora.SpriteCore._SpringInterpolator = function (x, f) {
    var factor = f || 0.4;
    return Math.pow(2, -10 * x) * Math.sin((x - factor / 4) * (2 * Math.PI) / factor) + 1;
}

// Android

Sora.SpriteCore._AccelerateDecelerateInterpolator = function (x) {
    return (Math.cos((x + 1) * Math.PI) / 2.0) + 0.5;
}

Sora.SpriteCore._BounceInterpolator = function (x) {

    function bounce(t) { return t * t * 8; }

    var result;
    if (x < 0.3535)
        result = bounce(x);
    else if (x < 0.7408)
        result = bounce(x - 0.54719) + 0.7;
    else if (x < 0.9644)
        result = bounce(x - 0.8526) + 0.9;
    else
        result = bounce(x - 1.0435) + 0.95;
    return result;
}

Sora.SpriteCore._AccelerateInterpolator = function (x, f) {
    var factor = f || 1.0;
    if (factor == 1.0)
        return x * x;
    else
        return Math.pow(x, 2.0 * factor);
}

Sora.SpriteCore._AnticipateInterpolator = function (x, t) {
    var tension = t || 2.0;
    return x * x * ((tension + 1.0) * x - tension);
}

Sora.SpriteCore._AnticipateOvershootInterpolator = function (x, t) {
    var tension = t || (2.0 * 1.5);

    function a(t, s) { return t * t * ((s + 1) * t - s); }
    function o(t, s) { return t * t * ((s + 1) * t + s); }

    if (x < 0.5)
        0.5 * a(x * 2.0, tension);
    else
        0.5 * (o(x * 2.0 - 2.0, tension) + 2.0);
}

Sora.SpriteCore._CycleInterpolator = function (x, c) {
    var cycles = c || 1.0;
    return Math.sin(2.0 * cycles * Math.PI * x);
}

Sora.SpriteCore._DecelerateInterpolator = function (x, f) {
    var factor = f || 1.0;
    if (factor == 1.0)
        return (1.0 - (1.0 - x) * (1.0 - x));
    else
        return (1.0 - Math.pow((1.0 - x), 2.0 * factor));
}

Sora.SpriteCore._OvershootInterpolator = function (x, t) {
    var tension = t || 2.0;
    x -= 1.0;
    return x * x * ((tension + 1.0) * x + tension) + 1.0;
}

// Advanced

Sora.SpriteCore._CubicHermiteInterpolator = function (x, p_0, p_1, m_0, m_1) {

    var x = x;
    var p0 = p_0 || 0;
    var p1 = p_1 || 1;
    var m0 = m_0 || 4;
    var m1 = m_1 || 4;

    function CubicHermite(t, p0, p1, m0, m1) {
        t2 = t * t;
        t3 = t2 * t;
        return (2.0 * t3 - 3.0 * t2 + 1.0) * p0
            + (t3 - 2.0 * t2 + t) * m0
            + (-2.0 * t3 + 3.0 * t2) * p1
            + (t3 - t2) * m1;
    }

    //time, start, end, tangent0, tangent1
    //modify tangent0 and tangent1
    return CubicHermite(x, p0, p1, m0, m1);
}

Sora.SpriteCore.InterpolatorTable = {};
Sora.SpriteCore.InterpolatorTable["L"] = Sora.SpriteCore._LinearInterpolator;
Sora.SpriteCore.InterpolatorTable["SS"] = Sora.SpriteCore._SmoothStepInterpolator;
Sora.SpriteCore.InterpolatorTable["SR"] = Sora.SpriteCore._SpringInterpolator;
Sora.SpriteCore.InterpolatorTable["AD"] = Sora.SpriteCore._AccelerateDecelerateInterpolator;
Sora.SpriteCore.InterpolatorTable["B"] = Sora.SpriteCore._BounceInterpolator;
Sora.SpriteCore.InterpolatorTable["A"] = Sora.SpriteCore._AccelerateInterpolator;
Sora.SpriteCore.InterpolatorTable["AT"] = Sora.SpriteCore._AnticipateInterpolator;
Sora.SpriteCore.InterpolatorTable["ATO"] = Sora.SpriteCore._AnticipateOvershootInterpolator;
Sora.SpriteCore.InterpolatorTable["C"] = Sora.SpriteCore._CycleInterpolator;
Sora.SpriteCore.InterpolatorTable["D"] = Sora.SpriteCore._DecelerateInterpolator;
Sora.SpriteCore.InterpolatorTable["O"] = Sora.SpriteCore._OvershootInterpolator;
Sora.SpriteCore.InterpolatorTable["CH"] = Sora.SpriteCore._CubicHermiteInterpolator;
