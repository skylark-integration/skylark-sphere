/**
 * skylark-sphere - A version of sphere that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-sphere/
 * @license MIT
 */
define(["../_psv/ctoc","./Button"],function(t,e){"use strict";function o(t){e.call(this,t),this.create()}return o.prototype=Object.create(e.prototype),o.prototype.constructor=o,o.id="fullscreen",o.className="psv-button psv-button--hover-scale psv-fullscreen-button",o.icon="fullscreen-in.svg",o.iconActive="fullscreen-out.svg",o.prototype.create=function(){e.prototype.create.call(this),this.psv.on("fullscreen-updated",this)},o.prototype.destroy=function(){this.psv.off("fullscreen-updated",this),e.prototype.destroy.call(this)},o.prototype.supported=function(){return!!t.SYSTEM.fullscreenEvent},o.prototype.handleEvent=function(t){switch(t.type){case"fullscreen-updated":this.toggleActive(t.args[0])}},o.prototype._onClick=function(){this.psv.toggleFullscreen()},o});
//# sourceMappingURL=../sourcemaps/buttons/FullscreenButton.js.map
