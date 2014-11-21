
msos.provide("bootstrap.responsive");

bootstrap.responsive.version = new msos.set_version(14, 2, 26);


// Start by loading our responsive.css stylesheet
bootstrap.responsive.css = new msos.loader();
bootstrap.responsive.css.load('bootstrap_css_responsive', msos.resource_url('bootstrap', 'css/responsive.css'));
