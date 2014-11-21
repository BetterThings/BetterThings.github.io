
msos.provide("bootstrap.progress");

bootstrap.progress.version = new msos.set_version(14, 2, 26);


// Start by loading our progress.css stylesheet
bootstrap.progress.css = new msos.loader();
bootstrap.progress.css.load('bootstrap_css_progress', msos.resource_url('bootstrap', 'css/progress.css'));

if (Modernizr.cssgradients) {
    bootstrap.progress.css.load('bootstrap_css_progress_gradient', msos.resource_url('bootstrap', 'css/progress_gradient.css'));
}