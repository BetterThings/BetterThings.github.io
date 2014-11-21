// Page specific js code

/*global
    msos: false,
    jQuery: false,
    Packery: false
*/

msos.provide("demo.packery.origin");
msos.require("jquery.tools.packery");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: origin.html loaded!');

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

        jQuery('.container').addClass(msos.config.size);

        var pckry1 = new Packery(
                '#top-right',
                {
                    itemSelector: '.item',
                    stamp: '.stamp',
                    isOriginLeft: false
                }
            ),
            pckry2 = new Packery(
                '#bottom-left',
                {
                    itemSelector: '.item',
                    stamp: '.stamp',
                    isOriginTop: false
                }
            ),
            pckry3 = new Packery(
                '#bottom-right',
                {
                    itemSelector: '.item',
                    stamp: '.stamp',
                    isOriginLeft: false,
                    isOriginTop: false
                }
            ),
            itemElems = pckry3('getItemElements'),
            $itemElems = jQuery(itemElems).draggable();

        // get item elements and make them draggaable
        pckry3('bindUIDraggableEvents', $itemElems);
    }
);