/*global jQuery */
/*!
* fitMedia ->   Based on same principles as FitVids 1.0 by Chris Coyier
*               http://css-tricks.com + Dave Rupert - http://daverupert.com
*               Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
*
*   modified for MobileSiteOS (and placed css in msos.css)
*/

msos.provide("msos.fitmedia");

msos.fitmedia.version = new msos.set_version(13, 6, 14);

// Need to look at latest FitVids.js file for possible improvements (9/16/2013)
(function ($) {
    "use strict";

    var temp_fm = 'msos.fitmedia -> ';

    $.fn.fitMedia = function () {

        msos.console.debug(temp_fm + 'start.');

        return this.each(function () {

            var $this = $(this),
                height = 0,
                width = 0,
                aspectRatio = 1,
                fitmedia_div;

            // Don't wrap an already wrapped element
            if (this.tagName.toLowerCase() === 'embed'
             && $this.parent('object').length
             || $this.parent('.fitmedia').length) {
                return;
            }

            height = (this.tagName.toLowerCase() === 'object' || ($this.attr('height') && !isNaN(parseInt($this.attr('height'), 10))))
                ? parseInt($this.attr('height'), 10)
                : $this.height();

            width = !isNaN(parseInt($this.attr('width'), 10))
                ? parseInt($this.attr('width'), 10)
                : $this.width();

            aspectRatio = height / width;

            fitmedia_div = jQuery('<div class="fitmedia" data-org_height="' + (height || 'na') + '" data-org_width="' + (width || 'na') + '"></div>');

            // Add padding as placeholder for video (maintain aspect ratio) 
            if ($this.prop('tagName').toLowerCase() !== 'audio') {
                fitmedia_div.css('padding-top', (aspectRatio * 100) + "%");
            }

            // Add an id if missing
            if (!$this.attr('id')) {
                $this.attr('id', 'fitmedia' + Math.floor(Math.random() * 999999));
            }

            // Wrap our media element
            $this.wrap(fitmedia_div);

            // Remove height/width attributes
            $this.removeAttr('height').removeAttr('width');

            msos.console.debug(temp_fm + 'done, id: ' + $this.attr('id') + ', h: ' + height + ', w: ' + width);
        });
    }

})(jQuery);