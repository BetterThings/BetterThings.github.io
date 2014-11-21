/*******************************************************************************************
 * zoomify
 * Written by Craig Francis
 * Absolutely minimal version of GSIV to work with touch screens and very slow processors.
********************************************************************************************/

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.zoomify");
msos.require("msos.fitimgs");

msos.zoomify.version = new msos.set_version(13, 11, 6);


// Start by loading our pop_ajax.css stylesheet
msos.zoomify.css = new msos.loader();
msos.zoomify.css.load('zoomify_css', msos.resource_url('css', 'zoomify.css'));

msos.zoomify.onkeystroke = {};
msos.zoomify.focused = '';

(function ($) {
    "use strict";

	var temp_mz = 'msos.zoomify';

    $.fn.Zoomify = function () {

		return this.each(function () {

			var $this = $(this);

			// Add 'fitimg' wrapper to each image
			$this.fitImgs();

			var $parent = $this.parent('.fitimg');

			// Add 'zoomify_wrapper' class
			$parent.addClass('zoomify_wrapper');

			//--------------------------------------------------
			// Variables

			var img_ref = $this[0],
				div_ref = $parent[0],

				full_size_width  = img_ref.width,
				full_size_height = img_ref.height,
				img_ratio = full_size_height / full_size_width,

				img_zoom_width = null,
				img_zoom_height = null,
				img_start_left = null,
				img_start_top = null,
				img_current_left = null,
				img_current_top = null,

				div_width  = $parent.width(),
				div_height = parseInt(div_width * img_ratio, 0),
				div_half_width  = Math.round(parseInt(div_width,  10) / 2),
				div_half_height = Math.round(parseInt(div_height, 10) / 2),

				zoom_control_refs = {},
				zoom_level = 0,
				zoom_levels = [],
				zoom_level_count = [],
				click_last = 0,
				origin = null,
				image_onkeyup = null;


			function image_move_update() {

				if (msos.config.verbose) {
					msos.console.debug(temp_mz + ' - image_move_update -> start, in left: ' + img_current_left + ', top: ' + img_current_top);
				}

				//--------------------------------------------------
				// Boundary check

				var max_left = (div_width  - img_zoom_width ),
					max_top  = (div_height - img_zoom_height);

				if (img_current_left > 0)			{ img_current_left = 0; }
				if (img_current_left < max_left)	{ img_current_left = max_left;  }
				if (img_current_top  > 0)			{ img_current_top  = 0; }
				if (img_current_top  < max_top)		{ img_current_top  = max_top; }

				//--------------------------------------------------
				// Move

				img_ref.style.left = img_current_left + 'px';
				img_ref.style.top  = img_current_top  + 'px';

				if (msos.config.verbose) {
					msos.console.debug(temp_mz + ' - image_move_update -> done, out left: ' + img_current_left + ', top: ' + img_current_top);
				}
			}

			//--------------------------------------------------
			// Zooming

			function image_zoom(change) {

				//--------------------------------------------------
				// Variables

				var new_zoom,
					new_zoom_width,
					new_zoom_height,
					ratio;

				//--------------------------------------------------
				// Zoom level

				msos.console.debug(temp_mz + ' - image_zoom -> start, zoom level: ' + zoom_level + ', delta: ' + change);

				// Set current image focus
				msos.zoomify.focused = img_ref.id;

				new_zoom = (zoom_level + change);

				if (new_zoom >= zoom_level_count) {
					if (new_zoom > zoom_level_count) {
						div_ref.style.opacity = 0.5;
						setTimeout(function() { div_ref.style.opacity = 1; }, 150);
						return;
					}
					zoom_control_refs['in-on'].style.display = 'none';
					zoom_control_refs['in-off'].style.display = 'block';
				} else {
					zoom_control_refs['in-on'].style.display = 'block';
					zoom_control_refs['in-off'].style.display = 'none';
				}

				if (new_zoom <= 0) {
					if (new_zoom < 0) {
						div_ref.style.opacity = 0.5;
						setTimeout(function() { div_ref.style.opacity = 1; }, 150);
						return;
					}
					zoom_control_refs['out-on'].style.display = 'none';
					zoom_control_refs['out-off'].style.display = 'block';
				} else {
					zoom_control_refs['out-on'].style.display = 'block';
					zoom_control_refs['out-off'].style.display = 'none';
				}

				if (new_zoom === 0) {
					img_ref.style.cursor = 'default';
				} else {
					img_ref.style.cursor = 'move';
				}

				zoom_level = new_zoom;

				//--------------------------------------------------
				// New width

				new_zoom_width	= zoom_levels[new_zoom];
				new_zoom_height = parseInt(zoom_levels[new_zoom] * img_ratio, 10);

				img_ref.width  = new_zoom_width;
				img_ref.height = new_zoom_height;

				msos.console.debug(temp_mz + ' - image_zoom -> new zoom , w: ' + new_zoom_width + ', h: ' + new_zoom_height + ', current left: ' + img_current_left + ', top: ' + img_current_top);

				//--------------------------------------------------
				// Update position

				if (img_current_left === null) { // Initial position on page load

					img_current_left = 0;
					img_current_top  = 0;

				} else {

					ratio = (new_zoom_width / img_zoom_width);

					img_current_left = parseInt((div_half_width  - ((div_half_width  - img_current_left) * ratio)), 10);
					img_current_top  = parseInt((div_half_height - ((div_half_height - img_current_top ) * ratio)), 10);

				}

				img_zoom_width  = new_zoom_width;
				img_zoom_height = new_zoom_height;

				// Check the boundries (zooming out)
				image_move_update();

				img_ref.style.left = img_current_left + 'px';
				img_ref.style.top  = img_current_top  + 'px';

				msos.console.debug(temp_mz + ' - image_zoom -> done, new left: ' + img_current_left + ', top: ' + img_current_top);
			}

			function scroll_event(e) {

				//--------------------------------------------------
				// Event

				e = e || window.event;

				var wheelData = (e.detail ? e.detail * -1 : e.wheelDelta / 40);

				image_zoom(wheelData > 0 ? 1 : -1);

				msos.do_nothing(e);
			}

			//--------------------------------------------------
			// Movement

			function event_coords(e) {
				var coords = [];
				if (e.touches && e.touches.length) {
					coords[0] = e.touches[0].clientX;
					coords[1] = e.touches[0].clientY;
				} else {
					coords[0] = e.clientX;
					coords[1] = e.clientY;
				}
				return coords;
			}

			function image_move_event(e) {

				//--------------------------------------------------
				// Calculations

				e = e || window.event;

				var currentPos = event_coords(e);

				img_current_left = (img_start_left + (currentPos[0] - origin[0]));
				img_current_top  = (img_start_top  + (currentPos[1] - origin[1]));

				image_move_update();

				msos.do_nothing(e);
			}

			function image_move_start(e) {

				//--------------------------------------------------
				// Event

				e = e || window.event;

				// Set current image focus
				msos.zoomify.focused = img_ref.id;

				//--------------------------------------------------
				// Double tap/click event

				var now = new Date().getTime();

				if (click_last > (now - 200)) {
					image_zoom(1);
				} else {
					click_last = now;
				}

				//--------------------------------------------------
				// Add events

						// http://www.quirksmode.org/blog/archives/2010/02/the_touch_actio.html
						// http://www.quirksmode.org/m/tests/drag.html

				if (e.type === 'touchstart') {

					img_ref.onmousedown = null;
					img_ref.ontouchmove = image_move_event;
					img_ref.ontouchend = function () {
						img_ref.ontouchmove = null;
						img_ref.ontouchend = null;
					};

				} else {

					document.onmousemove = image_move_event;
					document.onmouseup = function () {
						document.onmousemove = null;
						document.onmouseup = null;
					};

				}

				//--------------------------------------------------
				// Record starting position

				img_start_left = img_current_left;
				img_start_top  = img_current_top;

				origin = event_coords(e);

				msos.do_nothing(e);
			}

			function init() {

				//--------------------------------------------------
				// Variables

				var width,
					height,
					button,
					buttons,
					name,
					len,
					k;

				msos.console.debug(
					temp_mz + ' - init -> start, fullsize w: '
							+ full_size_width	+ ', h: '
							+ full_size_height	+ ', ratio: '
							+ img_ratio			+ ', wrapper w: '
							+ div_width			+ ', h: '
							+ div_height		+ ', half w: '
							+ div_half_width	+ ', h: '
							+ div_half_height
				);

				//--------------------------------------------------
				// Add zoom controls

				buttons = [
					{ 't' : 'in',  's' : 'on'  },
					{ 't' : 'in',  's' : 'off' },
					{ 't' : 'out', 's' : 'on'  },
					{ 't' : 'out', 's' : 'off' }
				];

				for (k = 0, len = buttons.length; k < len; k = k + 1) {

					button = buttons[k];
					name = button.t + '-' + button.s;

					zoom_control_refs[name] = document.createElement('div');
					zoom_control_refs[name].className = 'zoom-control zoom-' + button.t + ' zoom-' + button.s;

					if (button.t === 'in') {
						zoom_control_refs[name].innerHTML = '<i class="fa fa-plus-circle fa-lg"></i>';
						if (button.s === 'on') {
							zoom_control_refs[name].onmousedown = function () { image_zoom(1); }; // onclick on iPhone seems to have a more pronounced delay
						}
					} else {
						zoom_control_refs[name].innerHTML = '<i class="fa fa-minus-circle fa-lg"></i>';
						if (button.s === 'on') {
							zoom_control_refs[name].onmousedown = function () { image_zoom(-1); };
						}
					}

					if (button.s === 'on') {
						zoom_control_refs[name].style.cursor = 'pointer';
					}

					div_ref.appendChild(zoom_control_refs[name]);

				}

				msos.console.debug(temp_mz + ' - init -> buttons created!');

				//--------------------------------------------------
				// Zoom levels

				width  = full_size_width;
				height = full_size_height;

				zoom_levels[zoom_levels.length] = width;

				if (width <= div_width) {
					msos.console.error(temp_mz + ' - init -> error, the image is too small too zoom!');
					return;
				}

				while (width > div_width) {
					width =  (width  * 0.75);
					height = (height * 0.75);
					if (width < div_width) { width = div_width; }
					zoom_levels[zoom_levels.length] = Math.round(width);
				}

				zoom_levels.reverse();

				//--------------------------------------------------
				// Set default

				zoom_level_count = (zoom_levels.length - 1);

				// Now, set zoom to base view
				image_zoom(0);

				if (msos.config.verbose) {
					msos.console.debug(temp_mz + ' - init -> zoom set, levels: ', zoom_levels);
				} else {
					msos.console.debug(temp_mz + ' - init -> zoom set, total levels: ' + zoom_level_count);
				}

				//--------------------------------------------------
				// Make visible

				div_ref.style.overflow = 'hidden';
				img_ref.style.visibility = 'visible';

				//--------------------------------------------------
				// Add events

				img_ref.onmousedown  = image_move_start;
				img_ref.ontouchstart = image_move_start;

				if (div_ref.addEventListener) {

					div_ref.addEventListener('DOMMouseScroll',	scroll_event, false);
					div_ref.addEventListener('mousewheel',		scroll_event, false);

				} else if (div_ref.attachEvent) {

					div_ref.attachEvent('onmousewheel', scroll_event);

				}

				image_onkeyup = function (code) {

					msos.console.debug(temp_mz + ' - image_onkeyup -> called, keycode: ' + code + ', for id: ' + msos.zoomify.focused);

					if (code === 37 || code === 39) {							// left or right
						img_current_left = (img_current_left + (code === 39 ? 50 : -50));
						image_move_update();
					} else if (code === 38 || code === 40) {					// up or down
						img_current_top = (img_current_top + (code === 40 ? 50 : -50));
						image_move_update();
					} else if (code === 107 || code === 187 || code === 61) {	// + or =
						image_zoom(1);
					} else if (code === 109 || code === 189) {					// - or _
						image_zoom(-1);
					}
				};

				// Store onkeyup function
				msos.zoomify.onkeystroke[img_ref.id] = image_onkeyup;

				document.onkeyup = function (e) {
					var keyCode = (e ? e.which : window.event.keyCode);

					if (!msos.var_is_empty(msos.zoomify.focused)) {
						msos.zoomify.onkeystroke[msos.zoomify.focused](keyCode);
					}
				};

				msos.console.debug(temp_mz + ' - init -> done!');
			}

			// Engage!
			init();
		});
    };

}(jQuery));

