
msos.provide("bootstrap.print");

bootstrap.pager.version = new msos.set_version(14, 2, 25);


// Start by loading our print.css stylesheet
bootstrap.print.css = new msos.loader();
bootstrap.print.css.load('bootstrap_css_print', msos.resource_url('bootstrap', 'css/print.css'));
