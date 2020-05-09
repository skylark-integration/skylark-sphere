/**
 * skylark-sphere - A version of sphere that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-sphere/
 * @license MIT
 */
define(["../_psv/ctoc","../buttons/CaptionButton","../PSVUtils","./PSVComponent"],function(t,e,n,o){"use strict";function i(t,e){o.call(this,t),this.content=null,this.button=null,this.prop={caption:"",width:0},this.create(),this.setCaption(e)}return i.prototype=Object.create(o.prototype),i.prototype.constructor=i,i.className="psv-caption",i.publicMethods=["setCaption"],i.prototype.create=function(){o.prototype.create.call(this),this.button=new e(this),this.button.hide(),this.content=document.createElement("div"),this.content.className="psv-caption-content",this.container.appendChild(this.content),window.addEventListener("resize",this)},i.prototype.destroy=function(){window.removeEventListener("resize",this),delete this.content,o.prototype.destroy.call(this)},i.prototype.handleEvent=function(t){switch(t.type){case"resize":this._onResize()}},i.prototype.setCaption=function(t){this.prop.caption=t||"",this.content.innerHTML=this.prop.caption,this.content.style.display="",this.prop.width=this.content.offsetWidth,this._onResize()},i.prototype._onResize=function(){parseInt(n.getStyle(this.container,"width"))>=this.prop.width?(this.button.hide(),this.content.style.display=""):(this.button.show(),this.content.style.display="none")},i});
//# sourceMappingURL=../sourcemaps/components/PSVNavBarCaption.js.map
