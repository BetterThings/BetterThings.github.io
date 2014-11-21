// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.siteos.textillate");
msos.require("jquery.effects.textillate");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: textillate.html loaded!');

        var animateClasses = 'flash bounce shake tada swing wobble pulse flip flipInX flipOutX flipInY flipOutY fadeIn fadeInUp fadeInDown fadeInLeft fadeInRight fadeInUpBig fadeInDownBig fadeInLeftBig fadeInRightBig fadeOut fadeOutUp fadeOutDown fadeOutLeft fadeOutRight fadeOutUpBig fadeOutDownBig fadeOutLeftBig fadeOutRightBig bounceIn bounceInDown bounceInUp bounceInLeft bounceInRight bounceOut bounceOutDown bounceOutUp bounceOutLeft bounceOutRight rotateIn rotateInDownLeft rotateInDownRight rotateInUpLeft rotateInUpRight rotateOut rotateOutDownLeft rotateOutDownRight rotateOutUpLeft rotateOutUpRight hinge rollIn rollOut';

        var $form = jQuery('.playground form'),
            $viewport = jQuery('.playground .viewport'),
            getFormData = function () {
                var data = { loop: true, in: {}, out: {} };

                $form.find('[data-key]').each(
                    function () {
                        var $this = jQuery(this),
                            key = $this.data('key'),
                            type = $this.data('type');

                        data[type][key] = $this.is(':checkbox') ? $this.is(':checked') : $this.val();
                    }
                );

                return data;
            };

        $.each(
            animateClasses.split(' '),
            function (i, value) {
                var type = '[data-type]',
                    option = '<option value="' + value + '">' + value + '</option>';

                if (/Out/.test(value) || value === 'hinge') {
                    type = '[data-type="out"]';
                } else if (/In/.test(value)) {
                    type = '[data-type="in"]';
                } 

                if (type) {
                    $form.find('[data-key="effect"]' + type).append(option);        
                }
            }
        );

        $form.find('[data-key="effect"][data-type="in"]').val('fadeInLeftBig');
        $form.find('[data-key="effect"][data-type="out"]').val('hinge');

        $('.textillate_demo p')
            .fitText(3.2, { maxFontSize: 18 })
            .textillate({ initialDelay: 1000, in: { delay: 3, shuffle: true } });

        setTimeout(
            function () {
                jQuery('.fade').addClass('in');
            },
            250
        );

        $form.on(
            'change',
            function () {
                var obj = getFormData();
                $viewport.find('.tlt').textillate(obj);
            }
        ).trigger('change');
    }
);