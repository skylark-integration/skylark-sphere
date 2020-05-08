define([
  "skylark-threejs",
  "./ctoc",
  "../doT",
  "../PSVError",
  "../PSVUtils",
  "../PSVAnimation,"
  "../components/PSVHUD",
  "../components/PSVLoader",
  "../components/PSVNavBar",
  "../components/PSVNotification",
  "../components/PSVOverlay",
  "../components/PSVPanel",
  "../components/PSVTooltip"
],function(
  THREE,
  PhotoSphereViewer,
  doT,
  PSVError,
  PSVUtils,
  PSVAnimation,
  PSVHUD,
  PSVLoader,
  PSVNavBar,
  PSVNotification,
  PSVOverlay,
  PSVPanel,
  PSVTooltip
){
  "use strict";

  PhotoSphereViewer.prototype._construct = function (options) {

    // init global system variables
    if (!PhotoSphereViewer.SYSTEM.loaded) {
      PhotoSphereViewer._loadSystem();
    }

    /**
     * @summary Configuration object
     * @member {Object}
     * @readonly
     */
    this.config = PSVUtils.clone(PhotoSphereViewer.DEFAULTS);
    PSVUtils.deepmerge(this.config, options);

    // check container
    if (!options.container) {
      throw new PSVError('No value given for container.');
    }

    // must support canvas
    if (!PhotoSphereViewer.SYSTEM.isCanvasSupported) {
      throw new PSVError('Canvas is not supported.');
    }

    // must support webgl
    if (!PhotoSphereViewer.SYSTEM.isWebGLSupported) {
      throw new PSVError('WebGL is not supported.');
    }

    // longitude range must have two values
    if (this.config.longitude_range && this.config.longitude_range.length !== 2) {
      this.config.longitude_range = null;
      console.warn('PhotoSphereViewer: longitude_range must have exactly two elements.');
    }

    if (this.config.latitude_range) {
      // latitude range must have two values
      if (this.config.latitude_range.length !== 2) {
        this.config.latitude_range = null;
        console.warn('PhotoSphereViewer: latitude_range must have exactly two elements.');
      }
      // latitude range must be ordered
      else if (this.config.latitude_range[0] > this.config.latitude_range[1]) {
        this.config.latitude_range = [this.config.latitude_range[1], this.config.latitude_range[0]];
        console.warn('PhotoSphereViewer: latitude_range values must be ordered.');
      }
    }
    // migrate legacy tilt_up_max and tilt_down_max
    else if (this.config.tilt_up_max !== undefined || this.config.tilt_down_max !== undefined) {
      this.config.latitude_range = [
        this.config.tilt_down_max !== undefined ? this.config.tilt_down_max - Math.PI / 4 : -PSVUtils.HalfPI,
        this.config.tilt_up_max !== undefined ? this.config.tilt_up_max + Math.PI / 4 : PSVUtils.HalfPI
      ];
      console.warn('PhotoSphereViewer: tilt_up_max and tilt_down_max are deprecated, use latitude_range instead.');
    }

    // min_fov and max_fov must be ordered
    if (this.config.max_fov < this.config.min_fov) {
      var temp_fov = this.config.max_fov;
      this.config.max_fov = this.config.min_fov;
      this.config.min_fov = temp_fov;
      console.warn('PhotoSphereViewer: max_fov cannot be lower than min_fov.');
    }

    // cache_texture must be a positive integer or false
    if (this.config.cache_texture && (!PSVUtils.isInteger(this.config.cache_texture) || this.config.cache_texture < 0)) {
      this.config.cache_texture = PhotoSphereViewer.DEFAULTS.cache_texture;
      console.warn('PhotoSphereViewer: invalid value for cache_texture');
    }

    // panorama_roll is deprecated
    if ('panorama_roll' in this.config) {
      this.config.sphere_correction.roll = this.config.panorama_roll;
      console.warn('PhotoSphereViewer: panorama_roll is deprecated, use sphere_correction.roll instead');
    }

    // gyroscope is deprecated
    if ('gyroscope' in this.config) {
      console.warn('PhotoSphereViewer: gyroscope is deprecated, the control is automatically created if DeviceOrientationControls.js is loaded');
    }

    // keyboard=true becomes the default map
    if (this.config.keyboard === true) {
      this.config.keyboard = PSVUtils.clone(PhotoSphereViewer.DEFAULTS.keyboard);
    }

    // min_fov/max_fov between 1 and 179
    this.config.min_fov = PSVUtils.bound(this.config.min_fov, 1, 179);
    this.config.max_fov = PSVUtils.bound(this.config.max_fov, 1, 179);

    // default default_fov is middle point between min_fov and max_fov
    if (this.config.default_fov === null) {
      this.config.default_fov = this.config.max_fov / 2 + this.config.min_fov / 2;
    }
    // default_fov between min_fov and max_fov
    else {
      this.config.default_fov = PSVUtils.bound(this.config.default_fov, this.config.min_fov, this.config.max_fov);
    }

    // default anim_lat is default_lat
    if (this.config.anim_lat === null) {
      this.config.anim_lat = this.config.default_lat;
    }
    // parse anim_lat, is between -PI/2 and PI/2
    else {
      this.config.anim_lat = PSVUtils.parseAngle(this.config.anim_lat, true);
    }

    // parse longitude_range, between 0 and 2*PI
    if (this.config.longitude_range) {
      this.config.longitude_range = this.config.longitude_range.map(function(angle) {
        return PSVUtils.parseAngle(angle);
      });
    }

    // parse latitude_range, between -PI/2 and PI/2
    if (this.config.latitude_range) {
      this.config.latitude_range = this.config.latitude_range.map(function(angle) {
        return PSVUtils.parseAngle(angle, true);
      });
    }

    // parse anim_speed
    this.config.anim_speed = PSVUtils.parseSpeed(this.config.anim_speed);

    // reactivate the navbar if the caption is provided
    if (this.config.caption && !this.config.navbar) {
      this.config.navbar = ['caption'];
    }

    // translate boolean fisheye to amount
    if (this.config.fisheye === true) {
      this.config.fisheye = 1;
    }
    else if (this.config.fisheye === false) {
      this.config.fisheye = 0;
    }

    /**
     * @summary Top most parent
     * @member {HTMLElement}
     * @readonly
     */
    this.parent = (typeof options.container === 'string') ? document.getElementById(options.container) : options.container;

    /**
     * @summary Main container
     * @member {HTMLElement}
     * @readonly
     */
    this.container = null;

    /**
     * @member {module:components.PSVLoader}
     * @readonly
     */
    this.loader = null;

    /**
     * @member {module:components.PSVNavBar}
     * @readonly
     */
    this.navbar = null;

    /**
     * @member {module:components.PSVHUD}
     * @readonly
     */
    this.hud = null;

    /**
     * @member {module:components.PSVPanel}
     * @readonly
     */
    this.panel = null;

    /**
     * @member {module:components.PSVTooltip}
     * @readonly
     */
    this.tooltip = null;

    /**
     * @member {module:components.PSVNotification}
     * @readonly
     */
    this.notification = null;

    /**
     * @member {module:components.PSVOverlay}
     * @readonly
     */
    this.overlay = null;

    /**
     * @member {HTMLElement}
     * @readonly
     * @private
     */
    this.canvas_container = null;

    /**
     * @member {THREE.WebGLRenderer | THREE.CanvasRenderer}
     * @readonly
     * @private
     */
    this.renderer = null;

    /**
     * @member {THREE.StereoEffect}
     * @private
     */
    this.stereoEffect = null;

    /**
     * @member {NoSleep}
     * @private
     */
    this.noSleep = null;

    /**
     * @member {THREE.Scene}
     * @readonly
     * @private
     */
    this.scene = null;

    /**
     * @member {THREE.PerspectiveCamera}
     * @readonly
     * @private
     */
    this.camera = null;

    /**
     * @member {THREE.Mesh}
     * @readonly
     * @private
     */
    this.mesh = null;

    /**
     * @member {THREE.Raycaster}
     * @readonly
     * @private
     */
    this.raycaster = null;

    /**
     * @member {THREE.DeviceOrientationControls}
     * @readonly
     * @private
     */
    this.doControls = null;

    /**
     * @summary Internal properties
     * @member {Object}
     * @readonly
     * @property {boolean} needsUpdate - if the view needs to be renderer
     * @property {boolean} isCubemap - if the panorama is a cubemap
     * @property {PhotoSphereViewer.Position} position - current direction of the camera
     * @property {THREE.Vector3} direction - direction of the camera
     * @property {float} anim_speed - parsed animation speed (rad/sec)
     * @property {int} zoom_lvl - current zoom level
     * @property {float} vFov - vertical FOV
     * @property {float} hFov - horizontal FOV
     * @property {float} aspect - viewer aspect ratio
     * @property {float} move_speed - move speed (computed with pixel ratio and configuration move_speed)
     * @property {boolean} moving - is the user moving
     * @property {boolean} zooming - is the user zooming
     * @property {int} start_mouse_x - start x position of the click/touch
     * @property {int} start_mouse_y - start y position of the click/touch
     * @property {int} mouse_x - current x position of the cursor
     * @property {int} mouse_y - current y position of the cursor
     * @property {Array[]} mouse_history - list of latest positions of the cursor, [time, x, y]
     * @property {int} gyro_alpha_offset - current alpha offset for gyroscope controls
     * @property {int} pinch_dist - distance between fingers when zooming
     * @property main_reqid - animationRequest id of the main event loop
     * @property {function} orientation_cb - update callback of the device orientation
     * @property {function} autorotate_cb - update callback of the automatic rotation
     * @property {Promise} animation_promise - promise of the current animation (either go to position or image transition)
     * @property {Promise} loading_promise - promise of the setPanorama method
     * @property start_timeout - timeout id of the automatic rotation delay
     * @property {PhotoSphereViewer.ClickData} dblclick_data - temporary storage of click data between two clicks
     * @property dblclick_timeout - timeout id for double click
     * @property {PhotoSphereViewer.CacheItem[]} cache - cached panoramas
     * @property {PhotoSphereViewer.Size} size - size of the container
     * @property {PhotoSphereViewer.PanoData} pano_data - panorama metadata
     */
    this.prop = {
      needsUpdate: true,
      isCubemap: undefined,
      position: {
        longitude: 0,
        latitude: 0
      },
      ready: false,
      direction: null,
      anim_speed: 0,
      zoom_lvl: 0,
      vFov: 0,
      hFov: 0,
      aspect: 0,
      move_speed: 0.1,
      moving: false,
      zooming: false,
      start_mouse_x: 0,
      start_mouse_y: 0,
      mouse_x: 0,
      mouse_y: 0,
      mouse_history: [],
      gyro_alpha_offset: 0,
      pinch_dist: 0,
      main_reqid: null,
      orientation_cb: null,
      autorotate_cb: null,
      animation_promise: null,
      loading_promise: null,
      start_timeout: null,
      dblclick_data: null,
      dblclick_timeout: null,
      cache: [],
      size: {
        width: 0,
        height: 0
      },
      pano_data: {
        full_width: 0,
        full_height: 0,
        cropped_width: 0,
        cropped_height: 0,
        cropped_x: 0,
        cropped_y: 0
      }
    };

    // init templates
    Object.keys(PhotoSphereViewer.TEMPLATES).forEach(function(tpl) {
      if (!this.config.templates[tpl]) {
        this.config.templates[tpl] = PhotoSphereViewer.TEMPLATES[tpl];
      }
      if (typeof this.config.templates[tpl] === 'string') {
        this.config.templates[tpl] = doT.template(this.config.templates[tpl]);
      }
    }, this);

    // init
    this.parent.photoSphereViewer = this;

      // create actual container
      this.container = document.createElement('div');
      this.container.classList.add('psv-container');
      this.parent.appendChild(this.container);

      // apply container size
      if (this.config.size !== null) {
        this._setViewerSize(this.config.size);
      }
      this._onResize();

      // apply default zoom level
      var tempZoom = (this.config.default_fov - this.config.min_fov) / (this.config.max_fov - this.config.min_fov) * 100;
      this.config.default_zoom_lvl = tempZoom - 2 * (tempZoom - 50);

      // actual move speed depends on pixel-ratio
      this.prop.move_speed = THREE.Math.degToRad(this.config.move_speed / PhotoSphereViewer.SYSTEM.pixelRatio);

      // load loader (!!)
      this.loader = new PSVLoader(this);
      this.loader.hide();

      // load navbar
      this.navbar = new PSVNavBar(this);
      this.navbar.hide();

      // load hud
      this.hud = new PSVHUD(this);
      this.hud.hide();

      // load side panel
      this.panel = new PSVPanel(this);

      // load hud tooltip
      this.tooltip = new PSVTooltip(this.hud);

      // load notification
      this.notification = new PSVNotification(this);

      // load overlay
      this.overlay = new PSVOverlay(this);

      // attach event handlers
      this._bindEvents();

      // load panorama
      if (this.config.panorama) {
        this.setPanorama(this.config.panorama);
      }

      // enable GUI after first render
      this.one('render', function() {
        if (this.config.navbar) {
          this.container.classList.add('psv-container--has-navbar');
          this.navbar.show();
        }

        this.hud.show();

        if (this.config.markers) {
          this.config.markers.forEach(function(marker) {
            this.hud.addMarker(marker, false);
          }, this);

          this.hud.renderMarkers();
        }

        // Queue animation
        if (this.config.time_anim !== false) {
          this.prop.start_timeout = window.setTimeout(this.startAutorotate.bind(this), this.config.time_anim);
        }

        setTimeout(function() {
          // start render loop
          this._run();

          /**
           * @event ready
           * @memberof PhotoSphereViewer
           * @summary Triggered when the panorama image has been loaded and the viewer is ready to perform the first render
           */
          this.trigger('ready');
        }.bind(this), 0);
      }.bind(this));

      PhotoSphereViewer.SYSTEM.touchEnabled.then(function(enabled) {
        if (enabled) {
          this.container.classList.add('psv-is-touch');
        }
      }.bind(this));
  };



  /**
   * @summary Main event loop, calls {@link PhotoSphereViewer._render} if `prop.needsUpdate` is true
   * @param {int} timestamp
   * @fires PhotoSphereViewer.filter:before-render
   * @private
   */
  PhotoSphereViewer.prototype._run = function(timestamp) {
    /**
     * @event before-render
     * @memberof PhotoSphereViewer
     * @summary Triggered before a render, used to modify the view
     * @param {int} timestamp - time provided by requestAnimationFrame
     */
    this.trigger('before-render', timestamp || +new Date());

    if (this.prop.needsUpdate) {
      this._render();
      this.prop.needsUpdate = false;
    }

    this.prop.main_reqid = window.requestAnimationFrame(this._run.bind(this));
  };

  /**
   * @summary Performs a render
   * @fires PhotoSphereViewer.render
   * @private
   */
  PhotoSphereViewer.prototype._render = function() {
    this.prop.direction = this.sphericalCoordsToVector3(this.prop.position);
    this.camera.position.set(0, 0, 0);
    this.camera.lookAt(this.prop.direction);

    if (this.config.fisheye) {
      this.camera.position.copy(this.prop.direction).multiplyScalar(this.config.fisheye / 2).negate();
    }

    this.camera.aspect = this.prop.aspect;
    this.camera.fov = this.prop.vFov;
    this.camera.updateProjectionMatrix();

    (this.stereoEffect || this.renderer).render(this.scene, this.camera);

    /**
     * @event render
     * @memberof PhotoSphereViewer
     * @summary Triggered on each viewer render, **this event is triggered very often**
     */
    this.trigger('render');
  };

  /**
   * @summary Loads the XMP data with AJAX
   * @param {string} panorama
   * @returns {Promise.<PhotoSphereViewer.PanoData>}
   * @throws {PSVError} when the image cannot be loaded
   * @private
   */
  PhotoSphereViewer.prototype._loadXMP = function(panorama) {
    if (!this.config.usexmpdata) {
      return Promise.resolve(null);
    }

    return new Promise(function(resolve) {
      var progress = 0;

      var xhr = new XMLHttpRequest();
      if (this.config.with_credentials) {
        xhr.withCredentials = true;
      }

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 201 || xhr.status === 202 || xhr.status === 0) {
            this.loader.setProgress(100);

            var binary = xhr.responseText;
            var a = binary.indexOf('<x:xmpmeta'), b = binary.indexOf('</x:xmpmeta>');
            var data = binary.substring(a, b);
            var pano_data = null;

            if (a !== -1 && b !== -1 && data.indexOf('GPano:') !== -1) {
              pano_data = {
                full_width: parseInt(PSVUtils.getXMPValue(data, 'FullPanoWidthPixels')),
                full_height: parseInt(PSVUtils.getXMPValue(data, 'FullPanoHeightPixels')),
                cropped_width: parseInt(PSVUtils.getXMPValue(data, 'CroppedAreaImageWidthPixels')),
                cropped_height: parseInt(PSVUtils.getXMPValue(data, 'CroppedAreaImageHeightPixels')),
                cropped_x: parseInt(PSVUtils.getXMPValue(data, 'CroppedAreaLeftPixels')),
                cropped_y: parseInt(PSVUtils.getXMPValue(data, 'CroppedAreaTopPixels'))
              };

              if (!pano_data.full_width || !pano_data.full_height || !pano_data.cropped_width || !pano_data.cropped_height) {
                console.warn('PhotoSphereViewer: invalid XMP data');
                pano_data = null;
              }
            }

            resolve(pano_data);
          }
          else {
            this.container.textContent = 'Cannot load image';
            throw new PSVError('Cannot load image');
          }
        }
        else if (xhr.readyState === 3) {
          this.loader.setProgress(progress += 10);
        }
      }.bind(this);

      xhr.onprogress = function(e) {
        if (e.lengthComputable) {
          var new_progress = parseInt(e.loaded / e.total * 100);
          if (new_progress > progress) {
            progress = new_progress;
            this.loader.setProgress(progress);
          }
        }
      }.bind(this);

      xhr.onerror = function(e) {
        this.container.textContent = 'Cannot load image';
        reject(e);
        throw new PSVError('Cannot load image');
      }.bind(this);

      xhr.open('GET', panorama, true);
      xhr.send(null);
    }.bind(this));
  };

  /**
   * @summary Loads the panorama texture(s)
   * @param {string|string[]} panorama
   * @returns {Promise.<THREE.Texture|THREE.Texture[]>}
   * @fires PhotoSphereViewer.panorama-load-progress
   * @throws {PSVError} when the image cannot be loaded
   * @private
   */
  PhotoSphereViewer.prototype._loadTexture = function(panorama) {
    var tempPanorama = [];

    if (Array.isArray(panorama)) {
      if (panorama.length !== 6) {
        throw new PSVError('Must provide exactly 6 image paths when using cubemap.');
      }

      // reorder images
      for (var i = 0; i < 6; i++) {
        tempPanorama[i] = panorama[PhotoSphereViewer.CUBE_MAP[i]];
      }
      panorama = tempPanorama;
    }
    else if (typeof panorama === 'object') {
      if (!PhotoSphereViewer.CUBE_HASHMAP.every(function(side) {
          return !!panorama[side];
        })) {
        throw new PSVError('Must provide exactly left, front, right, back, top, bottom when using cubemap.');
      }

      // transform into array
      PhotoSphereViewer.CUBE_HASHMAP.forEach(function(side, i) {
        tempPanorama[i] = panorama[side];
      });
      panorama = tempPanorama;
    }

    if (Array.isArray(panorama)) {
      if (this.prop.isCubemap === false) {
        throw new PSVError('The viewer was initialized with an equirectangular panorama, cannot switch to cubemap.');
      }

      if (this.config.fisheye) {
        console.warn('PhotoSphereViewer: fisheye effect with cubemap texture can generate distorsions.');
      }

      if (this.config.cache_texture === PhotoSphereViewer.DEFAULTS.cache_texture) {
        this.config.cache_texture *= 6;
      }

      this.prop.isCubemap = true;

      return this._loadCubemapTexture(panorama);
    }
    else {
      if (this.prop.isCubemap === true) {
        throw new PSVError('The viewer was initialized with an cubemap, cannot switch to equirectangular panorama.');
      }

      this.prop.isCubemap = false;

      return this._loadEquirectangularTexture(panorama);
    }
  };

  /**
   * @summary Loads the sphere texture
   * @param {string} panorama
   * @returns {Promise.<THREE.Texture>}
   * @fires PhotoSphereViewer.panorama-load-progress
   * @throws {PSVError} when the image cannot be loaded
   * @private
   */
  PhotoSphereViewer.prototype._loadEquirectangularTexture = function(panorama) {
    if (this.config.cache_texture) {
      var cache = this.getPanoramaCache(panorama);

      if (cache) {
        this.prop.pano_data = cache.pano_data;

        return Promise.resolve(cache.image);
      }
    }

    return this._loadXMP(panorama).then(function(pano_data) {
      return new Promise(function(resolve, reject) {
        var loader = new THREE.ImageLoader();
        var progress = pano_data ? 100 : 0;

        if (this.config.with_credentials) {
          loader.setCrossOrigin('use-credentials');
        }
        else {
          loader.setCrossOrigin('anonymous');
        }

        var onload = function(img) {
          progress = 100;

          this.loader.setProgress(progress);

          /**
           * @event panorama-load-progress
           * @memberof PhotoSphereViewer
           * @summary Triggered while a panorama image is loading
           * @param {string} panorama
           * @param {int} progress
           */
          this.trigger('panorama-load-progress', panorama, progress);

          // Config XMP data
          if (!pano_data && this.config.pano_data) {
            pano_data = PSVUtils.clone(this.config.pano_data);
          }

          // Default XMP data
          if (!pano_data) {
            pano_data = {
              full_width: img.width,
              full_height: img.height,
              cropped_width: img.width,
              cropped_height: img.height,
              cropped_x: 0,
              cropped_y: 0
            };
          }

          this.prop.pano_data = pano_data;

          var texture;

          var ratio = Math.min(pano_data.full_width, PhotoSphereViewer.SYSTEM.maxTextureWidth) / pano_data.full_width;

          // resize image / fill cropped parts with black
          if (ratio !== 1 || pano_data.cropped_width !== pano_data.full_width || pano_data.cropped_height !== pano_data.full_height) {
            var resized_pano_data = PSVUtils.clone(pano_data);

            resized_pano_data.full_width *= ratio;
            resized_pano_data.full_height *= ratio;
            resized_pano_data.cropped_width *= ratio;
            resized_pano_data.cropped_height *= ratio;
            resized_pano_data.cropped_x *= ratio;
            resized_pano_data.cropped_y *= ratio;

            img.width = resized_pano_data.cropped_width;
            img.height = resized_pano_data.cropped_height;

            var buffer = document.createElement('canvas');
            buffer.width = resized_pano_data.full_width;
            buffer.height = resized_pano_data.full_height;

            var ctx = buffer.getContext('2d');
            ctx.drawImage(img, resized_pano_data.cropped_x, resized_pano_data.cropped_y, resized_pano_data.cropped_width, resized_pano_data.cropped_height);

            texture = new THREE.Texture(buffer);
          }
          else {
            texture = new THREE.Texture(img);
          }

          texture.needsUpdate = true;
          texture.minFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;

          if (this.config.cache_texture) {
            this._putPanoramaCache({
              panorama: panorama,
              image: texture,
              pano_data: pano_data
            });
          }

          resolve(texture);
        };

        var onprogress = function(e) {
          if (e.lengthComputable) {
            var new_progress = parseInt(e.loaded / e.total * 100);

            if (new_progress > progress) {
              progress = new_progress;
              this.loader.setProgress(progress);
              this.trigger('panorama-load-progress', panorama, progress);
            }
          }
        };

        var onerror = function(e) {
          this.container.textContent = 'Cannot load image';
          reject(e);
          throw new PSVError('Cannot load image');
        };

        loader.load(panorama, onload.bind(this), onprogress.bind(this), onerror.bind(this));
      }.bind(this));
    }.bind(this));
  };

  /**
   * @summary Load the six textures of the cube
   * @param {string[]} panorama
   * @returns {Promise.<THREE.Texture[]>}
   * @fires PhotoSphereViewer.panorama-load-progress
   * @throws {PSVError} when the image cannot be loaded
   * @private
   */
  PhotoSphereViewer.prototype._loadCubemapTexture = function(panorama) {
    return new Promise(function(resolve, reject) {
      var loader = new THREE.ImageLoader();
      var progress = [0, 0, 0, 0, 0, 0];
      var loaded = [];
      var done = 0;

      if (this.config.with_credentials) {
        loader.setCrossOrigin('use-credentials');
      }
      else {
        loader.setCrossOrigin('anonymous');
      }

      var onend = function() {
        loaded.forEach(function(img) {
          img.needsUpdate = true;
          img.minFilter = THREE.LinearFilter;
          img.generateMipmaps = false;
        });

        resolve(loaded);
      };

      var onload = function(i, img) {
        done++;
        progress[i] = 100;

        this.loader.setProgress(PSVUtils.sum(progress) / 6);
        this.trigger('panorama-load-progress', panorama[i], progress[i]);

        var ratio = Math.min(img.width, PhotoSphereViewer.SYSTEM.maxTextureWidth / 2) / img.width;

        // resize image
        if (ratio !== 1) {
          var buffer = document.createElement('canvas');
          buffer.width = img.width * ratio;
          buffer.height = img.height * ratio;

          var ctx = buffer.getContext('2d');
          ctx.drawImage(img, 0, 0, buffer.width, buffer.height);

          loaded[i] = new THREE.Texture(buffer);
        }
        else {
          loaded[i] = new THREE.Texture(img);
        }

        if (this.config.cache_texture) {
          this._putPanoramaCache({
            panorama: panorama[i],
            image: loaded[i]
          });
        }

        if (done === 6) {
          onend();
        }
      };

      var onprogress = function(i, e) {
        if (e.lengthComputable) {
          var new_progress = parseInt(e.loaded / e.total * 100);

          if (new_progress > progress[i]) {
            progress[i] = new_progress;
            this.loader.setProgress(PSVUtils.sum(progress) / 6);
            this.trigger('panorama-load-progress', panorama[i], progress[i]);
          }
        }
      };

      var onerror = function(i, e) {
        this.container.textContent = 'Cannot load image';
        reject(e);
        throw new PSVError('Cannot load image ' + i);
      };

      for (var i = 0; i < 6; i++) {
        if (this.config.cache_texture) {
          var cache = this.getPanoramaCache(panorama[i]);

          if (cache) {
            done++;
            progress[i] = 100;
            loaded[i] = cache.image;
            continue;
          }
        }

        loader.load(panorama[i], onload.bind(this, i), onprogress.bind(this, i), onerror.bind(this, i));
      }

      if (done === 6) {
        resolve(loaded);
      }
    }.bind(this));
  };

  /**
   * @summary Applies the texture to the scene, creates the scene if needed
   * @param {THREE.Texture|THREE.Texture[]} texture
   * @fires PhotoSphereViewer.panorama-loaded
   * @private
   */
  PhotoSphereViewer.prototype._setTexture = function(texture) {
    if (!this.scene) {
      this._createScene();
    }

    if (this.prop.isCubemap) {
      for (var i = 0; i < 6; i++) {
        if (this.mesh.material[i].map) {
          this.mesh.material[i].map.dispose();
        }

        this.mesh.material[i].map = texture[i];
      }
    }
    else {
      if (this.mesh.material.map) {
        this.mesh.material.map.dispose();
      }

      this.mesh.material.map = texture;
    }

    /**
     * @event panorama-loaded
     * @memberof PhotoSphereViewer
     * @summary Triggered when a panorama image has been loaded
     */
    this.trigger('panorama-loaded');

    this._render();
  };

  /**
   * @summary Creates the 3D scene and GUI components
   * @private
   */
  PhotoSphereViewer.prototype._createScene = function() {
    this.raycaster = new THREE.Raycaster();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.prop.size.width, this.prop.size.height);
    this.renderer.setPixelRatio(PhotoSphereViewer.SYSTEM.pixelRatio);

    this.camera = new THREE.PerspectiveCamera(this.config.default_fov, this.prop.size.width / this.prop.size.height, 1,  3 * PhotoSphereViewer.SPHERE_RADIUS);
    this.camera.position.set(0, 0, 0);

    this.scene = new THREE.Scene();
    this.scene.add(this.camera);

    if (this.prop.isCubemap) {
      this.mesh = this._createCubemap();
    }
    else {
      this.mesh = this._createSphere();
    }

    this.scene.add(this.mesh);

    // create canvas container
    this.canvas_container = document.createElement('div');
    this.canvas_container.className = 'psv-canvas-container';
    this.renderer.domElement.className = 'psv-canvas';
    this.container.appendChild(this.canvas_container);
    this.canvas_container.appendChild(this.renderer.domElement);
  };

  /**
   * @summary Creates the sphere mesh
   * @param {number} [scale=1]
   * @returns {THREE.Mesh}
   * @private
   */
  PhotoSphereViewer.prototype._createSphere = function(scale) {
    scale = scale || 1;

    // The middle of the panorama is placed at longitude=0
    var geometry = new THREE.SphereGeometry(
      PhotoSphereViewer.SPHERE_RADIUS * scale,
      PhotoSphereViewer.SPHERE_VERTICES,
      PhotoSphereViewer.SPHERE_VERTICES,
      -PSVUtils.HalfPI
    );

    var material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide, // needs to be DoubleSide for CanvasRenderer
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.x = -1;

    return mesh;
  };

  /**
   * @summary Applies a SphereCorrection to a Mesh
   * @param {THREE.Mesh} mesh
   * @param {PhotoSphereViewer.SphereCorrection} sphere_correction
   * @private
   */
  PhotoSphereViewer.prototype._setSphereCorrection = function(mesh, sphere_correction) {
    this.cleanSphereCorrection(sphere_correction);
    mesh.rotation.set(
      sphere_correction.tilt,
      sphere_correction.pan,
      sphere_correction.roll
    );
  };

  /**
   * @summary Creates the cube mesh
   * @param {number} [scale=1]
   * @returns {THREE.Mesh}
   * @private
   */
  PhotoSphereViewer.prototype._createCubemap = function(scale) {
    scale = scale || 1;

    var geometry = new THREE.BoxGeometry(
      PhotoSphereViewer.SPHERE_RADIUS * 2 * scale, PhotoSphereViewer.SPHERE_RADIUS * 2 * scale, PhotoSphereViewer.SPHERE_RADIUS * 2 * scale,
      PhotoSphereViewer.CUBE_VERTICES, PhotoSphereViewer.CUBE_VERTICES, PhotoSphereViewer.CUBE_VERTICES
    );

    var materials = [];
    for (var i = 0; i < 6; i++) {
      materials.push(new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
      }));
    }

    var mesh = new THREE.Mesh(geometry, materials);
    mesh.scale.set(1, 1, -1);

    return mesh;
  };

  /**
   * @summary Performs transition between the current and a new texture
   * @param {THREE.Texture} texture
   * @param {PhotoSphereViewer.PanoramaOptions} options
   * @returns {Promise}
   * @private
   * @throws {PSVError} if the panorama is a cubemap
   */
  PhotoSphereViewer.prototype._transition = function(texture, options) {
    var mesh;

    var positionProvided = this.isExtendedPosition(options);
    var zoomProvided = options.zoom !== undefined;

    if (this.prop.isCubemap) {
      if (positionProvided) {
        console.warn('PhotoSphereViewer: cannot perform cubemap transition to different position.');
        positionProvided = false;
      }

      mesh = this._createCubemap(0.9);

      mesh.material.forEach(function(material, i) {
        material.map = texture[i];
        material.transparent = true;
        material.opacity = 0;
      });
    }
    else {
      mesh = this._createSphere(0.9);

      mesh.material.map = texture;
      mesh.material.transparent = true;
      mesh.material.opacity = 0;

      if (options.sphere_correction) {
        this._setSphereCorrection(mesh, options.sphere_correction);
      }
    }

    // rotate the new sphere to make the target position face the camera
    if (positionProvided) {
      this.cleanPosition(options);

      // Longitude rotation along the vertical axis
      var verticalAxis = new THREE.Vector3(0, 1, 0);
      mesh.rotateOnWorldAxis(verticalAxis, options.longitude - this.prop.position.longitude);

      // Latitude rotation along the camera horizontal axis
      var horizontalAxis = new THREE.Vector3(0, 1, 0).cross(this.camera.getWorldDirection()).normalize();
      mesh.rotateOnWorldAxis(horizontalAxis, options.latitude - this.prop.position.latitude);

      // FIXME: find a better way to handle ranges
      if (this.config.latitude_range || this.config.longitude_range) {
        this.config.longitude_range = this.config.latitude_range = null;
        console.warn('PhotoSphereViewer: trying to perform transition with longitude_range and/or latitude_range, ranges cleared.');
      }
    }

    this.scene.add(mesh);
    this.needsUpdate();

    return new PSVAnimation({
      properties: {
        opacity: { start: 0.0, end: 1.0 },
        zoom: zoomProvided ? { start: this.prop.zoom_lvl, end: options.zoom } : undefined
      },
      duration: this.config.transition.duration,
      easing: 'outCubic',
      onTick: function(properties) {
        if (this.prop.isCubemap) {
          for (var i = 0; i < 6; i++) {
            mesh.material[i].opacity = properties.opacity;
          }
        }
        else {
          mesh.material.opacity = properties.opacity;
        }

        if (zoomProvided) {
          this.zoom(properties.zoom);
        }

        this.needsUpdate();
      }.bind(this)
    })
      .then(function() {
        // remove temp sphere and transfer the texture to the main sphere
        this._setTexture(texture);
        this.scene.remove(mesh);

        mesh.geometry.dispose();
        mesh.geometry = null;

        // actually rotate the camera
        if (positionProvided) {
          this.rotate(options);
        }

        if (options.sphere_correction) {
          this._setSphereCorrection(this.mesh, options.sphere_correction);
        }
        else {
          this._setSphereCorrection(this.mesh, {});
        }
      }.bind(this));
      
  };

  /**
   * @summary Reverses autorotate direction with smooth transition
   * @private
   */
  PhotoSphereViewer.prototype._reverseAutorotate = function() {
    var self = this;
    var newSpeed = -this.config.anim_speed;
    var range = this.config.longitude_range;
    this.config.longitude_range = null;

    new PSVAnimation({
      properties: {
        speed: { start: this.config.anim_speed, end: 0 }
      },
      duration: 300,
      easing: 'inSine',
      onTick: function(properties) {
        self.config.anim_speed = properties.speed;
      }
    })
      .then(function() {
        return new PSVAnimation({
          properties: {
            speed: { start: 0, end: newSpeed }
          },
          duration: 300,
          easing: 'outSine',
          onTick: function(properties) {
            self.config.anim_speed = properties.speed;
          }
        });
      })
      .then(function() {
        self.config.longitude_range = range;
        self.config.anim_speed = newSpeed;
      });
  };

  /**
   * @summary Adds a panorama to the cache
   * @param {PhotoSphereViewer.CacheItem} cache
   * @fires PhotoSphereViewer.panorama-cached
   * @throws {PSVError} when the cache is disabled
   * @private
   */
  PhotoSphereViewer.prototype._putPanoramaCache = function(cache) {
    if (!this.config.cache_texture) {
      throw new PSVError('Cannot add panorama to cache, cache_texture is disabled');
    }

    var existingCache = this.getPanoramaCache(cache.panorama);

    if (existingCache) {
      existingCache.image = cache.image;
      existingCache.pano_data = cache.pano_data;
    }
    else {
      this.prop.cache = this.prop.cache.slice(0, this.config.cache_texture - 1); // remove most ancient elements
      this.prop.cache.unshift(cache);
    }

    /**
     * @event panorama-cached
     * @memberof PhotoSphereViewer
     * @summary Triggered when a panorama is stored in the cache
     * @param {string} panorama
     */
    this.trigger('panorama-cached', cache.panorama);
  };

  /**
   * @summary Stops all current animations
   * @private
   */
  PhotoSphereViewer.prototype._stopAll = function() {
    this.stopAutorotate();
    this.stopAnimation();
    this.stopGyroscopeControl();
    this.stopStereoView();
  };

  return PhotoSphereViewer;
});