/**
 * @license AngularJS v1.3.0-beta.19
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 *
 * Originally derived from v1.3.0-beta.11,
 *       with updates from v1.3.0-beta.18,
 *       with updates from v1.3.0-beta.19
 *       with updates from v1.3.0-rc.1
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false
*/

msos.console.info('ng/core -> start.');
msos.console.time('ng');

(function (window, document) {
    "use strict";

    function noop() {}
    noop.$inject = [];

    var angular = {},
        version = {
            full: '1.3.0-rc.1',
            major: 1,
            minor: 3,
            dot: 0,
            codeName: 'backyard-atomicity'
        },
        REGEX_STRING_REGEXP = /^\/(.+)\/([a-z]*)$/,
        SNAKE_CASE_REGEXP = /[A-Z]/g,
        SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g,
        MOZ_HACK_REGEXP = /^moz([A-Z])/,
        HTML_REGEXP = /<|&#?\w+;/,
        FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
        FN_ARG_SPLIT = /,/,
        FN_ARG = /^\s*(_?)(\S+?)\1\s*$/,
        STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
        PREFIX_REGEXP = /^(x[\:\-_]|data[\:\-_])/i,
        PATH_MATCH = /^([^\?#]*)(\?([^#]*))?(#(.*))?$/,
        DATE_FORMATS_SPLIT = /((?:[^yMdHhmsaZEw']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z|w+))(.*)/,
        NUMBER_STRING = /^\-?\d+$/,
        ISO_DATE_REGEXP = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
        URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i,
        NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/,
        DATE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})$/,
        DATETIMELOCAL_REGEXP = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d))?$/,
        WEEK_REGEXP = /^(\d{4})-W(\d\d)$/,
        MONTH_REGEXP = /^(\d{4})-(\d\d)$/,
        TIME_REGEXP = /^(\d\d):(\d\d)(?::(\d\d))?$/,
        DEFAULT_REGEXP = /(\s+|^)default(\s+|$)/,
        CONSTANT_VALUE_REGEXP = /^(true|false|\d+)$/,
        DATE_FORMATS = {},
        DECIMAL_SEP = '.',
        DEFAULT_PORTS = {
            'http': 80,
            'https': 443,
            'ftp': 21
        },
        SCE_CONTEXTS = {
            HTML: 'html',
            CSS: 'css',
            URL: 'url',
            RESOURCE_URL: 'resourceUrl',
            JS: 'js'
        },
        VALIDITY_STATE_PROPERTY = 'validity',
        VALID_CLASS = 'ng-valid',
        INVALID_CLASS = 'ng-invalid',
        PRISTINE_CLASS = 'ng-pristine',
        DIRTY_CLASS = 'ng-dirty',
        UNTOUCHED_CLASS = 'ng-untouched',
        TOUCHED_CLASS = 'ng-touched',
        PENDING_CLASS = 'ng-pending',
        SUBMITTED_CLASS = 'ng-submitted',
        slice = [].slice,
        CALL = Function.prototype.call,
        APPLY = Function.prototype.apply,
        BIND = Function.prototype.bind,
        lowercase = function (string) {
            return _.isString(string) ? string.toLowerCase() : string;
        },
        hasOwnProperty = Object.prototype.hasOwnProperty,
        uppercase = function (string) {
            return _.isString(string) ? string.toUpperCase() : string;
        },
        manualLowercase = function (s) {
            /* jshint bitwise: false */
            return _.isString(s) ? s.replace(/[A-Z]/g, function (ch) {
                return String.fromCharCode(ch.charCodeAt(0) | 32);
            }) : s;
        },
        manualUppercase = function (s) {
            /* jshint bitwise: false */
            return _.isString(s) ? s.replace(/[a-z]/g, function (ch) {
                return String.fromCharCode(ch.charCodeAt(0) & ~32);
            }) : s;
        },
        ngto_string = Object.prototype.toString,
        urlParsingNode = document.createElement("a"),
        originUrl,
        msie,
        jqLite,
        ngMinErr = null,
        $injectorMinErr = null,
        $animateMinErr = null,
        $compileMinErr = null,
        $interpolateMinErr = null,
        $locationMinErr = null,
        $parseMinErr = null,
        $sceMinErr = null,
        ngOptionsMinErr = null,
        $ngModelMinErr = null,
        $AnimateProvider = [],
        trim = function (value) {
            return _.isString(value) ? value.trim() : value;
        },
        angularModule,
        nodeName_ = function (element) {
            return lowercase(element.nodeName || element[0].nodeName);
        },
        uid = 0,
        csp,
        bindJQueryFired = false,
        skipDestroyOnNextJQueryCleanData,
        JQLitePrototype = {},
        addEventListenerFn = function (element, type, fn) {
            element.addEventListener(type, fn, false);
        },
        removeEventListenerFn = function (element, type, fn) {
            element.removeEventListener(type, fn, false);
        },
        BOOLEAN_ATTR = {},
        BOOLEAN_ELEMENTS = {},
        ALIASED_ATTR = {
            'ngMinlength': 'minlength',
            'ngMaxlength': 'maxlength',
            'ngMin' : 'min',
            'ngMax' : 'max',
            'ngPattern': 'pattern'
        },
        ESCAPE = {
            "n": "\n",
            "f": "\f",
            "r": "\r",
            "t": "\t",
            "v": "\v",
            "'": "'",
            '"': '"'
        },
        nullFormCtrl = {
            $addControl: noop,
            $removeControl: noop,
            $setValidity: noop,
            $$setPending: noop,
            $setDirty: noop,
            $setPristine: noop,
            $setSubmitted: noop,
            $$clearControlValidity: noop
        },
        inputType = {},
        Parser = null,
        CONSTANTS = {},
        OPERATORS = {},
        Lexer = null,
        getterFnCache,
        NgModelController,
        ngModelDirective,
        ngAttributeAliasDirectives = {},
        ngEventDirectives = {},
        forceAsyncEvents = {
            'blur': true,
            'focus': true
        },
        htmlAnchorDirective,
        formDirectiveFactory,
        formDirective,
        ngFormDirective,
        inputDirective,
        ngChangeDirective,
        requiredDirective,
        patternDirective,
        maxlengthDirective,
        minlengthDirective,
        ngListDirective,
        ngValueDirective,
        ngModelOptionsDirective,
        ngBindDirective,
        ngBindTemplateDirective,
        ngBindHtmlDirective,
        ngClassDirective,
        ngClassOddDirective,
        ngClassEvenDirective,
        ngCloakDirective,
        ngControllerDirective,
        ngIfDirective,
        ngIncludeDirective,
        ngIncludeFillContentDirective,
        ngInitDirective,
        ngNonBindableDirective,
        ngPluralizeDirective,
        ngRepeatDirective,
        ngShowDirective,
        ngHideDirective,
        ngStyleDirective,
        ngSwitchDirective,
        ngSwitchWhenDirective,
        ngSwitchDefaultDirective,
        ngTranscludeDirective,
        scriptDirective,
        ngOptionsDirective,
        selectDirective,
        optionDirective,
        styleDirective;

    window.angular = angular;

    if ('i' !== 'I'.toLowerCase()) {
        lowercase = manualLowercase;
        uppercase = manualUppercase;
    }

    function isDefined(value) {
        return value !== undefined;
    }

    function isWindow(obj) {
        return obj && obj.window === obj;
    }

    function isScope(obj) {
        return obj && obj.$evalAsync && obj.$watch;
    }

    function isFile(obj) {
        return ngto_string.call(obj) === '[object File]';
    }

    function isBlob(obj) {
        return ngto_string.call(obj) === '[object Blob]';
    }

    function isPromiseLike(obj) {
        return obj && _.isFunction(obj.then);
    }

    function isElement(node) {
        return !!(node && (node.nodeName || (node.prop && node.attr && node.find)));
    }

    function toJsonReplacer(key, value) {
        var val = value;

        if (typeof key === 'string' && key.charAt(0) === '$' && key.charAt(1) === '$') {
            val = undefined;
        } else if (isWindow(value)) {
            val = '$WINDOW';
        } else if (value && document === value) {
            val = '$DOCUMENT';
        } else if (isScope(value)) {
            val = '$SCOPE';
        }

        return val;
    }

    function toJson(obj, pretty) {
        if (obj === undefined) { return undefined; }
        return JSON.stringify(obj, toJsonReplacer, pretty ? '  ' : null);
    }

    function fromJson(json) {
        return _.isString(json) ? JSON.parse(json) : json;
    }

    function minErr(module, ErrorConstructor) {
        ErrorConstructor = ErrorConstructor || Error;
        return function () {
            var code = arguments[0],
                prefix = '[' + (module ? module + ':' : '') + code + '] ',
                template = arguments[1],
                templateArgs = arguments,
                stringify = function (obj) {
                    if (typeof obj === 'function') {
                        return obj.toString().replace(/ \{[\s\S]*$/, '');
                    }
                    if (obj === undefined) {
                        return 'undefined';
                    }
                    if (typeof obj !== 'string') {
                        return JSON.stringify(obj);
                    }
                    return obj;
                },
                message,
                i;

            message = prefix + template.replace(/\{\d+\}/g, function (match) {
                var index = +match.slice(1, -1),
                    arg;

                if (index + 2 < templateArgs.length) {
                    arg = templateArgs[index + 2];
                    if (typeof arg === 'function') {
                        return arg.toString().replace(/ ?\{[\s\S]*$/, '');
                    }
                    if (arg === undefined) {
                        return 'undefined';
                    }
                    if (typeof arg !== 'string') {
                        return toJson(arg);
                    }
                    return arg;
                }
                return match;
            });

            message = message + '\nhttp://errors.angularjs.org/1.3.0-rc.1/' + (module ? module + '/' : '') + code;
            for (i = 2; i < arguments.length; i += 1) {
                message = message + (i === 2 ? '?' : '&') + 'p' + (i - 2) + '=' + encodeURIComponent(stringify(arguments[i]));
            }

            return new ErrorConstructor(message);
        };
    }

    ngMinErr = minErr('ng');
    $injectorMinErr = minErr('$injector');

    msie = parseInt((/msie (\d+)/.exec(lowercase(navigator.userAgent)) || [])[1], 10);

    if (isNaN(msie)) {
        msie = parseInt((/trident\/.*; rv:(\d+)/.exec(lowercase(navigator.userAgent)) || [])[1], 10);
    }

    /**
     *
     *   | member name   | Description    |
     *   |---------------|----------------|
     *   | href          | A normalized version of the provided URL if it was not an absolute URL |
     *   | protocol      | The protocol including the trailing colon                              |
     *   | host          | The host and port (if the port is non-default) of the normalizedUrl    |
     *   | search        | The search params, minus the question mark                             |
     *   | hash          | The hash string, minus the hash symbol
     *   | hostname      | The hostname
     *   | port          | The port, without ":"
     *   | pathname      | The pathname, beginning with "/"
     *
     */
    function urlResolve(url) {

        if (msos.config.verbose) {
            msos.console.debug('ng - urlResolve -> start, url: ' + url);
        }

        urlParsingNode.setAttribute('href', url);

        var purlFn = msos.purl(urlParsingNode.href, true),
            output = {
                href: purlFn.attr('source'),
                protocol: purlFn.attr('protocol'),
                host: purlFn.attr('host') + (purlFn.attr('port') ? ':' + purlFn.attr('port') : ''),
                search: purlFn.attr('query'),
                hash: purlFn.attr('fragment'),
                hostname: purlFn.attr('host'),
                port: purlFn.attr('port'),
                pathname: purlFn.attr('path')
            };

        if (msos.config.verbose) {
            msos.console.debug('ng - urlResolve -> done, output:', output);
        }

        return output;
    }

    originUrl = urlResolve(window.location.href, true);

    function urlIsSameOrigin(requestUrl) {
        var parsed = (_.isString(requestUrl)) ? urlResolve(requestUrl) : requestUrl;
        return (parsed.protocol === originUrl.protocol && parsed.host === originUrl.host);
    }

    function isArrayLike(obj) {
        // This must be '==' and not '==='
        if (obj == null || isWindow(obj)) {     // jshint ignore:line
            return false;
        }

        var length = obj.length;

        if (obj.nodeType === 1 && length) {
            return true;
        }

        return _.isString(obj) || _.isArray(obj) || length === 0 || (typeof length === 'number' && length > 0 && obj.hasOwnProperty(length - 1));
    }

    function forEach(obj, iterator, context) {
        var key,
            length,
            isPrimitive;

        if (obj) {
            if (_.isFunction(obj)) {
                for (key in obj) {
                    if (key !== 'prototype' && key !== 'length' && key !== 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            } else if (_.isArray(obj) || isArrayLike(obj)) {
                isPrimitive = typeof obj !== 'object';
                for (key = 0, length = obj.length; key < length; key += 1) {
                    if (isPrimitive || obj.hasOwnProperty(key)) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            } else if (obj.forEach && obj.forEach !== forEach) {
                obj.forEach(iterator, context, obj);
            } else {
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            }
        }
        return obj;
    }

    function sortedKeys(obj) {
        var key,
            keys = [];

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys.sort();
    }

    function forEachSorted(obj, iterator, context) {
        var i = 0,
            keys = sortedKeys(obj);

        for (i = 0; i < keys.length; i += 1) {
            iterator.call(context, obj[keys[i]], keys[i]);
        }
        return keys;
    }

    function reverseParams(iteratorFn) {
        return function (value, key) {
            iteratorFn(key, value);
        };
    }

    function nextUid() {
        uid += 1;
        return uid;
    }

    function setHashKey(obj, h) {
        if (h) {
            obj.$$hashKey = h;
        } else {
            delete obj.$$hashKey;
        }
    }

    function extend(dst) {
        var h = dst.$$hashKey,
            i = 0,
            j = 0,
            obj,
            keys,
            key;

        for (i = 1; i < arguments.length; i += 1) {
            obj = arguments[i];
            if (obj) {
                keys = Object.keys(obj);
                for (j = 0; j < keys.length; j += 1) {
                    key = keys[j];
                    dst[key] = obj[key];
                }
            }
        }

        setHashKey(dst, h);
        return dst;
    }

    function inherit(parent, extra) {
        return extend(new (extend(function () {}, {
            prototype: parent
        }))(), extra);
    }

    function identity($) {
        return $;
    }
    identity.$inject = [];

    function valueFn(value) {
        return function () {
            return value;
        };
    }

    function makeMap(arry) {
        var obj = {},
            i;

        for (i = 0; i < arry.length; i += 1) {
            obj[arry[i]] = true;
        }

        return obj;
    }

    function arrayRemove(array, value) {
        var index = _.indexOf(array, value);
        if (index >= 0) {
            array.splice(index, 1);
        }
        return value;
    }

    function copy(source, destination, stackSource, stackDest) {
        var emptyObject,
            index,
            result,
            i = 0,
            h,
            key;

        if (isWindow(source) || isScope(source)) {
            throw ngMinErr('cpws', "Can't copy! Making copies of Window or Scope instances is not supported.");
        }

        if (!destination) {

            destination = source;

            if (source) {
                if (_.isArray(source)) {
                    destination = copy(source, [], stackSource, stackDest);
                } else if (_.isDate(source)) {
                    destination = new Date(source.getTime());
                } else if (_.isRegExp(source)) {
                    destination = new RegExp(source.source, source.toString().match(/[^\/]*$/)[0]);
                    destination.lastIndex = source.lastIndex;
                } else if (_.isObject(source)) {
                    emptyObject = Object.create(Object.getPrototypeOf(source));
                    destination = copy(source, emptyObject, stackSource, stackDest);
                }
            }
        } else {

            if (source === destination) {
                throw ngMinErr('cpi', "Can't copy! Source and destination are identical.");
            }

            stackSource = stackSource || [];
            stackDest = stackDest || [];

            if (_.isObject(source)) {
                index = _.indexOf(stackSource, source);
                if (index !== -1) {
                    return stackDest[index];
                }
                stackSource.push(source);
                stackDest.push(destination);
            }

            if (_.isArray(source)) {
                destination.length = 0;
                for (i = 0; i < source.length; i += 1) {
                    result = copy(source[i], null, stackSource, stackDest);
                    if (_.isObject(source[i])) {
                        stackSource.push(source[i]);
                        stackDest.push(result);
                    }
                    destination.push(result);
                }
            } else {
                h = destination.$$hashKey;
                if (_.isArray(destination)) {
                    destination.length = 0;
                } else {
                    forEach(destination, function (value, key) {
                        delete destination[key];
                    });
                }
                for (key in source) {
                    if (source.hasOwnProperty(key)) {
                        result = copy(source[key], null, stackSource, stackDest);
                        if (_.isObject(source[key])) {
                            stackSource.push(source[key]);
                            stackDest.push(result);
                        }
                        destination[key] = result;
                    }
                }
                setHashKey(destination, h);
            }

        }
        return destination;
    }

    function shallowCopy(src, dst) {
        var i = 0,
            ii,
            key;
        if (_.isArray(src)) {
            dst = dst || [];

            ii = src.length;

            for (i = 0; i < ii; i += 1) {
                dst[i] = src[i];
            }
        } else if (_.isObject(src)) {
            dst = dst || {};

            for (key in src) {
                if (!(key.charAt(0) === '$' && key.charAt(1) === '$')) {
                    dst[key] = src[key];
                }
            }
        }

        return dst || src;
    }

    function equals(o1, o2) {
        if (o1 === o2) { return true; }
        if (o1 === null || o2 === null) { return false; }

        var key,
            keySet;

        if (typeof o1 === 'object' && typeof o2 === 'object') {
            if (_.isArray(o1)) {
                if (!_.isArray(o2)) { return false; }
                if (o1.length === o2.length) {
                    for (key = 0; key < o1.length; key += 1) {
                        if (!equals(o1[key], o2[key])) { return false; }
                    }
                    return true;
                }
            } else if (_.isDate(o1)) {
                if (!_.isDate(o2)) { return false; }
                return equals(o1.getTime(), o2.getTime());
            }
            if (_.isRegExp(o1) && _.isRegExp(o2)) {
                return o1.toString() === o2.toString();
            }
            if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) || _.isArray(o2)) {
                return false;
            }

            keySet = {};

            for (key in o1) {
                if (key.charAt(0) !== '$' || !_.isFunction(o1[key])) {
                    if (!equals(o1[key], o2[key])) { return false; }
                    keySet[key] = true;
                }
            }
            for (key in o2) {
                if (!keySet.hasOwnProperty(key) && key.charAt(0) !== '$' && o2[key] !== undefined && !_.isFunction(o2[key])) { return false; }
            }
            return true;
        }
        return false;
    }

    csp = function () {
        if (isDefined(csp.isActive_)) { return csp.isActive_; }

        var active = !!(document.querySelector('[ng-csp]') || document.querySelector('[data-ng-csp]'));

        if (!active) {
            try {
                /* jshint -W031, -W054 */
                new Function('');
                /* jshint +W031, +W054 */
            } catch (e) {
                active = true;
            }
        }

        csp.isActive_ = active;

        return csp.isActive_;
    };

    function concat(array1, array2, index) {
        return array1.concat(slice.call(array2, index));
    }

    function sliceArgs(args, startIndex) {
        return slice.call(args, startIndex || 0);
    }

    function startingTag(element) {
        element = jqLite(element).clone();
        try {
            element.empty();
        } catch (ignore) {}
        // As Per DOM Standards
        var TEXT_NODE = 3,
            elemHtml = jqLite('<div>').append(element).html();
        try {
            return element[0].nodeType === TEXT_NODE ? lowercase(elemHtml) : elemHtml.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/,
                    function (match, nodeName) {
                        return '<' + lowercase(nodeName);
                    }
                );
        } catch (e) {
            return lowercase(elemHtml);
        }
    }

    function tryDecodeURIComponent(value) {
        try {
            return decodeURIComponent(value);
        } catch (e) {
            return '';
        }
    }

    function encodeUriQuery(val, pctEncodeSpaces) {
        return encodeURIComponent(val).
            replace(/%40/gi, '@').
            replace(/%3A/gi, ':').
            replace(/%24/g, '$').
            replace(/%2C/gi, ',').
            replace(/%3B/gi, ';').
            replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
    }

    function encodeUriSegment(val) {
        return encodeUriQuery(val, true).
            replace(/%26/gi, '&').
            replace(/%3D/gi, '=').
            replace(/%2B/gi, '+');
    }

    function parseKeyValue(keyValue) {
        var obj = {},
            key_value,
            key;

        if (msos.config.verbose) {
            msos.console.debug('ng - parseKeyValue -> input: ' + keyValue);
        }

        forEach((keyValue || "").split('&'), function (keyValue) {
            if (keyValue) {
                key_value = keyValue.replace(/\+/g, '%20').split('=');
                key = tryDecodeURIComponent(key_value[0]);
                if (isDefined(key)) {
                    var val = isDefined(key_value[1]) ? tryDecodeURIComponent(key_value[1]) : true;
                    if (!hasOwnProperty.call(obj, key)) {
                        obj[key] = val;
                    } else if (_.isArray(obj[key])) {
                        obj[key].push(val);
                    } else {
                        obj[key] = [obj[key], val];
                    }
                }
            }
        });

        if (msos.config.verbose) {
            msos.console.debug('ng - parseKeyValue -> output:', obj);
        }
        return obj;
    }

    function toKeyValue(obj) {
        var parts = [];
        forEach(obj, function (value, key) {
            if (_.isArray(value)) {
                forEach(value, function (arrayValue) {
                    parts.push(encodeUriQuery(key, true) + (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
                });
            } else {
                parts.push(encodeUriQuery(key, true) + (value === true ? '' : '=' + encodeUriQuery(value, true)));
            }
        });
        return parts.length ? parts.join('&') : '';
    }

    function snake_case(name, separator) {
        separator = separator || '_';
        return name.replace(SNAKE_CASE_REGEXP, function (letter, pos) {
            return (pos ? separator : '') + letter.toLowerCase();
        });
    }

    function JQLite(element) {

        if (element instanceof jQuery) {
            return element;
        }

        return jQuery(element);
    }

    JQLitePrototype = JQLite.prototype;

    function bindJQuery() {

        var originalCleanData,
            temp_bj = 'ng - bindJQuery -> ';

        msos.console.debug(temp_bj + 'start.');

        if (bindJQueryFired) {
            return;
        }

        if (jQuery && jQuery.fn.on) {

            jqLite = jQuery;

            extend(jQuery.fn, {
                scope: JQLitePrototype.scope,
                isolateScope: JQLitePrototype.isolateScope,
                controller: JQLitePrototype.controller,
                injector: JQLitePrototype.injector,
                inheritedData: JQLitePrototype.inheritedData
            });

            originalCleanData = jQuery.cleanData;
            jQuery.cleanData = function (elems) {
                var i = 0,
                    events;

                if (!skipDestroyOnNextJQueryCleanData) {
                    // must be "!=" and not "!==" null
                    for (i = 0; elems[i] != null; i += 1) {     // jshint ignore:line
                        events = jQuery._data(elems[i], "events");
                        if (events && events.$destroy) {
                            jQuery(elems[i]).triggerHandler('$destroy');
                        }
                    }
                } else {
                    skipDestroyOnNextJQueryCleanData = false;
                }
                originalCleanData(elems);
            };
        } else {
            msos.console.error(temp_bj + 'jQuery is missing!');
        }

        angular.element = jqLite;

        // Prevent double-proxying.
        bindJQueryFired = true;
    }

    function assertArg(arg, name, reason) {
        if (!arg) {
            throw ngMinErr('areq', "Argument '{0}' is {1}", (name || '?'), (reason || "required"));
        }
        return arg;
    }

    function assertArgFn(arg, name, acceptArrayAnnotation) {

        if (acceptArrayAnnotation && _.isArray(arg)) {
            arg = arg[arg.length - 1];
        }

        assertArg(_.isFunction(arg), name, 'not a function, is ' + (arg && typeof arg === 'object' ? arg.constructor.name || 'Object' : typeof arg));
        return arg;
    }

    function assertNotHasOwnProperty(name, context) {
        if (name === 'hasOwnProperty') {
            throw ngMinErr('badname', "hasOwnProperty is not a valid {0} name", context);
        }
    }

    function getter(obj, path, bindFnToScope) {

        if (!path) { return obj; }

        var keys = path.split('.'),
            key,
            lastInstance = obj,
            i = 0;

        for (i = 0; i < keys.length; i += 1) {
            key = keys[i];
            if (obj) {
                lastInstance = obj;
                obj = obj[key];
            }
        }

        if (!bindFnToScope && _.isFunction(obj)) {
            return _.bind(lastInstance, obj);
        }
        return obj;
    }

    function getBlockNodes(nodes) {

        var node = nodes[0],
            endNode = nodes[nodes.length - 1],
            blockNodes = [node];

        do {
            node = node.nextSibling;
            if (!node) { break; }
            blockNodes.push(node);
        } while (node !== endNode);

        return jqLite(blockNodes);
    }

    function createMap() {
        return Object.create(null);
    }

    function setupModuleLoader(window) {

        var temp_sm = 'ng - setupModuleLoader',
            angular_module = {};

        function ensure(obj, name, factory) {
            var debug = 'exists';

            if (!obj[name]) {
                obj[name] = factory();
                debug = 'created';
            }

            if (msos.config.verbose) {
                msos.console.debug(temp_sm + ' - ensure -> ' + name + ', (' + debug + ')');
            }

            return obj[name];
        }

        msos.console.debug(temp_sm + ' -> start.');

        angular = ensure(window, 'angular', Object);

        // Store a list of angular.module() calls
        angular.modulelist = [];

        // We need to expose `angular.$$minErr` to modules such as `ngResource` that reference it during bootstrap
        angular.$$minErr = angular.$$minErr || minErr;

        angular_module = ensure(angular, 'module', function () {
            /** @type {Object.<string, angular.Module>} */
            var modules = {};

            return function module(name, requires, configFn) {

                msos.console.debug(temp_sm + ' - module -> start: ' + name);

                angular.modulelist.push(name.replace(/\./g, '_'));

                assertNotHasOwnProperty(name, 'module');

                if (requires && modules.hasOwnProperty(name)) {
                    modules[name] = null;
                }

                return ensure(modules, name, function () {

                    if (!requires) {
                        throw $injectorMinErr('nomod', "Module '{0}' is not available! You either misspelled " + "the module name or forgot to load it. If registering a module ensure that you " + "specify the dependencies as the second argument.", name);
                    }

                    var invokeQueue = [],
                        configBlocks = [],
                        runBlocks = [],
                        config,
                        moduleInstance = {};

                    function invokeLater(provider, method, insertMethod, queue) {
                        if (!queue) { queue = invokeQueue; }
                        return function () {
                            queue[insertMethod || 'push']([provider, method, arguments]);
                            return moduleInstance;
                        };
                    }

                    config = invokeLater('$injector', 'invoke', 'push', configBlocks);

                    moduleInstance = {
                        // Private state
                        _invokeQueue: invokeQueue,
                        _configBlocks: configBlocks,
                        _runBlocks: runBlocks,

                        requires: requires,
                        name: name,

                        provider:   invokeLater('$provide', 'provider'),
                        factory:    invokeLater('$provide', 'factory'),
                        service:    invokeLater('$provide', 'service'),
                        value:      invokeLater('$provide', 'value'),
                        constant:   invokeLater('$provide', 'constant', 'unshift'),
                        animation:  invokeLater('$animateProvider', 'register'),
                        filter:     invokeLater('$filterProvider', 'register'),
                        controller: invokeLater('$controllerProvider', 'register'),
                        directive:  invokeLater('$compileProvider', 'directive'),

                        config: config,

                        run: function (block) {
                            runBlocks.push(block);
                            return this;
                        }
                    };

                    if (configFn) {
                        config(configFn);
                    }

                    msos.console.debug(temp_sm + ' - module -> done: ' + name);
                    return moduleInstance;
                });
            };
        });

        msos.console.debug(temp_sm + ' -> done!');

        return angular_module;
    }

    function camelCase(name) {
        return name.replace(SPECIAL_CHARS_REGEXP, function (dumby, separator, letter, offset) {
                        return offset ? letter.toUpperCase() : letter;
                    }
                ).replace(MOZ_HACK_REGEXP, 'Moz$1');
    }

    function jqLiteIsTextNode(html) {
        return !HTML_REGEXP.test(html);
    }

    function jqLiteClone(element) {
        return element.cloneNode(true);
    }

    function jqLiteRemoveClass(element, cssClasses) {
        if (cssClasses && element.setAttribute) {
            forEach(cssClasses.split(' '), function (cssClass) {
                element.setAttribute('class', trim(
                (" " + (element.getAttribute('class') || '') + " ").replace(/[\n\t]/g, " ").replace(" " + trim(cssClass) + " ", " ")));
            });
        }
    }

    function jqLiteAddClass(element, cssClasses) {
        if (cssClasses && element.setAttribute) {
            var existingClasses = (' ' + (element.getAttribute('class') || '') + ' ').replace(/[\n\t]/g, " ");

            forEach(cssClasses.split(' '), function (cssClass) {
                cssClass = trim(cssClass);
                if (existingClasses.indexOf(' ' + cssClass + ' ') === -1) {
                    existingClasses += cssClass + ' ';
                }
            });

            element.setAttribute('class', trim(existingClasses));
        }
    }

    function jqLiteAddNodes(root, elements) {

        // Leave root.length++ alone (length needs updating)
        if (elements) {

            if (elements.nodeType) {
                root[root.length] = elements;
                root.length += 1;
            } else {

                var lngth = elements.length,
                    i = 0;

                // if an Array or NodeList and not a Window
                if (typeof lngth === 'number' && elements.window !== elements) {
                    if (lngth) {
                        for (i = 0; i < lngth; i += 1) {
                            root[root.length] = elements[i];
                            root.length += 1;
                        }
                    }
                } else {
                    root[root.length] = elements;
                    root.length += 1;
                }
            }
        }
    }

    function jqLiteInheritedData(element, name, value) {

        if (element.nodeType === 9) {
            element = element.documentElement;
        }

        var names = _.isArray(name) ? name : [name],
            i = 0;

        while (element) {
            for (i = 0; i < names.length; i += 1) {
                value = jqLite.data(element, names[i]);
                if (value !== undefined) { return value; }
            }

            element = element.parentNode || (element.nodeType === 11 && element.host);
        }

        return undefined;
    }

    function jqLiteController(element, name) {
        return jqLiteInheritedData(element, '$' + (name || 'ngController') + 'Controller');
    }

    forEach(['multiple', 'selected', 'checked', 'disabled', 'readOnly', 'required', 'open'], function (value) {
        BOOLEAN_ATTR[lowercase(value)] = value;
    });

    forEach(['input', 'select', 'option', 'textarea', 'button', 'form', 'details'], function (value) {
        BOOLEAN_ELEMENTS[value] = true;
    });

    function getBooleanAttrName(element, name) {
        // check dom last since we will most likely fail on name
        var booleanAttr = BOOLEAN_ATTR[name.toLowerCase()];

        // booleanAttr is here twice to minimize DOM access
        return booleanAttr && BOOLEAN_ELEMENTS[nodeName_(element)] && booleanAttr;
    }

    function getAliasedAttrName(element, name) {
        var nodeName = element.nodeName;
        return (nodeName === 'INPUT' || nodeName === 'TEXTAREA') && ALIASED_ATTR[name];
    }

    forEach({

        inheritedData: jqLiteInheritedData,

        scope: function (element) {
            return jqLite.data(element, '$scope') || jqLiteInheritedData(element.parentNode || element, ['$isolateScope', '$scope']);
        },

        isolateScope: function (element) {
            return jqLite.data(element, '$isolateScope') || jqLite.data(element, '$isolateScopeNoTemplate');
        },

        controller: jqLiteController,

        injector: function (element) {
            return jqLiteInheritedData(element, '$injector');
        }

    }, function (fn, name) {

        JQLite.prototype[name] = function (arg1, arg2) {
            var i = 0,
                j = 0,
                jj,
                key,
                nodeCount = this.length,
                value,
                nodeValue;

            if (((fn.length === 2 && fn !== jqLiteController) ? arg1 : arg2) === undefined) {

                if (_.isObject(arg1)) {

                    for (i = 0; i < nodeCount; i += 1) {
                        for (key in arg1) {
                            fn(this[i], key, arg1[key]);
                        }
                    }

                    return this;
                }

                value = fn.$dv;
                jj = (value === undefined) ? Math.min(nodeCount, 1) : nodeCount;

                // Only if we have $dv do we iterate over all, otherwise it is just the first element.
                for (j = 0; j < jj; j += 1) {
                    nodeValue = fn(this[j], arg1, arg2);
                    value = value ? value + nodeValue : nodeValue;
                }

                return value;
            }

            for (i = 0; i < nodeCount; i += 1) {
                fn(this[i], arg1, arg2);
            }

            return this;
        };
    });

    forEach({

        clone: jqLiteClone

    }, function (fn, name) {

        JQLite.prototype[name] = function (arg1, arg2, arg3) {
            var value,
                i = 0;

            for (i = 0; i < this.length; i += 1) {
                if (_.isUndefined(value)) {
                    value = fn(this[i], arg1, arg2, arg3);
                    if (isDefined(value)) {
                        // any function which returns a value needs to be wrapped
                        value = jqLite(value);
                    }
                } else {
                    jqLiteAddNodes(value, fn(this[i], arg1, arg2, arg3));
                }
            }
            return isDefined(value) ? value : this;
        };

    });

    function hashKey(obj, nextUidFn) {
        var key = obj && obj.$$hashKey,
            objType;

        if (key) {
            if (typeof key === 'function') {
                key = obj.$$hashKey();
            }
            return key;
        }

        objType = typeof obj;

        if (objType === 'function' || (objType === 'object' && obj !== null)) {
            key = obj.$$hashKey = objType + ':' + (nextUidFn || nextUid)();
        } else {
            key = objType + ':' + obj;
        }

        return key;
    }

    function HashMap(array, isolatedUid) {
        if (isolatedUid) {
            var iso_uid = 0;
            this.nextUid = function () {
                iso_uid += 1;
                return iso_uid;
            };
        }
        forEach(array, this.put, this);
    }

    HashMap.prototype = {

        put: function (key, value) {
            this[hashKey(key, this.nextUid)] = value;
        },

        get: function (key) {
            return this[hashKey(key, this.nextUid)];
        },

        remove: function (key) {
            key = hashKey(key, this.nextUid);
            var value = this[key];
            delete this[key];
            return value;
        }
    };

    function anonFn(fn) {
        var fnText = fn.toString().replace(STRIP_COMMENTS, ''),
            args = fnText.match(FN_ARGS);
        if (args) {
            return 'function(' + (args[1] || '').replace(/[\s\r\n]+/, ' ') + ')';
        }
        return 'fn';
    }

    function annotate(fn, strictDi, name) {
        var temp_a = 'ng - annotate -> ',
            debug = '',
            $inject,
            fnText,
            argDecl,
            last;

        if (msos.config.verbose === 'annotate') {
            msos.console.debug(temp_a + 'start.');
        }

        if (typeof fn === 'function') {
            debug = 'function';
            $inject = fn.$inject;
            if (!$inject) {
                $inject = [];
                if (fn.length) {
                    if (strictDi) {
                        if (!_.isString(name) || !name) {
                            name = fn.name || anonFn(fn);
                        }
                        throw $injectorMinErr('strictdi', '{0} is not using explicit annotation and cannot be invoked in strict mode', name);
                    }
                    fnText = fn.toString().replace(STRIP_COMMENTS, '');
                    argDecl = fnText.match(FN_ARGS);
                    forEach(argDecl[1].split(FN_ARG_SPLIT), function (arg) {
                        arg.replace(FN_ARG, function (all, underscore, name) {
                            $inject.push(name);
                        });
                    });
                }
                fn.$inject = $inject;
            }
        } else if (_.isArray(fn)) {
            debug = 'array';
            last = fn.length - 1;
            assertArgFn(fn[last], 'fn');
            $inject = fn.slice(0, last);
        } else {
            debug = 'unknown';
            assertArgFn(fn, 'fn', true);
        }

        if (msos.config.verbose === 'annotate') {
            msos.console.debug(temp_a + 'done, for ' + debug + (name ? ', name: ' + name : ''));
        }
        return $inject;
    }

    function createInjector(modulesToLoad, strictDi) {

        strictDi = (strictDi === true);

        var temp_ci = 'ng - createInjector',
            vb = msos.config.verbose,
            INSTANTIATING = {},
            providerSuffix = 'Provider',
            path = [],
            loadedModules = new HashMap([], true),
            providerCache = {},
            instanceCache = {},
            providerInjector = null,
            instanceInjector = null;

        msos.console.info(temp_ci + ' ===> start:', modulesToLoad);

        ////////////////////////////////////
        // $provider
        ////////////////////////////////////
        function supportObject(delegate) {
            return function (key, value) {
                if (_.isObject(key)) {
                    forEach(key, reverseParams(delegate));
                } else {
                    return delegate(key, value);
                }
                return undefined;
            };
        }

        function provider(name, provider_) {

            var db_out = name + ', ' + name + providerSuffix;

            if (vb) {
                msos.console.debug(temp_ci + ' - provider -> start: ' + db_out);
            }

            assertNotHasOwnProperty(name, 'service');

            if (_.isFunction(provider_) || _.isArray(provider_)) {
                provider_ = providerInjector.instantiate(provider_);
            }

            if (!provider_.$get) {
                throw $injectorMinErr('pget', "Provider '{0}' must define $get factory method.", name);
            }

            if (vb) {
                msos.console.debug(temp_ci + ' - provider ->  done: ' + db_out);
            }

            // Cache the current provider
            providerCache[name + providerSuffix] = provider_;

            return provider_;
        }

        function factory(name, factoryFn) {
            return provider(name, {
                $get: factoryFn
            });
        }

        function service(name, constructor) {
            if (vb) {
                msos.console.debug(temp_ci + ' - service -> called: ' + name);
            }
            return factory(name, ['$injector', function ($injector) {
                return $injector.instantiate(constructor);
            }]);
        }

        function value(name, val) {
            return factory(name, valueFn(val));
        }

        function constant(name, value) {
            assertNotHasOwnProperty(name, 'constant');
            providerCache[name] = value;
            instanceCache[name] = value;
        }


        function decorator(serviceName, decorFn) {
            if (vb) {
                msos.console.debug(temp_ci + ' - decorator -> called: ' + serviceName + providerSuffix);
            }
            var origProvider = providerInjector.get(serviceName + providerSuffix),
                orig$get = origProvider.$get;

            origProvider.$get = function () {
                var origInstance = instanceInjector.invoke(orig$get, origProvider);
                return instanceInjector.invoke(decorFn, null, {
                    $delegate: origInstance
                });
            };
        }

        providerCache = {
            $provide: {
                provider: supportObject(provider),
                factory: supportObject(factory),
                service: supportObject(service),
                value: supportObject(value),
                constant: supportObject(constant),
                decorator: decorator
            }
        };

        if (vb) {
            msos.console.debug(temp_ci + ' ===> create providerInjector.');
        }

        ////////////////////////////////////
        // internal Injector
        ////////////////////////////////////
        function createInternalInjector(cache, factory) {
            var temp_cii = ' - createInternalInjector';

            if (vb === 'injector') {
                msos.console.debug(temp_ci + temp_cii + ' -> start.');
            }

            function getService(serviceName) {

                if (vb === 'injector') {
                    msos.console.debug(temp_ci + temp_cii + ' - getService -> ' + serviceName);
                }

                if (cache.hasOwnProperty(serviceName)) {
                    if (cache[serviceName] === INSTANTIATING) {
                        throw $injectorMinErr('cdep', 'Circular dependency found: {0}', serviceName + ' <- ' + path.join(' <- '));
                    }
                    return cache[serviceName];
                }

                try {
                    path.unshift(serviceName);
                    cache[serviceName] = INSTANTIATING;
                    cache[serviceName] = factory(serviceName);
                    return cache[serviceName];
                } catch (err) {
                    if (cache[serviceName] === INSTANTIATING) {
                        delete cache[serviceName];
                    }
                    throw err;
                } finally {
                    path.shift();
                }
            }

            function invoke(fn, self, locals, serviceName) {

                if (vb === 'injector') {
                    msos.console.debug(temp_ci + temp_cii + ' - invoke -> start' + (serviceName ? ': ' + serviceName : '.'));
                }

                if (typeof locals === 'string') {
                    serviceName = locals;
                    locals = null;
                }

                var args = [],
                    $inject = annotate(fn, strictDi, serviceName),
                    length,
                    i = 0,
                    key,
                    debug = [];

                for (i = 0, length = $inject.length; i < length; i += 1) {
                    key = $inject[i];
                    if (typeof key !== 'string') {
                        throw $injectorMinErr('itkn', 'Incorrect injection token! Expected service name as string, got {0}', key);
                    }

                    debug.push(key);

                    args.push(locals && locals.hasOwnProperty(key) ? locals[key] : getService(key));
                }

                if (_.isArray(fn)) {
                    fn = fn[length];
                }

                if (vb === 'injector') {
                    msos.console.debug(temp_ci + temp_cii + ' - invoke -> done:', debug);
                }

                return fn.apply(self, args);
            }

            function instantiate(Type, locals, serviceName) {

                var Constructor = function () {},
                    instance,
                    returnedValue;

                if (vb === 'injector') {
                    msos.console.debug(temp_ci + temp_cii + ' - instantiate -> start.');
                }

                // Check if Type is annotated and use just the given function at n-1 as parameter
                // e.g. someModule.factory('greeter', ['$window', function(renamed$window) {}]);
                Constructor.prototype = (_.isArray(Type) ? Type[Type.length - 1] : Type).prototype;

                instance = new Constructor();

                returnedValue = invoke(Type, instance, locals, serviceName);

                if (vb === 'injector') {
                    msos.console.debug(temp_ci + temp_cii + ' - instantiate ->  done!');
                }

                return _.isObject(returnedValue) || _.isFunction(returnedValue) ? returnedValue : instance;
            }

            if (vb === 'injector') {
                msos.console.debug(temp_ci + ' - createInternalInjector ->  done!');
            }

            return {
                invoke: invoke,
                instantiate: instantiate,
                get: getService,
                annotate: annotate,
                has: function (name) {
                    return providerCache.hasOwnProperty(name + providerSuffix) || cache.hasOwnProperty(name);
                }
            };
        }

        providerCache.$injector = createInternalInjector(
            providerCache,
            function () { throw $injectorMinErr('unpr', "Unknown provider: {0}", path.join(' <- ')); }
        );

        providerInjector = providerCache.$injector;

        if (vb) {
            msos.console.debug(temp_ci + ' ===> create instanceInjector.');
        }

        instanceCache.$injector = createInternalInjector(
            instanceCache,
            function (servicename) {
                var sn_provider = providerInjector.get(servicename + providerSuffix);
                return instanceInjector.invoke(sn_provider.$get, sn_provider, undefined, servicename);
            }
        );

        instanceInjector = instanceCache.$injector;

        ////////////////////////////////////
        // Module Loading
        ////////////////////////////////////
        function loadModules(modulesToLoad) {

            var debug_note = [],
                runBlocks = [],
                moduleFn;

            if (vb) {
                msos.console.debug(temp_ci + ' - loadModules -> start:', modulesToLoad);
            }

            if (modulesToLoad.length === 0) {
                debug_note.push('no module(s)');
            }

            forEach(modulesToLoad, function (module) {

                if (loadedModules.get(module)) {
                    if (vb) {
                        msos.console.debug(temp_ci + ' - loadModules ->  done, module exists:', modulesToLoad);
                    }
                    return;
                }

                loadedModules.put(module, true);

                function runInvokeQueue(queue) {
                    var i = 0,
                        invokeArgs,
                        riq_provider;

                    for (i = 0; i < queue.length; i += 1) {
                        invokeArgs = queue[i];

                        riq_provider = providerInjector.get(invokeArgs[0]);
                        riq_provider[invokeArgs[1]].apply(riq_provider, invokeArgs[2]);
                    }
                }

                try {
                    if (_.isString(module)) {
                        debug_note.push('is string');
                        moduleFn = angularModule(module);
                        runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks);
                        runInvokeQueue(moduleFn._invokeQueue);
                        runInvokeQueue(moduleFn._configBlocks);
                    } else if (_.isFunction(module)) {
                        debug_note.push('is function');
                        runBlocks.push(providerInjector.invoke(module));
                    } else if (_.isArray(module)) {
                        debug_note.push('is array');
                        runBlocks.push(providerInjector.invoke(module));
                    } else {
                        debug_note.push('is arg function');
                        assertArgFn(module, 'module');
                    }
                } catch (e) {
                    debug_note.push('error: ' + module);
                    if (_.isArray(module)) {
                        module = module[module.length - 1];
                    }

                    msos.console.error(temp_ci + ' - loadModules ->  failed for: ' + module, e);
                }
            });

            if (vb) {
                msos.console.debug(temp_ci + ' - loadModules ->  done, ' + debug_note.join(', ') + ':', modulesToLoad);
            }

            return runBlocks;
        }

        if (vb) {
            msos.console.debug(temp_ci + ' ===> run instanceInjector.invoke.');
        }

        forEach(
            loadModules(modulesToLoad),
            function (fn) {
                instanceInjector.invoke(fn || noop);
            }
        );

        msos.console.info(temp_ci + ' ===> done!');

        return instanceInjector;
    }

    createInjector.$$annotate = annotate;

    function bootstrap(element, modules, config) {

        if (!_.isObject(config)) { config = {}; }

        var defaultConfig = {
                strictDi: false
            },
            temp_b = 'ng - bootstrap',
            doBootstrap = null,
            NG_ENABLE_DEBUG_INFO = /^NG_ENABLE_DEBUG_INFO!/,
            bs_injector;

        config = extend(defaultConfig, config);

        msos.console.debug(temp_b + ' -> start, config:', config);

        doBootstrap = function () {

            var temp_db = ' - doBootstrap',
                tag = '',
                injector = null;

            element = jqLite(element);

            tag = (element[0] === document) ? 'document' : startingTag(element);

            msos.console.debug(temp_b + temp_db + ' -> start, to: ' + tag);

            if (element.injector()) {
                throw ngMinErr('btstrpd', "App Already Bootstrapped to '{0}'", tag.replace(/</, '&lt;').replace(/>/, '&gt;'));
            }

            modules = modules || [];
            modules.unshift(['$provide', function ($provide) {
                $provide.value('$rootElement', element);
            }]);

            if (config.debugInfoEnabled) {
                // Pushing so that this overrides `debugInfoEnabled` setting defined in user's `modules`.
                modules.push(
                    [
                        '$compileProvider',
                        function ($compileProvider) {
                            $compileProvider.debugInfoEnabled(true);
                        }
                    ]
                );
            }

            modules.unshift('ng');

            injector = createInjector(modules, config.strictDi);

            injector.invoke(
            ['$rootScope', '$rootElement', '$compile', '$injector', function bootstrapApply(scope, element, compile, injector) {
                msos.console.debug(temp_b + temp_db + ' - bootstrapApply -> start.');
                scope.$apply(
                    function () {
                        element.data('$injector', injector);
                        compile(element)(scope);
                    }
                );
                msos.console.debug(temp_b + temp_db + ' - bootstrapApply -> done!');
            }]);

            msos.console.debug(temp_b + ' - doBootstrap -> done!');
            return injector;
        };

        if (window && NG_ENABLE_DEBUG_INFO.test(window.name)) {
            config.debugInfoEnabled = true;
            window.name = window.name.replace(NG_ENABLE_DEBUG_INFO, '');
        }

        bs_injector = doBootstrap();

        msos.console.debug(temp_b + ' -> done!');
        return bs_injector;
    }

    function reloadWithDebugInfo() {
        window.name = 'NG_ENABLE_DEBUG_INFO!' + window.name;
        window.location.reload();
    }

    function getTestability(rootElement) {
        return angular.element(rootElement).injector().get('$$testability');
    }

    function jqLiteHasClass(element, selector) {
        if (!element.getAttribute) { return false; }
        return ((" " + (element.getAttribute('class') || '') + " ").replace(/[\n\t]/g, " ").indexOf(" " + selector + " ") > -1);
    }

    function $AnchorScrollProvider() {

        var autoScrollingEnabled = true;

        this.disableAutoScrolling = function () {
            autoScrollingEnabled = false;
        };

        this.$get = ['$window', '$location', '$rootScope', function ($window, $location, $rootScope) {
            var ng_win_doc = $window.document;

            function getFirstAnchor(list) {
                var result = null;
                forEach(list, function (element) {
                    if (!result && nodeName_(element) === 'a') { result = element; }
                });
                return result;
            }

            function scroll() {
                var hash = $location.hash(),
                    elm;

                // empty hash, scroll to the top of the page
                if (hash === 'top' || !hash) {

                    $window.scrollTo(0, 0);

                } else {

                    elm = ng_win_doc.getElementById(hash) || getFirstAnchor(ng_win_doc.getElementsByName(hash));

                    if (elm) { elm.scrollIntoView(); }
                }
            }

            if (autoScrollingEnabled) {
                $rootScope.$watch(function autoScrollWatch() {
                    return $location.hash();
                }, function autoScrollWatchAction() {
                    $rootScope.$evalAsync(scroll);
                });
            }

            return scroll;
        }];
    }

    $animateMinErr = minErr('$animate');

    $AnimateProvider = ['$provide', function ($provide) {

        this.$$selectors = {};

        this.register = function (name, factory) {
            var key = name + '-animation';
            if (name && name.charAt(0) !== '.') {
                throw $animateMinErr('notcsel', "Expecting class selector starting with '.' got '{0}'.", name);
            }
            this.$$selectors[name.substr(1)] = key;
            $provide.factory(key, factory);
        };

        this.classNameFilter = function (expression) {
            if (arguments.length === 1) {
                this.$$classNameFilter = (expression instanceof RegExp) ? expression : null;
            }
            return this.$$classNameFilter;
        };

        this.$get = ['$$q', '$$asyncCallback', function ($$q, $$asyncCallback) {

            var currentDefer;

            function asyncPromise() {
                // only serve one instance of a promise in order to save CPU cycles
                if (!currentDefer) {
                    currentDefer = $$q.defer();
                    $$asyncCallback(
                        function () {
                            currentDefer.resolve();
                            currentDefer = null;
                        }
                    );
                }

                return currentDefer.promise;
            }

            return {

                enter: function (element, parent, after) {
                    if (after)  { after.after(element); }
                    else        { parent.prepend(element); }

                    return asyncPromise();
                },

                leave: function (element) {
                    element.remove();
                    return asyncPromise();
                },

                move: function (element, parent, after) {
                    // Do not remove element before insert. Removing will cause data associated with the
                    // element to be dropped. Insert will implicitly do the remove.
                    return this.enter(element, parent, after);
                },

                addClass: function (element, className) {
                    className = !_.isString(className) ? (_.isArray(className) ? className.join(' ') : '') : className;

                    forEach(
                        element,
                        function (element) {
                            jqLiteAddClass(element, className);
                        }
                    );

                    return asyncPromise();
                },

                removeClass: function (element, className) {
                    className = _.isString(className) ? className : _.isArray(className) ? className.join(' ') : '';
                    forEach(
                        element,
                        function (element) {
                            jqLiteRemoveClass(element, className);
                        }
                    );

                    return asyncPromise();
                },

                setClass: function (element, add, remove) {
                    this.addClass(element, add);
                    this.removeClass(element, remove);

                    return asyncPromise();
                },

                enabled: noop,
                cancel: noop
            };
        }];
    }];

    function $$AsyncCallbackProvider() {
        this.$get = ['$$rAF', '$timeout', function ($$rAF, $timeout) {
            return $$rAF.supported ?
            function (fn) {
                return $$rAF(fn);
            } : function (fn) {
                return $timeout(fn, 0, false);
            };
        }];
    }

    function Browser(window, document, $log) {
        var temp_br = 'ng - Browser',
            self = this,
            rawDocument = document[0],
            location = window.location,
            history = window.history,
            setTimeout = window.setTimeout,
            clearTimeout = window.clearTimeout,
            pendingDeferIds = {},
            outstandingRequestCount = 0,
            outstandingRequestCallbacks = [],
            pollFns = [],
            pollTimeout,
            lastBrowserUrl = location.href,
            baseElement = document.find('base'),
            newLocation = null,
            urlChangeListeners = [],
            urlChangeInit = false,
            lastCookies = {},
            lastCookieString = '',
            cookiePath;

        self.isMock = false;

        function completeOutstandingRequest(fn) {
            try {
                fn.apply(null, sliceArgs(arguments, 1));
            } finally {
                outstandingRequestCount -= 1;
                if (outstandingRequestCount === 0) {
                    while (outstandingRequestCallbacks.length) {
                        try {
                            outstandingRequestCallbacks.pop()();
                        } catch (e) {
                            $log.error(e);
                        }
                    }
                }
            }
        }

        self.$$completeOutstandingRequest = completeOutstandingRequest;
        self.$$incOutstandingRequestCount = function () {
            outstandingRequestCount += 1;
        };

        self.notifyWhenNoOutstandingRequests = function (callback) {

            forEach(
                pollFns,
                function (pollFn) { pollFn(); }
            );

            if (outstandingRequestCount === 0) {
                callback();
            } else {
                outstandingRequestCallbacks.push(callback);
            }
        };

        //////////////////////////////////////////////////////////////
        // Poll Watcher API
        //////////////////////////////////////////////////////////////

        function startPoller(interval, setTimeout) {
            (function check() {
                forEach(pollFns, function (pollFn) {
                    pollFn();
                });
                pollTimeout = setTimeout(check, interval);
            }());
        }

        self.addPollFn = function (fn) {
            if (_.isUndefined(pollTimeout)) { startPoller(100, setTimeout); }
            pollFns.push(fn);
            return fn;
        };

        //////////////////////////////////////////////////////////////
        // URL API
        //////////////////////////////////////////////////////////////

        self.url = function (url, replace) {
            // Android Browser BFCache causes location, history reference to become stale.
            if (location !== window.location) { location = window.location; }
            if (history  !== window.history)  { history  = window.history; }

            msos.console.debug(temp_br + ' - url -> ' + (url ? 'setter: ' + url : 'getter'));

            // setter
            if (url) {
                if (lastBrowserUrl === url) {
                    msos.console.debug(temp_br + ' - url -> no change!');
                    return undefined;
                }
                lastBrowserUrl = url;
                if (Modernizr.history) {
                    if (replace) {
                        history.replaceState(null, '', url);
                    } else {
                        history.pushState(null, '', url);
                        // Crazy Opera Bug: http://my.opera.com/community/forums/topic.dml?id=1185462
                        baseElement.attr('href', baseElement.attr('href'));
                    }
                } else {
                    newLocation = url;
                    if (replace)    { location.replace(url); }
                    else            { location.href = url; }
                }
                return self;
            }

            // getter
            return newLocation || location.href.replace(/%27/g, "'");
        };

        function fireUrlChange() {
            newLocation = null;

            if (lastBrowserUrl === self.url()) {
                msos.console.debug(temp_br + ' - fireUrlChange -> no change!');
                return;
            }

            lastBrowserUrl = self.url();
            forEach(urlChangeListeners, function (listener) {
                listener(self.url());
            });
        }

        self.onUrlChange = function (callback) {

            if (!urlChangeInit) {

                if (Modernizr.history) {
                    jqLite(window).on('popstate', fireUrlChange);
                }

                // hashchange event
                if (Modernizr.hashchange) {
                    jqLite(window).on('hashchange', fireUrlChange);
                } else {
                    // polling
                    self.addPollFn(fireUrlChange);
                }

                urlChangeInit = true;
            }

            urlChangeListeners.push(callback);
            return callback;
        };

        self.$$checkUrlChange = fireUrlChange;

        self.baseHref = function () {
            var href = baseElement.attr('href');
            return href ? href.replace(/^(https?\:)?\/\/[^\/]*/, '') : '';
        };

        cookiePath = self.baseHref();

        self.cookies = function (name, value) {
            var cookieLength, cookieArray, cookie, i, index;

            if (name) {
                if (value === undefined) {
                    rawDocument.cookie = encodeURIComponent(name) + "=;path=" + cookiePath + ";expires=Thu, 01 Jan 1970 00:00:00 GMT";
                } else {
                    if (_.isString(value)) {
                        rawDocument.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';path=' + cookiePath;
                        cookieLength = rawDocument.cookie.length + 1;

                        if (cookieLength > 4096) {
                            $log.warn("Cookie '" + name + "' possibly not set or overflowed because it was too large (" + cookieLength + " > 4096 bytes)!");
                        }
                    }
                }
            } else {
                if (rawDocument.cookie !== lastCookieString) {
                    lastCookieString = rawDocument.cookie;
                    cookieArray = lastCookieString.split("; ");
                    lastCookies = {};

                    for (i = 0; i < cookieArray.length; i += 1) {
                        cookie = cookieArray[i];
                        index = cookie.indexOf('=');
                        if (index > 0) { //ignore nameless cookies
                            name = decodeURIComponent(cookie.substring(0, index));

                            if (lastCookies[name] === undefined) {
                                lastCookies[name] = decodeURIComponent(cookie.substring(index + 1));
                            }
                        }
                    }
                }
                return lastCookies;
            }
        };

        self.defer = function (fn, delay) {
            var timeoutId;
            outstandingRequestCount += 1;
            timeoutId = setTimeout(function () {
                delete pendingDeferIds[timeoutId];
                completeOutstandingRequest(fn);
            }, delay || 0);
            pendingDeferIds[timeoutId] = true;
            return timeoutId;
        };

        self.defer.cancel = function (deferId) {
            if (pendingDeferIds[deferId]) {
                delete pendingDeferIds[deferId];
                clearTimeout(deferId);
                completeOutstandingRequest(noop);
                return true;
            }
            return false;
        };

    }

    function $BrowserProvider() {
        this.$get = ['$window', '$log', '$document', function ($window, $log, $document) {
            return new Browser($window, $document, $log);
        }];
    }

    function $CacheFactoryProvider() {

        this.$get = function () {
            var caches = {};

            function cacheFactory(cacheId, options) {

                if (caches.hasOwnProperty(cacheId)) {
                    throw minErr('$cacheFactory')('iid', "CacheId '{0}' is already taken!", cacheId);
                }

                var cfp_size = 0,
                    stats = extend({}, options, {
                        id: cacheId
                    }),
                    data = {},
                    capacity = (options && options.capacity) || Number.MAX_VALUE,
                    lruHash = {},
                    freshEnd = null,
                    staleEnd = null;

                function link(nextEntry, prevEntry) {
                    // should these be '!=='
                    if (nextEntry != prevEntry) {   // jshint ignore:line
                        if (nextEntry) { nextEntry.p = prevEntry; }     //p stands for previous, 'prev' didn't minify
                        if (prevEntry) { prevEntry.n = nextEntry; }     //n stands for next, 'next' didn't minify
                    }
                }

                function refresh(entry) {
                    // should these be '!=='
                    if (entry != freshEnd) {    // jshint ignore:line
                        if (!staleEnd) {
                            staleEnd = entry;
                        } else if (staleEnd == entry) {     // jshint ignore:line
                            staleEnd = entry.n;
                        }

                        link(entry.n, entry.p);
                        link(entry, freshEnd);
                        freshEnd = entry;
                        freshEnd.n = null;
                    }
                }

                caches[cacheId] = {

                    put: function (key, value) {
                        var lruEntry;

                        if (capacity < Number.MAX_VALUE) {
                            if (lruHash[key]) {
                                lruEntry = lruHash[key];
                            } else {
                                lruHash[key] = { key: key };
                                lruEntry = lruHash[key];
                            }
                            refresh(lruEntry);
                        }

                        if (_.isUndefined(value)) { return undefined; }
                        if (!data.hasOwnProperty(key)) { cfp_size += 1; }

                        data[key] = value;

                        if (cfp_size > capacity) {
                            this.remove(staleEnd.key);
                        }

                        return value;
                    },

                    get: function (key) {
                        if (capacity < Number.MAX_VALUE) {
                            var lruEntry = lruHash[key];

                            if (!lruEntry) { return undefined; }

                            refresh(lruEntry);
                        }

                        return data[key];
                    },

                    remove: function (key) {
                        if (capacity < Number.MAX_VALUE) {
                            var lruEntry = lruHash[key];

                            if (!lruEntry) { return; }

                            // Should these be '===' instead of '==' ?
                            if (lruEntry == freshEnd) { freshEnd = lruEntry.p; }    // jshint ignore:line
                            if (lruEntry == staleEnd) { staleEnd = lruEntry.n; }    // jshint ignore:line

                            link(lruEntry.n, lruEntry.p);

                            delete lruHash[key];
                        }

                        delete data[key];
                        cfp_size -= 1;
                    },

                    removeAll: function () {
                        data = {};
                        cfp_size = 0;
                        lruHash = {};
                        freshEnd = staleEnd = null;
                    },

                    destroy: function () {
                        data = null;
                        stats = null;
                        lruHash = null;
                        delete caches[cacheId];
                    },

                    info: function () {
                        return extend({}, stats, {
                            size: cfp_size
                        });
                    }
                };

                return caches[cacheId];
            }

            cacheFactory.info = function () {
                var info = {};
                forEach(caches, function (cache, cacheId) {
                    info[cacheId] = cache.info();
                });
                return info;
            };

            cacheFactory.get = function (cacheId) {
                return caches[cacheId];
            };


            return cacheFactory;
        };
    }

    function $TemplateCacheProvider() {
        this.$get = ['$cacheFactory', function ($cacheFactory) {
            return $cacheFactory('templates');
        }];
    }

    function directiveNormalize(name) {
        return camelCase(name.replace(PREFIX_REGEXP, ''));
    }

    function tokenDifference(str1, str2) {
        var values = '',
            tokens1 = str1.split(/\s+/),
            tokens2 = str2.split(/\s+/),
            token,
            i = 0,
            j = 0;

        outerl:
        for (i = 0; i < tokens1.length; i += 1) {
            token = tokens1[i];
            for (j = 0; j < tokens2.length; j += 1) {
                if (token === tokens2[j]) { continue outerl; }
            }
            values += (values.length > 0 ? ' ' : '') + token;
        }
        return values;
    }

    $compileMinErr = minErr('$compile');

    function $CompileProvider($provide, $$sanitizeUriProvider) {
        var hasDirectives = {},
            Suffix = 'Directive',
            COMMENT_DIRECTIVE_REGEXP = /^\s*directive\:\s*([\d\w_\-]+)\s+(.*)$/,
            CLASS_DIRECTIVE_REGEXP = /(([\d\w_\-]+)(?:\:([^;]+))?;?)/,
            ALL_OR_NOTHING_ATTRS = makeMap(['ngSrc', 'ngSrcset', 'src', 'srcset']),
            EVENT_HANDLER_ATTR_REGEXP = /^(on[a-z]+|formaction)$/,
            debugInfoEnabled_CP = msos.config.debug,     // Default in std AngularJS is 'true'
            temp_cp = 'ng - $CompileProvider';

        this.directive = function registerDirective(name, directiveFactory) {

            assertNotHasOwnProperty(name, 'directive');

            if (_.isString(name)) {
                if (msos.config.verbose) {
                    msos.console.debug(temp_cp + ' - directive -> start: ' + name);
                }
                assertArg(directiveFactory, 'directiveFactory');
                if (!hasDirectives.hasOwnProperty(name)) {
                    hasDirectives[name] = [];
                    $provide.factory(name + Suffix, ['$injector', '$exceptionHandler', function ($injector, $exceptionHandler) {
                        var directives = [];
                        forEach(hasDirectives[name], function (directiveFactory, index) {
                            try {
                                var directive = $injector.invoke(directiveFactory);
                                if (_.isFunction(directive)) {
                                    directive = {
                                        compile: valueFn(directive)
                                    };
                                } else if (!directive.compile && directive.link) {
                                    directive.compile = valueFn(directive.link);
                                }
                                directive.priority = directive.priority || 0;
                                directive.index = index;
                                directive.name = directive.name || name;
                                directive.require = directive.require || (directive.controller && directive.name);
                                directive.restrict = directive.restrict || 'EA';
                                directives.push(directive);
                            } catch (e) {
                                $exceptionHandler(e);
                            }
                        });
                        return directives;
                    }]);
                }
                hasDirectives[name].push(directiveFactory);
            } else {
                if (msos.config.verbose) {
                    msos.console.debug(temp_cp + ' - directive -> reverseParams.');
                }
                forEach(name, reverseParams(registerDirective));
            }

            if (msos.config.verbose) {
                msos.console.debug(temp_cp + ' - directive -> done: ' + name);
            }
            return this;
        };

        this.aHrefSanitizationWhitelist = function (regexp) {
            if (isDefined(regexp)) {
                $$sanitizeUriProvider.aHrefSanitizationWhitelist(regexp);
                return this;
            }
            return $$sanitizeUriProvider.aHrefSanitizationWhitelist();
        };

        this.imgSrcSanitizationWhitelist = function (regexp) {
            if (isDefined(regexp)) {
                $$sanitizeUriProvider.imgSrcSanitizationWhitelist(regexp);
                return this;
            }
            return $$sanitizeUriProvider.imgSrcSanitizationWhitelist();
        };

        this.debugInfoEnabled = function (enabled) {
            if (isDefined(enabled)) {
                debugInfoEnabled_CP = enabled;
                return this;
            }
            return debugInfoEnabled_CP;
        };

        this.$get = [
            '$injector', '$interpolate', '$exceptionHandler', '$templateRequest', '$parse',
            '$controller', '$rootScope', '$document', '$sce', '$animate', '$$sanitizeUri',
            function($injector,   $interpolate,   $exceptionHandler,   $templateRequest,   $parse,
                     $controller,   $rootScope,   $document,   $sce,   $animate,   $$sanitizeUri) {

            var Attributes = function (element, attributesToCopy) {
                    if (attributesToCopy) {
                        var keys = Object.keys(attributesToCopy),
                            i,
                            key;

                        for (i = 0; i < keys.length; i += 1) {
                            key = keys[i];
                            this[key] = attributesToCopy[key];
                        }
                    } else {
                        this.$attr = {};
                    }

                    this.$$element = element;
                },
                startSymbol = $interpolate.startSymbol(),
                endSymbol = $interpolate.endSymbol(),
                denormalizeTemplate = (startSymbol === '{{' || endSymbol === '}}') ? identity : function denormalizeTemplate(template) {
                    return template.replace(/\{\{/g, startSymbol).replace(/}}/g, endSymbol);
                },
                NG_ATTR_BINDING = /^ngAttr[A-Z]/,
                applyDirectivesToNode = null,
                compile = null;

            Attributes.prototype = {

                $normalize: directiveNormalize,

                $addClass: function (classVal) {
                    if (classVal && classVal.length > 0) {
                        $animate.addClass(this.$$element, classVal);
                    }
                },

                $removeClass: function (classVal) {
                    if (classVal && classVal.length > 0) {
                        $animate.removeClass(this.$$element, classVal);
                    }
                },

                $updateClass: function (newClasses, oldClasses) {
                    var toAdd = tokenDifference(newClasses, oldClasses),
                        toRemove;

                    if (toAdd && toAdd.length) {
                        $animate.addClass(this.$$element, toAdd);
                    }

                    toRemove = tokenDifference(oldClasses, newClasses);

                    if (toRemove && toRemove.length) {
                        $animate.removeClass(this.$$element, toRemove);
                    }
                },

                $set: function (key, value, writeAttr, attrName) {

                    var node = this.$$element[0],
                        booleanKey = getBooleanAttrName(node, key),
                        aliasedKey = getAliasedAttrName(node, key),
                        observer = key,
                        $$observers,
                        nodeName;

                    if (booleanKey) {
                        this.$$element.prop(key, value);
                        attrName = booleanKey;
                    } else if (aliasedKey) {
                        this[aliasedKey] = value;
                        observer = aliasedKey;
                    }

                    this[key] = value;

                    // translate normalized key to actual key
                    if (attrName) {
                        this.$attr[key] = attrName;
                    } else {
                        attrName = this.$attr[key];
                        if (!attrName) {
                            this.$attr[key] = attrName = snake_case(key, '-');
                        }
                    }

                    nodeName = nodeName_(this.$$element);

                    // sanitize a[href] and img[src] values
                    if ((nodeName === 'a' && key === 'href') || (nodeName === 'img' && key === 'src')) {
                        this[key] = value = $$sanitizeUri(value, key === 'src');
                    }

                    if (writeAttr !== false) {
                        if (value === null || value === undefined) {
                            this.$$element.removeAttr(attrName);
                        } else {
                            this.$$element.attr(attrName, value);
                        }
                    }

                    // fire observers
                    $$observers = this.$$observers;

                    if ($$observers) {
                        forEach(
                            $$observers[observer],
                            function (fn) {
                                try {
                                    fn(value);
                                } catch (e) {
                                    $exceptionHandler(e);
                                }
                            }
                        );
                    }
                },

                $observe: function (key, fn) {
                    var attrs = this,
                        $$observers,
                        listeners;

                    if (attrs.$$observers) {
                        $$observers = attrs.$$observers;
                    } else {
                        attrs.$$observers = {};
                        $$observers = attrs.$$observers;
                    }
                    if ($$observers[key]) {
                        listeners = $$observers[key];
                    } else {
                        $$observers[key] = [];
                        listeners = $$observers[key];
                    }

                    listeners.push(fn);

                    $rootScope.$evalAsync(function () {
                        if (!listeners.$$inter) {
                            // no one registered attribute interpolation function, so lets call it manually
                            fn(attrs[key]);
                        }
                    });

                    return function () {
                        arrayRemove(listeners, fn);
                    };
                }
            };

            function wrapTemplate(type, template) {
                type = lowercase(type || 'html');
                switch (type) {
                case 'svg':
                case 'math':
                    var wrapper = document.createElement('div');
                    wrapper.innerHTML = '<' + type + '>' + template + '</' + type + '>';
                    return wrapper.childNodes[0].childNodes;
                default:
                    return template;
                }
            }

            function detectNamespaceForChildElements(parentElement) {

                var node = parentElement && parentElement[0];

                if (!node) { return 'html'; }
                
                return nodeName_(node) !== 'foreignobject' && node.toString().match(/SVG/) ? 'svg' : 'html';
            }

            function safeAddClass($element, className) {
                try {
                    $element.addClass(className);
                } catch(e) {
                    // ignore, since it means that we are trying to set class on
                    // SVG element, where class name is read-only
                    msos.console.warn(temp_cp + ' - $get - safeAddClass -> ??? SVG element: ' + className, e);
                }
            }

            function createBoundTranscludeFn(scope, transcludeFn, previousBoundTranscludeFn, elementTransclusion) {

                var boundTranscludeFn = function (transcludedScope, cloneFn, controllers, futureParentElement) {
                        var scopeCreated = false,
                            clone;

                        if (!transcludedScope) {
                            transcludedScope = scope.$new();
                            transcludedScope.$$transcluded = true;
                            scopeCreated = true;
                        }

                        clone = transcludeFn(transcludedScope, cloneFn, controllers, previousBoundTranscludeFn, futureParentElement);

                        if (scopeCreated && !elementTransclusion) {
                            clone.on('$destroy', function () {
                                transcludedScope.$destroy();
                            });
                        }
                        return clone;
                    };

                return boundTranscludeFn;
            }

            /**
             * looks up the directive and decorates it with exception handling and proper parameters. We
             * call this the boundDirective.
             *
             * @param {string} name name of the directive to look up.
             * @param {string} location The directive must be found in specific format.
             *   String containing any of theses characters:
             *
             *   * `E`: element name
             *   * `A': attribute
             *   * `C`: class
             *   * `M`: comment
             * @returns {boolean} true if directive was added.
             */
            function addDirective(tDirectives, name, location, maxPriority, ignoreDirective, startAttrName, endAttrName) {

                if (msos.config.verbose === 'compile') {
                    msos.console.debug(temp_cp + ' - $get - addDirective -> name: ' + name + ', location: ' + location);
                }

                if (name === ignoreDirective) { return null; }

                var match = null,
                    directive,
                    directives,
                    i = 0;

                if (hasDirectives.hasOwnProperty(name)) {

                    directives = $injector.get(name + Suffix);

                    for (i = 0; i < directives.length; i += 1) {
                        try {
                            directive = directives[i];
                            if ((maxPriority === undefined || maxPriority > directive.priority) && directive.restrict.indexOf(location) !== -1) {
                                if (startAttrName) {
                                    directive = inherit(directive, {
                                        $$start: startAttrName,
                                        $$end: endAttrName
                                    });
                                }
                                tDirectives.push(directive);
                                match = directive;
                            }
                        } catch (e) {
                            $exceptionHandler(e);
                        }
                    }
                }
                return match;
            }

            function directiveIsMultiElement(name) {
                var directive,
                    directives,
                    i = 0;

                if (hasDirectives.hasOwnProperty(name)) {

                    directives = $injector.get(name + Suffix);

                    for (i = 0; i < directives.length; i += 1) {
                        directive = directives[i];
                        if (directive.multiElement) {
                            return true;
                        }
                    }
                }
                return false;
            }

            function getTrustedContext(node, attrNormalizedName) {

                if (attrNormalizedName === "srcdoc") {
                    return $sce.HTML;
                }

                var tag = nodeName_(node);
                // maction[xlink:href] can source SVG.  It's not limited to <maction>.
                if (attrNormalizedName === "xlinkHref"
                 || (tag === "form" && attrNormalizedName === "action")
                 || (tag !== "img" && (attrNormalizedName === "src" || attrNormalizedName === "ngSrc"))) {
                    return $sce.RESOURCE_URL;
                }

                return undefined;
            }

            function addAttrInterpolateDirective(node, directives, value, name, allOrNothing) {

                if (msos.config.verbose === 'compile') {
                    msos.console.debug(temp_cp + ' - addAttrInterpolateDirective -> start.');
                }

                var interpolateFn = $interpolate(value, true);

                // no interpolation found -> ignore
                if (!interpolateFn) { return; }

                if (name === "multiple" && nodeName_(node) === "select") {
                    throw $compileMinErr("selmulti", "Binding to the 'multiple' attribute is not supported. Element: {0}", startingTag(node));
                }

                directives.push({
                    priority: 100,
                    compile: function () {
                        return {
                            pre: function attrInterpolatePreLinkFn(scope, element, attr) {
                                var $$observers,
                                    watch_scope;

                                if (!attr.$$observers) { attr.$$observers = {}; }

                                $$observers = attr.$$observers;

                                if (EVENT_HANDLER_ATTR_REGEXP.test(name)) {
                                    throw $compileMinErr('nodomevents', "Interpolations for HTML DOM event attributes are disallowed.  Please use the " + "ng- versions (such as ng-click instead of onclick) instead.");
                                }

                                interpolateFn = $interpolate(attr[name], true, getTrustedContext(node, name), ALL_OR_NOTHING_ATTRS[name] || allOrNothing);

                                if (!interpolateFn) { return; }

                                attr[name] = interpolateFn(scope);

                                if (!$$observers[name]) { $$observers[name] = []; }

                                $$observers[name].$$inter = true;

                                if (attr.$$observers
                                 && attr.$$observers[name]
                                 && attr.$$observers[name].$$scope) {
                                    watch_scope = attr.$$observers[name].$$scope;
                                } else {
                                    watch_scope = scope;
                                }

                                watch_scope.$watch(
                                    interpolateFn,
                                    function interpolateFnWatchAction(newValue, oldValue) {
                                        if (name === 'class' && newValue != oldValue) {
                                            attr.$updateClass(newValue, oldValue);
                                        } else {
                                            attr.$set(name, newValue);
                                        }
                                    }
                                );
                            }
                        };
                    }
                });

                if (msos.config.verbose === 'compile') {
                    msos.console.debug(temp_cp + ' - addAttrInterpolateDirective -> done!');
                }
            }

            function addTextInterpolateDirective(directives, text) {
                if (msos.config.verbose === 'compile') {
                    msos.console.debug(temp_cp + ' - addTextInterpolateDirective -> start.');
                }

                var interpolateFn = $interpolate(text, true);

                if (interpolateFn) {
                    directives.push({
                        priority: 0,
                        compile: function textInterpolateCompileFn(templateNode) {
                            var templateNodeParent = templateNode.parent(),
                                hasCompileParent = !!templateNodeParent.length;

                            // When transcluding a template that has bindings in the root
                            // we don't have a parent and thus need to add the class during linking fn.
                            if (hasCompileParent) {
                                compile.$$addBindingClass(templateNodeParent);
                            }

                            return function textInterpolateLinkFn(scope, node) {
                                var parent = node.parent();

                                if (!hasCompileParent) { compile.$$addBindingClass(parent); }

                                compile.$$addBindingInfo(parent, interpolateFn.expressions);
                                scope.$watch(
                                    interpolateFn,
                                    function interpolateFnWatchAction(value) {
                                        node[0].nodeValue = value;
                                    }
                                );
                            };
                        }
                    });
                }

                if (msos.config.verbose === 'compile') {
                    msos.console.debug(temp_cp + ' - addTextInterpolateDirective -> done!');
                }
            }

            function byPriority(a, b) {
                var diff = b.priority - a.priority;
                if (diff !== 0) { return diff; }
                if (a.name !== b.name) { return (a.name < b.name) ? -1 : 1; }
                return a.index - b.index;
            }

            function collectDirectives(node, directives, attrs, maxPriority, ignoreDirective) {
                var nodeType = node.nodeType,
                    attr,
                    name,
                    nName,
                    ngAttrName,
                    value,
                    isNgAttr,
                    nAttrs = node.attributes,
                    j = 0,
                    jj = 0,
                    attrStartName = false,
                    attrEndName = false,
                    directiveNName = '',
                    attrsMap = attrs.$attr,
                    match,
                    className;

                if (nAttrs && nAttrs.length) { jj = nAttrs.length; }

                if (nodeType === 1 && msos.config.verbose) {
                    msos.console.debug(temp_cp + ' - $get - collectDirectives -> start, for: ' + nodeName_(node).toLowerCase());
                }

                switch (nodeType) {
                case 1:
                    /* Element */
                    // use the node name: <directive>
                    addDirective(directives, directiveNormalize(nodeName_(node)), 'E', maxPriority, ignoreDirective);

                    // iterate over the attributes
                    for (j = 0; j < jj; j += 1) {
                        // reset each iteration
                        attrStartName = false;
                        attrEndName = false;

                        attr = nAttrs[j];

                        name = attr.name;
                        value = trim(attr.value);

                        // support ngAttr attribute binding
                        ngAttrName = directiveNormalize(name);
                        isNgAttr = NG_ATTR_BINDING.test(ngAttrName);

                        if (isNgAttr) {
                            name = snake_case(ngAttrName.substr(6), '-');
                        }

                        directiveNName = ngAttrName.replace(/(Start|End)$/, '');

                        if (directiveIsMultiElement(directiveNName)) {
                            if (ngAttrName === directiveNName + 'Start') {
                                attrStartName = name;
                                attrEndName = name.substr(0, name.length - 5) + 'end';
                                name = name.substr(0, name.length - 6);
                            }
                        }

                        nName = directiveNormalize(name.toLowerCase());
                        attrsMap[nName] = name;
                        if (isNgAttr || !attrs.hasOwnProperty(nName)) {
                            attrs[nName] = value;
                            if (getBooleanAttrName(node, nName)) {
                                attrs[nName] = true; // presence means true
                            }
                        }
                        addAttrInterpolateDirective(node, directives, value, nName, isNgAttr);
                        addDirective(directives, nName, 'A', maxPriority, ignoreDirective, attrStartName, attrEndName);
                    }

                    // use class as directive
                    className = node.className;
                    if (_.isString(className) && className !== '') {
                        // initial value
                        match = CLASS_DIRECTIVE_REGEXP.exec(className);
                        while (match) {
                            nName = directiveNormalize(match[2]);
                            if (addDirective(directives, nName, 'C', maxPriority, ignoreDirective)) {
                                attrs[nName] = trim(match[3]);
                            }
                            className = className.substr(match.index + match[0].length);

                            // for next interation
                            match = CLASS_DIRECTIVE_REGEXP.exec(className);
                        }
                    }
                    break;
                case 3:
                    /* Text Node */
                    addTextInterpolateDirective(directives, node.nodeValue);
                    break;
                case 8:
                    /* Comment */
                    try {
                        match = COMMENT_DIRECTIVE_REGEXP.exec(node.nodeValue);
                        if (match) {
                            nName = directiveNormalize(match[1]);
                            if (addDirective(directives, nName, 'M', maxPriority, ignoreDirective)) {
                                attrs[nName] = trim(match[2]);
                            }
                        }
                    } catch (ignore) {

                    }
                    break;
                }

                directives.sort(byPriority);

                if (nodeType === 1 && msos.config.verbose) {
                    msos.console.debug(temp_cp + ' - $get - collectDirectives ->  done, directives:', directives);
                }

                return directives;
            }

            function cloneAndAnnotateFn(fn, annotation) {
                return extend(function () {
                    return fn.apply(null, arguments);
                }, fn, annotation);
            }

            function groupScan(node, attrStart, attrEnd) {
                var nodes = [],
                    depth = 0;

                if (attrStart && node.hasAttribute && node.hasAttribute(attrStart)) {

                    do {
                        if (!node) {
                            throw $compileMinErr('uterdir', "Unterminated attribute, found '{0}' but no matching '{1}' found.", attrStart, attrEnd);
                        }
                        if (node.nodeType === 1) {
                            if (node.hasAttribute(attrStart))   { depth += 1; }
                            if (node.hasAttribute(attrEnd))     { depth -= 1; }
                        }
                        nodes.push(node);
                        node = node.nextSibling;
                    } while (depth > 0);
                } else {
                    nodes.push(node);
                }

                return jqLite(nodes);
            }

            function groupElementsLinkFnWrapper(linkFn, attrStart, attrEnd) {
                return function (scope, element, attrs, controllers, transcludeFn) {
                    element = groupScan(element[0], attrStart, attrEnd);
                    return linkFn(scope, element, attrs, controllers, transcludeFn);
                };
            }

            function mergeTemplateAttributes(dst, src) {
                var srcAttr = src.$attr,
                    dstAttr = dst.$attr,
                    $element = dst.$$element;

                // reapply the old attributes to the new element
                forEach(dst, function (value, key) {
                    if (key.charAt(0) !== '$') {
                        if (src[key] && src[key] !== value) {
                            value += (key === 'style' ? ';' : ' ') + src[key];
                        }
                        dst.$set(key, value, true, srcAttr[key]);
                    }
                });

                // copy the new attributes on the old attrs object
                forEach(src, function (value, key) {
                    if (key === 'class') {
                        safeAddClass($element, value);
                        // just bad cricket using reserve words
                        dst['class'] = (dst['class'] ? dst['class'] + ' ' : '') + value;
                    } else if (key === 'style') {
                        $element.attr('style', $element.attr('style') + ';' + value);
                        dst.style = (dst.style ? dst.style + ';' : '') + value;
                        // `dst` will never contain hasOwnProperty as DOM parser won't let it.
                        // You will get an "InvalidCharacterError: DOM Exception 5" error if you
                        // have an attribute like "has-own-property" or "data-has-own-property", etc.
                    } else if (key.charAt(0) !== '$' && !dst.hasOwnProperty(key)) {
                        dst[key] = value;
                        dstAttr[key] = srcAttr[key];
                    }
                });
            }

            function markDirectivesAsIsolate(directives) {
                var j = 0;
                // mark all directives as needing isolate scope.
                for (j = 0; j < directives.length; j += 1) {
                    directives[j] = inherit(directives[j], { $$isolateScope: true });
                }
            }

            function assertNoDuplicate(what, previousDirective, directive, element) {
                if (previousDirective) {
                    throw $compileMinErr('multidir', 'Multiple directives [{0}, {1}] asking for {2} on: {3}', previousDirective.name, directive.name, what, startingTag(element));
                }
            }

            function invokeLinkFn(linkFn, scope, $element, attrs, controllers, transcludeFn) {
                try {
                    linkFn(scope, $element, attrs, controllers, transcludeFn);
                } catch (e) {
                    $exceptionHandler(e, startingTag($element));
                }
            }

            function replaceWith($rootElement, elementsToRemove, newNode) {
                var firstElementToRemove = elementsToRemove[0],
                    removeCount = elementsToRemove.length,
                    parent = firstElementToRemove.parentNode,
                    i = 0,
                    ii = 0,
                    j = 0,
                    jj = 0,
                    j2 = 0,
                    fragment,
                    k = 0,
                    kk = elementsToRemove.length,
                    element;

                if ($rootElement) {
                    for (i = 0, ii = $rootElement.length; i < ii; i += 1) {
                        if ($rootElement[i] === firstElementToRemove) {
                            $rootElement[i] = newNode;
                            i += 1;
                            for (j = i, j2 = j + removeCount - 1, jj = $rootElement.length; j < jj; j += 1, j2 += 1) {
                                if (j2 < jj) {
                                    $rootElement[j] = $rootElement[j2];
                                } else {
                                    delete $rootElement[j];
                                }
                            }
                            $rootElement.length -= removeCount - 1;

                            // If the replaced element is also the jQuery .context then replace it
                            // .context is a deprecated jQuery api, so we should set it only when jQuery set it
                            // http://api.jquery.com/context/
                            if ($rootElement.context === firstElementToRemove) {
                                $rootElement.context = newNode;
                            }
                            break;
                        }
                    }
                }

                if (parent) {
                    parent.replaceChild(newNode, firstElementToRemove);
                }

                fragment = document.createDocumentFragment();
                fragment.appendChild(firstElementToRemove);

                jqLite(newNode).data(jqLite(firstElementToRemove).data());

                skipDestroyOnNextJQueryCleanData = true;
                jQuery.cleanData([firstElementToRemove]);

                for (k = 1; k < kk; k += 1) {
                    element = elementsToRemove[k];
                    jqLite(element).remove();
                    fragment.appendChild(element);
                    delete elementsToRemove[k];
                }

                elementsToRemove[0] = newNode;
                elementsToRemove.length = 1;
            }

            function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCompileContext) {
                var linkFns = [],
                    attrs,
                    directives,
                    nodeLinkFn_cN,
                    childNodes,
                    childLinkFn_cN,
                    linkFnFound,
                    nodeLinkFnFound,
                    l = 0;

                for (l = 0; l < nodeList.length; l += 1) {
                    attrs = new Attributes();

                    // we must always refer to nodeList[l] since the nodes can be replaced underneath us.
                    directives = collectDirectives(nodeList[l], [], attrs, l === 0 ? maxPriority : undefined, ignoreDirective);

                    nodeLinkFn_cN = (directives.length) ? applyDirectivesToNode(directives, nodeList[l], attrs, transcludeFn, $rootElement, null, [], [], previousCompileContext) : null;

                    if (nodeLinkFn_cN && nodeLinkFn_cN.scope) {
                        compile.$$addScopeClass(attrs.$$element);
                    }

                    childNodes = nodeList[l].childNodes;

                    childLinkFn_cN = ((nodeLinkFn_cN && nodeLinkFn_cN.terminal) || !childNodes || !childNodes.length)
                        ? null
                        : compileNodes(
                            childNodes,
                            nodeLinkFn_cN
                            ? ((nodeLinkFn_cN.transcludeOnThisElement || !nodeLinkFn_cN.templateOnThisElement) && nodeLinkFn_cN.transclude)
                            : transcludeFn
                        );

                    if (nodeLinkFn_cN || childLinkFn_cN) {
                        linkFns.push(l, nodeLinkFn_cN, childLinkFn_cN);
                        linkFnFound = true;
                        nodeLinkFnFound = nodeLinkFnFound || nodeLinkFn_cN;
                    }

                    //use the previous context only for the first element in the virtual group
                    previousCompileContext = null;
                }

                function compositeLinkFn(scope, nodeList, $rootElement, parentBoundTranscludeFn) {
                    var nodeLinkFn_cLF,
                        childLinkFn_cLF,
                        node,
                        childScope,
                        i,
                        idx,
                        childBoundTranscludeFn,
                        stableNodeList,
                        nodeListLength;

                    if (nodeLinkFnFound) {
                        // copy nodeList so that if a nodeLinkFn removes or adds an element at this DOM level our
                        // offsets don't get screwed up
                        nodeListLength = nodeList.length;
                        stableNodeList = new Array(nodeListLength);

                        // create a sparse array by only copying the elements which have a linkFn
                        for (i = 0; i < linkFns.length; i += 3) {
                            idx = linkFns[i];
                            stableNodeList[idx] = nodeList[idx];
                        }
                    } else {
                        stableNodeList = nodeList;
                    }

                    for (i = 0; i < linkFns.length; i += 1) {
                        node = stableNodeList[linkFns[i]];
                        i += 1;
                        nodeLinkFn_cLF = linkFns[i];
                        i += 1;
                        childLinkFn_cLF = linkFns[i];

                        if (nodeLinkFn_cLF) {
                            if (nodeLinkFn_cLF.scope) {
                                childScope = scope.$new();
                                compile.$$addScopeInfo(jqLite(node), childScope);
                            } else {
                                childScope = scope;
                            }

                            if (nodeLinkFn_cLF.transcludeOnThisElement) {
                                childBoundTranscludeFn = createBoundTranscludeFn(
                                    scope,
                                    nodeLinkFn_cLF.transclude,
                                    parentBoundTranscludeFn,
                                    nodeLinkFn_cLF.elementTranscludeOnThisElement
                                );

                            } else if (!nodeLinkFn_cLF.templateOnThisElement && parentBoundTranscludeFn) {
                                childBoundTranscludeFn = parentBoundTranscludeFn;

                            } else if (!parentBoundTranscludeFn && transcludeFn) {
                                childBoundTranscludeFn = createBoundTranscludeFn(scope, transcludeFn);

                            } else {
                                childBoundTranscludeFn = null;
                            }

                            nodeLinkFn_cLF(
                                childLinkFn_cLF,
                                childScope,
                                node,
                                $rootElement,
                                childBoundTranscludeFn
                            );

                        } else if (childLinkFn_cLF) {
                            childLinkFn_cLF(
                                scope,
                                node.childNodes,
                                undefined,
                                parentBoundTranscludeFn
                            );
                        }
                    }
                }

                // return a linking function if we have found anything, null otherwise
                return linkFnFound ? compositeLinkFn : null;
            }

            function compileTemplateUrl(directives, $compileNode, tAttrs, $rootElement, childTranscludeFn, preLinkFns, postLinkFns, previousCompileContext) {
                var linkQueue = [],
                    afterTemplateNodeLinkFn,
                    afterTemplateChildLinkFn,
                    beforeTemplateCompileNode = $compileNode[0],
                    origAsyncDirective = directives.shift(),
                    // The fact that we have to copy and patch the directive seems wrong!
                    derivedSyncDirective = extend({}, origAsyncDirective, {
                        templateUrl: null,
                        transclude: null,
                        replace: null,
                        $$originalDirective: origAsyncDirective
                    }),
                    templateUrl = (_.isFunction(origAsyncDirective.templateUrl)) ? origAsyncDirective.templateUrl($compileNode, tAttrs) : origAsyncDirective.templateUrl,
                    templateNamespace = origAsyncDirective.templateNamespace;

                $compileNode.empty();

                $templateRequest(
                    $sce.getTrustedResourceUrl(templateUrl)
                ).then(
                    function(content) {
                        var compileNode_suc,
                            tempTemplateAttrs,
                            $template_suc,
                            childBoundTranscludeFn,
                            templateDirectives_suc,
                            scope,
                            beforeTemplateLinkNode,
                            linkRootElement,
                            boundTranscludeFn,
                            linkNode,
                            oldClasses;

                        content = denormalizeTemplate(content);

                        if (origAsyncDirective.replace) {
                            if (jqLiteIsTextNode(content)) {
                                $template_suc = [];
                            } else {
                                $template_suc = jqLite(wrapTemplate(templateNamespace, trim(content)));
                            }
                            compileNode_suc = $template_suc[0];

                            if ($template_suc.length !== 1 || compileNode_suc.nodeType !== 1) {
                                throw $compileMinErr('tplrt', "Template for directive '{0}' must have exactly one root element. {1}", origAsyncDirective.name, templateUrl);
                            }

                            tempTemplateAttrs = {
                                $attr: {}
                            };
                            replaceWith($rootElement, $compileNode, compileNode_suc);
                            templateDirectives_suc = collectDirectives(compileNode_suc, [], tempTemplateAttrs);

                            if (_.isObject(origAsyncDirective.scope)) {
                                markDirectivesAsIsolate(templateDirectives_suc);
                            }
                            directives = templateDirectives_suc.concat(directives);
                            mergeTemplateAttributes(tAttrs, tempTemplateAttrs);
                        } else {
                            compileNode_suc = beforeTemplateCompileNode;
                            $compileNode.html(content);
                        }

                        directives.unshift(derivedSyncDirective);

                        afterTemplateNodeLinkFn = applyDirectivesToNode(directives, compileNode_suc, tAttrs, childTranscludeFn, $compileNode, origAsyncDirective, preLinkFns, postLinkFns, previousCompileContext);

                        forEach($rootElement, function (node, i) {
                            if (node === compileNode_suc) {
                                $rootElement[i] = $compileNode[0];
                            }
                        });

                        afterTemplateChildLinkFn = compileNodes($compileNode[0].childNodes, childTranscludeFn);

                        while (linkQueue.length) {
                            scope = linkQueue.shift();
                            beforeTemplateLinkNode = linkQueue.shift();
                            linkRootElement = linkQueue.shift();
                            boundTranscludeFn = linkQueue.shift();
                            linkNode = $compileNode[0];

                            if (beforeTemplateLinkNode !== beforeTemplateCompileNode) {
                                oldClasses = beforeTemplateLinkNode.className;

                                if (!(previousCompileContext.hasElementTranscludeDirective && origAsyncDirective.replace)) {
                                    // it was cloned therefore we have to clone as well.
                                    linkNode = jqLiteClone(compileNode_suc);
                                }

                                replaceWith(linkRootElement, jqLite(beforeTemplateLinkNode), linkNode);

                                // Copy in CSS classes from original node
                                safeAddClass(jqLite(linkNode), oldClasses);
                            }
                            if (afterTemplateNodeLinkFn.transcludeOnThisElement) {
                                childBoundTranscludeFn = createBoundTranscludeFn(scope, afterTemplateNodeLinkFn.transclude, boundTranscludeFn);
                            } else {
                                childBoundTranscludeFn = boundTranscludeFn;
                            }
                            afterTemplateNodeLinkFn(afterTemplateChildLinkFn, scope, linkNode, $rootElement, childBoundTranscludeFn);
                        }
                        linkQueue = null;
                    }
                );

                return function delayedNodeLinkFn(ignoreChildLinkFn, scope, node, rootElement, boundTranscludeFn) {
                    var childBoundTranscludeFn = boundTranscludeFn;
                    if (linkQueue) {
                        linkQueue.push(scope);
                        linkQueue.push(node);
                        linkQueue.push(rootElement);
                        linkQueue.push(childBoundTranscludeFn);
                    } else {
                        if (afterTemplateNodeLinkFn.transcludeOnThisElement) {
                            childBoundTranscludeFn = createBoundTranscludeFn(scope, afterTemplateNodeLinkFn.transclude, boundTranscludeFn);
                        }
                        afterTemplateNodeLinkFn(afterTemplateChildLinkFn, scope, node, rootElement, childBoundTranscludeFn);
                    }
                };
            }

            // Using var applyDirectivesToNode is way faster since order of declaration is correct
            applyDirectivesToNode = function (directives, compileNode, templateAttrs, transcludeFn, jqCollection, originalReplaceDirective, preLinkFns, postLinkFns, previousCompileContext) {

                if (msos.config.verbose === 'compile') {
                    msos.console.debug(temp_cp + ' - $get - applyDirectivesToNode -> start, node: ' + lowercase(compileNode.nodeName));
                }

                previousCompileContext = previousCompileContext || {};

                templateAttrs.$$element = jqLite(compileNode);

                var i = 0,
                    ii = 0,
                    terminalPriority = -Number.MAX_VALUE,
                    newScopeDirective,
                    controllerDirectives = previousCompileContext.controllerDirectives,
                    controllers,
                    newIsolateScopeDirective = previousCompileContext.newIsolateScopeDirective,
                    templateDirective = previousCompileContext.templateDirective,
                    nonTlbTranscludeDirective = previousCompileContext.nonTlbTranscludeDirective,
                    hasTranscludeDirective = false,
                    hasTemplate = false,
                    hasElementTranscludeDirective = previousCompileContext.hasElementTranscludeDirective,
                    $compileNode = templateAttrs.$$element,
                    directive,
                    directiveName,
                    $template,
                    replaceDirective = originalReplaceDirective,
                    childTranscludeFn = transcludeFn,
                    linkFn,
                    directiveValue,
                    attrStart,
                    attrEnd,
                    newTemplateAttrs,
                    templateDirectives,
                    unprocessedDirectives;

                // executes all directives on the current element
                ii = directives.length;

                function getControllers(directiveName, require, $element, elementControllers) {
                    var value,
                        retrievalMethod = 'data',
                        optional = false;

                    if (_.isString(require)) {
                        // init
                        value = require.charAt(0);
                        while (value === '^' || value === '?') {
                            require = require.substr(1);
                            if (value === '^') {
                                retrievalMethod = 'inheritedData';
                            }
                            optional = optional || value === '?';
                            // next iteration
                            value = require.charAt(0);
                        }
                        value = null;

                        if (elementControllers && retrievalMethod === 'data') {
                            value = elementControllers[require];
                            if (value) {
                                value = value.instance;
                            }
                        }

                        value = value || $element[retrievalMethod]('$' + require + 'Controller');

                        if (!value && !optional) {
                            throw $compileMinErr('ctreq', "Controller '{0}', required by directive '{1}', can't be found!", require, directiveName);
                        }

                        return value;
                    }

                    if (_.isArray(require)) {
                        value = [];
                        forEach(require, function (require) {
                            value.push(getControllers(directiveName, require, $element, elementControllers));
                        });
                    }

                    return value;
                }

                function nodeLinkFn(childLinkFn, scope, linkNode, $rootElement, boundTranscludeFn) {
                    var k,
                        kk,
                        linkFn_nLF,
                        controller,
                        isolateScope,
                        elementControllers,
                        transcludeFn_nLF,
                        $element,
                        attrs,
                        scopeToChild,
                        LOCAL_REGEXP = /^\s*([@=&])(\??)\s*(\w*)\s*$/,
                        isolateScopeController,
                        isolateBindingContext;

                    if (compileNode === linkNode) {
                        attrs = templateAttrs;
                        $element = templateAttrs.$$element;
                    } else {
                        $element = jqLite(linkNode);
                        attrs = new Attributes($element, templateAttrs);
                    }

                    if (newIsolateScopeDirective) {
                        isolateScope = scope.$new(true);
                    }

                    // This is the function that is injected as `$transclude`.
                    // Note: all arguments are optional!
                    function controllersBoundTransclude(scope, cloneAttachFn, futureParentElement) {
                        var transcludeControllers;

                        // No scope passed in:
                        if (!isScope(scope)) {
                            futureParentElement = cloneAttachFn;
                            cloneAttachFn = scope;
                            scope = undefined;
                        }

                        if (hasElementTranscludeDirective) {
                            transcludeControllers = elementControllers;
                        }

                        if (!futureParentElement) {
                            futureParentElement = hasElementTranscludeDirective ? $element.parent() : $element;
                        }

                        return boundTranscludeFn(scope, cloneAttachFn, transcludeControllers, futureParentElement);
                    }

                    transcludeFn_nLF = boundTranscludeFn && controllersBoundTransclude;

                    if (controllerDirectives) {
                        // TODO: merge `controllers` and `elementControllers` into single object.
                        controllers = {};
                        elementControllers = {};

                        forEach(
                            controllerDirectives,
                            function (directive) {
                                var locals = {
                                        $scope: directive === newIsolateScopeDirective || directive.$$isolateScope ? isolateScope : scope,
                                        $element: $element,
                                        $attrs: attrs,
                                        $transclude: transcludeFn_nLF
                                    },
                                    controllerInstance;

                                controller = directive.controller;

                                if (controller === '@') {
                                    controller = attrs[directive.name];
                                }

                                controllerInstance = $controller(
                                    controller,
                                    locals,
                                    true,
                                    directive.controllerAs
                                );

                                elementControllers[directive.name] = controllerInstance;

                                if (!hasElementTranscludeDirective) {
                                    $element.data('$' + directive.name + 'Controller', controllerInstance.instance);
                                }

                                controllers[directive.name] = controllerInstance;
                            }
                        );
                    }

                    if (newIsolateScopeDirective) {

                        compile.$$addScopeInfo(
                            $element,
                            isolateScope,
                            true,
                            !(templateDirective && (templateDirective === newIsolateScopeDirective || templateDirective === newIsolateScopeDirective.$$originalDirective))
                        );

                        compile.$$addScopeClass($element, true);

                        isolateScopeController = controllers && controllers[newIsolateScopeDirective.name];
                        isolateBindingContext = isolateScope;

                        if (isolateScopeController
                         && isolateScopeController.identifier
                         && newIsolateScopeDirective.bindToController === true) {
                            isolateBindingContext = isolateScopeController.instance;
                        }

                        forEach(
                            newIsolateScopeDirective.scope,
                            function (definition, scopeName) {
                                var match = definition.match(LOCAL_REGEXP) || [],
                                    attrName = match[3] || scopeName,
                                    optional = (match[2] === '?'),
                                    mode = match[1], // @, =, or &
                                    lastValue,
                                    unwatch,
                                    parentGet,
                                    parentSet,
                                    compare;

                                isolateScope.$$isolateBindings[scopeName] = mode + attrName;

                                switch (mode) {

                                    case '@':
                                        attrs.$observe(
                                            attrName,
                                            function (value) {
                                                isolateScope[scopeName] = value;
                                            }
                                        );

                                        attrs.$$observers[attrName].$$scope = scope;

                                        if (attrs[attrName]) {
                                            // If the attribute has been provided then we trigger an interpolation to ensure
                                            // the value is there for use in the link fn
                                            isolateBindingContext[scopeName] = $interpolate(attrs[attrName])(scope);
                                        }
                                    break;

                                    case '=':
                                        if (optional && !attrs[attrName]) {
                                            return;
                                        }

                                        parentGet = $parse(attrs[attrName]);

                                        if (parentGet.literal) {
                                            compare = equals;
                                        } else {
                                            compare = function (a, b) {
                                                return a === b || (a !== a && b !== b);
                                            };
                                        }

                                        parentSet = parentGet.assign || function () {
                                            // reset the change, or we will throw this exception on every $digest
                                            lastValue = isolateBindingContext[scopeName] = parentGet(scope);
                                            throw $compileMinErr(
                                                'nonassign',
                                                "Expression '{0}' used with directive '{1}' is non-assignable!",
                                                attrs[attrName],
                                                newIsolateScopeDirective.name
                                            );
                                        };

                                        lastValue = isolateBindingContext[scopeName] = parentGet(scope);

                                        unwatch = scope.$watch(
                                                $parse(attrs[attrName],
                                                function parentValueWatch(parentValue) {
                                                    if (!compare(parentValue, isolateBindingContext[scopeName])) {
                                                        // we are out of sync and need to copy
                                                        if (!compare(parentValue, lastValue)) {
                                                            // parent changed and it has precedence
                                                            isolateBindingContext[scopeName] = parentValue;
                                                        } else {
                                                            // if the parent can be assigned then do so
                                                            parentValue = isolateBindingContext[scopeName];
                                                            parentSet(scope, parentValue);
                                                        }
                                                    }
                                                    lastValue = parentValue;
                                                    return parentValue;
                                                }
                                            ),
                                            null,
                                            parentGet.literal
                                        );

                                        isolateScope.$on('$destroy', unwatch);
                                    break;

                                    case '&':
                                        parentGet = $parse(attrs[attrName]);
                                        isolateBindingContext[scopeName] = function (locals) {
                                            return parentGet(scope, locals);
                                        };
                                    break;

                                    default:
                                        throw $compileMinErr(
                                            'iscp',
                                            "Invalid isolate scope definition for directive '{0}'." +
                                            " Definition: {... {1}: '{2}' ...}",
                                            newIsolateScopeDirective.name, scopeName, definition
                                        );
                                }
                            }
                        );
                    }

                    if (controllers) {
                        forEach(
                            controllers,
                            function (controller) { controller(); }
                        );

                        controllers = null;
                    }

                    // PRELINKING
                    for (k = 0, kk = preLinkFns.length; k < kk; k += 1) {
                        linkFn_nLF = preLinkFns[k];

                        invokeLinkFn(
                            linkFn_nLF,
                            linkFn_nLF.isolateScope ? isolateScope : scope,
                            $element,
                            attrs,
                            linkFn_nLF.require && getControllers(linkFn_nLF.directiveName, linkFn_nLF.require, $element, elementControllers),
                            transcludeFn_nLF
                        );
                    }

                    // RECURSION
                    // We only pass the isolate scope, if the isolate directive has a template,
                    // otherwise the child elements do not belong to the isolate directive.
                    scopeToChild = scope;

                    if (newIsolateScopeDirective && (newIsolateScopeDirective.template || newIsolateScopeDirective.templateUrl === null)) {
                        scopeToChild = isolateScope;
                    }

                    if (childLinkFn) {
                        childLinkFn(scopeToChild, linkNode.childNodes, undefined, boundTranscludeFn);
                    }

                    // POSTLINKING
                    for (k = postLinkFns.length - 1; k >= 0; k -= 1) {
                        linkFn_nLF = postLinkFns[k];

                        invokeLinkFn(
                            linkFn_nLF,
                            linkFn_nLF.isolateScope ? isolateScope : scope,
                            $element,
                            attrs,
                            linkFn_nLF.require && getControllers(linkFn_nLF.directiveName, linkFn_nLF.require, $element, elementControllers),
                            transcludeFn_nLF
                        );
                    }
                }

                function addLinkFns(pre, post, attrStart, attrEnd) {
                    if (pre) {
                        if (attrStart) { pre = groupElementsLinkFnWrapper(pre, attrStart, attrEnd); }
                        pre.require = directive.require;
                        pre.directiveName = directiveName;
                        if (newIsolateScopeDirective === directive || directive.$$isolateScope) {
                            pre = cloneAndAnnotateFn(pre, {
                                isolateScope: true
                            });
                        }
                        preLinkFns.push(pre);
                    }

                    if (post) {
                        if (attrStart) { post = groupElementsLinkFnWrapper(post, attrStart, attrEnd); }
                        post.require = directive.require;
                        post.directiveName = directiveName;
                        if (newIsolateScopeDirective === directive || directive.$$isolateScope) {
                            post = cloneAndAnnotateFn(post, {
                                isolateScope: true
                            });
                        }
                        postLinkFns.push(post);
                    }
                }

                for (i = 0; i < ii; i += 1) {
                    directive = directives[i];
                    attrStart = directive.$$start;
                    attrEnd = directive.$$end;

                    // collect multiblock sections
                    if (attrStart) {
                        $compileNode = groupScan(compileNode, attrStart, attrEnd);
                    }
                    $template = undefined;

                    if (terminalPriority > directive.priority) {
                        break; // prevent further processing of directives
                    }

                    directiveValue = directive.scope;

                    if (directiveValue) {
                        // skip the check for directives with async templates, we'll check the derived sync
                        // directive when the template arrives
                        if (!directive.templateUrl) {
                            if (_.isObject(directiveValue)) {
                                // This directive is trying to add an isolated scope.
                                // Check that there is no scope of any kind already
                                assertNoDuplicate('new/isolated scope', newIsolateScopeDirective || newScopeDirective, directive, $compileNode);
                                newIsolateScopeDirective = directive;
                            } else {
                                // This directive is trying to add a child scope.
                                // Check that there is no isolated scope already
                                assertNoDuplicate('new/isolated scope', newIsolateScopeDirective, directive, $compileNode);
                            }
                        }

                        newScopeDirective = newScopeDirective || directive;
                    }

                    directiveName = directive.name;

                    if (!directive.templateUrl && directive.controller) {
                        directiveValue = directive.controller;
                        controllerDirectives = controllerDirectives || {};
                        assertNoDuplicate("'" + directiveName + "' controller", controllerDirectives[directiveName], directive, $compileNode);
                        controllerDirectives[directiveName] = directive;
                    }

                    directiveValue = directive.transclude;

                    if (directiveValue) {
                        hasTranscludeDirective = true;

                        // Special case ngIf and ngRepeat so that we don't complain about duplicate transclusion.
                        // This option should only be used by directives that know how to safely handle element transclusion,
                        // where the transcluded nodes are added or replaced after linking.
                        if (!directive.$$tlb) {
                            assertNoDuplicate('transclusion', nonTlbTranscludeDirective, directive, $compileNode);
                            nonTlbTranscludeDirective = directive;
                        }

                        if (directiveValue === 'element') {
                            hasElementTranscludeDirective = true;
                            terminalPriority = directive.priority;
                            $template = $compileNode;
                            $compileNode = templateAttrs.$$element = jqLite(document.createComment(' ' + directiveName + ': ' + templateAttrs[directiveName] + ' '));
                            compileNode = $compileNode[0];
                            replaceWith(jqCollection, sliceArgs($template), compileNode);

                            childTranscludeFn = compile($template, transcludeFn, terminalPriority, replaceDirective && replaceDirective.name, {
                                nonTlbTranscludeDirective: nonTlbTranscludeDirective
                            });
                        } else {
                            $template = jqLite(jqLiteClone(compileNode)).contents();
                            $compileNode.empty(); // clear contents
                            childTranscludeFn = compile($template, transcludeFn);
                        }
                    }

                    if (directive.template) {
                        hasTemplate = true;
                        assertNoDuplicate('template', templateDirective, directive, $compileNode);
                        templateDirective = directive;

                        directiveValue = (_.isFunction(directive.template)) ? directive.template($compileNode, templateAttrs) : directive.template;

                        directiveValue = denormalizeTemplate(directiveValue);

                        if (directive.replace) {
                            replaceDirective = directive;
                            if (jqLiteIsTextNode(directiveValue)) {
                                $template = [];
                            } else {
                                $template = jqLite(wrapTemplate(directive.templateNamespace, trim(directiveValue)));
                            }
                            compileNode = $template[0];

                            if ($template.length !== 1 || compileNode.nodeType !== 1) {
                                throw $compileMinErr('tplrt', "Template for directive '{0}' must have exactly one root element. {1}", directiveName, '');
                            }

                            replaceWith(jqCollection, $compileNode, compileNode);

                            newTemplateAttrs = {
                                $attr: {}
                            };

                            templateDirectives = collectDirectives(compileNode, [], newTemplateAttrs);
                            unprocessedDirectives = directives.splice(i + 1, directives.length - (i + 1));

                            if (newIsolateScopeDirective) {
                                markDirectivesAsIsolate(templateDirectives);
                            }
                            directives = directives.concat(templateDirectives).concat(unprocessedDirectives);
                            mergeTemplateAttributes(templateAttrs, newTemplateAttrs);

                            ii = directives.length;
                        } else {
                            $compileNode.html(directiveValue);
                        }
                    }

                    if (directive.templateUrl) {
                        hasTemplate = true;
                        assertNoDuplicate('template', templateDirective, directive, $compileNode);
                        templateDirective = directive;

                        if (directive.replace) {
                            replaceDirective = directive;
                        }

                        nodeLinkFn = compileTemplateUrl(directives.splice(i, directives.length - i), $compileNode, templateAttrs, jqCollection, hasTranscludeDirective && childTranscludeFn, preLinkFns, postLinkFns, {
                            controllerDirectives: controllerDirectives,
                            newIsolateScopeDirective: newIsolateScopeDirective,
                            templateDirective: templateDirective,
                            nonTlbTranscludeDirective: nonTlbTranscludeDirective
                        });

                        ii = directives.length;

                    } else if (directive.compile) {
                        try {
                            linkFn = directive.compile($compileNode, templateAttrs, childTranscludeFn);
                            if (_.isFunction(linkFn)) {
                                addLinkFns(null, linkFn, attrStart, attrEnd);
                            } else if (linkFn) {
                                addLinkFns(linkFn.pre, linkFn.post, attrStart, attrEnd);
                            }
                        } catch (e) {
                            $exceptionHandler(e, startingTag($compileNode));
                        }
                    }

                    if (directive.terminal) {
                        nodeLinkFn.terminal = true;
                        terminalPriority = Math.max(terminalPriority, directive.priority);
                    }
                }

                nodeLinkFn.scope = newScopeDirective && newScopeDirective.scope === true;
                nodeLinkFn.transcludeOnThisElement = hasTranscludeDirective;
                nodeLinkFn.elementTranscludeOnThisElement = hasElementTranscludeDirective;
                nodeLinkFn.templateOnThisElement = hasTemplate;
                nodeLinkFn.transclude = childTranscludeFn;

                previousCompileContext.hasElementTranscludeDirective = hasElementTranscludeDirective;

                if (msos.config.verbose === 'compile') {
                    msos.console.debug(temp_cp + ' - $get - applyDirectivesToNode -> done!');
                }

                // might be normal or delayed nodeLinkFn depending on if templateUrl is present
                return nodeLinkFn;
            };

            // Using var compile is way faster...
            compile = function ($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext) {
                var namespace = null,
                    compositeLinkFn,
                    namespaceAdaptedCompileNodes,
                    lastCompileNode;
            
                if (!($compileNodes instanceof jqLite)) { $compileNodes = jqLite($compileNodes); }

                forEach(
                    $compileNodes,
                    function (node, index) {
                        if (node.nodeType === 3 && node.nodeValue.match(/\S+/)) {
                            $compileNodes[index] = jqLite(node).wrap('<span></span>').parent()[0];
                        }
                    }
                );

                compositeLinkFn = compileNodes(
                    $compileNodes,
                    transcludeFn,
                    $compileNodes,
                    maxPriority,
                    ignoreDirective,
                    previousCompileContext
                );

                compile.$$addScopeClass($compileNodes);

                namespaceAdaptedCompileNodes = $compileNodes;

                return function publicLinkFn(scope, cloneConnectFn, transcludeControllers, parentBoundTranscludeFn, futureParentElement) {
                    var controllerName,
                        $linkNode;

                    assertArg(scope, 'scope');

                    if (!namespace) {
                        namespace = detectNamespaceForChildElements(futureParentElement);
                    }

                    if (namespace !== 'html' && $compileNodes[0] !== lastCompileNode) {
                        namespaceAdaptedCompileNodes = jqLite(
                            wrapTemplate(namespace, jqLite('<div>').append($compileNodes).html())
                        );
                    }

                    // When using a directive with replace:true and templateUrl the $compileNodes
                    // might change, so we need to recreate the namespace adapted compileNodes.
                    lastCompileNode = $compileNodes[0];

                    // important!!: we must call our jqLite.clone() since the jQuery one is trying to be smart
                    // and sometimes changes the structure of the DOM.
                    $linkNode = cloneConnectFn
                        ? JQLitePrototype.clone.call(namespaceAdaptedCompileNodes)  // IMPORTANT!!!
                        : namespaceAdaptedCompileNodes;

                    if (transcludeControllers) {
                        for (controllerName in transcludeControllers) {
                            $linkNode.data('$' + controllerName + 'Controller', transcludeControllers[controllerName].instance);
                        }
                    }

                    compile.$$addScopeInfo($linkNode, scope);

                    if (cloneConnectFn) { cloneConnectFn($linkNode, scope); }
                    if (compositeLinkFn) { compositeLinkFn(scope, $linkNode, $linkNode, parentBoundTranscludeFn); }

                    return $linkNode;
                };
            };

            compile.$$addBindingInfo = debugInfoEnabled_CP
                ? function $$addBindingInfo($element, binding) {
                    var bindings = $element.data('$binding') || [];

                    if (_.isArray(binding)) {
                        bindings = bindings.concat(binding);
                    } else {
                        bindings.push(binding);
                    }

                    $element.data('$binding', bindings);
                }
                : noop;

            compile.$$addBindingClass = debugInfoEnabled_CP
                ? function $$addBindingClass($element) {
                    safeAddClass($element, 'ng-binding');
                }
                : noop;

            compile.$$addScopeInfo = debugInfoEnabled_CP
                ? function $$addScopeInfo($element, scope, isolated, noTemplate) {
                    var dataName = isolated ? (noTemplate ? '$isolateScopeNoTemplate' : '$isolateScope') : '$scope';
                    $element.data(dataName, scope);
                }
                : noop;

            compile.$$addScopeClass = debugInfoEnabled_CP
                ? function $$addScopeClass($element, isolated) {
                    safeAddClass($element, isolated ? 'ng-isolate-scope' : 'ng-scope');
                }
                : noop;

            return compile;
        }];
    }

    $CompileProvider.$inject = ['$provide', '$$sanitizeUriProvider'];

    function $ControllerProvider() {
        var temp_cp = 'ng - $ControllerProvider',
            controllers = {},
            globals = false,
            CNTRL_REG = /^(\S+)(\s+as\s+(\w+))?$/;

        this.register = function (name, constructor) {
            assertNotHasOwnProperty(name, 'controller');
            if (_.isObject(name)) {
                extend(controllers, name);
            } else {
                controllers[name] = constructor;
            }
        };

        this.allowGlobals = function () {
            globals = true;
        };

        this.$get = ['$injector', '$window', function ($injector, $window) {

            function addIdentifier(locals, identifier, instance, name) {

                if (!(locals && _.isObject(locals.$scope))) {
                    throw minErr('$controller')(
                        'noscp',
                        "Cannot export controller '{0}' as '{1}'! No $scope object provided via `locals`.",
                        name,
                        identifier
                    );
                }

                locals.$scope[identifier] = instance;
            }

            return function (expression, locals, later, ident) {
                var instance,
                    match,
                    constructor,
                    identifier,
                    Constructor;

                later = later === true;

                if (ident && _.isString(ident)) {
                    identifier = ident;
                }

                if (_.isString(expression)) {
                    match = expression.match(CNTRL_REG);
                    constructor = match[1];
                    identifier = identifier || match[3];

                    msos.console.debug(
                        temp_cp + ' - $get -> start: ' + expression
                      + (constructor ? ', constructor: ' + constructor : '')
                      + (identifier ? ', identifier: ' + identifier : '')
                    );

                    expression = controllers.hasOwnProperty(constructor)
                        ? controllers[constructor]
                        : getter(locals.$scope, constructor, true)
                            || (globals ? getter($window, constructor, true) : undefined);

                    assertArgFn(expression, constructor, true);
                } else {
                    msos.console.debug(temp_cp + ' - $get -> start, for expression object.');
                }

                if (later) {
                    Constructor = function () {};

                    Constructor.prototype = (
                        _.isArray(expression)
                            ? expression[expression.length - 1]
                            : expression
                    ).prototype;

                    instance = new Constructor();

                    if (identifier) {
                        addIdentifier(
                            locals,
                            identifier,
                            instance,
                            constructor || expression.name
                        );
                    }

                    msos.console.debug(temp_cp + ' - $get -> flagged later, done!');
                    return extend(
                        function () {
                            $injector.invoke(expression, instance, locals, constructor);
                            return instance;
                        },
                        {
                            instance: instance,
                            identifier: identifier
                        }
                    );
                }

                instance = $injector.instantiate(expression, locals, constructor);

                if (identifier) {
                    addIdentifier(
                        locals,
                        identifier,
                        instance,
                        constructor || expression.name
                    );
                }

                msos.console.debug(temp_cp + ' - $get -> done!');
                return instance;
            };
        }];
    }

    function $DocumentProvider() {
        this.$get = ['$window', function (window) {
            return jqLite(window.document);
        }];
    }

    function $ExceptionHandlerProvider() {
        this.$get = ['$log', function ($log) {
            return function (exception, cause) {
                $log.error.apply($log, arguments);
            };
        }];
    }

    function parseHeaders(headers) {
        var parsed = {},
            key,
            val,
            i;

        if (!headers) { return parsed; }

        forEach(headers.split('\n'), function (line) {
            i = line.indexOf(':');
            key = lowercase(trim(line.substr(0, i)));
            val = trim(line.substr(i + 1));

            if (key) {
                parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
            }
        });

        return parsed;
    }

    function headersGetter(headers) {
        var headersObj = _.isObject(headers) ? headers : undefined;

        return function (name) {
            if (!headersObj) { headersObj = parseHeaders(headers); }

            if (name) {
                return headersObj[lowercase(name)] || null;
            }

            return headersObj;
        };
    }

    function transformData(data, headers, fns) {

        if (_.isFunction(fns)) { return fns(data, headers); }

        forEach(fns, function (fn) {
            data = fn(data, headers);
        });

        return data;
    }

    function isSuccess(status) {
        return 200 <= status && status < 300;
    }

    function $HttpProvider() {

        var JSON_START = /^\s*(\[|\{[^\{])/,
            JSON_END = /[\}\]]\s*$/,
            PROTECTION_PREFIX = /^\)\]\}',?\n/,
            CONTENT_TYPE_APPLICATION_JSON = {
                'Content-Type': 'application/json;charset=utf-8'
            },
            temp_hp = 'ng - $HttpProvider',
            useApplyAsync = false,
            defaults,
            interceptorFactories;

        this.interceptors = [];

        this.defaults = {
            // transform incoming response data
            transformResponse: [function (data) {
                if (_.isString(data)) {
                    // strip json vulnerability protection prefix
                    data = data.replace(PROTECTION_PREFIX, '');
                    if (JSON_START.test(data) && JSON_END.test(data)) { data = fromJson(data); }
                }
                return data;
            }],

            // transform outgoing request data
            transformRequest: [function (d) {
                return _.isObject(d) && !isFile(d) && !isBlob(d) ? toJson(d) : d;
            }],

            // default headers
            headers: {
                common: {
                    'Accept': 'application/json, text/plain, */*'
                },
                post: shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
                put: shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
                patch: shallowCopy(CONTENT_TYPE_APPLICATION_JSON)
            },

            xsrfCookieName: 'XSRF-TOKEN',
            xsrfHeaderName: 'X-XSRF-TOKEN'
        };

        this.useApplyAsync = function (value) {
            if (isDefined(value)) {
                useApplyAsync = !!value;
                return this;
            }

            return useApplyAsync;
        };

        defaults = this.defaults;
        interceptorFactories = this.interceptors;

        this.$get = [
            '$httpBackend', '$browser', '$cacheFactory', '$rootScope', '$q', '$injector',
            function ($httpBackend, $browser, $cacheFactory, $rootScope, $q, $injector) {

                var defaultCache = $cacheFactory('$http'),
                    reversedInterceptors = [];

                function buildUrl(url, params) {

                    if (!params) { return url; }

                    var parts = [];

                    forEachSorted(params, function (value, key) {
                        if (value === null || _.isUndefined(value)) { return; }
                        if (!_.isArray(value)) { value = [value]; }
    
                        forEach(value, function (v) {
                            if (_.isObject(v)) {
                                if (_.isDate(v)) {
                                    v = v.toISOString();
                                } else {
                                    v = toJson(v);
                                }
                            }
                            parts.push(encodeUriQuery(key) + '=' + encodeUriQuery(v));
                        });
                    });
                    if (parts.length > 0) {
                        url += ((url.indexOf('?') === -1) ? '?' : '&') + parts.join('&');
                    }
                    return url;
                }

                function $http(requestConfig) {

                    function mergeHeaders(config) {
                        var defHeaders = defaults.headers,
                            reqHeaders = extend({}, config.headers),
                            defHeaderName, lowercaseDefHeaderName, reqHeaderName;

                        function execHeaders(headers) {
                            var headerContent;

                            forEach(headers, function (headerFn, header) {
                                if (_.isFunction(headerFn)) {
                                    headerContent = headerFn();
                                    if (headerContent !== null) {
                                        headers[header] = headerContent;
                                    } else {
                                        delete headers[header];
                                    }
                                }
                            });
                        }

                        defHeaders = extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);

                        // using for-in instead of forEach to avoid unecessary iteration after header has been found
                        defaultHeadersIteration: for (defHeaderName in defHeaders) {
                            lowercaseDefHeaderName = lowercase(defHeaderName);

                            for (reqHeaderName in reqHeaders) {
                                if (lowercase(reqHeaderName) === lowercaseDefHeaderName) {
                                    continue defaultHeadersIteration;
                                }
                            }

                            reqHeaders[defHeaderName] = defHeaders[defHeaderName];
                        }

                        // execute if header value is a function for merged headers
                        execHeaders(reqHeaders);

                        return reqHeaders;
                    }

                    var config = {
                            method: 'get',
                            transformRequest: defaults.transformRequest,
                            transformResponse: defaults.transformResponse
                        },
                        headers = mergeHeaders(requestConfig),
                        serverRequest,
                        chain,
                        promise,
                        thenFn,
                        rejectFn;

                    extend(config, requestConfig);
                    config.headers = headers;
                    config.method = uppercase(config.method);
    
                    function transformResponse(response) {
                        // make a copy since the response must be cacheable
                        var resp = extend({}, response, {
                            data: transformData(response.data, response.headers, config.transformResponse)
                        });
                        return (isSuccess(response.status)) ? resp : $q.reject(resp);
                    }

                    serverRequest = function (config) {
                        headers = config.headers;
                        var reqData = transformData(config.data, headersGetter(headers), config.transformRequest);

                        // strip content-type if data is undefined
                        if (_.isUndefined(reqData)) {
                            forEach(headers, function (value, header) {
                                if (lowercase(header) === 'content-type') {
                                    delete headers[header];
                                }
                            });
                        }

                        if (_.isUndefined(config.withCredentials) && !_.isUndefined(defaults.withCredentials)) {
                            config.withCredentials = defaults.withCredentials;
                        }

                        function sendReq(config, reqData, reqHeaders) {

                            var deferred = $q.defer(),
                                promise_srq = deferred.promise,
                                cache, cachedResp, url = buildUrl(config.url, config.params),
                                xsrfValue,
                                temp_sr = ' - $get - serverRequest - sendReq';

                            msos.console.debug(temp_hp + temp_sr + ' -> start.');

                            function resolvePromise(response, status, headers, statusText) {

                                msos.console.debug(temp_hp + temp_sr + ' - resolvePromise -> called.');

                                // normalize internal statuses to 0
                                status = Math.max(status, 0);

                                (isSuccess(status) ? deferred.resolve : deferred.reject)({
                                    data: response,
                                    status: status,
                                    headers: headersGetter(headers),
                                    config: config,
                                    statusText: statusText
                                });
                            }

                            function done(status, response, headersString, statusText) {

                                msos.console.debug(temp_hp + temp_sr + ' - done -> called.');

                                if (cache) {
                                    if (isSuccess(status)) {
                                        cache.put(url, [status, response, parseHeaders(headersString), statusText]);
                                    } else {
                                        // remove promise from the cache
                                        cache.remove(url);
                                    }
                                }

                                function resolveHttpPromise() {
                                    resolvePromise(response, status, headersString, statusText);
                                }

                                if (useApplyAsync) {
                                    $rootScope.$applyAsync(resolveHttpPromise);
                                } else {
                                    resolveHttpPromise();
                                    if (!$rootScope.$$phase) { $rootScope.$apply(); }
                                }
                            }

                            function removePendingReq() {
                                var idx = $http.pendingRequests.indexOf(config);

                                if (idx !== -1) { $http.pendingRequests.splice(idx, 1); }
                            }

                            $http.pendingRequests.push(config);

                            promise_srq.then(removePendingReq, removePendingReq);

                            if ((config.cache || defaults.cache) && config.cache !== false && (config.method === 'GET' || config.method === 'JSONP')) {
                                cache = _.isObject(config.cache) ? config.cache : _.isObject(defaults.cache) ? defaults.cache : defaultCache;
                            }

                            if (cache) {
                                cachedResp = cache.get(url);
                                if (isDefined(cachedResp)) {
                                    if (isPromiseLike(cachedResp)) {
                                        // cached request has already been sent, but there is no response yet
                                        cachedResp.then(removePendingReq, removePendingReq);
                                        return cachedResp;
                                    }

                                    // serving from cache
                                    if (_.isArray(cachedResp)) {
                                        resolvePromise(cachedResp[1], cachedResp[0], shallowCopy(cachedResp[2]), cachedResp[3]);
                                    } else {
                                        resolvePromise(cachedResp, 200, {}, 'OK');
                                    }

                                } else {
                                    // put the promise for the non-transformed response into cache as a placeholder
                                    cache.put(url, promise_srq);
                                }
                            }

                            // if we won't have the response in cache, set the xsrf headers and
                            // send the request to the backend
                            if (_.isUndefined(cachedResp)) {
                                xsrfValue = urlIsSameOrigin(config.url) ? $browser.cookies()[config.xsrfCookieName || defaults.xsrfCookieName] : undefined;
                                if (xsrfValue) {
                                    reqHeaders[(config.xsrfHeaderName || defaults.xsrfHeaderName)] = xsrfValue;
                                }

                                $httpBackend(config.method, url, reqData, done, reqHeaders, config.timeout, config.withCredentials, config.responseType);
                            }

                            msos.console.debug(temp_hp + temp_sr + ' -> done!');

                            return promise_srq;
                        }

                        // send request
                        return sendReq(config, reqData, headers).then(transformResponse, transformResponse);
                    };

                    chain = [serverRequest, undefined];
                    promise = $q.when(config);

                    // apply interceptors
                    forEach(reversedInterceptors, function (interceptor) {
                        if (interceptor.request || interceptor.requestError) {
                            chain.unshift(interceptor.request, interceptor.requestError);
                        }
                        if (interceptor.response || interceptor.responseError) {
                            chain.push(interceptor.response, interceptor.responseError);
                        }
                    });

                    while (chain.length) {
                        thenFn = chain.shift();
                        rejectFn = chain.shift();

                        promise = promise.then(thenFn, rejectFn);
                    }

                    promise.success = function (fn) {
                        promise.then(function (response) {
                            fn(response.data, response.status, response.headers, config);
                        });
                        return promise;
                    };

                    promise.error = function (fn) {
                        promise.then(null, function (response) {
                            fn(response.data, response.status, response.headers, config);
                        });
                        return promise;
                    };

                    return promise;
                }

                function createShortMethods(names) {
                    forEach(arguments, function (name) {
                        $http[name] = function (url, config) {
                            return $http(extend(config || {}, {
                                method: name,
                                url: url
                            }));
                        };
                    });
                }

                function createShortMethodsWithData(name) {
                    forEach(arguments, function (name) {
                        $http[name] = function (url, data, config) {
                            return $http(extend(config || {}, {
                                method: name,
                                url: url,
                                data: data
                            }));
                        };
                    });
                }

                forEach(interceptorFactories, function (interceptorFactory) {
                    reversedInterceptors.unshift(_.isString(interceptorFactory) ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory));
                });

                $http.pendingRequests = [];

                createShortMethods('get', 'delete', 'head', 'jsonp');

                createShortMethodsWithData('post', 'put', 'patch');

                $http.defaults = defaults;

                return $http;
            }
        ];
    }

    function createXhr() {
        if (!window.XMLHttpRequest) { return new window.ActiveXObject("Microsoft.XMLHTTP"); }
        return new window.XMLHttpRequest();
    }

    function createHttpBackend($browser, createXhr, $browserDefer, callbacks, rawDocument) {

        var ABORTED = -1;

        function jsonpReq(url, callbackId, done) {
            // we can't use jQuery/jqLite here because jQuery does crazy shit with script elements, e.g.:
            // - fetches local scripts via XHR and evals them
            // - adds and immediately removes script elements from the document
            var script = rawDocument.createElement('script'),
                callback = null;
            script.type = "text/javascript";
            script.src = url;
            script.async = true;

            callback = function (event) {
                removeEventListenerFn(script, "load", callback);
                removeEventListenerFn(script, "error", callback);
                rawDocument.body.removeChild(script);
                script = null;

                var status = -1,
                    text = "unknown";

                if (event) {
                    if (event.type === "load" && !callbacks[callbackId].called) {
                        event = {
                            type: "error"
                        };
                    }
                    text = event.type;
                    status = event.type === "error" ? 404 : 200;
                }

                if (done) {
                    done(status, text);
                }
            };

            addEventListenerFn(script, "load", callback);
            addEventListenerFn(script, "error", callback);
            rawDocument.body.appendChild(script);
            return callback;
        }

        return function (method, url, post, callback, headers, timeout, withCredentials, responseType) {
            var status,
                callbackId,
                jsonpDone,
                xhr,
                timeoutId;

            $browser.$$incOutstandingRequestCount();
            url = url || $browser.url();

            function timeoutRequest() {
                status = ABORTED;

                if (jsonpDone) { jsonpDone(); }
                if (xhr) { xhr.abort(); }
            }

            function completeRequest(callback, status, response, headersString, statusText) {
                // cancel timeout and subsequent timeout promise resolution
                if (timeoutId) {
                    $browserDefer.cancel(timeoutId);
                }

                jsonpDone = xhr = null;

                if (status === 0) {
                    status = response ? 200 : urlResolve(url).protocol === 'file' ? 404 : 0;
                }

                // normalize IE bug (http://bugs.jquery.com/ticket/1450)
                status = status === 1223 ? 204 : status;
                statusText = statusText || '';

                callback(status, response, headersString, statusText);
                $browser.$$completeOutstandingRequest(noop);
            }

            if (lowercase(method) === 'jsonp') {
                callbackId = '_' + (callbacks.counter).toString(36);
                callbacks.counter += 1;
                callbacks[callbackId] = function (data) {
                    callbacks[callbackId].data = data;
                    callbacks[callbackId].called = true;
                };

                jsonpDone = jsonpReq(
                    url.replace('JSON_CALLBACK', 'angular.callbacks.' + callbackId),
                    callbackId,
                    function (status, text) {
                        completeRequest(callback, status, callbacks[callbackId].data, "", text);
                        callbacks[callbackId] = noop;
                    }
                );
            } else {

                xhr = createXhr();

                xhr.open(method, url, true);

                forEach(headers, function (value, key) {
                    if (isDefined(value)) {
                        xhr.setRequestHeader(key, value);
                    }
                });

                xhr.onreadystatechange = function () {
                    var responseHeaders = null,
                        response = null,
                        statusText = '';

                    if (xhr && xhr.readyState === 4) {

                        if (status !== ABORTED) {
                            responseHeaders = xhr.getAllResponseHeaders();

                            // responseText is the old-school way of retrieving response (supported by IE8 & 9)
                            // response/responseType properties were introduced in XHR Level2 spec (supported by IE10)
                            response = xhr.hasOwnProperty('response') ? xhr.response : xhr.responseText;
                        }

                        // Accessing statusText on an aborted xhr object will
                        // throw an 'c00c023f error' in IE9 and lower, don't touch it.
                        if (!(status === ABORTED && msie < 10)) {
                            statusText = xhr.statusText;
                        }

                        completeRequest(callback, status || xhr.status, response, responseHeaders, statusText);
                    }
                };

                if (withCredentials) {
                    xhr.withCredentials = true;
                }

                if (responseType) {
                    try {
                        xhr.responseType = responseType;
                    } catch (e) {
                        if (responseType !== 'json') {
                            throw e;
                        }
                    }
                }

                xhr.send(post || null);
            }

            if (timeout > 0) {
                timeoutId = $browserDefer(timeoutRequest, timeout);
            } else if (isPromiseLike(timeout)) {
                timeout.then(timeoutRequest);
            }
        };
    }

    function $HttpBackendProvider() {
        this.$get = ['$browser', '$window', '$document', function ($browser, $window, $document) {
            return createHttpBackend($browser, createXhr, $browser.defer, $window.angular.callbacks, $document[0]);
        }];
    }

    $interpolateMinErr = minErr('$interpolate');

    function $InterpolateProvider() {
        var startSymbol = '{{',
            endSymbol = '}}';

        this.startSymbol = function (value) {
            if (value) {
                startSymbol = value;
                return this;
            }
            return startSymbol;
        };

        this.endSymbol = function (value) {
            if (value) {
                endSymbol = value;
                return this;
            }
            return endSymbol;
        };

        this.$get = ['$parse', '$exceptionHandler', '$sce', function ($parse, $exceptionHandler, $sce) {

            function escape(ch) {
                return '\\\\\\' + ch;
            }

            var startSymbolLength = startSymbol.length,
                endSymbolLength = endSymbol.length,
                escapedStartRegexp = new RegExp(startSymbol.replace(/./g, escape), 'g'),
                escapedEndRegexp = new RegExp(endSymbol.replace(/./g, escape), 'g');

            function $interpolate(text, mustHaveExpression, trustedContext, allOrNothing) {

                allOrNothing = !!allOrNothing;

                var startIndex,
                    endIndex,
                    index = 0,
                    expressions = [],
                    parseFns = [],
                    textLength = text.length,
                    exp,
                    int_concat = [],
                    expressionPositions = [],
                    compute = function (values) {
                        var i = 0;
                        for (i = 0; i < expressions.length; i += 1) {
                            if (allOrNothing && _.isUndefined(values[i])) { return undefined; }
                            int_concat[expressionPositions[i]] = values[i];
                        }
                        return int_concat.join('');
                    },
                    getValue = function (value) {
                        return trustedContext ? $sce.getTrusted(trustedContext, value) : $sce.valueOf(value);
                    },
                    stringify = function (value) {
                        if (value == null) {    // jshint ignore:line
                            return '';
                        }
                        switch (typeof value) {
                            case 'string':
                                break;
                            case 'number':
                                value = String(value);
                                break;
                            default:
                                value = toJson(value);
                        }

                        return value;
                    };

                function unescapeText(text) {
                    return text.replace(escapedStartRegexp, startSymbol).
                    replace(escapedEndRegexp, endSymbol);
                }

                function parseStringifyInterceptor(value) {
                    try {
                        return stringify(getValue(value));
                    } catch (err) {
                        var newErr = $interpolateMinErr('interr', "Can't interpolate: {0}\n{1}", text, err.toString());
                        $exceptionHandler(newErr);
                    }
                    return undefined;
                }

                while (index < textLength) {
                    startIndex = text.indexOf(startSymbol, index);
                    endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength);
                    if (startIndex !== -1 && endIndex !== -1) {
                        if (index !== startIndex) {
                            int_concat.push(unescapeText(text.substring(index, startIndex)));
                        }
                        exp = text.substring(startIndex + startSymbolLength, endIndex);
                        expressions.push(exp);
                        parseFns.push($parse(exp, parseStringifyInterceptor));
                        index = endIndex + endSymbolLength;
                        expressionPositions.push(int_concat.length);
                        int_concat.push('');
                    } else {
                        // we did not find an interpolation, so we have to add the remainder to the separators array
                        if (index !== textLength) {
                            int_concat.push(unescapeText(text.substring(index)));
                        }
                        break;
                    }
                }

                if (trustedContext && int_concat.length > 1) {
                    throw $interpolateMinErr('noconcat', "Error while interpolating: {0}\nStrict Contextual Escaping disallows " + "interpolations that concatenate multiple expressions when a trusted value is " + "required.  See http://docs.angularjs.org/api/ng.$sce", text);
                }

                if (!mustHaveExpression || expressions.length) {

                    return extend(
                        function interpolationFn(context) {
                            var i = 0,
                                values = [],
                                newErr;

                            try {
                                for (i = 0; i < expressions.length; i += 1) {
                                    values[i] = parseFns[i](context);
                                }

                                return compute(values);

                            } catch (err) {
                                newErr = $interpolateMinErr('interr', "Can't interpolate: {0}\n{1}", text, err.toString());
                                $exceptionHandler(newErr);
                            }

                            return undefined;
                        },
                        {
                            exp: text,
                            expressions: expressions,
                            $$watchDelegate: function (scope, listener, objectEquality) {
                                var lastValue;
                                return scope.$watchGroup(
                                        parseFns,
                                        function interpolateFnWatcher(values, oldValues) {
                                            var currValue = compute(values);
                                            if (_.isFunction(listener)) {
                                                listener.call(this, currValue, values !== oldValues ? lastValue : currValue, scope);
                                            }
                                            lastValue = currValue;
                                        },
                                        objectEquality
                                    );
                            }
                        }
                    );
                }
            }

            $interpolate.startSymbol = function () {
                return startSymbol;
            };

            $interpolate.endSymbol = function () {
                return endSymbol;
            };

            return $interpolate;
        }];
    }

    function $IntervalProvider() {
        this.$get = ['$rootScope', '$window', '$q', '$$q', function ($rootScope, $window, $q, $$q) {
            var intervals = {},
                temp_ipg = '$IntervalProvider - $get';

            function interval(fn, delay, count, invokeApply) {
                var setInterval = $window.setInterval,
                    clearInterval = $window.clearInterval,
                    iteration = 0,
                    skipApply = (isDefined(invokeApply) && !invokeApply),
                    deferred = (skipApply ? $$q : $q).defer(),
                    promise = deferred.promise;

                msos.console.debug(temp_ipg + ' - interval -> called.');

                count = isDefined(count) ? count : 0;

                promise.then(null, null, fn);

                promise.$$intervalId = setInterval(function tick() {

                    deferred.notify(iteration);
                    iteration += 1;

                    if (count > 0 && iteration >= count) {
                        deferred.resolve(iteration);
                        clearInterval(promise.$$intervalId);
                        delete intervals[promise.$$intervalId];
                    }

                    if (!skipApply) { $rootScope.$apply(); }

                }, delay);

                intervals[promise.$$intervalId] = deferred;

                return promise;
            }

            interval.cancel = function (promise) {

                if (promise && intervals.hasOwnProperty(promise.$$intervalId)) {
                    intervals[promise.$$intervalId].reject('canceled');
                    $window.clearInterval(promise.$$intervalId);
                    delete intervals[promise.$$intervalId];
                    return true;
                }
                return false;
            };

            return interval;
        }];
    }

    function $LocaleProvider() {
        this.$get = function () {
            return {
                id: 'en-us',

                NUMBER_FORMATS: {
                    DECIMAL_SEP: '.',
                    GROUP_SEP: ',',
                    PATTERNS: [{ // Decimal Pattern
                        minInt: 1,
                        minFrac: 0,
                        maxFrac: 3,
                        posPre: '',
                        posSuf: '',
                        negPre: '-',
                        negSuf: '',
                        gSize: 3,
                        lgSize: 3
                    }, { //Currency Pattern
                        minInt: 1,
                        minFrac: 2,
                        maxFrac: 2,
                        posPre: '\u00A4',
                        posSuf: '',
                        negPre: '(\u00A4',
                        negSuf: ')',
                        gSize: 3,
                        lgSize: 3
                    }],
                    CURRENCY_SYM: '$'
                },

                DATETIME_FORMATS: {
                    MONTH: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    SHORTMONTH: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    DAY: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                    SHORTDAY: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                    AMPMS: ['AM', 'PM'],
                    medium: 'MMM d, y h:mm:ss a',
                    'short': 'M/d/yy h:mm a',
                    fullDate: 'EEEE, MMMM d, y',
                    longDate: 'MMMM d, y',
                    mediumDate: 'MMM d, y',
                    shortDate: 'M/d/yy',
                    mediumTime: 'h:mm:ss a',
                    shortTime: 'h:mm a'
                },

                pluralCat: function (num) {
                    if (num === 1) {
                        return 'one';
                    }
                    return 'other';
                }
            };
        };
    }

    $locationMinErr = minErr('$location');

    function encodePath(path) {
        var segments = path.split('/'),
            i = segments.length;

        while (i) {
            i -= 1;
            segments[i] = encodeUriSegment(segments[i]);
        }

        return segments.join('/');
    }

    function parseAbsoluteUrl(absoluteUrl, locationObj, appBase) {
        var parsedUrl = urlResolve(absoluteUrl, appBase);

        locationObj.$$protocol = parsedUrl.protocol;
        locationObj.$$host = parsedUrl.hostname;
        locationObj.$$port = parseInt(parsedUrl.port, 10) || DEFAULT_PORTS[parsedUrl.protocol] || null;
    }

    function parseAppUrl(relativeUrl, locationObj, appBase) {
        var prefixed = (relativeUrl.charAt(0) !== '/'),
            match;

        if (prefixed) {
            relativeUrl = '/' + relativeUrl;
        }

        match = urlResolve(relativeUrl, appBase);

        locationObj.$$path = decodeURIComponent(prefixed && match.pathname.charAt(0) === '/' ? match.pathname.substring(1) : match.pathname);
        locationObj.$$search = parseKeyValue(match.search);
        locationObj.$$hash = decodeURIComponent(match.hash);

        // make sure path starts with '/';
        if (locationObj.$$path && locationObj.$$path.charAt(0) !== '/') {
            locationObj.$$path = '/' + locationObj.$$path;
        }
    }

    function beginsWith(begin, whole) {
        if (whole.indexOf(begin) === 0) {
            return whole.substr(begin.length);
        }
        return undefined;
    }

    function stripHash(url) {
        var index = url.indexOf('#');
        return index === -1 ? url : url.substr(0, index);
    }

    function stripFile(url) {
        return url.substr(0, stripHash(url).lastIndexOf('/') + 1);
    }

    /* return the server only (scheme://host:port) */
    function serverBase(url) {
        return url.substring(0, url.indexOf('/', url.indexOf('//') + 2));
    }

    function LocationHtml5Url(appBase, basePrefix) {
        this.$$html5 = true;
        basePrefix = basePrefix || '';

        var appBaseNoFile = stripFile(appBase);

        parseAbsoluteUrl(appBase, this, appBase);

        this.$$parse = function (url) {
            var pathUrl = beginsWith(appBaseNoFile, url);
            if (!_.isString(pathUrl)) {
                throw $locationMinErr('ipthprfx', 'Invalid url "{0}", missing path prefix "{1}".', url, appBaseNoFile);
            }

            parseAppUrl(pathUrl, this, appBase);

            if (!this.$$path) {
                this.$$path = '/';
            }

            this.$$compose();
        };

        this.$$compose = function () {
            var search = toKeyValue(this.$$search),
                hash = this.$$hash ? '#' + encodeUriSegment(this.$$hash) : '';

            this.$$url = encodePath(this.$$path) + (search ? '?' + search : '') + hash;
            this.$$absUrl = appBaseNoFile + this.$$url.substr(1); // first char is always '/'
        };

        this.$$parseLinkUrl = function (url, relHref) {
            
            if (relHref && relHref[0] === '#') {
                // special case for links to hash fragments:
                // keep the old url and only replace the hash fragment
                this.hash(relHref.slice(1));
                return true;
            }

            var appUrl = beginsWith(appBase, url),
                appUrlNF = beginsWith(appBaseNoFile, url),
                prevAppUrl,
                rewrittenUrl;
            
            if (appUrl !== undefined) {
                prevAppUrl = appUrl;

                appUrl = beginsWith(basePrefix, appUrl);

                if (appUrl !== undefined) {
                    rewrittenUrl = appBaseNoFile + (beginsWith('/', appUrl) || appUrl);
                } else {
                    rewrittenUrl = appBase + prevAppUrl;
                }
            } else if (appUrlNF !== undefined) {
                rewrittenUrl = appBaseNoFile + appUrlNF;
            } else if (appBaseNoFile === url + '/') {
                rewrittenUrl = appBaseNoFile;
            }

            if (rewrittenUrl) {
                this.$$parse(rewrittenUrl);
            }
            return !!rewrittenUrl;
        };
    }

    function LocationHashbangUrl(appBase, hashPrefix) {
        var appBaseNoFile = stripFile(appBase);

        parseAbsoluteUrl(appBase, this, appBase);

        this.$$parse = function (url) {
            var withoutBaseUrl = beginsWith(appBase, url) || beginsWith(appBaseNoFile, url),
                withoutHashUrl = withoutBaseUrl.charAt(0) === '#' ? beginsWith(hashPrefix, withoutBaseUrl) : (this.$$html5) ? withoutBaseUrl : '';

            if (!_.isString(withoutHashUrl)) {
                throw $locationMinErr('ihshprfx', 'Invalid url "{0}", missing hash prefix "{1}".', url, hashPrefix);
            }

            function removeWindowsDriveName(path, url, base) {
                /*
                    Matches paths for file protocol on windows,
                    such as /C:/foo/bar, and captures only /foo/bar.
                */
                var windowsFilePathExp = /^\/[A-Z]:(\/.*)/,
                    firstPathSegmentMatch;

                //Get the relative path from the input URL.
                if (url.indexOf(base) === 0) {
                    url = url.replace(base, '');
                }

                // The input URL intentionally contains a first path segment that ends with a colon.
                if (windowsFilePathExp.exec(url)) {
                    return path;
                }

                firstPathSegmentMatch = windowsFilePathExp.exec(path);

                return firstPathSegmentMatch ? firstPathSegmentMatch[1] : path;
            }

            parseAppUrl(withoutHashUrl, this, appBase);

            this.$$path = removeWindowsDriveName(this.$$path, withoutHashUrl, appBase);

            this.$$compose();
        };

        this.$$compose = function () {
            var search = toKeyValue(this.$$search),
                hash = this.$$hash ? '#' + encodeUriSegment(this.$$hash) : '';

            this.$$url = encodePath(this.$$path) + (search ? '?' + search : '') + hash;
            this.$$absUrl = appBase + (this.$$url ? hashPrefix + this.$$url : '');
        };

        this.$$parseLinkUrl = function (url, relHref) {
            if (stripHash(appBase) === stripHash(url)) {
                this.$$parse(url);
                return true;
            }
            return false;
        };
    }

    function LocationHashbangInHtml5Url(appBase, hashPrefix) {
        this.$$html5 = true;
        LocationHashbangUrl.apply(this, arguments);

        var appBaseNoFile = stripFile(appBase);

        this.$$parseLinkUrl = function (url, relHref) {

            if (relHref && relHref[0] === '#') {
                // special case for links to hash fragments:
                // keep the old url and only replace the hash fragment
                this.hash(relHref.slice(1));
                return true;
            }

            var rewrittenUrl,
                appUrl = beginsWith(appBaseNoFile, url);

            if (appBase === stripHash(url)) {
                rewrittenUrl = url;
            } else if (appUrl) {
                rewrittenUrl = appBase + hashPrefix + appUrl;
            } else if (appBaseNoFile === url + '/') {
                rewrittenUrl = appBaseNoFile;
            }

            if (rewrittenUrl) {
                this.$$parse(rewrittenUrl);
            }

            return !!rewrittenUrl;
        };

        this.$$compose = function () {
            var search = toKeyValue(this.$$search),
                hash = this.$$hash ? '#' + encodeUriSegment(this.$$hash) : '';

            this.$$url = encodePath(this.$$path) + (search ? '?' + search : '') + hash;
            // include hashPrefix in $$absUrl when $$url is empty so IE8 & 9 do not reload page because of removal of '#'
            this.$$absUrl = appBase + hashPrefix + this.$$url;
        };
    }

    function locationGetter(property) {
        return function () {
            return this[property];
        };
    }

    function locationGetterSetter(property, preprocess) {
        return function (value) {
            if (_.isUndefined(value)) { return this[property]; }

            this[property] = preprocess(value);
            this.$$compose();

            return this;
        };
    }

    LocationHashbangInHtml5Url.prototype = LocationHashbangUrl.prototype = LocationHtml5Url.prototype = {

        $$html5: false,

        $$replace: false,

        absUrl: locationGetter('$$absUrl'),

        url: function (url) {
            if (_.isUndefined(url)) { return this.$$url; }

            var match = PATH_MATCH.exec(url);

            if (match[1]) { this.path(decodeURIComponent(match[1])); }
            if (match[2] || match[1]) { this.search(match[3] || ''); }

            this.hash(match[5] || '');

            return this;
        },

        protocol: locationGetter('$$protocol'),

        host: locationGetter('$$host'),

        port: locationGetter('$$port'),

        path: locationGetterSetter('$$path', function (path) {
            path = path ? path.toString() : '';
            return path.charAt(0) === '/' ? path : '/' + path;
        }),

        search: function (search, paramValue) {
            switch (arguments.length) {
            case 0:
                return this.$$search;
            case 1:
                if (_.isString(search) || _.isNumber(search)) {
                    search = search.toString();
                    this.$$search = parseKeyValue(search);
                } else if (_.isObject(search)) {
                    // remove object undefined or null properties
                    forEach(search, function (value, key) {
                        if (value === null) { delete search[key]; }
                    });
                    this.$$search = search;
                } else {
                    throw $locationMinErr('isrcharg', 'The first argument of the `$location#search()` call must be a string or an object.');
                }
                break;
            default:
                if (_.isUndefined(paramValue) || paramValue === null) {
                    delete this.$$search[search];
                } else {
                    this.$$search[search] = paramValue;
                }
            }

            this.$$compose();
            return this;
        },

        hash: locationGetterSetter('$$hash', function(hash) {
            return hash ? hash.toString() : '';
        }),

        replace: function () {
            this.$$replace = true;
            return this;
        }
    };

    function $LocationProvider() {
        var temp_lp = 'ng - $LocationProvider',
            hashPrefix = '',
            html5Mode = false;

        msos.console.debug(temp_lp + ' -> start.');

        this.hashPrefix = function (prefix) {
            if (isDefined(prefix)) {
                hashPrefix = prefix;
                return this;
            }

            return hashPrefix;
        };

        this.html5Mode = function (mode) {
            if (isDefined(mode)) {
                html5Mode = mode;
                return this;
            }

            return html5Mode;
        };

        this.$get = ['$rootScope', '$browser', '$rootElement', function ($rootScope, $browser, $rootElement) {

            var $location,
                LocationMode,
                baseHref = $browser.baseHref(),
                initialUrl = $browser.url(),
                IGNORE_URI_REGEXP = /^\s*(javascript|mailto):/i,
                appBase,
                changeCounter;

            msos.console.debug(temp_lp + ' - $get -> start, initialUrl: ' + initialUrl);

            if (html5Mode) {
                if (!baseHref) {
                    throw $locationMinErr(
                        'nobase',
                        "$location in HTML5 mode requires a <base> tag to be present!"
                    );
                }
                appBase = serverBase(initialUrl) + (baseHref || '/');
                LocationMode = Modernizr.history ? LocationHtml5Url : LocationHashbangInHtml5Url;
            } else {
                appBase = stripHash(initialUrl);
                LocationMode = LocationHashbangUrl;
            }

            $location = new LocationMode(appBase, '#' + hashPrefix);
            $location.$$parseLinkUrl(initialUrl, initialUrl);

            function afterLocationChange(oldUrl) {
                $rootScope.$broadcast('$locationChangeSuccess', $location.absUrl(), oldUrl);
            }

            $rootElement.on(
                'click',
                function (event) {

                    var temp_re = ' - $get - $rootElement.on:click -> ',
                        debug = 'no a tag',
                        elm,
                        absHref,
                        relHref;

                    msos.console.debug(temp_lp + temp_re + 'start, target: ' + (event.target.id || lowercase(event.target.nodeName)));

                    if (event.ctrlKey || event.metaKey || event.which === 2) {
                        msos.console.debug(temp_lp + temp_re + 'done, skipped event.');
                        return;
                    }

                    elm = jqLite(event.target);

                    // traverse the DOM up to find first A tag
                    while (nodeName_(elm[0]) !== 'a') {
                        // ignore rewriting if no A tag (reached root element, or no parent - removed from document)
                        if (elm[0] === $rootElement[0]) {
                            debug += ', for root element.';
                            msos.console.debug(temp_lp + temp_re + 'done, ' + debug);
                            return;
                        }

                        elm = elm.parent();

                        if (!elm || elm[0]) {
                            debug += ', no parent element.';
                            msos.console.debug(temp_lp + temp_re + 'done, ' + debug);
                            return;
                        }
                    }

                    absHref = elm.prop('href');
                    relHref = elm.attr('href') || elm.attr('xlink:href');

                    if (_.isObject(absHref) && absHref.toString() === '[object SVGAnimatedString]') {
                        absHref = urlResolve(absHref.animVal).href;
                    }

                    // Ignore when url is started with javascript: or mailto:
                    if (IGNORE_URI_REGEXP.test(absHref)) { return; }

                    if (absHref && !elm.attr('target') && !event.isDefaultPrevented()) {
                        if ($location.$$parseLinkUrl(absHref, relHref)) {
                            event.preventDefault();
                            // update location manually
                            if ($location.absUrl() !== $browser.url()) {
                                $rootScope.$apply();
                                // hack to work around FF6 bug 684208 when scenario runner clicks on links
                                window.angular['ff-684208-preventDefault'] = true;
                            }
                        }
                    }

                    msos.console.debug(temp_lp + temp_re + 'done!');
                }
            );

            // rewrite hashbang url <> html5 url
            if ($location.absUrl() !== initialUrl) {
                $browser.url($location.absUrl(), true);
            }

            // update $location when $browser url changes
            $browser.onUrlChange(
                function (newUrl) {
                    if ($location.absUrl() !== newUrl) {
                        $rootScope.$evalAsync(function () {
                            var oldUrl = $location.absUrl();

                            $location.$$parse(newUrl);
                            if ($rootScope.$broadcast('$locationChangeStart', newUrl, oldUrl).defaultPrevented) {
                                $location.$$parse(oldUrl);
                                $browser.url(oldUrl);
                            } else {
                                afterLocationChange(oldUrl);
                            }
                        });
                        if (!$rootScope.$$phase) { $rootScope.$digest(); }
                    }
                }
            );

            // update browser
            changeCounter = 0;

            $rootScope.$watch(
                function $locationWatch() {
                    var oldUrl = $browser.url(),
                        currentReplace = $location.$$replace;

                    if (!changeCounter || oldUrl !== $location.absUrl()) {
                        changeCounter += 1;
                        $rootScope.$evalAsync(
                            function () {
                                if ($rootScope.$broadcast('$locationChangeStart', $location.absUrl(), oldUrl).
                                defaultPrevented) {
                                    $location.$$parse(oldUrl);
                                } else {
                                    $browser.url($location.absUrl(), currentReplace);
                                    afterLocationChange(oldUrl);
                                }
                            }
                        );
                    }
                    $location.$$replace = false;

                    return changeCounter;
                }
            );

            msos.console.debug(temp_lp + ' - $get -> done!');

            return $location;
        }];

        msos.console.debug(temp_lp + ' -> done!');
    }

    function $LogProvider() {

        this.debugEnabled = function (flag) {
            if (isDefined(flag)) {
                msos.config.debug = flag;
                return this;
            }

            return msos.config.debug;
        };

        this.$get = ['$window', function ($window) {
            return msos.console;
        }];
    }

    $parseMinErr = minErr('$parse');

    function ensureSafeMemberName(name, fullExpression) {
        if (name === "__defineGetter__"
         || name === "__defineSetter__"
         || name === "__lookupGetter__"
         || name === "__lookupSetter__"
         || name === "__proto__") {
            throw $parseMinErr('isecfld', 'Attempting to access a disallowed field in Angular expressions! ' + 'Expression: {0}', fullExpression);
        }
        return name;
    }

    function ensureSafeObject(obj, fullExpression) {
        var ref_txt = ': referencing in Angular expressions is disallowed! Expression: {0}';

        // nifty check if obj is Function that is fast and works across iframes and other contexts
        if (obj) {
            if (obj.constructor === obj) {
                throw $parseMinErr('isecfn', 'Function' + ref_txt, fullExpression);
            }
            if (obj.window === obj) {
                throw $parseMinErr('isecwindow', 'Window' + ref_txt, fullExpression);
            }
            if (obj.children && (obj.nodeName || (obj.prop && obj.attr && obj.find))) {
                throw $parseMinErr('isecdom', 'DOM nodes' + ref_txt, fullExpression);
            }
            if (obj === Object) {
                throw $parseMinErr('isecobj', 'Object' + ref_txt, fullExpression);
            }
            if (obj === CALL || obj === APPLY || obj === BIND) {
                throw $parseMinErr('isecff', 'call, bind, apply' + ref_txt, fullExpression);
            }
        }
        return obj;
    }

    //////////////////////////////////////////////////
    // Parser helper functions
    //////////////////////////////////////////////////

    function setter(obj, path, setValue, fullExp) {
        ensureSafeObject(obj, fullExp);

        var element = path.split('.'),
            key,
            i = 0,
            propertyObj;

        for (i = 0; element.length > 1; i += 1) {
            key = ensureSafeMemberName(element.shift(), fullExp);
            propertyObj = ensureSafeObject(obj[key], fullExp);

            if (!propertyObj) {
                propertyObj = {};
                obj[key] = propertyObj;
            }
            obj = propertyObj;
        }

        key = ensureSafeMemberName(element.shift(), fullExp);
        ensureSafeObject(obj[key], fullExp);
        obj[key] = setValue;

        return setValue;
    }

    getterFnCache = createMap();

    /**
     * Implementation of the "Black Hole" variant from:
     * - http://jsperf.com/angularjs-parse-getter/4
     * - http://jsperf.com/path-evaluation-simplified/7
     */
    function cspSafeGetterFn(key0, key1, key2, key3, key4, fullExp) {
        ensureSafeMemberName(key0, fullExp);
        ensureSafeMemberName(key1, fullExp);
        ensureSafeMemberName(key2, fullExp);
        ensureSafeMemberName(key3, fullExp);
        ensureSafeMemberName(key4, fullExp);

        return function cspSafeGetter(scope, locals) {
            var pathVal = (locals && locals.hasOwnProperty(key0)) ? locals : scope;

            if (pathVal === null) { return pathVal; }
            pathVal = pathVal[key0];

            if (!key1) { return pathVal; }
            if (pathVal === null) { return undefined; }
            pathVal = pathVal[key1];

            if (!key2) { return pathVal; }
            if (pathVal === null) { return undefined; }
            pathVal = pathVal[key2];

            if (!key3) { return pathVal; }
            if (pathVal === null) { return undefined; }
            pathVal = pathVal[key3];

            if (!key4) { return pathVal; }
            if (pathVal === null) { return undefined; }
            pathVal = pathVal[key4];

            return pathVal;
        };
    }

    function getterFn(path, options, fullExp) {
        var fn = getterFnCache[path],
            pathKeys,
            pathKeysLength,
            code = '',
            evaledFnGetter;

        if (fn) { return fn; }

        pathKeys = path.split('.');
        pathKeysLength = pathKeys.length;

        // http://jsperf.com/angularjs-parse-getter/6
        if (options.csp) {
            if (pathKeysLength < 6) {
                fn = cspSafeGetterFn(pathKeys[0], pathKeys[1], pathKeys[2], pathKeys[3], pathKeys[4], fullExp);
            } else {
                fn = function (scope, locals) {
                    var i = 0,
                        val;
                    do {
                        val = cspSafeGetterFn(pathKeys[i++], pathKeys[i++], pathKeys[i++], pathKeys[i++], pathKeys[i++], fullExp)(scope, locals);

                        locals = undefined; // clear after first iteration
                        scope = val;
                    } while (i < pathKeysLength);
                    return val;
                };
            }
        } else {

            forEach(pathKeys, function (key, index) {
                ensureSafeMemberName(key, fullExp);
                code += 'if(s == null) return undefined;\n' + 's=' + (index ? 's' : '((l&&l.hasOwnProperty("' + key + '"))?l:s)') + '.' + key + ';\n';
            });

            code += 'return s;';

            /* jshint -W054 */
            evaledFnGetter = new Function('s', 'l', code); // s=scope, l=locals
            /* jshint +W054 */
            evaledFnGetter.toString = valueFn(code);
            evaledFnGetter.assign = function(self, value) {
                return setter(self, path, value, path);
            };

            fn = evaledFnGetter;
        }

        fn.sharedGetter = true;
        getterFnCache[path] = fn;
        return fn;
    }

    CONSTANTS = createMap();

    forEach(
        {
            'null':     function() { return null; },
            'true':     function() { return true; },
            'false':    function() { return false; },
            'undefined': function() {}
        },
        function (constantGetter, name) {
            constantGetter.constant = constantGetter.literal = constantGetter.sharedGetter = true;
            CONSTANTS[name] = constantGetter;
        }
    );

    OPERATORS = extend(createMap(), {
        /* jshint bitwise : false */
        '+': function (self, locals, a, b) {
            a = a(self, locals);
            b = b(self, locals);
            if (isDefined(a)) {
                if (isDefined(b)) {
                    return a + b;
                }
                return a;
            }
            return isDefined(b) ? b : undefined;
        },
        '-': function (self, locals, a, b) {
            a = a(self, locals);
            b = b(self, locals);
            return (isDefined(a) ? a : 0) - (isDefined(b) ? b : 0);
        },
        '*': function (self, locals, a, b) {
            return a(self, locals) * b(self, locals);
        },
        '/': function (self, locals, a, b) {
            return a(self, locals) / b(self, locals);
        },
        '%': function (self, locals, a, b) {
            return a(self, locals) % b(self, locals);
        },
        '^': function (self, locals, a, b) {
            return a(self, locals) ^ b(self, locals);
        },
        '=': noop,
        '===': function (self, locals, a, b) {
            return a(self, locals) === b(self, locals);
        },
        '!==': function (self, locals, a, b) {
            return a(self, locals) !== b(self, locals);
        },
        '==': function (self, locals, a, b) {
            return a(self, locals) == b(self, locals);
        },
        '!=': function (self, locals, a, b) {
            return a(self, locals) != b(self, locals);
        },
        '<': function (self, locals, a, b) {
            return a(self, locals) < b(self, locals);
        },
        '>': function (self, locals, a, b) {
            return a(self, locals) > b(self, locals);
        },
        '<=': function (self, locals, a, b) {
            return a(self, locals) <= b(self, locals);
        },
        '>=': function (self, locals, a, b) {
            return a(self, locals) >= b(self, locals);
        },
        '&&': function (self, locals, a, b) {
            return a(self, locals) && b(self, locals);
        },
        '||': function (self, locals, a, b) {
            return a(self, locals) || b(self, locals);
        },
        '&': function (self, locals, a, b) {
            return a(self, locals) & b(self, locals);
        },
        //    '|':function(self, locals, a,b){return a|b;},
        '|': function (self, locals, a, b) {
            return b(self, locals)(self, locals, a(self, locals));
        },
        '!': function (self, locals, a) {
            return !a(self, locals);
        }
    });

    /* jshint bitwise: true */
    Lexer = function (options) {
            this.options = options;
        };

    Lexer.prototype = {
        constructor: Lexer,

        lex: function (text) {

            var ch2,
                ch3,
                fn,
                fn2,
                fn3;

            this.text = text;
            this.index = 0;
            this.ch = undefined;
            this.tokens = [];

            while (this.index < this.text.length) {
                this.ch = this.text.charAt(this.index);
                if (this.is('"\'')) {
                    this.readString(this.ch);
                } else if (this.isNumber(this.ch) || (this.is('.') && this.isNumber(this.peek()))) {
                    this.readNumber();
                } else if (this.isIdent(this.ch)) {
                    this.readIdent();
                } else if (this.is('(){}[].,;:?')) {
                    this.tokens.push({
                        index: this.index,
                        text: this.ch
                    });
                    this.index += 1;
                } else if (this.isWhitespace(this.ch)) {
                    this.index += 1;
                } else {
                    ch2 = this.ch + this.peek();
                    ch3 = ch2 + this.peek(2);
                    fn = OPERATORS[this.ch];
                    fn2 = OPERATORS[ch2];
                    fn3 = OPERATORS[ch3];

                    if (fn3) {
                        this.tokens.push({
                            index: this.index,
                            text: ch3,
                            fn: fn3
                        });
                        this.index += 3;
                    } else if (fn2) {
                        this.tokens.push({
                            index: this.index,
                            text: ch2,
                            fn: fn2
                        });
                        this.index += 2;
                    } else if (fn) {
                        this.tokens.push({
                            index: this.index,
                            text: this.ch,
                            fn: fn
                        });
                        this.index += 1;
                    } else {
                        this.throwError('Unexpected next character ', this.index, this.index + 1);
                    }
                }
            }
            return this.tokens;
        },

        is: function (chars) {
            return chars.indexOf(this.ch) !== -1;
        },

        peek: function (i) {
            var num = i || 1;
            return (this.index + num < this.text.length) ? this.text.charAt(this.index + num) : false;
        },

        isNumber: function (ch) {
            return ('0' <= ch && ch <= '9');
        },

        isWhitespace: function (ch) {
            // IE treats non-breaking space as \u00A0
            return (ch === ' ' || ch === '\r' || ch === '\t' || ch === '\n' || ch === '\v' || ch === '\u00A0');
        },

        isIdent: function (ch) {
            return (('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z') || '_' === ch || ch === '$');
        },

        isExpOperator: function (ch) {
            return (ch === '-' || ch === '+' || this.isNumber(ch));
        },

        throwError: function (error, start, end) {
            end = end || this.index;
            var colStr = (isDefined(start) ? 's ' + start + '-' + this.index + ' [' + this.text.substring(start, end) + ']' : ' ' + end);
            throw $parseMinErr('lexerr', 'Lexer Error: {0} at column{1} in expression [{2}].', error, colStr, this.text);
        },

        readNumber: function () {
            var number = '',
                start = this.index,
                ch,
                peekCh;

            while (this.index < this.text.length) {

                ch = lowercase(this.text.charAt(this.index));

                if (ch === '.' || this.isNumber(ch)) {
                    number += ch;
                } else {
                    peekCh = this.peek();
                    if (ch === 'e' && this.isExpOperator(peekCh)) {
                        number += ch;
                    } else if (this.isExpOperator(ch) && peekCh && this.isNumber(peekCh) && number.charAt(number.length - 1) === 'e') {
                        number += ch;
                    } else if (this.isExpOperator(ch) && (!peekCh || !this.isNumber(peekCh)) && number.charAt(number.length - 1) === 'e') {
                        this.throwError('Invalid exponent');
                    } else {
                        break;
                    }
                }
                this.index += 1;
            }

            number = Number(number);

            this.tokens.push({
                index: start,
                text: number,
                constant: true,
                fn: function () {
                    return number;
                }
            });
        },

        readIdent: function () {
            var parser = this,
                ident = '',
                start = this.index,
                lastDot,
                peekIndex,
                methodName,
                ch,
                token = {},
                fn = null,
                getter_rI = null;

            while (this.index < this.text.length) {
                ch = this.text.charAt(this.index);
                if (ch === '.' || this.isIdent(ch) || this.isNumber(ch)) {
                    if (ch === '.') { lastDot = this.index; }
                    ident += ch;
                } else {
                    break;
                }
                this.index += 1;
            }

            //check if this is not a method invocation and if it is back out to last dot
            if (lastDot) {
                peekIndex = this.index;
                while (peekIndex < this.text.length) {
                    ch = this.text.charAt(peekIndex);
                    if (ch === '(') {
                        methodName = ident.substr(lastDot - start + 1);
                        ident = ident.substr(0, lastDot - start);
                        this.index = peekIndex;
                        break;
                    }
                    if (this.isWhitespace(ch)) {
                        peekIndex += 1;
                    } else {
                        break;
                    }
                }
            }

            token = {
                index: start,
                text: ident
            };

            fn = OPERATORS[ident];

            if (fn) {
                token.fn = fn;
                token.constant = true;
            } else {
                getter_rI = getterFn(ident, this.options, this.text);

                token.fn = extend(
                    function $parsePathGetter(self, locals) {
                        return getter_rI(self, locals);
                    },
                    {
                        assign: function (self, value) {
                            return setter(self, ident, value, parser.text);
                        }
                    }
                );
            }

            this.tokens.push(token);

            if (methodName) {
                this.tokens.push({
                    index: lastDot,
                    text: '.'
                });
                this.tokens.push({
                    index: lastDot + 1,
                    text: methodName
                });
            }
        },

        readString: function (quote) {
            var start = this.index,
                string = '',
                rawString = quote,
                escape = false,
                ch,
                hex,
                rep;

            this.index += 1;

            while (this.index < this.text.length) {
                ch = this.text.charAt(this.index);
                rawString += ch;
                if (escape) {
                    if (ch === 'u') {
                        hex = this.text.substring(this.index + 1, this.index + 5);

                        if (!hex.match(/[\da-f]{4}/i)) { this.throwError('Invalid unicode escape [\\u' + hex + ']'); }

                        this.index += 4;
                        string += String.fromCharCode(parseInt(hex, 16));
                    } else {
                        rep = ESCAPE[ch];
                        string = string + (rep || ch);
                    }
                    escape = false;
                } else if (ch === '\\') {
                    escape = true;
                } else {
                    if (ch === quote) {
                        this.index += 1;
                        /* jshint ignore:start */
                        this.tokens.push({
                            index: start,
                            text: rawString,
                            string: string,
                            constant: true,
                            fn: function () {
                                return string;
                            }
                        });
                        /* jshint ignore:end */
                        return;
                    }
                    string += ch;
                }
                this.index += 1;
            }
            this.throwError('Unterminated quote', start);
        }
    };

    Parser = function (lexer, $filter, options) {
            this.lexer = lexer;
            this.$filter = $filter;
            this.options = options;
        };

    Parser.ZERO = extend(function () {
        return 0;
    }, {
        sharedGetter: true,   // this causes modal problem for bootstrap2.html
        constant: true
    });

    Parser.prototype = {
        constructor: Parser,

        parse: function (text) {
            this.text = text;
            this.tokens = this.lexer.lex(text);

            var value = this.statements();

            if (this.tokens.length !== 0) {
                this.throwError('is an unexpected token', this.tokens[0]);
            }

            value.literal = !! value.literal;
            value.constant = !! value.constant;

            return value;
        },

        primary: function () {
            var primary,
                token,
                next,
                context;

            if (this.expect('(')) {
                primary = this.filterChain();
                this.consume(')');
            } else if (this.expect('[')) {
                primary = this.arrayDeclaration();
            } else if (this.expect('{')) {
                primary = this.object();
            } else {
                token = this.expect();
                primary = token.fn;
                if (!primary) {
                    this.throwError('not a primary expression', token);
                }
                if (token.constant) {
                    primary.constant = true;
                    primary.literal = true;
                }
            }

            // Hard to see how this works?
            while ((next = this.expect('(', '[', '.'))) {
                if (msos.config.verbose) {
                    msos.console.debug('ng - Parser - primary -> next:', next);
                }
                if (next.text === '(') {
                    primary = this.functionCall(primary, context);
                    context = null;
                } else if (next.text === '[') {
                    context = primary;
                    primary = this.objectIndex(primary);
                } else if (next.text === '.') {
                    context = primary;
                    primary = this.fieldAccess(primary);
                } else {
                    this.throwError('IMPOSSIBLE');
                }
            }

            return primary;
        },

        throwError: function (msg, token) {
            throw $parseMinErr('syntax', 'Syntax Error: Token \'{0}\' {1} at column {2} of the expression [{3}] starting at [{4}].', token.text, msg, (token.index + 1), this.text, this.text.substring(token.index));
        },

        peekToken: function () {
            if (this.tokens.length === 0) { throw $parseMinErr('ueoe', 'Unexpected end of expression: {0}', this.text); }
            return this.tokens[0];
        },

        peek: function (e1, e2, e3, e4) {
            if (this.tokens.length > 0) {
                var token = this.tokens[0],
                    t = token.text;

                if (t === e1
                 || t === e2
                 || t === e3
                 || t === e4
                 || (!e1 && !e2 && !e3 && !e4)) {
                    return token;
                }
            }
            return false;
        },

        expect: function (e1, e2, e3, e4) {
            var token = this.peek(e1, e2, e3, e4);
            if (token) {
                this.tokens.shift();
                return token;
            }
            return false;
        },

        consume: function (e1) {
            if (!this.expect(e1)) {
                this.throwError('is unexpected, expecting [' + e1 + ']', this.peek());
            }
        },

        unaryFn: function (fn, right) {
            return extend(function (self, locals) {
                return fn(self, locals, right);
            }, {
                constant: right.constant
            });
        },

        ternaryFn: function (left, middle, right) {
            return extend(function (self, locals) {
                return left(self, locals) ? middle(self, locals) : right(self, locals);
            }, {
                constant: left.constant && middle.constant && right.constant
            });
        },

        binaryFn: function (left, fn, right) {
            return extend(function (self, locals) {
                return fn(self, locals, left, right);
            }, {
                constant: left.constant && right.constant
            });
        },

        statements: function () {
            /* jshint -W083 */
            var statements = [];
            while (true) {
                if (this.tokens.length > 0 && !this.peek('}', ')', ';', ']')) { statements.push(this.filterChain()); }
                if (!this.expect(';')) {
                    return (statements.length === 1)
                        ? statements[0]
                        : function $parseStatements(self, locals) {
                            var value,
                                i = 0;

                            for (i = 0; i < statements.length; i += 1) {
                                value = statements[i](self, locals);
                            }

                            return value;
                        };
                }
            }
        },

        filterChain: function () {
            var left = this.expression(),
                token;

            while ((token = this.expect('|'))) {
                left = this.binaryFn(left, token.fn, this.filter());
            }

            return left;
        },

        filter: function () {
            var token = this.expect(),
                fn = this.$filter(token.text),
                argsFn,
                args;

            if (this.peek(':')) {
                argsFn = [];
                args = []; // we can safely reuse the array
                while (this.expect(':')) {
                    argsFn.push(this.expression());
                }
            }

            return valueFn(function $parseFilter(self, locals, input) {
                if (args) {
                    args[0] = input;

                    var i = argsFn.length;

                    while (i) {
                        i -= 1;
                        args[i + 1] = argsFn[i](self, locals);
                    }

                    return fn.apply(undefined, args);
                }

                return fn(input);
            });
        },

        expression: function () {
            return this.assignment();
        },

        assignment: function () {
            var left = this.ternary(),
                right,
                token = this.expect('=');

            if (token) {
                if (!left.assign) {
                    this.throwError('implies assignment but [' + this.text.substring(0, token.index) + '] can not be assigned to', token);
                }

                right = this.ternary();

                return function $parseAssignment(scope, locals) {
                    return left.assign(scope, right(scope, locals), locals);
                };
            }
            return left;
        },

        ternary: function () {
            var left = this.logicalOR(),
                middle,
                token = this.expect('?');

            if (token) {
                middle = this.assignment();
                token = this.expect(':');

                if (token) {
                    return this.ternaryFn(left, middle, this.assignment());
                }

                this.throwError('expected :', token);
                return undefined;
            }

            return left;
        },

        logicalOR: function () {
            var left = this.logicalAND(),
                token;

            while ((token = this.expect('||'))) {
                left = this.binaryFn(left, token.fn, this.logicalAND());
            }
            return left;
        },

        logicalAND: function () {
            var left = this.equality(),
                token = this.expect('&&');

            if (token) {
                left = this.binaryFn(left, token.fn, this.logicalAND());
            }
            return left;
        },

        equality: function () {
            var left = this.relational(),
                token = this.expect('==', '!=', '===', '!==');

            if (token) {
                left = this.binaryFn(left, token.fn, this.equality());
            }
            return left;
        },

        relational: function () {
            var left = this.additive(),
                token = this.expect('<', '>', '<=', '>=');

            if (token) {
                left = this.binaryFn(left, token.fn, this.relational());
            }
            return left;
        },

        additive: function () {
            var left = this.multiplicative(),
                token;

            while ((token = this.expect('+', '-'))) {
                left = this.binaryFn(left, token.fn, this.multiplicative());
            }
            return left;
        },

        multiplicative: function () {
            var left = this.unary(),
                token;

            while ((token = this.expect('*', '/', '%'))) {
                left = this.binaryFn(left, token.fn, this.unary());
            }
            return left;
        },

        unary: function () {
            var token = this.expect('+');

            if (token) {
                return this.primary();
            }

            token = this.expect('-');
            if (token) {
                return this.binaryFn(Parser.ZERO, token.fn, this.unary());
            }

            token = this.expect('!');
            if (token) {
                return this.unaryFn(token.fn, this.unary());
            }

            return this.primary();
        },

        fieldAccess: function (object) {
            var expression = this.text,
                field = this.expect().text,
                getter_fA = getterFn(field, this.options, expression);

            return extend(
                function $parseFieldAccess(scope, locals, self) {
                    return getter_fA(self || object(scope, locals));
                },
                {
                    assign: function (scope, value, locals) {
                        var o = object(scope, locals);
                        if (!o) {
                            o = {};
                            object.assign(scope, o);
                        }
                        return setter(o, field, value, expression);
                    }
                }
            );
        },

        objectIndex: function (obj) {
            var expression = this.text,
                indexFn = this.expression();

            this.consume(']');

            return extend(
                function $parseObjectIndex(self, locals) {
                    var o = obj(self, locals),
                        i = indexFn(self, locals),
                        v;

                    ensureSafeMemberName(i, expression);

                    if (!o) { return undefined; }

                    v = ensureSafeObject(o[i], expression);

                    return v;
                },
                {
                    assign: function (self, value, locals) {
                        var key = ensureSafeMemberName(indexFn(self, locals), expression),
                            o = ensureSafeObject(obj(self, locals), expression);

                        if (!o) {
                            o = {};
                            obj.assign(self, o);
                        }

                        o[key] = value;

                        return value;
                    }
                }
            );
        },

        functionCall: function (fnGetter, contextGetter) {
            var argsFn = [],
                expressionText,
                args;

            if (this.peekToken().text !== ')') {
                do {
                    argsFn.push(this.expression());
                } while (this.expect(','));
            }

            this.consume(')');

            expressionText = this.text;
            // we can safely reuse the array across invocations
            args = argsFn.length ? [] : null;

            return function $parseFunctionCall(scope, locals) {
                var context = contextGetter ? contextGetter(scope, locals) : scope,
                    fn = fnGetter(scope, locals, context) || noop,
                    i = 0,
                    v;

                if (args) {
                    i = argsFn.length;
                    while (i) {
                        i -= 1;
                        args[i] = ensureSafeObject(argsFn[i](scope, locals), expressionText);
                    }
                }

                ensureSafeObject(context, expressionText);
                ensureSafeObject(fn, expressionText);

                // IE stupidity! (IE doesn't have apply for some native functions)
                v = fn.apply ? fn.apply(context, args) : fn(args[0], args[1], args[2], args[3], args[4]);

                return ensureSafeObject(v, expressionText);
            };
        },

        // This is used with json array declaration
        arrayDeclaration: function () {
            var elementFns = [],
                allConstant = true,
                elementFn;

            if (this.peekToken().text !== ']') {
                do {
                    if (this.peek(']')) {
                        // Support trailing commas per ES5.1.
                        break;
                    }

                    elementFn = this.expression();
                    elementFns.push(elementFn);
                    if (!elementFn.constant) {
                        allConstant = false;
                    }
                } while (this.expect(','));
            }

            this.consume(']');

            return extend(
                function $parseArrayLiteral(self, locals) {
                    var array = [],
                        i = 0;
    
                    for (i = 0; i < elementFns.length; i += 1) {
                        array.push(elementFns[i](self, locals));
                    }
                    return array;
                },
                {
                    literal: true,
                    constant: allConstant
                }
            );
        },

        object: function () {
            var keyValues = [],
                allConstant = true,
                token,
                key,
                value;

            if (this.peekToken().text !== '}') {
                do {
                    if (this.peek('}')) {
                        // Support trailing commas per ES5.1.
                        break;
                    }
                    token = this.expect();
                    key = token.string || token.text;

                    this.consume(':');
                    value = this.expression();

                    keyValues.push({
                        key: key,
                        value: value
                    });

                    if (!value.constant) {
                        allConstant = false;
                    }
                } while (this.expect(','));
            }

            this.consume('}');

            return extend(
                function $parseObjectLiteral(self, locals) {
                    var object = {},
                        i = 0,
                        keyValue;
    
                    for (i = 0; i < keyValues.length; i += 1) {
                        keyValue = keyValues[i];
                        object[keyValue.key] = keyValue.value(self, locals);
                    }
    
                    return object;
                }, {
                    literal: true,
                    constant: allConstant
                }
            );
        }
    };

    function $ParseProvider() {

        var cache = createMap(),
            $parseOptions = {
                csp: false
            };

        this.$get = ['$filter', '$sniffer', function ($filter, $sniffer) {
            $parseOptions.csp = $sniffer.csp;

            function wrapSharedExpression(exp) {
                var wrapped = exp;

                if (exp.sharedGetter) {
                    wrapped = function $parseWrapper(self, locals) {
                        return exp(self, locals);
                    };

                    wrapped.literal = exp.literal;
                    wrapped.constant = exp.constant;
                    wrapped.assign = exp.assign;
                }

                return wrapped;
            }

            function oneTimeWatchDelegate(scope, listener, objectEquality, parsedExpression) {
                var lastValue,
                    unwatch = scope.$watch(
                        function oneTimeWatch(scope) {
                            return parsedExpression(scope);
                        },
                        function oneTimeListener(value, old, scope) {
                            lastValue = value;
                            if (_.isFunction(listener)) {
                                listener.apply(this, arguments);
                            }
                            if (isDefined(value)) {
                                scope.$$postDigest(
                                    function () {
                                        if (isDefined(lastValue)) {
                                            unwatch();
                                        }
                                    }
                                );
                            }
                        },
                        objectEquality
                    );

                return unwatch;
            }

            function oneTimeLiteralWatchDelegate(scope, listener, objectEquality, parsedExpression) {

                function isAllDefined(value) {
                    var allDefined = true;
                    forEach(value, function (val) {
                        if (!isDefined(val)) { allDefined = false; }
                    });
                    return allDefined;
                }

                var unwatch = scope.$watch(
                        function oneTimeWatch(scope) {
                            return parsedExpression(scope);
                        },
                        function oneTimeListener(value, old, scope) {
                            if (_.isFunction(listener)) {
                                listener.call(this, value, old, scope);
                            }
                            if (isAllDefined(value)) {
                                scope.$$postDigest(
                                    function () {
                                        if (isAllDefined(value)) { unwatch(); }
                                    }
                                );
                            }
                        },
                        objectEquality
                    );

                return unwatch;
            }

            function constantWatchDelegate(scope, listener, objectEquality, parsedExpression) {
                var unwatch = scope.$watch(
                        function constantWatch(scope) {
                            return parsedExpression(scope);
                        },
                        function constantListener(value, old, scope) {
                            if (_.isFunction(listener)) {
                                listener.apply(this, arguments);
                            }
                            unwatch();
                        },
                        objectEquality
                    );

                return unwatch;
            }

            function addInterceptor(parsedExpression, interceptorFn) {
                if (!interceptorFn) { return parsedExpression; }

                var fn = function interceptedExpression(scope, locals) {
                        var value = parsedExpression(scope, locals),
                            result = interceptorFn(value, scope, locals);

                        // we only return the interceptor's result if the
                        // initial value is defined (for bind-once)
                        return isDefined(value) ? result : value;
                    };
                fn.$$watchDelegate = parsedExpression.$$watchDelegate;
                return fn;
            }

            return function $parse(exp, interceptorFn) {
                var parsedExpression,
                    oneTime,
                    cacheKey,
                    lexer,
                    parser;

                switch (typeof exp) {
                case 'string':
                    cacheKey = exp = exp.trim();

                    parsedExpression = cache[cacheKey];

                    if (!parsedExpression) {
                        if (exp.charAt(0) === ':' && exp.charAt(1) === ':') {
                            oneTime = true;
                            exp = exp.substring(2);
                        }

                        lexer = new Lexer($parseOptions);
                        parser = new Parser(lexer, $filter, $parseOptions);
                        parsedExpression = parser.parse(exp);

                        if (parsedExpression.constant) {
                            parsedExpression.$$watchDelegate = constantWatchDelegate;
                        } else if (oneTime) {
                            //oneTime is not part of the exp passed to the Parser so we may have to
                            //wrap the parsedExpression before adding a $$watchDelegate
                            parsedExpression = wrapSharedExpression(parsedExpression);
                            parsedExpression.$$watchDelegate = parsedExpression.literal
                                ? oneTimeLiteralWatchDelegate
                                : oneTimeWatchDelegate;
                        }

                        cache[cacheKey] = parsedExpression;
                    }
                    return addInterceptor(parsedExpression, interceptorFn);

                case 'function':
                    return addInterceptor(exp, interceptorFn);

                default:
                    return addInterceptor(noop, interceptorFn);
                }
            };
        }];
    }

    function qFactory(nextTick, exceptionHandler) {
        var $qMinErr = minErr('$q', TypeError);

        function callOnce(self, resolveFn, rejectFn) {
            var called = false;

            function wrap(fn) {
                return function (value) {
                    if (called) { return; }
                    called = true;
                    fn.call(self, value);
                };
            }

            return [wrap(resolveFn), wrap(rejectFn)];
        }

        //Faster, more basic than angular.bind http://jsperf.com/angular-bind-vs-custom-vs-native
        function simpleBind(context, fn) {
            return function (value) {
                fn.call(context, value);
            };
        }

        function processQueue(state) {
            var fn,
                promise,
                pending = state.pending,
                i = 0,
                ii = pending.length;

            state.processScheduled = false;
            state.pending = undefined;

            for (i = 0; i < ii; i += 1) {
                promise = pending[i][0];
                fn = pending[i][state.status];
                try {
                    if (_.isFunction(fn)) {
                        promise.resolve(fn(state.value));
                    } else if (state.status === 1) {
                        promise.resolve(state.value);
                    } else {
                        promise.reject(state.value);
                    }
                } catch (e) {
                    promise.reject(e);
                    exceptionHandler(e);
                }
            }
        }

        function scheduleProcessQueue(state) {
            if (state.processScheduled || !state.pending) { return; }
            state.processScheduled = true;
            nextTick(function () {
                processQueue(state);
            });
        }

        function Deferred() {
            this.promise = new Promise();
            //Necessary to support unbound execution :/
            this.resolve = simpleBind(this, this.resolve);
            this.reject = simpleBind(this, this.reject);
            this.notify = simpleBind(this, this.notify);
        }

        Deferred.prototype = {

            resolve: function (val) {
                if (this.promise.$$state.status) { return; }
                if (val === this.promise) {
                    this.$$reject(
                        $qMinErr(
                            'qcycle',
                            "Expected promise to be resolved with value other than itself '{0}'",
                            val
                        )
                    );
                } else {
                    this.$$resolve(val);
                }
            },

            $$resolve: function (val) {
                var then, fns;

                fns = callOnce(this, this.$$resolve, this.$$reject);
                try {
                    if ((_.isObject(val) || _.isFunction(val))) { then = val && val.then; }
                    if (_.isFunction(then)) {
                        this.promise.$$state.status = -1;
                        then.call(val, fns[0], fns[1], this.notify);
                    } else {
                        this.promise.$$state.value = val;
                        this.promise.$$state.status = 1;
                        scheduleProcessQueue(this.promise.$$state);
                    }
                } catch (e) {
                    fns[1](e);
                    exceptionHandler(e);
                }
            },

            reject: function (reason) {
                if (this.promise.$$state.status) { return; }
                this.$$reject(reason);
            },

            $$reject: function (reason) {
                this.promise.$$state.value = reason;
                this.promise.$$state.status = 2;
                scheduleProcessQueue(this.promise.$$state);
            },

            notify: function (progress) {
                var callbacks = this.promise.$$state.pending;

                if ((this.promise.$$state.status <= 0) && callbacks && callbacks.length) {
                    nextTick(
                        function () {
                            var callback,
                                result,
                                i = 0;

                            for (i = 0; i < callbacks.length; i += 1) {
                                result = callbacks[i][0];
                                callback = callbacks[i][3];
                                try {
                                    result.notify(_.isFunction(callback) ? callback(progress) : progress);
                                } catch (e) {
                                    exceptionHandler(e);
                                }
                            }
                        }
                    );
                }
            }
        };

        var defer = function () {
                return new Deferred();
            },
            reject = function (reason) {
                var result = new Deferred();
                result.reject(reason);
                return result.promise;
            },
            makePromise = function makePromise(value, resolved) {
                var result = new Deferred();
                if (resolved) {
                    result.resolve(value);
                } else {
                    result.reject(value);
                }
                return result.promise;
            },
            handleCallback = function handleCallback(value, isResolved, callback) {
                var callbackOutput = null;
                try {
                    if (_.isFunction(callback)) { callbackOutput = callback(); }
                } catch (e) {
                    return makePromise(e, false);
                }
                if (isPromiseLike(callbackOutput)) {
                    return callbackOutput.then(function () {
                        return makePromise(value, isResolved);
                    }, function (error) {
                        return makePromise(error, false);
                    });
                }

                return makePromise(value, isResolved);
            },
            when = function (value, callback, errback, progressBack) {
                var result = new Deferred();
                result.resolve(value);
                return result.promise.then(callback, errback, progressBack);
            },
            $Q = function Q(resolver) {

                if (!_.isFunction(resolver)) {
                    throw $qMinErr('norslvr', "Expected resolverFn, got '{0}'", resolver);
                }

                if (!(this instanceof Q)) {
                    // More useful when $Q is the Promise itself.
                    return new Q(resolver);
                }

                var deferred = new Deferred();

                function resolveFn(value) {
                    deferred.resolve(value);
                }

                function rejectFn(reason) {
                    deferred.reject(reason);
                }

                resolver(resolveFn, rejectFn);

                return deferred.promise;
            };

        function all(promises) {
            var deferred = new Deferred(),
                counter = 0,
                results = _.isArray(promises) ? [] : {};

            forEach(
                promises,
                function (promise, key) {
                    counter += 1;

                    when(promise).then(
                        function (value) {
                            if (results.hasOwnProperty(key)) { return; }
                            results[key] = value;
                            counter -= 1;
                            if (!counter) { deferred.resolve(results); }
                        },
                        function (reason) {
                            if (results.hasOwnProperty(key)) { return; }
                            deferred.reject(reason);
                        }
                    );
                }
            );

            if (counter === 0) {
                deferred.resolve(results);
            }

            return deferred.promise;
        }

        function Promise() {
            this.$$state = {
                status: 0
            };
        }

        Promise.prototype = {

            then: function (onFulfilled, onRejected, progressBack) {

                var result = new Deferred();

                this.$$state.pending = this.$$state.pending || [];
                this.$$state.pending.push([result, onFulfilled, onRejected, progressBack]);
                if (this.$$state.status > 0) { scheduleProcessQueue(this.$$state); }

                return result.promise;
            },

            "catch": function (callback) {
                return this.then(null, callback);
            },

            "finally": function (callback, progressBack) {
                return this.then(function (value) {
                    return handleCallback(value, true, callback);
                }, function (error) {
                    return handleCallback(error, false, callback);
                }, progressBack);
            }
        };

        $Q.defer = defer;
        $Q.reject = reject;
        $Q.when = when;
        $Q.all = all;

        return $Q;
    }

    function $QProvider() {
        msos.console.debug('ng - $QProvider -> start');

        this.$get = ['$rootScope', '$exceptionHandler', function ($rootScope, $exceptionHandler) {
            return qFactory(function (callback) {
                $rootScope.$evalAsync(callback);
            }, $exceptionHandler);
        }];

        msos.console.debug('ng - $QProvider -> done!');
    }

    function $$QProvider() {
        msos.console.debug('ng - $$QProvider -> start');

        this.$get = ['$browser', '$exceptionHandler', function ($browser, $exceptionHandler) {
            return qFactory(function (callback) {
                $browser.defer(callback);
            }, $exceptionHandler);
        }];

        msos.console.debug('ng - $$QProvider -> done!');
    }

    function $$RAFProvider() { //rAF
        this.$get = ['$window', '$timeout', function ($window, $timeout) {
            var requestAnimationFrame = $window.requestAnimationFrame || $window.webkitRequestAnimationFrame || $window.mozRequestAnimationFrame,
                cancelAnimationFrame = $window.cancelAnimationFrame || $window.webkitCancelAnimationFrame || $window.mozCancelAnimationFrame || $window.webkitCancelRequestAnimationFrame,
                rafSupported = !!requestAnimationFrame,
                raf = rafSupported
                    ? function (fn) {
                        var id = requestAnimationFrame(fn);
                        return function () {
                            cancelAnimationFrame(id);
                        };
                    }
                    : function (fn) {
                        var timer = $timeout(fn, 16.66, false); // 1000 / 60 = 16.666
                        return function () {
                            $timeout.cancel(timer);
                        };
                    };

            raf.supported = rafSupported;

            return raf;
        }];
    }

    function $RootScopeProvider() {
        var TTL = 10,
            $rootScopeMinErr = minErr('$rootScope'),
            lastDirtyWatch = null,
            applyAsyncId = null,
            temp_rs = 'ng - $RootScopeProvider';

        this.digestTtl = function (value) {
            if (arguments.length) {
                TTL = value;
            }
            return TTL;
        };

        this.$get = ['$injector', '$exceptionHandler', '$parse', '$browser', function ($injector, $exceptionHandler, $parse, $browser) {

            var $rootScope_P;

            msos.console.debug(temp_rs + ' - $get -> start.');

            function decrementListenerCount(current, count, name) {

                var temp_dl = temp_rs + ' - $get - decrementListenerCount -> ';

                msos.console.debug(temp_dl + 'called, name: ' + name + ', count: ' + count);

                do {
                    current.$$listenerCount[name] -= count;

                    if (current.$$listenerCount[name] === 0) {
                        delete current.$$listenerCount[name];
                        msos.console.debug(temp_dl + 'done, scope: ' + current.$id);
                    }
                } while ((current = current.$parent));
            }

            function initWatchVal() {}

            function flushApplyAsync() {
                var queue = $rootScope_P.$$applyAsyncQueue;

                while (queue.length) {
                    try {
                        queue.shift()();
                    } catch(e) {
                        $exceptionHandler(e);
                    }
                }

                applyAsyncId = null;
            }

            function scheduleApplyAsync() {
                if (applyAsyncId === null) {
                    applyAsyncId = $browser.defer(
                        function () {
                            $rootScope_P.$apply(flushApplyAsync);
                        }
                    );
                }
            }

            function Scope() {
                this.$id = nextUid();
                this.$$phase = this.$parent = this.$$watchers = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = null;
                this['this'] = this.$root = this;
                this.$$destroyed = false;
                this.$$asyncQueue = [];
                this.$$postDigestQueue = [];
                this.$$listeners = {};
                this.$$listenerCount = {};
                this.$$isolateBindings = {};
                this.$$applyAsyncQueue = [];
            }

            Scope.prototype = {

                constructor: Scope,

                $new: function (isolate) {
                    var child;

                    if (isolate) {
                        child = new Scope();
                        child.$root = this.$root;
                        // ensure that there is just one async queue per $rootScope and its children
                        child.$$asyncQueue = this.$$asyncQueue;
                        child.$$postDigestQueue = this.$$postDigestQueue;
                    } else {
                        // Only create a child scope class if somebody asks for one,
                        // but cache it to allow the VM to optimize lookups.
                        if (!this.$$ChildScope) {
                            this.$$ChildScope = function ChildScope() {
                                this.$$watchers = this.$$nextSibling = this.$$childHead = this.$$childTail = null;
                                this.$$listeners = {};
                                this.$$listenerCount = {};
                                this.$id = nextUid();
                                this.$$ChildScope = null;
                            };
                            this.$$ChildScope.prototype = this;
                        }
                        child = new this.$$ChildScope();
                    }
                    child['this'] = child;
                    child.$parent = this;
                    child.$$prevSibling = this.$$childTail;
                    if (this.$$childHead) {
                        this.$$childTail.$$nextSibling = child;
                        this.$$childTail = child;
                    } else {
                        this.$$childHead = this.$$childTail = child;
                    }
                    return child;
                },

                $watch: function (watchExp, listener, objectEquality) {

                    var scope = this,
                        array = [],
                        watcher = {},
                        get = $parse(watchExp);

                    if (get.$$watchDelegate) {
                        return get.$$watchDelegate(this, listener, objectEquality, get);
                    }

                    array = scope.$$watchers;

                    watcher = {
                        fn: listener,
                        last: initWatchVal,
                        get: get,
                        exp: watchExp,
                        eq: !!objectEquality
                    };

                    lastDirtyWatch = null;

                    if (!_.isFunction(listener)) {
                        watcher.fn = noop;
                    }

                    if (!array) {
                        array = scope.$$watchers = [];
                    }
                    // we use unshift since we use a while loop in $digest for speed.
                    // the while loop reads in reverse order.
                    array.unshift(watcher);

                    return function deregisterWatch() {
                        arrayRemove(array, watcher);
                        lastDirtyWatch = null;
                    };
                },

                $watchGroup: function (watchExpressions, listener) {
                    var oldValues = new Array(watchExpressions.length),
                        newValues = new Array(watchExpressions.length),
                        deregisterFns = [],
                        self = this,
                        changeReactionScheduled = false,
                        firstRun = true,
                        shouldCall = true;

                    function watchGroupAction() {
                        changeReactionScheduled = false;

                        if (firstRun) {
                            firstRun = false;
                            listener(newValues, newValues, self);
                        } else {
                            listener(newValues, oldValues, self);
                        }
                    }

                    if (!watchExpressions.length) {
                        // No expressions means we call the listener ASAP
                        self.$evalAsync(function () {
                            if (shouldCall) { listener(newValues, newValues, self); }
                        });

                        return function deregisterWatchGroup() {
                            shouldCall = false;
                        };
                    }

                    if (watchExpressions.length === 1) {
                        // Special case size of one
                        return this.$watch(watchExpressions[0], function watchGroupAction(value, oldValue, scope) {
                            newValues[0] = value;
                            oldValues[0] = oldValue;
                            listener(newValues, (value === oldValue) ? newValues : oldValues, scope);
                        });
                    }

                    forEach(watchExpressions, function (expr, i) {
                        var unwatchFn = self.$watch(expr, function watchGroupSubAction(value, oldValue) {
                            newValues[i] = value;
                            oldValues[i] = oldValue;
                            if (!changeReactionScheduled) {
                                changeReactionScheduled = true;
                                self.$evalAsync(watchGroupAction);
                            }
                        });
                        deregisterFns.push(unwatchFn);
                    });

                    return function deregisterWatchGroup() {
                        while (deregisterFns.length) {
                            deregisterFns.shift()();
                        }
                    };
                },

                $watchCollection: function (obj, listener) {
                    var self = this,
                        newValue,
                        oldValue,
                        veryOldValue,
                        trackVeryOldValue = (listener.length > 1),
                        changeDetected = 0,
                        changeDetector,
                        internalArray = [],
                        internalObject = {},
                        initRun = true,
                        oldLength = 0;

                    function $watchCollectionInterceptor(_value) {
                        newValue = _value;
                        var newLength,
                            key,
                            bothNaN,
                            newItem,
                            oldItem,
                            i = 0;

                        if (!_.isObject(newValue)) { // if primitive
                            if (oldValue !== newValue) {
                                oldValue = newValue;
                                changeDetected += 1;
                            }
                        } else if (isArrayLike(newValue)) {
                            if (oldValue !== internalArray) {
                                // we are transitioning from something which was not an array into array.
                                oldValue = internalArray;
                                oldLength = oldValue.length = 0;
                                changeDetected += 1;
                            }

                            newLength = newValue.length;

                            if (oldLength !== newLength) {
                                // if lengths do not match we need to trigger change notification
                                changeDetected += 1;
                                oldValue.length = oldLength = newLength;
                            }
                            // copy the items to oldValue and look for changes.
                            for (i = 0; i < newLength; i += 1) {
                                oldItem = oldValue[i];
                                newItem = newValue[i];

                                bothNaN = (oldItem !== oldItem) && (newItem !== newItem);
                                if (!bothNaN && (oldItem !== newItem)) {
                                    changeDetected += 1;
                                    oldValue[i] = newItem;
                                }
                            }
                        } else {
                            if (oldValue !== internalObject) {
                                // we are transitioning from something which was not an object into object.
                                oldValue = internalObject = {};
                                oldLength = 0;
                                changeDetected += 1;
                            }
                            // copy the items to oldValue and look for changes.
                            newLength = 0;
                            for (key in newValue) {
                                if (newValue.hasOwnProperty(key)) {
                                    newLength += 1;
                                    newItem = newValue[key];
                                    oldItem = oldValue[key];

                                    if (oldValue.hasOwnProperty(key)) {
                                        bothNaN = (oldItem !== oldItem) && (newItem !== newItem);
                                        if (!bothNaN && (oldItem !== newItem)) {
                                            changeDetected += 1;
                                            oldValue[key] = newItem;
                                        }
                                    } else {
                                        oldLength += 1;
                                        oldValue[key] = newItem;
                                        changeDetected += 1;
                                    }
                                }
                            }
                            if (oldLength > newLength) {
                                // we used to have more keys, need to find them and destroy them.
                                changeDetected += 1;
                                for (key in oldValue) {
                                    if (!newValue.hasOwnProperty(key)) {
                                        oldLength -= 1;
                                        delete oldValue[key];
                                    }
                                }
                            }
                        }
                        return changeDetected;
                    }

                    function $watchCollectionAction() {
                        var i = 0,
                            key;

                        if (initRun) {
                            initRun = false;
                            listener(newValue, newValue, self);
                        } else {
                            listener(newValue, veryOldValue, self);
                        }

                        // make a copy for the next time a collection is changed
                        if (trackVeryOldValue) {
                            if (!_.isObject(newValue)) {
                                //primitive
                                veryOldValue = newValue;
                            } else if (isArrayLike(newValue)) {
                                veryOldValue = new Array(newValue.length);
                                for (i = 0; i < newValue.length; i += 1) {
                                    veryOldValue[i] = newValue[i];
                                }
                            } else { // if object
                                veryOldValue = {};
                                for (key in newValue) {
                                    if (hasOwnProperty.call(newValue, key)) {
                                        veryOldValue[key] = newValue[key];
                                    }
                                }
                            }
                        }
                    }

                    changeDetector = $parse(obj, $watchCollectionInterceptor);

                    return this.$watch(changeDetector, $watchCollectionAction);
                },

                $digest: function () {
                    var watch,
                        value,
                        last,
                        watchers,
                        check_nan,
                        asyncQueue = this.$$asyncQueue,
                        postDigestQueue = this.$$postDigestQueue,
                        length,
                        dirty,
                        ttl = TTL,
                        next,
                        current,
                        target = this,
                        watchLog = [],
                        logIdx,
                        logMsg,
                        asyncTask;

                    if (msos.config.verbose) {
                        msos.console.debug(temp_rs + ' - $get - Scope - $digest -> start.');
                    }

                    if ($rootScope_P.$$phase) {
                        // Do I really need to kill it?
                        throw $rootScopeMinErr('inprog', '{0} already in progress', $rootScope_P.$$phase);
                    }

                    $rootScope_P.$$phase = '$digest';

                    // Check for changes to browser url that happened in sync before the call to $digest
                    $browser.$$checkUrlChange();

                    if (this === $rootScope_P && applyAsyncId !== null) {
                        // If this is the root scope, and $applyAsync has scheduled a deferred $apply(), then
                        // cancel the scheduled $apply and flush the queue of expressions to be evaluated.
                        $browser.defer.cancel(applyAsyncId);
                        flushApplyAsync();
                    }

                    lastDirtyWatch = null;

                    // "while dirty" loop
                    do {
                        dirty = false;
                        current = target;

                        while (asyncQueue.length) {
                            try {
                                asyncTask = asyncQueue.shift();
                                asyncTask.scope.$eval(asyncTask.expression);
                            } catch (e) {
                                $exceptionHandler(e);
                            }
                            lastDirtyWatch = null;
                        }

                        // "traverse the scopes" loop
                        traverseScopesLoop: do {
                            watchers = current.$$watchers;
                            if (watchers) {
                                // process our watches
                                length = watchers.length;

                                while (length) {
                                    length -= 1;
                                    try {
                                        watch = watchers[length];
                                        // Most common watches are on primitives, in which case we can short
                                        // circuit it with === operator, only when === fails do we use .equals
                                        if (watch) {
                                            value = watch.get(current);
                                            last = watch.last;
                                            check_nan = (typeof value === 'number' && typeof last === 'number' && isNaN(value) && isNaN(last));
                                            if (value !== last && !(watch.eq ? equals(value, last) : check_nan)) {
                                                dirty = true;
                                                lastDirtyWatch = watch;
                                                watch.last = watch.eq ? copy(value, null) : value;
                                                watch.fn(value, ((last === initWatchVal) ? value : last), current);
                                                if (ttl < 5) {
                                                    logIdx = 4 - ttl;
                                                    if (!watchLog[logIdx]) { watchLog[logIdx] = []; }
                                                    logMsg = (_.isFunction(watch.exp)) ? 'fn: ' + (watch.exp.name || watch.exp.toString()) : watch.exp;
                                                    logMsg += '; newVal: ' + toJson(value) + '; oldVal: ' + toJson(last);
                                                    watchLog[logIdx].push(logMsg);
                                                }
                                            } else if (watch === lastDirtyWatch) {
                                                // If the most recently dirty watcher is now clean, short circuit since the remaining watchers
                                                // have already been tested.
                                                dirty = false;
                                                break traverseScopesLoop;
                                            }
                                        }
                                    } catch (e) {
                                        $exceptionHandler(e);
                                    }
                                }
                            }

                            if (!(next = (current.$$childHead || (current !== target && current.$$nextSibling)))) {
                                while (current !== target && !(next = current.$$nextSibling)) {
                                    current = current.$parent;
                                }
                            }
                        } while ((current = next));

                        // `break traverseScopesLoop;` takes us to here
                        if ((dirty || asyncQueue.length) && !(ttl--)) {
                            // clearPhase
                            $rootScope_P.$$phase = null;
                            // If I need to kill it, why bother setting to null?
                            throw $rootScopeMinErr('infdig', '{0} $digest() iterations reached. Aborting!\n' + 'Watchers fired in the last 5 iterations: {1}', TTL, toJson(watchLog));
                        }

                    } while (dirty || asyncQueue.length);

                    // clearPhase
                    $rootScope_P.$$phase = null;

                    while (postDigestQueue.length) {
                        try {
                            postDigestQueue.shift()();
                        } catch (e) {
                            $exceptionHandler(e);
                        }
                    }

                    if (msos.config.verbose) {
                        msos.console.debug(temp_rs + ' - $get - Scope - $digest -> done!');
                    }
                },

                $destroy: function () {

                    if (msos.config.verbose) {
                        msos.console.debug(temp_rs + ' - $get - Scope - $destroy -> called.');
                    }

                    // we can't destroy the root scope or a scope that has been already destroyed
                    if (this.$$destroyed) { return; }
                    var parent = this.$parent,
                        eventName;

                    this.$broadcast('$destroy');
                    this.$$destroyed = true;

                    if (this === $rootScope_P) { return; }

                    for (eventName in this.$$listenerCount) {
                        decrementListenerCount(this, this.$$listenerCount[eventName], eventName);
                    }

                    // sever all the references to parent scopes (after this cleanup, the current scope should
                    // not be retained by any of our references and should be eligible for garbage collection)
                    if (parent.$$childHead === this) { parent.$$childHead = this.$$nextSibling; }
                    if (parent.$$childTail === this) { parent.$$childTail = this.$$prevSibling; }
                    if (this.$$prevSibling) { this.$$prevSibling.$$nextSibling = this.$$nextSibling; }
                    if (this.$$nextSibling) { this.$$nextSibling.$$prevSibling = this.$$prevSibling; }

                    this.$parent = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = this.$root = null;

                    // don't reset these to null in case some async task tries to register a listener/watch/task
                    this.$$listeners = {};
                    this.$$watchers = this.$$asyncQueue = this.$$postDigestQueue = [];

                    // prevent NPEs since these methods have references to properties we nulled out
                    this.$destroy = this.$digest = this.$apply = noop;
                    this.$on = this.$watch = this.$watchGroup = function () {
                        return noop;
                    };
                },

                $eval: function (expr, locals) {
                    return $parse(expr)(this, locals);
                },

                $evalAsync: function (expr) {
                    // if we are outside of an $digest loop and this is the first time we are scheduling async
                    // task also schedule async auto-flush
                    if (!$rootScope_P.$$phase && !$rootScope_P.$$asyncQueue.length) {
                        $browser.defer(function () {
                            if ($rootScope_P.$$asyncQueue.length) {
                                $rootScope_P.$digest();
                            }
                        });
                    }

                    this.$$asyncQueue.push({
                        scope: this,
                        expression: expr
                    });
                },

                $$postDigest: function (fn) {
                    this.$$postDigestQueue.push(fn);
                },

                $apply: function (expr) {
                    var temp_ap = ' - $get - Scope - $apply -> ';

                    msos.console.debug(temp_rs + temp_ap + 'start.');

                    try {

                        if (!$rootScope_P.$$phase) {
                            $rootScope_P.$$phase = '$apply';
                        } else {
                            msos.console.warn(temp_rs + temp_ap + 'already running, phase: ' + $rootScope_P.$$phase);
                        }

                        msos.console.debug(temp_rs + temp_ap + 'done, phase: ' + $rootScope_P.$$phase);

                        return this.$eval(expr);

                    } catch (e) {

                        $exceptionHandler(e);

                    } finally {

                        // clearPhase
                        $rootScope_P.$$phase = null;

                        try {
                            $rootScope_P.$digest();
                        } catch (e) {
                            $exceptionHandler(e);
                            throw e;
                        }
                    }
                    return undefined;
                },

                $applyAsync: function (expr) {
                    var scope = this;

                    function $applyAsyncExpression() {
                        scope.$eval(expr);
                    }

                    if (expr) { $rootScope_P.$$applyAsyncQueue.push($applyAsyncExpression); }

                    scheduleApplyAsync();
                },

                $on: function (name, listener) {
                    var namedListeners = this.$$listeners[name],
                        current,
                        self;

                    if (!namedListeners) {
                        this.$$listeners[name] = namedListeners = [];
                    }

                    namedListeners.push(listener);

                    current = this;

                    do {
                        if (!current.$$listenerCount[name]) {
                            current.$$listenerCount[name] = 0;
                        }
                        current.$$listenerCount[name] += 1;
                    } while ((current = current.$parent));

                    self = this;

                    return function () {
                        namedListeners[_.indexOf(namedListeners, listener)] = null;
                        decrementListenerCount(self, 1, name);
                    };
                },

                $emit: function (name, args) {
                    var empty = [],
                        namedListeners, scope = this,
                        stopPropagation = false,
                        event = {
                            name: name,
                            targetScope: scope,
                            stopPropagation: function () {
                                stopPropagation = true;
                            },
                            preventDefault: function () {
                                event.defaultPrevented = true;
                            },
                            defaultPrevented: false
                        },
                        listenerArgs = concat([event], arguments, 1),
                        i,
                        length;

                    do {
                        namedListeners = scope.$$listeners[name] || empty;
                        event.currentScope = scope;
                        for (i = 0, length = namedListeners.length; i < length; i += 1) {

                            // if listeners were deregistered, defragment the array
                            if (!namedListeners[i]) {
                                namedListeners.splice(i, 1);
                                i -= 1;
                                length -= 1;
                                continue;
                            }
                            try {
                                //allow all listeners attached to the current scope to run
                                namedListeners[i].apply(null, listenerArgs);
                            } catch (e) {
                                $exceptionHandler(e);
                            }
                        }
                        //if any listener on the current scope stops propagation, prevent bubbling
                        if (stopPropagation) {
                            event.currentScope = null;
                            return event;
                        }
                        //traverse upwards
                        scope = scope.$parent;
                    } while (scope);

                    event.currentScope = null;

                    return event;
                },

                $broadcast: function (name, args) {
                    var target = this,
                        current = target,
                        next = target,
                        event = {
                            name: name,
                            targetScope: target,
                            preventDefault: function () {
                                event.defaultPrevented = true;
                            },
                            defaultPrevented: false
                        },
                        listenerArgs,
                        listeners,
                        i,
                        length;

                    if (!target.$$listenerCount[name]) { return event; }

                    listenerArgs = concat([event], arguments, 1);

                    //down while you can, then up and next sibling or up and next sibling until back at root
                    while ((current = next)) {
                        event.currentScope = current;
                        listeners = current.$$listeners[name] || [];
                        for (i = 0, length = listeners.length; i < length; i += 1) {
                            // if listeners were deregistered, defragment the array
                            if (!listeners[i]) {
                                listeners.splice(i, 1);
                                i -= 1;
                                length -= 1;
                                continue;
                            }

                            try {
                                listeners[i].apply(null, listenerArgs);
                            } catch (e) {
                                $exceptionHandler(e);
                            }
                        }

                        if (!(next = ((current.$$listenerCount[name] && current.$$childHead) || (current !== target && current.$$nextSibling)))) {
                            while (current !== target && !(next = current.$$nextSibling)) {
                                current = current.$parent;
                            }
                        }
                    }

                    event.currentScope = null;
                    return event;
                }
            };

            // Notice the $rootScope_P, (keeping it real!)
            $rootScope_P = new Scope();

            msos.console.debug(temp_rs + ' - $get -> done!');

            return $rootScope_P;
        }];
    }

    function $$SanitizeUriProvider() {
        var aHrefSanitizationWhitelist = /^\s*(https?|ftp|mailto|tel|file):/,
            imgSrcSanitizationWhitelist = /^\s*((https?|ftp|file|blob):|data:image\/)/;

        msos.console.debug('ng - $$SanitizeUriProvider -> start.');

        this.aHrefSanitizationWhitelist = function (regexp) {
            if (isDefined(regexp)) {
                aHrefSanitizationWhitelist = regexp;
                return this;
            }
            return aHrefSanitizationWhitelist;
        };

        this.imgSrcSanitizationWhitelist = function (regexp) {
            if (isDefined(regexp)) {
                imgSrcSanitizationWhitelist = regexp;
                return this;
            }
            return imgSrcSanitizationWhitelist;
        };

        this.$get = function () {
            return function sanitizeUri(uri, isImage) {
                var regex = isImage ? imgSrcSanitizationWhitelist : aHrefSanitizationWhitelist,
                    normalizedVal;

                // NOTE: urlResolve() doesn't support IE < 8 so we don't sanitize for that case.
                if (!msie || msie >= 8) {
                    normalizedVal = urlResolve(uri).href;
                    if (normalizedVal !== '' && !normalizedVal.match(regex)) {
                        return 'unsafe:' + normalizedVal;
                    }
                }
                return uri;
            };
        };

        msos.console.debug('ng - $$SanitizeUriProvider -> done!');
    }

    $sceMinErr = minErr('$sce');

    // Helper functions follow.
    // Copied from:
    // http://docs.closure-library.googlecode.com/git/closure_goog_string_string.js.source.html#line962
    // Prereq: s is a string.
    function escapeForRegexp(s) {
        return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
        replace(/\x08/g, '\\x08');
    }

    function adjustMatcher(matcher) {
        if (matcher === 'self') {
            return matcher;
        }

        if (_.isString(matcher)) {
            // Strings match exactly except for 2 wildcards - '*' and '**'.
            // '*' matches any character except those from the set ':/.?&'.
            // '**' matches any character (like .* in a RegExp).
            // More than 2 *'s raises an error as it's ill defined.
            if (matcher.indexOf('***') > -1) {
                throw $sceMinErr('iwcard', 'Illegal sequence *** in string matcher.  String: {0}', matcher);
            }
            matcher = escapeForRegexp(matcher).
            replace('\\*\\*', '.*').
            replace('\\*', '[^:/.?&;]*');
            return new RegExp('^' + matcher + '$');
        }

        if (_.isRegExp(matcher)) {
            // The only other type of matcher allowed is a Regexp.
            // Match entire URL / disallow partial matches.
            // Flags are reset (i.e. no global, ignoreCase or multiline)
            return new RegExp('^' + matcher.source + '$');
        }

        throw $sceMinErr('imatcher', 'Matchers may only be "self", string patterns or RegExp objects');
    }

    function adjustMatchers(matchers) {
        var adjustedMatchers = [];
        if (isDefined(matchers)) {
            forEach(matchers, function (matcher) {
                adjustedMatchers.push(adjustMatcher(matcher));
            });
        }
        return adjustedMatchers;
    }

    function $SceDelegateProvider() {

        this.SCE_CONTEXTS = SCE_CONTEXTS;

        // Resource URLs can also be trusted by policy.
        var resourceUrlWhitelist = ['self'],
            resourceUrlBlacklist = [],
            temp_sd = 'ng - $SceDelegateProvider';

        msos.console.debug(temp_sd + ' -> start.');

        this.resourceUrlWhitelist = function (value) {
            if (arguments.length) {
                resourceUrlWhitelist = adjustMatchers(value);
            }
            return resourceUrlWhitelist;
        };

        this.resourceUrlBlacklist = function (value) {
            if (arguments.length) {
                resourceUrlBlacklist = adjustMatchers(value);
            }
            return resourceUrlBlacklist;
        };

        this.$get = ['$injector', function ($injector) {

            msos.console.debug(temp_sd + ' - $get -> start.');

            var htmlSanitizer = function htmlSanitizer(html) {
                    throw $sceMinErr('unsafe', 'Attempting to use an unsafe value in a safe context.');
                },
                trustedValueHolderBase,
                byType = {};

            if ($injector.has('$sanitize')) {
                htmlSanitizer = $injector.get('$sanitize');
            }

            function matchUrl(matcher, parsedUrl) {
                if (matcher === 'self') {
                    return urlIsSameOrigin(parsedUrl);
                }
                // definitely a regex.  See adjustMatchers()
                return !!matcher.exec(parsedUrl.href);
            }

            function isResourceUrlAllowedByPolicy(url) {
                var parsedUrl = urlResolve(url.toString()),
                    i,
                    n,
                    allowed = false;

                // Ensure that at least one item from the whitelist allows this url.
                for (i = 0, n = resourceUrlWhitelist.length; i < n; i += 1) {
                    if (matchUrl(resourceUrlWhitelist[i], parsedUrl)) {
                        allowed = true;
                        break;
                    }
                }
                if (allowed) {
                    // Ensure that no item from the blacklist blocked this url.
                    for (i = 0, n = resourceUrlBlacklist.length; i < n; i += 1) {
                        if (matchUrl(resourceUrlBlacklist[i], parsedUrl)) {
                            allowed = false;
                            break;
                        }
                    }
                }
                return allowed;
            }

            function generateHolderType(Base) {
                var holderType = function TrustedValueHolderType(trustedValue) {
                        this.$$unwrapTrustedValue = function () {
                            return trustedValue;
                        };
                    };

                if (Base) {
                    holderType.prototype = new Base();
                }

                holderType.prototype.valueOf = function sceValueOf() {
                    return this.$$unwrapTrustedValue();
                };

                holderType.prototype.toString = function sceToString() {
                    return this.$$unwrapTrustedValue().toString();
                };

                return holderType;
            }

            trustedValueHolderBase = generateHolderType();

            byType[SCE_CONTEXTS.HTML] = generateHolderType(trustedValueHolderBase);
            byType[SCE_CONTEXTS.CSS] = generateHolderType(trustedValueHolderBase);
            byType[SCE_CONTEXTS.URL] = generateHolderType(trustedValueHolderBase);
            byType[SCE_CONTEXTS.JS] = generateHolderType(trustedValueHolderBase);
            byType[SCE_CONTEXTS.RESOURCE_URL] = generateHolderType(byType[SCE_CONTEXTS.URL]);

            function trustAs(type, trustedValue) {
                var Constructor = (byType.hasOwnProperty(type) ? byType[type] : null);
                if (!Constructor) {
                    throw $sceMinErr('icontext', 'Attempted to trust a value in invalid context. Context: {0}; Value: {1}', type, trustedValue);
                }
                if (trustedValue === null || trustedValue === undefined || trustedValue === '') {
                    return trustedValue;
                }
                // All the current contexts in SCE_CONTEXTS happen to be strings.  In order to avoid trusting
                // mutable objects, we ensure here that the value passed in is actually a string.
                if (typeof trustedValue !== 'string') {
                    throw $sceMinErr('itype', 'Attempted to trust a non-string value in a content requiring a string: Context: {0}', type);
                }
                return new Constructor(trustedValue);
            }

            function valueOf(maybeTrusted) {
                if (maybeTrusted instanceof trustedValueHolderBase) {
                    return maybeTrusted.$$unwrapTrustedValue();
                }

                return maybeTrusted;
            }

            function getTrusted(type, maybeTrusted) {
                var temp_gt = ' - $get - getTrusted -> ',
                    constructor;

                msos.console.debug(temp_sd + temp_gt + 'start, type: ' + type + (maybeTrusted ? ', context: ' + maybeTrusted : ''));

                if (maybeTrusted === null || maybeTrusted === undefined || maybeTrusted === '') {
                    msos.console.debug(temp_sd + temp_gt + 'done, for: ' + (maybeTrusted === null ? 'null' : 'undefined'));
                    return maybeTrusted;
                }

                constructor = (byType.hasOwnProperty(type) ? byType[type] : null);

                if (constructor && maybeTrusted instanceof constructor) {
                    msos.console.debug(temp_sd + temp_gt + 'done, constructor');
                    return maybeTrusted.$$unwrapTrustedValue();
                }
                // If we get here, then we may only take one of two actions.
                // 1. sanitize the value for the requested type, or
                // 2. throw an exception.
                if (type === SCE_CONTEXTS.RESOURCE_URL) {
                    if (isResourceUrlAllowedByPolicy(maybeTrusted)) {
                        msos.console.debug(temp_sd + temp_gt + 'done, policy');
                        return maybeTrusted;
                    }

                    throw $sceMinErr('insecurl', 'Blocked loading resource from url not allowed by $sceDelegate policy.  URL: {0}', maybeTrusted.toString());
                }

                if (type === SCE_CONTEXTS.HTML) {
                    msos.console.debug(temp_sd + temp_gt + 'done, sanitizer');
                    return htmlSanitizer(maybeTrusted);
                }

                throw $sceMinErr('unsafe', 'Attempting to use an unsafe value in a safe context.');
            }

            msos.console.debug(temp_sd + ' - $get -> done!');

            return {
                trustAs: trustAs,
                getTrusted: getTrusted,
                valueOf: valueOf
            };
        }];

        msos.console.debug(temp_sd + ' -> done!');
    }

    function $SceProvider() {
        var enabled = true;

        this.enabled = function (value) {
            if (arguments.length) {
                enabled = !!value;
            }
            return enabled;
        };

        this.$get = ['$parse', '$sniffer', '$sceDelegate', function ($parse, $sniffer, $sceDelegate) {
            // Prereq: Ensure that we're not running in IE8 quirks mode.  In that mode, IE allows
            // the "expression(javascript expression)" syntax which is insecure.
            if (enabled && $sniffer.msie && $sniffer.msieDocumentMode < 8) {
                throw $sceMinErr('iequirks', 'Strict Contextual Escaping does not support Internet Explorer version < 9 in quirks ' + 'mode.  You can fix this by adding the text <!doctype html> to the top of your HTML ' + 'document.  See http://docs.angularjs.org/api/ng.$sce for more information.');
            }

            var sce = shallowCopy(SCE_CONTEXTS),
                lName;

            sce.isEnabled = function () {
                return enabled;
            };

            sce.trustAs = $sceDelegate.trustAs;
            sce.getTrusted = $sceDelegate.getTrusted;
            sce.valueOf = $sceDelegate.valueOf;

            if (!enabled) {
                sce.trustAs = sce.getTrusted = function (type, value) {
                    return value;
                };
                sce.valueOf = identity;
            }

            sce.parseAs = function sceParseAs(type, expr) {
                var parsed = $parse(expr);

                if (parsed.literal && parsed.constant) {
                    return parsed;
                }

                return $parse(
                    expr,
                    function (value) {
                        return sce.getTrusted(type, value);
                    }
                );
            };

            forEach(SCE_CONTEXTS, function (enumValue, name) {
                lName = lowercase(name);
                sce[camelCase("parse_as_" + lName)] = function (expr) {
                    return sce.parseAs(enumValue, expr);
                };
                sce[camelCase("get_trusted_" + lName)] = function (value) {
                    return sce.getTrusted(enumValue, value);
                };
                sce[camelCase("trust_as_" + lName)] = function (value) {
                    return sce.trustAs(enumValue, value);
                };
            });

            return sce;
        }];
    }

    function $SnifferProvider() {
        this.$get = ['$window', '$document', function ($window, $document) {

            var document_SP = $document[0] || {};

            return {
                csp: csp(),
                android: parseInt((/android (\d+)/.exec(lowercase(($window.navigator || {}).userAgent)) || [])[1], 10),
                msie: msie,
                msieDocumentMode: document_SP.documentMode
            };
        }];
    }

    function $TemplateRequestProvider() {
        this.$get = ['$templateCache', '$http', '$q', function ($templateCache, $http, $q) {

            function handleRequestFn(tpl, ignoreRequestError) {
                var self = handleRequestFn;

                function handleError() {
                    self.totalPendingRequests -= 1;
                    if (!ignoreRequestError) {
                        throw $compileMinErr('tpload', 'Failed to load template: {0}', tpl);
                    }

                    msos.console.warn('ng - $TemplateRequestProvider - $get - handleRequestFn - handleError -> load failed:', tpl);
                    return $q.reject();
                }

                self.totalPendingRequests += 1;

                return $http.get(tpl, { cache: $templateCache }).then(
                    function (response) {
                        var html = response.data;

                        if (!html || html.length === 0) { return handleError(); }

                        self.totalPendingRequests -= 1;

                        $templateCache.put(tpl, html);

                        return html;
                    },
                    handleError
                );
            }

            handleRequestFn.totalPendingRequests = 0;

            return handleRequestFn;
        }];
    }

    function $$TestabilityProvider() {
        this.$get = ['$rootScope', '$browser', '$location', function($rootScope,   $browser,   $location) {

            var testability = {};

            testability.findBindings = function (element, expression, opt_exactMatch) {
                var bindings = element.getElementsByClassName('ng-binding'),
                    matches = [];

                forEach(
                    bindings,
                    function (binding) {
                        var dataBinding = angular.element(binding).data('$binding');

                        if (dataBinding) {
                            forEach(
                                dataBinding,
                                function (bindingName) {
                                    var matcher;

                                    if (opt_exactMatch) {
                                        matcher = new RegExp('(^|\\s)' + expression + '(\\s|\\||$)');

                                        if (matcher.test(bindingName)) {
                                            matches.push(binding);
                                        }
                                    } else {
                                        if (bindingName.indexOf(expression) !== -1) {
                                            matches.push(binding);
                                        }
                                    }
                                }
                            );
                        }
                    }
                );

                msos.console.debug('ng - $$TestabilityProvider - $get - findBindings -> bindings: ' + matches.length + ', for: ' + expression);
                return matches;
            };

            testability.findModels = function (element, expression, opt_exactMatch) {
                var prefixes = ['ng-', 'data-ng-', 'ng\\:'],
                    p = 0,
                    attributeEquals = opt_exactMatch ? '=' : '*=',
                    selector = '',
                    elements;

                for (p = 0; p < prefixes.length; p += 1) {
                    selector = '[' + prefixes[p] + 'model' + attributeEquals + '"' + expression + '"]';
                    elements = element.querySelectorAll(selector);

                    if (elements.length) {
                        msos.console.debug('ng - $$TestabilityProvider - $get - findModels -> models: ' +  elements.length + ', for: ' + expression);
                        return elements;
                    }
                }

                return undefined;
            };

            testability.getLocation = function () {
                return $location.url();
            };

            testability.setLocation = function (url) {
                if (url !== $location.url()) {
                    $location.url(url);
                    $rootScope.$digest();
                }
            };

            testability.whenStable = function (callback) {
                $browser.notifyWhenNoOutstandingRequests(callback);
            };

            return testability;
        }];
    }

    function $TimeoutProvider() {
        this.$get = ['$rootScope', '$browser', '$q', '$$q', '$exceptionHandler', function ($rootScope, $browser, $q, $$q, $exceptionHandler) {
            var deferreds = {};

            function timeout(fn, delay, invokeApply) {
                var skipApply = (isDefined(invokeApply) && !invokeApply),
                    deferred = (skipApply ? $$q : $q).defer(),
                    promise = deferred.promise,
                    timeoutId;

                timeoutId = $browser.defer(function () {
                    try {
                        deferred.resolve(fn());
                    } catch (e) {
                        deferred.reject(e);
                        $exceptionHandler(e);
                    } finally {
                        delete deferreds[promise.$$timeoutId];
                    }

                    if (!skipApply) { $rootScope.$apply(); }
                }, delay);

                promise.$$timeoutId = timeoutId;
                deferreds[timeoutId] = deferred;

                return promise;
            }

            timeout.cancel = function (promise) {
                if (promise && deferreds.hasOwnProperty(promise.$$timeoutId)) {
                    deferreds[promise.$$timeoutId].reject('canceled');
                    delete deferreds[promise.$$timeoutId];
                    return $browser.defer.cancel(promise.$$timeoutId);
                }
                return false;
            };

            return timeout;
        }];
    }

    function $WindowProvider() {
        this.$get = valueFn(window);
    }

    function orderByFilter($parse) {
        return function (array, sortPredicate, reverseOrder) {
            if (!(isArrayLike(array))) { return array; }
            if (!sortPredicate) { return array; }

            function comparator(o1, o2) {
                var i = 0,
                    comp;

                for (i = 0; i < sortPredicate.length; i += 1) {
                    comp = sortPredicate[i](o1, o2);
                    if (comp !== 0) { return comp; }
                }
                return 0;
            }

            function reverseComparator(comp, descending) {
                return descending ?
                function (a, b) {
                    return comp(b, a);
                } : comp;
            }

            function compare(v1, v2) {
                var t1 = typeof v1,
                    t2 = typeof v2;

                if (t1 === t2) {
                    if (_.isDate(v1) && _.isDate(v2)) {
                        v1 = v1.valueOf();
                        v2 = v2.valueOf();
                    }
                    if (t1 === "string") {
                        v1 = v1.toLowerCase();
                        v2 = v2.toLowerCase();
                    }
                    if (v1 === v2) { return 0; }
                    return v1 < v2 ? -1 : 1;
                }

                return t1 < t2 ? -1 : 1;
            }

            sortPredicate = _.isArray(sortPredicate) ? sortPredicate : [sortPredicate];

            sortPredicate = _.map(sortPredicate, function (predicate) {
                var descending = false,
                    get = predicate || identity,
                    key;

                if (_.isString(predicate)) {
                    if ((predicate.charAt(0) === '+' || predicate.charAt(0) === '-')) {
                        descending = predicate.charAt(0) === '-';
                        predicate = predicate.substring(1);
                    }
                    get = $parse(predicate);
                    if (get.constant) {
                        key = get();
                        return reverseComparator(function (a, b) {
                            return compare(a[key], b[key]);
                        }, descending);
                    }
                }

                return reverseComparator(function (a, b) {
                    return compare(get(a), get(b));
                }, descending);
            });

            var arrayCopy = [],
                i = 0;

            for (i = 0; i < array.length; i += 1) {
                arrayCopy.push(array[i]);
            }

            return arrayCopy.sort(reverseComparator(comparator, reverseOrder));
        };
    }

    orderByFilter.$inject = ['$parse'];

    function filterFilter() {
        return function (array, expression, comparator) {

            if (!_.isArray(array)) { return array; }

            var comparatorType = typeof comparator,
                predicates = [],
                search,
                key,
                j = 0,
                filtered = [],
                value;

            predicates.check = function (value, index) {
                var k = 0;

                for (k = 0; k < predicates.length; k += 1) {
                    if (!predicates[k](value, index)) {
                        return false;
                    }
                }
                return true;
            };

            if (comparatorType !== 'function') {
                if (comparatorType === 'boolean' && comparator) {
                    comparator = function (obj, text) {
                        return angular.equals(obj, text);
                    };
                } else {
                    comparator = function (obj, text) {
                        var objKey;

                        if (obj && text && typeof obj === 'object' && typeof text === 'object') {
                            for (objKey in obj) {
                                if (objKey.charAt(0) !== '$' && hasOwnProperty.call(obj, objKey) && comparator(obj[objKey], text[objKey])) {
                                    return true;
                                }
                            }
                            return false;
                        }

                        text = String(text).toLowerCase();
                        return String(obj).toLowerCase().indexOf(text) > -1;
                    };
                }
            }

            search = function (obj, text) {
                var objKey,
                    i = 0;

                if (typeof text === 'string' && text.charAt(0) === '!') {
                    return !search(obj, text.substr(1));
                }

                switch (typeof obj) {
                    case "boolean":
                    case "number":
                    case "string":
                        return comparator(obj, text);
                    case "object":
                        switch (typeof text) {
                        case "object":
                            return comparator(obj, text);
                        default:
                            for (objKey in obj) {
                                if (objKey.charAt(0) !== '$' && search(obj[objKey], text)) {
                                    return true;
                                }
                            }
                            break;
                        }
                        return false;
                    case "array":
                        for (i = 0; i < obj.length; i += 1) {
                            if (search(obj[i], text)) {
                                return true;
                            }
                        }
                        return false;
                    default:
                        return false;
                }
            };

            switch (typeof expression) {
                case "boolean":
                case "number":
                case "string":
                    // Set up expression object and fall through (no break;)
                    expression = {
                        $: expression
                    };
                    // jshint -W086
                case "object":
                    // jshint +W086
                    /* jshint ignore:start */
                    for (key in expression) {
                        (function (path) {
                            if (expression[path] === undefined) { return; }
                            predicates.push(function (value) {
                                return search(path === '$' ? value : (value && value[path]), expression[path]);
                            });
                        }(key));
                    }
                    /* jshint ignore:end */
                    break;
                case 'function':
                    predicates.push(expression);
                    break;
                default:
                    return array;
            }

            for (j = 0; j < array.length; j += 1) {
                value = array[j];
                if (predicates.check(value, j)) {
                    filtered.push(value);
                }
            }

            return filtered;
        };
    }

    function formatNumber(number, pattern, groupSep, decimalSep, fractionSize) {

        if (!isFinite(number) || _.isObject(number)) { return ''; }

        var isNegative = number < 0,
            numStr,
            match,
            formatedText = '',
            parts = [],
            hasExponent = false,
            fraction,
            whole,
            fractionLen,
            i,
            pos = 0,
            lgroup,
            group;

        number = Math.abs(number);

        numStr = String(number);

        if (numStr.indexOf('e') !== -1) {
            match = numStr.match(/([\d\.]+)e(-?)(\d+)/);
            if (match && match[2] === '-' && match[3] > fractionSize + 1) {
                numStr = '0';
                number = 0;
            } else {
                formatedText = numStr;
                hasExponent = true;
            }
        }

        if (!hasExponent) {

            fractionLen = (numStr.split(DECIMAL_SEP)[1] || '').length;

            // determine fractionSize if it is not specified
            if (_.isUndefined(fractionSize)) {
                fractionSize = Math.min(Math.max(pattern.minFrac, fractionLen), pattern.maxFrac);
            }

            // safely round numbers in JS without hitting imprecisions of floating-point arithmetics
            // inspired by:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
            number = +(Math.round(+(number.toString() + 'e' + fractionSize)).toString() + 'e' + -fractionSize);

            if (number === 0) {
                isNegative = false;
            }

            fraction = String(number).split(DECIMAL_SEP);
            whole = fraction[0];

            fraction = fraction[1] || '';

            lgroup = pattern.lgSize;
            group = pattern.gSize;

            if (whole.length >= (lgroup + group)) {
                pos = whole.length - lgroup;
                for (i = 0; i < pos; i += 1) {
                    if ((pos - i) % group === 0 && i !== 0) {
                        formatedText += groupSep;
                    }
                    formatedText += whole.charAt(i);
                }
            }

            for (i = pos; i < whole.length; i += 1) {
                if ((whole.length - i) % lgroup === 0 && i !== 0) {
                    formatedText += groupSep;
                }
                formatedText += whole.charAt(i);
            }

            // format fraction part.
            while (fraction.length < fractionSize) {
                fraction += '0';
            }

            if (fractionSize && fractionSize !== "0") { formatedText += decimalSep + fraction.substr(0, fractionSize); }

        } else {

            if (fractionSize > 0 && number > -1 && number < 1) {
                formatedText = number.toFixed(fractionSize);
            }
        }

        parts.push(isNegative ? pattern.negPre : pattern.posPre);
        parts.push(formatedText);
        parts.push(isNegative ? pattern.negSuf : pattern.posSuf);

        return parts.join('');
    }

    function currencyFilter($locale) {
        var formats = $locale.NUMBER_FORMATS;

        return function (amount, currencySymbol) {

            if (_.isUndefined(currencySymbol)) { currencySymbol = formats.CURRENCY_SYM; }
    
            // if null or undefined pass it through
            return (amount == null)
                ? amount
                : formatNumber(
                        amount,
                        formats.PATTERNS[1],
                        formats.GROUP_SEP,
                        formats.DECIMAL_SEP,
                        2
                    ).replace(/\u00A4/g, currencySymbol);
        };
    }

    currencyFilter.$inject = ['$locale'];

    function numberFilter($locale) {
        var formats = $locale.NUMBER_FORMATS;
        return function (number, fractionSize) {

            // if null or undefined pass it through
            return (number == null)
                ? number
                : formatNumber(
                    number,
                    formats.PATTERNS[0],
                    formats.GROUP_SEP,
                    formats.DECIMAL_SEP,
                    fractionSize
                );
        };
    }

    numberFilter.$inject = ['$locale'];

    function jsonFilter() {
        return function (object) {
            return toJson(object, true);
        };
    }

    function limitToFilter() {
        return function (input, limit) {
            if (!_.isArray(input) && !_.isString(input)) { return input; }

            if (Math.abs(Number(limit)) === Infinity) {
                limit = Number(limit);
            } else {
                limit = parseInt(limit, 10);
            }

            if (_.isString(input)) {
                //NaN check on limit
                if (limit) {
                    return limit >= 0 ? input.slice(0, limit) : input.slice(limit, input.length);
                }

                return "";
            }

            var out = [],
                i,
                n,
                init;

            // if abs(limit) exceeds maximum length, trim it
            if (limit > input.length)       { limit = input.length; }
            else if (limit < -input.length) { limit = -input.length; }

            if (limit > 0) {
                init = 0;
                n = limit;
            } else {
                init = input.length + limit;
                n = input.length;
            }

            for (i = init; i < n; i += 1) {
                out.push(input[i]);
            }

            return out;
        };
    }

    function padNumber(num, digits, trim) {
        var neg = '';

        if (num < 0) {
            neg = '-';
            num = -num;
        }

        num = String(num);

        while (num.length < digits) { num = '0' + num; }

        if (trim) { num = num.substr(num.length - digits); }

        return neg + num;
    }

    function dateGetter(name, size, offset, trim) {
        offset = offset || 0;
        return function (date) {
            var value = date['get' + name]();
            if (offset > 0 || value > -offset) { value += offset; }
            if (value === 0 && offset === -12) { value = 12; }
            return padNumber(value, size, trim);
        };
    }

    function dateStrGetter(name, shortForm) {
        return function (date, formats) {
            var value = date['get' + name](),
                get = uppercase(shortForm ? ('SHORT' + name) : name);

            return formats[get][value];
        };
    }

    function timeZoneGetter(date) {
        var zone = -1 * date.getTimezoneOffset(),
            paddedZone = (zone >= 0) ? "+" : "";

        paddedZone += padNumber(Math[zone > 0 ? 'floor' : 'ceil'](zone / 60), 2) + padNumber(Math.abs(zone % 60), 2);

        return paddedZone;
    }

    function getFirstThursdayOfYear(year) {
        // 0 = index of January
        var dayOfWeekOnFirst = (new Date(year, 0, 1)).getDay();
        // 4 = index of Thursday (+1 to account for 1st = 5)
        // 11 = index of *next* Thursday (+1 account for 1st = 12)
        return new Date(year, 0, ((dayOfWeekOnFirst <= 4) ? 5 : 12) - dayOfWeekOnFirst);
    }

    function getThursdayThisWeek(datetime) {
        return new Date(datetime.getFullYear(), datetime.getMonth(),
        // 4 = index of Thursday
        datetime.getDate() + (4 - datetime.getDay()));
    }

    function weekGetter(size) {
        return function (date) {
            var firstThurs = getFirstThursdayOfYear(date.getFullYear()),
                thisThurs = getThursdayThisWeek(date),
                diff = +thisThurs - +firstThurs,
                result = 1 + Math.round(diff / 6.048e8); // 6.048e8 ms per week

            return padNumber(result, size);
        };
    }

    function ampmGetter(date, formats) {
        return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1];
    }

    DATE_FORMATS = {
        yyyy: dateGetter('FullYear', 4),
        yy: dateGetter('FullYear', 2, 0, true),
        y: dateGetter('FullYear', 1),
        MMMM: dateStrGetter('Month'),
        MMM: dateStrGetter('Month', true),
        MM: dateGetter('Month', 2, 1),
        M: dateGetter('Month', 1, 1),
        dd: dateGetter('Date', 2),
        d: dateGetter('Date', 1),
        HH: dateGetter('Hours', 2),
        H: dateGetter('Hours', 1),
        hh: dateGetter('Hours', 2, -12),
        h: dateGetter('Hours', 1, -12),
        mm: dateGetter('Minutes', 2),
        m: dateGetter('Minutes', 1),
        ss: dateGetter('Seconds', 2),
        s: dateGetter('Seconds', 1),
        sss: dateGetter('Milliseconds', 3),
        EEEE: dateStrGetter('Day'),
        EEE: dateStrGetter('Day', true),
        a: ampmGetter,
        Z: timeZoneGetter,
        ww: weekGetter(2),
        w: weekGetter(1)
    };

    function dateFilter($locale) {

        var R_ISO8601_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
        // 1        2       3         4          5          6          7          8  9     10      11
        function jsonStringToDate(string) {
            var match,
                date,
                tzHour = 0,
                tzMin = 0,
                dateSetter,
                timeSetter,
                h,
                m,
                s,
                ms;

            match = string.match(R_ISO8601_STR);

            if (match) {
                date = new Date(0);
                dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear;
                timeSetter = match[8] ? date.setUTCHours : date.setHours;

                if (match[9]) {
                    tzHour = parseInt(match[9] + match[10], 10);
                    tzMin = parseInt(match[9] + match[11], 10);
                }
                dateSetter.call(date, parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));

                h = parseInt(match[4] || 0, 10) - tzHour;
                m = parseInt(match[5] || 0, 10) - tzMin;
                s = parseInt(match[6] || 0, 10);
                ms = Math.round(parseFloat('0.' + (match[7] || 0)) * 1000);

                timeSetter.call(date, h, m, s, ms);
                return date;
            }
            return string;
        }

        return function (date, format, timezone) {
            var text = '',
                parts = [],
                fn, match;

            format = format || 'mediumDate';
            format = $locale.DATETIME_FORMATS[format] || format;
            if (_.isString(date)) {
                date = NUMBER_STRING.test(date) ? parseInt(date, 10) : jsonStringToDate(date);
            }

            if (_.isNumber(date)) {
                date = new Date(date);
            }

            if (!_.isDate(date)) {
                return date;
            }

            while (format) {
                match = DATE_FORMATS_SPLIT.exec(format);
                if (match) {
                    parts = concat(parts, match, 1);
                    format = parts.pop();
                } else {
                    parts.push(format);
                    format = null;
                }
            }

            if (timezone && timezone === 'UTC') {
                date = new Date(date.getTime());
                date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
            }

            forEach(parts, function (value) {
                fn = DATE_FORMATS[value];
                text += fn ? fn(date, $locale.DATETIME_FORMATS) : value.replace(/(^'|'$)/g, '').replace(/''/g, "'");
            });

            return text;
        };
    }

    dateFilter.$inject = ['$locale'];

    function $FilterProvider($provide) {
        var suffix = 'Filter',
            lowercaseFilter = valueFn(lowercase),
            uppercaseFilter = valueFn(uppercase);

        function register(name, factory) {
            if (_.isObject(name)) {
                var filters = {};
                forEach(name, function (filter, key) {
                    filters[key] = register(key, filter);
                });
                return filters;
            }
            return $provide.factory(name + suffix, factory);
        }
        this.register = register;

        this.$get = ['$injector', function ($injector) {
            return function (name) {
                return $injector.get(name + suffix);
            };
        }];

        register('currency', currencyFilter);
        register('date', dateFilter);
        register('filter', filterFilter);
        register('json', jsonFilter);
        register('limitTo', limitToFilter);
        register('lowercase', lowercaseFilter);
        register('number', numberFilter);
        register('orderBy', orderByFilter);
        register('uppercase', uppercaseFilter);
    }

    $FilterProvider.$inject = ['$provide'];

    function ngDirective(directive) {
        if (_.isFunction(directive)) {
            directive = {
                link: directive
            };
        }
        directive.restrict = directive.restrict || 'AC';
        return valueFn(directive);
    }

    htmlAnchorDirective = valueFn({
        restrict: 'E',
        compile: function (element, attr) {

            if (!attr.href && !attr.xlinkHref && !attr.name) {
                return function (scope, element) {
                    // SVGAElement does not use the href attribute, but rather the 'xlinkHref' attribute.
                    var href = ngto_string.call(element.prop('href')) === '[object SVGAnimatedString]' ? 'xlink:href' : 'href';
                    element.on('click', function (event) {
                        // if we have no href url, then don't navigate anywhere.
                        if (!element.attr(href)) {
                            event.preventDefault();
                        }
                    });
                };
            }
            return undefined;
        }
    });

    // boolean attrs are evaluated
    forEach(BOOLEAN_ATTR, function (propName, attrName) {
        // binding to multiple is not supported
        if (propName === "multiple") { return; }

        var normalized = directiveNormalize('ng-' + attrName);
        ngAttributeAliasDirectives[normalized] = function () {
            return {
                restrict: 'A',
                priority: 100,
                link: function (scope, element, attr) {
                    scope.$watch(attr[normalized], function ngBooleanAttrWatchAction(value) {
                        attr.$set(attrName, !! value);
                    });
                }
            };
        };
    });

    // aliased input attrs are evaluated
    forEach(ALIASED_ATTR, function (htmlAttr, ngAttr) {
        ngAttributeAliasDirectives[ngAttr] = function () {
            return {
                priority: 100,
                link: function (scope, element, attr) {
                    //special case ngPattern when a literal regular expression value
                    //is used as the expression (this way we don't have to watch anything).
                    if (ngAttr === "ngPattern" && attr.ngPattern.charAt(0) === "/") {
                        var match = attr.ngPattern.match(REGEX_STRING_REGEXP);
                        if (match) {
                            attr.$set("ngPattern", new RegExp(match[1], match[2]));
                            return;
                        }
                    }

                    scope.$watch(attr[ngAttr], function ngAttrAliasWatchAction(value) {
                        attr.$set(ngAttr, value);
                    });
                }
            };
        };
    });

    forEach(['src', 'srcset', 'href'], function (attrName) {
        var normalized = directiveNormalize('ng-' + attrName);
        ngAttributeAliasDirectives[normalized] = function () {
            return {
                priority: 99,
                // it needs to run after the attributes are interpolated
                link: function (scope, element, attr) {
                    var propName = attrName,
                        name = attrName;

                    if (attrName === 'href' && ngto_string.call(element.prop('href')) === '[object SVGAnimatedString]') {
                        name = 'xlinkHref';
                        attr.$attr[name] = 'xlink:href';
                        propName = null;
                    }

                    attr.$observe(normalized, function (value) {
                        if (!value) {
                            if (attrName === 'href') {
                                attr.$set(name, null);
                            }
                            return;
                        }

                        attr.$set(name, value);

                        // on IE, if "ng:src" directive declaration is used and "src" attribute doesn't exist
                        // then calling element.setAttribute('src', 'foo') doesn't do anything, so we need
                        // to set the property as well to achieve the desired effect.
                        // we use attr[attrName] value since $set can sanitize the url.
                        if (msie && propName) { element.prop(propName, attr[name]); }
                    });
                }
            };
        };
    });

    if (msos.config.verbose) {
        msos.console.debug('ng - ngAttributeAliasDirectives -> create:', _.keys(ngAttributeAliasDirectives));
    }

    function isObjectEmpty(obj) {
        var prop;

        if (obj) {
            for (prop in obj) {
                return false;
            }
        }
        return true;
    }

    function addSetValidityMethod(context) {
        var ctrl = context.ctrl,
            $element = context.$element,
            classCache = {},
            set = context.set,
            unset = context.unset,
            parentForm = context.parentForm,
            $animate = context.$animate;

        function cachedToggleClass(className, switchValue) {
            if (switchValue && !classCache[className]) {
                $animate.addClass($element, className);
                classCache[className] = true;
            } else if (!switchValue && classCache[className]) {
                $animate.removeClass($element, className);
                classCache[className] = false;
            }
        }

        function toggleValidationCss(validationErrorKey, isValid) {
            validationErrorKey = validationErrorKey ? '-' + snake_case(validationErrorKey, '-') : '';

            cachedToggleClass(VALID_CLASS + validationErrorKey, isValid === true);
            cachedToggleClass(INVALID_CLASS + validationErrorKey, isValid === false);
        }

        function createAndSet(name, value, options) {
            if (!ctrl[name]) {
                ctrl[name] = {};
            }
            set(ctrl[name], value, options);
        }

        function unsetAndCleanup(name, value, options) {
            if (ctrl[name]) {
                unset(ctrl[name], value, options);
            }
            if (isObjectEmpty(ctrl[name])) {
                ctrl[name] = undefined;
            }
        }

        function setValidity(validationErrorKey, state, options) {
            var combinedState;

            if (state === undefined) {
                createAndSet('$pending', validationErrorKey, options);
            } else {
                unsetAndCleanup('$pending', validationErrorKey, options);
            }

            if (!_.isBoolean(state)) {
                unset(ctrl.$error, validationErrorKey, options);
                unset(ctrl.$$success, validationErrorKey, options);
            } else {
                if (state) {
                    unset(ctrl.$error, validationErrorKey, options);
                    set(ctrl.$$success, validationErrorKey, options);
                } else {
                    set(ctrl.$error, validationErrorKey, options);
                    unset(ctrl.$$success, validationErrorKey, options);
                }
            }

            if (ctrl.$pending) {
                cachedToggleClass(PENDING_CLASS, true);
                ctrl.$valid = ctrl.$invalid = undefined;
                toggleValidationCss('', null);
            } else {
                cachedToggleClass(PENDING_CLASS, false);
                ctrl.$valid = isObjectEmpty(ctrl.$error);
                ctrl.$invalid = !ctrl.$valid;
                toggleValidationCss('', ctrl.$valid);
            }

            // re-read the state as the set/unset methods could have
            // combined state in ctrl.$error[validationError] (used for forms),
            // where setting/unsetting only increments/decrements the value,
            // and does not replace it.
            if (ctrl.$pending && ctrl.$pending[validationErrorKey]) {
                combinedState = undefined;
            } else if (ctrl.$error[validationErrorKey]) {
                combinedState = false;
            } else if (ctrl.$$success[validationErrorKey]) {
                combinedState = true;
            } else {
                combinedState = null;
            }

            toggleValidationCss(validationErrorKey, combinedState);
            parentForm.$setValidity(validationErrorKey, combinedState, ctrl);
        }

        ctrl.$setValidity = setValidity;
        toggleValidationCss('', true);
    }

    function FormController(element, attrs, $scope, $animate) {
        var form = this,
            parentForm = element.parent().controller('form') || nullFormCtrl,
            controls = [];

        // init state
        form.$error = {};
        form.$$success = {};
        form.$pending = undefined;
        form.$name = attrs.name || attrs.ngForm;
        form.$dirty = false;
        form.$pristine = true;
        form.$valid = true;
        form.$invalid = false;
        form.$submitted = false;

        parentForm.$addControl(form);

        // Setup initial state of the control
        element.addClass(PRISTINE_CLASS);

        form.$rollbackViewValue = function () {
            forEach(controls, function (control) {
                control.$rollbackViewValue();
            });
        };

        form.$commitViewValue = function () {
            forEach(controls, function (control) {
                control.$commitViewValue();
            });
        };

        form.$addControl = function (control) {
            // Breaking change - before, inputs whose name was "hasOwnProperty" were quietly ignored
            // and not added to the scope.  Now we throw an error.
            assertNotHasOwnProperty(control.$name, 'input');
            controls.push(control);

            if (control.$name) {
                form[control.$name] = control;
            }
        };

        form.$removeControl = function (control) {
            if (control.$name && form[control.$name] === control) {
                delete form[control.$name];
            }
            forEach(form.$pending, function (value, name) {
                form.$setValidity(name, null, control);
            });
            forEach(form.$error, function (value, name) {
                form.$setValidity(name, null, control);
            });

            arrayRemove(controls, control);
        };

        addSetValidityMethod(
            {
                ctrl: this,
                $element: element,
                set: function (object, property, control) {
                    var list = object[property],
                        index;

                    if (!list) {
                        object[property] = [control];
                    } else {
                        index = list.indexOf(control);
                        if (index === -1) {
                            list.push(control);
                        }
                    }
                },
                unset: function (object, property, control) {
                    var list = object[property];

                    if (!list) { return; }

                    arrayRemove(list, control);

                    if (list.length === 0) {
                        delete object[property];
                    }
                },
                parentForm: parentForm,
                $animate: $animate
            }
        );

        form.$setDirty = function () {
            $animate.removeClass(element, PRISTINE_CLASS);
            $animate.addClass(element, DIRTY_CLASS);
            form.$dirty = true;
            form.$pristine = false;
            parentForm.$setDirty();
        };

        form.$setPristine = function () {
            $animate.setClass(element, PRISTINE_CLASS, DIRTY_CLASS + ' ' + SUBMITTED_CLASS);
            form.$dirty = false;
            form.$pristine = true;
            form.$submitted = false;
            forEach(controls, function (control) {
                control.$setPristine();
            });
        };

        form.$setSubmitted = function () {
            $animate.addClass(element, SUBMITTED_CLASS);
            form.$submitted = true;
            parentForm.$setSubmitted();
        };
    }

    FormController.$inject = ['$element', '$attrs', '$scope', '$animate'];

    formDirectiveFactory = function (isNgForm) {
        return ['$timeout', function ($timeout) {
            var formDirective_F = {
                name: 'form',
                restrict: isNgForm ? 'EAC' : 'E',
                controller: FormController,
                compile: function () {
                    return {
                        pre: function (scope, formElement, attr, controller) {
                            var handleFormSubmission,
                                parentFormCtrl,
                                alias;

                            if (!attr.action) {
                                // we can't use jq events because if a form is destroyed during submission the default
                                // action is not prevented. see #1238
                                //
                                // IE 9 is not affected because it doesn't fire a submit event and try to do a full
                                // page reload if the form was destroyed by submission of the form via a click handler
                                // on a button in the form. Looks like an IE9 specific bug.
                                handleFormSubmission = function (event) {
                                        scope.$apply(function () {
                                            controller.$commitViewValue();
                                            controller.$setSubmitted();
                                        });

                                        if (event.preventDefault) {
                                            event.preventDefault();
                                        } else {
                                            event.returnValue = false; // IE
                                        }
                                    };

                                addEventListenerFn(formElement[0], 'submit', handleFormSubmission);

                                // unregister the preventDefault listener so that we don't not leak memory but in a
                                // way that will achieve the prevention of the default action.
                                formElement.on('$destroy', function () {
                                    $timeout(function () {
                                        removeEventListenerFn(formElement[0], 'submit', handleFormSubmission);
                                    }, 0, false);
                                });
                            }

                            parentFormCtrl = formElement.parent().controller('form');
                            alias = attr.name || attr.ngForm;

                            if (alias) {
                                setter(scope, alias, controller, alias);
                            }
                            if (parentFormCtrl) {
                                formElement.on('$destroy', function () {
                                    parentFormCtrl.$removeControl(controller);
                                    if (alias) {
                                        setter(scope, alias, undefined, alias);
                                    }
                                    extend(controller, nullFormCtrl); //stop propagating child destruction handlers upwards
                                });
                            }
                        }
                    };
                }
            };

            return formDirective_F;
        }];
    };

    formDirective = formDirectiveFactory();
    ngFormDirective = formDirectiveFactory(true);

    function stringBasedInputType(ctrl) {
        ctrl.$formatters.push(
            function (value) {
                return ctrl.$isEmpty(value) ? value : value.toString();
            }
        );
    }

    function baseInputType(scope, element, attr, ctrl, $sniffer, $browser) {
        var placeholder = element[0].placeholder,
            noevent = {},
            type = lowercase(element[0].type),
            listener,
            composing = false,
            timeout,
            deferListener;

        listener = function (ev) {

            if (composing) { return; }

            var value = element.val(),
                event = ev && ev.type;

            // IE (11 and under) seem to emit an 'input' event if the placeholder value changes.
            // We don't want to dirty the value when this happens, so we abort here. Unfortunately,
            // IE also sends input events for other non-input-related things, (such as focusing on a
            // form control), so this change is not entirely enough to solve this.
            if (msie && (ev || noevent).type === 'input' && element[0].placeholder !== placeholder) {
                placeholder = element[0].placeholder;
                return;
            }

            // By default we will trim the value
            // If the attribute ng-trim exists we will avoid trimming
            // If input type is 'password', the value is never trimmed
            if (type !== 'password' && (!attr.ngTrim || attr.ngTrim !== 'false')) {
                value = trim(value);
            }

            // If a control is suffering from bad input (due to native validators), browsers discard its
            // value, so it may be necessary to revalidate (by calling $setViewValue again) even if the
            // control's value is the same empty value twice in a row.
            if (ctrl.$viewValue !== value || (value === '' && ctrl.$$hasNativeValidators)) {
                ctrl.$setViewValue(value, event);
            }
        };

        if (!$sniffer.android) {

            element.on('compositionstart', function (data) {
                composing = true;
            });

            element.on('compositionend', function () {
                composing = false;
                listener();
            });
        }

        // if the browser does support "input" event, we are fine - except on IE9 which doesn't fire the
        // input event on backspace, delete or cut
        if (Modernizr.hasEvent('input')) {
            element.on('input', listener);
        } else {

            deferListener = function (ev) {
                if (!timeout) {
                    timeout = $browser.defer(function () {
                        listener(ev);
                        timeout = null;
                    });
                }
            };

            element.on('keydown', function (event) {
                var key = event.keyCode;

                // ignore
                //    command            modifiers                   arrows
                if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) { return; }

                deferListener(event);
            });

            // if user modifies input value using context menu in IE, we need "paste" and "cut" events to catch it
            if (Modernizr.hasEvent('paste')) {
                element.on('paste cut', deferListener);
            }
        }

        // if user paste into input using mouse on older browser
        // or form autocomplete on newer browser, we need "change" event to catch it
        element.on('change', listener);

        ctrl.$render = function () {
            element.val(ctrl.$isEmpty(ctrl.$viewValue) ? '' : ctrl.$viewValue);
        };
    }

    function textInputType(scope, element, attr, ctrl, $sniffer, $browser) {
        baseInputType(scope, element, attr, ctrl, $sniffer, $browser);
        stringBasedInputType(ctrl);
    }

    function weekParser(isoWeek) {
        var parts,
            year,
            week,
            firstThurs,
            addDays;

        if (_.isDate(isoWeek)) {
            return isoWeek;
        }

        if (_.isString(isoWeek)) {
            WEEK_REGEXP.lastIndex = 0;
            parts = WEEK_REGEXP.exec(isoWeek);

            if (parts) {
                year = +parts[1];
                week = +parts[2];
                firstThurs = getFirstThursdayOfYear(year);
                addDays = (week - 1) * 7;

                return new Date(year, 0, firstThurs.getDate() + addDays);
            }
        }

        return NaN;
    }

    function createDateParser(regexp, mapping) {
        return function (iso) {
            var parts,
                map;

            if (_.isDate(iso)) {
                return iso;
            }

            if (_.isString(iso)) {
                // When a date is JSON'ified to wraps itself inside of an extra
                // set of double quotes. This makes the date parsing code unable
                // to match the date string and parse it as a date.
                if (iso.charAt(0) === '"'
                 && iso.charAt(iso.length - 1) === '"') {
                    iso = iso.substring(1, iso.length - 1);
                }

                if (ISO_DATE_REGEXP.test(iso)) {
                    return new Date(iso);
                }

                regexp.lastIndex = 0;
                parts = regexp.exec(iso);

                if (parts) {
                    parts.shift();
                    map = {
                        yyyy: 1970,
                        MM: 1,
                        dd: 1,
                        HH: 0,
                        mm: 0,
                        ss: 0
                    };
    
                    forEach(
                        parts,
                        function (part, index) {
                            if (index < mapping.length) {
                                map[mapping[index]] = +part;
                            }
                        }
                    );
    
                    return new Date(map.yyyy, map.MM - 1, map.dd, map.HH, map.mm, map.ss || 0);
                }
            }
    
            return NaN;
        };
    }

    function badInputChecker(scope, element, attr, ctrl) {
        var node = element[0];

        ctrl.$$hasNativeValidators = _.isObject(node.validity);

        if (ctrl.$$hasNativeValidators) {
            ctrl.$parsers.push(
                function (value) {
                    var validity = element.prop(VALIDITY_STATE_PROPERTY) || {};

                    return validity.badInput && !validity.typeMismatch ? undefined : value;
                }
            );
        }
    }

    function createDateInputType(type, regexp, parseDate, format) {
        return function dynamicDateInputType(scope, element, attr, ctrl, $sniffer, $browser, $filter) {

            badInputChecker(scope, element, attr, ctrl);
            baseInputType(scope, element, attr, ctrl, $sniffer, $browser);

            var timezone = ctrl && ctrl.$options && ctrl.$options.timezone,
                minVal,
                maxVal;

            function parseObservedDateValue(val) {
                return isDefined(val) ? (_.isDate(val) ? val : parseDate(val)) : undefined;
            }

            ctrl.$$parserName = type;

            ctrl.$parsers.push(
                function (value) {
                    var parsedDate;

                    if (ctrl.$isEmpty(value)) { return null; }
                    if (regexp.test(value)) {
                        parsedDate = parseDate(value);
                        if (timezone === 'UTC') {
                            parsedDate.setMinutes(parsedDate.getMinutes() - parsedDate.getTimezoneOffset());
                        }
                        return parsedDate;
                    }
                    return undefined;
                }
            );

            ctrl.$formatters.push(
                function (value) {
                    if (_.isDate(value)) {
                        return $filter('date')(value, format, timezone);
                    }
                    return '';
                }
            );

            if (isDefined(attr.min) || attr.ngMin) {
                ctrl.$validators.min = function (value) {
                    return ctrl.$isEmpty(value) || _.isUndefined(minVal) || parseDate(value) >= minVal;
                };
                attr.$observe(
                    'min',
                    function (val) {
                        minVal = parseObservedDateValue(val);
                        ctrl.$validate();
                    }
                );
            }

            if (isDefined(attr.max) || attr.ngMax) {
                ctrl.$validators.max = function (value) {
                    return ctrl.$isEmpty(value) || _.isUndefined(maxVal) || parseDate(value) <= maxVal;
                };
                attr.$observe(
                    'max',
                    function (val) {
                        maxVal = parseObservedDateValue(val);
                        ctrl.$validate();
                    }
                );
            }
        };
    }

    function numberInputType(scope, element, attr, ctrl, $sniffer, $browser) {
        var minVal,
            maxVal;

        badInputChecker(scope, element, attr, ctrl);
        baseInputType(scope, element, attr, ctrl, $sniffer, $browser);

        ctrl.$$parserName = 'number';
        ctrl.$parsers.push(
            function (value) {
                if (ctrl.$isEmpty(value)) { return null; }
                if (NUMBER_REGEXP.test(value)) { return parseFloat(value); }
                return undefined;
            }
        );

        ctrl.$formatters.push(
            function (value) {
                if (!ctrl.$isEmpty(value)) {
                    if (!_.isNumber(value)) {
                        throw $ngModelMinErr('numfmt', 'Expected `{0}` to be a number', value);
                    }
                    value = value.toString();
                }
                return value;
            }
        );

        if (attr.min || attr.ngMin) {
            ctrl.$validators.min = function (value) {
                return ctrl.$isEmpty(value) || _.isUndefined(minVal) || value >= minVal;
            };

            attr.$observe(
                'min',
                function (val) {
                    if (isDefined(val) && !_.isNumber(val)) {
                        val = parseFloat(val, 10);
                    }
                    minVal = _.isNumber(val) && !isNaN(val) ? val : undefined;
                    // TODO(matsko): implement validateLater to reduce number of validations
                    ctrl.$validate();
                }
            );
        }

        if (attr.max || attr.ngMax) {
            ctrl.$validators.max = function (value) {
                return ctrl.$isEmpty(value) || _.isUndefined(maxVal) || value <= maxVal;
            };

            attr.$observe(
                'max',
                function (val) {
                    if (isDefined(val) && !_.isNumber(val)) {
                        val = parseFloat(val, 10);
                    }
                    maxVal = _.isNumber(val) && !isNaN(val) ? val : undefined;
                    // TODO(matsko): implement validateLater to reduce number of validations
                    ctrl.$validate();
                }
            );
        }
    }

    function urlInputType(scope, element, attr, ctrl, $sniffer, $browser) {
        // Note: no badInputChecker here by purpose as `url` is only a validation
        // in browsers, i.e. we can always read out input.value even if it is not valid!
        baseInputType(scope, element, attr, ctrl, $sniffer, $browser);
        stringBasedInputType(ctrl);

        ctrl.$$parserName = 'url';
        ctrl.$validators.url = function (modelValue, viewValue) {
            var value = modelValue || viewValue;
            return ctrl.$isEmpty(value) || URL_REGEXP.test(value);
        };
    }

    function emailInputType(scope, element, attr, ctrl, $sniffer, $browser) {
        // Note: no badInputChecker here by purpose as `url` is only a validation
        // in browsers, i.e. we can always read out input.value even if it is not valid!
        baseInputType(scope, element, attr, ctrl, $sniffer, $browser);
        stringBasedInputType(ctrl);

        ctrl.$$parserName = 'email';
        ctrl.$validators.email = function (modelValue, viewValue) {
            var value = modelValue || viewValue;
            return ctrl.$isEmpty(value) || EMAIL_REGEXP.test(value);
        };
    }

    function radioInputType(scope, element, attr, ctrl) {
        // make the name unique, if not defined
        if (_.isUndefined(attr.name)) {
            element.attr('name', nextUid());
        }

        var listener = function (ev) {
                if (element[0].checked) {
                    ctrl.$setViewValue(attr.value, ev && ev.type);
                }
            };

        element.on('click', listener);

        ctrl.$render = function () {
            var value = attr.value;
            element[0].checked = (value === ctrl.$viewValue);
        };

        attr.$observe('value', ctrl.$render);
    }

    function parseConstantExpr($parse, context, name, expression, fallback) {
        var parseFn;
        if (isDefined(expression)) {
            parseFn = $parse(expression);
            if (!parseFn.constant) {
                throw minErr('ngModel')(
                    'constexpr',
                    'Expected constant expression for `{0}`, but saw `{1}`.',
                    name,
                    expression
                );
            }
            return parseFn(context);
        }
        return fallback;
    }

    function checkboxInputType(scope, element, attr, ctrl, $sniffer, $browser, $filter, $parse) {
        var trueValue = parseConstantExpr($parse, scope, 'ngTrueValue', attr.ngTrueValue, true),
            falseValue = parseConstantExpr($parse, scope, 'ngFalseValue', attr.ngFalseValue, false),
            listener = function (ev) {
                ctrl.$setViewValue(element[0].checked, ev && ev.type);
            };

        element.on('click', listener);

        ctrl.$render = function () {
            element[0].checked = ctrl.$viewValue;
        };

        // Override the standard `$isEmpty` because a value of `false` means empty in a checkbox.
        ctrl.$isEmpty = function (value) {
            return value !== trueValue;
        };

        ctrl.$formatters.push(function (value) {
            return equals(value, trueValue);
        });

        ctrl.$parsers.push(function (value) {
            return value ? trueValue : falseValue;
        });
    }

    inputType = {

        'text': textInputType,

        'date': createDateInputType('date', DATE_REGEXP, createDateParser(DATE_REGEXP, ['yyyy', 'MM', 'dd']), 'yyyy-MM-dd'),

        'datetime-local': createDateInputType('datetimelocal', DATETIMELOCAL_REGEXP, createDateParser(DATETIMELOCAL_REGEXP, ['yyyy', 'MM', 'dd', 'HH', 'mm', 'ss']), 'yyyy-MM-ddTHH:mm:ss'),

        'time': createDateInputType('time', TIME_REGEXP, createDateParser(TIME_REGEXP, ['HH', 'mm', 'ss']), 'HH:mm:ss'),

        'week': createDateInputType('week', WEEK_REGEXP, weekParser, 'yyyy-Www'),

        'month': createDateInputType('month', MONTH_REGEXP, createDateParser(MONTH_REGEXP, ['yyyy', 'MM']), 'yyyy-MM'),

        'number': numberInputType,

        'url': urlInputType,

        'email': emailInputType,

        'radio': radioInputType,

        'checkbox': checkboxInputType,

        'hidden': noop,
        'button': noop,
        'submit': noop,
        'reset': noop,
        'file': noop
    };

    inputDirective = ['$browser', '$sniffer', '$filter', '$parse', function ($browser, $sniffer, $filter, $parse) {
        return {
            restrict: 'E',
            require: ['?ngModel'],
            link: function (scope, element, attr, ctrls) {
                if (ctrls[0]) {
                    (inputType[lowercase(attr.type)] || inputType.text)(scope, element, attr, ctrls[0], $sniffer, $browser, $filter, $parse);
                }
            }
        };
    }];

    $ngModelMinErr = new minErr('ngModel');

    NgModelController = ['$scope', '$exceptionHandler', '$attrs', '$element', '$parse', '$animate', '$timeout', '$rootScope', '$q', function ($scope, $exceptionHandler, $attr, $element, $parse, $animate, $timeout, $rootScope, $q) {
        this.$viewValue = Number.NaN;
        this.$modelValue = Number.NaN;
        this.$validators = {};
        this.$asyncValidators = {};
        this.$parsers = [];
        this.$formatters = [];
        this.$viewChangeListeners = [];
        this.$untouched = true;
        this.$touched = false;
        this.$pristine = true;
        this.$dirty = false;
        this.$valid = true;
        this.$invalid = false;
        this.$error = {};           // keep invalid keys here
        this.$$success = {};        // keep valid keys here
        this.$pending = undefined;  // keep pending keys here
        this.$name = $attr.name;

        var parsedNgModel = $parse($attr.ngModel),
            pendingDebounce = null,
            ctrl = this,
            ngModelGet = function ngModelGet() {
                var modelValue = parsedNgModel($scope);
                if (ctrl.$options
                 && ctrl.$options.getterSetter
                 && _.isFunction(modelValue)) {
                    modelValue = modelValue();
                }
                return modelValue;
            },
            ngModelSet = function ngModelSet(newValue) {
                var getterSetter = parsedNgModel($scope);

                if (ctrl.$options
                 && ctrl.$options.getterSetter
                 && _.isFunction(getterSetter)) {
                    getterSetter(ctrl.$modelValue);
                } else {
                    parsedNgModel.assign($scope, ctrl.$modelValue);
                }
            },
            parentForm,
            currentValidationRunId = 0;

        this.$$setOptions = function (options) {
            ctrl.$options = options;

            if (!parsedNgModel.assign && (!options || !options.getterSetter)) {
                throw $ngModelMinErr(
                    'nonassign',
                    "Expression '{0}' is non-assignable. Element: {1}",
                    $attr.ngModel,
                    startingTag($element)
                );
            }
        };

        this.$render = noop;

        this.$isEmpty = function (value) {
            return _.isUndefined(value) || value === '' || value === null || value !== value;
        };

        this.$setPristine = function () {
            ctrl.$dirty = false;
            ctrl.$pristine = true;
            $animate.removeClass($element, DIRTY_CLASS);
            $animate.addClass($element, PRISTINE_CLASS);
        };

        this.$setUntouched = function () {
            ctrl.$touched = false;
            ctrl.$untouched = true;
            $animate.setClass($element, UNTOUCHED_CLASS, TOUCHED_CLASS);
        };

        this.$setTouched = function () {
            ctrl.$touched = true;
            ctrl.$untouched = false;
            $animate.setClass($element, TOUCHED_CLASS, UNTOUCHED_CLASS);
        };

        this.$rollbackViewValue = function () {
            $timeout.cancel(pendingDebounce);
            ctrl.$viewValue = ctrl.$$lastCommittedViewValue;
            ctrl.$render();
        };

        this.$validate = function () {
            // ignore $validate before model is initialized
            if (_.isNumber(ctrl.$modelValue) && isNaN(ctrl.$modelValue)) { return; }

            this.$$parseAndValidate();
        };

        this.$$runValidators = function (parseValid, modelValue, viewValue, doneCallback) {
            currentValidationRunId += 1;

            var localValidationRunId = currentValidationRunId;

            function validationDone() {
                if (localValidationRunId === currentValidationRunId) {
                    doneCallback();
                }
            }

            function setValidity(name, isValid) {
                if (localValidationRunId === currentValidationRunId) {
                    ctrl.$setValidity(name, isValid);
                }
            }

            function processParseErrors(parseValid) {
                var errorKey = ctrl.$$parserName || 'parse';

                if (parseValid === undefined) {
                    setValidity(errorKey, null);
                } else {
                    setValidity(errorKey, parseValid);

                    if (!parseValid) {
                        forEach(
                            ctrl.$validators,
                            function (v, name) {
                                setValidity(name, null);
                            }
                        );
                        forEach(
                            ctrl.$asyncValidators,
                            function (v, name) {
                                setValidity(name, null);
                            }
                        );
                        validationDone();
                        return false;
                    }
                }
                return true;
            }

            function processSyncValidators() {
                var syncValidatorsValid = true;

                forEach(
                    ctrl.$validators,
                    function (validator, name) {
                        var result = validator(modelValue, viewValue);

                        syncValidatorsValid = syncValidatorsValid && result;
                        setValidity(name, result);
                    }
                );

                if (!syncValidatorsValid) {
                    forEach(
                        ctrl.$asyncValidators,
                        function (v, name) {
                            setValidity(name, null);
                        }
                    );

                    validationDone();
                    return false;
                }
                return true;
            }

            function processAsyncValidators() {
                var validatorPromises = [];

                forEach(
                    ctrl.$asyncValidators,
                    function (validator, name) {
                        var promise = validator(modelValue, viewValue);

                        if (!isPromiseLike(promise)) {
                            throw $ngModelMinErr(
                                "$asyncValidators",
                                "Expected asynchronous validator to return a promise but got '{0}' instead.",
                                promise
                            );
                        }

                        setValidity(name, undefined);

                        validatorPromises.push(
                            promise.then(
                                function () { setValidity(name, true); },
                                function (error) { setValidity(name, false); }
                            )
                        );
                    }
                );

                if (!validatorPromises.length) {
                    validationDone();
                } else {
                    $q.all(validatorPromises).then(validationDone);
                }
            }

            // Check parser error
            if (!processParseErrors(parseValid)) { return; }

            if (!processSyncValidators()) { return; }

            processAsyncValidators();
        };

        this.$commitViewValue = function () {
            var viewValue = ctrl.$viewValue;

            $timeout.cancel(pendingDebounce);

            // If the view value has not changed then we should just exit, except in the case where there is
            // a native validator on the element. In this case the validation state may have changed even though
            // the viewValue has stayed empty.
            if (ctrl.$$lastCommittedViewValue === viewValue && (viewValue !== '' || !ctrl.$$hasNativeValidators)) {
                return;
            }

            ctrl.$$lastCommittedViewValue = viewValue;

            // change to dirty
            if (ctrl.$pristine) {
                ctrl.$dirty = true;
                ctrl.$pristine = false;
                $animate.removeClass($element, PRISTINE_CLASS);
                $animate.addClass($element, DIRTY_CLASS);
                parentForm.$setDirty();
            }

            this.$$parseAndValidate();
        };

        this.$$parseAndValidate = function () {
            var parserValid = true,
                viewValue = ctrl.$$lastCommittedViewValue,
                modelValue = viewValue,
                i = 0,
                prevModelValue,
                allowInvalid;

            function writeToModelIfNeeded() {
                if (ctrl.$modelValue !== prevModelValue) {
                    ctrl.$$writeModelToScope();
                }
            }

            for (i = 0; i < ctrl.$parsers.length; i += 1) {
                modelValue = ctrl.$parsers[i](modelValue);

                if (_.isUndefined(modelValue)) {
                    parserValid = false;
                    break;
                }
            }

            if (_.isNumber(ctrl.$modelValue) && isNaN(ctrl.$modelValue)) {
                // ctrl.$modelValue has not been touched yet...
                ctrl.$modelValue = ngModelGet();
            }

            prevModelValue = ctrl.$modelValue;
            allowInvalid = ctrl.$options && ctrl.$options.allowInvalid;

            if (allowInvalid) {
                ctrl.$modelValue = modelValue;
                writeToModelIfNeeded();
            }

            ctrl.$$runValidators(
                parserValid,
                modelValue,
                viewValue,
                function () {
                    if (!allowInvalid) {
                        ctrl.$modelValue = ctrl.$valid ? modelValue : undefined;
                        writeToModelIfNeeded();
                    }
                }
            );
        };

        this.$$writeModelToScope = function () {
            ngModelSet(ctrl.$modelValue);

            forEach(
                ctrl.$viewChangeListeners,
                function (listener) {
                    try {
                        listener();
                    } catch(e) {
                        $exceptionHandler(e);
                    }
                }
            );
        };

        this.$setViewValue = function (value, trigger) {
            ctrl.$viewValue = value;
            if (!ctrl.$options || ctrl.$options.updateOnDefault) {
                ctrl.$$debounceViewValueCommit(trigger);
            }
        };

        this.$$debounceViewValueCommit = function (trigger) {
            var debounceDelay = 0,
                options = ctrl.$options,
                debounce;

            if (options && isDefined(options.debounce)) {
                debounce = options.debounce;
                if (_.isNumber(debounce)) {
                    debounceDelay = debounce;
                } else if (_.isNumber(debounce[trigger])) {
                    debounceDelay = debounce[trigger];
                } else if (_.isNumber(debounce['default'])) {
                    debounceDelay = debounce['default'];
                }
            }

            $timeout.cancel(pendingDebounce);

            if (debounceDelay) {
                pendingDebounce = $timeout(
                    function () {
                        ctrl.$commitViewValue();
                    },
                    debounceDelay
                );
            } else if ($rootScope.$$phase) {
                ctrl.$commitViewValue();
            } else {
                $scope.$apply(function () {
                    ctrl.$commitViewValue();
                });
            }
        };

        parentForm = $element.inheritedData('$formController') || nullFormCtrl;

        // Setup initial state of the control
        $element
            .addClass(PRISTINE_CLASS)
            .addClass(UNTOUCHED_CLASS);

        addSetValidityMethod(
            {
                ctrl: this,
                $element: $element,
                set: function (object, property) {
                    object[property] = true;
                },
                unset: function (object, property) {
                    delete object[property];
                },
                parentForm: parentForm,
                $animate: $animate
            }
        );

        // model -> value
        $scope.$watch(function ngModelWatch() {
            var modelValue = ngModelGet(),
                formatters,
                idx,
                viewValue;

            // if scope model value and ngModel value are out of sync
            // TODO(perf): why not move this to the action fn?
            if (modelValue !== ctrl.$modelValue) {

                ctrl.$modelValue = modelValue;

                formatters = ctrl.$formatters;
                idx = formatters.length;
                viewValue = modelValue;

                while (idx) {
                    idx -= 1;
                    viewValue = formatters[idx](viewValue);
                }

                if (ctrl.$viewValue !== viewValue) {
                    ctrl.$viewValue = ctrl.$$lastCommittedViewValue = viewValue;
                    ctrl.$render();

                    ctrl.$$runValidators(undefined, modelValue, viewValue, noop);
                }
            }

            return modelValue;
        });
    }];

    ngModelDirective = function () {
            return {
                restrict: 'A',
                require: ['ngModel', '^?form', '^?ngModelOptions'],
                controller: NgModelController,
                link: {
                    pre: function (scope, element, attr, ctrls) {
                        var modelCtrl = ctrls[0],
                            formCtrl = ctrls[1] || nullFormCtrl;

                        modelCtrl.$$setOptions(ctrls[2] && ctrls[2].$options);

                        // notify others, especially parent forms
                        formCtrl.$addControl(modelCtrl);

                        scope.$on('$destroy', function () {
                            formCtrl.$removeControl(modelCtrl);
                        });
                    },
                    post: function (scope, element, attr, ctrls) {
                        var modelCtrl = ctrls[0];
                        if (modelCtrl.$options && modelCtrl.$options.updateOn) {
                            element.on(modelCtrl.$options.updateOn, function (ev) {
                                modelCtrl.$$debounceViewValueCommit(ev && ev.type);
                            });
                        }

                        element.on('blur', function (ev) {
                            if (modelCtrl.$touched) { return; }

                            scope.$apply(function () {
                                modelCtrl.$setTouched();
                            });
                        });
                    }
                }
            };
        };

    ngChangeDirective = valueFn({
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ctrl) {
            ctrl.$viewChangeListeners.push(function () {
                scope.$eval(attr.ngChange);
            });
        }
    });

    requiredDirective = function () {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope, elm, attr, ctrl) {
                    if (!ctrl) { return; }
                    attr.required = true; // force truthy in case we are on non input element
                    ctrl.$validators.required = function (modelValue, viewValue) {
                        return !attr.required || !ctrl.$isEmpty(viewValue);
                    };

                    attr.$observe('required', function () {
                        ctrl.$validate();
                    });
                }
            };
        };

    patternDirective = function () {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope, elm, attr, ctrl) {
                    if (!ctrl) { return; }

                    var regexp, patternExp = attr.ngPattern || attr.pattern;
                    attr.$observe('pattern', function (regex) {
                        if (_.isString(regex) && regex.length > 0) {
                            regex = new RegExp(regex);
                        }

                        if (regex && !regex.test) {
                            throw minErr('ngPattern')('noregexp', 'Expected {0} to be a RegExp but was {1}. Element: {2}', patternExp, regex, startingTag(elm));
                        }

                        regexp = regex || undefined;
                        ctrl.$validate();
                    });

                    ctrl.$validators.pattern = function (value) {
                        return ctrl.$isEmpty(value) || _.isUndefined(regexp) || regexp.test(value);
                    };
                }
            };
        };

    maxlengthDirective = function () {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope, elm, attr, ctrl) {
                    if (!ctrl) { return; }

                    var maxlength = 0;
                    attr.$observe('maxlength', function (value) {
                        maxlength = parseInt(value, 10) || 0;
                        ctrl.$validate();
                    });
                    ctrl.$validators.maxlength = function (modelValue, viewValue) {
                        return ctrl.$isEmpty(viewValue) || viewValue.length <= maxlength;
                    };
                }
            };
        };

    minlengthDirective = function () {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope, elm, attr, ctrl) {
                    if (!ctrl) { return; }

                    var minlength = 0;
                    attr.$observe('minlength', function (value) {
                        minlength = parseInt(value, 10) || 0;
                        ctrl.$validate();
                    });
                    ctrl.$validators.minlength = function (modelValue, viewValue) {
                        return ctrl.$isEmpty(viewValue) || viewValue.length >= minlength;
                    };
                }
            };
        };

    ngListDirective = function () {
            return {
                restrict: 'A',
                priority: 100,
                require: 'ngModel',
                link: function (scope, element, attr, ctrl) {
                    // We want to control whitespace trimming so we use this convoluted approach
                    // to access the ngList attribute, which doesn't pre-trim the attribute
                    var ngList = element.attr(attr.$attr.ngList) || ', ',
                        trimValues = attr.ngTrim !== 'false',
                        separator = trimValues ? trim(ngList) : ngList,
                        parse = function (viewValue) {
                            // If the viewValue is invalid (say required but empty) it will be `undefined`
                            if (_.isUndefined(viewValue)) { return undefined; }

                            var list = [];

                            if (viewValue) {
                                forEach(viewValue.split(separator), function (value) {
                                    if (value) { list.push(trimValues ? trim(value) : value); }
                                });
                            }

                            return list;
                        };

                    ctrl.$parsers.push(parse);
                    ctrl.$formatters.push(function (value) {
                        if (_.isArray(value)) {
                            return value.join(ngList);
                        }

                        return undefined;
                    });

                    // Override the standard $isEmpty because an empty array means the input is empty.
                    ctrl.$isEmpty = function (value) {
                        return !value || !value.length;
                    };
                }
            };
        };

    ngValueDirective = function () {
            return {
                restrict: 'A',
                priority: 100,
                compile: function (tpl, tplAttr) {
                    if (CONSTANT_VALUE_REGEXP.test(tplAttr.ngValue)) {
                        return function ngValueConstantLink(scope, elm, attr) {
                            attr.$set('value', scope.$eval(attr.ngValue));
                        };
                    }

                    return function ngValueLink(scope, elm, attr) {
                        scope.$watch(attr.ngValue, function valueWatchAction(value) {
                            attr.$set('value', value);
                        });
                    };
                }
            };
        };

    ngModelOptionsDirective = function () {
            return {
                restrict: 'A',
                controller: ['$scope', '$attrs', function ($scope, $attrs) {
                    var that = this;
                    this.$options = $scope.$eval($attrs.ngModelOptions);
                    // Allow adding/overriding bound events
                    if (this.$options.updateOn !== undefined) {
                        this.$options.updateOnDefault = false;
                        // extract "default" pseudo-event from list of events that can trigger a model update
                        this.$options.updateOn = trim(this.$options.updateOn.replace(DEFAULT_REGEXP, function () {
                            that.$options.updateOnDefault = true;
                            return ' ';
                        }));
                    } else {
                        this.$options.updateOnDefault = true;
                    }
                }]
            };
        };

    ngBindDirective = ['$compile', function($compile) {
        return {
            restrict: 'AC',
            compile: function ngBindCompile(templateElement) {
                $compile.$$addBindingClass(templateElement);

                return function ngBindLink(scope, element, attr) {
                    $compile.$$addBindingInfo(element, attr.ngBind);
                    scope.$watch(
                        attr.ngBind,
                        function ngBindWatchAction(value) {
                            // We are purposefully using == here rather than === because we want to
                            // catch when value is "null or undefined"
                            // jshint -W041
                            element.text(value == undefined ? '' : value);
                        }
                    );
                };
            }
        };
    }];

    ngBindTemplateDirective = ['$interpolate', '$compile', function($interpolate, $compile) {
        return {
            compile: function ngBindTemplateCompile(templateElement) {
                $compile.$$addBindingClass(templateElement);
                return function ngBindTemplateLink(scope, element, attr) {
                    var interpolateFn = $interpolate(element.attr(attr.$attr.ngBindTemplate));

                    $compile.$$addBindingInfo(element, interpolateFn.expressions);
                    attr.$observe(
                        'ngBindTemplate',
                        function (value) {
                            element.text(value);
                        }
                    );
                };
            }
        };
    }];

    ngBindHtmlDirective = ['$sce', '$parse', '$compile', function ($sce, $parse, $compile) {
        return {
            restrict: 'A',
            compile: function ngBindHtmlCompile(tElement, tAttrs) {
                var ngBindHtmlGetter = $parse(tAttrs.ngBindHtml),
                    ngBindHtmlWatch = $parse(
                        tAttrs.ngBindHtml,
                        function getStringValue(value) {
                            return (value || '').toString();
                        }
                    );

                $compile.$$addBindingClass(tElement);

                return function ngBindHtmlLink(scope, element, attr) {
                    $compile.$$addBindingInfo(element, attr.ngBindHtml);

                    scope.$watch(
                        ngBindHtmlWatch,
                        function ngBindHtmlWatchAction() {
                            // we re-evaluate the expr because we want a TrustedValueHolderType
                            // for $sce, not a string
                            element.html($sce.getTrustedHtml(ngBindHtmlGetter(scope)) || '');
                        }
                    );
                };
            }
        };
    }];

    function classDirective(name, selector) {
        name = 'ngClass' + name;
        return ['$animate', function ($animate) {

            function arrayDifference(tokens1, tokens2) {
                var values = [],
                    i = 0,
                    token,
                    j = 0;

                outer: for (i = 0; i < tokens1.length; i += 1) {
                    token = tokens1[i];
                    for (j = 0; j < tokens2.length; j += 1) {
                        if (token == tokens2[j]) { continue outer; }
                    }
                    values.push(token);
                }
                return values;
            }

            function arrayClasses(classVal) {
                if (_.isArray(classVal)) {
                    return classVal;
                }

                if (_.isString(classVal)) {
                    return classVal.split(' ');
                }

                if (_.isObject(classVal)) {
                    var classes = [];
                    forEach(classVal, function (v, k) {
                        if (v) {
                            classes = classes.concat(k.split(' '));
                        }
                    });
                    return classes;
                }

                return classVal;
            }

            return {
                restrict: 'AC',
                link: function (scope, element, attr) {
                    var oldVal;

                    function digestClassCounts(classes, count) {
                        var classCounts = element.data('$classCounts') || {},
                            classesToUpdate = [];

                        forEach(classes, function (className) {
                            if (count > 0 || classCounts[className]) {
                                classCounts[className] = (classCounts[className] || 0) + count;
                                if (classCounts[className] === +(count > 0)) {
                                    classesToUpdate.push(className);
                                }
                            }
                        });
                        element.data('$classCounts', classCounts);
                        return classesToUpdate.join(' ');
                    }

                    function addClasses(classes) {
                        var newClasses = digestClassCounts(classes, 1);
                        attr.$addClass(newClasses);
                    }

                    function removeClasses(classes) {
                        var newClasses = digestClassCounts(classes, -1);
                        attr.$removeClass(newClasses);
                    }

                    function updateClasses(oldClasses, newClasses) {
                        var toAdd = arrayDifference(newClasses, oldClasses),
                            toRemove = arrayDifference(oldClasses, newClasses);

                        toAdd = digestClassCounts(toAdd, 1);
                        toRemove = digestClassCounts(toRemove, -1);

                        if (toAdd && toAdd.length) {
                            $animate.addClass(element, toAdd);
                        }

                        if (toRemove && toRemove.length) {
                            $animate.removeClass(element, toRemove);
                        }
                    }

                    function ngClassWatchAction(newVal) {
                        var newClasses = [],
                            oldClasses = [];

                        if (selector === true || scope.$index % 2 === selector) {
                            newClasses = arrayClasses(newVal || []);
                            if (!oldVal) {
                                addClasses(newClasses);
                            } else if (!equals(newVal, oldVal)) {
                                oldClasses = arrayClasses(oldVal);
                                updateClasses(oldClasses, newClasses);
                            }
                        }
                        oldVal = shallowCopy(newVal);
                    }

                    scope.$watch(attr[name], ngClassWatchAction, true);

                    attr.$observe('class', function (value) {
                        ngClassWatchAction(scope.$eval(attr[name]));
                    });

                    if (name !== 'ngClass') {
                        scope.$watch('$index', function ($index, old$index) {
                            // jshint bitwise: false
                            var mod = $index & 1,
                                classes;
                            if (mod !== (old$index & 1)) {
                                classes = arrayClasses(scope.$eval(attr[name]));
                                if (mod === selector) {
                                    addClasses(classes);
                                } else {
                                    removeClasses(classes);
                                }
                            }
                        });
                    }
                }
            };
        }];
    }

    ngClassDirective = classDirective('', true);

    ngClassOddDirective = classDirective('Odd', 0);

    ngClassEvenDirective = classDirective('Even', 1);

    ngCloakDirective = ngDirective({
        compile: function (element, attr) {
            attr.$set('ngCloak', undefined);
            element.removeClass('ng-cloak');
        }
    });

    ngControllerDirective = [function () {
        return {
            restrict: 'A',
            scope: true,
            controller: '@',
            priority: 500
        };
    }];

    forEach(['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove', 'mouseenter', 'mouseleave', 'keydown', 'keyup', 'keypress', 'submit', 'focus', 'blur', 'copy', 'cut', 'paste'], function (name) {
        var directiveName = directiveNormalize('ng-' + name);

        ngEventDirectives[directiveName] = ['$parse', '$rootScope', function ($parse, $rootScope) {
            return {
                restrict: 'A',
                compile: function ($element, attr) {
                    var fn = $parse(attr[directiveName]);
                    return function ngEventHandler(scope, element) {
                        var eventName = lowercase(name);

                        element.on(
                            eventName,
                            function (event) {
                                var callback = function () {
                                    fn(scope, { $event: event });
                                };

                                if (forceAsyncEvents[eventName] && $rootScope.$$phase) {
                                    scope.$evalAsync(callback);
                                } else {
                                    scope.$apply(callback);
                                }
                            }
                        );
                    };
                }
            };
        }];
    });

    if (msos.config.verbose) {
        msos.console.debug('ng - ngEventDirectives -> created:', _.keys(ngEventDirectives));
    }

    ngIfDirective = ['$animate', function ($animate) {
        return {
            multiElement: true,
            transclude: 'element',
            priority: 600,
            terminal: true,
            restrict: 'A',
            $$tlb: true,
            link: function ($scope, $element, $attr, ctrl, $transclude) {
                var block, childScope, previousElements;
                $scope.$watch($attr.ngIf, function ngIfWatchAction(value) {

                    if (value) {
                        if (!childScope) {
                            $transclude(function (clone, newScope) {
                                childScope = newScope;
                                // was: clone[clone.length++] -> ambiguous use of ++
                                clone[clone.length] = document.createComment(' end ngIf: ' + $attr.ngIf + ' ');
                                // Note: We only need the first/last node of the cloned nodes.
                                // However, we need to keep the reference to the jqlite wrapper as it might be changed later
                                // by a directive with templateUrl when its template arrives.
                                block = {
                                    clone: clone
                                };
                                $animate.enter(clone, $element.parent(), $element);
                            });
                        }
                    } else {
                        if (previousElements) {
                            previousElements.remove();
                            previousElements = null;
                        }
                        if (childScope) {
                            childScope.$destroy();
                            childScope = null;
                        }
                        if (block) {
                            previousElements = getBlockNodes(block.clone);
                            $animate.leave(previousElements).then(function () {
                                previousElements = null;
                            });
                            block = null;
                        }
                    }
                });
            }
        };
    }];

    ngIncludeDirective = ['$templateRequest', '$anchorScroll', '$animate', '$sce',
                  function($templateRequest,   $anchorScroll,   $animate,   $sce) {
        return {
            restrict: 'ECA',
            priority: 400,
            terminal: true,
            transclude: 'element',
            controller: angular.noop,
            compile: function (element, attr) {
                var srcExp = attr.ngInclude || attr.src,
                    onloadExp = attr.onload || '',
                    autoScrollExp = attr.autoscroll;

                return function (scope, $element, $attr, ctrl, $transclude) {
                    var changeCounter = 0,
                        currentScope,
                        previousElement,
                        currentElement,
                        cleanupLastIncludeContent = function () {
                            if (previousElement) {
                                previousElement.remove();
                                previousElement = null;
                            }
                            if (currentScope) {
                                currentScope.$destroy();
                                currentScope = null;
                            }

                            if (currentElement) {
                                $animate.leave(currentElement).then(function () {
                                    previousElement = null;
                                });
                                previousElement = currentElement;
                                currentElement = null;
                            }
                        };

                    scope.$watch($sce.parseAsResourceUrl(srcExp), function ngIncludeWatchAction(src) {

                        changeCounter += 1;

                        var afterAnimation = function () {
                                if (isDefined(autoScrollExp) && (!autoScrollExp || scope.$eval(autoScrollExp))) {
                                    $anchorScroll();
                                }
                            },
                            thisChangeId = changeCounter;

                        if (src) {
                            //set the 2nd param to true to ignore the template request error so that the inner
                            //contents and scope can be cleaned up.
                            $templateRequest(src, true).then(function (response) {
                                if (thisChangeId !== changeCounter) { return; }
                                var newScope = scope.$new(),
                                    clone;

                                ctrl.template = response;

                                clone = $transclude(newScope, function (clone) {
                                    cleanupLastIncludeContent();
                                    $animate.enter(clone, null, $element).then(afterAnimation);
                                });

                                currentScope = newScope;
                                currentElement = clone;

                                currentScope.$emit('$includeContentLoaded');
                                scope.$eval(onloadExp);
                            }, function () {
                                if (thisChangeId === changeCounter) {
                                    cleanupLastIncludeContent();
                                    scope.$emit('$includeContentError');
                                }
                            });
                            scope.$emit('$includeContentRequested');
                        } else {
                            cleanupLastIncludeContent();
                            ctrl.template = null;
                        }
                    });
                };
            }
        };
    }];

    ngIncludeFillContentDirective = ['$compile', function ($compile) {
        return {
            restrict: 'ECA',
            priority: -400,
            require: 'ngInclude',
            link: function (scope, $element, $attr, ctrl) {
                var fragment,
                    node;

                if (/SVG/.test($element[0].toString())) {
                    fragment = document.createDocumentFragment();

                    if (jqLiteIsTextNode(ctrl.template)) {
                        // Convert non-html into a text node
                        node = document.createTextNode(ctrl.template);
                        fragment.textContent = "";
                        fragment.innerHTML = "";
                        fragment.appendChild(node);

                        $element.empty();
                        $compile(fragment.childNodes)(
                            scope,
                            function namespaceAdaptedClone(clone) {
                                $element.append(clone);
                            },
                            undefined,
                            undefined,
                            $element
                        );
                    } else {
                        msos.console.error('ng - ngIncludeFillContentDirective -> failed, not html: ' + ctrl.template);
                    }

                    return;
                }

                $element.html(ctrl.template);
                $compile($element.contents())(scope);
            }
        };
    }];

    ngInitDirective = ngDirective({
        priority: 450,
        compile: function () {
            return {
                pre: function (scope, element, attrs) {
                    scope.$eval(attrs.ngInit);
                }
            };
        }
    });

    ngNonBindableDirective = ngDirective({
        terminal: true,
        priority: 1000
    });

    ngPluralizeDirective = ['$locale', '$interpolate', function ($locale, $interpolate) {
        var BRACE = /{}/g;
        return {
            restrict: 'EA',
            link: function (scope, element, attr) {
                var numberExp = attr.count,
                    whenExp = attr.$attr.when && element.attr(attr.$attr.when),
                    // we have {{}} in attrs
                    offset = attr.offset || 0,
                    whens = scope.$eval(whenExp) || {},
                    whensExpFns = {},
                    startSymbol = $interpolate.startSymbol(),
                    endSymbol = $interpolate.endSymbol(),
                    isWhen = /^when(Minus)?(.+)$/;

                forEach(attr, function (expression, attributeName) {
                    if (isWhen.test(attributeName)) {
                        whens[lowercase(attributeName.replace('when', '').replace('Minus', '-'))] = element.attr(attr.$attr[attributeName]);
                    }
                });
                forEach(whens, function (expression, key) {
                    whensExpFns[key] = $interpolate(expression.replace(BRACE, startSymbol + numberExp + '-' + offset + endSymbol));
                });

                scope.$watch(function ngPluralizeWatch() {
                    var value = parseFloat(scope.$eval(numberExp));

                    if (!isNaN(value)) {
                        //if explicit number rule such as 1, 2, 3... is defined, just use it. Otherwise,
                        //check it against pluralization rules in $locale service
                        if (!whens.hasOwnProperty(value)) { value = $locale.pluralCat(value - offset); }
                        return whensExpFns[value](scope);
                    }
                    
                    return '';
                }, function ngPluralizeWatchAction(newVal) {
                    element.text(newVal);
                });
            }
        };
    }];

    ngRepeatDirective = ['$parse', '$animate', function ($parse, $animate) {
        var NG_REMOVED = '$$NG_REMOVED',
            ngRepeatMinErr = minErr('ngRepeat'),
            updateScope = function (scope, index, valueIdentifier, value, keyIdentifier, key, arrayLength) {
                scope[valueIdentifier] = value;
                if (keyIdentifier) { scope[keyIdentifier] = key; }
                scope.$index = index;
                scope.$first = (index === 0);
                scope.$last = (index === (arrayLength - 1));
                scope.$middle = !(scope.$first || scope.$last);
                // jshint bitwise: false
                scope.$even = (index & 1);
                scope.$odd = (scope.$even !== 0);
                // jshint bitwise: true
            },
            getBlockStart = function (block) {
                return block.clone[0];
            },
            getBlockEnd = function (block) {
                return block.clone[block.clone.length - 1];
            };

        return {
            restrict: 'A',
            multiElement: true,
            transclude: 'element',
            priority: 1000,
            terminal: true,
            $$tlb: true,
            compile: function ngRepeatCompile($element, $attr) {
                
                var expression = $attr.ngRepeat,
                    ngRepeatEndComment = document.createComment(' end ngRepeat: ' + expression + ' '),
                    match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/),
                    lhs,
                    rhs,
                    aliasAs,
                    trackByExp,
                    valueIdentifier,
                    keyIdentifier,
                    trackByExpGetter,
                    trackByIdExpFn,
                    trackByIdArrayFn,
                    trackByIdObjFn,
                    hashFnLocals = {};

                if (!match) {
                    throw ngRepeatMinErr('iexp', "Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '{0}'.", expression);
                }

                lhs = match[1];
                rhs = match[2];
                aliasAs = match[3];
                trackByExp = match[4];

                match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);

                if (!match) {
                    throw ngRepeatMinErr('iidexp', "'_item_' in '_item_ in _collection_' should be an identifier or '(_key_, _value_)' expression, but got '{0}'.", lhs);
                }

                valueIdentifier = match[3] || match[1];
                keyIdentifier = match[2];

                if (aliasAs && (!/^[$a-zA-Z_][$a-zA-Z0-9_]*$/.test(aliasAs) || /^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent)$/.test(aliasAs))) {
                    throw ngRepeatMinErr('badident', "alias '{0}' is invalid --- must be a valid JS identifier which is not a reserved name.", aliasAs);
                }

                hashFnLocals = {
                    $id: hashKey
                };

                if (trackByExp) {
                    trackByExpGetter = $parse(trackByExp);
                } else {
                    trackByIdArrayFn = function (key, value) {
                        return hashKey(value);
                    };
                    trackByIdObjFn = function (key) {
                        return key;
                    };
                }

                return function ngRepeatLink($scope, $element, $attr, ctrl, $transclude) {

                    if (trackByExpGetter) {
                        trackByIdExpFn = function (key, value, index) {
                            // assign key, value, and $index to the locals so that they can be used in hash functions
                            if (keyIdentifier) { hashFnLocals[keyIdentifier] = key; }
                            hashFnLocals[valueIdentifier] = value;
                            hashFnLocals.$index = index;
                            return trackByExpGetter($scope, hashFnLocals);
                        };
                    }

                    // Store a list of elements from previous run. This is a hash where key is the item from the
                    // iterator, and the value is objects with following properties.
                    //   - scope: bound scope
                    //   - element: previous element.
                    //   - index: position
                    //
                    // We are using no-proto object so that we don't need to guard against inherited props via
                    // hasOwnProperty.
                    var lastBlockMap = createMap();

                    //watch props
                    $scope.$watchCollection(rhs, function ngRepeatAction(collection) {
                        var index, length, previousNode = $element[0],
                            // node that cloned nodes should be inserted after
                            // initialized to the comment node anchor
                            nextNode,
                            // Same as lastBlockMap but it has the current state. It will become the
                            // lastBlockMap on the next iteration.
                            nextBlockMap = createMap(),
                            collectionLength, key, value, // key/value of iteration
                            trackById, trackByIdFn, collectionKeys, block, // last object information {scope, element, id}
                            nextBlockOrder,
                            elementsToRemove,
                            itemKey,
                            blockKey;

                        if (aliasAs) {
                            $scope[aliasAs] = collection;
                        }

                        if (isArrayLike(collection)) {
                            collectionKeys = collection;
                            trackByIdFn = trackByIdExpFn || trackByIdArrayFn;
                        } else {
                            trackByIdFn = trackByIdExpFn || trackByIdObjFn;
                            // if object, extract keys, sort them and use to determine order of iteration over obj props
                            collectionKeys = [];
                            for (itemKey in collection) {
                                if (collection.hasOwnProperty(itemKey) && itemKey.charAt(0) !== '$') {
                                    collectionKeys.push(itemKey);
                                }
                            }
                            collectionKeys.sort();
                        }

                        collectionLength = collectionKeys.length;
                        nextBlockOrder = new Array(collectionLength);

                        // locate existing items
                        for (index = 0; index < collectionLength; index += 1) {
                            key = (collection === collectionKeys) ? index : collectionKeys[index];
                            value = collection[key];
                            trackById = trackByIdFn(key, value, index);
                            if (lastBlockMap[trackById]) {
                                // found previously seen block
                                block = lastBlockMap[trackById];
                                delete lastBlockMap[trackById];
                                nextBlockMap[trackById] = block;
                                nextBlockOrder[index] = block;
                            } else {
                                if (nextBlockMap[trackById]) {
                                    // if collision detected. restore lastBlockMap and throw an error
                                    /* jshint ignore:start */
                                    forEach(nextBlockOrder, function (block) {
                                        if (block && block.scope) { lastBlockMap[block.id] = block; }
                                    });
                                    /* jshint ignore:end */
                                    throw ngRepeatMinErr(
                                        'dupes',
                                        "Duplicates in a repeater are not allowed. Use 'track by' expression to specify unique keys. Repeater: {0}, Duplicate key: {1}, Duplicate value: {2}",
                                        expression,
                                        trackById,
                                        toJson(value)
                                    );
                                }
                                // new never before seen block
                                nextBlockOrder[index] = {
                                    id: trackById,
                                    scope: undefined,
                                    clone: undefined
                                };
                                nextBlockMap[trackById] = true;
                            }
                        }

                        // remove leftover items
                        for (blockKey in lastBlockMap) {

                            block = lastBlockMap[blockKey];
                            elementsToRemove = getBlockNodes(block.clone);
                            $animate.leave(elementsToRemove);

                            if (elementsToRemove[0].parentNode) {
                                // if the element was not removed yet because of pending animation, mark it as deleted
                                // so that we can ignore it later
                                for (index = 0, length = elementsToRemove.length; index < length; index += 1) {
                                    elementsToRemove[index][NG_REMOVED] = true;
                                }
                            }
                            block.scope.$destroy();
                        }

                        // we are not using forEach for perf reasons (trying to avoid #call)
                        for (index = 0; index < collectionLength; index += 1) {
                            key = (collection === collectionKeys) ? index : collectionKeys[index];
                            value = collection[key];
                            block = nextBlockOrder[index];

                            if (block.scope) {
                                // if we have already seen this object, then we need to reuse the
                                // associated scope/element
                                nextNode = previousNode;

                                // skip nodes that are already pending removal via leave animation
                                do {
                                    nextNode = nextNode.nextSibling;
                                } while (nextNode && nextNode[NG_REMOVED]);

                                if (getBlockStart(block) != nextNode) {
                                    // existing item which got moved
                                    $animate.move(getBlockNodes(block.clone), null, jqLite(previousNode));
                                }

                                previousNode = getBlockEnd(block);
                                updateScope(block.scope, index, valueIdentifier, value, keyIdentifier, key, collectionLength);
                            } else {
                                // new item which we don't know about
                                /* jshint ignore:start */
                                $transclude(function ngRepeatTransclude(clone, scope) {
                                    block.scope = scope;
                                    // http://jsperf.com/clone-vs-createcomment
                                    var endNode = ngRepeatEndComment.cloneNode(false);

                                    clone[clone.length] = endNode;  // was: clone[clone.length++] = endNode; which is really confusing (bad?)
                                    clone.length += 1;              // Bad cricket? But it dies otherwise!

                                    $animate.enter(clone, null, jqLite(previousNode));
                                    previousNode = endNode;
                                    // Note: We only need the first/last node of the cloned nodes.
                                    // However, we need to keep the reference to the jqlite wrapper as it might be changed later
                                    // by a directive with templateUrl when its template arrives.
                                    block.clone = clone;
                                    nextBlockMap[block.id] = block;
                                    updateScope(block.scope, index, valueIdentifier, value, keyIdentifier, key, collectionLength);
                                });
                                /* jshint ignore:end */
                            }
                        }
                        lastBlockMap = nextBlockMap;
                    });
                };
            }
        };
    }];

    ngShowDirective = ['$animate', function ($animate) {
        return {
            restrict: 'A',
            multiElement: true,
            link: function (scope, element, attr) {
                scope.$watch(attr.ngShow, function ngShowWatchAction(value) {
                    $animate[value ? 'removeClass' : 'addClass'](element, 'ng-hide');
                });
            }
        };
    }];

    ngHideDirective = ['$animate', function ($animate) {
        return {
            restrict: 'A',
            multiElement: true,
            link: function (scope, element, attr) {
                scope.$watch(attr.ngHide, function ngHideWatchAction(value) {
                    $animate[value ? 'addClass' : 'removeClass'](element, 'ng-hide');
                });
            }
        };
    }];

    ngStyleDirective = ngDirective(function (scope, element, attr) {
        scope.$watch(attr.ngStyle, function ngStyleWatchAction(newStyles, oldStyles) {
            if (oldStyles && (newStyles !== oldStyles)) {
                forEach(oldStyles, function (val, style) {
                    element.css(style, '');
                });
            }
            if (newStyles) { element.css(newStyles); }
        }, true);
    });

    ngSwitchDirective = ['$animate', function ($animate) {
        return {
            restrict: 'EA',
            require: 'ngSwitch',

            // asks for $scope to fool the BC controller module
            controller: ['$scope', function ngSwitchController() {
                this.cases = {};
            }],
            link: function (scope, element, attr, ngSwitchController) {
                var watchExpr = attr.ngSwitch || attr.on,
                    selectedTranscludes = [],
                    selectedElements = [],
                    previousLeaveAnimations = [],
                    selectedScopes = [],
                    spliceFactory = function (array, index) {
                        return function () { array.splice(index, 1); };
                    };

                scope.$watch(
                    watchExpr,
                    function ngSwitchWatchAction(value) {
                        var i,
                            ii,
                            selected,
                            promise;

                        for (i = 0, ii = previousLeaveAnimations.length; i < ii; i += 1) {
                            $animate.cancel(previousLeaveAnimations[i]);
                        }

                        previousLeaveAnimations.length = 0;

                        for (i = 0, ii = selectedScopes.length; i < ii; i += 1) {
                            selected = getBlockNodes(selectedElements[i].clone);
                            selectedScopes[i].$destroy();
                            promise = previousLeaveAnimations[i] = $animate.leave(selected);
                            promise.then(spliceFactory(previousLeaveAnimations, i));
                        }

                        selectedElements.length = 0;
                        selectedScopes.length = 0;

                    selectedTranscludes = ngSwitchController.cases['!' + value];

                    if (selectedTranscludes || ngSwitchController.cases['?']) {
                        forEach(selectedTranscludes, function (selectedTransclude) {
                            selectedTransclude.transclude(function (caseElement, selectedScope) {
                                selectedScopes.push(selectedScope);
                                var anchor = selectedTransclude.element,
                                    block = {};

                                caseElement[caseElement.length] = document.createComment(' end ngSwitchWhen: ');

                                block = {
                                    clone: caseElement
                                };

                                selectedElements.push(block);
                                $animate.enter(caseElement, anchor.parent(), anchor);
                            });
                        });
                    }
                });
            }
        };
    }];

    ngSwitchWhenDirective = ngDirective({
        transclude: 'element',
        priority: 1200,
        require: '^ngSwitch',
        multiElement: true,
        link: function (scope, element, attrs, ctrl, $transclude) {
            ctrl.cases['!' + attrs.ngSwitchWhen] = (ctrl.cases['!' + attrs.ngSwitchWhen] || []);
            ctrl.cases['!' + attrs.ngSwitchWhen].push({
                transclude: $transclude,
                element: element
            });
        }
    });

    ngSwitchDefaultDirective = ngDirective({
        transclude: 'element',
        priority: 1200,
        require: '^ngSwitch',
        multiElement: true,
        link: function (scope, element, attr, ctrl, $transclude) {
            ctrl.cases['?'] = (ctrl.cases['?'] || []);
            ctrl.cases['?'].push({
                transclude: $transclude,
                element: element
            });
        }
    });

    ngTranscludeDirective = ngDirective({
        restrict: 'EAC',
        link: function ($scope, $element, $attrs, controller, $transclude) {
            if (!$transclude) {
                throw minErr('ngTransclude')('orphan', 'Illegal use of ngTransclude directive in the template! ' + 'No parent directive that requires a transclusion found. ' + 'Element: {0}', startingTag($element));
            }

            $transclude(function (clone) {
                $element.empty();
                $element.append(clone);
            });
        }
    });

    scriptDirective = ['$templateCache', function ($templateCache) {
        return {
            restrict: 'E',
            terminal: true,
            compile: function (element, attr) {
                if (attr.type === 'text/ng-template') {
                    var templateUrl = attr.id,
                        // IE is not consistent, in scripts we have to read .text but in other nodes we have to read .textContent
                        text = element[0].text;

                    $templateCache.put(templateUrl, text);
                }
            }
        };
    }];

    ngOptionsMinErr = minErr('ngOptions');

    ngOptionsDirective = valueFn({
        restrict: 'A',
        terminal: true
    });

    selectDirective = ['$compile', '$parse', function ($compile, $parse) {

        var NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,
            nullModelCtrl = {
                $setViewValue: noop
            };

        return {
            restrict: 'E',
            require: ['select', '?ngModel'],
            controller: ['$element', '$scope', '$attrs', function ($element, $scope, $attrs) {
                var self = this,
                    optionsMap = {},
                    ngModelCtrl = nullModelCtrl,
                    nullOption,
                    unknownOption;

                self.databound = $attrs.ngModel;

                self.init = function (ngModelCtrl_, nullOption_, unknownOption_) {
                    ngModelCtrl = ngModelCtrl_;
                    nullOption = nullOption_;
                    unknownOption = unknownOption_;
                };

                self.addOption = function (value, element) {
                    assertNotHasOwnProperty(value, '"option value"');
                    optionsMap[value] = true;

                    if (ngModelCtrl.$viewValue === value) {
                        $element.val(value);
                        if (unknownOption.parent()) { unknownOption.remove(); }
                    }

                    if (element[0].hasAttribute('selected')) {
                        element[0].selected = true;
                    }
                };

                self.removeOption = function (value) {
                    if (this.hasOption(value)) {
                        delete optionsMap[value];
                        if (ngModelCtrl.$viewValue === value) {
                            this.renderUnknownOption(value);
                        }
                    }
                };

                self.renderUnknownOption = function (val) {
                    var unknownVal = '? ' + hashKey(val) + ' ?';
                    unknownOption.val(unknownVal);
                    $element.prepend(unknownOption);
                    $element.val(unknownVal);
                    unknownOption.prop('selected', true); // needed for IE
                };

                self.hasOption = function (value) {
                    return optionsMap.hasOwnProperty(value);
                };

                $scope.$on('$destroy', function () {
                    // disable unknown option so that we don't do work when the whole select is being destroyed
                    self.renderUnknownOption = noop;
                });
            }],

            link: function (scope, element, attr, ctrls) {

                // if ngModel is not defined, we don't need to do anything
                if (!ctrls[1]) { return; }

                var selectCtrl = ctrls[0],
                    ngModelCtrl = ctrls[1],
                    multiple = attr.multiple,
                    optionsExp = attr.ngOptions,
                    nullOption = false,
                    // if false, user will not be able to select it (used by ngOptions)
                    emptyOption,
                    renderScheduled = false,
                    // we can't just jqLite('<option>') since jqLite is not smart enough
                    // to create it in <select> and IE barfs otherwise.
                    optionTemplate = jqLite(document.createElement('option')),
                    optGroupTemplate = jqLite(document.createElement('optgroup')),
                    unknownOption = optionTemplate.clone(),
                    i = 0,
                    children = element.children();

                function setupAsSingle(scope, selectElement, ngModelCtrl, selectCtrl) {
                    ngModelCtrl.$render = function () {
                        var viewValue = ngModelCtrl.$viewValue;

                        if (selectCtrl.hasOption(viewValue)) {
                            if (unknownOption.parent()) { unknownOption.remove(); }
                            selectElement.val(viewValue);
                            if (viewValue === '') { emptyOption.prop('selected', true); } // to make IE9 happy
                        } else {
                            if (_.isUndefined(viewValue) && emptyOption) {
                                selectElement.val('');
                            } else {
                                selectCtrl.renderUnknownOption(viewValue);
                            }
                        }
                    };

                    selectElement.on('change', function () {
                        scope.$apply(function () {
                            if (unknownOption.parent()) { unknownOption.remove(); }
                            ngModelCtrl.$setViewValue(selectElement.val());
                        });
                    });
                }

                function setupAsMultiple(scope, selectElement, ctrl) {
                    var lastView;
                    ctrl.$render = function () {
                        var items = new HashMap(ctrl.$viewValue);
                        forEach(selectElement.find('option'), function (option) {
                            option.selected = isDefined(items.get(option.value));
                        });
                    };

                    // we have to do it on each watch since ngModel watches reference, but
                    // we need to work of an array, so we need to see if anything was inserted/removed
                    scope.$watch(function selectMultipleWatch() {
                        if (!equals(lastView, ctrl.$viewValue)) {
                            lastView = shallowCopy(ctrl.$viewValue);
                            ctrl.$render();
                        }
                    });

                    selectElement.on('change', function () {
                        scope.$apply(function () {
                            var array = [];
                            forEach(selectElement.find('option'), function (option) {
                                if (option.selected) {
                                    array.push(option.value);
                                }
                            });
                            ctrl.$setViewValue(array);
                        });
                    });
                }

                function setupAsOptions(scope, selectElement, ctrl) {

                    var match = optionsExp.match(NG_OPTIONS_REGEXP);

                    if (!match) {
                        throw ngOptionsMinErr(
                            'iexp',
                            "Expected expression in form of " + "'_select_ (as _label_)? for (_key_,)?_value_ in _collection_'" + " but got '{0}'. Element: {1}",
                            optionsExp,
                            startingTag(selectElement)
                        );
                    }

                    var displayFn = $parse(match[2] || match[1]),
                        valueName = match[4] || match[6],
                        keyName = match[5],
                        groupByFn = $parse(match[3] || ''),
                        valueFn_AO = $parse(match[2] ? match[1] : valueName),
                        valuesFn = $parse(match[7]),
                        track = match[8],
                        trackFn = track ? $parse(match[8]) : null,

                        optionGroupsCache = [
                            [{
                                element: selectElement,
                                label: ''
                            }]
                        ];

                    function getSelectedSet() {
                        var selectedSet = false,
                            modelValue,
                            locals = {},
                            trackIndex = 0;

                        if (multiple) {
                            modelValue = ctrl.$modelValue;
                            if (trackFn && _.isArray(modelValue)) {
                                selectedSet = new HashMap([]);
                                for (trackIndex = 0; trackIndex < modelValue.length; trackIndex += 1) {
                                    locals[valueName] = modelValue[trackIndex];
                                    selectedSet.put(trackFn(scope, locals), modelValue[trackIndex]);
                                }
                            } else {
                                selectedSet = new HashMap(modelValue);
                            }
                        }
                        return selectedSet;
                    }

                    function render() {
                        renderScheduled = false;

                        // Temporary location for the option groups before we render them
                        var optionGroups = {
                            '': []
                            },
                            optionGroupNames = [''],
                            optionGroupName,
                            optionGroup,
                            option,
                            existingParent,
                            existingOptions,
                            existingOption,
                            modelValue = ctrl.$modelValue,
                            values = valuesFn(scope) || [],
                            keys = keyName ? sortedKeys(values) : values,
                            key,
                            modelCast,
                            groupIndex,
                            index,
                            locals = {},
                            selected, selectedSet = getSelectedSet(),
                            lastElement,
                            element_r,
                            label;

                        // We now build up the list of options we need (we merge later)
                        for (index = 0; index < keys.length; index += 1) {

                            key = index;
                            if (keyName) {
                                key = keys[index];
                                if (key.charAt(0) === '$') { continue; }
                                locals[keyName] = key;
                            }

                            locals[valueName] = values[key];

                            optionGroupName = groupByFn(scope, locals) || '';

                            optionGroup = optionGroups[optionGroupName];

                            if (!optionGroup) {
                                optionGroup = optionGroups[optionGroupName] = [];
                                optionGroupNames.push(optionGroupName);
                            }

                            if (multiple) {
                                selected = isDefined(
                                selectedSet.remove(trackFn ? trackFn(scope, locals) : valueFn_AO(scope, locals)));
                            } else {
                                if (trackFn) {
                                    modelCast = {};
                                    modelCast[valueName] = modelValue;
                                    selected = trackFn(scope, modelCast) === trackFn(scope, locals);
                                } else {
                                    selected = modelValue === valueFn_AO(scope, locals);
                                }
                                // see if at least one item is selected
                                selectedSet = selectedSet || selected;
                            }
                            // what will be seen by the user
                            label = displayFn(scope, locals);
                            // doing displayFn(scope, locals) || '' overwrites zero values
                            label = isDefined(label) ? label : '';
                            optionGroup.push({
                                // either the index into array or key from object
                                id: trackFn ? trackFn(scope, locals) : (keyName ? keys[index] : index),
                                label: label,
                                selected: selected
                            });
                        }

                        if (!multiple) {
                            if (nullOption || modelValue === null) {
                                // insert null option if we have a placeholder,
                                // or the model is null
                                optionGroups[''].unshift({
                                    id: '',
                                    label: '',
                                    selected: !selectedSet
                                });
                            } else if (!selectedSet) {
                                // option could not be found,
                                // we have to insert the undefined item
                                optionGroups[''].unshift({
                                    id: '?',
                                    label: '',
                                    selected: true
                                });
                            }
                        }

                        // Now we need to update the list of DOM nodes to
                        // match the optionGroups we computed above
                        for (groupIndex = 0; groupIndex < optionGroupNames.length; groupIndex += 1) {
                            // current option group name or '' if no group
                            optionGroupName = optionGroupNames[groupIndex];

                            // list of options for that group.
                            // (first item has the parent)
                            optionGroup = optionGroups[optionGroupName];

                            if (optionGroupsCache.length <= groupIndex) {
                                // we need to grow the optionGroups
                                existingParent = {
                                    element: optGroupTemplate.clone().attr('label', optionGroupName),
                                    label: optionGroup.label
                                };
                                existingOptions = [existingParent];
                                optionGroupsCache.push(existingOptions);
                                selectElement.append(existingParent.element);
                            } else {
                                existingOptions = optionGroupsCache[groupIndex];
                                // either SELECT (no group) or OPTGROUP element
                                existingParent = existingOptions[0];
                                // update the OPTGROUP label if not the same.
                                if (existingParent.label !== optionGroupName) {
                                    existingParent.label = optionGroupName;
                                    existingParent.element.attr('label', existingParent.label);
                                }
                            }

                            lastElement = null; // start at the beginning
                            for (index = 0; index < optionGroup.length; index += 1) {
                                option = optionGroup[index];
                                existingOption = existingOptions[index + 1];
                                if (existingOption) {
                                    // reuse elements
                                    lastElement = existingOption.element;
                                    if (existingOption.label !== option.label) {
                                        existingOption.label = option.label;
                                        lastElement.text(existingOption.label);
                                    }
                                    if (existingOption.id !== option.id) {
                                        existingOption.id = option.id;
                                        lastElement.val(existingOption.id);
                                    }
                                    // lastElement.prop('selected') provided by
                                    // jQuery has side-effects
                                    if (lastElement[0].selected !== option.selected) {
                                        existingOption.selected = option.selected;
                                        lastElement.prop('selected', existingOption.selected);
                                        if (msie) {
                                            lastElement.prop('selected', existingOption.selected);
                                        }
                                    }
                                } else {
                                    // grow elements
                                    // if it's a null option
                                    if (option.id === '' && nullOption) {
                                        // put back the pre-compiled element
                                        element_r = nullOption;
                                    } else {
                                        element_r = optionTemplate.clone();
                                        element_r.val(option.id).prop('selected', option.selected).attr('selected', option.selected).text(option.label);
                                    }

                                    existingOption = {
                                        element: element_r,
                                        label: option.label,
                                        id: option.id,
                                        selected: option.selected
                                    };

                                    existingOptions.push(existingOption);

                                    if (lastElement) {
                                        lastElement.after(element_r);
                                    } else {
                                        existingParent.element.append(element_r);
                                    }
                                    lastElement = element_r;
                                }
                            }
                            // remove any excessive OPTIONs in a group
                            // increment since the existingOptions[0] is parent
                            // element, not OPTION
                            index += 1;
                            while (existingOptions.length > index) {
                                existingOptions.pop().element.remove();
                            }
                        }
                        // remove any excessive OPTGROUPs from select
                        while (optionGroupsCache.length > groupIndex) {
                            optionGroupsCache.pop()[0].element.remove();
                        }
                    }

                    function scheduleRendering() {
                        if (!renderScheduled) {
                            scope.$$postDigest(render);
                            renderScheduled = true;
                        }
                    }

                    if (nullOption) {
                        // compile the element since there might be bindings in it
                        $compile(nullOption)(scope);

                        // remove the class, which is added automatically because we
                        // recompile the element and it becomes the compilation root
                        nullOption.removeClass('ng-scope');

                        // we need to remove it before calling selectElement.empty()
                        // because otherwise IE will remove the label from the element. wtf?
                        nullOption.remove();
                    }

                    // clear contents, we'll add what's needed based on the model
                    selectElement.empty();

                    selectElement.on('change', function () {
                        scope.$apply(function () {
                            var optionGroup, collection = valuesFn(scope) || [],
                                locals = {},
                                key,
                                value,
                                optionElement,
                                index,
                                groupIndex,
                                trackIndex;

                            if (multiple) {
                                value = [];
                                for (groupIndex = 0; groupIndex < optionGroupsCache.length; groupIndex += 1) {
                                    // list of options for that group. (first item has the parent)
                                    optionGroup = optionGroupsCache[groupIndex];

                                    for (index = 1; index < optionGroup.length; index += 1) {
                                        optionElement = optionGroup[index].element;
                                        if (optionElement[0].selected) {
                                            key = optionElement.val();
                                            if (keyName) { locals[keyName] = key; }
                                            if (trackFn) {
                                                for (trackIndex = 0; trackIndex < collection.length; trackIndex += 1) {
                                                    locals[valueName] = collection[trackIndex];
                                                    if (trackFn(scope, locals) === key) { break; }
                                                }
                                            } else {
                                                locals[valueName] = collection[key];
                                            }
                                            value.push(valueFn_AO(scope, locals));
                                        }
                                    }
                                }
                            } else {
                                key = selectElement.val();
                                if (key === '?') {
                                    value = undefined;
                                } else if (key === '') {
                                    value = null;
                                } else {
                                    if (trackFn) {
                                        for (trackIndex = 0; trackIndex < collection.length; trackIndex += 1) {
                                            locals[valueName] = collection[trackIndex];
                                            if (trackFn(scope, locals) === key) {
                                                value = valueFn_AO(scope, locals);
                                                break;
                                            }
                                        }
                                    } else {
                                        locals[valueName] = collection[key];
                                        if (keyName) { locals[keyName] = key; }
                                        value = valueFn_AO(scope, locals);
                                    }
                                }
                            }
                            ctrl.$setViewValue(value);
                            render();
                        });
                    });

                    ctrl.$render = render;

                    scope.$watchCollection(valuesFn, scheduleRendering);

                    if (multiple) {
                        scope.$watchCollection(
                            function () {
                                return ctrl.$modelValue;
                            },
                            scheduleRendering);
                    }
                }

                // find "null" option
                for (i = 0; i < children.length; i += 1) {
                    if (children[i].value === '') {
                        emptyOption = nullOption = children.eq(i);
                        break;
                    }
                }

                selectCtrl.init(ngModelCtrl, nullOption, unknownOption);

                // required validator
                if (multiple) {
                    ngModelCtrl.$isEmpty = function (value) {
                        return !value || value.length === 0;
                    };
                }

                if (optionsExp)     { setupAsOptions(scope, element, ngModelCtrl); }
                else if (multiple)  { setupAsMultiple(scope, element, ngModelCtrl); }
                else                { setupAsSingle(scope, element, ngModelCtrl, selectCtrl); }
            }
        };
    }];

    optionDirective = ['$interpolate', function ($interpolate) {
        var nullSelectCtrl = {
            addOption: noop,
            removeOption: noop
        };

        return {
            restrict: 'E',
            priority: 100,
            compile: function (element, attr) {
                var interpolateFn;

                if (_.isUndefined(attr.value)) {
                    interpolateFn = $interpolate(element.text(), true);
                    if (!interpolateFn) {
                        attr.$set('value', element.text());
                    }
                }

                return function (scope, element, attr) {
                    var selectCtrlName = '$selectController',
                        parent = element.parent(),
                        selectCtrl = parent.data(selectCtrlName) || parent.parent().data(selectCtrlName); // in case we are in optgroup

                    if (selectCtrl && selectCtrl.databound) {
                        // For some reason Opera defaults to true and if not overridden this messes up the repeater.
                        // We don't want the view to drive the initialization of the model anyway.
                        element.prop('selected', false);
                    } else {
                        selectCtrl = nullSelectCtrl;
                    }

                    if (interpolateFn) {
                        scope.$watch(interpolateFn, function interpolateWatchAction(newVal, oldVal) {
                            attr.$set('value', newVal);
                            if (oldVal !== newVal) {
                                selectCtrl.removeOption(oldVal);
                            }
                            selectCtrl.addOption(newVal, element);
                        });
                    } else {
                        selectCtrl.addOption(attr.value, element);
                    }

                    element.on('$destroy', function () {
                        selectCtrl.removeOption(attr.value);
                    });
                };
            }
        };
    }];

    styleDirective = valueFn({
        restrict: 'E',
        terminal: false
    });

    function publishExternalAPI(angular) {

        var temp_pe = 'ng - publishExternalAPI';

        msos.console.debug(temp_pe + ' -> start.');

        extend(angular, {
            'bootstrap': bootstrap,
            'copy': copy,
            'extend': extend,
            'equals': equals,
            'element': jqLite,
            'forEach': forEach,
            'injector': createInjector,
            'noop': noop,
            'bind': _.bind,
            'toJson': toJson,
            'fromJson': fromJson,
            'identity': identity,
            'isUndefined': _.isUndefined,
            'isDefined': isDefined,
            'isString': _.isString,
            'isFunction': _.isFunction,
            'isObject': _.isObject,
            'isNumber': _.isNumber,
            'isElement': isElement,
            'isArray': _.isArray,
            'version': version,
            'isDate': _.isDate,
            'lowercase': lowercase,
            'uppercase': uppercase,
            'callbacks': {
                counter: 0
            },
            '$$minErr': minErr,
            '$$csp': csp,
            'getTestability': getTestability,
            'reloadWithDebugInfo': reloadWithDebugInfo,
            '$$hasClass': jqLiteHasClass
        });

        angularModule = setupModuleLoader(window);

        // Load internal ngLocale (was try -> then internal, but we can load with ng.util.postloader instead)
        angularModule('ngLocale', []).provider('$locale', $LocaleProvider);

        angularModule('ng', ['ngLocale'], ['$provide', function ngModule($provide) {

            msos.console.debug(temp_pe + ' - ngModule -> start.');

            // $$sanitizeUriProvider needs to be before $compileProvider as it is used by it.
            $provide.provider({
                $$sanitizeUri: $$SanitizeUriProvider
            });

            $provide.provider('$compile', $CompileProvider).
            directive({
                a: htmlAnchorDirective,
                input: inputDirective,
                textarea: inputDirective,
                form: formDirective,
                script: scriptDirective,
                select: selectDirective,
                style: styleDirective,
                option: optionDirective,
                ngBind: ngBindDirective,
                ngBindHtml: ngBindHtmlDirective,
                ngBindTemplate: ngBindTemplateDirective,
                ngClass: ngClassDirective,
                ngClassEven: ngClassEvenDirective,
                ngClassOdd: ngClassOddDirective,
                ngCloak: ngCloakDirective,
                ngController: ngControllerDirective,
                ngForm: ngFormDirective,
                ngHide: ngHideDirective,
                ngIf: ngIfDirective,
                ngInclude: ngIncludeDirective,
                ngInit: ngInitDirective,
                ngNonBindable: ngNonBindableDirective,
                ngPluralize: ngPluralizeDirective,
                ngRepeat: ngRepeatDirective,
                ngShow: ngShowDirective,
                ngStyle: ngStyleDirective,
                ngSwitch: ngSwitchDirective,
                ngSwitchWhen: ngSwitchWhenDirective,
                ngSwitchDefault: ngSwitchDefaultDirective,
                ngOptions: ngOptionsDirective,
                ngTransclude: ngTranscludeDirective,
                ngModel: ngModelDirective,
                ngList: ngListDirective,
                ngChange: ngChangeDirective,
                pattern: patternDirective,
                ngPattern: patternDirective,
                required: requiredDirective,
                ngRequired: requiredDirective,
                minlength: minlengthDirective,
                ngMinlength: minlengthDirective,
                maxlength: maxlengthDirective,
                ngMaxlength: maxlengthDirective,
                ngValue: ngValueDirective,
                ngModelOptions: ngModelOptionsDirective
            }).
            directive({
                ngInclude: ngIncludeFillContentDirective
            }).
            directive(ngAttributeAliasDirectives).
            directive(ngEventDirectives);
            $provide.provider({
                $anchorScroll: $AnchorScrollProvider,
                $animate: $AnimateProvider,
                $browser: $BrowserProvider,
                $cacheFactory: $CacheFactoryProvider,
                $controller: $ControllerProvider,
                $document: $DocumentProvider,
                $exceptionHandler: $ExceptionHandlerProvider,
                $filter: $FilterProvider,
                $interpolate: $InterpolateProvider,
                $interval: $IntervalProvider,
                $http: $HttpProvider,
                $httpBackend: $HttpBackendProvider,
                $location: $LocationProvider,
                $log: $LogProvider,
                $parse: $ParseProvider,
                $rootScope: $RootScopeProvider,
                $q: $QProvider,
                $$q: $$QProvider,
                $sce: $SceProvider,
                $sceDelegate: $SceDelegateProvider,
                $sniffer: $SnifferProvider,
                $templateCache: $TemplateCacheProvider,
                $templateRequest: $TemplateRequestProvider,
                $$testability: $$TestabilityProvider,
                $timeout: $TimeoutProvider,
                $window: $WindowProvider,
                $$rAF: $$RAFProvider,
                $$asyncCallback: $$AsyncCallbackProvider
            });

            msos.console.debug(temp_pe + ' - ngModule -> done!');
        }]);

        msos.console.debug(temp_pe + ' -> done!');
    }

    // Run this puppy...
    bindJQuery();

    publishExternalAPI(angular);

}(window, document));

msos.console.info('ng/core -> done!');
msos.console.timeEnd('ng');