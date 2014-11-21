/*global
    msos: false,
    marionette: false,
    Backbone: false
*/

msos.provide("marionette.todo.models");

marionette.todo.models.version = new msos.set_version(13, 11, 18);


// Todo Model
marionette.todo.models.BB_Todo = Backbone.Model.extend({

	defaults: {
		title: '',
		completed: false,
		created: 0
	},

	initialize: function () {
		"use strict";
		if (this.isNew()) {
			this.set('created', Date.now());
		}
	},

	toggle: function () {
		"use strict";
		return this.set('completed', !this.isCompleted());
	},

	isCompleted: function () {
		"use strict";
		return this.get('completed');
	}
});

// Todo Collection
marionette.todo.models.BB_TodoList = Backbone.Collection.extend({

	model: marionette.todo.models.BB_Todo,

	localStorage: new Backbone.LocalStorage('todos-backbone-marionette'),

	getCompleted: function () {
		"use strict";
		return this.filter(this._isCompleted);
	},

	getActive: function () {
		"use strict";
		return this.reject(this._isCompleted);
	},

	comparator: function (todo) {
		"use strict";
		return todo.get('created');
	},

	_isCompleted: function (todo) {
		"use strict";
		return todo.isCompleted();
	}
});
