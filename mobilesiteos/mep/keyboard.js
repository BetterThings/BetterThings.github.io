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

msos.provide("mep.keyboard");

mep.keyboard.version = new msos.set_version(14, 6, 15);


mep.keyboard.start = function () {
	"use strict";

	jQuery.extend(
		mep.player.config,
		{
            // turns keyboard support on and off for this instance
            enableKeyboard: true,
            // array of keyboard actions such as play pause
            keyActions: [
                {
                    keys: [
                        32, // SPACE
                        179 // GOOGLE play/pause button
                    ],
                    action: function (ply_obj) {
                        if (ply_obj.media.paused || ply_obj.media.ended) {
                            ply_obj.media.play();
                        } else {
                            ply_obj.media.pause();
                        }
                    }
                },
                {
                    keys: [38], // UP
                    action: function (ply_obj) {
                        var newVolume = Math.min(ply_obj.media.volume + 0.1, 1);
                        ply_obj.media.setVolume(newVolume);
                    }
                },
                {
                    keys: [40], // DOWN
                    action: function (ply_obj) {
                        var newVolume = Math.max(ply_obj.media.volume - 0.1, 0);
                        ply_obj.media.setVolume(newVolume);
                    }
                },
                {
                    keys: [
                        37, // LEFT
                        227 // Google TV rewind
                    ],
                    action: function (ply_obj) {
                        if (!isNaN(ply_obj.media.duration) && ply_obj.media.duration > 0) {
                            if (ply_obj.isVideo) {
                                ply_obj.showControls();
                                ply_obj.startControlsTimer();
                            }
                            // 5%
							var newTime = Math.max(ply_obj.media.currentTime - ply_obj.options.defaultSeekBackwardInterval(ply_obj.media), 0);
                            ply_obj.media.setCurrentTime(newTime);
                        }
                    }
                },
                {
                    keys: [
                        39, // RIGHT
                        228 // Google TV forward
                    ],
                    action: function (ply_obj) {
                        if (!isNaN(ply_obj.media.duration) && ply_obj.media.duration > 0) {
                            if (ply_obj.isVideo) {
                                ply_obj.showControls();
                                ply_obj.startControlsTimer();
                            }

                            // 5%
							var newTime = Math.min(ply_obj.media.currentTime + ply_obj.options.defaultSeekForwardInterval(ply_obj.media), ply_obj.media.duration);
                            ply_obj.media.setCurrentTime(newTime);
                        }
                    }
                },
                {
                    keys: [70], // f
                    action: function (ply_obj) {
                        if (ply_obj.enterFullScreen !== undefined) {
                            if (ply_obj.isFullScreen) {
                                ply_obj.exitFullScreen();
                            } else {
                                ply_obj.enterFullScreen();
                              }
                        }
                    }
                }
            ]
		}
	);

	// Add keyboard hot-keys, movements
	jQuery.extend(
		mep.player.controls,
		{
			buildkeyboard: function (ply_obj) {

                // listen for key presses
                jQuery(document).keydown(
                    function (e) {
                        var i = 0,
							cfg = ply_obj.options,
                            il = cfg.keyActions.length,
                            keyAction,
                            j = 0,
                            jl = keyAction.keys.length;

                        if (ply_obj.hasFocus && cfg.enableKeyboard) {
                            // find a matching key
                            for (i = 0; i < il; i += 1) {
                                keyAction = cfg.keyActions[i];
                                for (j = 0; j < jl; j += 1) {
                                    if (e.keyCode === keyAction.keys[j]) {
                                        e.preventDefault();
										keyAction.action(ply_obj);
										msos.console.debug(this.name + ' - buildkeyboard - keydown -> called for: ' + e.keyCode);
                                        return false;
                                    }
                                }
                            }
                        }
                        return true;
                    }
                );

                // check if someone clicked outside a player region, then kill its focus
                jQuery(document).click(
                    function (event) {
                        if (jQuery(event.target).closest('.mejs-container').length === 0) {
                            ply_obj.hasFocus = false;
                        }
                    }
                );
            }
		}
	);
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.keyboard.start);
