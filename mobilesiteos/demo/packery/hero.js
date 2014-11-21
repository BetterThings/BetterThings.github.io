// Page specific js code

/*global
    msos: false,
    jQuery: false,
    Packery: false,
    classie: false
*/

msos.provide("demo.packery.hero");
msos.require("jquery.tools.packery");
msos.require("msos.size");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: hero.html loaded!');

        // Add display size selection to page
        msos.size.selection(jQuery('select#change_size'));
    }
);

var PS = {},
    packery_example;

packery_example = function () {
    "use strict";

    (function (t) {
        "use strict";
    
        function e(t) {
            var e = document.createElement("div"),
                i = Math.random(),
                n = i > .9 ? "w4" : i > .7 ? "w2" : "",
                o = Math.random(),
                s = o > .7 ? "h2" : "",
                default_base = 20;

                if (msos.config.size === 'tablet'
                 || msos.config.size === 'phone') { default_base = 5; }
                if (msos.config.size === 'medium'
                 || msos.config.size === 'small') { default_base = 10; }

            return e.className = "item " + n + " " + s, t && (e.style.width = Math.round(110 * Math.random() * Math.random() + default_base) + "px", e.style.height = Math.round(90 * Math.random() * Math.random() + default_base) + "px"), e
        }
        function i(t, n, o) {
            if (!(t.maxY > n)) {
                for (var s = document.createDocumentFragment(), r = [], a = 0; 4 > a; a++) {
                    var h = e(o);
                    r.push(h), s.appendChild(h)
                }
                return t.element.appendChild(s), t.appended(r), setTimeout(function () {
                    i(t, n, o)
                }, 40), r
            }
        }
        function n(t) {
            for (var e = t.getItemElements(), i = function (e) {
                    var i = e.dragPoint;
                    if (0 === i.x && 0 === i.y) {
                        var n = classie.has(e.element, "expanded");
                        classie.toggle(e.element, "expanded"), n ? t.layout() : (t.unstamp(e.element), t.fit(e.element))
                    }
                }, n = 0, o = e.length; o > n; n++) {
                var r = e[n],
                    a = new s(r);
                t.bindDraggabillyEvents(a), a.on("dragEnd", i)
            }
        }
        var o = t.PS,
            s = t.Draggabilly,
            r = document.defaultView,
            a = r && r.getComputedStyle ?
        function (t) {
            return r.getComputedStyle(t, null)
        } : function (t) {
            return t.currentStyle
        };
        o.index = function () {
            (function () {
                msos.console.info('Content: hero.html func index run for: ' + msos.config.size);

                // Remove any previous item div's (Only needed for size change on this page)
                jQuery('#hero > div.packery > div.item').remove();

                // Set size as class of containing element
                jQuery('#hero').removeClass().addClass(msos.config.size);

                var t = document.querySelector("#hero"),
                    e = t.querySelector(".packery"),
                    n = new Packery(e, {
                        itemSelector: ".item",
                        stamp: ".stamp",
                        gutter: 2,
                        containerStyle: null
                    });
                i(n, t.offsetHeight + 40, !0)
            })()
        }
    }(window));

    // Let the above settle, then...
   msos.onload_func_done.push(window.PS.index);

   // Add updating on display change (Only needed for size change on page demo)
   msos.ondisplay_size_change.push(window.PS.index);
};

// Run Packery example (first time)
msos.onload_functions.push(packery_example);

 