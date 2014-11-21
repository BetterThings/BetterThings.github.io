// Page specific js code

/*global
    msos: false,
    jQuery: false,
    Packery: false,
    eventie: false,
    classie: false
*/

msos.provide("demo.packery.basic");
msos.require("jquery.tools.packery");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: basic.html loaded!');

        function appendRandomSizedItems(contr) {

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

            contr.appendChild(frag);
        }

        jQuery('.container').addClass(msos.config.size);

        var ex1 = document.getElementById('ex1'),
            packery1,
            ex2 = document.getElementById('ex2'),
            packery2,
            ex3 = document.getElementById('ex3'),
            packery3,
            ex4 = document.getElementById('ex4'),
            packery4,
            ex5 = document.getElementById('ex5'),
            packery5,
            ex6 = document.getElementById('ex6'),
            packery6,
            container = document.querySelector('#fit-demo'),
            pckry;

        packery1 = new Packery(ex1);

        appendRandomSizedItems(ex2);
        packery2 = new Packery(ex2);

        appendRandomSizedItems(ex3);
        packery3 = new Packery(ex3, {
            columnWidth: 50,
            rowHeight: 50
        });

        packery4 = new Packery(ex4);
        packery5 = new Packery(ex5);

        appendRandomSizedItems(ex6);
        packery6 = new Packery(ex6, {
            itemSelector: '.item',
            stamp: ex6.querySelectorAll('.bogey')
        });

        // ----- fit demo ----- //
        pckry = new Packery(container);
        pckry.on(
            'fitComplete',
            function (pckryInstance, item) {
                msos.console.info('Content: basic.html -> fit was completed ', item);
            }
        );

        eventie.bind(
            container,
            'click',
            function (event) {
                // only care about item
                var elem = event.target;
                if (!classie.has(elem, 'item')) { return; }

                if (!classie.has(elem, 'gigante')) {
                     classie.add(elem, 'gigante');
                    pckry.fit(elem);
                } else {
                    classie.remove(elem, 'gigante');
                    pckry.layout();
                }
            }
        );
    }
);