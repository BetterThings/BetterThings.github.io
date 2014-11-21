

msos.provide("bootstrap.panel");
msos.require("bootstrap.collapse");
msos.require("bootstrap.transition");

bootstrap.panel.version = new msos.set_version(14, 2, 26);


// Start by loading our stylesheets
bootstrap.panel.css = new msos.loader();
bootstrap.panel.css.load('bootstrap_css_panel', msos.resource_url('bootstrap', 'css/panel.css'));

if (Modernizr.cssgradients) {
    bootstrap.panel.css.load('bootstrap_css_panel_gradient', msos.resource_url('bootstrap', 'css/panel_gradient.css'));
}