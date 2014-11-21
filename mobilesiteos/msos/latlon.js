/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Latitude/longitude spherical geodesy formulae & scripts (c) Chris Veness 2002-2011            */
/*   - www.movable-type.co.uk/scripts/latlong.html                                                */
/*                                                                                                */
/*  Sample usage:                                                                                 */
/*    var p1 = new LatLon(51.5136, -0.0983);                                                      */
/*    var p2 = new LatLon(51.4778, -0.0015);                                                      */
/*    var dist = p1.distanceTo(p2);          // in km                                             */
/*    var brng = p1.bearingTo(p2);           // in degrees clockwise from north                   */
/*    ... etc                                                                                     */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Note that minimal error checking is performed in this example code!                           */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

// Standard script with comments removed, checked with jslint and loaded via MobileSiteOS

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.latlon");
msos.require("msos.geo");

msos.latlon.version = new msos.set_version(13, 11, 6);

msos.latlon.calc = function (lat, lon, rad) {
    "use strict";

    if (msos.config.verbose) {
        msos.console.debug('msos.latlon.calc -> input for lat: ' + lat + ', lon: ' + lon + ', rad: ' + rad);
    }

    if (typeof rad === 'undefined') { rad = 6371; }     // earth's mean radius in km
    // only accept numbers or valid numeric strings
    this.ll_lat = typeof lat === 'number' ? lat : typeof lat === 'string' ? jQuery.trim(lat) : NaN;
    this.ll_lon = typeof lat === 'number' ? lon : typeof lon === 'string' ? jQuery.trim(lon) : NaN;
    this.ll_rad = typeof rad === 'number' ? rad : typeof rad === 'string' ? jQuery.trim(rad) : NaN;

    if (msos.config.verbose) {
        msos.console.debug('msos.latlon.calc -> output for lat: ' + this.ll_lat + ', lon: ' + this.ll_lon + ', rad: ' + this.ll_rad);
    }
};

msos.latlon.calc.prototype.distanceTo = function (point, precision) {
    "use strict";

    // default 4 sig figs reflects typical 0.3% accuracy of spherical model
    if (typeof precision === 'undefined') { precision = 4; }

    var R = this.ll_rad,
        lat1 = this.ll_lat.toRad(),
        lon1 = this.ll_lon.toRad(),
        lat2 = point.ll_lat.toRad(),
        lon2 = point.ll_lon.toRad(),
        dLat = lat2 - lat1,
        dLon = lon2 - lon1,
        a = Math.sin(dLat / 2)  * Math.sin(dLat / 2) +
            Math.cos(lat1)      * Math.cos(lat2) * 
            Math.sin(dLon / 2)  * Math.sin(dLon / 2),
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
        d = R * c;
    return d.toPrecision(precision);
};

msos.latlon.calc.prototype.bearingTo = function (point) {
    "use strict";

    var lat1 = this.ll_lat.toRad(), lat2 = point.ll_lat.toRad(),
        dLon = (point.ll_lon - this.ll_lon).toRad(),

        y = Math.sin(dLon) * Math.cos(lat2),
        x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon),
        brng = Math.atan2(y, x);
  
    return (brng.toDeg() + 360) % 360;
};

msos.latlon.calc.prototype.finalBearingTo = function (point) {
    "use strict";

    // get initial bearing from supplied point back to this point...
    var lat1 = point.ll_lat.toRad(),
        lat2 = this.ll_lat.toRad(),
        dLon = (this.ll_lon - point.ll_lon).toRad(),

        y = Math.sin(dLon) * Math.cos(lat2),
        x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon),
        brng = Math.atan2(y, x);

    // ... & reverse it by adding 180°
    return (brng.toDeg() + 180) % 360;
};

msos.latlon.calc.prototype.midpointTo = function (point) {
    "use strict";

    var lat1 = this.ll_lat.toRad(),
        lon1 = this.ll_lon.toRad(),
        lat2 = point.ll_lat.toRad(),
        dLon = (point.ll_lon - this.ll_lon).toRad(),

        Bx = Math.cos(lat2) * Math.cos(dLon),
        By = Math.cos(lat2) * Math.sin(dLon),

        lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By)),
        lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

    return new msos.latlon.calc(lat3.toDeg(), lon3.toDeg());
};

msos.latlon.calc.prototype.destinationPoint = function (brng, dist) {
    "use strict";

    dist = typeof dist === 'number' ? dist : typeof dist === 'string' && jQuery.trim(dist) != '' ? +dist : NaN;
    dist = dist / this.ll_rad;     // convert dist to angular distance in radians
    brng = brng.toRad();
    var lat1 = this.ll_lat.toRad(),
        lon1 = this.ll_lon.toRad(),
        lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) + Math.cos(lat1) * Math.sin(dist) * Math.cos(brng)),
        lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) * Math.cos(lat1), Math.cos(dist) - Math.sin(lat1) * Math.sin(lat2));

    lon2 = (lon2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI;  // normalise to -180...+180

    return new msos.latlon.calc(lat2.toDeg(), lon2.toDeg());
};

msos.latlon.calc.intersection = function (p1, brng1, p2, brng2) {
    "use strict";

    brng1 = typeof brng1 === 'number' ? brng1 : typeof brng1 === 'string' && jQuery.trim(brng1) != '' ? +brng1 : NaN;
    brng2 = typeof brng2 === 'number' ? brng2 : typeof brng2 === 'string' && jQuery.trim(brng2) != '' ? +brng2 : NaN;

    var lat1 = p1.ll_lat.toRad(),
        lon1 = p1.ll_lon.toRad(),
        lat2 = p2.ll_lat.toRad(),
        lon2 = p2.ll_lon.toRad(),
        lat3,
        lon3,
        brng12,
        brng13 = brng1.toRad(),
        brng23 = brng2.toRad(),
        brng21,
        dLat = lat2 - lat1,
        dLon = lon2 - lon1,
        dist12 = 2 * Math.asin(Math.sqrt(Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2))),
        dist13,
        brngA,
        brngB,
        alpha1,
        alpha2,
        alpha3,
        dLon13;

    if (dist12 === 0) { return null; }

    // initial/final bearings between points
    brngA = Math.acos((Math.sin(lat2) - Math.sin(lat1) * Math.cos(dist12)) / (Math.sin(dist12) * Math.cos(lat1)));

    if (isNaN(brngA)) { brngA = 0; }        // protect against rounding

    brngB = Math.acos((Math.sin(lat1) - Math.sin(lat2) * Math.cos(dist12)) / (Math.sin(dist12) * Math.cos(lat2)));

    if (Math.sin(lon2 - lon1) > 0) {
        brng12 = brngA;
        brng21 = 2 * Math.PI - brngB;
    } else {
        brng12 = 2 * Math.PI - brngA;
        brng21 = brngB;
      }

    alpha1 = (brng13 - brng12 + Math.PI) % (2 * Math.PI) - Math.PI;  // angle 2-1-3
    alpha2 = (brng21 - brng23 + Math.PI) % (2 * Math.PI) - Math.PI;  // angle 1-2-3

    if (Math.sin(alpha1) === 0 && Math.sin(alpha2) === 0)   { return null; }    // infinite intersections
    if (Math.sin(alpha1) * Math.sin(alpha2) < 0)            { return null; }    // ambiguous intersection
    
    alpha3 = Math.acos(-Math.cos(alpha1) * Math.cos(alpha2) + 
                        Math.sin(alpha1) * Math.sin(alpha2) * Math.cos(dist12));
    dist13 = Math.atan2(Math.sin(dist12) * Math.sin(alpha1) * Math.sin(alpha2), 
                        Math.cos(alpha2) + Math.cos(alpha1) * Math.cos(alpha3));
    lat3 =    Math.asin(Math.sin(lat1) * Math.cos(dist13) + 
                        Math.cos(lat1) * Math.sin(dist13) * Math.cos(brng13));
    dLon13 = Math.atan2(Math.sin(brng13) * Math.sin(dist13) * Math.cos(lat1), 
                        Math.cos(dist13) - Math.sin(lat1) * Math.sin(lat3));
    lon3 = lon1 + dLon13;
    lon3 = (lon3 + Math.PI) % (2 * Math.PI) - Math.PI;  // normalise to -180..180º

    return new msos.latlon.calc(lat3.toDeg(), lon3.toDeg());
};

msos.latlon.calc.prototype.rhumbDistanceTo = function (point) {
    "use strict";

    var R = this.ll_rad,
        lat1 = this.ll_lat.toRad(),
        lat2 = point.ll_lat.toRad(),
        dLat = (point.ll_lat - this.ll_lat).toRad(),
        dLon = Math.abs(point.ll_lon - this.ll_lon).toRad(),
        dPhi = Math.log(Math.tan(lat2 / 2 + Math.PI / 4) / Math.tan(lat1 / 2 + Math.PI / 4)),
        q = (!isNaN(dLat / dPhi)) ? dLat / dPhi : Math.cos(lat1),
        dist;

    // if dLon over 180° take shorter rhumb across 180° meridian:
    if (dLon > Math.PI) { dLon = 2 * Math.PI - dLon; }

    dist = Math.sqrt(dLat * dLat + q * q * dLon * dLon) * R; 

    return dist.toPrecision(4);  // 4 sig figs reflects typical 0.3% accuracy of spherical model
};

msos.latlon.calc.prototype.rhumbBearingTo = function (point) {
    "use strict";

    var lat1 = this.ll_lat.toRad(),
        lat2 = point.ll_lat.toRad(),
        dLon = (point.ll_lon - this.ll_lon).toRad(),
        dPhi = Math.log(Math.tan(lat2 / 2 + Math.PI / 4) / Math.tan(lat1 / 2 + Math.PI / 4)),
        brng;

    if (Math.abs(dLon) > Math.PI) { dLon = dLon > 0 ? -(2 * Math.PI - dLon) : (2 * Math.PI + dLon); }

    brng = Math.atan2(dLon, dPhi);

    return (brng.toDeg() + 360) % 360;
};

msos.latlon.calc.prototype.rhumbDestinationPoint = function (brng, dist) {
    "use strict";

    brng = brng.toRad();

    var R = this.ll_rad,
        d = parseFloat(dist) / R,
        lat1 = this.ll_lat.toRad(),
        lon1 = this.ll_lon.toRad(),
        lat2 = lat1 + d * Math.cos(brng),
        dLat = lat2 - lat1,
        dPhi = Math.log(Math.tan(lat2 / 2 + Math.PI / 4) / Math.tan(lat1 / 2 + Math.PI / 4)),
        q = (!isNaN(dLat / dPhi)) ? dLat / dPhi : Math.cos(lat1),
        dLon = d * Math.sin(brng) / q,
        lon2 = (lon1 + dLon + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

    // check for some daft bugger going past the pole
    if (Math.abs(lat2) > Math.PI / 2) { lat2 = lat2 > 0 ? Math.PI - lat2 : -(Math.PI - lat2); }

    return new msos.latlon.calc(lat2.toDeg(), lon2.toDeg());
};

msos.latlon.calc.prototype.lat = function (format, dp) {
    "use strict";

    if (typeof format === 'undefined') { return this.ll_lat; }
  
    return msos.geo.toLat(this.ll_lat, format, dp);
};

msos.latlon.calc.prototype.lon = function (format, dp) {
    "use strict";

    if (typeof format === 'undefined') { return this.ll_lon; }

    return msos.geo.toLon(this.ll_lon, format, dp);
};

msos.latlon.calc.prototype.toString = function (format, dp) {
    "use strict";

    if (typeof format === 'undefined') { format = 'dms'; }

    if (isNaN(this.ll_lat)
     || isNaN(this.ll_lon)) { return '--, --'; }

    return msos.geo.toLat(this.ll_lat, format, dp) + ', ' + msos.geo.toLon(this.ll_lon, format, dp);
};


// Helper functions
//------------------------------

/* Converts numeric degrees to radians */
if (typeof Number.prototype.toRad === "undefined") {
    Number.prototype.toRad = function () {
        "use strict";
        return this * Math.PI / 180;
    };
}

/* Converts radians to numeric (signed) degrees */
if (typeof Number.prototype.toDeg === "undefined") {
    Number.prototype.toDeg = function () {
        "use strict";
        return this * 180 / Math.PI;
    };
}