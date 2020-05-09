/**
 * skylark-sphere - A version of sphere that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-sphere/
 * @license MIT
 */
define(["../_psv/ctoc","../PSVUtils","./Button"],function(t,o,e){"use strict";function p(t){e.call(this,t),this.create()}return p.prototype=Object.create(e.prototype),p.prototype.constructor=p,p.id="gyroscope",p.className="psv-button psv-button--hover-scale psv-gyroscope-button",p.icon="compass.svg",p.prototype.create=function(){e.prototype.create.call(this),this.psv.on("gyroscope-updated",this)},p.prototype.destroy=function(){this.psv.off("gyroscope-updated",this),e.prototype.destroy.call(this)},p.prototype.supported=function(){return!!o.checkTHREE("DeviceOrientationControls")&&t.SYSTEM.deviceOrientationSupported},p.prototype.handleEvent=function(t){switch(t.type){case"gyroscope-updated":this.toggleActive(t.args[0])}},p.prototype._onClick=function(){this.psv.toggleGyroscopeControl()},p});
//# sourceMappingURL=../sourcemaps/buttons/GyroscopeButton.js.map
