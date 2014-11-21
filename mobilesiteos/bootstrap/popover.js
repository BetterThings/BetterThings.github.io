
msos.provide("bootstrap.popover");
msos.require("bootstrap.tooltip");

bootstrap.popover.version = new msos.set_version(14, 2, 26);


// Start by loading our popover.css stylesheet
bootstrap.popover.css = new msos.loader();
bootstrap.popover.css.load('bootstrap_css_popover', msos.resource_url('bootstrap', 'css/popover.css'));
