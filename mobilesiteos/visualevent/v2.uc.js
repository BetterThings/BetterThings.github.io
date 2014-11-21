/**
 * @summary     Visual Event
 * @description Visual Event - show Javascript events which have been attached to objects, and
 *              the event's associated function code, visually.
 * @author      Allan Jardine (www.sprymedia.co.uk)
 * @license     GPL v2
 * @contact     www.sprymedia.co.uk/contact
 *
 * @copyright Copyright 2007-2013 Allan Jardine.
 *
 * This source file is free software, under the GPL v2 license:
 *   http://www.gnu.org/licenses/gpl-2.0.html
 */

/*global
    msos: false,
    jQuery: false,
    SyntaxHighlighter: false,
    VisualEvent: true
*/


(function (window, document, $) {
	"use strict";

	var temp  = 'VisualEvent',
		tmp_d = 'VisualEvent.parser - DOM 0, 3 -> ',
		tmp_j = 'VisualEvent.parser - jQuery v1.9+ -> ';

    window.VisualEvent = function (target_node) {

		this.parsers = [];
        this.instance = this;

		this.parsers.push(

			function (dom_array) {
				var elements = [],
					dom_listeners = {},
					types = [
						'click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 
						'mouseup', 'change', 'focus', 'blur', 'scroll', 'select', 'submit',
						'keydown', 'keypress', 'keyup', 'load', 'unload'
					],
					dom_elm,
					dom_name = '',
					dom_key = '',
					i, j;

				msos.console.debug(tmp_d + 'start, dom array length: ' + dom_array.length);

				for (i = 0; i < dom_array.length; i += 1) {
					dom_elm = dom_array[i];
					dom_name = dom_elm.tagName || 'document';

					dom_key = dom_name + '_' + i;
					dom_listeners[dom_key] = [];

					if (msos.config.verbose) {
						msos.console.debug(tmp_d + 'process: ' + dom_name.toLowerCase() + (dom_elm.id ? '#' + dom_elm.id : ''));
					}

					for (j = 0; j < types.length; j += 1) {

						if (typeof dom_elm['on' + types[j]] === 'function') {

							dom_listeners[dom_key].push(
								{
									"type": types[j],
									"func": dom_elm['on' + types[j]].toString(),
									"removed": false,
									"source": 'DOM 0 event'
								}
							);
						}
					}

					if (dom_listeners[dom_key].length) {

						elements.push(
							{
								"node": dom_elm,
								"listeners": dom_listeners[dom_key]
							}
						);

						if (msos.config.verbose) {
							msos.console.debug(tmp_d + 'DOM 0 assigned events: ' + dom_name.toLowerCase() + (dom_elm.id ? '#' + dom_elm.id : '') + ', types:', elements[elements.length - 1].listeners);
						}
					}

					if (dom_elm.recorded_addEventListener
					 && dom_elm.recorded_addEventListener.length) {
						elements.push(
							{
								"node": dom_elm,
								"listeners": dom_elm.recorded_addEventListener
							}
						);
						if (msos.config.verbose) {
							msos.console.debug(tmp_d + 'DOM 3 assigned events: ' + dom_name.toLowerCase() + (dom_elm.id ? '#' + dom_elm.id : '') + ', types:', elements[elements.length - 1].listeners);
						}
					}
				}

				msos.console.debug(tmp_d + 'done, w/ events count: ' + elements.length + ', for total: ' + dom_array.length);
				return elements;
			}
		);

		// jQuery 1.9+
		this.parsers.push(

			function (dom_array) {
				var version = $.fn.jquery.substr(0, 3) || 0,
					elements = [];

				msos.console.debug(tmp_j + 'start.');

				version = Number(version);

				if (!$ || version < 1.9) {
					msos.console.warn(tmp_j + 'done, na for jQuery v' + version);
					return [];
				}

				$.each(
					dom_array,
					function (i, dom_elm) {

						var dom_name = dom_elm.tagName || 'document',
							type = '',
							j = '',
							k = 0,
							func = null,
							events,
							event_by_type,
							event_nodes = [],
							sjQuery = 'jQuery v' + $.fn.jquery;

						if (msos.config.verbose) {
							msos.console.debug(tmp_j + 'process: ' + dom_name.toLowerCase() + (dom_elm.id ? '#' + dom_elm.id : ''));
						}

						if ( typeof dom_elm === 'object' ) {

							if (typeof dom_elm.events === 'object') {
								events = dom_elm.events;
							}

							if (!events) {
								events = $._data(dom_elm, 'events');
							}

							for (type in events) {

								if (events.hasOwnProperty(type)) {

									if (type === 'live' ) { continue; }

									event_by_type = events[type];

									for (j in event_by_type) {

										if (event_by_type.hasOwnProperty(j)) {

											event_nodes = [];

											if (event_by_type[j].selector !== undefined
											 && event_by_type[j].selector !== null) {
												event_nodes = $(event_by_type[j].selector, dom_elm);
												sjQuery += " (live event)";
											} else {
												event_nodes.push(dom_elm);
											}

											for (k = 0; k < event_nodes.length; k += 1) {
												elements.push(
													{
														"node": event_nodes[k],
														"listeners": []
													}
												);

												if (event_by_type[j].origHandler !== undefined) {
													func = event_by_type[j].origHandler.toString();
												} else if (event_by_type[j].handler !== undefined) {
													func = event_by_type[j].handler.toString();
												} else {
													func = event_by_type[j].toString();
												}

												if (event_by_type[j]
												 && event_by_type[j].namespace !== "VisualEvent"
												 && func !== "0") {
													elements[elements.length - 1].listeners.push(
														{
															"type": type,
															"func": func,
															"removed": false,
															"source": sjQuery
														}
													);
												}
											}
										}

										// Remove elements that didn't have any listeners (i.e. might be a Visual Event node)
										if ( elements[ elements.length-1 ].listeners.length === 0 ) {
											elements.splice( elements.length-1, 1 );
										}
									}
								}
							}
							if (msos.config.verbose) {
								msos.console.debug(tmp_j + 'jQuery assigned events, ' + dom_name.toLowerCase() + (dom_elm.id ? '#' + dom_elm.id : ''), elements[elements.length - 1].listeners);
							}
						}
					}
				);

				msos.console.debug(tmp_j + 'done, w/ events count: ' + elements.length + ', for total: ' + dom_array.length);
				return elements;
			}
		);

        this.s = {
			"elements": null,
			"mouseTimer": null,
			"nonDomEvents": 0,
			"scripts": []
        };

		// HTML element id's to be ignored by VisualEvent code
		this.ignore = [
			'Event_Label', 'Event_Display', 'Event_Lightbox', 'Event_code', 'Event_Help',
			'google_ad', 'social_ties', 'google_translate_element', 'goog-gt-tt'
		];

		this.targetable_ids = {};

        this.dom = {
            "label":	$(
						'<div id="Event_Label" class="' + msos.config.size + '">' +
							'<select id="Event_Target"></select> ' +
							'<span class="btn btn-danger Event_LabelClose"><i class="fa fa-times"></i></span> ' +
							'<span class="btn btn-info   Event_LabelHelp"><i class="fa fa-info"></i></span> ' +
							'<ul>' +
								'<li><span class="Event_LabelEvents"></span> events, attached to <span class="Event_LabelNodes"></span> nodes.</li>' +
								'<li><span class="Event_LabelNonDom"></span> events for elements not in the document yet.</li>' +
							'</ul>' +
						'</div>'
						)[0],
            "display":	$('<div id="Event_Display"></div>')[0],
            "lightbox":	$(
						'<div id="Event_Lightbox" class="' + msos.config.size + '">' +
							'<div class="Event_NodeName">Node: <i></i>' +
								'<div class="Event_NodeRemove">Remove from display</div>' +
							'</div>' +
							'<div>' +
								'<div class="Event_Nav"><ul></ul></div>' +
							'</div>' +
								'<div class="Event_Code"></div>' +
							'</div>' +
						'</div>'
						)[0],
            "help":		$(
						'<div id="Event_Help" class="' + msos.config.size + '">' +
							'<div class="Event_HelpInner">' +
								'<h1>Visual Event help</h1>' +
								'<p>Visual Event will show which elements on any given page have Javascript events attached, ' +
									'what those events are and the code associated with the events.' +
								'</p>' +
								'<h3>Commands</h3>' +
								'<table class="table">' +
									'<tr>' +
										'<td>Double click</td>' +
										'<td>Hide this event indicator</td>' +
									'</tr><tr>' +
										'<td class="text_rt">Key: space</td>' +
										'<td>Restore all event indicators</td>' +
									'</tr><tr>' +
										'<td>Key: esc</td>' +
										'<td>Quit Visual Event</td>' +
									'</tr><tr>' +
										'<td>Key: h</td>' +
										'<td>Toggle this help box</td>' +
									'</tr><tr>' +
										'<td>Key: r</td>' +
										'<td>Reload and display events</td>' +
									'</tr>' +
								'</table>' +
								'<h3>Event Coding</h3>' +
								'<p>Colour coding of detected event elements vs. the basic event type:</p>' +
								'<table class="table">' +
									'<tr>' +
										'<td width="20%"><div class="EventLabel Event_LabelColour Event_bg_blue"></div></td><td>Mouse event</td>' +
									'</tr><tr>' + 
										'<td width="20%"><div class="EventLabel Event_LabelColour Event_bg_red"></div></td><td>UI event</td>' +
									'</tr><tr>' +
										'<td width="20%"><div class="EventLabel Event_LabelColour Event_bg_yellow"></div></td><td>HTML event</td>' +
									'</tr><tr>' +
										'<td width="20%"><div class="EventLabel Event_LabelColour Event_bg_green"></div></td><td>Mouse + HTML</td>' +
									'</tr><tr>' +
										'<td width="20%"><div class="EventLabel Event_LabelColour Event_bg_purple"></div></td><td>Mouse + UI</td>' +
									'</tr><tr>' +
										'<td width="20%"><div class="EventLabel Event_LabelColour Event_bg_orange"></div></td><td>HTML + UI</td>' +
									'</tr><tr>' +
										'<td width="20%"><div class="EventLabel Event_LabelColour Event_bg_black"></div></td><td>Mouse + HTML + UI</td>' +
									'</tr>' +
								'</table>' +
								'<p>Visual Event is open source software (GPLv2). If you would like to contribute an ' + 'enhancement, please fork the project on ' + '<a href="https://github.com/DataTables/VisualEvent" target="_blank">Github</a>!</p>' +
								'<p class="Event_HelpClose">Click anywhere to close this help box.</p>' +
							'</div>' +
						'</div>'
						)[0],
            "activeEventNode": null
        };

        this._construct(target_node);
    };

    VisualEvent.prototype = {

        "close": function () {

			$('.EventLabel').remove();
            $('#Event_Display').remove();
            $('#Event_Lightbox').remove();
            $('#Event_Label').remove();
            $('#Event_Help').remove();

            VisualEvent.instance = null;
        },

        "reInit": function (t_node_name) {

			var that = this;

			$('#Event_Target').empty();
			$('.EventLabel').remove();
            $('#Event_Display').remove();
            $('#Event_Lightbox').remove();
            $('#Event_Label').remove();
            $('#Event_Help').remove();

            this.s.elements = null;
            this.s.nonDomEvents = 0;

			// Above HTML removal and animations take some time to finish...
			setTimeout(function () { that._construct($('#'+ t_node_name)[0]); }, 1000);
        },

        "_construct": function (tgt_node) {
            var that = this,
				i,
				iLen,
				windowHeight = $(document).height(),
				windowWidth = $(document).width(),
				options = [],
				target_name = '',
				$event_target = null;

			msos.console.debug(temp + ' - _construct -> start.');

            /* Prep the DOM */
            this.dom.display.style.width  = windowWidth  + 'px';
            this.dom.display.style.height = windowHeight + 'px';

            document.body.appendChild(this.dom.display);
            document.body.appendChild(this.dom.lightbox);
            document.body.appendChild(this.dom.label);

            /* Event handlers */
            $(this.dom.lightbox).bind(
				'mouseover.VisualEvent',
				function (e) {
					that._timerClear(e);
				}
			).bind(
				'mousemove.VisualEvent',
				function (e) {
					that._timerClear(e);
				}
			).bind(
				'mouseout.VisualEvent',
				function () {
					that._lightboxHide();
				}
			);

            $('div.Event_NodeRemove', this.dom.lightbox).bind(
				'click.VisualEvent',
				function () {
					that.dom.activeEventNode.style.display = "none";
					that.dom.lightbox.style.display = "none";
				}
			);

            $(document).bind(
				'keydown.VisualEvent',
				function (e) {
					if (e.which === 0 || e.which === 27) { // esc
						that.close();
					}
					if (e.which === 72) { // 'h'
						if ($(that.dom.help).filter(':visible').length === 0) {
							that._help();
						} else {
							that._hideHelp();
						}
					} else if (e.which === 32) { // space
						$('div.EventLabel').css('display', 'block');
						e.preventDefault();
					} else if (e.which === 82) { // r
						that.reInit();
					}
				}
			);

            /* Build the events list and display */
            this.s.elements = this._eventsLoad(tgt_node);

            for (i = 0, iLen = this.s.elements.length; i < iLen; i += 1) {
                this._eventElement(this.s.elements[i]);
            }

			if (msos.config.verbose) {
				msos.console.debug(temp + ' - _construct -> available nodes:', that.targetable_ids);
			}

			$event_target = $("#Event_Target");

			$.each(
				that.targetable_ids,
				function(key, val) {
					options.push($("<option />", { value: key, text: val }));
				}
			);

			$event_target.append(options);

			if (tgt_node)	{ target_name = tgt_node.id; }
			else			{ target_name = 'html_body'; }
			
			$event_target.find("option[value='" + target_name + "']").attr('selected', 'selected');

			$event_target.on(
					'change',
					function () {
						var target_val = $('#Event_Target').val();
						that.reInit(target_val);
					}
				);

            this._renderLabel();
            this._scriptsLoad();

			msos.console.debug(temp + ' - _construct -> done!');
        },

        "_help": function () {
            document.body.appendChild(this.dom.help);
        },

        "_hideHelp": function () {
            document.body.removeChild(this.dom.help);
        },

		"_scriptsLoad": function () {
            // Don't load scripts again if they are already loaded
            if (this.s.scripts.length > 0) {
				msos.console.debug(temp + ' - _scriptsLoad -> called, already loaded!.');
                return;
            }

            var exclude = ['visualevent', 'syntaxhighlighter', 'xregexp', 'google', 'addthis', 'maps.gstatic'],
				excluded = false,
				loadQueue = [],
				module_name = '',
				scripts = document.getElementsByTagName('script'),
				iLen = scripts.length,
				uri = '',
				j = 0,
				i = 0;

			// Screen away script of no interest for event debugging
			for (module_name in msos.registered_files.ajax) {
				uri = msos.registered_files.ajax[module_name];
				excluded = false;
				for (j = 0; j < exclude.length; j += 1) {
					if (uri.indexOf(exclude[j]) > 0) { excluded = true; }
				}
				if (excluded) {
					msos.console.debug(temp + ' - _scriptsLoad - excluded: ' + uri);
				} else {
					loadQueue.push(uri);
				}
			}

            for (i = 0; i < iLen; i += 1) {
                if (scripts[i].src && scripts[i].src !== "") {
					uri = scripts[i].src;
					excluded = false;
					for (j = 0; j < exclude.length; j += 1) {
						if (uri.indexOf(exclude[j]) > 0) { excluded = true; }
					}
					if (excluded) {
						msos.console.debug(temp + ' - _scriptsLoad - excluded: ' + uri);
					} else {
						loadQueue.push(uri);
					}
                } else {
                    this.s.scripts.push({
                        "src": "Inline script",
                        "code": scripts[i].text
                    });
                }
            }

            this._scriptLoadQueue(loadQueue);
        },

        "_scriptLoadQueue": function (loadQueue) {
            /* Check if we still have anything to do or not */
            if (loadQueue.length === 0) {
				msos.console.warn(temp + ' - _scriptLoadQueue -> called, no scripts.');
                return;
            }

            var that = this,
				url = loadQueue.shift();

            $.ajax({
                "dataType": 'text',
                "type": "GET",
                "url": url,
                "success": function (text) {
                    that.s.scripts.push({
                        "src": url,
                        "code": text
                    });
					if (loadQueue.length) {
						that._scriptLoadQueue(loadQueue);
					}
                },
                "error": function () {
					msos.console.error(temp + ' - _scriptLoadQueue -> failed for: ' + url);
                    that._scriptLoadQueue(loadQueue);
                }
            });
        },

        "_scriptSource": function (func) {
            var origin = "",
				srcFiles = [],
				i = 0,
				iLen = this.s.scripts.length,
				a;

            // Webkit reformats the prototype for the function, so the whitespace might not match our
            // intended target. Remove the prototype - it means we are more likely to get a clash, but
            // don't see much choice if we want to do matching other than trying all variations
            func = $.trim(func.replace(/^(function.*?\))/, ''));

            for (i = 0; i < iLen; i += 1) {
                if (this.s.scripts[i].code.indexOf(func) !== -1) {
                    a = this.s.scripts[i].code.split(func);
                    srcFiles.push({
                        "src": this.s.scripts[i].src,
                        "line": a[0].split('\n').length
                    });
                }
            }

            // Firefox reformats the functions from toString() rather than keeping the original format
            // so we'll never be able to find the original. Should we just return an empty string
            // for Firefox?
            if (srcFiles.length === 0) {
                origin = "Function definition could not be found automatically<br/>";
            } else if (srcFiles.length === 1) {
                origin = "Function, line " + srcFiles[0].line + ' in <a href="' + srcFiles[0].src + '">' + this._scriptName(srcFiles[0].src) + '</a><br/>';
            } else {
                origin = "Function could originate in multiple locations:<br/>";
				iLen = srcFiles.length;
                for (i = 0; i < iLen; i += 1) {
                    origin += (i + 1) + '. line ' + srcFiles[0].line + ' in <a href="' + srcFiles[0].src + '">' + this._scriptName(srcFiles[0].src) + '</a><br/>';
                }
            }

			if (srcFiles.length === 0) {
				origin = "Function definition could not be found automatically<br/>";
			} else if (srcFiles.length === 1) {
				origin = "Function, line " + srcFiles[0].line + ' in ';
				if (srcFiles[0].src != 'Inline script') {
					origin += '<a href="' + srcFiles[0].src + '">' + this._scriptName(srcFiles[0].src) + '</a><br/>';
				} else {
					origin += srcFiles[0].src + '<br/>';
				}
			} else {
				origin = "Function could originate in multiple locations:<br/>";
				for (i = 0; i < iLen; i += 1) {
					origin += (i + 1) + '. line ' + srcFiles[i].line + ' in <a href="' + srcFiles[i].src + '" target="_blank">' + this._scriptName(srcFiles[i].src) + '</a><br/>';
				}
			}

            return origin;
        },

        "_scriptName": function (src) {
            var a = src.split('/');
            return a[a.length - 1];
        },

        "_eventsLoad": function (ve_dom_elm) {
            var that = this,
				i = 0,
				elements = [],
				v_parsers = this.parsers,
                libraryListeners,
				dom_array = [],
				target_ids = { html_body: 'body' };

			msos.console.debug(temp + ' - _eventsLoad -> start.');

			function get_dom_tree(elm) {
				var child = null;

				dom_array.push(elm);

				if (elm.hasChildNodes()) {
					child = elm.firstChild;
					while (child) {
						if (child.nodeType === 1
						 && child.nodeName != 'SCRIPT'
						 && child.nodeName != 'IFRAME') {
							if (child.id && _.indexOf(that.ignore, child.id) === -1) {
								get_dom_tree(child);
								target_ids[child.id] = child.tagName.toLowerCase() + '#' + child.id;
							} else if (!child.id) {
								get_dom_tree(child);
							}
						}
						child = child.nextSibling;
					}
				}
			}

			// If an input elm, add it to the targets available (to show in select)
			if (ve_dom_elm) {
				target_ids[ve_dom_elm.id] = ve_dom_elm.tagName.toLowerCase() + '#' + ve_dom_elm.id;
			} else {
				jQuery(document).each(function(i, elem) { dom_array.push(elem); });
				ve_dom_elm = msos.body;
			}

			// Build our DOM node array
			get_dom_tree(ve_dom_elm);

			this.targetable_ids = target_ids;

			msos.console.debug(temp + ' - _eventsLoad -> dom array length: ' + dom_array.length + ', parsers length: ' + v_parsers.length);

            /* Gather the events from the supported libraries */
            for (i = 0; i < v_parsers.length; i += 1) {

				msos.console.debug(temp + ' - _eventsLoad -> start parser: ' + i);

                try {
                    libraryListeners = v_parsers[i](dom_array);
                    elements = elements.concat(libraryListeners);
                } catch (e) {
					msos.console.error(temp + ' - _eventsLoad -> error: ' + e);
				}
            }

			msos.console.debug(temp + ' - _eventsLoad -> done!');
			return elements;
        },

        "_eventElement": function (eventNode) {
            var that = this,
				pos,
				label,
				evt_node = $(eventNode.node);

			if (msos.var_is_empty(eventNode.node)) {
				msos.console.error(temp + ' - _eventElement -> missing event node:', eventNode);
				return;
			}

			msos.console.debug(temp + ' - _eventElement -> start, for: ' + (evt_node.attr('id') || evt_node.attr('class') || eventNode.node.nodeName.toLowerCase() ));

            // Element is hidden
            if (evt_node.filter(':visible').length === 0) {
                this.s.nonDomEvents += 1;
                return;
            }

            pos = evt_node.offset();

            label = document.createElement('div');
            label.style.position = "absolute";
            label.style.top = pos.top + "px";
            label.style.left = pos.left + "px";
            label.className = 'EventLabel Event_bg_' + this._getColorFromTypes(eventNode.listeners);

            /* If dealing with the html or body tags, don't paint over the whole screen */
            if (eventNode.node !== document.body
			 && eventNode.node !== document.documentElement) {
                label.style.width =  (eventNode.node.offsetWidth  - 4) + 'px';
                label.style.height = (eventNode.node.offsetHeight - 4) + 'px';
            }

            /* Event listeners for showing the lightbox for this element */
            $(label).bind(
				'dblclick.VisualEvent',
				function () {
					this.style.display = "none";
					return false;
				}
			).bind(
				'click.VisualEvent',
				function (e) {
					that.dom.activeEventNode = this;
					that._lightboxList(e, eventNode.node, eventNode.listeners);
				}
			);

            /* Finally have the html engine render our output */
            this.dom.display.appendChild(label);
        },

        "_lightboxList": function (e, node, listeners) {
            var i = 0,
				iLen = listeners.length,
				ul;

            this._timerClear();

            $('i', this.dom.lightbox).html(this._renderNodeInfo(node));
            $('div.Event_Code', this.dom.lightbox).empty();

            ul = $('ul', this.dom.lightbox).empty();
            for (i = 0; i < iLen; i += 1) {
                ul.append($('<li>' + listeners[i].type + '</li>').bind('mouseover.VisualEvent', this._lightboxCode(e, node, listeners[i])));
            }

            /* Show the code for the first event in the list */
            $('li:eq(0)', this.dom.lightbox).mouseover();

			$(this.dom.lightbox).css({ display: 'block' });
        },

		"_lightboxCode": function (e, node, listener) {
            var that = this;

            return function () {
                $('li', this.parentNode).removeClass('Event_EventSelected');
                $(this).addClass('Event_EventSelected');

                var evt = that._createEvent(e, listener.type, e.target);

                that._renderCode(
					e,
					listener.func,
					listener.source,
					listener.type,
					evt === null ? null : function () {
						node.dispatchEvent(evt);

						// Have to let any animations finish
						setTimeout(
							function () {
								var target_val = $('#Event_Target').val();
								that.reInit(target_val);
							},
							500
						);
					}
				);
            };
        },

        "_lightboxHide": function () {
            var that = this;
            this.s.mouseTimer = setTimeout(
				function () {
					that.dom.lightbox.style.display = 'none';
				},
				200
			);
        },

        "_renderCode": function (e, func, source, type, trigger) {
            var lines,
				last;

            this._timerClear(e);

            if (trigger === null) {
                $('div.Event_Code', this.dom.lightbox).html(
					'<div id="Event_inner">' +
						'<p><i>' + type + '</i> subscribed by ' + source + '<br/>' + this._scriptSource(func) + '</p>' +
						'<pre id="Event_code" class="brush: js"></pre>' +
					'</div>'
				);
            } else {
                $('div.Event_Code', this.dom.lightbox).html(
					'<div id="Event_inner">' +
						'<p><i>' + type + '</i> subscribed by ' + source + ' ' + '<span id="Event_Trigger" class="btn btn-success">Fire</span><br/>' + this._scriptSource(func) + '</p>' +
						'<pre id="Event_code" class="brush: js"></pre>' +
					'</div>'
				);
                $('#Event_Trigger').bind('click.VisualEvent', trigger);
            }

            /* Modify the function slightly such that the white space that is found at the start of the
             * last line in the function is also put at the start of the first line. This allows
             * SyntaxHighlighter to be cunning and remove the block white space - otherwise it is all
             * shifted to the left, other than the first line
             */
            lines = func.split('\n');

            if (lines.length > 1) {
                last = lines[lines.length - 1].match(/^(\s*)/g);
                lines[0] = last + lines[0];
                func = lines.join('\n');
            }

            /* Inject the function string here incase it includes a '</textarea>' string */
            $('pre', this.dom.lightbox).html(
				func.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
			);

			// Must turn 'toolbar' and 'quick-code' off. They add hundreds of syntaxhighlight events to all nodes
            SyntaxHighlighter.highlight(
				{ 'toolbar' : false, 'quick-code' : false },
				document.getElementById('Event_code')
			);
        },

        "_renderNodeInfo": function (node) {
            var s = node.nodeName.toLowerCase(),
				id = node.getAttribute('id'),
				className = '';

            if (id && id !== '') {
                s += '#' + id;
            }

            className = node.className;

            if (className !== '') {
                s += '.' + className;
            }

            return s;
        },

        "_renderLabel": function () {
            var that = this,
                events = 0,
                i = 0,
				iLen = this.s.elements.length;

            for (i = 0; i < iLen; i += 1) {
                events += this.s.elements[i].listeners.length;
            }

            $('span.Event_LabelEvents',	this.dom.label).html(events);
            $('span.Event_LabelNodes',	this.dom.label).html(this.s.elements.length);
            $('span.Event_LabelNonDom', this.dom.label).html(this.s.nonDomEvents);

            //this.dom.label.innerHTML = "Visual Event";
            $('span.Event_LabelClose', this.dom.label).bind('click.VisualEvent', function () {
                that.close();
            });

            $('span.Event_LabelHelp', this.dom.label).bind(
				'click.VisualEvent',
				function () {
					that._help();
				}
			);

            $(this.dom.help).bind(
				'click.VisualEvent',
				function () {
					that._hideHelp();
				}
			);
        },

        "_createEvent": function (originalEvt, type, target) {
            var evt = null,
				offset = $(target).offset(),
				typeGroup = this._eventTypeGroup(type);

            if (document.createEvent) {
                switch (typeGroup) {
                case 'mouse':
                    evt = document.createEvent("MouseEvents");
                    evt.initMouseEvent(type, true, true, window, 0, offset.left, offset.top, offset.left, offset.top, originalEvt.ctrlKey, originalEvt.altKey, originalEvt.shiftKey, originalEvt.metaKey, originalEvt.button, null);
                    break;

                case 'html':
                    evt = document.createEvent("HTMLEvents");
                    evt.initEvent(type, true, true);
                    break;

                case 'ui':
                    evt = document.createEvent("UIEvents");
                    evt.initUIEvent(type, true, true, window, 0);
                    break;

                default:
                    break;
                }
            } else if (document.createEventObject) {
                switch (typeGroup) {
                case 'mouse':
                    evt = document.createEventObject();
                    evt.screenX = offset.left;
                    evt.screenX = offset.top;
                    evt.clientX = offset.left;
                    evt.clientY = offset.top;
                    evt.ctrlKey = originalEvt.ctrlKey;
                    evt.altKey = originalEvt.altKey;
                    evt.metaKey = originalEvt.metaKey;
                    evt.button = originalEvt.button;
                    evt.relatedTarget = null;
                    break;

                case 'html':
                    /* fall through to basic event object */

                case 'ui':
                    evt = document.createEventObject();
                    break;

                default:
                    break;
                }
            }

            return evt;
        },

        "_timerClear": function () {
            if (this.s.mouseTimer !== null) {
                clearTimeout(this.s.mouseTimer);
                this.s.mouseTimer = null;
            }
        },

        "_eventTypeGroup": function (type) {
            switch (type) {
            case 'click':
            case 'dblclick':
            case 'mousedown':
            case 'mousemove':
            case 'mouseout':
            case 'mouseover':
            case 'mouseup':
            case 'scroll':
                return 'mouse';

            case 'change':
            case 'focus':
            case 'blur':
            case 'select':
            case 'submit':
                return 'html';

            case 'keydown':
            case 'keypress':
            case 'keyup':
            case 'load':
            case 'unload':
                return 'ui';

            default:
                return 'custom';
            }
        },

        "_getColorFromTypes": function (events) {
            var hasMouse = false,
				hasHtml = false,
				hasUi = false,
				group,
				i = 0;

            for (i = 0; i < events.length; i += 1) {
                group = this._eventTypeGroup(events[i].type);

                switch (group) {
                case 'mouse':
                    hasMouse = true;
                    break;

                case 'html':
                    hasHtml = true;
                    break;

                case 'ui':
                    /* We call 'custom' and 'unknown' types UI as well */
                    hasUi = true;
                    break;

                default:
                    hasUi = true;
                    break;
                }
            }

            if (hasMouse && hasHtml && hasUi) {
                return 'black';
            }
			if (!hasMouse && hasHtml && hasUi) {
                return 'orange';
            }
			if (hasMouse && !hasHtml && hasUi) {
                return 'purple';
            }
			if (hasMouse && hasHtml && !hasUi) {
                return 'green';
            }
			if (hasMouse) {
                return 'blue';
            }
			if (hasHtml) {
                return 'yellow';
            }
			if (hasUi) {
                return 'red';
            }
			return 'white';
        }
    };

}(window, document, jQuery));

