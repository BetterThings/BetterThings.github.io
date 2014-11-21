// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.payment");
msos.require("jquery.tools.payment");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: payment.html loaded!');

        $('[data-numeric]').payment('restrictNumeric');
            $('.cc-number').payment('formatCardNumber');
               $('.cc-exp').payment('formatCardExpiry');
               $('.cc-cvc').payment('formatCardCVC');

        $('form').submit(
            function (e) {
                msos.do_nothing(e);
                $('input').removeClass('invalid');
                $('.validation').removeClass('passed failed');

                var cardType = $.payment.cardType($('.cc-number').val());

                $('.cc-number').toggleClass('invalid', !$.payment.validateCardNumber($('.cc-number').val()));
                   $('.cc-exp').toggleClass('invalid', !$.payment.validateCardExpiry($('.cc-exp').payment('cardExpiryVal')));
                   $('.cc-cvc').toggleClass('invalid', !$.payment.validateCardCVC($('.cc-cvc').val(), cardType));

                if ( $('input.invalid').length )    { $('.validation').addClass('failed'); }
                else                                { $('.validation').addClass('passed'); }
            }
        );
    }
);