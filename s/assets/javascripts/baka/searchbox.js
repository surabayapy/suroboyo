var timeout = [];

baka.ns('kara.ui.fields.searchbox', {
	setup: function (fieldset, options) {
		var field = {
			group: $(fieldset).find('.searchbox'),
			input: $(fieldset).find('input'),
			terms: $(fieldset).find('input[type=hidden]'),
			dropdown: $(fieldset).find('.search-box-dropdown'),
			max: options.size || 0,
			url: options.url || '',
			method: options.method || 'POST',
			id: options.id
		}, input_terms = $('#' + field.id);
		input_terms.on('propertychange.k input.k change.k', function () {
			on_search(this, field);
		}).trigger('change.k');

		input_terms.on('focus', function() {
			input_terms.trigger('change.k');
		});

		baka.d.on('click', '.search-box-options', function (e) {
			e.preventDefault();
			var $items = field.dropdown.find('li.search-box-option a'),
			index = $items.index(e.target);
			if(index < 0) return;
			field.input.focus();
			field.input.val('');
			kara.ui.actions.do(e.target);
			on_close(field);
		});

		function on_close(field) {
			field.dropdown.removeClass('search-box-dropdown--open').addClass('search-box-dropdown');
        //$(this).off('propertychange.k input.k change.k');
        clearTimeout(timeout[field.id]);
      }

      function on_search(element, field) {
      	var usesValue = [];
      	var val_field = $(element);

      	if (val_field.val().length < parseInt(field.max)) {
      		field.dropdown.removeClass('search-box-dropdown--open').addClass('search-box-dropdown');
      		return;
      	}

      	field.dropdown.removeClass('search-box-dropdown').addClass('search-box-dropdown--open');

      	usesValue.push(val_field.val());
      	clearTimeout(timeout[field.id]);
      	timeout[field.id] = setTimeout(
      		function () {
      			getUriAjax(field, usesValue.join(' '));
      			field.terms.val(usesValue.join(' '));
      		},
      		200
      		);
      }
    /**
     * Get URI for slug from remote.
     *
     * @private
     * @function getUriAjax
     * @memberof k.action.searchbox
     *
     * @param {object} field - Field data.
     * @param {string} text - New slug text.
     */
     function getUriAjax(field, text) {
     	var render_ = field.dropdown.find('ul.search-box-options');
     	$.ajax({
     		url: field.url,
     		type: field.method,
     		data: {
     			q: text
     		},
     		success: function (data) {
                // handlebar renderer
                render_.render('options', data);
              },
              error: function () {
              	console.log('failed to get an URI');
              }
            });
     }
   }
 });