define([
  "skylark-langx-types",
  "skylark-langx-objects",
  "skylark-langx-strings",
  "skylark-langx-funcs",
  "skylark-domx-noder",
  "skylark-domx-styler",
  "skylark-domx-finder",
  "skylark-devices-points/mouse",
  "skylark-devices-points/touch",
  "skylark-devices-orientation",
  "skylark-devices-webgl",
  "skylark-threejs",
  "skylark-threejs-ex/controls/DeviceOrientationControls",
  "skylark-threejs-ex/effects/StereoEffect",
  "./_psv/ctoc"
],function(
  types,
  objects,
  strings,
  funcs,
  noder,
  styler,
  finder,
  mouse,
  touch,
  orientation,
  webgl,
  THREE,
  DeviceOrientationControls,
  StereoEffect,
  PhotoSphereViewer
){
  "use strict";
  THREE.DeviceOrientationControls = DeviceOrientationControls;
  THREE.StereoEffect = StereoEffect;

  /**
   * Static utilities for PSV
   * @namespace
   */
  var PSVUtils = {};

  /**
   * @summary exposes {@link PSVUtils}
   * @member {object}
   * @memberof PhotoSphereViewer
   * @readonly
   */
  PhotoSphereViewer.Utils = PSVUtils;

  /**
   * @summary Short-Hand for PI*2
   * @type {float}
   * @readonly
   */
  PSVUtils.TwoPI = Math.PI * 2.0;

  /**
   * @summary Short-Hand for PI/2
   * @type {float}
   * @readonly
   */
  PSVUtils.HalfPI = Math.PI / 2.0;

  /**
   * @summary Namespace for SVG creation
   * @type {string}
   * @readonly
   */
  PSVUtils.svgNS = 'http://www.w3.org/2000/svg';

  /**
   * @summary Checks if some three.js components are loaded
   * @param {...string} components
   * @returns {boolean}
   */
  PSVUtils.checkTHREE = function(components) {
    for (var i = 0, l = arguments.length; i < l; i++) {
      if (!(arguments[i] in THREE)) {
        return false;
      }
    }

    return true;
  };

  /**
   * @summary Detects if canvas is supported
   * @returns {boolean}
   */
  PSVUtils.isCanvasSupported = function() {
    var canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
  };

  /**
   * @summary Tries to return a canvas webgl context
   * @returns {WebGLRenderingContext}
   */
  PSVUtils.getWebGLCtx = webgl.getWebGLCtx;

  /**
   * @summary Detects if WebGL is supported
   * @returns {boolean}
   */
  PSVUtils.isWebGLSupported = webgl.isWebGLSupported;

  /**
   * @summary Detects if device orientation is supported
   * @description We can only be sure device orientation is supported once received an event with coherent data
   * @returns {Promise<boolean>}
   */
  PSVUtils.isDeviceOrientationSupported = orientation.isDeviceOrientationSupported;
  /**
   * @summary Detects if the user is using a touch screen
   * @returns {Promise<boolean>}
   */
  PSVUtils.isTouchEnabled = touch.isTouchEnabled;

  /**
   * @summary Gets max texture width in WebGL context
   * @returns {int}
   */
  PSVUtils.getMaxTextureWidth = webgl.getMaxTextureWidth;

  /**
   * @summary Toggles a CSS class
   * @param {HTMLElement|SVGElement} element
   * @param {string} className
   * @param {boolean} [active] - forced state
   */
  PSVUtils.toggleClass =styler.toggleClass;
  /**
   * @summary Adds one or several CSS classes to an element
   * @param {HTMLElement} element
   * @param {string} className
   */
  PSVUtils.addClasses = styler.addClass;

  /**
   * @summary Removes one or several CSS classes to an element
   * @param {HTMLElement} element
   * @param {string} className
   */
  PSVUtils.removeClasses =  styler.removeClass;
  /**
   * @summary Searches if an element has a particular parent at any level including itself
   * @param {HTMLElement} el
   * @param {HTMLElement} parent
   * @returns {boolean}
   */
  PSVUtils.hasParent = noder.isChildOf;

  /**
   * @summary Gets the closest parent (can by itself)
   * @param {HTMLElement|SVGElement} el
   * @param {string} selector
   * @returns {HTMLElement}
   */
  PSVUtils.getClosest = finder.closest;


  /**
   * @summary Gets the event name for mouse wheel
   * @returns {string}
   */
  PSVUtils.mouseWheelEvent = mouse.mouseWheelEvent;
  /**
   * @summary Returns the key name of a KeyboardEvent
   * @param {KeyboardEvent} evt
   * @returns {string}
   */
  PSVUtils.getEventKey = function(evt) {
    var key = evt.key || PSVUtils.getEventKey.KEYMAP[evt.keyCode || evt.which];

    if (key && PSVUtils.getEventKey.MS_KEYMAP[key]) {
      key = PSVUtils.getEventKey.MS_KEYMAP[key];
    }

    return key;
  };

  /**
   * @summary Map between keyboard events `keyCode|which` and `key`
   * @type {Object.<int, string>}
   * @readonly
   * @protected
   */
  PSVUtils.getEventKey.KEYMAP = {
    13: 'Enter',
    27: 'Escape',
    32: ' ',
    33: 'PageUp',
    34: 'PageDown',
    37: 'ArrowLeft',
    38: 'ArrowUp',
    39: 'ArrowRight',
    40: 'ArrowDown',
    46: 'Delete',
    107: '+',
    109: '-'
  };

  /**
   * @summary Map for non standard keyboard events `key` for IE and Edge
   * @see https://github.com/shvaikalesh/shim-keyboard-event-key
   * @type {Object.<string, string>}
   * @readonly
   * @protected
   */
  PSVUtils.getEventKey.MS_KEYMAP = {
    Add: '+',
    Del: 'Delete',
    Down: 'ArrowDown',
    Esc: 'Escape',
    Left: 'ArrowLeft',
    Right: 'ArrowRight',
    Spacebar: ' ',
    Subtract: '-',
    Up: 'ArrowUp'
  };

  /**
   * @summary  Gets the event name for fullscreen
   * @returns {string}
   */
  PSVUtils.fullscreenEvent = function() {
    var map = {
      'exitFullscreen': 'fullscreenchange',
      'webkitExitFullscreen': 'webkitfullscreenchange',
      'mozCancelFullScreen': 'mozfullscreenchange',
      'msExitFullscreen': 'MSFullscreenChange'
    };

    for (var exit in map) {
      if (map.hasOwnProperty(exit) && exit in document) {
        return map[exit];
      }
    }

    return null;
  };

  /**
   * @summary Ensures that a number is in a given interval
   * @param {number} x
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  PSVUtils.bound = function(x, min, max) {
    return Math.max(min, Math.min(max, x));
  };

  /**
   * @summary Checks if a value is an integer
   * @function
   * @param {*} value
   * @returns {boolean}
   */
  PSVUtils.isInteger = Number.isInteger || function(value) {
      return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
    };

  /**
   * @summary Computes the sum of an array
   * @param {number[]} array
   * @returns {number}
   */
  PSVUtils.sum = function(array) {
    return array.reduce(function(a, b) {
      return a + b;
    }, 0);
  };

  /**
   * @summary Transforms a string to dash-case
   * {@link https://github.com/shahata/dasherize}
   * @param {string} str
   * @returns {string}
   */
  PSVUtils.dasherize = strings.dasherize;

  /**
   * @summary Returns the value of a given attribute in the panorama metadata
   * @param {string} data
   * @param {string} attr
   * @returns (string)
   */
  PSVUtils.getXMPValue = function(data, attr) {
    var result;
    // XMP data are stored in children
    if ((result = data.match('<GPano:' + attr + '>(.*)</GPano:' + attr + '>')) !== null) {
      return result[1];
    }
    // XMP data are stored in attributes
    else if ((result = data.match('GPano:' + attr + '="(.*?)"')) !== null) {
      return result[1];
    }
    else {
      return null;
    }
  };

  /**
   * @summary Detects if fullscreen is enabled
   * @param {HTMLElement} elt
   * @returns {boolean}
   */
  PSVUtils.isFullscreenEnabled = function(elt) {
    return (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) === elt;
  };

  /**
   * @summary Enters fullscreen mode
   * @param {HTMLElement} elt
   */
  PSVUtils.requestFullscreen = function(elt) {
    (elt.requestFullscreen || elt.mozRequestFullScreen || elt.webkitRequestFullscreen || elt.msRequestFullscreen).call(elt);
  };

  /**
   * @summary Exits fullscreen mode
   */
  PSVUtils.exitFullscreen = function() {
    (document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen).call(document);
  };

  /**
   * @summary Gets an element style
   * @param {HTMLElement} elt
   * @param {string} prop
   * @returns {*}
   */
  PSVUtils.getStyle = styler.css;

  /**
   * @summary Compute the shortest offset between two longitudes
   * @param {float} from
   * @param {float} to
   * @returns {float}
   */
  PSVUtils.getShortestArc = function(from, to) {
    var tCandidates = [
      0, // direct
      PSVUtils.TwoPI, // clock-wise cross zero
      -PSVUtils.TwoPI // counter-clock-wise cross zero
    ];

    return tCandidates.reduce(function(value, candidate) {
      candidate = to - from + candidate;
      return Math.abs(candidate) < Math.abs(value) ? candidate : value;
    }, Infinity);
  };

  /**
   * @summary Computes the angle between the current position and a target position
   * @param {PhotoSphereViewer.Position} position1
   * @param {PhotoSphereViewer.Position} position2
   * @returns {number}
   */
  PSVUtils.getAngle = function(position1, position2) {
    return Math.acos(
      Math.cos(position1.latitude) *
      Math.cos(position2.latitude) *
      Math.cos(position1.longitude - position2.longitude) +
      Math.sin(position1.latitude) *
      Math.sin(position2.latitude)
    );
  };

  /**
   * @summary Translate CSS values like "top center" or "10% 50%" as top and left positions
   * @description The implementation is as close as possible to the "background-position" specification
   * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-position}
   * @param {string} value
   * @returns {{top: float, left: float}}
   */
  PSVUtils.parsePosition = function(value) {
    if (!value) {
      return { top: 0.5, left: 0.5 };
    }

    if (typeof value === 'object') {
      return value;
    }

    var tokens = value.toLocaleLowerCase().split(' ').slice(0, 2);

    if (tokens.length === 1) {
      if (PSVUtils.parsePosition.positions[tokens[0]] !== undefined) {
        tokens = [tokens[0], 'center'];
      }
      else {
        tokens = [tokens[0], tokens[0]];
      }
    }

    var xFirst = tokens[1] !== 'left' && tokens[1] !== 'right' && tokens[0] !== 'top' && tokens[0] !== 'bottom';

    tokens = tokens.map(function(token) {
      return PSVUtils.parsePosition.positions[token] || token;
    });

    if (!xFirst) {
      tokens.reverse();
    }

    var parsed = tokens.join(' ').match(/^([0-9.]+)% ([0-9.]+)%$/);

    if (parsed) {
      return {
        left: parsed[1] / 100,
        top: parsed[2] / 100
      };
    }
    else {
      return { top: 0.5, left: 0.5 };
    }
  };

  PSVUtils.parsePosition.positions = { 'top': '0%', 'bottom': '100%', 'left': '0%', 'right': '100%', 'center': '50%' };

  /**
   * @summary Parses an speed
   * @param {string} speed - The speed, in radians/degrees/revolutions per second/minute
   * @returns {float} radians per second
   * @throws {PSVError} when the speed cannot be parsed
   */
  PSVUtils.parseSpeed = function(speed) {
    if (typeof speed === 'string') {
      speed = speed.toString().trim();

      // Speed extraction
      var speed_value = parseFloat(speed.replace(/^(-?[0-9]+(?:\.[0-9]*)?).*$/, '$1'));
      var speed_unit = speed.replace(/^-?[0-9]+(?:\.[0-9]*)?(.*)$/, '$1').trim();

      // "per minute" -> "per second"
      if (speed_unit.match(/(pm|per minute)$/)) {
        speed_value /= 60;
      }

      // Which unit?
      switch (speed_unit) {
        // Degrees per minute / second
        case 'dpm':
        case 'degrees per minute':
        case 'dps':
        case 'degrees per second':
          speed = THREE.Math.degToRad(speed_value);
          break;

        // Radians per minute / second
        case 'radians per minute':
        case 'radians per second':
          speed = speed_value;
          break;

        // Revolutions per minute / second
        case 'rpm':
        case 'revolutions per minute':
        case 'rps':
        case 'revolutions per second':
          speed = speed_value * PSVUtils.TwoPI;
          break;

        // Unknown unit
        default:
          throw new PSVError('unknown speed unit "' + speed_unit + '"');
      }
    }

    return speed;
  };

  /**
   * @summary Parses an angle value in radians or degrees and returns a normalized value in radians
   * @param {string|number} angle - eg: 3.14, 3.14rad, 180deg
   * @param {boolean} [zeroCenter=false] - normalize between -Pi/2 - Pi/2 instead of 0 - 2*Pi
   * @param {boolean} [halfCircle=zeroCenter] - normalize between -Pi - Pi instead of -Pi/2 - Pi/2
   * @returns {float}
   * @throws {PSVError} when the angle cannot be parsed
   */
  PSVUtils.parseAngle = function(angle, zeroCenter, halfCircle) {
    if (halfCircle === undefined) {
      halfCircle = zeroCenter;
    }

    if (typeof angle === 'string') {
      var match = angle.toLowerCase().trim().match(/^(-?[0-9]+(?:\.[0-9]*)?)(.*)$/);

      if (!match) {
        throw new PSVError('unknown angle "' + angle + '"');
      }

      var value = parseFloat(match[1]);
      var unit = match[2];

      if (unit) {
        switch (unit) {
          case 'deg':
          case 'degs':
            angle = THREE.Math.degToRad(value);
            break;
          case 'rad':
          case 'rads':
            angle = value;
            break;
          default:
            throw new PSVError('unknown angle unit "' + unit + '"');
        }
      }
      else {
        angle = value;
      }
    }

    angle = (zeroCenter ? angle + Math.PI : angle) % PSVUtils.TwoPI;

    if (angle < 0) {
      angle = PSVUtils.TwoPI + angle;
    }

    return zeroCenter ? PSVUtils.bound(angle - Math.PI, -Math.PI / (halfCircle ? 2 : 1), Math.PI / (halfCircle ? 2 : 1)) : angle;
  };

  /**
   * @summary Removes all children of a three.js scene and dispose all textures
   * @param {THREE.Scene} scene
   */
  PSVUtils.cleanTHREEScene = function(scene) {
    scene.children.forEach(function(item) {
      if (item instanceof THREE.Mesh) {
        if (item.geometry) {
          item.geometry.dispose();
          item.geometry = null;
        }

        if (item.material) {
          if (item.material.materials) {
            item.material.materials.forEach(function(material) {
              if (material.map) {
                material.map.dispose();
                material.map = null;
              }

              material.dispose();
            });

            item.material.materials.length = 0;
          }
          else {
            if (item.material.map) {
              item.material.map.dispose();
              item.material.map = null;
            }

            item.material.dispose();
          }

          item.material = null;
        }
      }
    });
    scene.children.length = 0;
  };

  /**
   * @summary Returns a function, that, when invoked, will only be triggered at most once during a given window of time.
   * @copyright underscore.js - modified by Clément Prévost {@link http://stackoverflow.com/a/27078401}
   * @param {Function} func
   * @param {int} wait
   * @returns {Function}
   */
  PSVUtils.throttle = funcs.debounce;
  /**
   * @summary Test if an object is a plain object
   * @description Test if an object is a plain object, i.e. is constructed
   * by the built-in Object constructor and inherits directly from Object.prototype
   * or null. Some built-in objects pass the test, e.g. Math which is a plain object
   * and some host or exotic objects may pass also.
   * {@link http://stackoverflow.com/a/5878101/1207670}
   * @param {*} obj
   * @returns {boolean}
   */
  PSVUtils.isPlainObject =  types.isPlainObject;
  /**
   * @summary Merges the enumerable attributes of two objects
   * @description Replaces arrays and alters the target object.
   * @copyright Nicholas Fisher <nfisher110@gmail.com>
   * @param {Object} target
   * @param {Object} src
   * @returns {Object} target
   */
  PSVUtils.deepmerge = function(target, src) {
    
    return objects.mixin(target,src,true);

  };

  /**
   * @summary Clones an object
   * @param {Object} src
   * @returns {Object}
   */
  PSVUtils.clone = objects.clone;

  /**
   * @summary Normalize mousewheel values accross browsers
   * @description From Facebook's Fixed Data Table
   * {@link https://github.com/facebookarchive/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js}
   * @copyright Facebook
   * @param {MouseWheelEvent} event
   * @returns {{spinX: number, spinY: number, pixelX: number, pixelY: number}}
   */
  PSVUtils.normalizeWheel = mouse.normalizeWheel;

  /**
   * @callback ForEach
   * @memberOf PSVUtils
   * @param {*} value
   * @param {string} key
   */

  /**
   * Loops over enumerable properties of an object
   * @param {object} object
   * @param {ForEach} callback
   */
  PSVUtils.forEach = function(object, callback) {
    return objects.each(object,callback,true);
  };

  return PSVUtils;
});