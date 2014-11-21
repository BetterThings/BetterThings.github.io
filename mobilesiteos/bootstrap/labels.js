
msos.provide("bootstrap.labels");

bootstrap.labels.version = new msos.set_version(14, 2, 26);


// Start by loading our labels.css stylesheet
bootstrap.labels.css = new msos.loader();
bootstrap.labels.css.load('bootstrap_css_labels', msos.resource_url('bootstrap', 'css/labels.css'));
