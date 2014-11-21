
msos.provide("bootstrap.inputgroup");

bootstrap.inputgroup.version = new msos.set_version(14, 2, 26);


// Start by loading our stylesheets
bootstrap.inputgroup.css = new msos.loader();
bootstrap.inputgroup.css.load('bootstrap_css_inputgroup', msos.resource_url('bootstrap', 'css/inputgroup.css'));
