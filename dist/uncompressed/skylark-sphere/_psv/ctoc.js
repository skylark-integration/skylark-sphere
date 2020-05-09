define([
	"skylark-langx/Emitter",
],function(
  Emitter
){
  "use strict";
  /**
   * Viewer class
   * @param {Object} options - see {@link http://photo-sphere-viewer.js.org/#options}
   * @constructor
   * @fires PhotoSphereViewer.ready
   * @throws {PSVError} when the configuration is incorrect
   */
  var PhotoSphereViewer = Emitter.inherit({
  });

  PhotoSphereViewer.prototype.off = function(event,f) {
    return  Emitter.prototype.off.call(this,event,f["$$" + event] || f);    
  };

  PhotoSphereViewer.prototype.on = function(event,f) {
      if (typeof f === 'object') {

        return Emitter.prototype.on.call(this,event,f["$$" + event] = function(e){
          e.args = Array.prototype.slice.call(arguments,1);
          return f.handleEvent(e);
        });
     } else {
        return Emitter.prototype.on.call(this,event,f["$$" + event] = function(e,arg1,arg2,arg3) {
          return f.call(this,arg1,arg2,arg3);
        },this);
     }

  };

  PhotoSphereViewer.prototype.one = function(event,f) {
    if (typeof f === 'object') {

        return Emitter.prototype.on.call(this,event,"",null,f["$$" + event] = function(e){
          e.args = Array.prototype.slice.call(arguments,1);
          return f.handleEvent(e);
        },this,true);
     } else {
        return Emitter.prototype.on.call(this,event,"",null,f,this,true);
     }

  };


  return PhotoSphereViewer;
	
});