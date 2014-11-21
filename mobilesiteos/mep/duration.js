
/*global
    msos: false,
    jQuery: false
*/

msos.provide("mep.duration");

mep.duration.version = new msos.set_version(14, 6, 15);


mep.duration.start = function () {
	"use strict";

	// options
	jQuery.extend(
		mep.player.config,
		{
			duration: -1
		}
	);

	jQuery.extend(
		mep.player.controls,
		{
			buildduration: function (ply_obj) {

				var cfg = ply_obj.options,
					tm =	jQuery('<div class="mejs-time mejs-duration-container">'),
					dr =	jQuery('<span class="mejs-duration">' +
								((cfg.alwaysShowHours ? '00:' : '') + (cfg.showTimecodeFrameCount ? '00:00:00' : '00:00')) +
							'</span>');

				tm.append(dr);
				tm.appendTo(ply_obj.controls);

				ply_obj.dr_container = tm;
				ply_obj.durationD = dr;

				ply_obj.updateDuration = function () {
					//Toggle the long video class if the video is longer than an hour.
					ply_obj.container.toggleClass("mejs-long-video", ply_obj.media.duration > 3600);
	
					if (ply_obj.media.duration && ply_obj.durationD) {
						ply_obj.durationD.html(
							mep.player.utils.secondsToTimeCode(
								ply_obj.media.duration,
								cfg.alwaysShowHours,
								cfg.showTimecodeFrameCount,
								cfg.framesPerSecond || 25
							)
						);
					}		
				};

				ply_obj.media.addEventListener(
					'timeupdate',
					ply_obj.updateDuration,
					false
				);
			}
		}
	);
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.duration.start);