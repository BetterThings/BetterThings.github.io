// Page specific js code

/*global
    msos: false,
    jQuery: false,
    Hammer: false
*/

msos.provide("demo.hammer.pinchzoom");


msos.onload_functions.push(
    function () {
        "use strict";

        var temp_hj = 'Content: pinchzoom.html';

        msos.console.info(temp_hj + ' loaded!');

        var hammertime = Hammer(
                document.getElementById('pinchzoom'),
                {
                    transform_always_block: true,
                    transform_min_scale: 1,
                    drag_block_horizontal: true,
                    drag_block_vertical: true,
                    drag_min_distance: 0
                }
            ),
            rect = document.getElementById('rect'),
            posX = 0,
            posY = 0,
            scale = 1,
            last_scale,
            rotation = 1,
            last_rotation,
            transform = '';

        hammertime.on(
            'touch drag transform',
            function (ev) {
                switch(ev.type) {
                    case 'touch':
                        last_scale = scale;
                        last_rotation = rotation;
                        break;

                    case 'drag':
                        if (ev.gesture) {
                            posX = ev.gesture.deltaX;
                            posY = ev.gesture.deltaY;
                        }
                        break;

                    case 'transform':
                        rotation = last_rotation + ev.gesture.rotation;
                        scale = Math.max(1, Math.min(last_scale * ev.gesture.scale, 10));
                        break;
                }

                // transform!
                transform =
                    "translate3d(" + posX + "px," + posY + "px, 0) " +
                    "scale3d(" + scale + "," + scale + ", 0) " +
                    "rotate(" + rotation + "deg) ";

                rect.style.transform = transform;
                rect.style.oTransform = transform;
                rect.style.msTransform = transform;
                rect.style.mozTransform = transform;
                rect.style.webkitTransform = transform;
            }
        );
    }
);