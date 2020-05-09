/**
 * skylark-sphere - A version of sphere that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-sphere/
 * @license MIT
 */
define(["../_psv/ctoc"],function(t){"use strict";function i(i){this.psv=i instanceof t?i:i.psv,this.parent=i,this.container=null,this.visible=!0,this.constructor.publicMethods&&this.constructor.publicMethods.forEach(function(t){this.psv[t]=this[t].bind(this)},this)}return i.className=null,i.publicMethods=[],i.prototype.create=function(){this.container=document.createElement("div"),this.constructor.className&&(this.container.className=this.constructor.className),this.parent.container.appendChild(this.container)},i.prototype.destroy=function(){this.parent.container.removeChild(this.container),this.constructor.publicMethods&&this.constructor.publicMethods.forEach(function(t){delete this.psv[t]},this),delete this.container,delete this.psv,delete this.parent},i.prototype.hide=function(){this.container.style.display="none",this.visible=!1},i.prototype.show=function(){this.container.style.display="",this.visible=!0},i});
//# sourceMappingURL=../sourcemaps/components/PSVComponent.js.map
