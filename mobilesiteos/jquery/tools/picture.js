/**
 * jQuery Picture
 * http://jquerypicture.com
 * http://github.com/Abban/jQuery-Picture
 * 
 * May 2012
 * 
 * @version 0.9
 * @author Abban Dunne http://abandon.ie
 * @license MIT
 * 
 * jQuery Picture is a plugin to add support for responsive images to your layouts.
 * It supports both figure elements with some custom data attributes and the new
 * proposed picture format. This plugin will be made redundant when the format is
 * approved and implemented by browsers. Lets hope that happens soon. In the meantime
 * this plugin will be kept up to date with latest developments.
 *
 * Slightly modified for MobileSiteOS (11/2/2012):
 *
 *		This version is slightly simplified since we don't allow window resize to
 *		change the <div id="body"> tag size. We do it with a page refresh to a new
 *		size via javascript loaded css. This also allows for cookie tracking of
 *		page size.
 */

msos.provide("jquery.tools.picture");

jquery.tools.picture.version = new msos.set_version(13, 11, 6);


(function ($) {
	"use strict";

	var temp_jtp = 'jquery.tools.picture';

    $.fn.picture = function () {

        this.each(function () {

            var breakpoints = [],
				picture_width,
				currentMedia,
				$element,
				elm_width,
				par_width;

            $element = $(this);

			elm_width = $element.width() || $element.parent().width();	// width for <picture> may be 0 (since not valid HTML5 yet)
			par_width = $element.parent().width();

			if (msos.config.verbose) {
				msos.console.debug(temp_jtp + ' -> element w: ' + elm_width + ', parent w: ' + par_width);
			}

            function getCurrentMedia() {

				var c = 0;

				if ($element.get(0).tagName.toLowerCase() === 'figure') {

					var mediaObj = $element.data();

					$.each(
						mediaObj,
						function (media) {

							var num = media.replace(/[^\d.]/g, '');

							if (num) { breakpoints.push(num); }
						}
					);
				} else {

					$element.find('source').each(
						function () {

							var num,
								media = $(this).attr('media');

							if (media) {
								num = media.replace(/[^\d.]/g, '');
								breakpoints.push(num);
							}
						}
					);
				}

				if (elm_width < par_width) {
                    picture_width = elm_width * msos.config.pixel_ratio;
				} else {
					picture_width = par_width * msos.config.pixel_ratio;
				}

                // Set the c variable to the current media width
                $.each(
					breakpoints,
					function (i, v) {
						if (parseInt(picture_width) >= parseInt(v)
						 && parseInt(c) <= parseInt(v)) {
							c = v;
						}
					}
				);

                if (currentMedia !== c) {
                    currentMedia = c;

                    if ($element.get(0).tagName.toLowerCase() === 'figure')	{ setFigure();  }
                    else													{ setPicture(); }
                }
            }

            /**
             * setPicture
             * 
             * Pulls the image src and media attributes from the source tags and sets
             * the src of the enclosed img tag to the appropriate one.
             * 
             */
            function setPicture() {

                var sizes = new Object();

                $element.find('source').each(function () {

                    var media, path, num;
                    media = $(this).attr('media');
                    path = $(this).attr('src');

                    if (media) num = media.replace(/[^\d.]/g, '');
                    else num = 0;

                    sizes[num] = path;

                });

                if ($element.find('img').length == 0) {

                    var prep = '<img src="' + sizes[currentMedia] + '" style="' + $element.attr('style') + '" alt="' + $element.attr('alt') + '">';

                    if ($('>a', $element).length == 0) {

                        $element.append(prep);
                    } else {

                        $('>a', $element).append(prep);
                    }

                } else {

                    $element.find('img').attr('src', sizes[currentMedia]);
                }
            }

            /**
             * setFigure
             * 
             * Pulls the image src and and media values from the data attributes
             * and sets the src of the enclosed img tag to the appropriate one.
             * 
             */
            function setFigure() {

                var sizes = {},
					mediaObj = $element.data();

                $.each(
					mediaObj,
					function (media, path) {

						var num = media.replace(/[^\d.]/g, '');

						if (!num) {
							num = 0;
						}
						sizes[num] = path;
					}
				);

                if ($element.find('img').length === 0) {

                    var prep = '<img src="' + sizes[currentMedia] + '" alt="' + $element.attr('title') + '">';

                    if ($('>a', $element).length === 0) {
                        $element.append(prep);
                    } else {
                        $('>a', $element).append(prep);
                    }

                } else {
                    $element.find('img').attr('src', sizes[currentMedia]);
                }
            }

			// Initialise the images
            getCurrentMedia();
        });
    };

})(jQuery);