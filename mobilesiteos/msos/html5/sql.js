// Copyright Notice:
//				html5/sql.js
//			Copyright©2011-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// Derived from: html5sql.js Version 0.9.2, by Ken Corbett Jr.
//
// Highly modified for use w/ OpenSiteMobile

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.html5.sql");
msos.require("msos.common");

msos.html5.sql.version = new msos.set_version(13, 6, 14);

msos.html5.sql.generate = function () {
    "use strict";

    var temp_sql = 'msos.html5.sql.generate',
        sql_transaction_available = false,
        sql_do_nothing, sql_undefined, sql_processor, sql_creator, sql_checker, sql_db_obj = this;

    msos.console.debug(temp_sql + ' -> start.');

    // Helper functions
    sql_do_nothing = function () {
        return false;
    };

    sql_undefined = function (it) {
        return it === void 0;
    };

    sql_creator = function (sql_in) {
        var i;

        if (typeof sql_in === "string") {
            jQuery.trim(sql_in);

            // Separate statements by semicolon
            sql_in = sql_in.split(';');

            for (i = 1; i < sql_in.length; i += 1) {

                // Ensure semicolons within quotes are replaced
                while (sql_in[i].split(/["]/gm).length % 2 === 0 || sql_in[i].split(/[']/gm).length % 2 === 0 || sql_in[i].split(/[`]/gm).length % 2 === 0) {
                    sql_in.splice(i, 2, sql_in[i] + ";" + sql_in[i + 1]);
                }

                // Add back the semicolon at the end of the line
                sql_in[i] = jQuery.trim(sql_in[i]) + ';';

                // Get rid of any empty statements
                if (sql_in[i] === ';') {
                    sql_in.splice(i, 1);
                }
            }
        }

        for (i = 0; i < sql_in.length; i += 1) {

            // If the array item is only a string format it into an sql object
            if (typeof sql_in[i] === "string") {

                sql_in[i] = {
                    "sql": sql_in[i],
                    "data": [],
                    "success": sql_do_nothing
                };

            }
            else {

                if (sql_undefined(sql_in[i].data)) {
                    sql_in[i].data = [];
                }
                if (sql_undefined(sql_in[i].success)) {
                    sql_in[i].success = sql_do_nothing;
                }

                // Check to see that the sql object is formated correctly.
                if (typeof sql_in[i] !== "object" || typeof sql_in[i].sql !== "string" || typeof sql_in[i].success !== "function" || !jQuery.isArray(sql_in[i].data)) {
                    throw new Error(temp_sql + " - sql_creator -> malformed sql object: " + sql_in[i]);
                }
            }
        }
        return sql_in;
    };

    sql_checker = function (sql_state_obj) {
        var k = 0;

        for (k = 0; k < sql_state_obj.length; k += 1) {
            if (!/^select\s/i.test(sql_state_obj[k].sql)) {
                return false;
            }
        }

        return true;
    };

    sql_processor = function (db_trans, sql_state_objects, on_final_success, on_final_failure) {

        var sequence_no = 0,
            data_for_next = null,
            process_onsuccess, process_onfailure, process_transaction;

        msos.console.debug(temp_sql + ' - sql_processor -> start.');

        // What to do on success
        process_onsuccess = function (proc_trans_success, results) {
            var i, max, rowsArray = [];

            if (/^select\s/i.test(sql_state_objects[sequence_no].sql)) {
                max = results.rows.length || 0;
                for (i = 0; i < max; i += 1) {
                    rowsArray[i] = results.rows.item(i);
                }
            }
            else {
                rowsArray = null;
            }

            data_for_next = sql_state_objects[sequence_no].success(proc_trans_success, results, rowsArray);

            sequence_no += 1;

            // Forward data to next statement or not
            if (data_for_next && jQuery.isArray(data_for_next)) {
                sql_state_objects[sequence_no].data = data_for_next;
                data_for_next = null;
            }
            else {
                data_for_next = null;
            }

            // If more statements, continue or run final onsuccess function
            if (sql_state_objects.length > sequence_no) {
                process_transaction();
            }
            else {
                on_final_success(proc_trans_success, results, rowsArray);
            }
        };

        process_onfailure = function (proc_trans_fail, error) {

            msos.console.error(temp_sql + " - sql_processor - process_onfailure -> Error: " + error.message + " while processing statment " + (sequence_no + 1) + ": " + sql_state_objects[sequence_no].sql);

            on_final_failure(error, sql_state_objects[sequence_no].sql);
        };

        // The real processing function is here
        process_transaction = function () {
            db_trans.executeSql(
            sql_state_objects[sequence_no].sql, sql_state_objects[sequence_no].data, process_onsuccess, process_onfailure);
        };

        // Start processing
        process_transaction();

        msos.console.debug(temp_sql + ' - sql_processor -> done!');
    };


    // Meat and Potatoes
    this.database = null;

    this.open = function (db_name, db_display_name, db_size, on_db_open_func) {

        msos.console.debug(temp_sql + ' - open -> start.');

        if (!Modernizr.websqldatabase) {
            msos.console.warn(temp_sql + ' - open -> done: sql db is not supported!');
            return;
        }

        sql_db_obj.database = openDatabase(db_name, '', db_display_name, db_size);

        sql_transaction_available = typeof sql_db_obj.database.readTransaction === 'function';

        if (sql_transaction_available && on_db_open_func) {
            on_db_open_func();
        }

        msos.console.debug(temp_sql + ' - open -> done!');
    };

    this.process = function (sql_input, sql_onsuccess, sql_onfailure) {
        /*
         *	sql_db_obj.process(
         *		[{
         *		   sql: "SELECT * FROM table;",		// Required.
         *		   data: [],
         *		   success: function () {}		// Returned array is used as data for next sql statement
         *		 },
         *		 {
         *		   sql: "SELECT * FROM table;",
         *		   data: [],
         *		   success: function () {}
         *		 }],
         *		function () {},
         *		function () {}
         *	);
         */

        msos.console.debug(temp_sql + ' - process -> start.');

        if (sql_db_obj.database) {

            var sql_statement_obj = sql_creator(sql_input);

            if (sql_undefined(sql_onsuccess)) {
                sql_onsuccess = function () {
                    msos.console.debug(temp_sql + ' - onsuccess -> do nothing!');
                };
            }

            if (sql_undefined(sql_onfailure)) {
                sql_onfailure = function () {
                    msos.console.debug(temp_sql + ' - onfailure -> do nothing!');
                };
            }

            if (sql_checker(sql_statement_obj) && sql_transaction_available) {
                sql_db_obj.database.readTransaction(

                function (trans) {
                    sql_processor(trans, sql_statement_obj, sql_onsuccess, sql_onfailure);
                });
            }
            else {
                sql_db_obj.database.transaction(

                function (trans) {
                    sql_processor(trans, sql_statement_obj, sql_onsuccess, sql_onfailure);
                });
            }

        }
        else {
            // Database hasn't been opened
            msos.console.error(temp_sql + ' - process -> open db before sql can be processed.');
        }

        msos.console.debug(temp_sql + ' - process -> done!');
    };

    msos.console.debug(temp_sql + ' -> done!');
};
