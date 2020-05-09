/**
 * skylark-sphere - A version of sphere that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-sphere/
 * @license MIT
 */
define(["skylark-langx/Emitter"],function(t){"use strict";var o=t.inherit({});return o.prototype.off=function(o,n){return t.prototype.off.call(this,o,n["$$"+o]||n)},o.prototype.on=function(o,n){return"object"==typeof n?t.prototype.on.call(this,o,n["$$"+o]=function(t){return t.args=Array.prototype.slice.call(arguments,1),n.handleEvent(t)}):t.prototype.on.call(this,o,n["$$"+o]=function(t,o,r,e){return n.call(this,o,r,e)},this)},o.prototype.one=function(o,n){return"object"==typeof n?t.prototype.on.call(this,o,"",null,n["$$"+o]=function(t){return t.args=Array.prototype.slice.call(arguments,1),n.handleEvent(t)},this,!0):t.prototype.on.call(this,o,"",null,n,this,!0)},o});
//# sourceMappingURL=../sourcemaps/_psv/ctoc.js.map
