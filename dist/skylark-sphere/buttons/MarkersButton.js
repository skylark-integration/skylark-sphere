/**
 * skylark-sphere - A version of sphere that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-sphere/
 * @license MIT
 */
define(["./Button"],function(t){"use strict";function o(o){t.call(this,o),this.create()}return o.prototype=Object.create(t.prototype),o.prototype.constructor=o,o.id="markers",o.className="psv-button psv-button--hover-scale psv-markers-button",o.icon="pin.svg",o.prototype._onClick=function(){this.psv.hud.toggleMarkersList()},o});
//# sourceMappingURL=../sourcemaps/buttons/MarkersButton.js.map
