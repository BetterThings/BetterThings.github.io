
/*global
    msos: false,
    jQuery: false
*/

msos.provide("mep.current");

mep.current.version = new msos.set_version(14, 6, 15);


mep.current.start = function () {
	"use strict";

	jQuery.extend(
		mep.player.controls,
		{
			buildcurrent: function (ply_obj) {

				var cfg = ply_obj.options,
					tm =	jQuery('<div class="mejs-time">'),
					ct =	jQuery('<span>' +
								(cfg.alwaysShowHours ? '00:' : '') + (cfg.showTimecodeFrameCount ? '00:00:00' : '00:00') +
							'</span>');

				tm.append(ct);
				tm.appendTo(ply_obj.controls);

				ply_obj.ct_container = tm;
				ply_obj.currenttime = ct;

				ply_obj.updateCurrent = function () {
					if (ply_obj.currenttime) {
						ply_obj.currenttime.html(
							mep.player.utils.secondsToTimeCode(
								ply_obj.media.currentTime,
								cfg.alwaysShowHours || ply_obj.media.duration > 3600,
								cfg.showTimecodeFrameCount,
								cfg.framesPerSecond || 25
							)
						);
					}
				};

				ply_obj.media.addEventListener(
					'timeupdate',
					ply_obj.updateCurrent,
					false
				);
			}
		}
	);
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.current.start);