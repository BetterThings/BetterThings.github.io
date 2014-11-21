// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.hammer.events");


msos.onload_functions.push(
    function () {
        "use strict";

        var temp_hj = 'Content: events.html',
            log_elements = {},
            prevent_scroll_drag = true,
            prevent_browser_default = true,
            properties = [
                'gesture', 'center', 'deltaTime', 'angle', 'direction',
                'distance', 'deltaX', 'deltaY', 'velocityX', 'velocityY',
                'pointerType', 'scale', 'rotation', 'touches', 'target'
            ],
            all_events = [],
            $hitarea = jQuery('#hitarea');

        msos.console.info(temp_hj + ' loaded!');

        function getLogElement(type, name) {
            var el = log_elements[type + name];

            if (!el) {
                return log_elements[type + name] = msos.byid("log-"+ type +"-"+ name);
            }
            return el;
        }

        function logEvent(ev) {

            if (!ev.gesture) { return; }
        
            // add to the large event log at the bottom of the page
            var log = [this.id, ev.type],
                event_el = getLogElement('gesture', ev.type),
                i = 0,
                prop = '',
                value;

            event_el.className = "active";

            for (i = 0; i < properties.length; i += 1) {
                prop = properties[i];
                value = ev.gesture[prop];

                switch(prop) {
                    case 'center':
                        value = value.pageX + "x" + value.pageY;
                        break;
                    case 'gesture':
                        value = ev.type;
                        break;
                    case 'target':
                        value = ev.gesture.target.tagName;
                        break;
                    case 'touches':
                        value = ev.gesture.touches.length;
                        break;
                }
                getLogElement('prop', prop).innerHTML = value;
            }
        }

        // get all the events
        jQuery("#events-list li").each(
            function () {
                var li = jQuery(this),
                    type = li.text();

                li.attr("id", "log-gesture-" + type);
                all_events.push(type);
            }
        );

        $hitarea
            .hammer({
                prevent_default: prevent_browser_default,
                no_mouseevents: true
            })
            .on(all_events.join(" "), logEvent);

        jQuery("#prevent-default").click(
            function () {
                prevent_browser_default = this.checked;
            }
        );
    }
);