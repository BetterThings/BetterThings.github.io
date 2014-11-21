// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.packery.jquery");
msos.require("jquery.tools.packery");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: jquery.html loaded!');

        function appendRandomSizedItems(container) {

            var frag = document.createDocumentFragment(),
                i = 0,
                item = null,
                w = 0,
                h = 0;

            for (i = 0; i < 35; i += 1) {
                item = document.createElement('div');
                item.className = 'item';
                w = Math.floor(Math.random() * Math.random() * 180) + 20;
                h = Math.floor(Math.random() * Math.random() * 180) + 20;
                item.style.width  = w + 'px';
                item.style.height = h + 'px';
                frag.appendChild(item);
            }

            container.appendChild(frag);
        }


        var $ex1 = jQuery('#ex1'),
            $ex2 = jQuery('#ex2'),
            $ex3 = jQuery('#ex3'),
            $ex6 = jQuery('#ex6'),
            $ex7 = jQuery('#ex7'),
            $elem = jQuery('#fit-demo');

        jQuery('.container').addClass(msos.config.size);

        $ex1.packery();

        appendRandomSizedItems($ex2[0]);
        $ex2.packery();

        appendRandomSizedItems($ex3[0]);
        $ex3.packery({
            columnWidth: 50,
            rowHeight: 50
        });

        jQuery('#ex4').packery();
        jQuery('#ex5').packery();

        appendRandomSizedItems($ex6[0]);
        $ex6.packery({
            itemSelector: '.item',
            stamp: '.bogey'
        });

        // ----- append and remove ----- //
        $ex7.packery();

        jQuery('#add-to-7').click(
            function () {
                var items = '',
                    i = 0,
                    wRand,
                    hRand,
                    widthClass,
                    heightClass,
                    className,
                    item,
                    $items;

                for (i = 0; i < 3; i += 1) {
                    wRand = Math.random();
                    widthClass = wRand > 0.85 ? 'w4' :
                    wRand > 0.7 ? 'w2' : '';
                    hRand = Math.random();
                    heightClass = hRand > 0.85 ? 'h4' :
                    hRand > 0.7 ? 'h2' : '';
                    className = 'item ' + widthClass + ' ' + heightClass;
                    item = '<div class="' + className + '"></div>';
                    items += item;
                }

                $items = jQuery(items);
                $ex7.append($items).packery('appended', $items);
            }
        );

        $ex7.on('click', '.item',
            function () {
                $ex7.packery('remove', this).packery();
            }
        );

        // ----- fit demo ----- //
        $elem.packery();

        $elem.packery('on', 'fitComplete',
            function (pckryInstance, item) {
                msos.console.info('Content: jquery.html -> fit was completed!');
        });

        $elem.on('click', '.item',
            function () {
                var $this = jQuery(this);
                if (!$this.hasClass('gigante')) {
                    $this.addClass('gigante');
                    $elem.packery('fit', this);
                } else {
                    $this.removeClass('gigante');
                    $elem.packery();
                }
            }
        );
    }
);