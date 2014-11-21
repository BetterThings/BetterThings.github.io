/*global
    msos: false,
    marionette: false,
    Backbone: false,
    Marionette, false
*/

msos.provide("marionette.todo.views");

marionette.todo.views.version = new msos.set_version(13, 11, 18);


// Todo List Item View
marionette.todo.views.M_ItemV = Marionette.ItemView.extend({

	tagName: 'li',
	template: '#template-todoItemView',

	ui: {
		edit: '.edit'
	},

	events: {
		'click .destroy': 'destroy',
		'dblclick label': 'onEditClick',
		'keydown .edit': 'onEditKeypress',
		'focusout .edit': 'onEditFocusout',
		'click .toggle': 'toggle'
	},

	modelEvents: {
		'change': 'render'
	},

	onRender: function () {
		"use strict";

		this.$el.removeClass('active completed');

		if (this.model.get('completed')) {
			this.$el.addClass('completed');
		} else {
			this.$el.addClass('active');
		}
	},

	destroy: function () {
		"use strict";
		this.model.destroy();
	},

	toggle: function () {
		"use strict";
		this.model.toggle().save();
	},

	onEditClick: function () {
		"use strict";
		this.$el.addClass('editing');
		this.ui.edit.focus();
		this.ui.edit.val(this.ui.edit.val());
	},

	onEditFocusout: function () {
		"use strict";

		var todoText = this.ui.edit.val().trim();
		if (todoText) {
			this.model.set('title', todoText).save();
			this.$el.removeClass('editing');
		} else {
			this.destroy();
		}
	},

	onEditKeypress: function (e) {
		"use strict";

		var ENTER_KEY = 13, ESC_KEY = 27;

		if (e.which === ENTER_KEY) {
			this.onEditFocusout();
			return;
		}

		if (e.which === ESC_KEY) {
			this.ui.edit.val(this.model.get('title'));
			this.$el.removeClass('editing');
		}
	}
});

// Item List View
marionette.todo.views.M_ListV = Backbone.Marionette.CompositeView.extend({

	template: '#template-todoListCompositeView',
	itemView: marionette.todo.views.M_ItemV,
	itemViewContainer: '#todo-list',

	ui: {
		toggle: '#toggle-all'
	},

	events: {
		'click #toggle-all': 'onToggleAllClick'
	},

	collectionEvents: {
		'all': 'update'
	},

	onRender: function () {
		"use strict";
		this.update();
	},

	update: function () {
		"use strict";

		function reduceCompleted(left, right) {
			return left && right.get('completed');
		}

		var allCompleted = this.collection.reduce(reduceCompleted, true);

		this.ui.toggle.prop('checked', allCompleted);
		this.$el.parent().toggle(!!this.collection.length);
	},

	onToggleAllClick: function (e) {
		"use strict";

		var isChecked = e.currentTarget.checked;

		this.collection.each(function (todo) {
			todo.save({ 'completed': isChecked });
		});
	}
});
