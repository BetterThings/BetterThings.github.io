// Copyright Notice:
//			    tools/kbdpos.js
//			 Copyright©2010-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*
	OpenSiteMobile on-screen keyboard key position calculator tool
	Used to generate/set key div height, width values for new keyboard size spec's.
	(Not really intended for general use! Outputs key div's position css spec's.)
*/

msos.provide("msos.tools.kbdpos");

msos.tools.kbdpos.version = new msos.set_version(13, 6, 14);


msos.tools.kbdpos.output_css = '';

msos.tools.kbdpos.calc = function (keyboard_obj) {

    var temp_mod = 'msos.tools.kbpos.calc -> ',
        css_output_text = '',
        key_position = { left: 1, top: 1 },		// start at one down, one over inside display div
        char_keys = keyboard_obj.character_keys,
        ctrl_keys = keyboard_obj.control_keys,
        i = 0,
        set_key_postion = function (div_input, el_id) {
            var div_top  = String(key_position.top)  + 'px',
                div_left = String(key_position.left) + 'px';

            if (div_input instanceof HTMLElement) {
                div_input.style.top  = div_top;
                div_input.style.left = div_left;
                css_output_text += 'div#' + div_input.id + "\t{ top:" + div_top + '; ' + 'left:' + div_left + ";\t}\n";
            } else {
                msos.console.error(temp_mod + 'failed, missing dom element for: ' + el_id);
            }
        };

    msos.console.debug(temp_mod + 'start, keyboard object: ', keyboard_obj);

    if (!char_keys.length > 0) {
        msos.console.error(temp_mod + 'failed, missing: character_keys array');
        return;
    }

    if (!ctrl_keys) {
        msos.console.error(temp_mod + 'failed, missing: control_keys object');
        return;
    }

    // 1st row (numbers)
    for (i; i < 13; i++) {
        set_key_postion(char_keys[i], i);
        key_position.left += char_keys[i].offsetWidth + 1;
    }

    msos.console.debug(temp_mod + 'characters 0-' + (i - 1) + ' done.');

    set_key_postion(ctrl_keys["backsp"], "backsp");
    key_position.top  = char_keys[0].offsetHeight + 2;
    key_position.left = 1;

    // 2nd row (alphabet)
    set_key_postion(ctrl_keys["tab"], "tab");
    key_position.left += ctrl_keys["tab"].offsetWidth + 1;

    msos.console.debug(temp_mod + 'backspace, tab done.');

    for (i; i < 26; i++) {
        set_key_postion(char_keys[i], i);
        key_position.left += char_keys[i].offsetWidth + 1;
    }

    msos.console.debug(temp_mod + 'characters 13-' + (i - 1) + ' done.');

    set_key_postion(ctrl_keys["extra"], "extra");
    key_position.top  = char_keys[0].offsetHeight + ctrl_keys["tab"].offsetHeight + 3;
    key_position.left = 1;

    // Home row:
    set_key_postion(ctrl_keys["caps"], "caps");
    key_position.left += ctrl_keys["caps"].offsetWidth + 1;

    msos.console.debug(temp_mod + 'extra, caps done.');

    for (i; i < 38; i++) {
        set_key_postion(char_keys[i], i);
        key_position.left += char_keys[i].offsetWidth + 1;
    }

    msos.console.debug(temp_mod + 'characters 26-' + (i - 1) + ' done.');

    set_key_postion(ctrl_keys["enter"], "enter");
    key_position.top  = char_keys[0].offsetHeight + ctrl_keys["tab"].offsetHeight + ctrl_keys["caps"].offsetHeight + 4;
    key_position.left = 1;

    msos.console.debug(temp_mod + 'enter done.');

    // Shift row
    set_key_postion(ctrl_keys["shiftl"], "shiftl");
    key_position.left += ctrl_keys["shiftl"].offsetWidth + 1;

    msos.console.debug(temp_mod + 'shift (left) done.');

    for (i; i < 48; i++) {
        set_key_postion(char_keys[i], i);
        key_position.left += char_keys[i].offsetWidth + 1;
    }

    msos.console.debug(temp_mod + 'characters 38-' + (i - 1) + ' done.');

    set_key_postion(ctrl_keys["shiftr"], "shiftr");
    key_position.top  = char_keys[0].offsetHeight + ctrl_keys["tab"].offsetHeight + ctrl_keys["caps"].offsetHeight + ctrl_keys["shiftl"].offsetHeight + 5;
    key_position.left = 1;

    msos.console.debug(temp_mod + 'shift (right) done.');

    // Bottom row
    set_key_postion(ctrl_keys["langprv"], "langprv");
    key_position.left += ctrl_keys["langprv"].offsetWidth + 1;

    set_key_postion(ctrl_keys["langcrt"], "langcrt");
    key_position.left += ctrl_keys["langcrt"].offsetWidth + 1;

    set_key_postion(ctrl_keys["langnxt"], "langnxt");
    key_position.left += ctrl_keys["langnxt"].offsetWidth + 1;

    msos.console.debug(temp_mod + 'language previous, current and next done.');

    set_key_postion(ctrl_keys["space"], "space");
    key_position.left += ctrl_keys["space"].offsetWidth + 1;

    set_key_postion(ctrl_keys["del"], "del");
    key_position.left += ctrl_keys["del"].offsetWidth + 1;

    set_key_postion(ctrl_keys["alt"], "alt");
    key_position.left += ctrl_keys["alt"].offsetWidth + 1;

    set_key_postion(ctrl_keys["open2"], "open2");

    msos.console.debug(temp_mod + 'done!');

    msos.tools.kbdpos.output_css = css_output_text;
};
