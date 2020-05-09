/**
 * skylark-sphere - A version of sphere that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-sphere/
 * @license MIT
 */
define(["../PSVUtils","./Button"],function(t,i){"use strict";function o(t,o){i.call(this,t),this.config=o,this.config.id&&(this.id=this.config.id),this.create()}return o.prototype=Object.create(i.prototype),o.prototype.constructor=o,o.className="psv-button psv-custom-button",o.prototype.create=function(){i.prototype.create.call(this),this.config.className&&t.addClasses(this.container,this.config.className),this.config.title&&(this.container.title=this.config.title),this.config.content&&(this.container.innerHTML=this.config.content),!1!==this.config.enabled&&!0!==this.config.disabled||this.disable(),!1!==this.config.visible&&!0!==this.config.hidden||this.hide()},o.prototype.destroy=function(){delete this.config,i.prototype.destroy.call(this)},o.prototype._onClick=function(){this.config.onClick&&this.config.onClick.apply(this.psv)},o});
//# sourceMappingURL=../sourcemaps/buttons/CustomButton.js.map
