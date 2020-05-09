/**
 * skylark-sphere - A version of sphere that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-sphere/
 * @license MIT
 */
define(["./Button"],function(t){function o(o){t.call(this,o),this.create()}return o.prototype=Object.create(t.prototype),o.prototype.constructor=o,o.id="markers",o.className="psv-button psv-button--hover-scale psv-caption-button",o.icon="info.svg",o.prototype.create=function(){t.prototype.create.call(this),this.psv.on("hide-notification",this)},o.prototype.destroy=function(){this.psv.off("hide-notification",this),t.prototype.destroy.call(this)},o.prototype.handleEvent=function(t){switch(t.type){case"hide-notification":this.toggleActive(!1)}},o.prototype._onClick=function(){this.psv.isNotificationVisible()?this.psv.hideNotification():(this.psv.showNotification(this.parent.prop.caption),this.toggleActive(!0))},o});
//# sourceMappingURL=../sourcemaps/buttons/CaptionButton.js.map
