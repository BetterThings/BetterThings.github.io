
msos.provide("bootstrap.navbar");
msos.require("bootstrap.dropdownV3");

bootstrap.navbar.version = new msos.set_version(14, 2, 26);


// Start by loading our navbar.css stylesheet
bootstrap.navbar.css = new msos.loader();
bootstrap.navbar.css.load('bootstrap_css_navbar',       msos.resource_url('bootstrap', 'css/navbar.css'));
bootstrap.navbar.css.load('bootstrap_css_navigation',   msos.resource_url('bootstrap', 'css/navigation.css'));
bootstrap.navbar.css.load('bootstrap_css_responsive',   msos.resource_url('bootstrap', 'css/responsive.css'));

if (Modernizr.cssgradients) {
    bootstrap.navbar.css.load('bootstrap_css_navbar_gradient', msos.resource_url('bootstrap', 'css/navbar_gradient.css'));
}