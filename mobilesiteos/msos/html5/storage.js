// Storage polyfill by Remy Sharp
// https://gist.github.com/350433
// Needed for IE7-
// Dependencies:
//  JSON (use json2.js if necessary)
// Tweaks by Joshua Bell (inexorabletash@gmail.com)
//  * URI-encode item keys
//  * Use String() for stringifying
//  * added length

msos.provide("msos.html5.storage");

msos.html5.storage.version = new msos.set_version(13, 6, 14);


if (!Modernizr.localstorage || !Modernizr.sessionstorage) (function () {

    var Storage = function (type) {

            function setData(data) {
                data = JSON.stringify(data);
                if (type == 'session') {
                    window.name = data;
                } else {
                    msos.cookie('localStorage', data);
                }
            }

            function clearData() {
                if (type == 'session') {
                    window.name = '';
                } else {
                    msos.cookie('localStorage', null);
                }
            }

            function getData() {
                var data = type == 'session' ? window.name : msos.cookie('localStorage');
                return data ? JSON.parse(data) : {};
            }


            // initialise if there's already data
            var data = getData();

            return {
                length: 0,
                clear: function () {
                    data = {};
                    this.length = 0;
                    clearData();
                },
                getItem: function (key) {
                    return data[key] === undefined ? null : data[key];
                },
                key: function (i) {
                    // not perfect, but works
                    var ctr = 0;
                    for (var k in data) {
                        if (ctr == i) return k;
                        else ctr++;
                    }
                    return null;
                },
                removeItem: function (key) {
                    delete data[key];
                    this.length--;
                    setData(data);
                },
                setItem: function (key, value) {
                    data[key] = value + ''; // forces the value to a string
                    this.length++;
                    setData(data);
                }
            };
        },
        temp_st = 'msos.html5.storage -> ';

    if (!Modernizr.localstorage) {
        msos.console.debug(temp_st + 'loaded localStorage shim!');
        window.localStorage = new Storage('local');
    }
    if (!Modernizr.sessionstorage) {
        msos.console.debug(temp_st + 'loaded sessionStorage shim!');
        window.sessionStorage = new Storage('session');
    }

})();