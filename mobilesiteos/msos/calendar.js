// Copyright Notice:
//				    calendar.js
//			Copyright©2010-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile calendar

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.calendar");
msos.require("msos.calendar.config");
msos.require("msos.i18n.calendar");
msos.require("msos.common");
msos.require("msos.date");
msos.require("msos.date.locale");
msos.require("msos.popdiv");

msos.calendar.version = new msos.set_version(14, 3, 25);


// Start by loading our calendar specific stylesheet
msos.calendar.css = new msos.loader();
msos.calendar.css.load('pop_calendar_css', msos.resource_url('css', 'pop_calendar.css'));

// Use msos.i18n and not Google Web Translate
msos.config.google.no_translate.by_id.push('#calendar_container');

msos.calendar.create_tool = function () {
    "use strict";

    var temp_tool = 'msos.calendar.create_tool',
        calendar_name = 'msos_calendar',
        config = new msos.calendar.config.create(),
        current = new Date(),
        set_target_focus = null,
        reset_target_elm = null,
        input_ondblclick = null,
        input_onfocus = null,
        input_onblur = null,
        cal_object = this;

    msos.console.debug(temp_tool + ' -> start.');

    // Create our standard 'tool' parameters
    this.tool_name = calendar_name;
    this.tool_target = null;
    this.tool_iframe = null;
    this.tool_created = false;
    this.tool_on_success = [];
    this.tool_on_complete = [];
    this.tool_load_url = '';
    this.tool_loaded_url = '';
    this.tool_popup = new msos.popdiv.create_tool(
        calendar_name, // Tracking cookie name
        '_cal', // Extension used for 'css/size/' file specification
        msos.resource_url('css', 'size'),
        msos.byid("calendar_container"),
        msos.byid("calendar_header"),
        msos.byid("calendar_close"),
        msos.byid("calendar_display"),
        {
            of: jQuery('#body'),
            my: 'left top',
            at: 'left+20 top+120',
            collision: 'none'
        }, // Calendar position settings
        msos.i18n.calendar.bundle
    );

    this.i18n = msos.i18n.calendar.bundle;
    this.cal_inp_arry = [];
    this.cal_inp_min = null,
    this.cal_inp_max = null,
    this.cal_contain = msos.byid("calendar_container");
    this.cal_header = msos.byid("calendar_header");
    this.cal_close = msos.byid("calendar_close");
    this.cal_ctrl = msos.byid("calendar_control");
    this.cal_footer = msos.byid("calendar_footer");
    this.cal_display = msos.byid("calendar_display");
    this.cal_cfg = config;

    // Set some date variables
    this.curr_date = current.getDate();
    this.curr_mon = current.getMonth();
    this.curr_year = current.getFullYear();
    this.cal_date = null;
    this.cal_year = null;
    this.cal_month = null;

    this.focus_value = '';

    // Default example 'on completion' function. Specify your own in web page or alt. javascript
    this.on_complete_func = function () {
        msos.console.debug(temp_tool + ' - on_complete_func -> ' + this.i18n.input_complete);
    };

    // Generate day, month name arrays
    this.mon_name = msos.date.locale.getNames(config.calendar_type, 'months', 'wide', 'standAlone');
    this.long_day = msos.date.locale.getNames(config.calendar_type, 'days', 'wide', 'standAlone');
    this.shrt_day = msos.date.locale.getNames(config.calendar_type, 'days', 'narrow', 'standAlone');
    this.abbr_day = msos.date.locale.getNames(config.calendar_type, 'days', 'abbr', 'standAlone');
    this.first_dow = msos.date.getFirstDayOfWeek(msos.config.locale);

    this.example_date = function () {
        msos.console.debug(temp_tool + ' - example_date -> start.');

        var example = msos.date.locale.format(config.calendar_type, new Date(), config.std_in_out_date_format),
            k = 0;

        for (k = 0; k < config.alt_input_date_formats.length; k += 1) {
            example += ' | ' + msos.date.locale.format(config.calendar_type, new Date(), config.alt_input_date_formats[k]);
        }
        msos.console.debug(temp_tool + ' - example_date -> done, example: ' + example);
        return example;
    };

    this.generate_date = function (year, mon, day) {
        msos.console.debug(temp_tool + ' - generate_date -> called for: ' + year + '-' + mon + '-' + day);
        return msos.date.locale.format(config.calendar_type, new Date(year, mon, day), config.std_in_out_date_format);
    };

    this.set_input_min_max = function () {
        this.cal_inp_min = this.tool_target.min_date || this.cal_cfg.cal_bot_date;
        this.cal_inp_max = this.tool_target.max_date || this.cal_cfg.cal_top_date;
    };

    // --------------------------
    // Event Functions
    // --------------------------

    set_target_focus = function (caller) {
        if (msos.config.verbose) {
            msos.console.debug(temp_tool + ' - set_target_focus -> called by: ' + caller);
        }
        if (!msos.config.mobile) {
            cal_object.tool_target.focus();
        } else {
            if (msos.config.verbose) {
                msos.console.debug(temp_tool + ' - set_target_focus -> suppressed focus for mobile.');
            }
        }
        cal_object.tool_target.select();
    };

    reset_target_elm = function (target_elm) {
        cal_object.tool_target = target_elm || null;
        cal_object.focus_value = (target_elm && target_elm.value) ? target_elm.value : '';
        cal_object.cal_date = null;
        cal_object.cal_year = null;
        cal_object.cal_month = null;
    };

    this.cal_button_click = function () {

        msos.console.debug(temp_tool + ' - cal_button_click -> start.');

        if (!cal_object.tool_target) {
            reset_target_elm(cal_object.cal_inp_arry[0]);
        } else {
            reset_target_elm(cal_object.tool_target);
        }

        // If already open, close it
        if (cal_object.tool_popup.container.style.visibility === 'visible') {
            cal_object.tool_popup.hide_popdiv();
            set_target_focus('cal_button_click 1');
            return false;
        }

        cal_object.set_input_min_max();

        // If input date can't be read, delete (mobile) or set focus and select it
        if (!cal_object.get_input_date(cal_object.tool_target.value)) {
            if (msos.config.mobile) {
                cal_object.tool_target.value = '';
            } else {
                set_target_focus('cal_button_click 2');
            }
            return false;
        }

        cal_object.new_display(cal_object.cal_year, cal_object.cal_month);

        // Now display new calendar
        cal_object.tool_popup.display_popdiv();

        set_target_focus('cal_button_click 3');

        msos.console.debug(temp_tool + ' - cal_button_click -> done!');
        return true;
    };

    input_ondblclick = function (evt) {
        msos.do_nothing(evt);

        // Set the (new) target
        reset_target_elm(evt.target);

        cal_object.set_input_min_max();

        // If input date can't be read, set focus and select it
        if (!cal_object.get_input_date(cal_object.tool_target.value)) {
            set_target_focus('input_ondblclick');
            return false;
        }

        cal_object.new_display(cal_object.cal_year, cal_object.cal_month);

        // Now display new calendar
        cal_object.tool_popup.display_popdiv();

        if (msos.debug) {
            msos.debug.event(evt, "\n" + temp_tool + " - input_ondblclick,\n\tvalue = " + cal_object.focus_value);
        }

        set_target_focus('input_ondblclick');
        return true;
    };

    input_onfocus = function (evt) {
        msos.do_nothing(evt);

        // Set the (new) target
        reset_target_elm(evt.target);

        if (msos.debug) {
            msos.debug.event(evt, "\n" + temp_tool + " - input_onfocus,\n\tvalue = " + cal_object.focus_value);
        }

        return false;
    };

    input_onblur = function (evt) {
        if (msos.debug) {
            msos.debug.event(evt, "\n" + temp_tool + " - input_onblur");
        }
        // Check to see if value changed?
        if (cal_object.tool_target.value !== cal_object.focus_value) {
            if (!cal_object.get_input_date(cal_object.tool_target.value)) {
                // focus() must be delayed to work in Netscape, Mozilla
                setTimeout(function () {
                    set_target_focus('input_onblur');
                }, 100);
                return false;
            }
            // Value changed but checked out ok, so execute our on complete function
            if (cal_object.cal_cfg.exec_on_complete) {
                cal_object.on_complete_func();
            }
        }
        return true;
    };

    this.cal_register_input = function (elm) {

        cal_object.cal_inp_arry.push(elm);

        // Add our input example title here...
        elm.title = cal_object.i18n.input_format_msg + ' ' + cal_object.example_date();

        // Add standard input element event actions
        jQuery(elm).focus(input_onfocus);
        jQuery(elm).blur(input_onblur);
        jQuery(elm).dblclick(input_ondblclick);
    };

    // Set body onclick event, if 'close_on_body_click' set to true 
    if (this.cal_cfg.close_on_body_click === true) {
        jQuery('#body').click(cal_object.tool_popup.popup_auto_hide);
    }

    msos.console.debug(temp_tool + ' -> done!');
};


// --------------------------
// Calendar Creation Functions
// --------------------------
msos.calendar.create_tool.prototype.new_display = function (y, m) {
    "use strict";

    var temp_text = 'msos.calendar.create_tool.new_display -> ',
        start_day = this.first_dow,
        start_month = new Date(y, m, 1).getDay(),
        prior_month = m - 1,
        next_month = m + 1,
        prior_year = y - 1,
        next_year = y + 1,
        prior_month_year = y,
        next_month_year = y,
        cal_object = this;

    msos.console.debug(temp_text + 'for: year -> ' + y + ', month -> ' + m);

    // Clear out the previous calendar diplay
    this.cal_ctrl.innerHTML = "";
    this.cal_footer.innerHTML = "";
    this.cal_display.innerHTML = "";

    // Adjust for + or - year
    if (prior_month === -1) {
        prior_month = 11;
        prior_month_year -= 1;
    }
    if (next_month === 12) {
        next_month = 0;
        next_month_year += 1;
    }

    // Get last day of m-1, then generate month limits
    var pr_mon_obj = new Date(prior_month_year, prior_month, 1),
        p_mon_last = msos.date.getDaysInMonth(pr_mon_obj),
        n_mon_limit = new Date(next_month_year, next_month, 1),
        p_mon_limit = new Date(prior_month_year, prior_month, p_mon_last),
        // Get last day of y-1, then generate year limits
        pr_year_obj = new Date(prior_year, m, 1),
        p_yr_last = msos.date.getDaysInMonth(pr_year_obj),
        n_yr_limit = new Date(next_year, m, 1),
        p_yr_limit = new Date(prior_year, m, p_yr_last),
        show_next_mon = 'no',
        show_prior_mon = 'no',
        show_next_year = 'no',
        show_prior_year = 'no',
        mon_table = document.createElement("table"),
        mon_span = null,
        pr_mon = null,
        mon_cent_span = null,
        nt_mon = null,
        th_title = this.mon_name[m] + ' ' + y;

    if (!this.cal_inp_max || (this.cal_inp_max && this.cal_inp_max > n_mon_limit)) {
        show_next_mon = 'yes';
    }
    if (!this.cal_inp_min || (this.cal_inp_min && this.cal_inp_min < p_mon_limit)) {
        show_prior_mon = 'yes';
    }
    if (show_next_mon === 'yes' && (this.cal_inp_max > n_yr_limit)) {
        show_next_year = 'yes';
    }
    if (show_prior_mon === 'yes' && (this.cal_inp_min < p_yr_limit)) {
        show_prior_year = 'yes';
    }

    mon_table.className = 'cal_table';

    if (this.cal_cfg.use_prior_next_links) {
        if (show_prior_year === 'yes') {
            mon_span = document.createElement("button");
            mon_span.title = prior_year;
            mon_span.style.cursor = 'pointer';
            mon_span.style.cssFloat = 'left';
            mon_span.style.marginLeft = '2px';
            jQuery(mon_span).addClass('cal_ctrls btn btn-msos fa fa-angle-double-left');
            jQuery(mon_span).click(

            function (evt) {
                msos.do_nothing(evt);
                cal_object.new_display(prior_year, m);
            });
            cal_object.cal_ctrl.appendChild(mon_span);
        } else {
            mon_span = document.createElement("button");
            mon_span.style.cssFloat = 'left';
            mon_span.style.marginLeft = '2px';
            jQuery(mon_span).addClass('cal_ctrls btn btn-msos fa fa-angle-double-left disabled');
            cal_object.cal_ctrl.appendChild(mon_span);
        }
        if (show_prior_mon === 'yes') {
            pr_mon = this.mon_name[prior_month];
            mon_span = document.createElement("button");
            mon_span.title = pr_mon;
            mon_span.style.cursor = 'pointer';
            mon_span.style.cssFloat = 'left';
            mon_span.style.marginLeft = '4px';
            jQuery(mon_span).addClass('cal_ctrls btn btn-msos btn-msos fa fa-angle-double-left');
            jQuery(mon_span).click(

            function (evt) {
                msos.do_nothing(evt);
                cal_object.new_display(prior_month_year, prior_month);
            });
            cal_object.cal_ctrl.appendChild(mon_span);
        } else {
            mon_span = document.createElement("button");
            mon_span.style.cssFloat = 'left';
            mon_span.style.marginLeft = '4px';
            jQuery(mon_span).addClass('cal_ctrls btn btn-msos fa fa-angle-double-left disabled');
            cal_object.cal_ctrl.appendChild(mon_span);
        }
        mon_cent_span = document.createElement("span");
        mon_cent_span.title = this.i18n.display_date;
        mon_cent_span.id = 'display_date';
        mon_cent_span.innerHTML = th_title;
        cal_object.cal_ctrl.appendChild(mon_cent_span);

        if (show_next_year === 'yes') {
            mon_span = document.createElement("button");
            mon_span.title = next_year;
            mon_span.style.cursor = 'pointer';
            mon_span.style.cssFloat = 'right';
            mon_span.style.marginRight = '2px';
            jQuery(mon_span).addClass('cal_ctrls btn btn-msos btn-msos fa fa-angle-double-right');
            jQuery(mon_span).click(

            function (evt) {
                msos.do_nothing(evt);
                cal_object.new_display(next_year, m);
            });
            cal_object.cal_ctrl.appendChild(mon_span);
        } else {
            mon_span = document.createElement("button");
            mon_span.style.cssFloat = 'right';
            mon_span.style.marginRight = '2px';
            jQuery(mon_span).addClass('cal_ctrls btn btn-msos fa fa-angle-double-right disabled');
            cal_object.cal_ctrl.appendChild(mon_span);
        }
        if (show_next_mon === 'yes') {
            nt_mon = this.mon_name[next_month];
            mon_span = document.createElement("button");
            mon_span.title = nt_mon;
            mon_span.style.cursor = 'pointer';
            mon_span.style.cssFloat = 'right';
            mon_span.style.marginRight = '4px';
            jQuery(mon_span).addClass('cal_ctrls btn btn-msos btn-msos fa fa-angle-double-right');
            jQuery(mon_span).click(

            function (evt) {
                msos.do_nothing(evt);
                cal_object.new_display(next_month_year, next_month);
            });
            cal_object.cal_ctrl.appendChild(mon_span);
        } else {
            mon_span = document.createElement("button");
            mon_span.style.cssFloat = 'right';
            mon_span.style.marginRight = '4px';
            jQuery(mon_span).addClass('cal_ctrls btn btn-msos fa fa-angle-double-right disabled');
            cal_object.cal_ctrl.appendChild(mon_span);
        }
    } else {
        cal_object.cal_ctrl.innerHTML = th_title;
    }

    // Create our calendar's day display table...
    var day_table = document.createElement("table"),
        day_table_body = document.createElement("tbody"),
        day_table_th_row = document.createElement("tr"),
        day_table_th = null,
        i = 0;

    day_table.id = 'calendar_table';

    msos.console.debug(temp_text + 'start calendar table.');

    // Start calendar day header...
    for (i = 0; i < 7; i += 1, start_day += 1) {
        if (start_day === 7) {
            start_day = 0;
        }
        day_table_th = document.createElement("th");
        day_table_th.title = this.long_day[start_day];
        switch (this.cal_cfg.day_title_format) {
        case "shrt_day":
            day_table_th.innerHTML = this.shrt_day[start_day];
            break;
        default:
            day_table_th.innerHTML = this.abbr_day[start_day];
            break;
        }
        day_table_th_row.appendChild(day_table_th);
    }

    // Append the day <th> display row
    day_table_body.appendChild(day_table_th_row);

    // Generate the calendar rows...
    var column = 0,
        row = 0,
        calendar_rows = [],
        n = 0,
        p = 0,
        prior_mon_obj = null,
        prior_mon_td = null,
        curr_mon_obj = null,
        c_mon_last = null,
        curr_mon_td = null,
        next_mon_td = null,
        j = 0,
        x = 0,
        z = 0,
        k = 0,
        last_mon_td = null,
        today_span = null,
        no_date_txt_node = null,
        no_date_span = null;

    calendar_rows[row] = document.createElement("tr"); // 1st row
    start_month = start_month - this.first_dow;
    if (start_month < 0) {
        start_month = 7 + start_month;
    }

    // Add the days for the prior month...
    for (n = 0; n < start_month; n += 1, column += 1) {
        prior_mon_obj = new Date(prior_month_year, prior_month, 1);
        p_mon_last = msos.date.getDaysInMonth(prior_mon_obj);
        prior_mon_td = this.calendar_td(prior_month_year, prior_month, (p_mon_last - start_month + n + 1), 'prior');
        calendar_rows[row].appendChild(prior_mon_td);
    }

    // Add the days for the current month...
    curr_mon_obj = new Date(y, m, 1);
    c_mon_last = msos.date.getDaysInMonth(curr_mon_obj);
    for (p = 1; p <= c_mon_last; p += 1, column += 1) {
        curr_mon_td = this.calendar_td(y, m, p, 'curr');
        calendar_rows[row].appendChild(curr_mon_td);
        if (column === 6) {
            if (p < c_mon_last) {
                row += 1;
                column = -1;
                calendar_rows[row] = document.createElement("tr"); // add additional row
            }
        }
    }

    // Add the days for the next month...
    if (column > 0) {
        for (j = 1; column < 7; j += 1, column += 1) {
            next_mon_td = this.calendar_td(next_month_year, next_month, j, 'next');
            calendar_rows[row].appendChild(next_mon_td);
        }
    }

    // Make the calendar with 6 rows each time?
    if (this.cal_cfg.use_six_rows) {
        for (z = row; z < 5; z += 1) {
            row += 1;
            calendar_rows[row] = document.createElement("tr"); // add another (forced) row
            for (x = 0; x < 7; x += 1, j += 1) {
                last_mon_td = this.calendar_td(next_month_year, next_month, j, 'next');
                calendar_rows[row].appendChild(last_mon_td);
            }
        }
    }
    // Append just generated calendar <tr> rows...
    for (k = 0; k < calendar_rows.length; k += 1) {
        day_table_body.appendChild(calendar_rows[k]);
    }

    // Finish our day display table...
    day_table.appendChild(day_table_body);

    msos.console.debug(temp_text + 'calendar table created.');

    if (this.cal_cfg.use_today_date_link) {
        today_span = document.createElement("button");
        today_span.innerHTML = this.i18n.today_link_text;
        today_span.title = this.i18n.today_link_title;
        today_span.style.cursor = 'pointer';
        jQuery(today_span).addClass('cal_ctrls btn btn-msos');
        jQuery(today_span).click(

        function (evt) {
            msos.do_nothing(evt);
            cal_object.enter_date(cal_object.curr_year, cal_object.curr_mon, cal_object.curr_date, cal_object.cal_cfg.close_on_date_pick);
        });
        this.cal_footer.appendChild(today_span);
    }
    if (this.cal_cfg.use_no_date_link) {
        if (this.cal_cfg.use_today_date_link) {
            no_date_txt_node = document.createTextNode('  ');
            this.cal_footer.appendChild(no_date_txt_node);
        }
        no_date_span = document.createElement("button");
        no_date_span.innerHTML = this.i18n.no_date_link_text;
        no_date_span.title = this.i18n.no_date_link_title;
        no_date_span.style.cursor = 'pointer';
        jQuery(no_date_span).addClass('cal_ctrls btn btn-msos');
        jQuery(no_date_span).click(

        function (evt) {
            msos.do_nothing(evt);
            cal_object.enter_blank();
        });
        this.cal_footer.appendChild(no_date_span);
    }

    // Append our date table
    this.cal_display.appendChild(day_table);
};

msos.calendar.create_tool.prototype.calendar_td = function (y, m, d, type) {
    "use strict";

    var cal_object = this,
        td_date = new Date(y, m, d),
        td_dow = td_date.getDay(),
        td_style = [],
        td_style_string = '',
        td_week_day = (td_dow !== 0 && td_dow !== 6),
        td_doy = msos.date.locale._getDayOfYear(td_date),
        td_woy = msos.date.locale._getWeekOfYear(td_date, this.first_dow),
        td_doy_txt = ", " + this.i18n.day_of_year_text + " - " + td_doy,
        td_woy_txt = this.i18n.week_of_year_text + " - " + td_woy,
        is_entered_date = (this.cal_year === y && this.cal_month === m && this.cal_date === d),
        is_current_date = (this.curr_year === y && this.curr_mon === m && this.curr_date === d),
        td_no_date = this.i18n.day_not_allowed_text;

    // Set the td style...
    if ((type === 'prior') || (type === 'next')) {
        td_style.push('cal_prior');
    }
    if (is_entered_date && is_current_date) {
        td_style.push('cal_both');
    } else if (is_entered_date) {
        td_style.push('cal_entered');
    } else if (is_current_date) {
        td_style.push('cal_current');
    } else {
        if (td_week_day) {
            td_style.push('cal_weekday');
        } else {
            td_style.push('cal_weekend');
        }
    }

    // Build the td output element...
    var avail_date = 'yes',
        td_out = document.createElement("td"),
        td_click_func = function (evt) {
            msos.do_nothing(evt);
            if (avail_date === 'yes') {
                cal_object.enter_date(y, m, d, cal_object.cal_cfg.close_on_date_pick);
            } else {
                window.alert(cal_object.generate_date(y, m, d) + ' - ' + td_no_date);
            }
        },
        td_onmouseover = function () {
            this.original_cl = this.style.color;
            this.style.color = 'darkgrey';
            this.style.border = '1px solid black';
        },
        td_onmouseout = function () {
            this.style.border = '1px solid grey';
            this.style.color = this.original_cl;
        };

    jQuery(td_out).click(td_click_func);

    if (type === 'curr' || (type === 'prior' && this.cal_cfg.display_prior_mon_days) || (type === 'next' && this.cal_cfg.display_next_mon_days)) {
        if (td_week_day && !this.cal_cfg.pick_weekdays) {
            avail_date = 'no';
        }
        if (!td_week_day && !this.cal_cfg.pick_weekends) {
            avail_date = 'no';
        }
        if (type === 'prior' && !this.cal_cfg.pick_prior_mon_days) {
            avail_date = 'no';
        }
        if (type === 'next' && !this.cal_cfg.pick_next_mon_days) {
            avail_date = 'no';
        }
        if (this.cal_inp_max && this.cal_inp_max < td_date) {
            avail_date = 'no';
        }
        if (this.cal_inp_min && this.cal_inp_min > td_date) {
            avail_date = 'no';
        }

        if (avail_date === 'yes') {
            td_style.push('cal_available');
        } else {
            td_style.push('cal_not_avail');
        }

        if (avail_date === 'yes') {
            td_out.title = td_woy_txt + td_doy_txt;
            jQuery(td_out).mouseover(td_onmouseover);
            jQuery(td_out).mouseout(td_onmouseout);
        } else {
            td_out.title = td_no_date;
        }
    } else {
        td_style.push('cal_not_avail');
        td_out.title = type;
    }

    td_style_string = td_style.join(" ");
    td_out.className = td_style_string;
    td_out.innerHTML = d;

    if (is_current_date) {
        td_out.title += ' (' + this.i18n.current_date + ')';
    }
    if (is_entered_date) {
        td_out.title += ' (' + this.i18n.entered_date + ')';
    }
    return td_out;
};

msos.calendar.create_tool.prototype.enter_blank = function () {
    "use strict";

    if (this.tool_target.value !== this.cal_cfg.blank_date_text) {
        this.tool_target.value = this.cal_cfg.blank_date_text;
    }
    this.cal_date = null;
    this.cal_year = null;
    this.cal_month = null;

    this.tool_popup.hide_popdiv();
};

msos.calendar.create_tool.prototype.enter_date = function (y, m, d, hide) {
    "use strict";

    this.cal_year = y;
    this.cal_month = m;
    this.cal_date = d;

    var old_date = this.tool_target.value,
        new_date = this.generate_date(y, m, d);

    if (old_date !== new_date) {
        this.tool_target.value = new_date;
        if (this.cal_cfg.exec_on_complete && hide) {
            this.on_complete_func();
        }
    }
    if (hide) {
        this.tool_popup.hide_popdiv();
    }
    msos.console.debug("msos.calendar.create_tool.enter_date -> old date: " + old_date + ', new date: ' + new_date);
};

msos.calendar.create_tool.prototype.get_input_date = function (input_date_strg) {
    "use strict";

    var temp_name = 'msos.calendar.create_tool.get_input_date -> ',
        input_date_obj = null,
        dojo_array = [],
        filter_array = [],
        k = 0,
        l = 0;

    if (!input_date_strg || input_date_strg === this.cal_cfg.blank_date_text) {
        if (this.cal_month === null || this.cal_year === null) {
            if (this.cal_cfg.initial_date) {
                this.cal_month = this.cal_cfg.initial_date.getMonth();
            } else {
                this.cal_month = this.curr_mon;
            }
            if (this.cal_cfg.initial_date) {
                this.cal_year = this.cal_cfg.initial_date.getFullYear();
            } else {
                this.cal_year = this.curr_year;
            }
        }
        if (!input_date_strg) {
            input_date_strg = 'blank';
        }
        msos.console.debug(temp_name + 'initialize date for: ' + input_date_strg + ', cal_month: ' + this.cal_month + ', cal_year: ' + this.cal_year);
        return true;
    }

    // Input string entered, so lets parse it...
    input_date_strg = jQuery.trim(input_date_strg);
    input_date_strg = input_date_strg.replace(/\s\s+/g, " ");

    msos.console.debug(temp_name + 'start, input date: ' + input_date_strg);

    // Try std localized 'date' selector first
    input_date_obj = msos.date.locale.parse(this.cal_cfg.calendar_type, input_date_strg, this.cal_cfg.std_in_out_date_format) || null;

    // Now try some dojo typical alternate patterns
    if (!input_date_obj) {
        dojo_array = this.cal_cfg.alt_input_date_formats;
        for (k = 0; k < dojo_array.length; k += 1) {
            input_date_obj = msos.date.locale.parse(this.cal_cfg.calendar_type, input_date_strg, dojo_array[k]) || null;
            if (input_date_obj) {
                msos.console.debug(temp_name + 'dojo format: ' + dojo_array[k].formatLength);
                break;
            }
        }
        // Now try some language specific filter formats as a last attempt
        if (!input_date_obj && this.cal_cfg.lang_specific_date_formats[msos.config.locale]) {
            filter_array = this.cal_cfg.lang_specific_date_formats[msos.config.locale];
            for (l = 0; l < filter_array.length; l += 1) {
                input_date_obj = msos.date.locale.parse(this.cal_cfg.calendar_type, input_date_strg, filter_array[l]) || null;
                if (input_date_obj) {
                    msos.console.debug(temp_name + 'alt lang format: ' + filter_array[l].datePattern);
                    break;
                }
            }
        }
    }
    if (!input_date_obj) {
        msos.console.error(temp_name + 'failed, for input: ' + input_date_strg);
        window.alert(this.i18n.input_format_msg + ' ' + this.example_date());
        return false;
    }

    // Got input date object, so continue
    var in_year = input_date_obj.getFullYear(),
        in_mon = input_date_obj.getMonth(),
        in_date = input_date_obj.getDate(),
        parsed_date = null,
        formatted = '';

    if (!isNaN(in_date) && !isNaN(in_mon) && !isNaN(in_year)) {
        parsed_date = new Date(in_year, in_mon, in_date);
        if (this.cal_inp_max && this.cal_inp_max < parsed_date) {
            formatted = msos.date.locale.format(
                this.cal_cfg.calendar_type,
                this.cal_inp_max,
                this.cal_cfg.std_in_out_date_format
            );
            msos.console.warn(temp_name + 'future date above allowed: ' + formatted);
            window.alert(
            this.i18n.date_allowable_text + ' ' + this.i18n.top_allowable_text + ' ' + formatted);
            in_date = this.cal_inp_max.getDate();
            in_mon = this.cal_inp_max.getMonth();
            in_year = this.cal_inp_max.getFullYear();
            this.enter_date(in_year, in_mon, in_date);
            return false;
        }
        if (this.cal_inp_min && this.cal_inp_min > parsed_date) {
            formatted = msos.date.locale.format(
                this.cal_cfg.calendar_type,
                this.cal_inp_min,
                this.cal_cfg.std_in_out_date_format
            );
            msos.console.warn(temp_name + 'past date below allowed: ' + formatted);
            window.alert(
            this.i18n.date_allowable_text + ' ' + this.i18n.bot_allowable_text + ' ' + formatted);
            in_date = this.cal_inp_min.getDate();
            in_mon = this.cal_inp_min.getMonth();
            in_year = this.cal_inp_min.getFullYear();
            this.enter_date(in_year, in_mon, in_date);
            return false;
        }
        msos.console.debug(temp_name + 'new date generated.');
        this.enter_date(in_year, in_mon, in_date);
        return true;
    }

    return false;
};

msos.calendar.add_to_page = function () {
    "use strict";

    var container = jQuery(
            '<div id="calendar_container" class="msos_popup">'
         +      '<div id="calendar_header" class="header_popup">'
         +          '<button id="calendar_close" class="btn btn-danger btn-small fa fa-times"></button>'
         +      '</div>'
         +      '<div id="calendar_control"></div>'
         +      '<div id="calendar_display"></div>'
         +      '<div id="calendar_footer"></div>'
         + '</div>'
        ),
        calendar_obj;

    jQuery('body').append(container);

    // Create our calendar object
    calendar_obj = new msos.calendar.create_tool();

    // Register our calendar popup div
    msos.popdiv.register_tool(calendar_obj);

    calendar_obj.tool_created = true;
};

msos.calendar.get_tool = function () {
    "use strict";

    if (!msos.registered_tools.msos_calendar) { msos.calendar.add_to_page(); }

    return msos.registered_tools.msos_calendar.base;
};
