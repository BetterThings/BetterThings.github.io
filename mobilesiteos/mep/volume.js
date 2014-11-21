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

msos.provide("mep.volume");

mep.volume.version = new msos.set_version(14, 6, 15);


// Start by loading our volume.css stylesheet
mep.volume.css = new msos.loader();
mep.volume.css.load('mep_volume_css', msos.resource_url('mep', 'css/volume.css'));

mep.volume.start = function () {
	"use strict";

	jQuery.extend(
		mep.player.config,
		{
			audioVolume: 'horizontal',
			videoVolume: 'vertical'
		}
	);

	jQuery.extend(
		mep.player.controls,
		{
			buildvolume: function (ply_obj) {

				var cfg = ply_obj.options,
					mode = (ply_obj.isVideo) ? cfg.videoVolume : cfg.audioVolume,
					mute,
					volumeSlider =	(mode === 'horizontal') ? jQuery('<div class="mejs-horizontal-volume-slider">')  : jQuery('<div class="mejs-volume-slider">'),
					volumeTotal =	(mode === 'horizontal') ? jQuery('<div class="mejs-horizontal-volume-total">')   : jQuery('<div class="mejs-volume-total">'),
					volumeCurrent =	(mode === 'horizontal') ? jQuery('<div class="mejs-horizontal-volume-current">') : jQuery('<div class="mejs-volume-current">'),
					volumeHandle =	(mode === 'horizontal') ? jQuery('<div class="mejs-horizontal-volume-handle">')  : jQuery('<div class="mejs-volume-handle">'),
					positionVolumeHandle,
					handleVolumeMove,
					mouseIsDown = false,
					mouseIsOver = false;

				volumeSlider.append(volumeTotal, volumeCurrent, volumeHandle);

				mute =	jQuery('<div class="mejs-button mejs-volume-button mejs-mute">' +
							'<button type="button" aria-controls="' + ply_obj.id + '" title="' + cfg.i18n.mute_toggle + '"><i class="fa fa-volume-up"></i><i class="fa fa-volume-off"></button>' +
						'</div>');

				if (mode === 'horizontal') {
					mute.appendTo(ply_obj.controls);
					volumeSlider.appendTo(ply_obj.controls);
				} else {
					mute.append(volumeSlider);
					mute.appendTo(ply_obj.controls);
				}

				positionVolumeHandle = function (volume, secondTry) {

					if (!volumeSlider.is(':visible') && secondTry === undefined) {
						volumeSlider.show();
						positionVolumeHandle(volume, true);
						volumeSlider.hide();
						return;
					}

					// correct to 0-1
					volume = Math.max(0, volume);
					volume = Math.min(volume, 1);

					// ajust mute button style
					if (volume === 0) {
						mute.removeClass('mejs-mute').addClass('mejs-unmute');
					} else {
						mute.removeClass('mejs-unmute').addClass('mejs-mute');
					}

					var totalWidth,
						totalHeight,
						totalPosition,
						newTop,
						newLeft;

					// position slider
					if (mode === 'vertical') {
						// height of the full size volume slider background
						totalHeight = volumeTotal.height();

						// top/left of full size volume slider background
						totalPosition = volumeTotal.position();

						// the new top position based on the current volume
						// 70% volume on 100px height == top:30px
						newTop = totalHeight - (totalHeight * volume);

						// handle
						volumeHandle.css('top', Math.round(totalPosition.top + newTop - (volumeHandle.height() / 2)));

						// show the current visibility
						volumeCurrent.height(totalHeight - newTop);
						volumeCurrent.css('top', totalPosition.top + newTop);
					} else {
						// height of the full size volume slider background
						totalWidth = volumeTotal.width();

						// top/left of full size volume slider background
						totalPosition = volumeTotal.position();

						// the new left position based on the current volume
						newLeft = totalWidth * volume;

						// handle
						volumeHandle.css('left', Math.round(totalPosition.left + newLeft - (volumeHandle.width() / 2)));

						// rezize the current part of the volume bar
						volumeCurrent.width( Math.round(newLeft) );
					}
				};

				handleVolumeMove = function (e) {

					var volume = null,
						totalOffset = volumeTotal.offset(),
						railHeight,
						railWidth,
						totalTop,
						newY,
						newX;

					// calculate the new volume based on the moust position
					if (mode === 'vertical') {

						railHeight = volumeTotal.height();
						totalTop = parseInt(volumeTotal.css('top').replace(/px/, ''), 10);
						newY = e.pageY - totalOffset.top;

						volume = (railHeight - newY) / railHeight;

						// the controls just hide themselves (usually when mouse moves too far up)
						if (totalOffset.top === 0 || totalOffset.left === 0) { return; }

					} else {
						railWidth = volumeTotal.width();
						newX = e.pageX - totalOffset.left;

						volume = newX / railWidth;
					}

					// ensure the volume isn't outside 0-1
					volume = Math.max(0, volume);
					volume = Math.min(volume, 1);

					// position the slider and handle			
					positionVolumeHandle(volume);

					// set the media object (this will trigger the volumechanged event)
					if (volume === 0) {
						ply_obj.media.setMuted(true);
					} else {
						ply_obj.media.setMuted(false);
					}
					ply_obj.media.setVolume(volume);
				};

				// SLIDER

				mute
					.hover(
						function () {
							volumeSlider.show();
							mouseIsOver = true;
						},
						function () {
							mouseIsOver = false;
							if (!mouseIsDown && mode === 'vertical') {
								volumeSlider.hide();
							}
						}
					);

				volumeSlider
					.bind('mouseover', function () {
						mouseIsOver = true;
					})
					.bind('mousedown', function (e) {
						handleVolumeMove(e);
						jQuery(document)
							.bind('mousemove.vol', function (e) {
								handleVolumeMove(e);
							})
							.bind('mouseup.vol', function () {
								mouseIsDown = false;
								jQuery(document).unbind('.vol');

								if (!mouseIsOver && mode === 'vertical') {
									volumeSlider.hide();
								}
							});
						mouseIsDown = true;

						return false;
					});

				// MUTE button
				mute.find('button').click(
					function (e) {
						msos.do_nothing(e);
						ply_obj.media.setMuted(!ply_obj.media.muted);
					}
				);

				// listen for volume change events from other sources
				ply_obj.media.addEventListener(
					'volumechange',
					function (e) {
						if (!mouseIsDown) {
							if (ply_obj.media.muted) {
								positionVolumeHandle(0);
								mute.removeClass('mejs-mute').addClass('mejs-unmute');
							} else {
								positionVolumeHandle(ply_obj.media.volume);
								mute.removeClass('mejs-unmute').addClass('mejs-mute');
							  }
						}
					},
					false
				);

				if (ply_obj.container.is(':visible')) {
					// set initial volume
					positionVolumeHandle(cfg.startVolume);

					// shim gets the startvolume as a parameter, but we have to set it on the native <video> and <audio> elements
					if (ply_obj.media.pluginType === 'native') {
						ply_obj.media.setVolume(cfg.startVolume);
					}
				}
			}
		}
	);
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.volume.start);
