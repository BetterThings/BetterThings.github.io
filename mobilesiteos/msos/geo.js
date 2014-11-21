/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy representation conversion functions (c) Chris Veness 2002-2011                        */
/*   - www.movable-type.co.uk/scripts/latlong.html                                                */
/*                                                                                                */
/*  Sample usage:                                                                                 */
/*    var lat = Geo.parseDMS('51° 28′ 40.12″ N');                                                 */
/*    var lon = Geo.parseDMS('000° 00′ 05.31″ W');                                                */
/*    var p1 = new LatLon(lat, lon);                                                              */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

// Standard script with comments removed, checked with jslint and loaded via MobileSiteOS

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.geo");

msos.geo.version = new msos.set_version(13, 11, 5);


msos.geo.parseDMS = function (dmsStr) {
    "use strict";

    if (msos.config.verbose) { msos.console.debug('msos.geo.parseDMS -> input: ' + dmsStr); }

    // check for signed decimal degrees without NSEW, if so return it directly
    if (typeof dmsStr === 'number') {
        if (msos.config.verbose) { msos.console.debug('msos.geo.parseDMS -> was number: ' + dmsStr); }
        return dmsStr;
    }

    // strip off any sign or compass dir'n & split out separate d/m/s
    var dms = String(dmsStr),
        deg = 0;

    dms = jQuery.trim(dms);
    dms = dms.replace(/^-/, '').replace(/[NSEW]$/i, '').split(/[^0-9.,]+/);

    if (dms[dms.length - 1] == '') { dms.splice(dms.length - 1); }  // from trailing symbol

    if (dms == '') {
        msos.console.warn('msos.geo.parseDMS -> dms undefined.');
        return NaN;
    }

    // and convert to decimal degrees...
    switch (dms.length) {
        case 3:  // interpret 3-part result as d/m/s
            deg = (dms[0] / 1) + (dms[1] / 60) + (dms[2] / 3600); 
        break;
        case 2:  // interpret 2-part result as d/m
            deg = (dms[0] / 1) + (dms[1] / 60); 
        break;
        case 1:  // just d (possibly decimal) or non-separated dddmmss
            deg = dms[0];
            // check for fixed-width unseparated format eg 0033709W
            //if (/[NS]/i.test(dmsStr)) deg = '0' + deg;  // - normalise N/S to 3-digit degrees
            //if (/[0-9]{7}/.test(deg)) deg = deg.slice(0,3)/1 + deg.slice(3,5)/60 + deg.slice(5)/3600; 
        break;
      default:
        msos.console.warn('msos.geo.parseDMS -> failed, dms length:' + dms.length);
        return NaN;
    }

    dmsStr = jQuery.trim(dmsStr);
    if (/^-|[WS]$/i.test(dmsStr)) { deg = -deg; }    // take '-', west and south as -ve
    if (msos.config.verbose) { msos.console.debug('msos.geo.parseDMS -> output: ' + deg + ', for dms: ' + dmsStr + ', w/ length: ' + dms.length); }
    return Number(deg);
};

msos.geo.toDMS = function (deg, format, dp) {
    "use strict";

    if (isNaN(deg)) { return 'NaN'; }  // give up here if we can't make a number from deg

    // default values
    if (typeof format === 'undefined') { format = 'dms'; }
    if (typeof dp === 'undefined') {
        switch (format) {
            case 'd':   dp = 4; break;
            case 'dm':  dp = 2; break;
            case 'dms': dp = 0; break;
            default:    dp = 0; format = 'dms'; // be forgiving on invalid format
        }
    }

    deg = Math.abs(deg);  // (unsigned result ready for appending compass dir'n)

    var min = 0,
        d = 0,
        m = 0,
        sec = 0,
        s = 0,
        dms = '';

    switch (format) {
      case 'd':
        d = deg.toFixed(dp);                // round degrees
        if (d < 100) { d = '0' + d; }       // pad with leading zeros
        if (d < 10)  { d = '0' + d; }
        dms = d + '\u00B0';                 // add º symbol
      break;
      case 'dm':
        min = (deg * 60).toFixed(dp);       // convert degrees to minutes & round
        d = Math.floor(min / 60);           // get component deg/min
        m = (min % 60).toFixed(dp);         // pad with trailing zeros
        if (d < 100)    { d = '0' + d; }    // pad with leading zeros
        if (d < 10)     { d = '0' + d; }
        if (m < 10)     { m = '0' + m; }
        dms = d + '\u00B0' + m + '\u2032';  // add º, ' symbols
      break;
      case 'dms':
        sec = (deg * 3600).toFixed(dp);     // convert degrees to seconds & round
        d = Math.floor(sec / 3600);         // get component deg/min/sec
        m = Math.floor(sec / 60) % 60;
        s = (sec % 60).toFixed(dp);         // pad with trailing zeros
        if (d < 100)    { d = '0' + d; }    // pad with leading zeros
        if (d < 10)     { d = '0' + d; }
        if (m < 10)     { m = '0' + m; }
        if (s < 10)     { s = '0' + s; }
        dms = d + '\u00B0' + m + '\u2032' + s + '\u2033';   // add º, ', " symbols
      break;
    }

    return dms;
};

msos.geo.toLat = function (deg, format, dp) {
    "use strict";

    var lat = msos.geo.toDMS(deg, format, dp);
    return lat == '' ? '' : lat.slice(1) + (deg < 0 ? 'S' : 'N');   // knock off initial '0' for lat!
};

msos.geo.toLon = function (deg, format, dp) {
    "use strict";

    var lon = msos.geo.toDMS(deg, format, dp);
    return lon == '' ? '' : lon + (deg < 0 ? 'W' : 'E');
};

msos.geo.toBrng = function (deg, format, dp) {
    "use strict";

    deg = (Number(deg) + 360) % 360;      // normalise -ve values to 180º..360º
    var brng =  msos.geo.toDMS(deg, format, dp);
    return brng.replace('360', '0');      // just in case rounding took us up to 360º!
};