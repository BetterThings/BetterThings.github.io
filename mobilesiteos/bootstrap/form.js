
msos.provide("bootstrap.form");

bootstrap.form.version = new msos.set_version(14, 2, 26);


// Start by loading our form/control.css stylesheet
bootstrap.form.css = new msos.loader();
bootstrap.form.css.load('bootstrap_css_form',           msos.resource_url('bootstrap', 'css/form.css'));
bootstrap.form.css.load('bootstrap_css_inputgroup',     msos.resource_url('bootstrap', 'css/inputgroup.css'));