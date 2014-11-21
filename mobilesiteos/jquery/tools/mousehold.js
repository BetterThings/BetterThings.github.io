/*
 * jQuery mousehold plugin - fires an event while the mouse is clicked down.
 * Additionally, the function, when executed, is passed a single
 * argument representing the count of times the event has been fired during
 * this session of the mouse hold.
 *
 * @author Remy Sharp (leftlogic.com)
 * @date 2006-12-15
 * @example $("img").mousehold(200, function(i){  })
 * @desc Repeats firing the passed function while the mouse is clicked down
 *
 * @name mousehold
 * @type jQuery
 * @param Number timeout The frequency to repeat the event in milliseconds
 * @param Function fn A function to execute
 * @cat Plugin
 * 
 * Modified by Jimmy Lam (jimmykhlam.com) on 2011-11-26 to include passing
 * the origEv event from original mousedown.
 */


// Adapted for use thru MobileSiteOS and with touch events.

msos.provide("jquery.tools.mousehold");

if (msos.config.browser.touch) {
	msos.require("jquery.touch.toe");
}

jquery.tools.mousehold.version = new msos.set_version(13, 6, 14);


jQuery.fn.mousehold = function (timeout, f) {
	"use strict";

	if (timeout && typeof timeout == 'function') {
		f = timeout;
		timeout = 100;
	}
	if (f && typeof f === 'function') {
		var timer = 0;
		var fireStep = 0;

		return this.each(
			function() {
				var origEv,											// var for original event
					clearMousehold = function () {
						clearInterval(timer);
						if (fireStep == 1) f.call(this, 1, origEv);	//pass original event
						fireStep = 0;
					},
					run_mousehold = function (ev) {
						origEv = ev;								// rem original event
						fireStep = 1;

						var ctr = 0;
						var t = this;

						timer = setInterval(
							function () {
								ctr++;
								f.call(t, ctr, ev);
								fireStep = 2;
							},
							timeout
						);
					};

				if (msos.config.browser.touch) {
					jQuery(this).on(
						'touchstart touchmove',
						function (event) {
							event.preventDefault();
						}
					);
					jQuery(this).on('touchend', clearMousehold);
					jQuery(this).on('taphold', run_mousehold);
				} else {
					jQuery(this).mousedown(run_mousehold);
					jQuery(this).mouseout(clearMousehold);
					jQuery(this).mouseup(clearMousehold);
				}
			}
		);
	}
	return null;
}
