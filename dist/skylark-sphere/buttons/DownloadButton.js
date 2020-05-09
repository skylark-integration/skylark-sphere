/**
 * skylark-sphere - A version of sphere that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-sphere/
 * @license MIT
 */
define(["./Button"],function(t){"use strict";function o(o){t.call(this,o),this.create()}return o.prototype=Object.create(t.prototype),o.prototype.constructor=o,o.id="download",o.className="psv-button psv-button--hover-scale psv-download-button",o.icon="download.svg",o.prototype._onClick=function(){var t=document.createElement("a");t.href=this.psv.config.panorama,t.download=this.psv.config.panorama,this.psv.container.appendChild(t),t.click()},o});
//# sourceMappingURL=../sourcemaps/buttons/DownloadButton.js.map
