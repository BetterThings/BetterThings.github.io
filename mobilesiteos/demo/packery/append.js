// Page specific js code

/*global
    msos: false,
    jQuery: false,
    Packery: false,
    classie: false    
*/

msos.provide("demo.packery.append");
msos.require("jquery.tools.packery");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: addremove.html loaded!');

        jQuery('.container').addClass(msos.config.size);

        var container =     document.querySelector('.container'),
            appendButton =  document.querySelector('#append'),
            prependButton = document.querySelector('#prepend'),
            pckry = new Packery(container);

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

        function getItemFragment() {

            var fragment = document.createDocumentFragment(),
                items = [],
                i = 0,
                item,
                wRand,
                hRand,
                widthClass,
                heightClass;

            for (i = 0; i < 3; i += 1) {
                item = document.createElement('div');
                wRand = Math.random();
                widthClass = wRand > 0.85 ? 'w4' :
                wRand > 0.7 ? 'w2' : '';
                hRand = Math.random();
                heightClass = hRand > 0.85 ? 'h4' :
                hRand > 0.7 ? 'h2' : '';
                item.className = 'item ' + widthClass + ' ' + heightClass;
                fragment.appendChild(item);
                items.push(item);
            }

            return {
                items: items,
                fragment: fragment
            };
        }

        appendButton.addEventListener(
            'click',
            function (event) {
                var itemFrag = getItemFragment();
                container.appendChild(itemFrag.fragment);
                pckry.appended(itemFrag.items);
            }
        );

        prependButton.addEventListener(
            'click',
            function (event) {
                var itemFrag = getItemFragment();
                container.insertBefore(itemFrag.fragment, container.firstChild);
                pckry.prepended(itemFrag.items);
            }
        );

        container.addEventListener(
            'click',
            function (event) {
                var elem = event.target;
                if (!classie.has(elem, 'item')) { return; }

                pckry.remove(elem);
                pckry.layout();
            }
        );
    }
);