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
    jQuery: false,
    Modernizr: false
*/

// Please note: As of 02/26/2013, this plug-in is too erratic. Each browser
//				differs greatly. The pointer events stuff, or something,
//				overrides focus on the controls in FF and Opera. It needs work!

msos.provide("mep.fullscreen");

mep.fullscreen.version = new msos.set_version(14, 6, 15);


mep.fullscreen.start = function () {
	"use strict";

    jQuery.extend(
		mep.player.config, {
			usePluginFullScreen: true,
			newWindowCallback: function () { return ''; }
		}
	);

    jQuery.extend(
		mep.player.controls, {

			isFullScreen: false,
			isNativeFullScreen: false,
			docStyleOverflow: null,
			FitMediaContainerStyle: '',
			isInIframe: false,
			normalHeight: 0,
			normalWidth: 0,

			buildfullscreen: function (ply_obj) {

				var temp_fs = 'mep.fullscreen',
					bfs = ' - buildfullscreen -> ',
					target = null,
					cfg = ply_obj.options,
					ps = mep.player.support,
					fullscreenBtn,
					fullScreenBtnWidth,
					fullScreenBtnOffset,
					hideTimeout = null,
					fullscreenIsDisabled = false,
					enterFullScreen,
					exitFullScreen,
					isInIframe = (window.location !== window.parent.location);

				enterFullScreen = function () {
					var efs = ' - enterFullScreen -> ',
						ps = mep.player.support,
						requestFullScreen = function (el) {
							if			(ps.fs.webkit_native) {
								msos.console.debug(temp_fs + bfs + efs + 'called for webkit native');
								el.webkitRequestFullScreen();
							} else if	(ps.fs.moz_native) {
								msos.console.debug(temp_fs + bfs + efs + 'called for moz native');
								el.mozRequestFullScreen();
							} else if	(ps.fs.ms_native) {
								msos.console.debug(temp_fs + bfs + efs + 'called for ms native');
								el.msRequestFullscreen()
							}
						},
						url,
						set_iframe_win;

					msos.console.debug(temp_fs + bfs + efs + 'start.');

					// firefox+flash can't adjust plugin sizes without resetting :(
					if (ply_obj.media.pluginType !== 'native' && (msos.is.FF || cfg.usePluginFullScreen)) {
						msos.console.debug(temp_fs + bfs + efs + 'FireFox or usePluginFullScreen: true');
						return;
					}

					// store overflow
					ply_obj.docStyleOverflow = document.documentElement.style.overflow;
					// set it to not show scroll bars so 100% will work
					document.documentElement.style.overflow = 'hidden';

					// store sizing
					ply_obj.normalHeight = ply_obj.container.height();
					ply_obj.normalWidth  = ply_obj.container.width();

					if (msos.config.verbose) {
						msos.console.debug(temp_fs + bfs + efs + 'nominal w: ' + ply_obj.normalWidth + ', h: ' + ply_obj.normalHeight);
					}

					// attempt to do true fullscreen (Safari 5.1 and Firefox Nightly only for now)
					if (ply_obj.media.pluginType === 'native') {

						if (ps.fs.true_native) {

							msos.console.debug(temp_fs + bfs + efs + 'for true_native');

							requestFullScreen(ply_obj.container[0]);

							if (isInIframe) {
								// sometimes exiting from fullscreen doesn't work
								// notably in Chrome <iframe>. Fixed in version 17
								setTimeout(

								function checkFullscreen() {

									if (ply_obj.isNativeFullScreen) {
										// check if the video is suddenly not really fullscreen
										if (jQuery(window).width() !== screen.width) {
											// manually exit
											exitFullScreen();
										} else {
											// test again
											setTimeout(checkFullscreen, 500);
										}
									}
								}, 500);
							}
						} else if (ps.fs.semi_native) {

							msos.console.debug(temp_fs + bfs + efs + 'for semi_native');

							ply_obj.media.webkitEnterFullscreen();
							return;
						}
					}

					// check for iframe launch
					if (isInIframe) {

						msos.console.debug(temp_fs + bfs + efs + 'use Iframe!');

						url = cfg.newWindowCallback(this);

						if (url !== '') {

							set_iframe_win = 'top=0,left=0,width=' + screen.availWidth + ',height=' + screen.availHeight + ',resizable=yes,scrollbars=no,status=no,toolbar=no';

							// launch immediately
							if (!ps.fs.true_native) {
								ply_obj.pause();
								window.open(
									url,
									ply_obj.id,
									set_iframe_win
								);
							} else {
								setTimeout(
									function () {
										if (!ply_obj.isNativeFullScreen) {
											ply_obj.pause();
											window.open(
												url,
												ply_obj.id,
											set_iframe_win
										);
										}
									},
									250
								);
							}
							return;
						}

						msos.console.warn(temp_fs + bfs + efs + 'Iframe failed: url was undefined!');
					}

					// Store container style
					ply_obj.FitMediaContainerStyle = ply_obj.container.attr('style');

					// full window code
					// make full size
					ply_obj.container.removeAttr('style');	// fitMedia adds padding-top info
					ply_obj.container.removeClass('fitmedia');
					ply_obj.container.addClass('mejs-container-fullscreen');

					ply_obj.fullscreenBtn.removeClass('mejs-fullscreen').addClass('mejs-unfullscreen');

					ply_obj.isFullScreen = true;

					// Let DOM changes settle before size changes...
					setTimeout(
						function () {
							ply_obj.setControlsSize();
						},
						250
					);

					msos.console.debug(temp_fs + bfs + efs + 'done!');
				};

				exitFullScreen = function () {

					var efs = ' - exitFullScreen -> ',
						ps = mep.player.support,
						cancelFullScreen = function () {
							if			(ps.fs.webkit_native) {
								msos.console.debug(temp_fs + bfs + efs + 'called for webkit native');
								document.webkitCancelFullScreen();
							} else if	(ps.fs.moz_native) {
								msos.console.debug(temp_fs + bfs + efs + 'called for moz native');
								document.mozCancelFullScreen();
							} else if	(ps.fs.ms_native) {
								msos.console.debug(temp_fs + bfs + efs + 'called for ms native');
								document.msExitFullscreen();
							}
						};

					msos.console.debug(temp_fs + bfs + efs + 'start.');

					// firefox can't adjust plugins
					if (ply_obj.media.pluginType !== 'native' && msos.is.FF) {
						msos.console.debug(temp_fs + bfs + efs + 'for FireFox.');
						ply_obj.media.setFullscreen(false);
						return;
					}

					// come outo of native fullscreen
					if (ps.fs.true_native && (ps.fs.is_fullscreen() || ply_obj.isFullScreen)) {
						msos.console.debug(temp_fs + bfs + efs + 'for true_native');
						cancelFullScreen();
					}

					// restore scroll bars to document
					document.documentElement.style.overflow = ply_obj.docStyleOverflow;

					ply_obj.container.removeClass('mejs-container-fullscreen');
					ply_obj.container.addClass('fitmedia');
					ply_obj.container.attr('style', ply_obj.FitMediaContainerStyle);


					ply_obj.fullscreenBtn.removeClass('mejs-unfullscreen').addClass('mejs-fullscreen');

					ply_obj.isFullScreen = false;

					// Let DOM changes settle before size changes...
					setTimeout(
						function () {
							ply_obj.setControlsSize();
						},
						250
					);

					msos.console.debug(temp_fs + bfs + efs + 'done!');
				};

				// Make available everywhere
				ply_obj.isInIframe = isInIframe;
				ply_obj.enterFullScreen = enterFullScreen;
				ply_obj.exitFullScreen = exitFullScreen;

				// native events
				if (ps.fs.true_native) {
					// chrome doesn't alays fire this in an iframe

					if (msos.config.verbose) {
						msos.console.debug(temp_fs + bfs + 'set for true_native.');
					}

					if (ps.fs.moz_native) {
						target = jQuery(document);
					} else {
						target = ply_obj.container;
					}

					target.bind(
						ps.fs.event_name,
						function () {
							if (ps.fs.is_fullscreen()) {
								ply_obj.isNativeFullScreen = true;
								// reset the controls once we are fully in full screen
								ply_obj.setControlsSize();
							} else {
								ply_obj.isNativeFullScreen = false;
								// when a user presses ESC
								// make sure to put the player back into place								
								exitFullScreen();
							}
						}
					);
				}

				fullscreenBtn = jQuery(
						'<div class="mejs-button mejs-fullscreen-button">' +
							'<button type="button" aria-controls="' + ply_obj.id + '" title="' + cfg.i18n.fullscreen_text + '"><i class="fa fa-arrows-alt"></i><i class="fa fa-square-o"></i></button>' +
						'</div>')
					.appendTo(ply_obj.controls);

				if (ply_obj.media.pluginType === 'native' || (!cfg.usePluginFullScreen)) {

					if (msos.config.verbose) {
						msos.console.debug(temp_fs + bfs + 'use native.');
					}

					fullscreenBtn.click(
						function (e) {
							var is_fs = (ps.fs.true_native && ps.fs.is_fullscreen()) || ply_obj.isFullScreen;

							msos.do_nothing(e);

							if (is_fs)	{ exitFullScreen(); }
							else		{ enterFullScreen(); }
						}
					);

				} else {

					if (Modernizr.pointerevents) {

						if (msos.config.verbose) {
							msos.console.debug(temp_fs + bfs + 'use pointerevents.');
						}

						// opera doesn't allow this :(
						// allows clicking through the fullscreen button and controls down directly to Flash
						/*
							 When a user puts his mouse over the fullscreen button, the controls are disabled
							 So we put a div over the video and another one on iether side of the fullscreen button
							 that caputre mouse movement
							 and restore the controls once the mouse moves outside of the fullscreen button
							*/

						var videoHoverDiv,
							controlsLeftHoverDiv,
							controlsRightHoverDiv,
							restoreControls = function () {
								if (fullscreenIsDisabled) {
									// hide the hovers
									videoHoverDiv.hide();
									controlsLeftHoverDiv.hide();
									controlsRightHoverDiv.hide();

									// restore the control bar
									fullscreenBtn.css('pointer-events', '');
									ply_obj.controls.css('pointer-events', '');

									// store for later
									fullscreenIsDisabled = false;
								}
							},
							positionHoverDivs = function () {
								var style = {
									position: 'absolute',
									top: 0,
									left: 0
								};

								videoHoverDiv.css(style);
								controlsLeftHoverDiv.css(style);
								controlsRightHoverDiv.css(style);

								// over video, but not controls
								videoHoverDiv.width(ply_obj.container.width()).height(ply_obj.container.height() - ply_obj.controls.height());

								// over controls, but not the fullscreen button
								fullScreenBtnOffset = fullscreenBtn.offset().left - ply_obj.container.offset().left;
								fullScreenBtnWidth  = fullscreenBtn.outerWidth(true);

								controlsLeftHoverDiv.width(fullScreenBtnOffset)
									.height(ply_obj.controls.height())
									.css({ top: ply_obj.container.height() - ply_obj.controls.height() });

								// after the fullscreen button
								controlsRightHoverDiv.width(ply_obj.container.width() - fullScreenBtnOffset - fullScreenBtnWidth)
									.height(ply_obj.controls.height())
									.css(
										{
											top: ply_obj.container.height() - ply_obj.controls.height(),
											left: fullScreenBtnOffset + fullScreenBtnWidth
										}
									);
							};

						videoHoverDiv =
							jQuery('<div class="mejs-fullscreen-hover" />')
								.appendTo(ply_obj.container)
								.mouseover(restoreControls);

						controlsLeftHoverDiv =
							jQuery('<div class="mejs-fullscreen-hover" />')
								.appendTo(ply_obj.container)
								.mouseover(restoreControls);

						controlsRightHoverDiv =
							jQuery('<div class="mejs-fullscreen-hover" />')
								.appendTo(ply_obj.container)
								.mouseover(restoreControls);

						jQuery(document).resize(
							function () {
								positionHoverDivs();
							}
						);

						// on hover, kill the fullscreen button's HTML handling, allowing clicks down to Flash
						fullscreenBtn.mouseover(
							function () {
								if (!ply_obj.isFullScreen) {

									var buttonPos = fullscreenBtn.offset(),
										containerPos = ply_obj.container.offset();

									// move the button in Flash into place
									ply_obj.media.positionFullscreenButton(buttonPos.left - containerPos.left, buttonPos.top - containerPos.top, false);

									// allows click through
									fullscreenBtn.css('pointer-events', 'none');
									ply_obj.controls.css('pointer-events', 'none');

									// show the divs that will restore things
									videoHoverDiv.show();
									controlsRightHoverDiv.show();
									controlsLeftHoverDiv.show();
									positionHoverDivs();

									fullscreenIsDisabled = true;
								}
							}
						);

						// restore controls anytime the user enters or leaves fullscreen	
						ply_obj.media.addEventListener(
							'fullscreenchange',
							function () {
								restoreControls();
							}
						);

					} else {

						if (msos.config.verbose) {
							msos.console.debug(temp_fs + bfs + 'without pointerevents.');
						}

						// the hover state will show the fullscreen button in Flash to hover up and click
						fullscreenBtn.mouseover(
							function () {
								if (hideTimeout !== null) {
									clearTimeout(hideTimeout);
									hideTimeout = null;
								}

								var buttonPos = fullscreenBtn.offset(),
									containerPos = ply_obj.container.offset();

								ply_obj.media.positionFullscreenButton(
									buttonPos.left - containerPos.left,
									buttonPos.top - containerPos.top,
									true
								);
							}
						).mouseout(
							function () {

								if (hideTimeout !== null) {
									clearTimeout(hideTimeout);
									hideTimeout = null;
								}

								hideTimeout = setTimeout(

								function () {
									ply_obj.media.hideFullscreenButton();
								}, 1500);
							}
						);
					}
				}

				ply_obj.fullscreenBtn = fullscreenBtn;

				jQuery(document).bind(
					'keydown',
					function (e) {
						if (msos.config.verbose) {
							msos.console.debug(temp_fs + bfs + 'document keydown event fired!');
						}
						msos.do_nothing(e);
						if (((ps.fs.true_native && ps.fs.is_fullscreen()) || ply_obj.isFullScreen)
						 && e.keyCode === 27) {
							exitFullScreen();
						}
					}
				);
			}
		}
	);
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.fullscreen.start);