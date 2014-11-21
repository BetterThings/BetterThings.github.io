
/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.sdmenu");

msos.sdmenu.version = new msos.set_version(13, 6, 14);

// Start by loading our sdmenu specific stylesheet
msos.sdmenu.css = new msos.loader();
msos.sdmenu.css.load('sdmenu_css',		msos.resource_url('css', 'sdmenu.css'));
msos.sdmenu.css.load('sdmenu_msos_css',	msos.resource_url('css', 'sdmenu_msos.css'));


msos.sdmenu.generate = function (id) {
    "use strict";

    var self = this,
		temp_sd = 'msos.sdmenu.generate',
		icon_down = 'fa-chevron-circle-down',
		icon_rt = 'fa-chevron-circle-right';

	msos.console.debug(temp_sd + ' -> start, id: ' + id);

    this.menu = msos.byid(id);
    this.submenus = this.menu.getElementsByTagName("div");
    this.remember = true;
    this.speed = 3;
    this.markCurrent = true;
    this.oneSmOnly = false;
	this.cookie_name = encodeURIComponent(id);

    this.init = function () {
		var c_obj = msos.config.cookie.site_sdmn,
            c_name = c_obj.name + self.cookie_name,
			links,
			cookie_val = msos.cookie(c_name) || '',
			states = [],
			$m_div = null,
			i = 0;

        if (self.markCurrent) {
            links = self.menu.getElementsByTagName("a");
            for (i = 0; i < links.length; i += 1) {
                if (links[i].href === document.location.href) {
                    links[i].className = "current";
                    break;
                }
            }
        }
        if (self.remember) {
            if (cookie_val) {
                states = cookie_val.split(":");
                for (i = 0; i < states.length; i += 1) {
					self.submenus[i].className = (states[i] === '0' ? "collapsed" : "");
				}
            }
        }

        for (i = 0; i < self.submenus.length; i += 1) {

			$m_div = jQuery(self.submenus[i]);

            $m_div.find('span').click(
				function () { self.toggleMenu(this.parentNode); }
			);
			$m_div.find('i').click(
				function () { self.toggleMenu(this.parentNode); }
			);

			$m_div.find('i').toggleClass(
				function () {
					if ($m_div.is('.collapsed')) { return icon_rt; }
					return icon_down;
				}
			);
        }
    };

    this.toggleMenu = function (submenu) {
        if (submenu.className === "collapsed")	{ self.expandMenu(submenu);   }
        else									{ self.collapseMenu(submenu); }
    };

    this.expandMenu = function (submenu) {
		var m_span = submenu.getElementsByTagName("span")[0],
			fullHeight = m_span.offsetHeight,
			links = submenu.getElementsByTagName("a"),
			i = 0,
			moveBy,
			intId;

        for (i = 0; i < links.length; i += 1) {
			fullHeight += links[i].offsetHeight;
		}

		jQuery(submenu).find('i').addClass(icon_down).removeClass(icon_rt);

        moveBy = Math.round(self.speed * links.length);

        intId = setInterval(
			function () {
				var curHeight = submenu.offsetHeight,
					newHeight = curHeight + moveBy;

				if (newHeight < fullHeight) {
					submenu.style.height = newHeight + "px";
				} else {
					clearInterval(intId);
					submenu.style.height = "";
					submenu.className = "";
					self.memorize();
				  }
			},
			30
		);
        self.collapseOthers(submenu);
    };

    this.collapseMenu = function (submenu) {
        var m_span = submenu.getElementsByTagName("span")[0],
			minHeight = m_span.offsetHeight,
			moveBy = Math.round(self.speed * submenu.getElementsByTagName("a").length),
			intId;

		jQuery(submenu).find('i').removeClass(icon_down).addClass(icon_rt);

		intId = setInterval(
				function () {
				var curHeight = submenu.offsetHeight,
					newHeight = curHeight - moveBy;

				if (newHeight > minHeight) {
					submenu.style.height = newHeight + "px";
				} else {
					clearInterval(intId);
					submenu.style.height = "";
					submenu.className = "collapsed";
					self.memorize();
				  }
			},
			30
		);
    };

    this.collapseOthers = function (submenu) {
		var i = 0;

        if (self.oneSmOnly) {
            for (i = 0; i < self.submenus.length; i += 1) {
				if (self.submenus[i] !== submenu
				 && self.submenus[i].className !== "collapsed") {
					self.collapseMenu(self.submenus[i]);
				}
			}
        }
    };

    this.expandAll = function () {
        var oldOneSmOnly = self.oneSmOnly,
			i = 0;

        self.oneSmOnly = false;

        for (i = 0; i < self.submenus.length; i += 1) {
			if (self.submenus[i].className === "collapsed") {
				self.expandMenu(self.submenus[i]);
			}
        }
        self.oneSmOnly = oldOneSmOnly;
    };

    this.collapseAll = function () {
		var i = 0;

        for (i = 0; i < self.submenus.length; i += 1) {
			if (self.submenus[i].className !== "collapsed") {
				self.collapseMenu(self.submenus[i]);
			}
		}
    };

    this.memorize = function () {
		var c_obj = msos.config.cookie.site_sdmn,
            c_name = c_obj.name + self.cookie_name,
			states = [],
			i = 0;

        if (self.remember) {
            for (i = 0; i < self.submenus.length; i += 1) {
				states.push(self.submenus[i].className === "collapsed" ? 0 : 1);
			}
            msos.cookie(
				c_name,
				states.join(":"),
				c_obj.params
			);
        }
    };

	this.add_menu_translate_icons = function () {

		if (msos.config.run_translate
		 && msos.config.locale.substr(0, 2) !== msos.default_locale) {

			// Don't translate this...
			msos.config.google.no_translate.by_class =
			msos.config.google.no_translate.by_class.concat(
				['.sdmenu']
			);

			jQuery.each(
				jQuery('.sdmenu > div > a'),
				function () {
					var $link = jQuery(this),
						$tran = jQuery('<lable class="translate">' + $link.text() + '</label>'),
						$icon = jQuery('<i class="icon-flag"> (' + msos.config.locale + ')  </i>');

					$link.wrapInner('<label class="org"></label>');
					$link.append($tran);
					$link.append($icon);
					$icon.hover(
						function () {
							$link.find('.translate').show();
							$link.find('.org').hide();
						},
						function () {
							$link.find('.org').show();
							$link.find('.translate').hide();
						}
					);
				}
			);
		}
	};

	msos.console.debug(temp_sd + ' -> done!');
};

