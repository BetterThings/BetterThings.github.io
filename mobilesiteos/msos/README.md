osm_msos
========

MobileSiteOS framework base, module and resource files

This repository contains the core files used to define our MobileSiteOS™ JavaScript "framework". They act as a mobile aware code layer between some of the best standard JavaScript frameworks (Modernizr, jQuery, jQuery-UI, Underscore.js, Backbone.js, Hammer.js, Bootstrap) and standard HTML5 web pages.

The only dependencies required to use our base code (/msos/base.uc.js, /msos/core.uc.js and /msos/site.uc.js) are that you have Modernirz, jQuery and Underscore.js installed. However, many of the included MobileSiteOS developed modules have varing dependencies. These are typically defined in each module by the "msos.require()" method(s) at the top of each file.

Thus you can use as little or as much as you want of MobileSiteOS, depending on your needs. Typically, we hope you will want to use it with all the other "soft" dependencies (jQuery-UI, Backbone.js, Hammer.js, Bootstrap), but that is entirely up to you. We have tried to make things as "modular" as possible for ease in building more advanced widget modules through the on-demand loading of more basic function modules and css.
