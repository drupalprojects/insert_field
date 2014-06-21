Drupal.behaviors.insert_field = {
  attach: function (context, settings) {

    jQuery('.insert-field-tabs').once('insert-field').tabs({
      selected: -1,
      collapsible: true
    });

    jQuery('.insert-button').once('button-click').click(function(e) {
      e.preventDefault();

      var field = jQuery(this).attr('name');

      jQuery('#edit-body-und-0-value').insertAtCaret('<!-- '+field+' -->');
    });

  }
};
