/**
 * Geolocation API crossbrowser support
 *
 * This library provides a consistent Geolocation interface for miscellaneous 
 * web browsers. It only supports Javascript in a web browser and is not 
 * tested and will probably not work for use in Titanium, PhoneGap, etc. 
 * http://www.w3.org/TR/geolocation-API/
 * 
 * @author Manuel Bieh
 * @url http://www.manuel-bieh.de/
 * @version 1.0.10
 * @license http://www.gnu.org/licenses/lgpl-3.0.txt LGPL
 *
 * Date $LastChangedDate: 2011-09-11 09:36:49 +0200 (Su, 11 Sep 2011) $
 *
 */

msos.provide("msos.html5.geolocation");

msos.html5.geolocation.version = new msos.set_version(13, 6, 14);

;(function() {

	var	geolocation = {};

	geolocation.init = function() {

		try {

			// Check for W3C Geolocation API standard support
			if (typeof (navigator.geolocation) != 'undefined') {

				//geolocation.type = 'W3C Geolocation API';
				geolocation.api = navigator.geolocation;

			// Check for Google Gears support. gears_init.js must be included!
			} else if (typeof (window.google) != 'undefined' &&  typeof(window.google.gears) != 'undefined') {

				//geolocation.type = 'Google Gears';
				geolocation.api = google.gears.factory.create('beta.geolocation');

			} else {

				return false;
			}

			window.navigator.geolocation = geolocation.api;

			return true;

		} catch(e) {

			msos.console.error('msos.html5.geolocation -> failed: ' + e);
			return false;
		}

	}

	/**
	 * Gets the current position of the user and executes a callback function
	 *
	 * @param function Callback function which is executed on success
	 * @param function Callback function which is executed on error
	 * @param function Options
	 * @return void
	 */
	geolocation.getCurrentPosition = function(successCallback, errorCallback, options) {

		if(geolocation.api) {
			geolocation.api.getCurrentPosition(successCallback, errorCallback, options);
		}

	}

	/**
	 * Calls a callback function every time the user's position changes
	 *
	 * @param function Callback function which is executed on success
	 * @param function Callback function which is executed on error
	 * @param function Options
	 * @return integer ID of the watchPosition callback
	 */
	geolocation.watchPosition = function(successCallback, errorCallback, options) {

		if(geolocation.api) {
			geolocation.watchID = geolocation.api.watchPosition(successCallback, errorCallback, options);
		}

		return geolocation.watchID;

	}

	/**
	 * Clears the watchPosition callback specified as first parameter.
	 *
	 * @param integer ID of the watchPosition 
	 * @return void
	 */
	geolocation.clearWatch = function(watchID) {

		if(watchID == NULL) {
			geolocation.api.clearWatch(geolocation.watchID);
		} else {
			geolocation.api.clearWatch(watchID);
		}

	}

	geolocation.init();

})();

