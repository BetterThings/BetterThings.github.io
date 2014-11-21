/*global jQuery */
/*!
* fitImgs ->    Based on same principle as FitVids 1.0 by Chris Coyier
*               http://css-tricks.com + Dave Rupert - http://daverupert.com
*               Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
*/

msos.provide("msos.fitimgs");

msos.fitimgs.version = new msos.set_version(13, 6, 14);


(function ($) {
    "use strict";

    $.fn.fitImgs = function () {

        return this.each(function () {

            var $this = $(this),
                height = ($this.attr('height') && !isNaN(parseInt($this.attr('height'), 10)))
                    ? parseInt($this.attr('height'), 10)
                    : $this.height(),
                width = !isNaN(parseInt($this.attr('width'), 10))
                    ? parseInt($this.attr('width'), 10)
                    : $this.width(),
                aspectRatio = height / width;

            if (!$this.attr('id')) { $this.attr('id', 'fitimg' + Math.floor(Math.random() * 999)); }

            $this.wrap('<div class="fitimg" data-org_img_height="' + (height || 'na') + '" data-org_img_width="' + (width || 'na') + '"></div>')
                .parent('.fitimg')
                .css('padding-top', (aspectRatio * 100) + "%");

            $this.removeAttr('height').removeAttr('width');
        });
    }

})(jQuery);