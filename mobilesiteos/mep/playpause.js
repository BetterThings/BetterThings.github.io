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

msos.provide("mep.playpause");

mep.playpause.version = new msos.set_version(14, 6, 14);


mep.playpause.start = function () {
	"use strict";

	// PLAY/pause BUTTON
	jQuery.extend(
		mep.player.controls,
		{
			buildplaypause: function (ply_obj) {

				var cfg = ply_obj.options,
					play =
					jQuery('<div class="mejs-button mejs-play" >' +
						'<button type="button" aria-controls="' + ply_obj.id + '" title="' + cfg.i18n.playpause_text + '"><i class="fa fa-play"></i><i class="fa fa-pause"></i></button>' +
					'</div>')
					.appendTo(ply_obj.controls)
					.click(
						function (e) {
							msos.do_nothing(e);

							msos.console.debug('mep.playpause.start - buildplaypause - click -> play/pause fired.');
							if (ply_obj.media.paused)	{ ply_obj.media.play();  }
							else						{ ply_obj.media.pause(); }

							return false;
						}
					);

				ply_obj.media.addEventListener(
					'play',
					function () { play.removeClass('mejs-play').addClass('mejs-pause'); },
					false
				);
				ply_obj.media.addEventListener(
					'playing',
					function () { play.removeClass('mejs-play').addClass('mejs-pause'); },
					false
				);
				ply_obj.media.addEventListener(
					'pause',
					function () { play.removeClass('mejs-pause').addClass('mejs-play'); },
					false
				);
				ply_obj.media.addEventListener(
					'paused',
					function () { play.removeClass('mejs-pause').addClass('mejs-play'); },
					false
				);
			}
		}
	);
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.playpause.start);