/**
 * skylark-sphere - A version of sphere that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-sphere/
 * @license MIT
 */
define(["../_psv/ctoc","../PSVUtils","./PSVComponent"],function(t,e,i){"use strict";function s(t){i.call(this,t),this.create(),this.hide()}return s.prototype=Object.create(i.prototype),s.prototype.constructor=s,s.className="psv-overlay",s.publicMethods=["showOverlay","hideOverlay","isOverlayVisible"],s.prototype.create=function(){i.prototype.create.call(this),this.image=document.createElement("div"),this.image.className="psv-overlay-image",this.container.appendChild(this.image),this.text=document.createElement("div"),this.text.className="psv-overlay-text",this.container.appendChild(this.text),this.subtext=document.createElement("div"),this.subtext.className="psv-overlay-subtext",this.container.appendChild(this.subtext),this.container.addEventListener("click",this.hideOverlay.bind(this))},s.prototype.destroy=function(){delete this.image,delete this.text,delete this.subtext,i.prototype.destroy.call(this)},s.prototype.isOverlayVisible=function(){return this.visible},s.prototype.showOverlay=function(t){"string"==typeof t&&(t={text:t}),this.image.innerHTML=t.image||"",this.text.innerHTML=t.text||"",this.subtext.innerHTML=t.subtext||"",this.show(),this.psv.trigger("show-overlay")},s.prototype.hideOverlay=function(){this.isOverlayVisible()&&(this.hide(),this.psv.trigger("hide-overlay"))},s});
//# sourceMappingURL=../sourcemaps/components/PSVOverlay.js.map
