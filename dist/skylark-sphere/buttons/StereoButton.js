/**
 * skylark-sphere - A version of sphere that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-sphere/
 * @license MIT
 */
define(["../_psv/ctoc","../PSVUtils","./Button"],function(t,e,o){"use strict";function s(t){o.call(this,t),this.create()}return s.prototype=Object.create(o.prototype),s.prototype.constructor=s,s.id="stereo",s.className="psv-button psv-button--hover-scale psv-stereo-button",s.icon="stereo.svg",s.prototype.create=function(){o.prototype.create.call(this),this.psv.on("stereo-updated",this)},s.prototype.destroy=function(){this.psv.off("stereo-updated",this),o.prototype.destroy.call(this)},s.prototype.supported=function(){return!(!t.SYSTEM.fullscreenEvent||!e.checkTHREE("DeviceOrientationControls"))&&t.SYSTEM.deviceOrientationSupported},s.prototype.handleEvent=function(t){switch(t.type){case"stereo-updated":this.toggleActive(t.args[0])}},s.prototype._onClick=function(){this.psv.toggleStereoView()},s});
//# sourceMappingURL=../sourcemaps/buttons/StereoButton.js.map
