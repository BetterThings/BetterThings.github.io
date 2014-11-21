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

msos.provide("mep.loop");

mep.loop.version = new msos.set_version(14, 6, 15);

mep.loop.start = function () {
	"use strict";

    jQuery.extend(

    mep.player.controls, {

		buildloop: function (ply_obj) {
			ply_obj.loop = 
					jQuery('<div class="mejs-button mejs-loop-button ' + ((ply_obj.options.loop) ? 'mejs-loop-on' : 'mejs-loop-off') + '">' +
								'<button type="button" aria-controls="' + ply_obj.id + '" title="' + ply_obj.options.i18n.loop_toggle + '"></button>' +
							'</div>')
					.appendTo(ply_obj.controls)
					.click(
						function (e) {
							msos.do_nothing(e);
							ply_obj.options.loop = !ply_obj.options.loop;
							if (ply_obj.options.loop) {
								ply_obj.loop.removeClass('mejs-loop-off').addClass('mejs-loop-on');
							} else {
								ply_obj.loop.removeClass('mejs-loop-on').addClass('mejs-loop-off');
							}
						}
					);
		}
	});
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.loop.start);