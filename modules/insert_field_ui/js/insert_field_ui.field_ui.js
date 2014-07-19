Drupal.behaviors.insertFieldUIFieldUI = {
  attach: function (context, settings) {

    // Get the Taible.
    var table = jQuery('#field-overview, #field-display-overview');

    // Attach the Handlers to the Table once.
    jQuery(table).once('insert-field', function() {

      // Get the Insert Field Settings.
      var insert_field = settings.insert_field;

      // Create a Row ID Object.
      insert_field.row_id = new Object();

      // Loop through the Field Settings.
      for (var field in Drupal.settings.insert_field.field_settings) {

        // Save the field_machine_name indexed by row id.
        insert_field.row_id[field.replace('_', '-')] = field;

        // Save the row_id indexed by field_machine_mane.
        insert_field.field_settings[field].row_id = field.replace('_', '-');

      }

      // Get the ID of the table.
      var id = jQuery(table).attr('id');

      // Save the existing onDrop() method for later use.
      Drupal.tableDrag[id]._onDrop = Drupal.tableDrag[id].onDrop;

      // Override the existing onDrop() method.
      Drupal.tableDrag[id].onDrop = Drupal.insertFieldFieldUI.onDrop;

      // Save the existing validIndentInterval() for later use.
      Drupal.tableDrag[id].row.prototype._validIndentInterval = Drupal.tableDrag[id].row.prototype.validIndentInterval;

      // Override the existing validIndentInterval() method.
      Drupal.tableDrag[id].row.prototype.validIndentInterval = Drupal.insertFieldFieldUI.row.validIndentInterval;

    });

  }
};

Drupal.insertFieldFieldUI = {};

/*
 * Replaces the Field UI onDrop() method.
 * This is done to keep the 'region' up to date with the field children.
 *
 * @see: Drupal.fieldUIOverview.onDrop().
 */
Drupal.insertFieldFieldUI.onDrop = function() {
  var dragObject = this;
  var row = dragObject.rowObject.element;
  var rowHandler = jQuery(row).data('fieldUIRowHandler');

  // Get the Insert Field Settings.
  var settings = Drupal.settings.insert_field;

  // Get the Formatter Value.
  var formatter = jQuery('.field-formatter-type', row);

  // If the formatter cannot be found, pass back to the origin method.
  if (!formatter.length) {
    return this._onDrop();
  }

  var value = jQuery(formatter).get(0).value;

  // Start an empty refresh object for storing all of the refreshRows.
  // This allows use to perform a single AJAXRefreshRows().
  var refresh = {};

  // Start the refreshRows as an empty object.
  var refreshRows = {};

  // Start the Region as an empty string since the region we are moving towards
  // is not yet known.
  var region = '';

  // Ensure that the rowHandler is defined.
  if (typeof rowHandler != 'undefined') {

    // Get the Region we are moving towards.
    var regionRow = jQuery(row).prevAll('tr.region-message').get(0);
    var region = regionRow.className.replace(/([^ ]+[ ]+)*region-([^ ]+)-message([ ]+[^ ]+)*/, '$2');

    // Attempt to refresh the row.
    if (refreshRows = Drupal.insertFieldFieldUI.regionChange(region, rowHandler)) {

      // Add the refresh row to our mastor object.
      refresh = jQuery.extend(refreshRows, refresh);

    }

  }

  // If a Region was found, and the row is an insert field:
  if (region && typeof settings.row_id[row.id] != 'undefined') {

    // Loop through every parent field, searching for children to the current row.
    jQuery('select.field-parent').each(function() {

      // Get the value and compare it to the current row field id.
      if (jQuery(this).get(0).value == settings.row_id[row.id]) {

        // Get the Row.
        var childRow = jQuery(this).parents('tr');

        // Get the rowHandler for the current child row.
        var childRowHandler = jQuery(childRow).data('fieldUIRowHandler');

        // Ensure that the rowHandler does in fact exist.
        if (typeof childRowHandler != 'undefined') {

          // Attempt to refresh the child row(s).
          if (refreshRows = Drupal.insertFieldFieldUI.regionChange(region, childRowHandler)) {

            // Add the refresh row to our mastor object.
            refresh = jQuery.extend(refreshRows, refresh);

          }

        }



      }

    })

  }

  // Ajax-update the rows.
  Drupal.fieldUIOverview.AJAXRefreshRows(refreshRows);

}

/*
 * Region change method.
 *
 * @see: Drupal.fieldUIOverview.onDrop().
 */
Drupal.insertFieldFieldUI.regionChange = function(region, rowHandler) {

  // Check to ensure that the region is actually changing.
  if (region != rowHandler.region) {

    // Let the row handler deal with the region change.
    refreshRows = rowHandler.regionChange(region);

    // Update the row region.
    rowHandler.region = region;

    // Return the refreshRows object.
    return refreshRows;

  }

  // Since nothing was done, return an empty object.
  return {};

}

Drupal.insertFieldFieldUI.row = {};

/*
 * Save the existing validIndentInterval() method for later use.
 */
Drupal.insertFieldFieldUI.row._validIndentInterval = Drupal.tableDrag.prototype.row.prototype.validIndentInterval;

/*
 * Override the exisitng validIndentInterval() method.
 * Since some fields can be inserted (under certain condtions), and some cannot
 * be inserted at all, we must instruct the rowHandler if the indentation is
 * valid or not.
 *
 * @see: Drupal.tableDrag.prototype.row.prototype.validIndentInterval.
 */
Drupal.insertFieldFieldUI.row.validIndentInterval = function (prevRow, nextRow) {

  // Get the Current Row.
  var row = jQuery(this.element);

  // Get the Insert Field Settings.
  var settings = Drupal.settings.insert_field;

  // Execute the Existing validIndentInterval() method.
  var interval = Drupal.insertFieldFieldUI.row._validIndentInterval(prevRow, nextRow);

  // If the Interval Max is not 0:
  if (interval.max) {

    // Get the ID of the current row.
    var id = jQuery(row).attr('id');

    // Ensure that this is a Field.
    var is_field = settings.row_id.hasOwnProperty(id);

    // Not a Text Field by Default.
    var text_field = false;

    // If the Current Field is a Field:
    if (is_field) {

      // Set the Field Type to NULL.
      var type;

      // Get the Field Type from the Field Settings.
      type = settings.field_settings[settings.row_id[id]].type;

      // List of all posible Text types.
      var types = [
        'text_textarea',
        'text_textarea_with_summary',
        'text_default'
      ];

      // If the field type is in the text field array, it is a text field.
      if (jQuery.inArray(type, types)) {
        text_field = true;
      }

    }

    // The Field is not an Insert Field by Default.
    var text_insert = false;

    // Only Text Fields can be Insert Fields.
    if (text_field) {

      // Get the literal next row.
      var next = jQuery(row).next('tr').get(0);

      // If the indentation is greater of the next row than this row,
      // then the current row has children, which makes it an insert field.
      if (jQuery('.indentation', next).length > jQuery('.indentation', row).length) {
        text_insert = true;
      }

    }

    // Rather than basing the indent on the previous row,
    // traverse the tree until a field that is not a leaf is found.
    var prev = jQuery(prevRow);
    var found = false;
    var leaf = false;
    var parent = false;

    // Continue moving up the tree until a parent is found.
    do {

      // If the row is not a leaf, it can have children.
      if (!jQuery(prev).hasClass('tabledrag-leaf')) {
        found = true;

        // Get the Parent (if there is one).
        parent = jQuery('.field-parent.form-select', prev).get(0).value;
      }
      else {

        // Continue to the previous row.
        prev = jQuery(prev).prev('tr').get(0);

      }

    } while (prev && !found);

    // If a suitable previous row was found:
    if (found) {

      // Modifications should only be performed on rows which are not
      // Fields, are Insert Fields, or the Parent, has a Parent.
      if (!is_field || text_insert || parent) {

        // If this is not a Field and there is a Parent, set
        // the literal parent as the previous field, to prevent
        // non-fields from being falsely inserted.
        if (!is_field && parent) {
          prev = jQuery('#'+settings.field_settings[parent].row_id);
        }

        // Do not go deeper than as a child of the previous row.
        var max = jQuery('.indentation', prev).length;

        // Limit by the maximum allowed depth for the table.
        interval.max = (max < interval.max) ? max : interval.max;

      }

    }

  }

  // Return the interval.
  return interval;

};
