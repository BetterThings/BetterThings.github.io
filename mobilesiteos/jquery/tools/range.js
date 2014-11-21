/* 
 * jQuery Tools Rangeinput - HTML5 <input type="range" /> for humans
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/rangeinput/
 *
 * Since: Mar 2010
 */

// Adapted (way modified) for use thru MobileSiteOS.

/*global
    msos: false,
    jQuery: false,
    jquery: false,
    _: false
*/

msos.provide("jquery.tools.range");
msos.require("msos.common");

jquery.tools.range.version = new msos.set_version(14, 3, 5);


jquery.tools.range.css = new msos.loader();
jquery.tools.range.css.load('jquery_css_tools_range_css', msos.resource_url('jquery', 'css/tools/range.css'));

jquery.tools.range.conf = {
	min: 0,
	max: 100,		// as defined in the standard
	step: 'any',	// granularity of the value. a non-zero float or int (or "any")
	steps: 0,
	value: 0,
	precision: undefined,
	vertical: 0,
	progress: false,
	speed: 100,

	// set to null if not needed
	css: {
		input:		'range',
		slider:		'slider',
		progress:	'progress',
		handle:		'handle'
	}
};

(function ($) {
	"use strict";

	var temp_jtr = 'jquery.tools.range';

	// get hidden element's width or height even though it's hidden
	function dim(el, key) {
		var v = parseInt(el.css(key), 10),
			s = el[0].currentStyle;

		if (v)	{ return v; }
		else	{ return s && s.width && parseInt(s.width, 10); }
	}

	function RangeInput(input, conf) {

		// private variables
		var self = this,
			temp_ri = ' - RangeInput',
			css = conf.css,
			root = $("<div><div/><a href='#'/></div>").data("rangeinput", self),
			value = conf.min,	// current value
			origo,				// handle's start point
			len,				// length of the range
			pos;				// current position of the handle

		// create range	 
		input.before(root);

		var handle = root.addClass(css.slider).find("a").addClass(css.handle),
			progress = root.find("div").addClass(css.progress);

		// get (HTML5) attributes into configuration
		$.each(
			['min', 'max', 'step', 'value'],
			function (i, key) {
				var val = input.attr(key);
				if (parseFloat(val)) {
					conf[key] = parseFloat(val, 10);
				}
			}
		);

		var range = conf.max - conf.min,
			step  = conf.step === 'any' ? 0 : conf.step,
			precision = conf.precision,
			def,
			clone,
			fire;

		if (precision === undefined) {
			precision = step.toString().split(".");
			precision = precision.length === 2 ? precision[1].length : 0;
		}

		// Replace built-in range input (type attribute cannot be changed)
		if (input.attr("type") === 'range') {
			def = input.clone().wrap("<div/>").parent().html();
			clone = $(def.replace(/type/i, "type=text data-orig-type"));

			clone.val(conf.value);
			input.replaceWith(clone);
			input = clone;
		}

		input.addClass(css.input);

		fire = $(self).add(input);

		// calculate all dimension related stuff
		function init() {
			len = dim(root, "width") - dim(handle, "width");
			origo = root.offset().left;
			if (msos.config.verbose) {
				msos.console.debug(temp_jtr + temp_ri + ' - init -> len: ' + len + ',  origo: ' + origo);
			}
		}

		function slide(evt, x, val, isSetValue) {

			var temp_sl = temp_jtr + temp_ri + ' - slide -> ',
				dbug = '';

			if (msos.config.verbose) {
				msos.console.debug(temp_sl + 'start, x: ' + x + ', val: ' + val + ', type: ' + evt.type);
			}

			if (val === undefined && x !== undefined) {
				val = x / len * range;	// calculate value based on slide position
				dbug = 'val is undefined';
			} else if (isSetValue) {
				val -= conf.min;		// x is calculated based on val (strip off min amount)
				dbug = 'val is set';
			} else {
				val = conf.min;			// or default to min
				dbug = 'val is set to min';
			}

			// increment in steps
			if (step) {
				val = Math.round(val / step) * step;
				dbug += ', val set via step';
			}

			// count x based on value or tweak x if stepping is done
			if (x === undefined || step) {
				x = val * len / range;
				dbug += ', x was undefined, now: ' + x;
			}

			if (evt.type === "drag") {
				if (x < 0 || x > len) {
					// diconnect drag movement
					handle.trigger("mouseup");
				}
			}

			// stay within range
			x = Math.max(0, Math.min(x, len));

			val = x / len * range;
			val += conf.min;

			// precision
			val = msos.common.round(val, precision);

			// speed & callback
			var speed = evt.type === "click" ? conf.speed : 0,
				callback = function () {
					evt.type = "change";
					fire.trigger(evt, [val]);
				};

			// Position the drag handle
			handle.animate({ left: x }, speed, callback);

			if (conf.progress) {
				progress.animate({ width: x + handle.width() / 2 }, speed);
			}

			// store current value
			value = val;
			pos = x;

			// set input field's value
			input.val(val);

			if (msos.config.verbose) {
				msos.console.debug(temp_sl + 'done, x: ' + x + ', val: ' + val + ', debug: ' + dbug);
			}
			return self;
		}

		$.extend(self, {

			getValue: function () {
				return value;
			},

			setValue: function (val, e) {
				msos.console.debug(temp_jtr + temp_ri + ' - setValue -> to: ' + val);
				return slide(e || $.Event("click"), undefined, val, true);
			},

			getConf: function () {
				return conf;
			},

			getProgress: function () {
				return progress;
			},

			getHandle: function () {
				return handle;
			},

			getInput: function () {
				return input;
			},

			step: function (am) {
				var step = conf.step === 'any' ? 1 : conf.step;
				self.setValue(value + step * (am || 1));
			},

			// HTML5 compatible name
			stepUp: function (am) {
				return self.step(am || 1);
			},

			// HTML5 compatible name
			stepDown: function (am) {
				var out = -1 * (am || 1);
				return self.step(out);
			},

			initInput: function () {
				init();
				self.setValue(conf.value !== undefined ? conf.value : conf.min);
			}
		});

		self.change = function (fn) {
			if (fn) {
				$(self).on('change', fn);
				if (msos.config.verbose) {
					msos.console.debug(temp_jtr + temp_ri + ' - self.change -> fired!');
				}
			}
			return self;
		};

		// dragging		                                  
		handle.on(
			"mousedown",
			function (e) {

				var el = $(e.target),
					conf = { x: true, y: false, drag: true },
					offset = el.position(),
					x0 = e.pageX - offset.left,
					y0 = e.pageY - offset.top,
					start = true;

				// start 
				if (el.data("drag")) {

					el.on("mousemove.drag", function (e) {
						var x = e.pageX - x0,
							y = e.pageY - y0,
							props = {};

						if (conf.x) { props.left = x; }
						if (conf.y) { props.top = y; }

						if (start) {
							el.trigger("dragStart");
							start = false;
						}
						if (conf.drag) { el.css(props); }
						el.trigger("drag", [y, x]);
					});

					e.preventDefault();
				}
			}
		);

		handle.on(
			"mouseup mouseout",
			function (e) {
				var el = $(e.target);

				try {
					if (el) { el.trigger("dragEnd"); }
				} finally {
					el.off("mousemove.drag");
				}
			}
		);

		handle.data("drag", true);

		handle.on(
			"dragStart",
			function () { init(); }
		);

		handle.on(
			"drag",
			function (e, y, x) {
				if (input.is(":disabled")) { return false; }
				slide(e, x);
				return true;
			}
		);

		handle.on(
			"dragEnd",
			function (e) {
				if (!e.isDefaultPrevented()) {
					e.type = "change";
					fire.trigger(e, [value]);
				}
			}
		);

		handle.click(
			function (e) {
				return e.preventDefault();
			}
		);

		// clicking
		root.click(
			function (e) {
				if (input.is(":disabled") || e.target === handle[0]) {
					e.preventDefault();
					return;
				}
				init();
				var fix = handle.width() / 2,
					x = e.pageX - origo - fix;
				slide(e, x);
			}
		);

		input.keydown(
			function (e) {
				if (input.attr("readonly")) {
					msos.console.warn(temp_jtr + temp_ri + ' - input.keydown -> input is readonly!');
					return;
				}

				var key = e.keyCode,
					up   = $([75, 76, 38, 33, 39]).index(key) !== -1,
					down = $([74, 72, 40, 34, 37]).index(key) !== -1;

				if ((up || down) && !(e.shiftKey || e.altKey || e.ctrlKey)) {

					// UP: k=75, l=76, up=38, pageup=33, right=39			
					if (up) {
						self.step(key === 33 ? 10 : 1);
					// DOWN: j=74, h=72, down=40, pagedown=34, left=37
					} else if (down) {
						self.step(key === 34 ? -10 : -1);
					}
					if (msos.config.verbose) {
						msos.console.debug(temp_jtr + temp_ri + ' - input.keydown -> fired!');
					}
					return;
				}
			}
		);

		input.blur(
			function () {
				var val = $(this).val();
				if (val !== value) {
					self.setValue(val);
					if (msos.config.verbose) {
						msos.console.debug(temp_jtr + temp_ri + ' - input.blur -> fired!');
					}
				}
			}
		);

		// HTML5 DOM methods
		$.extend(input[0], { stepUp: self.stepUp, stepDown: self.stepDown });
	}

	// jQuery plugin implementation
	$.fn.rangeinput = function (conf) {

		// extend configuration with globals
		conf = $.extend(true, {}, jquery.tools.range.conf, conf);

		this.each(
			function () {
				var el = new RangeInput($(this), $.extend(true, {}, conf));

				el.initInput();
			}
		);

		return this;
	};

}(jQuery));