
/** File: strophe.js
 *  A JavaScript library for XMPP BOSH.
 *
 *  This is the JavaScript version of the Strophe library.  Since JavaScript
 *  has no facilities for persistent TCP connections, this library uses
 *  Bidirectional-streams Over Synchronous HTTP (BOSH) to emulate
 *  a persistent, stateful, two-way connection to an XMPP server.  More
 *  information on BOSH can be found in XEP 124.
 *
 *  This program is distributed under the terms of the MIT license.
 *  Please see the LICENSE file for details.
 *  Copyright 2006-2008, OGG, LLC
 */

/*global
	DOMParser: false,
    XMLHttpRequest: false,
    ActiveXObject: false,
    Strophe: true,
    msos: false,
    _: false,
    $build: true,
    $msg: true,
    $iq: true,
    $pres: true,
*/

(function (callback) {
	"use strict";

	var Strophe,
		stph_bld = 'Strophe.Builder - ',
		stph_con = 'Strophe.Connection - ',
		stph_hdl = 'Strophe.Handler - ';

	function $build(name, attrs)	{ return new Strophe.Builder(name, attrs);			}
	function $msg(attrs)			{ return new Strophe.Builder("message", attrs);		}
	function $iq(attrs)				{ return new Strophe.Builder("iq", attrs);			}
	function $pres(attrs)			{ return new Strophe.Builder("presence", attrs);	}

	Strophe = {

		VERSION: "1.0.2",

		/* XMPP Namespace Constants */
		NS: {
			HTTPBIND:		"http://jabber.org/protocol/httpbind",
			BOSH:			"urn:xmpp:xbosh",
			CLIENT:			"jabber:client",
			AUTH:			"jabber:iq:auth",
			ROSTER:			"jabber:iq:roster",
			PROFILE:		"jabber:iq:profile",
			DISCO_INFO:		"http://jabber.org/protocol/disco#info",
			DISCO_ITEMS:	"http://jabber.org/protocol/disco#items",
			MUC:			"http://jabber.org/protocol/muc",
			SASL:			"urn:ietf:params:xml:ns:xmpp-sasl",
			STREAM:			"http://etherx.jabber.org/streams",
			BIND:			"urn:ietf:params:xml:ns:xmpp-bind",
			SESSION:		"urn:ietf:params:xml:ns:xmpp-session",
			VERSION:		"jabber:iq:version",
			STANZAS:		"urn:ietf:params:xml:ns:xmpp-stanzas",
			XHTML_IM:		"http://jabber.org/protocol/xhtml-im",
			XHTML:			"http://www.w3.org/1999/xhtml"
		},

		XHTML: {
			tags: ['a', 'blockquote', 'br', 'cite', 'em', 'img', 'li', 'ol', 'p', 'span', 'strong', 'ul', 'body'],
			attributes: {
				'a':          ['href'],
				'blockquote': ['style'],
				'br':         [],
				'cite':       ['style'],
				'em':         [],
				'img':        ['src', 'alt', 'style', 'height', 'width'],
				'li':         ['style'],
				'ol':         ['style'],
				'p':          ['style'],
				'span':       ['style'],
				'strong':     [],
				'ul':         ['style'],
				'body':       []
			},

			css: [
				'background-color', 'color',
				'font-family', 'font-size', 'font-style', 'font-weight',
				'margin-left', 'margin-right',
				'text-align', 'text-decoration'
			],

			validTag: function (tag) {
				var i = 0;
				for (i = 0; i < Strophe.XHTML.tags.length; i += 1) {
					if (tag === Strophe.XHTML.tags[i]) {
						return true;
					}
				}
				return false;
			},

			validAttribute: function (tag, attribute) {
				var i = 0;

				if (Strophe.XHTML.attributes[tag] !== undefined
				 && Strophe.XHTML.attributes[tag].length > 0) {
					for (i = 0; i < Strophe.XHTML.attributes[tag].length; i += 1) {
						if (attribute === Strophe.XHTML.attributes[tag][i]) {
							return true;
						}
					}
				}
				return false;
			},

			validCSS: function (style) {
				var i = 0;

				for (i = 0; i < Strophe.XHTML.css.length; i += 1) {
					if (style === Strophe.XHTML.css[i]) {
						return true;
					}
				}
				return false;
			}
		},

		addNamespace: function (name, value) {
			Strophe.NS[name] = value;
		},

		/* Connection Status Constants */
		Status: {
			ERROR: 0,
			CONNECTING: 1,
			CONNFAIL: 2,
			AUTHENTICATING: 3,
			AUTHFAIL: 4,
			CONNECTED: 5,
			DISCONNECTED: 6,
			DISCONNECTING: 7,
			ATTACHED: 8
		},

		status_name : ['ERROR', 'CONNECTING', 'CONNFAIL', 'AUTHENTICATING', 'AUTHFAIL', 'CONNECTED', 'DISCONNECTED', 'DISCONNECTING', 'ATTACHED'],

		ElementType: {
			NORMAL: 1,
			TEXT: 3,
			CDATA: 4,
			FRAGMENT: 11
		},

		/* PrivateConstants: Timeout Values
		 * TIMEOUT - Math.floor(TIMEOUT * wait) seconds have elapsed, (default: 1.1, for a wait of 66 seconds).
		 * SECONDARY_TIMEOUT - Math.floor(SECONDARY_TIMEOUT * wait) seconds have elapsed, (default: 0.1, for a wait of 6 seconds).
		 */
		TIMEOUT: 1.1,
		SECONDARY_TIMEOUT: 0.1,

		forEachChild: function (elem, func) {
			var i, childNode;

			for (i = 0; i < elem.childNodes.length; i += 1) {
				childNode = elem.childNodes[i];
				if (childNode.nodeType === Strophe.ElementType.NORMAL) { func(childNode); }
			}
		},

		_xmlGenerator: null,

		xmlGenerator: function () {
			if (!Strophe._xmlGenerator) {
				var doc = document.implementation.createDocument('jabber:client', 'strophe', null);
				Strophe._xmlGenerator = doc;
			}
			return Strophe._xmlGenerator;
		},

		xmlElement: function (name) {
			if (!name) { return null; }

			var node = Strophe.xmlGenerator().createElement(name),
				a = 0,
				i = 0,
				k = '';

			for (a = 1; a < arguments.length; a += 1) {
				if (!msos.var_is_empty(arguments[a])) {
					if (typeof arguments[a] === "string" ||
						typeof arguments[a] === "number") {
						node.appendChild(Strophe.xmlTextNode(arguments[a]));
					} else if (typeof arguments[a] === "object" &&
							   typeof arguments[a].sort === "function") {
						for (i = 0; i < arguments[a].length; i += 1) {
							if (typeof arguments[a][i] === "object" &&
								typeof arguments[a][i].sort === "function") {
								node.setAttribute(arguments[a][i][0], arguments[a][i][1]);
							}
						}
					} else if (typeof arguments[a] === "object") {
						for (k in arguments[a]) {
							node.setAttribute(k, arguments[a][k]);
						}
					}
				}
			}
			return node;
		},

		xmlescape: function (text) {
			if (msos.var_is_empty(text)) {
				msos.console.warn('Strophe.xmlescape -> missing input!');
				return '';
			}
			text = text.replace(/\&/g, "&amp;");
			text = text.replace(/</g,  "&lt;");
			text = text.replace(/>/g,  "&gt;");
			text = text.replace(/'/g,  "&apos;");
			text = text.replace(/"/g,  "&quot;");
			return text;
		},

		xmlTextNode: function (text) {
			return Strophe.xmlGenerator().createTextNode(text);
		},

		xmlHtmlNode: function (html) {

			var doc = null,
				dbg = '',
				parser;

			if (window.DOMParser) {
				dbg = 'DOMParser';
				parser = new DOMParser();
				// Because FF wants valid XML, with correct namespaces!
				doc = parser.parseFromString("<body xmlns:stream='foo' >" + html + "</body>", "text/xml").documentElement.firstChild;
			} else if (window.ActiveXObject) {
				dbg = 'ActiveXObject';
				doc = new ActiveXObject("MSXML2.DOMDocument");
				doc.async = false;
				doc.preserveWhiteSpace = true;
				doc.loadXML(html);
			} else {
				msos.console.error("Strophe.xmlHtmlNode -> error: parser na!");
			}

			if (msos.config.query.domparse) {
				msos.console.debug("Strophe.xmlHtmlNode -> via: " + dbg + ", from: " + html);
			}

			return doc;
		},

		getText: function (elem) {

			if (!elem) { return null; }

			var str = '',
				i = 0;

			if (elem.childNodes.length === 0
			 && elem.nodeType === Strophe.ElementType.TEXT) {
				str += elem.nodeValue;
			}

			for (i = 0; i < elem.childNodes.length; i += 1) {
				if (elem.childNodes[i].nodeType === Strophe.ElementType.TEXT) {
					str += elem.childNodes[i].nodeValue;
				}
			}

			return Strophe.xmlescape(str);
		},

		copyElement: function (elem) {
			var i = 0,
				el;

			if (elem.nodeType === Strophe.ElementType.NORMAL) {
				el = Strophe.xmlElement(elem.tagName);

				for (i = 0; i < elem.attributes.length; i += 1) {
					el.setAttribute(
						elem.attributes[i].nodeName.toLowerCase(),
						elem.attributes[i].value
					);
				}

				for (i = 0; i < elem.childNodes.length; i += 1) {
					el.appendChild(Strophe.copyElement(elem.childNodes[i]));
				}
			} else if (elem.nodeType === Strophe.ElementType.TEXT) {
				el = Strophe.xmlGenerator().createTextNode(elem.nodeValue);
			}

			return el;
		},

		createHtml: function (elem) {
			var i = 0,
				el,
				j = 0,
				tag,
				attribute,
				value,
				css,
				cssAttrs,
				attr,
				cssName,
				cssValue;

			msos.console.debug('Strophe.createHtml -> called.');

			if (elem.nodeType === Strophe.ElementType.NORMAL) {
				tag = elem.nodeName.toLowerCase();
				if (Strophe.XHTML.validTag(tag)) {
					try {
						el = Strophe.xmlElement(tag);
						for (i = 0; i < Strophe.XHTML.attributes[tag].length; i += 1) {
							attribute = Strophe.XHTML.attributes[tag][i];
							value = elem.getAttribute(attribute);
							if (!msos.var_is_empty(value) && value !== false && value !== 0) {
								if (attribute === 'style' && typeof value === 'object') {
									if (value.cssText !== undefined) {
										value = value.cssText;
									}
								}
								// filter out invalid css styles
								if (attribute === 'style') {
									css = [];
									cssAttrs = value.split(';');
									for (j = 0; j < cssAttrs.length; j += 1) {
										attr = cssAttrs[j].split(':');
										cssName = attr[0].replace(/^\s*/, "").replace(/\s*$/, "").toLowerCase();
										if (Strophe.XHTML.validCSS(cssName)) {
											cssValue = attr[1].replace(/^\s*/, "").replace(/\s*$/, "");
											css.push(cssName + ': ' + cssValue);
										}
									}
									if (css.length > 0) {
										value = css.join('; ');
										el.setAttribute(attribute, value);
									}
								} else {
									el.setAttribute(attribute, value);
								}
							}
						}

						for (i = 0; i < elem.childNodes.length; i += 1) {
							el.appendChild(Strophe.createHtml(elem.childNodes[i]));
						}
					} catch (e) { // invalid elements
					  el = Strophe.xmlTextNode('');
					  msos.console.warn('Strophe - createHtml -> invalid elements in: ' + tag + ', error: ' + e);
					}
				} else {
					el = Strophe.xmlGenerator().createDocumentFragment();
					for (i = 0; i < elem.childNodes.length; i += 1) {
						el.appendChild(Strophe.createHtml(elem.childNodes[i]));
					}
				}
			} else if (elem.nodeType === Strophe.ElementType.FRAGMENT) {
				el = Strophe.xmlGenerator().createDocumentFragment();
				for (i = 0; i < elem.childNodes.length; i += 1) {
					el.appendChild(Strophe.createHtml(elem.childNodes[i]));
				}
			} else if (elem.nodeType === Strophe.ElementType.TEXT) {
				el = Strophe.xmlTextNode(elem.nodeValue);
			}

			return el;
		},

		escapeNode: function (node) {
			if (msos.var_is_empty(node)) {
				msos.console.warn('Strophe.escapeNode -> missing input!');
				return '';
			}
			return node.replace(/^\s+|\s+$/g, '')
				.replace(/\\/g,  "\\5c")
				.replace(/ /g,   "\\20")
				.replace(/\"/g,  "\\22")
				.replace(/\&/g,  "\\26")
				.replace(/\'/g,  "\\27")
				.replace(/\//g,  "\\2f")
				.replace(/:/g,   "\\3a")
				.replace(/</g,   "\\3c")
				.replace(/>/g,   "\\3e")
				.replace(/@/g,   "\\40");
		},

		unescapeNode: function (node) {
			if (msos.var_is_empty(node)) {
				msos.console.warn('Strophe.unescapeNode -> missing input!');
				return '';
			}
			return node.replace(/\\20/g, " ")
				.replace(/\\22/g, '"')
				.replace(/\\26/g, "&")
				.replace(/\\27/g, "'")
				.replace(/\\2f/g, "/")
				.replace(/\\3a/g, ":")
				.replace(/\\3c/g, "<")
				.replace(/\\3e/g, ">")
				.replace(/\\40/g, "@")
				.replace(/\\5c/g, "\\");
		},

		getNodeFromJid: function (jid) {
			var out = null;

			if (jid.indexOf("@") < 0) {
				msos.console.debug('Strophe.getNodeFromJid -> called, node: null');
				return out;
			}
			out = jid.split("@")[0];

			if (msos.config.verbose) {
				msos.console.debug('Strophe.getNodeFromJid -> called, node: ' + out);
			}
			return out;
		},

		getDomainFromJid: function (jid) {
			var bare = Strophe.getBareJidFromJid(jid),
				parts = [],
				out;

			if (bare.indexOf("@") < 0) {
				msos.console.debug('Strophe.getDomainFromJid -> called, domain: ' + bare);
				return bare;
			}

			parts = bare.split("@");
			parts.splice(0, 1);

			out = parts.join('@');

			if (msos.config.verbose) {
				msos.console.debug('Strophe.getDomainFromJid -> called, domain: ' + out);
			}
			return out;
		},

		getResourceFromJid: function (jid) {
			var s = jid.split("/"),
				out = null;

			if (s.length < 2) {
				msos.console.debug('Strophe.getResourceFromJid -> called, resource: null');
				return out;
			}

			s.splice(0, 1);
			out = s.join('/');

			if (msos.config.verbose) {
				msos.console.debug('Strophe.getResourceFromJid -> called, resource: ' + out);
			}
			return out;
		},

		getBareJidFromJid: function (jid) {
			var out = jid ? jid.split("/")[0] : null;

			msos.console.debug('Strophe.getBareJidFromJid -> called, bare: ' + out);
			return out;
		},

		serialize: function (elem) {
			var nodeName,
				result,
				i,
				child;

			if (msos.config.query.serialize) {
				msos.console.debug('Strophe.serialize -> start.');
			}

			if (msos.var_is_empty(elem)) {
				msos.console.warn('Strophe.serialize -> done, no elem!');
				return null;
			}

			if (typeof elem.tree === "function") {
				elem = elem.tree();
			}

			nodeName = elem.nodeName;

			if (elem.getAttribute("_realname")) {
				nodeName = elem.getAttribute("_realname");
			}

			result = "<" + nodeName;
			for (i = 0; i < elem.attributes.length; i += 1) {
				if (elem.attributes[i].nodeName !== "_realname") {
					result += " " + elem.attributes[i].nodeName.toLowerCase() +
						"='" + elem.attributes[i].value
							.replace(/&/g,	"&amp;")
							.replace(/\'/g,	"&apos;")
							.replace(/>/g,	"&gt;")
							.replace(/</g,	"&lt;") + "'";
				}
			}

			if (elem.childNodes.length > 0) {
				result += ">";
				for (i = 0; i < elem.childNodes.length; i += 1) {
					child = elem.childNodes[i];
					switch(child.nodeType){
						case Strophe.ElementType.NORMAL:
							// normal element, so recurse
							result += Strophe.serialize(child);
						break;
						case Strophe.ElementType.TEXT:
							// text element to escape values
							result += Strophe.xmlescape(child.nodeValue);
						break;
						case Strophe.ElementType.CDATA:
							// cdata section so don't escape values
							result += "<![CDATA[" + child.nodeValue + "]]>";
						break;
					}
				}
				result += "</" + nodeName + ">";
			} else {
				result += "/>";
			}

			if (msos.config.query.serialize) {
				msos.console.debug('Strophe.serialize -> done, output: ' + result);
			}
			return result;
		},

		_requestId: 0,

		_connectionPlugins: {},

		addConnectionPlugin: function (name, ptype) {
			Strophe._connectionPlugins[name] = ptype;
		}
	};

	Strophe.Builder = function (name, attrs) {
		// Set correct namespace for jabber:client elements
		if (name === "presence" || name === "message" || name === "iq") {
			if (attrs && !attrs.xmlns) {
				attrs.xmlns = Strophe.NS.CLIENT;
			} else if (!attrs) {
				attrs = { xmlns: Strophe.NS.CLIENT };
			}
		}

		// Holds the tree being built.
		this.nodeTree = Strophe.xmlElement(name, attrs);

		// Points to the current operation node.
		this.node = this.nodeTree;
	};

	Strophe.Builder.prototype = {

		tree: function () {
			return this.nodeTree;
		},

		toString: function () {
			return Strophe.serialize(this.nodeTree);
		},

		up: function () {
			this.node = this.node.parentNode;
			return this;
		},

		attrs: function (moreattrs) {
			var k = '';

			for (k in moreattrs) {
				this.node.setAttribute(k, moreattrs[k]);
			}
			return this;
		},

		c: function (name, attrs, text) {
			var child = Strophe.xmlElement(name, attrs, text);

			this.node.appendChild(child);

			if (!text) {
				this.node = child;
			}
			return this;
		},

		cnode: function (elem) {
			var xmlGen = Strophe.xmlGenerator(),
				impNode = false,
				newElem;

			try {
				impNode = (xmlGen.importNode !== undefined);
			}
			catch (e) {
				impNode = false;
				msos.console.warn(stph_bld + 'cnode -> error: ' + e);
			}
			newElem = impNode ?
				xmlGen.importNode(elem, true) :
				Strophe.copyElement(elem);

			this.node.appendChild(newElem);
			this.node = newElem;

			return this;
		},

		t: function (text) {
			var child = Strophe.xmlTextNode(text);
			this.node.appendChild(child);
			return this;
		},

		h: function (html) {
			var fragment = document.createElement('body'),
				xhtml;

			// force the browser to try and fix any invalid HTML tags
			fragment.innerHTML = html;

			// copy cleaned html into an xml dom
			xhtml = Strophe.createHtml(fragment);

			while (xhtml.childNodes.length > 0) {
				this.node.appendChild(xhtml.childNodes[0]);
			}
			return this;
		}
	};

	Strophe.Handler = function (handler, ns, name, type, id, from, options) {
		this.handler = handler;
		this.ns = ns;
		this.name = name;
		this.type = type;
		this.id = id;
		this.options = options || { matchBare: false };

		// default matchBare to false if undefined
		if (!this.options.matchBare) {
			this.options.matchBare = false;
		}

		if (this.options.matchBare) {
			this.from = from ? Strophe.getBareJidFromJid(from) : null;
		} else {
			this.from = from;
		}

		this.user = true;
	};

	Strophe.Handler.prototype = {

		isMatch: function (elem) {
			var nsMatch,
				from = null,
				that = this;

			if (this.options.matchBare) {
				from = Strophe.getBareJidFromJid(elem.getAttribute('from'));
			} else {
				from = elem.getAttribute('from');
			}

			nsMatch = false;

			if (!this.ns) {
				nsMatch = true;
			} else {
				Strophe.forEachChild(
					elem,
					function (elem) {
						if (elem.getAttribute("xmlns") === that.ns) {
							nsMatch = true;
						}
					}
				);
				nsMatch = nsMatch || elem.getAttribute("xmlns") === this.ns;
			}

			if (nsMatch &&
				(!this.name	|| elem.tagName.toLowerCase() === this.name.toLowerCase()) &&
				(!this.type	|| elem.getAttribute("type") === this.type) &&
				(!this.id	|| elem.getAttribute("id") === this.id) &&
				(!this.from	|| from === this.from)) {
					return true;
			}

			return false;
		},

		run: function (elem) {
			var result = null;

			try {
				result = this.handler(elem);
			} catch (e) {
				if (e.sourceURL) {
					msos.console.error(stph_hdl + "run -> error w/url: " + this.handler + " " + e.sourceURL + ":" + e.line + " - " + e.name + ": " + e.message);
				} else if (e.fileName) {
					msos.console.error(stph_hdl + "run -> error w/file: " + this.handler + " " + e.fileName + ":" + e.lineNumber + " - " + e.name + ": " + e.message);
				} else if (e.stack) {
					msos.console.error(stph_hdl + "run -> error w/stack: " + e.message + "\n" + e.stack);
				} else {
					msos.console.error(stph_hdl + "run -> error plain: " + e);
				}
			}

			return result;
		},

		toString: function () {
			return "{ Handler: " + this.handler + "(" + this.name + "," + this.id + "," + this.ns + ") }";
		}
	};

	Strophe.Handler = function (handler, ns, name, type, id, from, options) {
		this.handler = handler;
		this.ns = ns;
		this.name = name;
		this.type = type;
		this.id = id;
		this.options = options || { matchBare: false };

		// default matchBare to false if undefined
		if (!this.options.matchBare) {
			this.options.matchBare = false;
		}

		if (this.options.matchBare) {
			this.from = from ? Strophe.getBareJidFromJid(from) : null;
		} else {
			this.from = from;
		}

		this.user = true;
	};

	Strophe.Handler.prototype = {

		isMatch: function (elem) {
			var nsMatch,
				from = null,
				that = this;

			if (this.options.matchBare) {
				from = Strophe.getBareJidFromJid(elem.getAttribute('from'));
			} else {
				from = elem.getAttribute('from');
			}

			nsMatch = false;

			if (!this.ns) {
				nsMatch = true;
			} else {
				Strophe.forEachChild(
					elem,
					function (elem) {
						if (elem.getAttribute("xmlns") === that.ns) {
							nsMatch = true;
						}
					}
				);
				nsMatch = nsMatch || elem.getAttribute("xmlns") === this.ns;
			}

			if (nsMatch &&
				(!this.name	|| elem.tagName.toLowerCase() === this.name.toLowerCase()) &&
				(!this.type	|| elem.getAttribute("type") === this.type) &&
				(!this.id	|| elem.getAttribute("id") === this.id) &&
				(!this.from	|| from === this.from)) {
					return true;
			}

			return false;
		},

		run: function (elem) {
			var result = null;

			try {
				result = this.handler(elem);
			} catch (e) {
				if (e.sourceURL) {
					msos.console.error(stph_hdl + "run -> error w/url: " + this.handler + " " + e.sourceURL + ":" + e.line + " - " + e.name + ": " + e.message);
				} else if (e.fileName) {
					msos.console.error(stph_hdl + "run -> error w/file: " + this.handler + " " + e.fileName + ":" + e.lineNumber + " - " + e.name + ": " + e.message);
				} else if (e.stack) {
					msos.console.error(stph_hdl + "run -> error w/stack: " + e.message + "\n" + e.stack);
				} else {
					msos.console.error(stph_hdl + "run -> error plain: " + e);
				}
			}

			return result;
		},

		toString: function () {
			return "{ Handler: " + this.handler + "(" + this.name + "," + this.id + "," + this.ns + ") }";
		}
	};

	Strophe.TimedHandler = function (period, handler) {
		this.period = period;
		this.handler = handler;

		this.lastCalled = new Date().getTime();
		this.user = true;
	};

	Strophe.TimedHandler.prototype = {

		run: function () {
			this.lastCalled = new Date().getTime();
			return this.handler();
		},

		reset: function () {
			this.lastCalled = new Date().getTime();
		},

		toString: function () {
			return "{ TimedHandler: " + this.handler + "(" + this.period + ") }";
		}
	};

	Strophe.Connection = function (service) {

		/* The path to the httpbind service or websocket url. */
		this.service = service;

		this.jid = "";
		this.domain = null;
		this.features = null;

		this.rid = Math.floor(Math.random() * 4294967295);
		this.sid = null;

		this.streamId = null;
		this.resource = null;	// ws only

		this.do_session = false;
		this.do_bind = false;

		// Handler lists
		this.timedHandlers = [];
		this.handlers = [];
		this.removeTimeds = [];
		this.removeHandlers = [];
		this.addTimeds = [];
		this.addHandlers = [];

		this._idleTimeout = null;
		this._disconnectTimeout = null;

		this.authenticated = false;
		this.disconnecting = false;
		this.connected = false;
		this.errors = 0;

		this.paused = false;

		// Default values (BOSH only)
		this.hold = 1;
		this.wait = 60;
		this.window = 5;

		// Default values (ws only)
		this.ws = null;
		this.connect_timeout = 300;
		this._keep_alive_timer = 20000;

		this._data = [];
		this._requests = [];
		this._uniqueId = Math.round(Math.random() * 10000);

		this._idleTimeout = setTimeout(_.bind(this._onIdle, this), 100);

		var k = '',
			ptype,
			F;

		// Initialize plugins
		for (k in Strophe._connectionPlugins) {
			ptype = Strophe._connectionPlugins[k];

			F = function () {};
			F.prototype = ptype;

			this[k] = new F();
			this[k].init(this);
		}
	};

	Strophe.Connection.prototype = {

		reset: function () {

			this.rid = Math.floor(Math.random() * 4294967295);
			this.sid = null;

			this.streamId = null;

			this.do_session = false;
			this.do_bind = false;

			// Handler lists
			this.timedHandlers = [];
			this.handlers = [];
			this.removeTimeds = [];
			this.removeHandlers = [];
			this.addTimeds = [];
			this.addHandlers = [];

			this.authenticated = false;
			this.disconnecting = false;
			this.connected = false;

			this.errors = 0;

			this._requests = [];
			this._uniqueId = Math.round(Math.random() * 10000);
		},

		pause:	function () { this.paused = true; },
		resume:	function () { this.paused = false; },

		getUniqueId: function (suffix) {
			this._uniqueId += 1;

			if (typeof suffix === "string"
			 || typeof suffix === "number") {
				return this._uniqueId + ":" + suffix;
			}

			return String(this._uniqueId);
		},

		xmlInput:	function (elem) { return; },
		xmlOutput:	function (elem) { return; },

		rawInput:	function (data) { return; },
		rawOutput:	function (data) { return; },

		_changeConnectStatus: function (status, condition) {
			var k = '',
				plugin,
				debug = 'failed.';

			msos.console.debug(stph_con + "_changeConnectStatus -> start, for: " + Strophe.status_name[status] + ' (' + status + ')');

			// Notify all plugins listening for status changes
			for (k in Strophe._connectionPlugins) {
				plugin = this[k];

				if (plugin.statusChanged) { plugin.statusChanged(status, condition); }
			}

			// Notify the user's callback
			if (typeof this.connect_callback === 'function') {
				this.connect_callback(status, condition);
				debug = 'with callback function.';
			} else {
				debug = 'wwithout callback function.';
			}

			msos.console.debug(stph_con + "_changeConnectStatus -> done, " + (condition ? condition + ' ' : '') + debug);
		},

		// ------------------------------------
		// Start - WebSocket specific functions
		// ------------------------------------
		connect: function (jid, pass, callback) {

			msos.console.debug(stph_con + "connect -> start, jid: " + jid);

			this.jid = jid;
			this.authzid = Strophe.getBareJidFromJid(this.jid);
			this.authcid = Strophe.getNodeFromJid(this.jid);
			this.pass = pass;
			this.servtype = "xmpp";
			this.connect_callback = callback;
			this.disconnecting = false;
			this.connected = false;
			this.authenticated = false;
			this.errors = 0;

			// Parse jid for domain and resource
			this.domain = Strophe.getDomainFromJid(this.jid);
			this.resource = Strophe.getResourceFromJid(this.jid);

			this._changeConnectStatus(Strophe.Status.CONNECTING, null);

			// Start WebSocket specific code
			if (!this.ws) {

				this.ws = new WebSocket(this.service, this.servtype);

				this.ws.onopen =	_.bind(this._ws_on_open, this);
				this.ws.onerror =	_.bind(this._ws_on_error, this);
				this.ws.onclose =	_.bind(this._ws_on_close, this);
				this.ws.onmessage =	_.bind(this._ws_on_message, this);
			}
			// End WebSocket specific code
			msos.console.debug(stph_con + "connect -> done, jid: " + jid);
		},

		attach: function () { return; },
		flush:	function () { return; },

		send: function (elem) {
			var i = 0;

			msos.console.debug(stph_con + "send -> start.");

			if (msos.var_is_null(elem)) {
				msos.console.error(stph_con + "send -> done, missing input!");
				return;
			}

			if (typeof elem.sort === "function") {
				for (i = 0; i < elem.length; i += 1) {
					this._queueData(elem[i]);
				}
			} else if (typeof elem.tree === "function") {
				this._queueData(elem.tree());
			} else {
				this._queueData(elem);
			}

			clearTimeout(this._idleTimeout);

			this._idleTimeout = setTimeout(_.bind(this._onIdle, this), 100);

			msos.console.debug(stph_con + "send -> done!");
		},

		_doDisconnect: function () {
			msos.console.debug(stph_con + "_doDisconnect -> start.");

			this.authenticated = false;
			this.disconnecting = false;
			this.sid = null;
			this.streamId = null;
			this.rid = Math.floor(Math.random() * 4294967295);

			// tell the parent we disconnected
			if (this.connected) {
				this._changeConnectStatus(Strophe.Status.DISCONNECTED, null);
				this.connected = false;
			}

			// delete handlers
			this.handlers = [];
			this.timedHandlers = [];
			this.removeTimeds = [];
			this.removeHandlers = [];
			this.addTimeds = [];
			this.addHandlers = [];

			if (this.ws.readyState !== this.ws.CLOSED) {
				this.ws.close();
			}

			this.ws = null;

			msos.console.debug(stph_con + "_doDisconnect -> done!");
		},

		_onDisconnectTimeout: function () {

			msos.console.debug(stph_con + "_onDisconnectTimeout -> start.");

			this._doDisconnect();

			msos.console.debug(stph_con + "_onDisconnectTimeout -> done!");
			return false;
		},

		_sendTerminate: function () {
			var stanza;

			msos.console.debug(stph_con + "_sendTerminate -> start.");

			this.disconnecting = true;

			if (this.authenticated) {
				stanza = $pres(
					{
						xmlns: Strophe.NS.CLIENT,
						type: 'unavailable'
					}
				);
				this.ws.send(stanza);
			} else if (this.ws.readyState !== this.ws.CLOSED) {
				this.ws.send('</stream:stream>');
			}

			msos.console.debug(stph_con + "_sendTerminate -> done!");
		},

		_buildBody: function (stanza) {

			var bodyWrap = $build(
					'body',
					{
						rid: this.rid,
						xmlns: Strophe.NS.HTTPBIND
					}
				);

			if (this.sid !== null) {
				bodyWrap.attrs({ sid: this.sid });
			}

			return bodyWrap.cnode(stanza);
		},

		_ws_on_open: function () {

			var elem,
				resource;

			msos.console.debug(stph_con + "_ws_on_open -> start.");

			// Connected, so acknowledge
			this.connected = true;

			this._addSysHandler(
				_.bind(this._session_cb, this),
				null,
				null,
				null,
				"_session_init"
			);

			this.sid = Math.floor(Math.random() * 4294967295);

			resource = Strophe.getResourceFromJid(this.jid);

			if (resource) {
				this.send(
					$iq(
						{ type: "set", id: "_session_init" }
					).c(
						'bind',
						{ xmlns: Strophe.NS.BIND }
					).c(
						'resource', {}
					).t(resource).tree());
			} else {
				this.send(
					$iq(
						{ type: "set", id: "_session_init" }
					).c(
						'bind',
						{ xmlns: Strophe.NS.BIND }).tree());
			}

			this._addSysTimedHandler(
				this._keep_alive_timer,
				_.bind(this._keep_alive_handler, this)
			);

			msos.console.debug(stph_con + "_ws_on_open -> done!");
		},

		_ws_on_message: function (message) {
			var string = message.data,
				elem,
				dbug = '';

			msos.console.debug(stph_con + "_ws_on_message -> start.");

			elem = Strophe.xmlHtmlNode(string);

			if (this.disconnecting
				&& elem.nodeName === "presence"
				&& elem.getAttribute("type") === "unavailable") {
				dbug = 'disconnecting, nodeName: '+ elem.nodeName;
			} else {
				elem = this._buildBody(elem).tree();
				dbug = 'success, nodeName: '+ elem.nodeName
				this._dataRecv(elem);
			}

			msos.console.debug(stph_con + "_ws_on_message -> done, success!");
		},

		_ws_on_error: function (e) {
			var msg = e.data || 'missing or bad connection.';
			msos.console.error(stph_con + "_ws_on_error -> error: " + msg, e);
		},

		_ws_on_close: function (ev) {
			msos.console.debug(stph_con + "_ws_on_close -> called.");
			this._doDisconnect();
		},

		_keep_alive_handler: function () {
			this.ws.send("\n");
			return true;
		},

		_session_cb: function (elem) {
			var bind,
				jidNode,
				jidText;

			msos.console.debug(stph_con + "_session_cb -> start.");

			if (elem.getAttribute("type") === "result") {

				bind = elem.getElementsByTagName("bind");

				if (bind.length > 0) {

					jidNode = bind[0].getElementsByTagName("jid");

					if (jidNode.length > 0) {

						jidText = Strophe.getText(jidNode[0]);

						this.jid = this.sid + '@' + Strophe.getDomainFromJid(jidText) + '/' + this.resource;
					}
				} else {
					this.jid = this.sid + '@' + this.domain + '/' + this.resource;
				}

				msos.console.debug(stph_con + "_session_cb -> authenticated for: " + this.jid);

				this.authenticated = true;
				this._changeConnectStatus(Strophe.Status.CONNECTED, null);

			} else if (elem.getAttribute("type") === "error") {
				msos.console.warn(stph_con + "_session_cb -> session creation failed.");
				this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
				return false;
			}

			msos.console.debug(stph_con + "_session_cb -> done!");
			return false;
		},

		_processRequest: function (stanza) {
			var tmp_r = '_processRequest -> ',
				xmlstring = '';

			msos.console.debug(stph_con + tmp_r + "start.");

			this.rid += 1;

			// Request ID
			stanza.setAttribute('rid', this.rid);

			// Session ID
			stanza.setAttribute('sid', this.sid);

			xmlstring = Strophe.serialize(stanza);

			this.ws.send(xmlstring);

			if (this.xmlOutput !== Strophe.Connection.prototype.xmlOutput) {
				this.xmlOutput(stanza);
			}
			if (this.rawOutput !== Strophe.Connection.prototype.rawOutput) {
				this.rawOutput(xmlstring);
			}

			msos.console.debug(stph_con + tmp_r + "done!");
		},

		_onIdle: function () {
			var data = this._data,
				i = 0;

			if (data.length > 0 && !this.paused) {
				for (i = 0; i < data.length; i += 1) {
					if (data[i] !== null) {
						this._processRequest(data[i]);
					}
				}
				this._data = [];
			}
		},
		// ----------------------------------
		// End - WebSocket specific functions
		// ----------------------------------

		_dataRecv: function (stanza) {

			msos.console.debug(stph_con + "_dataRecv -> start.");

			var i = 0,
				hand,
				typ,
				cond,
				conflict,
				that = this;

			if (stanza === null) {
				msos.console.warn(stph_con + "_dataRecv -> done, no stanza");
				return;
			}

			if (this.xmlInput !== Strophe.Connection.prototype.xmlInput) {
				this.xmlInput(stanza);
			}
			if (this.rawInput !== Strophe.Connection.prototype.rawInput) {
				this.rawInput(Strophe.serialize(stanza));
			}

			while (this.removeHandlers.length > 0) {
				hand = this.removeHandlers.pop();
				i = _.indexOf(this.handlers, hand);
				if (i >= 0) {
					this.handlers.splice(i, 1);
				}
			}

			// add handlers scheduled for addition
			while (this.addHandlers.length > 0) {
				this.handlers.push(this.addHandlers.pop());
			}

			// handle graceful disconnect
			if (this.disconnecting
			 && this._requests.length === 0) {
				this.deleteTimedHandler(this._disconnectTimeout);
				this._disconnectTimeout = null;
				this._doDisconnect();
				msos.console.debug(stph_con + "_dataRecv -> done, graceful disconnect.");
				return;
			}

			typ = stanza.getAttribute("type");

			if (typ !== null
			 && typ === "terminate") {

				if (this.disconnecting) {
					msos.console.debug(stph_con + "_dataRecv -> done, too late to process.");
					return;
				}

				// an error occurred
				cond = stanza.getAttribute("condition");
				conflict = stanza.getElementsByTagName("conflict");

				if (cond !== null) {
					if (cond === "remote-stream-error" && conflict.length > 0) {
						cond = "conflict";
					}
					this._changeConnectStatus(Strophe.Status.CONNFAIL, cond);
				} else {
					this._changeConnectStatus(Strophe.Status.CONNFAIL, "unknown");
				}

				this.disconnect();
				msos.console.warn(stph_con + "_dataRecv -> done, something went wrong.");
				return;
			}

			// send each incoming stanza through the handler chain
			Strophe.forEachChild(
				stanza,
				function (child) {
					var i = 0,
						newList,
						hand;

					newList = that.handlers;
					that.handlers = [];

					for (i = 0; i < newList.length; i += 1) {
						hand = newList[i];
						// encapsulate 'handler.run' not to lose the whole handler list if
						// one of the handlers throws an exception
						try {
							if (hand.isMatch(child) &&
								(that.authenticated || !hand.user)) {
								if (hand.run(child)) {
									that.handlers.push(hand);
								}
							} else {
								that.handlers.push(hand);
							}
						} catch(e) {
							msos.console.warn(stph_con + "_dataRecv -> handler error: " + e);
						}
					}
				}
			);

			msos.console.debug(stph_con + "_dataRecv -> done!");
		},

		_queueData: function (element) {
			if (element === null
			|| !element.tagName
			|| !element.childNodes) {
				throw {
					name: stph_con + "_queueData -> ",
					message: "Cannot queue non-DOMElement."
				};
			}

			this._data.push(element);
			if (msos.config.verbose) {
				msos.console.debug(stph_con + "_queueData -> called, queued requests: " + this._data.length);
			}
		},

		disconnect: function (reason) {

			msos.console.debug(stph_con + "disconnect -> start, reason: " + reason);

			this._changeConnectStatus(Strophe.Status.DISCONNECTING, reason);

			if (this.connected) {
				// setup timeout handler
				this._disconnectTimeout = this._addSysTimedHandler(
					3000,
					_.bind(this._onDisconnectTimeout, this)
				);
				this._sendTerminate();
			}
			msos.console.debug(stph_con + "disconnect -> done!");
		},

		sendIQ: function (elem, callback, errback, timeout) {
			var timeoutHandler = null,
				that = this,
				id = '',
				handler;

			msos.console.debug(stph_con + "sendIQ -> start.");

			if (typeof elem.tree === "function") {
				elem = elem.tree();
			}

			id = elem.getAttribute('id') || '';

			if (!id) {
				id = this.getUniqueId("sendIQ");
				elem.setAttribute("id", id);
			}

			handler = this.addHandler(
				function (stanza) {
					// remove timeout handler if there is one
					if (timeoutHandler) {
						that.deleteTimedHandler(timeoutHandler);
					}
	
					var iqtype = stanza.getAttribute('type');
	
					if (iqtype === 'result') {
						if (callback) { callback(stanza); }
					} else if (iqtype === 'error') {
						if (errback) { errback(stanza); }
					} else {
						throw {
							name: stph_con + "sendIQ -> ",
							message: "Got bad IQ type: " + iqtype
						};
					}
				},
				null,
				'iq',
				null,
				id
			);

			// if timeout specified, setup timeout handler.
			if (timeout) {
				timeoutHandler = this.addTimedHandler(
					timeout,
					function () {
						// get rid of normal handler
						that.deleteHandler(handler);

						// call errback on timeout with null stanza
						if (errback) {
							errback(null);
						}
						return false;
					}
				);
			}

			this.send(elem);

			msos.console.debug(stph_con + "sendIQ -> done!");
			return id;
		},

		addTimedHandler: function (period, handler) {
			var thand = new Strophe.TimedHandler(period, handler);
			this.addTimeds.push(thand);
			return thand;
		},

		deleteTimedHandler: function (handRef) {
			this.removeTimeds.push(handRef);
		},

		addHandler: function (handler, ns, name, type, id, from, options) {
			var hand = new Strophe.Handler(handler, ns, name, type, id, from, options);
			this.addHandlers.push(hand);
			return hand;
		},

		deleteHandler: function (handRef) {
			this.removeHandlers.push(handRef);
		},

		_addSysTimedHandler: function (period, handler) {
			var thand = new Strophe.TimedHandler(period, handler);

			thand.user = false;
			this.addTimeds.push(thand);
			return thand;
		},

		_addSysHandler: function (handler, ns, name, type, id) {
			var hand = new Strophe.Handler(handler, ns, name, type, id);

			hand.user = false;
			this.addHandlers.push(hand);
			return hand;
		}
	};

	callback(Strophe, $build, $msg, $iq, $pres);

}(function () {
	"use strict";

	var args = Array.prototype.slice.call(arguments);

    window.Strophe = args[0];
    window.$build = args[1];
    window.$msg = args[2];
    window.$iq = args[3];
    window.$pres = args[4];
}));