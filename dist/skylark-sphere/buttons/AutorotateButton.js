/**
 * skylark-sphere - A version of sphere that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-sphere/
 * @license MIT
 */
define(["./Button"],function(t){"use strict";function o(o){t.call(this,o),this.create()}return o.prototype=Object.create(t.prototype),o.prototype.constructor=o,o.id="autorotate",o.className="psv-button psv-button--hover-scale psv-autorotate-button",o.icon="play.svg",o.iconActive="play-active.svg",o.prototype.create=function(){t.prototype.create.call(this),this.psv.on("autorotate",this)},o.prototype.destroy=function(){this.psv.off("autorotate",this),t.prototype.destroy.call(this)},o.prototype.handleEvent=function(t){switch(t.type){case"autorotate":this.toggleActive(t.args[0])}},o.prototype._onClick=function(){this.psv.toggleAutorotate()},o});
//# sourceMappingURL=../sourcemaps/buttons/AutorotateButton.js.map
