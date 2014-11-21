// Copyright Notice:
//				    cart.js
//			Copyright©2008-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile 'Google Cart' functions

/*global
    msos: false,
    jQuery: false,
    googlecartAfterAdd: true,
    googlecartAfterRemove: true,
    googlecart: false
*/

/*  Special note: As of 4/12/2013 The Google Wallet JavaScript API
    causes untold error notices in Google Chrome browser when used
    with the Google Adsense widget! The irony is not lost here, as it
    is Google's code which is causing these errors to occur and only
    in Google Chrome browser. You would think Google might care, but
    these type error codes are common and have persisted for years. */

msos.provide("msos.google.cart");

msos.google.cart.version = new msos.set_version(13, 6, 14);

msos.google.cart.base_url = 'https://checkout.google.com/seller/gsc/v2_2/cart.js?mid=';

// Load Google Checkout script. Note: Some script tag attributes are not valid html5
msos.google.cart.script_url = msos.config.google.use_sandbox === false    // must be boolean -> false
    ? msos.google.cart.base_url + msos.config.google.merchant_id
    : msos.google.cart.base_url + msos.config.google.sandbox_id;

msos.google.cart.script_attributes = msos.config.google.use_sandbox === false
    ? { aid: _gaq[0][1], currency: 'USD', 'integration': 'jscart-wizard' }
    : { aid: _gaq[0][1], currency: 'USD', 'integration': 'jscart-wizard', 'post-cart-to-sandbox': 'true' };


// --------------------------
// Google Cart Functions (global variables)
// --------------------------
googlecartAfterAdd = function (items, index) {
    "use strict";
    msos.console.debug('msos.google.cart - googlecartAfterAdd -> called, added product at index: ' + index);
    msos.google.cart.save();
    return true;
};

googlecartAfterRemove = function (items, index) {
    "use strict";
    msos.console.debug('msos.google.cart - googlecartAfterRemove -> called, removed product at index: ' + index);
    msos.google.cart.save();
    return true;
};

// --------------------------
// Google Checkout Functions
// --------------------------
msos.google.cart.checkout_index = 0;

msos.google.cart.save = function () {
    "use strict";

    var cookie_obj = msos.config.cookie.site_cart,
        get_items = googlecart.getItems(),
        items_array = [],
        k = 0,
        product_obj = null,
        prop_obj = {},
        cart_object = {};

    for (k = 0; k < get_items.length; k += 1) {
        product_obj = get_items[k];
        if (!product_obj.isMarkedForRemoval()) {
            if (product_obj.getTitle()) {
                prop_obj = {
                    properties: {
                        "title": product_obj.getTitle(),
                        "price": product_obj.getPricePerUnit(),
                        "weight": product_obj.getWeight()
                    },
                    "quantity": product_obj.getQuantity()
                };
                items_array.push(prop_obj);
            }
        }
    }

    cart_object = {
        "items": items_array
    };

    if (items_array.length > 0) {
        cookie_obj.value = JSON.stringify(cart_object);
        msos.cookie(
            cookie_obj.name,
            cookie_obj.value,
            cookie_obj.params
        );
        cookie_obj.set = true;
    } else {
        msos.console.debug('msos.google.cart.save -> no items');
    }
};

msos.google.cart.show = function () {
    "use strict";

    var temp_cs = 'msos.google.cart.show -> ';

    // Might have to wait for widget insertion
    if (!jQuery('#googlecart-widget').length) {
        msos.console.warn(temp_cs + 'missing googlecart-widget, count: ' + msos.google.cart.checkout_index);
        msos.google.cart.checkout_index += 1;

        // Check for up to 20 sec.
        if (msos.google.cart.checkout_index < 21) {
            setTimeout(msos.google.cart.show, 1000);
        }
        return;
    }

    msos.console.debug(temp_cs + 'start.');

    var control = jQuery('#googlecart-widget-control'),
        widget = msos.byid('googlecart-widget'),
        width = msos.config.size_wide.phone - 2;

    // Get rid of ugly google spec. 'blue' font color
    jQuery('.googlecart-widget-title').css('color', '#FFFFFF');

    // Resize view cart for small display
    if (widget && msos.config.size === 'phone') {
        widget.style.width = width + 'px !important';
        widget.style.fontSize = 'small';
    }

    if (control) { control.show(); }

    msos.console.debug(temp_cs + 'done!');
};

msos.google.cart.initiate = function () {
    "use strict";

    var cart_loader = new msos.loader();

    cart_loader.add_resource_onload.push(msos.google.cart.show);

    // Load Google Checkout API with our loader for better debugging
    cart_loader.load(
        'googlecart-script',
        msos.google.cart.script_url,
        'js',
        msos.google.cart.script_attributes
    );
};

// Add cart script immediately
msos.google.cart.initiate();

// Run late so cart script has time to crate widget
msos.onload_func_done.push(msos.google.cart.show);