/*global
    msos: false,
    marionette: false,
    Marionette: false,
    Backbone: false,
    jQuery: false
*/

msos.provide("marionette.todo.controller");
msos.require("marionette.todo.models");
msos.require("marionette.todo.layout");
msos.require("marionette.todo.views");

marionette.todo.controller.version = new msos.set_version(13, 11, 18);


marionette.todo.controller.definition = function (App) {
	"use strict";

	var AppRouter = Marionette.AppRouter.extend({
			appRoutes: {
				'*filter': 'filterItems'
			}
		}),
		AppController = function () {
			this.todoList = new marionette.todo.models.BB_TodoList();
			this.start = function () {
				this.showHeader(this.todoList);
				this.showFooter(this.todoList);
				this.showTodoList(this.todoList);
				this.todoList.fetch();
			};
			this.showHeader = function (todoList) {
				var header = new marionette.todo.layout.BBM_Header({
					collection: todoList
				});
				App.header.show(header);
			};
			this.showFooter = function (todoList) {
				var footer = new marionette.todo.layout.BBM_Footer({
					collection: todoList
				});
				footer.listenTo(App.vent, 'todoList:filter', footer.updateFilterSelection, footer);
				App.footer.show(footer);
			};
			this.showTodoList = function (todoList) {
				//var main = new TodoList.Views.ListView({
				var main = new marionette.todo.views.M_ListV({
						collection: todoList
					});
				App.main.show(main);
			};
			this.filterItems = function (filter) {
				App.vent.trigger('todoList:filter', (filter && filter.trim()) || '');
			};
		},
		todo_controller = new AppController();

	todo_controller.router = new AppRouter({
		controller: todo_controller
	});

	// Application Event Handlers
	App.vent.on(
		'todoList:filter',
		function (filter) {
			filter = filter || 'all';
			jQuery('#todoapp').attr('class', 'filter-' + filter);
		}
	);

	App.on(
		'initialize:after',
		function () {
			Backbone.history.start();
		}
	);

	todo_controller.start();
};
