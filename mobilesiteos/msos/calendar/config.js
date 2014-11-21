// Copyright Notice:
//			     	calendar/config.js
//			Copyright©2010-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile calendar configuration

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.calendar.config");
msos.require("msos.i18n.gregorian");

msos.calendar.config.version = new msos.set_version(14, 3, 21);


// Set global calendar parameters for your website here, then change them in page
// as necessary for specific calendar start/end dates etc.

msos.calendar.config.create = function () {
    "use strict";

    // This calendar config for "Gregorian" calendar
    this.calendar_type = msos.i18n.gregorian.bundle;

    // Std date format as expressed by dojo.date.locale (what will be the final input format)
    this.std_in_out_date_format = { formatLength: 'medium', selector: 'date' };

    // Set an intial display date like 'new Date(2006, 0, 1)'
    this.initial_date = null;

    // Enter upper most and/or lower most avail.
    this.cal_top_date = new Date(2015, 0, 1);	// Set upper
    this.cal_bot_date = new Date(2006, 0, 1);	// Set lower	(year, month index, day)

    // Alternate input formats as accepted by dojo.date.locale (what can be parsed before conversion)
    this.alt_input_date_formats = [
		{ selector: 'date', formatLength: 'long'  },
		{ selector: 'date', formatLength: 'short' }
    ];

    // Language specific alternate input formats (to add flexibility to input acceptance)
    this.lang_specific_date_formats = {
	en: [
	    { selector: 'date', datePattern: "MMMd,yyyy"  },
	    { selector: 'date', datePattern: "MMMMd,yyyy" },
	    { selector: 'date', datePattern: "MM.d.yyyy"  },
	    { selector: 'date', datePattern: "MM-d-yyyy"  }
	]
    };

    // Set True/False calendar controls
    this.close_on_date_pick = true;
    this.close_on_body_click = true;
    this.exec_on_complete = true;
    this.display_prior_mon_days = true;
    this.display_next_mon_days = true;
    this.pick_weekdays = true;
    this.pick_weekends = true;
    this.pick_prior_mon_days = true;
    this.pick_next_mon_days = true;
    this.use_prior_next_links = true;
    this.use_today_date_link = true;
    this.use_no_date_link = true;
    this.use_six_rows = true;

    // Dojo style date format
    this.day_title_format = "shrt_day";

    // Calendar spacing character
    this.blank_date_text = "";
};