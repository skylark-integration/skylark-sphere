/**
 * skylark-sphere - A version of sphere that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-sphere/
 * @license MIT
 */
define(["../_psv/ctoc","../PSVUtils","./PSVComponent"],function(t,i,o){"use strict";function n(t){o.call(this,t),this.create()}return n.prototype=Object.create(o.prototype),n.prototype.constructor=n,n.className="psv-notification",n.publicMethods=["showNotification","hideNotification","isNotificationVisible"],n.prototype.create=function(){o.prototype.create.call(this),this.content=document.createElement("div"),this.content.className="psv-notification-content",this.container.appendChild(this.content),this.content.addEventListener("click",this.hideNotification.bind(this))},n.prototype.destroy=function(){delete this.content,o.prototype.destroy.call(this)},n.prototype.isNotificationVisible=function(){return this.container.classList.contains("psv-notification--visible")},n.prototype.showNotification=function(t){"string"==typeof t&&(t={content:t}),this.content.innerHTML=t.content,this.container.classList.add("psv-notification--visible"),this.psv.trigger("show-notification"),t.timeout&&setTimeout(this.hideNotification.bind(this),t.timeout)},n.prototype.hideNotification=function(){this.isNotificationVisible()&&(this.container.classList.remove("psv-notification--visible"),this.psv.trigger("hide-notification"))},n});
//# sourceMappingURL=../sourcemaps/components/PSVNotification.js.map
