/**
 * jQuery-Picture
 * @version 0.9
 * @author Abban Dunne http://abandon.ie
 * @license MIT
 * http://github.com/Abban/jQuery-Picture
 *
 * Picturefill - Responsive Images that work today.
 * (and mimic the proposed Picture element with divs).
 * Author: Scott Jehl, Filament Group, 2012 | License: MIT/GPLv2.
 *
 *	This is a highly modified version of jQuery-Picture designed
 *	to work with MobileSiteOS figure or picture tag page code
 */

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.picture");
msos.require("msos.zoomify");
msos.require("jquery.tools.imagesloaded");
msos.require("msos.html5.matchmedia");
msos.require("msos.fitimgs");

msos.picture.version = new msos.set_version(13, 11, 6);


msos.picture.on_window_resize = function () {
	"use strict";

	if (jQuery('.zoomify_wrapper').length) { window.location.reload(); }
};

msos.picture.parse_attributes = function (tag_text) {
	"use strict";

	var attributes = [],
		attr = /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

	String(tag_text).replace(attr, function (match, name) {
		var value = arguments[2] || arguments[3] || arguments[4] || "";

		attributes.push({
			name: name,
			value: value,
			escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
		});
	});

	return attributes;
};

msos.picture.get_pixel_ratio = function ($elm) {
	"use strict";

	// You can add data-dpi attribute to force a paricular device pixel ratio
	// or use the one returned by device pixel ratio 'window.devicePixelRatio'
    var dpr = parseFloat($elm.data('dpr')) || 0;

    return (dpr > 0 && dpr <= 3) ? dpr : msos.config.pixel_ratio;
};


(function ($) {
	"use strict";

	var temp_jtp = 'msos.picture',
		count = 1,
		i18n = { click: "Click" };

	// If i18n is available, use it
	if (msos.i18n
	 && msos.i18n.common
	 && msos.i18n.common.bundle) { i18n = msos.i18n.common.bundle; }

	$.fn.reverse = [].reverse;
    $.fn.picture = function () {

		var conn_type = msos.config.connection.type;

        this.each(
			function () {

				var tag_name = this.tagName.toLowerCase(),
					$element = $(this),
					$clone,
					use_src = [],
					image_attrs = [],
					source_tag = tag_name === 'figure' ? 'span' : 'source',
					media_attr = tag_name === 'figure' ? 'data-media' : 'media',
					src_attr   = tag_name === 'figure' ? 'data-src' : 'src',
					noscript_txt = '',
					fstimage_txt = '',
					outimage_txt = '',
					fst_img_re = /<\s*img.*?>/i,
					elm_width = 0,
					par_width = 0,
					picture_width = 0,
					break_width = 0,
					pixel_ratio = 0,
					picture_id = this.id || 'msos_picture_' + count,
					src_folder_width = 0,
					breakpoints = [],
					size_spec = [],
					i = 0,
					idx = 0,
					debug_note = '',
					onclick_zoomify,
					onload_add_zoom;

				// A lot to just get the alt stuff, but it is done now...
				noscript_txt = $element.find('noscript').text() || '';

				fstimage_txt = noscript_txt.match(fst_img_re) || '<img src="" alt="" />';

				image_attrs = msos.picture.parse_attributes(fstimage_txt);

				// Make sure we have an id
				if (this.id !== picture_id) { this.id = picture_id; }

				// Width for <picture> may be 0 (since not valid HTML5 yet: so use parent)
				elm_width = $element.width() || $element.parent().width();
				par_width = $element.parent().width();

				// Use data-dpi if specified, or window.devicePixelRatio
				pixel_ratio = msos.picture.get_pixel_ratio($element);

				// Compensate for devicePixelRatio's > 1
				if (elm_width < par_width) {
                    picture_width = elm_width * pixel_ratio;
				} else {
					picture_width = par_width * pixel_ratio;
				}

				msos.console.debug(
					temp_jtp + ' -> start, id: ' + picture_id
				  + ', container w: ' + elm_width
				  + ', parent w: ' + par_width
				  + ', screen w:' + screen.width
				  + ', view port w: ' + msos.config.view_port.width
				  + ', devicePixelRatio w: ' + picture_width
				  + ', connection type: ' + conn_type
				);

				// Get the list of applicable image src's (via media query for each src)
				$element.find(source_tag).each(
					function () {
						var media = $(this).attr(media_attr);

						// Add the src if no media attribute (smallest default to use) or as determined by msos.html5.matchmedia
						if (!media || msos.html5.matchmedia.find(media).matches) {
							use_src.push($(this).attr(src_attr));
						}
					}
				);

				for (i = 0; i < use_src.length; i += 1) {
					size_spec = use_src[i].match(/\/([0-9]+)\//) || [];
					if (size_spec.length > 1) {
						src_folder_width = parseInt(size_spec[1] || 0);
						breakpoints.push(src_folder_width);
					}
				}

				if (msos.console.debug) {
					msos.console.debug(temp_jtp + ' -> breakpoints: ', breakpoints);
				}

				if (breakpoints.length > 0) {

					// Set the c variable to the most appropriate image folder designated width and record it's index
					$.each(
						breakpoints,
						function (i, v) {
							var select_width = picture_width * 1.1;		// use closest value within +10%
							if (parseInt(select_width) >= parseInt(v)) {
								break_width = v;
								idx = i;
							}
						}
					);

					debug_note = 'via breakpoints, for break width: ' + break_width;

				} else {
					// Use the largest applicable
					idx = use_src.length - 1;

					debug_note = 'via media query';
				}

				// Adjust for slow internet connection
				if (conn_type === 'slow')	{ idx = use_src[idx - 3] ? (idx - 3) : use_src[idx - 2] ? (idx - 2) : use_src[idx - 1] ? (idx - 1) : idx; }
				if (conn_type === '2g')		{ idx = use_src[idx - 2] ? (idx - 2) : use_src[idx - 1] ? (idx - 1) : idx; }
				if (conn_type === '3g')		{ idx = use_src[idx - 1] ? (idx - 1) : idx; }

				msos.console.debug(temp_jtp + ' -> ' + debug_note + ', src: ' + use_src[idx]);

				// Now generate our new img tag based on the media query available images and further refined for picture
				// actual width (if sized image file folders were used)
				outimage_txt += "<img";
				for (i = 1; i < image_attrs.length; i += 1) {	// start at [1] since tag is always first name/value pair
					if (image_attrs[i].name === 'src') {
						outimage_txt += " " + image_attrs[i].name + '="' + use_src[idx] + '"';
					} else {
						outimage_txt += " " + image_attrs[i].name + '="' + image_attrs[i].escaped + '"';
					}
				}
				outimage_txt += " />";

				$clone = $(outimage_txt);

				onclick_zoomify = function () {
					var $full_size = $($.trim(noscript_txt)),
						$fitimg_div = $clone.parent();

					msos.console.debug(temp_jtp + ' - onclick_zoomify -> start, id: ' + $clone.attr('id'));

					$full_size.addClass('zoomify_image');

					// Load full-size image, then manipulate the DOM
					$full_size.imagesLoaded(
						function () {
							$fitimg_div.replaceWith($full_size);
							$full_size.Zoomify();
							msos.console.debug(temp_jtp + ' - imagesLoaded - onclick_zoomify -> fired!');
						}
					);

					// Indicate something happened (add spinner in future)
					jQuery(this).remove();

					msos.console.debug(temp_jtp + ' - onclick_zoomify -> done!');
				};

				onload_add_zoom = function () {
					$clone.fitImgs();

					var $icon = $('<div  class="zoomify_icon">' + i18n.click + ' <i class="fa fa-search-plus"></i></div>');

					msos.console.debug(temp_jtp + ' - onload_add_zoom -> start, id: ' + $clone.attr('id'));

					// Add to our image fitimg div display
					$icon.appendTo($clone.parent());

					// Add click event to start fullsize image zoom utility
					$icon.click(onclick_zoomify);

					msos.console.debug(temp_jtp + ' - onload_add_zoom -> done!');
				};

				// When image loads, add zoomify code if data-zoom='zoom' was set
				if ($element.data('zoom')
				 && $element.data('zoom') === 'zoom')	{

					$clone.load(onload_add_zoom);

				// or just add the cloned, sized image and then add 'fitImgs' div image fitting
				} else {

					$clone.load(function () { $clone.fitImgs(); });
				}

				$clone.appendTo($element);

				// Advance for id
				count += 1;

				if (msos.config.verbose) {
					msos.console.debug(temp_jtp + ' -> done, applicable src\'s: ', use_src);
				} else {
					msos.console.debug(temp_jtp + ' -> done!');
				}
			}
		);
    };

}(jQuery));

// Reload page on resize if zoomify code has been added (throttled)
msos.onresize_functions.push(msos.picture.on_window_resize);
