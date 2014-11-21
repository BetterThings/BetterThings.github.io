// Page specific js code

/*global
    msos: false,
    jQuery: false,
    Modernizr: false
*/

msos.provide("demo.siteos.detect");
msos.require("msos.detection");
msos.require("msos.site.detect");
msos.require("msos.browser");


// Don't translate these...
msos.config.google.no_translate.by_id =
msos.config.google.no_translate.by_id.concat(
    ['#plugin_detect', '#user_agent', '#msos_detection', '#modernizr_detect', '#font_size_test']
);


msos.onload_functions.push(
    function () {
        "use strict";

        var browser_env = {},
            dump_out = '',
            answer = 'no response',
            uagent = navigator.userAgent,
            output = '',
            gen_detect_ul =   jQuery('<ul class="msos_list"><\/ul>'),
            msos_detect_ul =  jQuery('<ul class="msos_list"><\/ul>'),
            modzr_detect_ul = jQuery('<ul class="msos_list"><\/ul>'),
            view_size = {},
            props = '',
            kind = '',
            type = '',
            detect = '',
            root_page = /^[^?#]*\//.exec(location.href)[0],
            root_domain = /^\w+\:\/\/\/?[^\/]+/.exec(root_page)[0];

        function add_li_element(elem, str) {
            var new_li = jQuery('<li>').text(str);
            elem.append(new_li);
        }

        msos.console.info('Content: detect.html loaded!');

        // User Agent
        jQuery('#user_agent').html("<div style='bold'>" + uagent + "</div>");


        // Browser Environment
        output += '<ul class="msos_list">';
        output += '<li>MSOS Language : ' + msos.config.locale + '<\/li>';

        if (msos.browser.is.Browser)	        { answer = 'true';	}
        else				                    { answer = 'false';	}
        output += '<li>Client is a browser : '  + answer + '<\/li>';

        if (msos.config.browser.current)	    { answer = 'true';	}
        else				                    { answer = 'false';	}
        output += '<li>Browser is current : '   + answer + '<\/li>';

        if (msos.config.browser.editable)	    { answer = 'true';	}
        else				                    { answer = 'false';	}
        output += '<li>Browser is editable : '  + answer + '<\/li>';

        if (msos.config.browser.advanced)	    { answer = 'true';	}
        else				                    { answer = 'false';	}
        output += '<li>Browser is advanced : '  + answer + '<\/li>';

        if (msos.config.browser.mobile)         { answer = 'true';	}
        else				                    { answer = 'false';	}
        output += '<li>Browser is mobile : '    + answer + '<\/li>';

        if (msos.config.browser.touch)          { answer = 'true';	}
        else				                    { answer = 'false';	}
        output += '<li>Browser is touch : '     + answer + '<\/li>';

        if (msos.browser.is.FF)                 { answer = 'Ver. ' + msos.browser.is.FF;  }
        else                                    { answer = 'false';	}
        output += '<li>Browser is FF : '        + answer + '<\/li>';

        if (msos.browser.is.IE)                 { answer = 'Ver. ' + msos.browser.is.IE;  }
        else                                    { answer = 'false';	}
        output += '<li>Browser is MSIE : '      + answer + '<\/li>';

        if (msos.browser.is.Opera)              { answer = 'Ver. ' + msos.browser.is.Opera; }
        else                                    { answer = 'false';	}
        output += '<li>Browser is Opera : '     + answer + '<\/li>';

        if (msos.browser.is.Khtml)              { answer = 'Ver. ' + msos.browser.is.Khtml; }
        else                                    { answer = 'false';	}
        output += '<li>Browser is KHTML : '     + answer + '<\/li>';

        if (msos.browser.is.Safari)             { answer = 'Ver. ' + msos.browser.is.Safari; }
        else                                    { answer = 'false';	}
        output += '<li>Browser is Safari : '    + answer + '<\/li>';

        if (msos.browser.is.Mozilla)            { answer = 'Ver. ' + msos.browser.is.Mozilla; }
        else                                    { answer = 'false';	}
        output += '<li>Browser is Mozilla : '   + answer + '<\/li>';

        if (msos.browser.is.Chrome)             { answer = 'Ver. ' + msos.browser.is.Chrome; }
        else                                    { answer = 'false';	}
        output += '<li>Browser is Chrome : '    + answer + '<\/li>';

        if (msos.browser.is.WebKit)             { answer = 'Ver. ' + msos.browser.is.WebKit; }
        else                                    { answer = 'false';	}
        output += '<li>Browser is WebKit : '    + answer + '<\/li>';

        if (msos.browser.is.Quirks)             { answer = 'true';	}
        else                                    { answer = 'false';	}
        output += '<li>Quirks mode : '          + answer + '<\/li>';

        if (msos.browser.is.AIR)                { answer = 'true';	}
        else                                    { answer = 'false';	}
        output += '<li>Adobe Air : '            + answer + '<\/li>';

        output += '<\/ul>';

        jQuery('#browser_detection').html(output);


        // Plugin detection
        view_size = msos.config.view_port;

        add_li_element(gen_detect_ul, 'java : ' + navigator.javaEnabled());

        for (props in msos.detection.plugins) {
            add_li_element(gen_detect_ul, props + ' : ' + msos.detection.plugins[props]);
        }

        jQuery('#plugin_detect').append(gen_detect_ul);


        // Device specific detection;
        add_li_element(msos_detect_ul, 'view_port.height : ' + view_size.height);
        add_li_element(msos_detect_ul, 'view_port.width : '  + view_size.width);

        for (kind   in msos.config.file) {
            add_li_element(msos_detect_ul, 'file.' + kind + ' : '       + msos.config.file[kind]);
        }
        for (type   in msos.config.touch) {
            add_li_element(msos_detect_ul, 'touch.' + type + ' : '      + msos.config.touch[type]);
        }
        add_li_element(msos_detect_ul, 'orientation : '	+ msos.config.orientation);

        jQuery('#msos_detection').append(msos_detect_ul);


        // Modernizr output 
        for (detect in Modernizr) {
            if (typeof Modernizr[detect] === 'boolean') {
                add_li_element(modzr_detect_ul, 'Modernizr.' + detect + ' : ' + Modernizr[detect]);
            }
        }

        jQuery('#modernizr_detect').append(modzr_detect_ul);


        if (msos.debug) {
            // msos.site.detect bundles all user profile output
            browser_env = msos.site.detect.browser();
            dump_out = JSON.stringify(browser_env, null, '\t');
            setTimeout(function () { msos.debug.write(dump_out, true); }, 2000);
        }

        // Clean-up
        jQuery('#font_size_test').css('display', 'none');

        msos.console.info('Content: detect.html -> root_page: ' + root_page + ', root_domain: ' + root_domain);
    }
);