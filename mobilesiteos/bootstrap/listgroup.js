

msos.provide("bootstrap.listgroup");

bootstrap.listgroup.version = new msos.set_version(14, 2, 26);


// Start by loading our stylesheets (requires panel css also)
bootstrap.listgroup.css = new msos.loader();
bootstrap.listgroup.css.load('bootstrap_css_listgroup', msos.resource_url('bootstrap', 'css/listgroup.css'));
bootstrap.listgroup.css.load('bootstrap_css_panel',     msos.resource_url('bootstrap', 'css/panel.css'));

if (Modernizr.cssgradients) {
    bootstrap.listgroup.css.load('bootstrap_css_panel_gradient', msos.resource_url('bootstrap', 'css/panel_gradient.css'));
}