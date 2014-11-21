
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
    Base64: false,
    MD5: false,
    Strophe: true,
    msos: false,
    _: false,
    core_hmac_sha1: false,
    binb2str: false,
    str_hmac_sha1: false,
    b64_hmac_sha1: false,
    str_sha1: false,
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
		stph_hdl = 'Strophe.Handler - ',
		stph_rqt = 'Strophe.Request - ';


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
				doc = parser.parseFromString(html, "text/xml").documentElement;
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

	Strophe.Request = function (elem, func, rid, sends) {

		Strophe._requestId += 1;

		this.id = Strophe._requestId;
		this.xmlData = elem;
		this.data = Strophe.serialize(elem);
		this.origFunc = func;
		this.func = func;
		this.rid = rid;
		this.date = NaN;
		this.sends = sends || 0;
		this.abort = false;
		this.dead = null;
		this.age = function () {
			if (!this.date) { return 0; }
			var now = new Date();
			return (now - this.date) / 1000;
		};
		this.timeDead = function () {
			if (!this.dead) { return 0; }
			var now = new Date();
			return (now - this.dead) / 1000;
		};
		this.xhr = this._new_com_req();
	};

	Strophe.Request.prototype = {

		getResponse: function () {
			var node = null,
				gr = 'getResponse -> ',
				dbg = 'no response.';

			if (msos.config.verbose) {
				msos.console.debug(stph_rqt + gr + "start.");
			}

			if (this.xhr.responseXML
			 && this.xhr.responseXML.documentElement) {
				node = this.xhr.responseXML.documentElement;
				dbg = 'via responseXML.';
			} else if (this.xhr.responseText) {
				node = Strophe.xmlHtmlNode(this.xhr.responseText);
				dbg = 'via responseText.';
			}

			if (node && node.tagName === "parsererror") {
				msos.console.error(stph_rqt + gr + "parse error: " + this.xhr.responseText);
				return null;
			}

			if (msos.config.verbose) {
				msos.console.debug(stph_rqt + gr + "done, " + dbg);
			}
			return node;
		},

		_new_com_req: function () {
			var xhr = null;

			if (window.XMLHttpRequest) {
				xhr = new XMLHttpRequest();
				if (xhr.overrideMimeType) {
					xhr.overrideMimeType("text/xml");
				}
			} else if (window.ActiveXObject) {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}

			xhr.onreadystatechange = _.bind(this.func, null, this);

			return xhr;
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

		this.resource = null;	// ws only

		this._sasl_data = [];

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

		this._authentication = {};

		this.do_authentication = true;
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

		this._sasl_success_handler = null;
		this._sasl_failure_handler = null;
		this._sasl_challenge_handler = null;

		this.maxRetries = 5;

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

			this.ws = null;

			this.do_session = false;
			this.do_bind = false;

			// Handler lists
			this.timedHandlers = [];
			this.handlers = [];
			this.removeTimeds = [];
			this.removeHandlers = [];
			this.addTimeds = [];
			this.addHandlers = [];
			this._authentication = {};

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

		mechanisms: {},

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

		// -------------------------------
		// Start - BOSH specific functions
		// -------------------------------
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

			var body = this._buildBody().attrs(
					{
						to: this.domain,
						"xml:lang": "en",
						wait: this.wait,
						hold: this.hold,
						content: "text/xml; charset=utf-8",
						ver: "1.6",
						"xmpp:version": "1.0",
						"xmlns:xmpp": Strophe.NS.BOSH
					}
				);

			this._requests.push(
				new Strophe.Request(
					body.tree(),
					_.bind(this._onRequestStateChange, this, _.bind(this._connect_cb, this)),
					body.tree().getAttribute("rid")
				)
			);

			this._throttledRequestHandler();

			msos.console.debug(stph_con + "connect -> done, jid: " + jid);
		},

		_connect_cb: function (stanza) {

			var error,
				typ,
				cond,
				conflict,
				wind,
				hold,
				wait,
				hasFeatures,
				cb_mechanisms,
				matched = [],
				i = 0,
				mech,
				auth_str,
				auth_found = false,
				body;

			msos.console.debug(stph_con + "_connect_cb -> start.");

			if (!stanza) {
				msos.console.warn(stph_con + "_connect_cb -> done, failed for no stanza.");
				return;
			}

			this.xmlInput(stanza);
			this.rawInput(Strophe.serialize(stanza));

			error = this._check_streamerror(stanza, Strophe.Status.CONNFAIL);

			if (error) {
				msos.console.warn(stph_con + "_connect_cb -> done, failed.");
				return;
			}

			typ = stanza.getAttribute("type");

			if (typ !== null
			 && typ === "terminate") {
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
				msos.console.error(stph_con + "_connect_cb -> done, processing failed.");
				return;
			}

			// Valid connection, so record it
			this.connected = true;

			if (!this.sid) {
				this.sid = stanza.getAttribute("sid");
			}

			wind = stanza.getAttribute('requests');
			if (wind) { this.window = parseInt(wind, 10); }

			hold = stanza.getAttribute('hold');
			if (hold) { this.hold = parseInt(hold, 10); }

			wait = stanza.getAttribute('wait');
			if (wait) { this.wait = parseInt(wait, 10); }

			this._authentication.legacy_auth = false;

			// Check for the stream:features tag
			hasFeatures = stanza.getElementsByTagName("stream:features").length > 0;

			if (!hasFeatures) {
				hasFeatures = stanza.getElementsByTagName("features").length > 0;
			}

			cb_mechanisms = stanza.getElementsByTagName("mechanism");

			if (hasFeatures && cb_mechanisms.length > 0) {
				for (i = 0; i < cb_mechanisms.length; i += 1) {
					mech = Strophe.getText(cb_mechanisms[i]);
					if (this.mechanisms[mech]) { matched.push(this.mechanisms[mech]); }
				}

				this._authentication.legacy_auth = stanza.getElementsByTagName("auth").length > 0;

				auth_found = this._authentication.legacy_auth || matched.length > 0;
			} else {
				if (msos.config.verbose) {
					msos.console.warn(stph_con + "_connect_cb -> no features/auth. mechanisms.");
				}
			}

			if (!auth_found) {
				body = this._buildBody();
				this._requests.push(
					new Strophe.Request(
						body.tree(),
						_.bind(this._onRequestStateChange, this, _.bind(this._connect_cb, this)),
						body.tree().getAttribute("rid")
					)
				);
				this._throttledRequestHandler();
				msos.console.debug(stph_con + "_connect_cb -> done, waiting for: stream:features");
				return;
			}

			if (this.do_authentication !== false) {
				this.authenticate(matched);
			}

			msos.console.debug(stph_con + "_connect_cb -> done!");
		},

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

			this._throttledRequestHandler();

			clearTimeout(this._idleTimeout);

			this._idleTimeout = setTimeout(_.bind(this._onIdle, this), 100);

			msos.console.debug(stph_con + "send -> done!");
		},

		_doDisconnect: function () {
			msos.console.debug(stph_con + "_doDisconnect -> start.");

			this.authenticated = false;
			this.disconnecting = false;
			this.sid = null;
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

			msos.console.debug(stph_con + "_doDisconnect -> done!");
		},

		_onDisconnectTimeout: function () {
			var req;

			msos.console.debug(stph_con + "_onDisconnectTimeout -> start.");
	
			// cancel all remaining requests and clear the queue
			while (this._requests.length > 0) {
				req = this._requests.pop();
				req.abort = true;
				req.xhr.abort();
				req.xhr.onreadystatechange = null;
			}

			this._doDisconnect();

			msos.console.debug(stph_con + "_onDisconnectTimeout -> done!");
			return false;
		},

		_sendTerminate: function () {

			msos.console.debug(stph_con + "_sendTerminate -> start.");

			var body = this._buildBody().attrs({ type: "terminate" }),
				req;

			if (this.authenticated) {
				body.c(
					'presence',
					{
						xmlns: Strophe.NS.CLIENT,
						type: 'unavailable'
					}
				);
			}

			this.disconnecting = true;

			req = new Strophe.Request(
				body.tree(),
				_.bind(this._onRequestStateChange, this, _.bind(this._dataRecv, this)),
				body.tree().getAttribute("rid")
			);

			this._requests.push(req);
			this._throttledRequestHandler();

			msos.console.debug(stph_con + "_sendTerminate -> done!");
		},

		_sendRestart: function () {
			this._data.push("restart");

			this._throttledRequestHandler();

			clearTimeout(this._idleTimeout);

			this._idleTimeout = setTimeout(_.bind(this._onIdle, this), 100);
		},

		_buildBody: function () {
			this.rid += 1;

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

			return bodyWrap;
		},

		_removeRequest: function (req) {
			msos.console.debug(stph_con + "_removeRequest -> start.");

			var i;
			for (i = this._requests.length - 1; i >= 0; i -= 1) {
				if (req === this._requests[i]) {
					this._requests.splice(i, 1);
				}
			}

			req.xhr.onreadystatechange = null;

			this._throttledRequestHandler();

			msos.console.debug(stph_con + "_removeRequest -> done!");
		},

		_restartRequest: function (i) {
			var req = this._requests[i];
			if (req.dead === null) {
				req.dead = new Date();
			}

			this._processRequest(i);
		},

		_processRequest: function (i) {
			var tmp_r = '_processRequest -> ',
				req = this._requests[i],
				reqStatus = -1;

			msos.console.debug(stph_con + tmp_r + "start.");

			if (req.xhr.readyState === 4) {
				reqStatus = req.xhr.status;
				msos.console.debug(stph_con + tmp_r + "reqStatus: " + reqStatus);
			}

			if (reqStatus === undefined) {
				reqStatus = -1;
			}

			// make sure we limit the number of retries
			if (req.sends > this.maxRetries) {
				this._onDisconnectTimeout();
				msos.console.warn(stph_con + tmp_r + "timed out after " + i + " tries, reqStatus: " + reqStatus);
				return;
			}

			var time_elapsed = req.age(),
				primaryTimeout = (!isNaN(time_elapsed) && time_elapsed > Math.floor(Strophe.TIMEOUT * this.wait)),
				secondaryTimeout = (req.dead !== null && req.timeDead() > Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait)),
				requestCompletedWithServerError = (req.xhr.readyState === 4 && (reqStatus < 1 || reqStatus >= 500)),
				sendFunc,
				backoff;

			if (primaryTimeout
			 || secondaryTimeout
			 || requestCompletedWithServerError) {
				if (secondaryTimeout) {
					msos.console.error(stph_con + tmp_r + "request " + this._requests[i].id + " timed out (secondary), restarting");
				}
				req.abort = true;
				req.xhr.abort();

				req.xhr.onreadystatechange = null;
				this._requests[i] = new Strophe.Request(
					req.xmlData,
					req.origFunc,
					req.rid,
					req.sends
				);
				req = this._requests[i];
			}

			if (req.xhr.readyState === 0) {
				msos.console.debug(stph_con + tmp_r + "posting, id: " + req.id);

				try {
					req.xhr.open("POST", this.service, true);
				} catch (e2) {
					msos.console.error(stph_con + tmp_r + "XHR open failed: " + e2);
					if (!this.connected) {
						this._changeConnectStatus(Strophe.Status.CONNFAIL, "bad-service");
					}
					this.disconnect();
					return;
				}

				sendFunc = function () {
					req.date = new Date();
					req.xhr.send(req.data);
				};

				if (req.sends > 1) {
					// Using a cube of the retry number creates a nicely expanding retry window
					backoff = Math.min(Math.floor(Strophe.TIMEOUT * this.wait), Math.pow(req.sends, 3)) * 1000;
					setTimeout(sendFunc, backoff);
				} else {
					sendFunc();
				}

				req.sends += 1;

				if (this.xmlOutput !== Strophe.Connection.prototype.xmlOutput) {
					this.xmlOutput(req.xmlData);
				}
				if (this.rawOutput !== Strophe.Connection.prototype.rawOutput) {
					this.rawOutput(req.data);
				}
			} else {
				msos.console.debug(stph_con + tmp_r + (i === 0 ? "first" : "second") + " request with readyState: " + req.xhr.readyState);
			}
			msos.console.debug(stph_con + tmp_r + "done!");
		},

		_throttledRequestHandler: function () {

			var trh = '_throttledRequestHandler -> ';
	
			msos.console.debug(stph_con + trh + "start, queued request(s): " + this._requests.length);

			if (this._requests.length === 0) {
				msos.console.debug(stph_con + trh + "done, zero requests.");
				return;
			}

			if (this._requests.length > 0) {
				this._processRequest(0);
			}

			if (this._requests.length > 1
			 && Math.abs(this._requests[0].rid - this._requests[1].rid) < this.window) {
				this._processRequest(1);
			}
			msos.console.debug(stph_con + trh + "done!");
		},

		_onRequestStateChange: function (func, req) {

			// request complete
			var ors = '_onRequestStateChange -> ',
				reqStatus = 0,
				reqIs0,
				reqIs1,
				age,
				elem;

			if (msos.config.verbose) {
				msos.console.debug(stph_con + ors + "start, id: " + req.id + ", attempts: " + req.sends + " readyState: " + req.xhr.readyState);
			}

			if (req.abort) {
				msos.console.warn(stph_con + ors + "request aborted, id: " + req.id);
				return;
			}

			if (req.xhr.readyState === 4) {

				reqStatus = req.xhr.status || 0;

				if (this.disconnecting) {
					if (reqStatus >= 400) {
						this._hitError(reqStatus);
						msos.console.warn(stph_con + ors + "disconnecting with errors!");
						return;
					}
				}

				reqIs0 = (this._requests[0] === req);
				reqIs1 = (this._requests[1] === req);

				if ((reqStatus > 0 && reqStatus < 500)) {
					this._removeRequest(req);
					msos.console.debug(stph_con + ors + "id " + req.id + " remove for valid response, status: " + reqStatus);
				}

				if (req.sends > 5) {
					this._removeRequest(req);
					msos.console.debug(stph_con + ors + "id " + req.id + " remove for to many attempts: " + req.sends);
				}

				if (reqStatus === 200) {
					age = Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait);

					if (reqIs1 || (reqIs0 && this._requests.length > 0 && this._requests[0].age() > age)) {
						this._restartRequest(0);
					}

					msos.console.debug(stph_con + ors + "success, id: " + req.id + ", attempts: " + req.sends);

					elem = req.getResponse();

					// Run bound function for the current response(s)
					func(elem);
					this.errors = 0;

				} else {

					msos.console.warn(stph_con + ors + "id " + req.id + "." + req.sends + " has error(s), status: " + reqStatus);

					if (reqStatus === 0 || (reqStatus >= 400 && reqStatus < 600) || reqStatus >= 12000) {
						this._hitError(reqStatus);
						if (reqStatus >= 400
						 && reqStatus < 500) {
							this._changeConnectStatus(Strophe.Status.DISCONNECTING, null);
							this._doDisconnect();
						}
					}
				}

				if (!((reqStatus > 0 && reqStatus < 500) || req.sends > 5)) {
					this._throttledRequestHandler();
				}
			}

			if (msos.config.verbose) {
				msos.console.debug(stph_con + "_onRequestStateChange -> done!");
			}
		},

		_hitError: function (reqStatus) {
			this.errors += 1;
			msos.console.warn(stph_con + "_hitError -> request errored, status: " + reqStatus + ", number of errors: " + this.errors);
			if (this.errors > 4) {
				this._onDisconnectTimeout();
			}
		},

		_onIdle: function () {
			var i = 0,
				thand,
				since,
				newList = [],
				now = new Date().getTime(),
				body,
				time_elapsed;

			while (this.addTimeds.length > 0) {
				this.timedHandlers.push(this.addTimeds.pop());
			}

			while (this.removeTimeds.length > 0) {
				thand = this.removeTimeds.pop();
				i = _.indexOf(this.timedHandlers, thand);
				if (i >= 0) {
					this.timedHandlers.splice(i, 1);
				}
			}

			for (i = 0; i < this.timedHandlers.length; i += 1) {
				thand = this.timedHandlers[i];
				if (this.authenticated || !thand.user) {
					since = thand.lastCalled + thand.period;
					if (since - now <= 0) {
						if (thand.run()) {
							newList.push(thand);
						}
					} else {
						newList.push(thand);
					}
				}
			}

			this.timedHandlers = newList;

			// If no requests are in progress, poll
			if (this.authenticated
			 && this._requests.length === 0
			 && this._data.length === 0
			 && !this.disconnecting) {
				msos.console.debug(stph_con + "_onIdle -> no requests, sending blank.");
				this._data.push(null);
			}

			if (this._requests.length < 2
			 && this._data.length > 0
			 && !this.paused) {
				body = this._buildBody();
				for (i = 0; i < this._data.length; i += 1) {
					if (this._data[i] !== null) {
						if (this._data[i] === "restart") {
							body.attrs(
								{
									to: this.domain,
									"xml:lang": "en",
									"xmpp:restart": "true",
									"xmlns:xmpp": Strophe.NS.BOSH
								}
							);
						} else {
							body.cnode(this._data[i]).up();
						}
					}
				}
				delete this._data;
				this._data = [];
				this._requests.push(
					new Strophe.Request(
						body.tree(),
						_.bind(this._onRequestStateChange, this, _.bind(this._dataRecv, this)),
						body.tree().getAttribute("rid")
					)
				);
				this._processRequest(this._requests.length - 1);
			}

			if (this._requests.length > 0) {
				time_elapsed = this._requests[0].age();
				if (this._requests[0].dead !== null) {
					if (this._requests[0].timeDead() >
						Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait)) {
						this._throttledRequestHandler();
					}
				}

				if (time_elapsed > Math.floor(Strophe.TIMEOUT * this.wait)) {
					msos.console.warn(stph_con + "_onIdle -> Request " + this._requests[0].id + " timed out, over " + Math.floor(Strophe.TIMEOUT * this.wait) + " seconds since last activity");
					this._throttledRequestHandler();
				}
			}

			clearTimeout(this._idleTimeout);

			// Reactivate the timer only if connected
			if (this.connected) {
				this._idleTimeout = setTimeout(_.bind(this._onIdle, this), 100);
			}
		},
		// -----------------------------
		// End - BOSH specific functions
		// -----------------------------

		_check_streamerror: function (bodyWrap, connectstatus) {

			var errors = bodyWrap.getElementsByTagName("stream:error") || [],
				error,
				condition,
				text;

			msos.console.debug(stph_con + "_check_streamerror -> start, status: " + Strophe.status_name[connectstatus]);

			// No errors reported in stream
			if (errors.length === 0) {
				msos.console.debug(stph_con + "_check_streamerror -> done, no errors!");
				return false;
			}

			error = errors[0];
			condition = error.childNodes[0].tagName;
			text = error.getElementsByTagName("text")[0].textContent;

			this._changeConnectStatus(connectstatus, condition);
			this._doDisconnect();

			msos.console.debug(stph_con + "_check_streamerror -> done, condition: " + condition + " - " + text);
			return true;
		},

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

		_sasl_success_cb: function (elem) {
			var serverSignature,
				success,
				attribMatch = /([a-z]+)=([^,]+)(,|$)/,
				matches = [];

			msos.console.debug(stph_con + "_sasl_success_cb -> start.");

			if (this._sasl_data["server-signature"]) {
				success = Base64.decode(Strophe.getText(elem));

				matches = success.match(attribMatch);

				if (matches[1] === "v") {
					serverSignature = matches[2];
				}

				if (serverSignature !== this._sasl_data["server-signature"]) {
					this.deleteHandler(this._sasl_failure_handler);
					this._sasl_failure_handler = null;
					if (this._sasl_challenge_handler) {
						this.deleteHandler(this._sasl_challenge_handler);
						this._sasl_challenge_handler = null;
					}

					this._sasl_data = [];
					msos.console.debug(stph_con + "_sasl_success_cb -> done, failed!");
					return this._sasl_failure_cb(null);
				}
			}

			msos.console.debug(stph_con + "_sasl_success_cb -> SASL authentication succeeded.");

			if(this._sasl_mechanism) {
				this._sasl_mechanism.onSuccess();
			}

			this.deleteHandler(this._sasl_failure_handler);

			this._sasl_failure_handler = null;

			if (this._sasl_challenge_handler) {
				this.deleteHandler(this._sasl_challenge_handler);
				this._sasl_challenge_handler = null;
			}

			this._addSysHandler(
				_.bind(this._sasl_auth1_cb, this),
				null,
				"stream:features",
				null,
				null
			);

			this._sendRestart();

			msos.console.debug(stph_con + "_sasl_success_cb -> done!");
			return false;
		},

		authenticate: function (matched) {

			msos.console.debug(stph_con + "authenticate -> start, matched length: " + matched.length);

			var i = 0,
				j = 0,
				mechanism_found = false,
				request_auth_exchange,
				response,
				higher,
				swap;

			for (i = 0; i < matched.length - 1; i += 1) {
				higher = i;
				for (j = i + 1; j < matched.length; j += 1) {
					if (matched[j].priority > matched[higher].priority) {
						higher = j;
					}
				}
				if (higher > j) {
					swap = matched[i];
					matched[i] = matched[higher];
					matched[higher] = swap;
				}
			}

			for (i = 0; i < matched.length; i += 1) {

				if (typeof matched[i].test === 'function' && matched[i].test(this)) {

					this._sasl_success_handler = this._addSysHandler(
						_.bind(this._sasl_success_cb, this),
						null,
						"success",
						null,
						null
					);

					this._sasl_failure_handler = this._addSysHandler(
						_.bind(this._sasl_failure_cb, this),
						null,
						"failure",
						null,
						null
					);

					this._sasl_challenge_handler = this._addSysHandler(
						_.bind(this._sasl_challenge_cb, this),
						null,
						"challenge",
						null,
						null
					);

					this._sasl_mechanism = new matched[i]();
					this._sasl_mechanism.onStart(this);

					request_auth_exchange = $build(
						"auth",
						{
							xmlns: Strophe.NS.SASL,
							mechanism: this._sasl_mechanism.name
						}
					);

					if (this._sasl_mechanism.isClientFirst) {
						response = this._sasl_mechanism.onChallenge(this, null);
						request_auth_exchange.t(Base64.encode(response));
					}

					this.send(request_auth_exchange.tree());

					mechanism_found = true;

					msos.console.debug(stph_con + "authenticate -> mechanism found: " + this._sasl_mechanism.name);
				}
			}

			if (!mechanism_found) {
				// if none of the mechanism worked
				if (Strophe.getNodeFromJid(this.jid) === null) {
					this._changeConnectStatus(Strophe.Status.CONNFAIL, 'x-strophe-bad-non-anon-jid');
					this.disconnect();
				} else {
					// fall back to legacy authentication
					this._changeConnectStatus(Strophe.Status.AUTHENTICATING, null);
					this._addSysHandler(
						_.bind(this._auth1_cb, this),
						null,
						null,
						null,
						"_auth_1"
					);

					this.send(
						$iq(
							{
								type: "get",
								to: this.domain,
								id: "_auth_1"
							}
						).c(
							"query",
							{ xmlns: Strophe.NS.AUTH }
						).c(
							"username",
							{}
						).t(Strophe.getNodeFromJid(this.jid)).tree()
					);
				}
			}

			msos.console.debug(stph_con + "authenticate -> done!");
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

		_sasl_challenge_cb: function (elem) {
			var challenge = Base64.decode(Strophe.getText(elem)),
				response = this._sasl_mechanism.onChallenge(this, challenge);

			this.send(
				$build(
					'response',
					{ xmlns: Strophe.NS.SASL }
				).t(Base64.encode(response)).tree()
			);

			return true;
		},

		_sasl_auth1_cb: function (elem) {
			var i = 0,
				child,
				resource;

			msos.console.debug(stph_con + "_sasl_auth1_cb -> start.");

			for (i = 0; i < elem.childNodes.length; i += 1) {
				child = elem.childNodes[i];
				if (child.nodeName === 'bind') {
					this.do_bind = true;
				}

				if (child.nodeName === 'session') {
					this.do_session = true;
				}
			}

			if (!this.do_bind) {
				this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
				msos.console.debug(stph_con + "_sasl_auth1_cb -> done, AUTHFAIL");
				return false;
			}

			this._addSysHandler(
				_.bind(this._sasl_bind_cb, this),
				null,
				null,
				null,
				"_bind_auth_2"
			);

			resource = Strophe.getResourceFromJid(this.jid);
	
			if (resource) {
				this.send(
					$iq(
						{ type: "set", id: "_bind_auth_2" }
					).c(
						'bind',
						{ xmlns: Strophe.NS.BIND }
					).c('resource', {}).t(resource).tree());
			} else {
				this.send(
					$iq(
						{ type: "set", id: "_bind_auth_2" }
					).c('bind', { xmlns: Strophe.NS.BIND }).tree());
			}

			msos.console.debug(stph_con + "_sasl_auth1_cb -> done!");
			return false;
		},

		_sasl_bind_cb: function (elem) {
			var bind,
				jidNode,
				jidText,
				sid,
				domain,
				resource,
				conflict,
				condition;

			msos.console.debug(stph_con + "_sasl_bind_cb -> start.");

			if (elem.getAttribute("type") === "error") {
				conflict = elem.getElementsByTagName("conflict");
				if (conflict.length > 0) {
					condition = 'conflict';
				}
				this._changeConnectStatus(Strophe.Status.AUTHFAIL, condition);
				msos.console.debug(stph_con + "_sasl_bind_cb -> done, SASL binding failed.");
				return false;
			}

			bind = elem.getElementsByTagName("bind");

			if (bind.length > 0) {

				jidNode = bind[0].getElementsByTagName("jid");

				if (jidNode.length > 0) {

					jidText = Strophe.getText(jidNode[0]);

					sid = Strophe.getNodeFromJid(jidText);
					domain = Strophe.getDomainFromJid(jidText);
					resource = Strophe.getResourceFromJid(jidText);

					// If server doesn't recognize specific resource
					if (sid === resource) {
						resource = this.resource;
						this.jid = sid + '@' + domain + '/' + resource;
					} else {
						this.jid = jidText;
					}

					if (this.do_session) {
						this._addSysHandler(
							_.bind(this._sasl_session_cb, this),
							null,
							null,
							null,
							"_session_auth_2"
						);

						this.send(
							$iq(
								{ type: "set", id: "_session_auth_2" }
							).c('session', { xmlns: Strophe.NS.SESSION }).tree()
						);
					} else {
						this.authenticated = true;
						this._changeConnectStatus(Strophe.Status.CONNECTED, null);
					}
					msos.console.debug(stph_con + "_sasl_bind_cb -> done, node count: " + jidNode.length);
					return true;
				}
			}

			this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
			msos.console.warn(stph_con + "_sasl_bind_cb -> done, SASL binding failed.");
			return false;
		},

		_sasl_session_cb: function (elem) {

			msos.console.debug(stph_con + "_sasl_session_cb -> start.");

			if (elem.getAttribute("type") === "result") {
				this.authenticated = true;
				this._changeConnectStatus(Strophe.Status.CONNECTED, null);
			} else if (elem.getAttribute("type") === "error") {
				msos.console.warn(stph_con + "_sasl_session_cb -> session creation failed.");
				this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
				return false;
			}

			msos.console.debug(stph_con + "_sasl_session_cb -> done!");
			return false;
		},

		_sasl_failure_cb: function (elem) {

			msos.console.debug(stph_con + "_sasl_failure_cb -> start.");

			if (this._sasl_success_handler) {
				this.deleteHandler(this._sasl_success_handler);
				this._sasl_success_handler = null;
			}
			if (this._sasl_challenge_handler) {
				this.deleteHandler(this._sasl_challenge_handler);
				this._sasl_challenge_handler = null;
			}

			if (this._sasl_mechanism) {
				this._sasl_mechanism.onFailure();
			}

			this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);

			msos.console.debug(stph_con + "_sasl_failure_cb -> done!");
			return false;
		},

		_auth1_cb: function (elem) {

			msos.console.debug(stph_con + "_auth1_cb -> start.");

			// build plaintext auth iq
			var iq = $iq(
					{ type: "set", id: "_auth_2" }
				).c('query', { xmlns: Strophe.NS.AUTH }
				).c('username', {}).t(Strophe.getNodeFromJid(this.jid)
				).up().c('password').t(this.pass);

			if (!Strophe.getResourceFromJid(this.jid)) {
				this.jid = Strophe.getBareJidFromJid(this.jid) + '/strophe';
			}

			iq.up().c('resource', {}).t(Strophe.getResourceFromJid(this.jid));

			this._addSysHandler(
				_.bind(this._auth2_cb, this),
				null,
				null,
				null,
				"_auth_2"
			);

			this.send(iq.tree());

			msos.console.debug(stph_con + "_auth1_cb -> done!");
			return false;
		},

		_auth2_cb: function (elem) {
			msos.console.debug(stph_con + "_auth2_cb -> start.");

			if (elem.getAttribute("type") === "result") {
				this.authenticated = true;
				this._changeConnectStatus(Strophe.Status.CONNECTED, null);
			} else if (elem.getAttribute("type") === "error") {
				this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
				this.disconnect();
			}

			msos.console.debug(stph_con + "_auth2_cb -> done!");
			return false;
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

	Strophe.SASLMechanism = function (name, isClientFirst, priority) {

		this.name = name;
		this.isClientFirst = isClientFirst;
		this.priority = priority;

		this._sasl_data = [];

		this.test = function (connection) {
			return true;
		};

		this.onStart = function (connection) {
			this._connection = connection;
		};

		this.onChallenge = function (connection, challenge) {
			throw new Error("You should implement challenge handling!");
		};

		this.onFailure = function () {
			this._connection = null;
		};

		this.onSuccess = function () {
			this._connection = null;
		};

		this._quote = function (str) {
			if (msos.var_is_empty(str)) {
				msos.console.warn('Strophe.SASLMechanism._quote -> missing input!');
				return '';
			}
			return '"' + str.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
		};

		return this;
	};

	callback(Strophe, $build, $msg, $iq, $pres);



	Strophe.SASLAnonymous = function () {};

	Strophe.SASLAnonymous.prototype = new Strophe.SASLMechanism("ANONYMOUS", false, 10);

	Strophe.SASLAnonymous.test = function (connection) {
		return connection.authcid === null;
	};



	Strophe.SASLPlain = function () {};

	Strophe.SASLPlain.prototype = new Strophe.SASLMechanism("PLAIN", true, 20);

	Strophe.SASLPlain.test = function (connection) {
		return connection.authcid !== null;
	};

	Strophe.SASLPlain.prototype.onChallenge = function (connection, challenge) {
		var auth_str = connection.authzid;

		auth_str = auth_str + "\u0000";
		auth_str = auth_str + connection.authcid;
		auth_str = auth_str + "\u0000";
		auth_str = auth_str + connection.pass;
		return auth_str;
	};



	Strophe.SASLSHA1 = function () {};

	Strophe.SASLSHA1.prototype = new Strophe.SASLMechanism("SCRAM-SHA-1", true, 20);

	Strophe.SASLSHA1.test = function (connection) {
		return connection.authcid !== null;
	};

	Strophe.SASLSHA1.prototype.onChallenge = function (connection, challenge, test_cnonce) {
		var cnonce = test_cnonce || MD5.hexdigest(Math.random() * 1234567890),
			auth_str = "n=" + connection.authcid +",r=" + cnonce;

		msos.console.debug('Strophe.SASLSHA1.onChallenge -> called.');

		this._sasl_data.cnonce = cnonce;
		this._sasl_data["client-first-message-bare"] = auth_str;

		auth_str = "n,," + auth_str;

		this.onChallenge = function (connection, challenge) {
			var matches = [],
				nonce,
				salt,
				iter,
				Hi,
				U,
				U_old,
				clientKey,
				serverKey,
				clientSignature,
				responseText = "c=biws,",
				authMessage = this._sasl_data["client-first-message-bare"] + "," + challenge + ",",
				cnonce = this._sasl_data.cnonce,
				attribMatch = /([a-z]+)=([^,]+)(,|$)/,
				i = 0,
				k = 0;

			while (challenge.match(attribMatch)) {
				matches = challenge.match(attribMatch);
				challenge = challenge.replace(matches[0], "");
				switch (matches[1]) {
					case "r":
						nonce = matches[2];
						break;
					case "s":
						salt = matches[2];
						break;
					case "i":
						iter = matches[2];
						break;
				}
			}

			if (!(nonce.substr(0, cnonce.length) === cnonce)) {
				this._sasl_data = [];
				return connection._sasl_failure_cb();
			}

			responseText += "r=" + nonce;
			authMessage += responseText;

			salt = Base64.decode(salt);
			salt += "\u0001";

			Hi = U_old = core_hmac_sha1(connection.pass, salt);
			for (i = 1; i < iter; i += 1) {
				U = core_hmac_sha1(connection.pass, binb2str(U_old));
				for (k = 0; k < 5; k += 1) {
					Hi[k] ^= U[k];
				}
				U_old = U;
			}

			Hi = binb2str(Hi);

			clientKey = core_hmac_sha1(Hi, "Client Key");
			serverKey = str_hmac_sha1(Hi, "Server Key");
			clientSignature = core_hmac_sha1(str_sha1(binb2str(clientKey)), authMessage);
			connection._sasl_data["server-signature"] = b64_hmac_sha1(serverKey, authMessage);

			for (k = 0; k < 5; k += 1) {
				clientKey[k] ^= clientSignature[k];
			}

			responseText += ",p=" + Base64.encode(binb2str(clientKey));

			return responseText;
		};

		_.bind(this.onChallenge, this);

		return auth_str;
	};



	Strophe.SASLMD5 = function () {};

	Strophe.SASLMD5.prototype = new Strophe.SASLMechanism("DIGEST-MD5", false, 20);

	Strophe.SASLMD5.test = function (connection) {
		return connection.authcid !== null;
	};

	Strophe.SASLMD5.prototype.onChallenge = function (connection, challenge, test_cnonce) {
		var attribMatch = /([a-z]+)=("[^"]+"|[^,"]+)(?:,|$)/,
			cnonce = test_cnonce || MD5.hexdigest(String(Math.random() * 1234567890)),
			realm = "",
			host = null,
			nonce = "",
			qop = "",
			matches,
			digest_uri,
			A1,
			A2,
			responseText = '';

		msos.console.debug('Strophe.SASLMD5.onChallenge -> called.');

		while (challenge.match(attribMatch)) {
			matches = challenge.match(attribMatch);
			challenge = challenge.replace(matches[0], "");
			matches[2] = matches[2].replace(/^"(.+)"$/, "$1");

			switch (matches[1]) {
				case "realm":
					realm = matches[2];
					break;
				case "nonce":
					nonce = matches[2];
					break;
				case "qop":
					qop = matches[2];
					break;
				case "host":
					host = matches[2];
					break;
			}
		}

		digest_uri = connection.servtype + "/" + connection.domain;

		if (host !== null) {
			digest_uri = digest_uri + "/" + host;
		}

		A1 = MD5.hash(connection.authcid + ":" + realm + ":" + this._connection.pass) + ":" + nonce + ":" + cnonce;
		A2 = 'AUTHENTICATE:' + digest_uri;

		responseText += 'charset=utf-8,';
		responseText += 'username='	+ this._quote(connection.authcid) + ',';
		responseText += 'realm='	+ this._quote(realm) + ',';
		responseText += 'nonce='	+ this._quote(nonce) + ',';
		responseText += 'nc=00000001,';
		responseText += 'cnonce='	+ this._quote(cnonce) + ',';
		responseText += 'digest-uri=' + this._quote(digest_uri) + ',';
		responseText += 'response=' + MD5.hexdigest(MD5.hexdigest(A1) + ":" + nonce + ":00000001:" + cnonce + ":auth:" + MD5.hexdigest(A2)) + ",";
		responseText += 'qop=auth';

		this.onChallenge = _.bind(function (connection, challenge) { return ""; }, this);

		return responseText;
	};

}(function () {
	"use strict";

	var args = Array.prototype.slice.call(arguments);

    window.Strophe = args[0];
    window.$build = args[1];
    window.$msg = args[2];
    window.$iq = args[3];
    window.$pres = args[4];
}));
