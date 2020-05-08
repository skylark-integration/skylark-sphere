define([
  "./ctoc"
],function(PhotoSphereViewer){
  "use strict";
  /**
   * @summary Number of pixels bellow which a mouse move will be considered as a click
   * @type {int}
   * @readonly
   * @private
   */
  PhotoSphereViewer.MOVE_THRESHOLD = 4;

  /**
   * @summary Angle in radians bellow which two angles are considered identical
   * @type {float}
   * @readonly
   * @private
   */
  PhotoSphereViewer.ANGLE_THRESHOLD = 0.003;

  /**
   * @summary Delay in milliseconds between two clicks to consider a double click
   * @type {int}
   * @readonly
   * @private
   */
  PhotoSphereViewer.DBLCLICK_DELAY = 300;

  /**
   * @summary Time size of the mouse position history used to compute inertia
   * @type {int}
   * @readonly
   * @private
   */
  PhotoSphereViewer.INERTIA_WINDOW = 300;

  /**
   * @summary Radius of the THREE.SphereGeometry
   * Half-length of the THREE.BoxGeometry
   * @type {int}
   * @readonly
   * @private
   */
  PhotoSphereViewer.SPHERE_RADIUS = 100;

  /**
   * @summary Number of vertice of the THREE.SphereGeometry
   * @type {int}
   * @readonly
   * @private
   */
  PhotoSphereViewer.SPHERE_VERTICES = 64;

  /**
   * @summary Number of vertices of each side of the THREE.BoxGeometry
   * @type {int}
   * @readonly
   * @private
   */
  PhotoSphereViewer.CUBE_VERTICES = 8;

  /**
   * @summary Order of cube textures for arrays
   * @type {int[]}
   * @readonly
   * @private
   */
  PhotoSphereViewer.CUBE_MAP = [0, 2, 4, 5, 3, 1];

  /**
   * @summary Order of cube textures for maps
   * @type {string[]}
   * @readonly
   * @private
   */
  PhotoSphereViewer.CUBE_HASHMAP = ['left', 'right', 'top', 'bottom', 'back', 'front'];

  /**
   * @summary System properties
   * @type {Object}
   * @readonly
   * @private
   */
  PhotoSphereViewer.SYSTEM = {
    loaded: false,
    pixelRatio: 1,
    isWebGLSupported: false,
    isCanvasSupported: false,
    deviceOrientationSupported: null,
    maxTextureWidth: 0,
    mouseWheelEvent: null,
    fullscreenEvent: null
  };

  /**
   * @summary SVG icons sources
   * @type {Object.<string, string>}
   * @readonly
   */
  PhotoSphereViewer.ICONS = {};

  /**
   * @summary Default options, see {@link http://photo-sphere-viewer.js.org/#options}
   * @type {Object}
   * @readonly
   */
  PhotoSphereViewer.DEFAULTS = {
    panorama: null,
    container: null,
    caption: null,
    usexmpdata: true,
    pano_data: null,
    min_fov: 30,
    max_fov: 90,
    default_fov: null,
    default_long: 0,
    default_lat: 0,
    sphere_correction: {
      pan: 0,
      tilt: 0,
      roll: 0
    },
    longitude_range: null,
    latitude_range: null,
    move_speed: 1,
    zoom_speed: 2,
    time_anim: 2000,
    anim_speed: '2rpm',
    anim_lat: null,
    fisheye: false,
    navbar: [
      'autorotate',
      'zoom',
      'download',
      'markers',
      'caption',
      'gyroscope',
      'stereo',
      'fullscreen'
    ],
    tooltip: {
      offset: 5,
      arrow_size: 7,
      delay: 100
    },
    lang: {
      autorotate: 'Automatic rotation',
      zoom: 'Zoom',
      zoomOut: 'Zoom out',
      zoomIn: 'Zoom in',
      download: 'Download',
      fullscreen: 'Fullscreen',
      markers: 'Markers',
      gyroscope: 'Gyroscope',
      stereo: 'Stereo view',
      stereo_notification: 'Click anywhere to exit stereo view.',
      please_rotate: ['Please rotate your device', '(or tap to continue)'],
      two_fingers: ['Use two fingers to navigate']
    },
    mousewheel: true,
    mousewheel_factor: 1,
    mousemove: true,
    mousemove_hover: false,
    touchmove_two_fingers: false,
    keyboard: {
      'ArrowUp': 'rotateLatitudeUp',
      'ArrowDown': 'rotateLatitudeDown',
      'ArrowRight': 'rotateLongitudeRight',
      'ArrowLeft': 'rotateLongitudeLeft',
      'PageUp': 'zoomIn',
      'PageDown': 'zoomOut',
      '+': 'zoomIn',
      '-': 'zoomOut',
      ' ': 'toggleAutorotate'
    },
    move_inertia: true,
    click_event_on_marker: false,
    transition: {
      duration: 1500,
      loader: true
    },
    loading_img: null,
    loading_txt: 'Loading...',
    size: null,
    cache_texture: 0,
    templates: {},
    markers: [],
    with_credentials: false
  };

  /**
   * @summary doT.js templates
   * @type {Object.<string, string>}
   * @readonly
   */
  PhotoSphereViewer.TEMPLATES = {
    markersList: '\
  <div class="psv-markers-list-container"> \
    <h1 class="psv-markers-list-title">{{= it.config.lang.markers }}</h1> \
    <ul class="psv-markers-list"> \
    {{~ it.markers: marker }} \
      <li data-psv-marker="{{= marker.id }}" class="psv-markers-list-item {{? marker.className }}{{= marker.className }}{{?}}"> \
        {{? marker.image }}<img class="psv-markers-list-image" src="{{= marker.image }}"/>{{?}} \
        <p class="psv-markers-list-name">{{? marker.tooltip }}{{= marker.tooltip.content }}{{?? marker.html }}{{= marker.html }}{{??}}{{= marker.id }}{{?}}</p> \
      </li> \
    {{~}} \
    </ul> \
  </div>'
  };

PhotoSphereViewer.ICONS['compass.svg'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 0a50 50 0 1 0 0 100A50 50 0 0 0 50 0zm0 88.81a38.86 38.86 0 0 1-38.81-38.8 38.86 38.86 0 0 1 38.8-38.82A38.86 38.86 0 0 1 88.82 50 38.87 38.87 0 0 1 50 88.81z"/><path d="M72.07 25.9L40.25 41.06 27.92 74.12l31.82-15.18v-.01l12.32-33.03zM57.84 54.4L44.9 42.58l21.1-10.06-8.17 21.9z"/><!--Created by iconoci from the Noun Project--></svg>';

PhotoSphereViewer.ICONS['download.svg'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M83.3 35.6h-17V3H32.2v32.6H16.6l33.6 32.7 33-32.7z"/><path d="M83.3 64.2v16.3H16.6V64.2H-.1v32.6H100V64.2H83.3z"/><!--Created by Michael Zenaty from the Noun Project--></svg>';

PhotoSphereViewer.ICONS['fullscreen-in.svg'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M100 40H87.1V18.8h-21V6H100zM100 93.2H66V80.3h21.1v-21H100zM34 93.2H0v-34h12.9v21.1h21zM12.9 40H0V6h34v12.9H12.8z"/><!--Created by Garrett Knoll from the Noun Project--></svg>';

PhotoSphereViewer.ICONS['fullscreen-out.svg'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M66 7h13v21h21v13H66zM66 60.3h34v12.9H79v21H66zM0 60.3h34v34H21V73.1H0zM21 7h13v34H0V28h21z"/><!--Created by Garrett Knoll from the Noun Project--></svg>';

PhotoSphereViewer.ICONS['gesture.svg'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M33.38 33.2a1.96 1.96 0 0 0 1.5-3.23 10.61 10.61 0 0 1 7.18-17.51c.7-.06 1.31-.49 1.61-1.12a13.02 13.02 0 0 1 11.74-7.43c7.14 0 12.96 5.8 12.96 12.9 0 3.07-1.1 6.05-3.1 8.38-.7.82-.61 2.05.21 2.76.83.7 2.07.6 2.78-.22a16.77 16.77 0 0 0 4.04-10.91C72.3 7.54 64.72 0 55.4 0a16.98 16.98 0 0 0-14.79 8.7 14.6 14.6 0 0 0-12.23 14.36c0 3.46 1.25 6.82 3.5 9.45.4.45.94.69 1.5.69m45.74 43.55a22.13 22.13 0 0 1-5.23 12.4c-4 4.55-9.53 6.86-16.42 6.86-12.6 0-20.1-10.8-20.17-10.91a1.82 1.82 0 0 0-.08-.1c-5.3-6.83-14.55-23.82-17.27-28.87-.05-.1 0-.21.02-.23a6.3 6.3 0 0 1 8.24 1.85l9.38 12.59a1.97 1.97 0 0 0 3.54-1.17V25.34a4 4 0 0 1 1.19-2.87 3.32 3.32 0 0 1 2.4-.95c1.88.05 3.4 1.82 3.4 3.94v24.32a1.96 1.96 0 0 0 3.93 0v-33.1a3.5 3.5 0 0 1 7 0v35.39a1.96 1.96 0 0 0 3.93 0v-.44c.05-2.05 1.6-3.7 3.49-3.7 1.93 0 3.5 1.7 3.5 3.82v5.63c0 .24.04.48.13.71l.1.26a1.97 1.97 0 0 0 3.76-.37c.33-1.78 1.77-3.07 3.43-3.07 1.9 0 3.45 1.67 3.5 3.74l-1.77 18.1zM77.39 51c-1.25 0-2.45.32-3.5.9v-.15c0-4.27-3.33-7.74-7.42-7.74-1.26 0-2.45.33-3.5.9V16.69a7.42 7.42 0 0 0-14.85 0v1.86a7 7 0 0 0-3.28-.94 7.21 7.21 0 0 0-5.26 2.07 7.92 7.92 0 0 0-2.38 5.67v37.9l-5.83-7.82a10.2 10.2 0 0 0-13.35-2.92 4.1 4.1 0 0 0-1.53 5.48C20 64.52 28.74 80.45 34.07 87.34c.72 1.04 9.02 12.59 23.4 12.59 7.96 0 14.66-2.84 19.38-8.2a26.06 26.06 0 0 0 6.18-14.6l1.78-18.2v-.2c0-4.26-3.32-7.73-7.42-7.73z" fill="#000" fill-rule="evenodd"/><!--Created by AomAm from the Noun Project--></svg>';

PhotoSphereViewer.ICONS['info.svg'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M28.3 26.1c-1 2.6-1.9 4.8-2.6 7-2.5 7.4-5 14.7-7.2 22-1.3 4.4.5 7.2 4.3 7.8 1.3.2 2.8.2 4.2-.1 8.2-2 11.9-8.6 15.7-15.2l-2.2 2a18.8 18.8 0 0 1-7.4 5.2 2 2 0 0 1-1.6-.2c-.2-.1 0-1 0-1.4l.8-1.8L41.9 28c.5-1.4.9-3 .7-4.4-.2-2.6-3-4.4-6.3-4.4-8.8.2-15 4.5-19.5 11.8-.2.3-.2.6-.3 1.3 3.7-2.8 6.8-6.1 11.8-6.2z"/><circle cx="39.3" cy="9.2" r="8.2"/><!--Created by Arafat Uddin from the Noun Project--></svg>';

PhotoSphereViewer.ICONS['mobile-rotate.svg'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M66.7 19a14 14 0 0 1 13.8 12.1l-3.9-2.7c-.5-.3-1.1-.2-1.4.3-.3.5-.2 1.1.3 1.4l5.7 3.9.6.2c.3 0 .6-.2.8-.4l3.9-5.7c.3-.5.2-1.1-.3-1.4-.5-.3-1.1-.2-1.4.3l-2.4 3.5A16 16 0 0 0 66.7 17c-.6 0-1 .4-1 1s.4 1 1 1zM25 15h10c.6 0 1-.4 1-1s-.4-1-1-1H25c-.6 0-1 .4-1 1s.4 1 1 1zm-6.9 30H16l-2 .2a1 1 0 0 0-.8 1.2c.1.5.5.8 1 .8h.2l1.7-.2h2.1c.6 0 1-.4 1-1s-.5-1-1.1-1zm10 0h-4c-.6 0-1 .4-1 1s.4 1 1 1h4c.6 0 1-.4 1-1s-.4-1-1-1zM84 45H55V16A11 11 0 0 0 44 5H16A11 11 0 0 0 5 16v68a11 11 0 0 0 11 11h68a11 11 0 0 0 11-11V56a11 11 0 0 0-11-11zM16 93c-5 0-9-4-9-9V53.2c.3-.1.6-.3.7-.6a9.8 9.8 0 0 1 2-3c.4-.4.4-1 0-1.4a1 1 0 0 0-1.4 0l-1.2 1.5V16c0-5 4-9 9-9h28c5 0 9 4 9 9v68c0 5-4 9-9 9H16zm77-9c0 5-4 9-9 9H50.3c2.8-2 4.7-5.3 4.7-9V47h29c5 0 9 4 9 9v28zM38.1 45h-4c-.6 0-1 .4-1 1s.4 1 1 1h4c.6 0 1-.4 1-1s-.5-1-1-1zm9.9 0h-4c-.6 0-1 .4-1 1s.4 1 1 1h4c.6 0 1-.4 1-1s-.4-1-1-1zm38 19c-.6 0-1 .4-1 1v10c0 .6.4 1 1 1s1-.4 1-1V65c0-.6-.4-1-1-1z"/><!--Created by Anthony Bresset from the Noun Project--></svg>';

PhotoSphereViewer.ICONS['pin.svg'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M24 0C13.8 0 5.5 8.3 5.5 18.5c0 10.07 17.57 28.64 18.32 29.42a.25.25 0 0 0 .36 0c.75-.78 18.32-19.35 18.32-29.42C42.5 8.3 34.2 0 24 0zm0 7.14a10.35 10.35 0 0 1 0 20.68 10.35 10.35 0 0 1 0-20.68z"/><!--Created by Daniele Marucci from the Noun Project--></svg>';

PhotoSphereViewer.ICONS['play-active.svg'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 41"><path d="M40.5 14.1c-.1-.1-1.2-.5-2.898-1-.102 0-.202-.1-.202-.2C34.5 6.5 28 2 20.5 2S6.6 6.5 3.7 12.9c0 .1-.1.1-.2.2-1.7.6-2.8 1-2.9 1l-.6.3v12.1l.6.2c.1 0 1.1.399 2.7.899.1 0 .2.101.2.199C6.3 34.4 12.9 39 20.5 39c7.602 0 14.102-4.6 16.9-11.1 0-.102.1-.102.199-.2 1.699-.601 2.699-1 2.801-1l.6-.3V14.3l-.5-.2zM6.701 11.5C9.7 7 14.8 4 20.5 4c5.8 0 10.9 3 13.8 7.5.2.3-.1.6-.399.5-3.799-1-8.799-2-13.6-2-4.7 0-9.5 1-13.2 2-.3.1-.5-.2-.4-.5zM25.1 20.3L18.7 24c-.3.2-.7 0-.7-.5v-7.4c0-.4.4-.6.7-.4l6.399 3.8c.301.1.301.6.001.8zm9.4 8.901A16.421 16.421 0 0 1 20.5 37c-5.9 0-11.1-3.1-14-7.898-.2-.302.1-.602.4-.5 3.9 1 8.9 2.1 13.6 2.1 5 0 9.9-1 13.602-2 .298-.1.5.198.398.499z"/><!--Created by Nick Bluth from the Noun Project--></svg>';

PhotoSphereViewer.ICONS['play.svg'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 41"><path d="M40.5 14.1c-.1-.1-1.2-.5-2.899-1-.101 0-.2-.1-.2-.2C34.5 6.5 28 2 20.5 2S6.6 6.5 3.7 12.9c0 .1-.1.1-.2.2-1.7.6-2.8 1-2.9 1l-.6.3v12.1l.6.2c.1 0 1.1.4 2.7.9.1 0 .2.1.2.199C6.3 34.4 12.9 39 20.5 39c7.601 0 14.101-4.6 16.9-11.1 0-.101.1-.101.2-.2 1.699-.6 2.699-1 2.8-1l.6-.3V14.3l-.5-.2zM20.5 4c5.8 0 10.9 3 13.8 7.5.2.3-.1.6-.399.5-3.8-1-8.8-2-13.6-2-4.7 0-9.5 1-13.2 2-.3.1-.5-.2-.4-.5C9.7 7 14.8 4 20.5 4zm0 33c-5.9 0-11.1-3.1-14-7.899-.2-.301.1-.601.4-.5 3.9 1 8.9 2.1 13.6 2.1 5 0 9.9-1 13.601-2 .3-.1.5.2.399.5A16.422 16.422 0 0 1 20.5 37zm18.601-12.1c0 .1-.101.3-.2.3-2.5.9-10.4 3.6-18.4 3.6-7.1 0-15.6-2.699-18.3-3.6C2.1 25.2 2 25 2 24.9V16c0-.1.1-.3.2-.3 2.6-.9 10.6-3.6 18.2-3.6 7.5 0 15.899 2.7 18.5 3.6.1 0 .2.2.2.3v8.9z"/><path d="M18.7 24l6.4-3.7c.3-.2.3-.7 0-.8l-6.4-3.8c-.3-.2-.7 0-.7.4v7.4c0 .5.4.7.7.5z"/><!--Created by Nick Bluth from the Noun Project--></svg>';

PhotoSphereViewer.ICONS['stereo.svg'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -2 16 16"><path d="M13.104 0H2.896C2.332 0 1 .392 1 .875h14C15 .392 13.668 0 13.104 0zM15 1H1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3.534a2 2 0 0 0 1.821-1.172l1.19-2.618a.5.5 0 0 1 .91 0l1.19 2.618A2 2 0 0 0 11.466 11H15a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM4 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/><!--Created by Idevã Batista from the Noun Project--></svg>';

PhotoSphereViewer.ICONS['zoom-in.svg'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M14.043 12.22a7.738 7.738 0 1 0-1.823 1.822l4.985 4.985c.503.504 1.32.504 1.822 0a1.285 1.285 0 0 0 0-1.822l-4.984-4.985zm-6.305 1.043a5.527 5.527 0 1 1 0-11.053 5.527 5.527 0 0 1 0 11.053z"/><path d="M8.728 4.009H6.744v2.737H4.006V8.73h2.738v2.736h1.984V8.73h2.737V6.746H8.728z"/><!--Created by Ryan Canning from the Noun Project--></svg>';

PhotoSphereViewer.ICONS['zoom-out.svg'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M14.043 12.22a7.738 7.738 0 1 0-1.823 1.822l4.985 4.985c.503.504 1.32.504 1.822 0a1.285 1.285 0 0 0 0-1.822l-4.984-4.985zm-6.305 1.043a5.527 5.527 0 1 1 0-11.053 5.527 5.527 0 0 1 0 11.053z"/><path d="M4.006 6.746h7.459V8.73H4.006z"/><!--Created by Ryan Canning from the Noun Project--></svg>';
  

  return PhotoSphereViewer;
});