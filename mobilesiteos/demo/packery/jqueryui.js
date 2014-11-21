// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.packery.jqueryui");
msos.require("jquery.tools.packery");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: jqueryui.html loaded!');

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

        // ----- grid ----- //
        var $ex4 = jQuery('#ex4'),
            $ex6 = jQuery('#ex6'),
            itemElems,
            $itemElems;

        jQuery('.container').addClass(msos.config.size);

        $ex4.packery({
            columnWidth: 50,
            rowHeight: 50,
            transitionDuration: '0.6s'
        });

        // get item elements and make them draggaable
        itemElems = $ex4.packery('getItemElements');
        $itemElems = jQuery(itemElems).draggable();

        function orderItems() {
            var itemElems = $ex4.packery('getItemElements');

            jQuery(itemElems).each(
                function (i, elem) { jQuery(elem).text(i + 1); }
            );
        }

        $ex4.packery('bindUIDraggableEvents', $itemElems);

        $ex4.packery('on', 'dragItemPositioned',    orderItems);
        $ex4.packery('on', 'layoutComplete',        orderItems);

        // ----- random sized ----- //
        appendRandomSizedItems($ex6[0]);

        $ex6.packery({
            itemSelector: '.item',
            transitionDuration: '1.6s'
        });

        // get item elements and make them draggaable
        itemElems = $ex6.packery('getItemElements');
        $itemElems = jQuery(itemElems).draggable();
        $ex6.packery('bindUIDraggableEvents', $itemElems);
    }
);