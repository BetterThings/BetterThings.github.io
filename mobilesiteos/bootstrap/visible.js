
msos.provide("bootstrap.visible");

bootstrap.visible.version = new msos.set_version(14, 2, 25);


// Start by loading our visible.css stylesheet
bootstrap.visible.css = new msos.loader();
bootstrap.visible.css.load('bootstrap_css_visible', msos.resource_url('bootstrap', 'css/visible.css'));
