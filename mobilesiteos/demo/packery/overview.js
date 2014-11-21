// Page specific js code

/*global
    msos: false,
    jQuery: false,
    Packery: false,
    classie: false
*/

msos.provide("demo.packery.overview");
msos.require("jquery.tools.packery");
msos.require("jquery.tools.draggabilly");

var PS = {};

msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: overview.html loaded!');

        (function (t) {
            "use strict";
            var e = t.PS;

            e.pages = {},
            e.getSomeItemElements = function () {
                for (var t = document.createDocumentFragment(), e = [], i = 0; 3 > i; i++) {
                    var n = document.createElement("div"),
                        o = Math.random(),
                        s = o > .85 ? "w4" : o > .7 ? "w2" : "",
                        r = Math.random(),
                        a = r > .85 ? "h4" : r > .7 ? "h2" : "";
                    n.className = "item " + s + " " + a, t.appendChild(n), e.push(n)
                }
            }
        }(window),

        function (t) {
            "use strict";

            function e(t) {
                var e = document.createElement("div"),
                    i = Math.random(),
                    n = i > .9 ? "w4" : i > .7 ? "w2" : "",
                    o = Math.random(),
                    s = o > .7 ? "h2" : "";
                return e.className = "item " + n + " " + s, t && (e.style.width = Math.round(110 * Math.random() * Math.random() + 20) + "px", e.style.height = Math.round(90 * Math.random() * Math.random() + 20) + "px"), e
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
        
                })(), function () {
                    var t = document.querySelector("#hero-demos .masonry .packery"),
                        e = new Packery(t, {
                            itemSelector: ".item",
                            columnWidth: ".grid-sizer"
                        });
                    n(e)
                }(), function () {
                    for (var t = document.querySelector(".ridiculous .packery"), i = document.createDocumentFragment(), o = 0; 12 > o; o++) {
                        var s = e(!0);
                        i.appendChild(s)
                    }
                    t.appendChild(i);
                    var r = new Packery(t, {
                        gutter: 4
                    });
                    n(r)
                }(), function () {
                    var t = document.querySelector(".meticulous .packery"),
                        e = new Packery(t, {
                            itemSelector: ".item",
                            columnWidth: ".grid-sizer",
                            rowHeight: 44
                        });
                    n(e)
                }(), function () {
                    var t = document.querySelector("#hero-demos .basically .packery"),
                        e = new Packery(t, {
                            rowHeight: 40,
                            gutter: 4
                        });
                    n(e)
                }()
            }
        }(window));

        // Let the above settle, then...
        msos.onload_func_post.push(window.PS.index);
    }
);


