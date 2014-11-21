/*global
    msos: false,
    marionette: false,
    Backbone: false
*/

msos.provide("marionette.todo.layout");

marionette.todo.layout.version = new msos.set_version(13, 11, 18);


// Layout Header View
marionette.todo.layout.BBM_Header = Backbone.Marionette.ItemView.extend({

	template: '#template-header',

	// UI bindings create cached attributes that
	// point to jQuery selected objects
	ui: {
		input: '#new-todo'
	},

	events: {
		'keypress #new-todo': 'onInputKeypress'
	},

	onInputKeypress: function (e) {
		"use strict";

		var ENTER_KEY = 13,
			todoText = this.ui.input.val().trim();

		if (e.which === ENTER_KEY && todoText) {
			this.collection.create({
				title: todoText
			});
			this.ui.input.val('');
		}
	}
});

// Layout Footer View
marionette.todo.layout.BBM_Footer = Backbone.Marionette.ItemView.extend({

	template: '#template-footer',

	// UI bindings create cached attributes that
	// point to jQuery selected objects
	ui: {
		filters: '#filters a'
	},

	events: {
		'click #clear-completed': 'onClearClick'
	},

	collectionEvents: {
		'all': 'render'
	},

	templateHelpers: {
		activeCountLabel: function () {
			"use strict";
			return (this.activeCount === 1 ? 'item' : 'items') + ' left';
		}
	},

	serializeData: function () {
		"use strict";

		var active = this.collection.getActive().length,
			total = this.collection.length;

		return {
			activeCount: active,
			totalCount: total,
			completedCount: total - active
		};
	},

	onRender: function () {
		"use strict";

		this.$el.parent().toggle(this.collection.length > 0);
		this.updateFilterSelection();
	},

	updateFilterSelection: function () {
		"use strict";

		this.ui.filters
			.removeClass('selected')
			.filter('[href="' + (location.hash || '#') + '"]')
			.addClass('selected');
	},

	onClearClick: function () {
		"use strict";

		var completed = this.collection.getCompleted();
		completed.forEach(function (todo) {
			todo.destroy();
		});
	}
});
