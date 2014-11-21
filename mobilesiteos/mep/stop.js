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

msos.provide("mep.stop");

mep.stop.version = new msos.set_version(14, 6, 15);


mep.stop.start = function () {
	"use strict";

	// STOP BUTTON
	jQuery.extend(
		mep.player.controls,
		{
			buildstop: function (ply_obj) {

				var stop =
						jQuery('<div class="mejs-button mejs-stop-button mejs-stop">' +
							'<button type="button" aria-controls="' + ply_obj.id + '" title="' + ply_obj.options.i18n.stop_text + '"><i class="fa fa-stop"></i></button>' +
						'</div>');

				stop
					.appendTo(ply_obj.controls)
					.click(
						function (e) {
							msos.console.debug('mep.stop.start -> stop fired.');

							msos.do_nothing(e);

							if (!ply_obj.media.paused) {
								ply_obj.media.pause();
							}

							// Streaming doesn't have a duration
							if (!isNaN(ply_obj.media.duration) && ply_obj.media.currentTime > 0) {
								ply_obj.media.setCurrentTime(0);
								ply_obj.current.width('0px');
								ply_obj.handle.css('left', '0px');
								ply_obj.tfltcur.html(mep.player.utils.secondsToTimeCode(0));
								ply_obj.currenttime.html(mep.player.utils.secondsToTimeCode(0));
								if (ply_obj.poster) { ply_obj.poster.show(); }
							}
						}
					);

				ply_obj.stop = stop;
			}
		}
	);
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.stop.start);