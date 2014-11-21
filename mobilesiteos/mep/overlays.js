/*!
* MediaElement.js
* HTML5 <video> and <audio> shim and player
* http://mediaelementjs.com/
*
* Copyright 2010-2012, John Dyer (http://j.hn)
* Dual licensed under the MIT or GPL Version 2 licenses.
*
*/

/*global
    msos: false,
    jQuery: false
*/

msos.provide("mep.overlays");

mep.overlays.version = new msos.set_version(14, 6, 14);


mep.overlays.start = function () {
	"use strict";

	// Add Poster for video
	jQuery.extend(
		mep.player.controls,
		{
			buildoverlays: function (ply_obj) {

				var ovl_load,
					loading,
					ovl_error,
					error_ol,
					ovl_butt,
					button,
					loading_posn,
					button_posn;

				ovl_load = jQuery('<div class="mejs-overlay">');
				loading  = jQuery('<div class="mejs-overlay-loading"><i class="fa fa-spinner fa-spin fa-2x loading"></i></div>');

				ovl_load
					.append(loading)
					.appendTo(ply_obj.layers);

				loading_posn = {
					of: ovl_load,
					my: 'center',
					at: 'center'
				};

				// Position loading indicator using jquery.ui.position object
				loading.position(loading_posn);

				ovl_error = jQuery('<div class="mejs-overlay">');
				error_ol  =	jQuery('<div class="mejs-overlay-error">');

				ovl_error
					.append(error_ol)	// add error overlay
					.hide()				// start out hidden
					.appendTo(ply_obj.layers);

				ovl_butt = jQuery('<div class="mejs-overlay">');
				button   = jQuery('<div class="mejs-overlay-button"><i class="fa fa-chevron-circle-right fa-2x"></i></div>');

				ovl_butt
					.append(button)
					.appendTo(ply_obj.layers)
					.click(
						function (e) {
							msos.do_nothing(e);
							if (ply_obj.media.paused) {
								ply_obj.media.play();
							} else {
								ply_obj.media.pause();
							}
						}
					);

				button_posn = {
					of: ovl_butt,
					my: 'center',
					at: 'center'
				};

				// Position play button using jquery.ui.position object
				button.position(button_posn);

				// show/hide big play button
				ply_obj.media.addEventListener(
					'play',
					function () {
						ovl_butt.hide();
						ovl_load.fadeOut('slow');
						if (ply_obj.buffer) { ply_obj.buffer.fadeOut('slow'); }
						ovl_error.hide();
					},
					false
				);

				ply_obj.media.addEventListener(
					'playing',
					function () {
						ovl_butt.hide();
						//ovl_load.hide();
						if (ply_obj.buffer) { ply_obj.buffer.fadeOut('slow'); }
						ovl_error.hide();
					},
					false
				);

				ply_obj.media.addEventListener(
					'seeking',
					function () {
						ovl_load.show();
						if (ply_obj.buffer) { ply_obj.buffer.show(); }
					},
					false
				);

				ply_obj.media.addEventListener(
					'seeked',
					function () {
						ovl_load.fadeOut('slow');
						if (ply_obj.buffer) { ply_obj.buffer.fadeOut('slow'); }
					},
					false
				);

				ply_obj.media.addEventListener(
					'pause',
					function () {
						ovl_butt.show();
					},
					false
				);

				ply_obj.media.addEventListener(
					'waiting',
					function () {
						ovl_load.show();
						if (ply_obj.buffer) { ply_obj.buffer.show(); }
					},
					false
				);

				// show/hide loading			
				ply_obj.media.addEventListener(
					'loadeddata',
					function () {
						ovl_load.show();
						if (ply_obj.buffer) { ply_obj.buffer.show(); }
					},
					false
				);

				ply_obj.media.addEventListener(
					'canplay',
					function () {
						ovl_load.fadeOut('slow');
						if (ply_obj.buffer) { ply_obj.buffer.fadeOut('slow'); }
					},
					false
				);

				// error handling
				ply_obj.media.addEventListener(
					'error',
					function () {
						ovl_load.fadeOut('slow');
						if (ply_obj.buffer) { ply_obj.buffer.fadeOut('slow'); }
						ovl_error.show();
						error_ol.html("Error loading this resource");
					},
					false
				);

				// Make available everywhere
				ply_obj.overlay = ovl_load;
				ply_obj.loading = loading;
				ply_obj.error = ovl_error;
				ply_obj.error_ol = error_ol;
				ply_obj.ovl_butt = ovl_butt;

				// But loading indicator starts out hidden
				ovl_load.hide();
			}
		}
	);
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.overlays.start);