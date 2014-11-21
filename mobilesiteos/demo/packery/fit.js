// Page specific js code

/*global
    msos: false,
    jQuery: false,
    Packery: false,
    eventie: false,
    classie: false
*/

msos.provide("demo.packery.fit");
msos.require("jquery.tools.packery");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: fit.html loaded!');

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

        var container = document.querySelector('#expanding-demo'),
            pckry = new Packery(container);

        eventie.bind(
            container,
            'click',
            function (event) {
                // don't proceed if item was not clicked on
                var target = event.target,
                    isExpanded;

                if (!classie.has(target, 'item')) { return; }

                isExpanded = classie.has(target, 'is-expanded');
                classie.toggleClass(target, 'is-expanded');

                if (isExpanded) {
                    // if shrinking, just layout
                    pckry.layout();
                } else {
                    // if expanding, fit it
                    pckry.fit(target);
                }
            }
        );

        container = document.querySelector('#position-demo');
        pckry = new Packery(container);

        eventie.bind(
            container,
            'click',
            function (event) {
                // don't proceed if item was not clicked on
                var target = event.target;
                if (!classie.has(target, 'item')) { return; }
                // position item at 40, 40
                pckry.fit(target, 40, 40);
            }
        );
    }
);