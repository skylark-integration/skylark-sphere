/**
 * skylark-sphere - A version of sphere that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-sphere/
 * @license MIT
 */
define(["../_psv/ctoc","../components/PSVComponent","../PSVUtils"],function(t,i,o){"use strict";function n(t){i.call(this,t),this.id=void 0,this.constructor.id&&(this.id=this.constructor.id),this.enabled=!0}return n.prototype=Object.create(i.prototype),n.prototype.constructor=n,n.id=null,n.icon=null,n.iconActive=null,n.prototype.create=function(){i.prototype.create.call(this),this.constructor.icon&&this._setIcon(this.constructor.icon),this.id&&this.psv.config.lang[this.id]&&(this.container.title=this.psv.config.lang[this.id]),this.container.addEventListener("click",function(t){this.enabled&&this._onClick(),t.stopPropagation()}.bind(this));var t=this.supported();"function"==typeof t.then?(this.hide(),t.then(function(t){t&&this.show()}.bind(this))):t||this.hide()},n.prototype.destroy=function(){i.prototype.destroy.call(this)},n.prototype.supported=function(){return!0},n.prototype.toggleActive=function(t){o.toggleClass(this.container,"psv-button--active",t),this.constructor.iconActive&&this._setIcon(t?this.constructor.iconActive:this.constructor.icon)},n.prototype.disable=function(){this.container.classList.add("psv-button--disabled"),this.enabled=!1},n.prototype.enable=function(){this.container.classList.remove("psv-button--disabled"),this.enabled=!0},n.prototype._setIcon=function(i,o){o||(o=this.container),i?(o.innerHTML=t.ICONS[i],o.querySelector("svg").setAttribute("class","psv-button-svg")):o.innerHTML=""},n.prototype._onClick=function(){},n});
//# sourceMappingURL=../sourcemaps/buttons/Button.js.map
