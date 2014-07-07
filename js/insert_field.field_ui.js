Drupal.behaviors.insertFieldFieldUI = {
  attach: function (context, settings) {

    var table = jQuery('#field-overview, #field-display-overview');

    jQuery(table).once('insert-field', function() {

      var id = jQuery(table).attr('id');
      Drupal.tableDrag[id].onDrop = Drupal.insertFieldFieldUI.onDrop;

      Drupal.insertFieldFieldUI.onDrop();

    });

    jQuery('tr', table).once('always-leaf').each(function() {

      if (jQuery(this).hasClass('tabledrag-leaf')) {
        jQuery(this).addClass('always-leaf');
      }

    });

  }
};

Drupal.insertFieldFieldUI = {};

Drupal.insertFieldFieldUI.onDrop = function() {


  var table = jQuery('#field-overview, #field-display-overview');

  jQuery('.field-parent.form-select', table).each(function() {

    var row = jQuery(this).parents('tr');

    if (jQuery(this).get(0).value) {

      if (!jQuery(row).hasClass('always-leaf')) {
        jQuery(row).addClass('tabledrag-leaf');
      }

    }
    else {

      if (!jQuery(row).hasClass('always-leaf')) {
        jQuery(row).removeClass('tabledrag-leaf');
      }

    }

  });

}
