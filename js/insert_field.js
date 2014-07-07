Drupal.behaviors.insert_field = {
  attach: function (context, settings) {

    // Initiate the tabs with no tab selected.
    jQuery('.insert-field-tabs').once('insert-field').tabs({
      selected: -1,
      collapsible: true
    });

    // Add a click handler to the Insert Button.
    jQuery('.insert-button').once('button-click').click(function(e) {

      // Do Not execute the button fuction.
      e.preventDefault();

      // Get the field from the name attribute.
      var field = jQuery(this).attr('name');

      // @TODO: Change this to the parent, rather than a hard-coded value!
      // Insert the Comment into the Parent Field.
      jQuery('#edit-body-und-0-value').insertAtCaret('<!-- '+field+' -->');

    });

  }
};
