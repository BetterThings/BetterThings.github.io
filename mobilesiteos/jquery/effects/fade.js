/*!
 * jQuery UI Effects Fade 1.10.4
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/fade-effect/
 *
 * Depends:
 *	jquery.ui.effect.js
 */
// Adapted for use thru MobileSiteOS. This works without worrying about load order because
// 'jquery.ui.js' includes ui core, widget, mouse, position, draggable, effect.core already bundled.

// msos: start
msos.provide("jquery.effects.fade");

jquery.effects.fade.version = new msos.set_version(14, 2, 23);


// Directly below is the std. jquery.effects plugin
(function( $, undefined ) {

$.effects.effect.fade = function( o, done ) {
	var el = $( this ),
		mode = $.effects.setMode( el, o.mode || "toggle" );

	el.animate({
		opacity: mode
	}, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: done
	});
};

})( jQuery );
