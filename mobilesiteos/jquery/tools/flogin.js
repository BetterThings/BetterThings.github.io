/*
 * flogin.js
 * stupidly simple facebook login as a jQuery plugin
 *
 * Gary Rafferty - 2013
 */

msos.provide("jquery.tools.flogin");

jquery.tools.flogin.version = new msos.set_version(13, 9, 19);


(function($) {
    "use strict";

    $.fn.facebook_login = function (options) {

        var defaults = {
                endpoint:       '/sessions/new',
                permissions:    'email',
                onSuccess:      function(data) { console.log([200,'OK']); },
                onError:        function(data) { console.log([500,'Error']); }
            },
            settings = $.extend({}, defaults, options);

        if(settings.appId === 'undefined') {
            console.log('You must set the appId');
            return false;
        }

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];

            if (d.getElementById(id)) { return; }

            js = d.createElement(s);
            js.id = id;
            js.src = "http://connect.facebook.net/en_US/all.js";

            fjs.parentNode.insertBefore(js, fjs);

        }(document, 'script', 'facebook-jssdk'));

        window.fbAsyncInit = function () {
            FB.init({
                appId: settings.appId,
                status: true,
                xfbml: true
            });
        };

        this.bind(
            'click',
            function () {
                FB.login(function (r) {
                    var response = r.authResponse || null,
                        user_id,
                        token;

                    if (response) {
                        user_id = response.userID;
                        token   = response.accessToken;

                        FB.api(
                            '/me?access_token=' + token,
                            function (user) {
                                var email = user.email || '';

                                if (email) {

                                    $.ajax({
                                        url: settings.endpoint,
                                        data: {
                                            user_id: user_id,
                                            token: token,
                                            email: email
                                        },
                                        type: 'POST',
                                        success:    settings.onSuccess(),
                                        error:      settings.onError()
                                    });
                                }
                            }
                        );
                    } else {
                        settings.onError();
                    }
            }, { scope: settings.permissions });
        });

        return true;
    };

}(jQuery));