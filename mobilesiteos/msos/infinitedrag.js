/*
 * jQuery Infinite Drag
 * Version 0.2
 * Copyright (c) 2010 Ian Li (http://ianli.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 *
 * Requires:
 * jQuery	http://jquery.com
 *
 * Reference:
 * http://ianli.com/infinitedrag/ for Usage
 *
 * Versions:
 * 0.2
 * - Fixed problem with IE 8.0
 * 0.1
 * - Initial implementation
 */

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.infinitedrag");

msos.infinitedrag.version = new msos.set_version(13, 11, 5);


// Track generated tiles
msos.infinitedrag.tiles = {};

// Track containment position
msos.infinitedrag.containment = [];

// Load infinitedrag 'MobileSiteOS style' so no one gets the wrong idea about this being a standard
// copy of the jQuery 'infinitedrag.js' script.
(function ($) {
    "use strict";

    /**
     * The InfiniteDrag object.
     */
    var InfiniteDrag = function (draggable, draggable_options, tile_options) {
            // Use self to reduce confusion about this.
            var self = this,
                $draggable = $(draggable),
                $viewport = $draggable.parent(),
                grid = {},
                _do = {},
                _to = {},
                t_opt = '';

            // Draggable options
            _do = draggable_options || {};

            // Tile options (DEFAULT)
            _to = {
                class_name: "_tile",
                width: 100,
                height: 100,
                start_col: 0,
                start_row: 0,
                range_col: [-1000000, 1000000],
                range_row: [-1000000, 1000000],
                tile_id_func: function ($element, i, j) {
                    return "colrow_" + i + "_" + j;
                },
                oncreate: function ($element, i, j) {
                    $element.text(i + "," + j);
                }
            };

            // Override tile options.
            for (t_opt in tile_options) {
                if (tile_options[t_opt] !== undefined) {
                    _to[t_opt] = tile_options[t_opt];
                }
            }

            // Override tile options based on draggable options.
            if (_do.axis == "x") {
                _to.range_row = [_to.start_row, _to.start_row];
            }
            else if (_do.axis == "y") {
                _to.range_col = [_to.start_col, _to.start_col];
            }

            // Creates the tile at (i, j).
            function create_tile(i, j) {
                if (i < _to.range_col[0] || _to.range_col[1] < i) {
                    return;
                }
                else if (j < _to.range_row[0] || _to.range_row[1] < j) {
                    return;
                }

                grid[i][j] = true;

                var x = i * _to.width,
                    y = j * _to.height,
                    $e = $draggable.append('<div></div>'),
                    $new_tile = $e.children(":last"),
                    tile_id = _to.tile_id_func($new_tile, i, j);

                tile_id = 'qt_' + tile_id.replace(/-/g, "n");
                $new_tile.attr({
                    "class": _to.class_name,
                    "id": tile_id
                }).css({
                    left: x,
                    top: y
                });

                // Check that everything is working...
                if (msos.infinitedrag.tiles[tile_id]) {
                    msos.console.error('msos.infinitedrag - create_tile -> duplicate tile for col: ' + i + ', row: ' + j + ', id: ' + tile_id + ', position: ' + x + ',' + y);
                    msos.console.error(msos.infinitedrag.tiles[tile_id]);
                }

                // Track our just created tile
                msos.infinitedrag.tiles[tile_id] = [i, j, x, y];
                _to.oncreate(tile_id, i, j);
            }

            // Updates the containment box wherein the draggable can be dragged.
            function update_containment() {
                if (msos.config.verbose) {
                    msos.console.debug('msos.infinitedrag - update_containment -> initial: ', msos.infinitedrag.containment);
                }
                // Update viewport info.
                var vp_width = $viewport.width(),
                    vp_height = $viewport.height(),
                    vp_offset = $viewport.offset(),
                    vp_draggable_width = vp_width - _to.width,
                    vp_draggable_height = vp_height - _to.height;

                msos.infinitedrag.containment = [
                (-_to.range_col[1] * _to.width) + vp_offset.left + vp_draggable_width, (-_to.range_row[1] * _to.height) + vp_offset.top + vp_draggable_height, (-_to.range_col[0] * _to.width) + vp_offset.left, (-_to.range_row[0] * _to.height) + vp_offset.top];

                $draggable.draggable("option", "containment", msos.infinitedrag.containment);
                if (msos.config.verbose) {
                    msos.console.debug('msos.infinitedrag - update_containment -> final:   ', msos.infinitedrag.containment);
                }
            }

            function update_tiles() {
                var $this = $draggable,
                    $parent = $this.parent(),
                    vp_width = $viewport.width(),
                    vp_height = $viewport.height(),
                    vp_cols = Math.ceil(vp_width / _to.width),
                    vp_rows = Math.ceil(vp_height / _to.height),
                    pos = {
                        left: $this.offset().left - $parent.offset().left,
                        top: $this.offset().top - $parent.offset().top
                    },
                    visible_left_col = Math.ceil(-pos.left / _to.width) - 1,
                    visible_top_row = Math.ceil(-pos.top / _to.height) - 1,
                    i = 0,
                    j = 0;

                for (i = visible_left_col; i <= visible_left_col + vp_cols; i += 1) {
                    for (j = visible_top_row; j <= visible_top_row + vp_rows; j += 1) {
                        if (grid[i] === undefined) {
                            grid[i] = {};
                        }
                        else if (grid[i][j] === undefined) {
                            create_tile(i, j);
                        }
                    }
                }
            }

            // Public Methods
            //-----------------
            self.draggable = function () {
                return $draggable;
            };

            self.disabled = function (value) {
                if (value === undefined) {
                    return $draggable;
                }

                $draggable.draggable("option", "disabled", value);
                $draggable.css({
                    cursor: (value) ? "default" : "move"
                });
            };

            self.center = function (col, row) {
                var x = _to.width * col,
                    y = _to.height * row,
                    half_width = _to.width / 2,
                    half_height = _to.height / 2,
                    half_vw_width = $viewport.width() / 2,
                    half_vw_height = $viewport.height() / 2,
                    offset = $draggable.offset(),
                    new_offset = {
                        left: -x - (half_width - half_vw_width),
                        top: -y - (half_height - half_vw_height)
                    };

                if (_do.axis == "x") {
                    new_offset.top = offset.top;
                }
                else if (_do.axis == "y") {
                    new_offset.left = offset.left;
                }
                $draggable.offset(new_offset);
                update_tiles();
            };

            // Setup
            //--------
            function create_containment() {
                if (msos.config.verbose) {
                    msos.console.debug('msos.infinitedrag - create_containment -> initial: ', msos.infinitedrag.containment);
                }
                var viewport_width = $viewport.width(),
                    viewport_height = $viewport.height(),
                    viewport_cols = Math.ceil(viewport_width / _to.width),
                    viewport_rows = Math.ceil(viewport_height / _to.height),
                    i = 0,
                    j = 0,
                    m = 0,
                    n = 0;

                $draggable.offset({
                    left: $viewport.offset().left - (_to.start_col * _to.width),
                    top: $viewport.offset().top - (_to.start_row * _to.height)
                });

                for (i = _to.start_col, m = _to.start_col + viewport_cols; i < m && (_to.range_col[0] <= i && i <= _to.range_col[1]); i += 1) {
                    grid[i] = {};
                    for (j = _to.start_row, n = _to.start_row + viewport_rows; j < n && (_to.range_row[0] <= j && j <= _to.range_row[1]); j += 1) {
                        create_tile(i, j);
                    }
                }
                if (msos.config.verbose) {
                    msos.console.debug('msos.infinitedrag - create_containment -> final:   ', msos.infinitedrag.containment);
                }
            }

            // The drag event handler.
            _do.drag = function () {
                update_tiles();
            };

            $draggable.draggable(_do);

            create_containment();
            update_containment();
        };

    /**
     * Function to create InfiniteDrag object.
     */
    $.infinitedrag = function (draggable, draggable_options, tile_options) {
        return new InfiniteDrag(draggable, draggable_options, tile_options);
    };

}(jQuery));