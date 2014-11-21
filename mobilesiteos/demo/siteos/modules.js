// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.siteos.modules");
msos.require("msos.page");


// Load MSOS modules (to the extreme!)
msos.require("bootstrap.affix");
msos.require("bootstrap.alert");
msos.require("bootstrap.blockquote");
msos.require("bootstrap.button");
msos.require("bootstrap.carousel");
msos.require("bootstrap.collapse");
msos.require("bootstrap.dropdown");
msos.require("bootstrap.dropdownV3");
msos.require("bootstrap.form");
msos.require("bootstrap.inputgroup");
msos.require("bootstrap.jumbotron");
msos.require("bootstrap.labels");
msos.require("bootstrap.listgroup");
msos.require("bootstrap.media");
msos.require("bootstrap.modal");
msos.require("bootstrap.navbar");
msos.require("bootstrap.navigation");
msos.require("bootstrap.pager");
msos.require("bootstrap.pagination");
msos.require("bootstrap.panel");
msos.require("bootstrap.popover");
msos.require("bootstrap.print");
msos.require("bootstrap.progress");
msos.require("bootstrap.responsive");
msos.require("bootstrap.scrollspy");
msos.require("bootstrap.tab");
msos.require("bootstrap.table");
msos.require("bootstrap.thumbnail");
msos.require("bootstrap.tooltip");
msos.require("bootstrap.transition");
msos.require("bootstrap.typeahead");
msos.require("bootstrap.visible");
msos.require("jquery.effects.animo");
msos.require("jquery.effects.blind");
msos.require("jquery.effects.bounce");
msos.require("jquery.effects.clip");
msos.require("jquery.effects.drop");
msos.require("jquery.effects.explode");
msos.require("jquery.effects.fade");
msos.require("jquery.effects.fold");
msos.require("jquery.effects.highlight");
msos.require("jquery.effects.pulsate");
msos.require("jquery.effects.scale");
msos.require("jquery.effects.shake");
msos.require("jquery.effects.slide");
msos.require("jquery.effects.textillate");
msos.require("jquery.effects.transfer");
msos.require("jquery.tools.actual");
msos.require("jquery.tools.attributes");
msos.require("jquery.tools.autocomplete");
msos.require("jquery.tools.cookie");
msos.require("jquery.tools.draggabilly");
msos.require("jquery.tools.equalize");
msos.require("jquery.tools.flogin");
msos.require("jquery.tools.flowtype");
msos.require("jquery.tools.formobject");
msos.require("jquery.tools.imagesloaded");
msos.require("jquery.tools.lettering");
msos.require("jquery.tools.mousehold");
msos.require("jquery.tools.mousepress");
msos.require("jquery.tools.mousewheel");
msos.require("jquery.tools.packery");
msos.require("jquery.tools.panzoom");
msos.require("jquery.tools.payment");
msos.require("jquery.tools.picture");
msos.require("jquery.tools.range");
msos.require("jquery.tools.slidepanel");
msos.require("jquery.tools.timeago");
msos.require("jquery.tools.validate");
msos.require("jquery.tools.validation");
msos.require("jquery.tools.xml2json");
msos.require("jquery.touch.hammer");
msos.require("jquery.touch.scrollbar");
msos.require("jquery.touch.sly");
msos.require("jquery.touch.toe");
msos.require("jquery.ui.accordion");
msos.require("jquery.ui.addplaceholder");
msos.require("jquery.ui.autocomplete");
msos.require("jquery.ui.button");
msos.require("jquery.ui.datepicker");
msos.require("jquery.ui.datetimepicker");
msos.require("jquery.ui.dialog");
msos.require("jquery.ui.droppable");
msos.require("jquery.ui.menu");
msos.require("jquery.ui.placeholder");
msos.require("jquery.ui.progressbar");
msos.require("jquery.ui.resizable");
msos.require("jquery.ui.selectable");
msos.require("jquery.ui.slider");
msos.require("jquery.ui.sortable");
msos.require("jquery.ui.spinner");
msos.require("jquery.ui.tabs");
msos.require("jquery.ui.timepicker");
msos.require("jquery.ui.tooltip");
msos.require("jquery.ui.touch");
msos.require("msos.ajax");
msos.require("msos.auto");
msos.require("msos.base64");
msos.require("msos.browser");
msos.require("msos.calendar");
msos.require("msos.calendar.config");
msos.require("msos.colortool");
msos.require("msos.colortool.calc");
msos.require("msos.common");
msos.require("msos.countrystate");
msos.require("msos.d8");
msos.require("msos.date");
msos.require("msos.date.locale");
msos.require("msos.debug");
msos.require("msos.debugform");
msos.require("msos.detection");
msos.require("msos.detect.insert");
msos.require("msos.dhtml");
msos.require("msos.diacritic");
msos.require("msos.dot");
msos.require("msos.fitimgs");
msos.require("msos.fitmedia");
msos.require("msos.form2js");
msos.require("msos.geo");
msos.require("msos.geolocation");
msos.require("msos.google.ad");
msos.require("msos.google.maps");
msos.require("msos.html5.color");
msos.require("msos.html5.date");
msos.require("msos.html5.es5.sham");
msos.require("msos.html5.es5.shim");
msos.require("msos.html5.geolocation");
msos.require("msos.html5.matchmedia");
msos.require("msos.html5.number");
msos.require("msos.html5.range");
msos.require("msos.html5.sql");
msos.require("msos.i18n");
msos.require("msos.iframe");
msos.require("msos.ify");
msos.require("msos.infinitedrag");
msos.require("msos.input.select");
msos.require("msos.input.text");
msos.require("msos.intl");
msos.require("msos.jgmap");
msos.require("msos.js2form");
msos.require("msos.jscroll");
msos.require("msos.json.check");
msos.require("msos.keyboard");
msos.require("msos.latlon");
msos.require("msos.maptile");
msos.require("msos.mbp.ios");
msos.require("msos.md5");
msos.require("msos.mobile");
msos.require("msos.numberctrl");
msos.require("msos.onerror");
msos.require("msos.overflowscroll");
msos.require("msos.picture");
msos.require("msos.popdiv");
msos.require("msos.popwin");
msos.require("msos.popwindesktop");
msos.require("msos.position");
msos.require("msos.pyromane");
msos.require("msos.sdmenu");
msos.require("msos.selection");
msos.require("msos.site.detect");
msos.require("msos.size");
msos.require("msos.social.facebook");
msos.require("msos.social.googleplus");
msos.require("msos.social.twitter");
msos.require("msos.stickup");
msos.require("msos.style");
msos.require("msos.syntaxhighlighter");
msos.require("msos.tab");
msos.require("msos.tools.kbdpos");
msos.require("msos.touch.tap");
msos.require("msos.translate");
msos.require("msos.visualevent");
msos.require("msos.xml.prettify");
msos.require("msos.zoomify");

msos.onload_func_done.push(
    function () {
        "use strict";

        msos.console.info('Content: modules.html loaded!');

        var module_loaded = function() {
            var html_array = [],
                output_array = [],
                output1 = '',
                output2 = '',
                mod_id = '',
                module_name = '',
                module_obj,
                chunks = function (array, size) {
                    var results = [];
                    while (array.length) {
                        results.push(array.splice(0, size));
                    }
                    return results;
                };

            jQuery('#results1').empty();
            jQuery('#results2').empty();

            for (mod_id in msos.registered_modules) {

                module_name = mod_id.replace(/_/g, '.');

                module_obj = msos.gen_namespace(module_name);

                if (msos.registered_modules[mod_id]) {
                    html_array.push('<li>' + module_name + " " + (module_obj.version ? module_obj.version.toString() : '') + " <span style='color: green;' class='fa fa-thumbs-o-up'></span></li>");
                } else {
                    html_array.push('<li>' + module_name + " <span style='color: red;' class='fa fa-thumbs-o-down'></span></li>");
                }
            }

            output_array = chunks(html_array, parseInt(html_array.length / 2, 10));

            output1 = output_array[0].join("\n");
            output2 = output_array[1].join("\n");

            jQuery('#results1').append(output1);
            jQuery('#results2').append(output2);

            jQuery('#status').html('<span style="color:green;">Loading done!</span>');

            // Special case for modules.js & modules.html. We need to reload "base page" and then new content
            msos.page.reset = true;
        };

        setTimeout(module_loaded, 1000);
    }
);