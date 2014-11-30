// Copyright Notice:
//					site.js
//			Copyright©2012-2014 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*

	Use 'site.js' to add site specific code for availability
	to many pages and apps. Note that here, as oppose to the 'config.js'
	file, UnderscoreJS, Modernizr, jQuery, etc. are now available for use.

	Also, add small jQuery plugin's here, (ie - jQuery FitText below).

	OpenSiteMobile MobileSiteOS site specific code:

	    Google Analytics,
	    AddThis,
	    other Social site calls, etc.
	
	Plus:

	    Auto-Load Modules - based on dom elements
*/

/*global
	msos:false,
	Modernizr:false,
	jQuery: false,
	_: false,
	addthis: false,
	addthis_config: false
*/

msos.site = {};

msos.console.info('site -> start, (/BetterThings/site.js file).');
msos.console.time('site');


// --------------------------
// VisualEvent DOM3 Event Tracking
// --------------------------

// Add event debugging to "addEventListener", for DOM3 "VisualEvent"
if (msos.config.visualevent) {

	// Add event debugging to "addEventListener"
	Element.prototype.recorded_addEventListener = [];
	Element.prototype.org_addEventListener = Element.prototype.addEventListener;
	Element.prototype.addEventListener = function (a, b, c) {
		"use strict";

		this.org_addEventListener(a, b, c);

		// Exclude jQuery added event, (we get them later)
		if (typeof jQuery._data(jQuery(this)[0], 'events') !== 'object') {
			this.recorded_addEventListener.push(
				{
					"type" : a,
					"func" : b.toString(),
					"removed": false,
					"source": 'DOM 3 event'
				}
			);
		}
	};
}


/*!
 * FitText.js 1.1
 *
 * Copyright 2011, Dave Rupert http://daverupert.com
 * Released under the WTFPL license
 * http://sam.zoy.org/wtfpl/
 *
 * Date: Thu May 05 14:23:00 2011 -0600
 *
 * Modified for MobileSiteOS
 */
(function ($) {
	"use strict";

	$.fn.fitText = function (kompressor, options) {

        // Setup options
        var compressor = kompressor || 1,
            settings = $.extend({
                'minFontSize': Number.NEGATIVE_INFINITY,
                'maxFontSize': Number.POSITIVE_INFINITY
            }, options);

        return this.each(
			function () {
				var $this = $(this);
				// Resizes items based on the object width divided by the compressor * 10
				$this.css('font-size', Math.max(Math.min($this.width() / (compressor * 10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)));
			}
		);
	};

}(jQuery));


// Adjust marquee display using above
msos.ondisplay_size_change.push(
	function () {
		"use strict";

		var marquee = jQuery('#marquee');

		marquee.hide();

		// Adjust marquee for display size. (.8 is a compression factor for #marquee)
		marquee.fitText(0.8, { maxFontSize: marquee.height() + 'px' });

		marquee.fadeIn('slow');
	}
);


// --------------------------
// Google Analytics Tracking Function
// --------------------------

msos.site.google_analytics = function () {
    "use strict";

    // Set to your website or remove if/else statment
    if (document.domain === msos.config.google.analytics_domain) {

		var url = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js',
			ga_loader = new msos.loader();

		// Use our loader for better debugging
		ga_loader.load('google_analytics_api', url, 'js');

    } else {
		msos.console.warn('msos.site.google_analytics -> please update msos.config.google.analytics_domain in config.js!');
      }
};


// --------------------------
// Social Website Code
// --------------------------

msos.site.addthis_share = function () {
	"use strict";

	// Use AddThis provided language output
	msos.config.google.no_translate.by_id.push('#social_ties');

	var html_out =
			'<div class="addthis_toolbox addthis_default_style ">' +
				'<a class="addthis_button_google_plusone_share"></a>' +
				'<a class="addthis_button_preferred_1"></a>' +
				'<a class="addthis_button_preferred_2"></a>' +
				'<a class="addthis_button_preferred_3"></a>' +
				'<a class="addthis_button_compact"></a>' +
				'<a class="addthis_counter addthis_bubble_style"></a>' +
			'</div>',
		run_addthis = function () {
			var atl = new msos.loader();

			atl.add_resource_onload.push(
				function () {
					setTimeout(addthis.init, 250);		// Give AddThis css a chance to load completely
				}
			);

			addthis_config.ui_language = msos.config.locale.replace('_', '-');

			atl.load(
				'addthis_share_api',
				'//s7.addthis.com/js/300/addthis_widget.js#pubid=' + msos.config.addthis_pubid + '&async=1&domready=1',
				'js'
			);
		};

	// Add our 'AddThis' html
	jQuery('#social_ties').html(html_out);

	// Run this after everything else is done (non-critical)
	msos.onload_func_post.push(run_addthis);
};


// --------------------------
// Site Specific Code
// --------------------------

msos.site.auto_init = function () {
    "use strict";

	var temp_ai = 'msos.site.auto_init -> ',
		cfg = msos.config,
		bw_val = msos.config.cookie.site_bdwd.value || '',
		bdwidth = bw_val ? parseInt(bw_val, 10) : 0;

	msos.console.debug(temp_ai + 'start.');

	// Run MobileSiteOS sizing (alt. would be: use media queries instead)
	if (cfg.run_size)							{ msos.require("msos.size"); }

    // Based on page elements and configuration -> run functions or add modules
    if (cfg.run_ads
	 && bdwidth > 150
	 && jQuery('#rotate_marquee').length === 1)	{ msos.require("msos.google.ad"); }
    if (cfg.run_social
	 && bdwidth > 150
     && jQuery('#social_ties').length)			{ msos.site.addthis_share(); }

	// Or based on configuration settings
	if (cfg.run_analytics && bdwidth > 150)		{ msos.site.google_analytics(); }
	if (cfg.run_translate && bdwidth > 150)		{ msos.require("msos.google.translate"); }

	msos.console.debug(temp_ai + 'done!');
};

msos.site.external_link_warning = function () {
	"use strict";

	jQuery(
		function ($) {
	
			$.expr[':'].external = function (obj) {
				return obj.protocol.match(/^http/)
				&& obj.hostname != location.hostname;
			};

			$('a:external').click(
				function() {
					if (
						confirm(
							'This link is provided as a service to you, and will take you to a third party' +
							'site, not affiliated with Better Things Financial Partners, LLC. We are not' +
							'responsible for the content and do not guarantee the accuracy of any information' +
							'or materials contained therein. Click OK to open this link in a new browser window.'
						)) {
						window.open(this.href,'_blank');
					}
						return false;
					}
				);
		}
	);
};

msos.site.toggle_disclaimer = function () {
	"use strict";

	// Toggles disclaimer text at bottom of page

	var disclaim_tog = $("#disclaimer_toggle"),
		disclaim_div = $("#disclaimer");

	msos.require("jquery.tools.innerfade");

	// Show disclaimer on first visit, then hide.
	if (msos.cookie('betterthings')) {
		$('#disclaimer').hide();
	} else {
		msos.cookie('betterthings', 'welcome', { expires: 1, path : '/'});
	}

	disclaim_tog.click(
		function (e) {
			e.preventDefault();

			disclaim_div.toggle(
				"slow",
				function () {
					if (disclaim_div.css('display') === 'none') {
						disclaim_tog.attr('href', '#disclaimer');

						 // Once close, scroll to page top...
						jQuery("#page_content").animate(
							{ scrollTop: 0 },
							1000
						);

					} else {

						// Scroll to optimum position...
						jQuery("html, body").animate(
							{ scrollTop: disclaim_div.offset().top - 150 },
							1000
						);
					}
				}
			);
		}
	);
}

msos.site.visual_effects = function () {
	"use strict";

	// Add some common page visual effects

	var url = msos.purl(),
		file = url.attr('file') || 'index.html';

	msos.console.info('Page ' + file + ' loaded!');

	// Rotating header
	jQuery('#rotating_header').innerfade(
		{
			animationtype: 'fade',
			speed: 1200,
			timeout: 6000,
			type: 'sequence',
			containerheight: '2em'
		}
	);

	// All loaded, so show #body
	jQuery('#body').fadeIn('slow');

	// Active Menu Class
	jQuery('#navbar li > a[href$="' + file + '"]').parents('li').addClass('active');
}

// Load site specific setup code
msos.onload_func_pre.push(msos.site.auto_init);
msos.onload_func_pre.push(msos.site.toggle_disclaimer);
msos.onload_func_done.push(msos.site.external_link_warning);
msos.onload_func_done.push(msos.site.visual_effects);

msos.console.info('site -> done!');
msos.console.timeEnd('site');