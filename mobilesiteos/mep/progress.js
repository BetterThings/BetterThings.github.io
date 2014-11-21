
/*global
    msos: false,
    jQuery: false,
    Modernizr: false
*/

msos.provide("mep.progress");

mep.progress.version = new msos.set_version(14, 6, 13);


// Start by loading our progress.css stylesheet
mep.progress.css = new msos.loader();
mep.progress.css.load('mep_css_progress', msos.resource_url('mep', 'css/progress.css'));

// Only load css3 if supported
if (Modernizr.cssanimations && Modernizr.csstransforms) {
	mep.progress.css.load('mep_css_animation',	msos.resource_url('mep', 'css/animation.css'));
}

mep.progress.start = function () {
	"use strict";

	var temp_ps = 'mep.progress.start - ';

	// progress/loaded bar
	jQuery.extend(
		mep.player.controls,
		{
			buildprogress: function (ply_obj) {

				var rail =		jQuery('<div class="mejs-time-rail">'),
					total =		jQuery('<span class="mejs-time-total">'),
					buffer =	jQuery('<span class="mejs-time-buffering">'),
					loaded =	jQuery('<span class="mejs-time-loaded">'),
					current =	jQuery('<span class="mejs-time-current">'),
					handle  =	jQuery('<span class="mejs-time-handle">'),
					tfloat =	jQuery('<span class="mejs-time-float">'),
					tfltcur =	jQuery('<span class="mejs-time-float-current">00:00</span>'),
					corner =	jQuery('<span class="mejs-time-float-corner">'),
					mouseIsDown = false,
					mouseIsOver = false,
					handleMouseMove,
					setCurrentRail,
					setProgressRail;

				tfloat.append(tfltcur, corner);

				total.append(buffer, loaded, current, handle, tfloat);

				rail.append(total);

				rail.appendTo(ply_obj.controls);

				buffer.hide();

				handleMouseMove = function (e) {
					// mouse position relative to the object
					var x = e.pageX,
						offset = total.offset(),
						width = total.outerWidth(true),
						percentage = 0,
						newTime = 0,
						pos = 0;

					if (ply_obj.media.duration) {
						if (x < offset.left) {
							x = offset.left;
						} else if (x > width + offset.left) {
							x = width + offset.left;
						}

						pos = parseInt(x - offset.left, 10);
						percentage = (pos / width);
						newTime = (percentage <= 0.02) ? 0 : percentage * ply_obj.media.duration;

						// seek to where the mouse is
						if (mouseIsDown && newTime !== ply_obj.media.currentTime) {
							ply_obj.media.setCurrentTime(newTime);
						}

						// position floating time box
						if (!msos.config.browser.touch) {
							tfloat.css('left', pos);
							tfltcur.html(mep.player.utils.secondsToTimeCode(newTime));
							tfloat.show();
							//msos.console.debug(temp_ps + 'buildprogress - handleMouseMove -> fired, for pos: ' + pos);
						}
					}
				};

				setCurrentRail = function () {

					var newWidth,
						handlePos;

					if (ply_obj.media.currentTime !== undefined
					 && ply_obj.media.duration) {

						// update bar and handle
						if (ply_obj.total && ply_obj.handle) {
							newWidth = ply_obj.total.width() * ply_obj.media.currentTime / ply_obj.media.duration;
							handlePos = newWidth - (ply_obj.handle.outerWidth(true) / 2);

							ply_obj.current.width(newWidth);
							ply_obj.handle.css('left', handlePos);
						}
					}
				};

				setProgressRail = function (e) {

					var target = (e !== undefined) ? e.target : ply_obj.media,
						percent = null;

					// newest HTML5 spec has buffered array (FF4, Webkit)
					if (target
					 && target.buffered
					 && target.buffered.length > 0
					 && target.buffered.end
					 && target.duration) {
						percent = target.buffered.end(0) / target.duration;
					}
					// Some browsers (e.g., FF3.6 and Safari 5) cannot calculate target.bufferered.end()
					// to be anything other than 0. If the byte count is available we use this instead.
					// Browsers that support the else if do not seem to have the bufferedBytes value and
					// should skip to there. Tested in Safari 5, Webkit head, FF3.6, Chrome 6, IE 7/8.
					else if (target
						  && target.bytesTotal !== undefined
						  && target.bytesTotal > 0
						  && target.bufferedBytes !== undefined) {
						percent = target.bufferedBytes / target.bytesTotal;
					}
					// Firefox 3 with an Ogg file seems to go this way
					else if (e
						  && e.lengthComputable
						  && e.total !== 0) {
						percent = e.loaded / e.total;
					}

					// finally update the progress bar
					if (percent !== null) {
						percent = Math.min(1, Math.max(0, percent));
						// update loaded bar
						if (ply_obj.loaded && ply_obj.total) {
							ply_obj.loaded.width(ply_obj.total.width() * percent);
						}
					}
				};

				// handle clicks
				// rail.delegate('span', 'click', handleMouseMove);
				total.bind(
					'mousedown',
					function (e) {
						// only handle left clicks
						if (e.which === 1) {
							mouseIsDown = true;
							handleMouseMove(e);
							jQuery(document)
								.bind('mousemove.dur', function (e) {
									handleMouseMove(e);
								})
								.bind('mouseup.dur', function () {
									mouseIsDown = false;
									tfloat.hide();
									jQuery(document).unbind('.dur');
								});
							return false;
						}
						return true;
					}
				).bind(
					'mouseenter',
					function () {
						mouseIsOver = true;
						jQuery(document).bind('mousemove.dur', function (e) {
							handleMouseMove(e);
						});
						if (!msos.config.browser.touch) {
							tfloat.show();
						}
					}
				).bind(
					'mouseleave',
					function () {
						mouseIsOver = false;
						if (!mouseIsDown) {
							jQuery(document).unbind('.dur');
							tfloat.hide();
						}
					}
				);

				// loading
				ply_obj.media.addEventListener(
					'progress',
					function (e) {
						setProgressRail(e);
						setCurrentRail();
					},
					false
				);

				// current time
				ply_obj.media.addEventListener(
					'timeupdate',
					function (e) {
						setProgressRail(e);
						setCurrentRail();
					},
					false
				);

				// store for later use
				ply_obj.rail = rail;
				ply_obj.loaded = loaded;
				ply_obj.buffer = buffer;
				ply_obj.total = total;
				ply_obj.current = current;
				ply_obj.tfltcur = tfltcur;
				ply_obj.handle = handle;
			}
		}
	);
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.progress.start);
