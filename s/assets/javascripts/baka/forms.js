baka.ns('kara.ui.forms', {
	show_status_bar_info: function(status_bar, info_type, message){
		var icon = $('<i>');
		if(info_type == 'error'){
			status_bar.addClass('error');
			icon.attr('class', 'fa fa-exclamation-circle fa-lg');
		}
		if(info_type == 'info'){
			status_bar.removeClass('error');
			icon.attr('class', 'fa fa-info-circle fa-lg');
		}
		if(info_type == 'success'){
			status_bar.removeClass('error');
			icon.attr('class', 'fa fa-check-circle fa-lg');
		}
		if(info_type == 'loading'){
			status_bar.removeClass('error');
			icon.attr('class', 'fa fa-spinner fa-spin fa-lg');
		}
		status_bar.html(icon).append('&nbsp;' + message);
	},
	is_form_errors: function(errors){
		if(!kara.ui.helpers.is_undefined(errors))
			return true;
		return false;
	},
	show_form_errors: function(form, errors){
		var self = this;
		if(self.is_form_errors(errors)){
			$.each(errors, function(input_name, error) {
				self.set_field_error(form, input_name, error);
			});
		}
	},
	set_field_error: function(form, input_name, error){
        var input_selector = "input[name='" + input_name + "']";
		var selector = "[data-name='" + input_name + "']";
		//if(form.find(selector).hasClass('as-text'))
		//	form.find(selector + ' span').html(error);
		//else
		//	form.find(selector).tooltip({content: error, position: 'right'});
        form.find(input_selector).addClass('_invalid');
        form.find(selector + ' span').html(error);
        form.find(selector + ' i').tooltip({content: error, position: 'right'});
		//form.find(selector).show();
	},
	clear_form_errors: function(form){
		//form.find('span.error').hide();
        form.find('.inputfield ._invalid').removeClass('_invalid');
	},
	submit: function(form) {
		var self = this;
        $('#_progress_').dialog('open');
		form.form('submit', {
			url: form.attr('action'),
			success: function (data) {
        // TODO: Parsing with Jwt for security
        var json = $.parseJSON(data);
                console.log(json);
        self.clear_form_errors(form);
        if (!kara.ui.helpers.is_undefined(json.error_message)) {
        	self.show_form_errors(form, json.errors);
        	//self.show_status_bar_info(form.find('.status-bar'), 'error', json.error_message);
        } else {
        	if (!kara.ui.helpers.is_undefined(json.redirect)) {
        		window.location.href = json.redirect;
        		return;
        	}
            //kara.ui.actions.dialog_url(url);
        	//self.show_status_bar_info(form.find('.status-bar'), 'success', json.success_message);
        	//if (kara.ui.helpers.is_undefined(json.close) || json.close == true) {
        	//	form.closest('.easyui-dialog').dialog('destroy');
        	//	if (!kara.ui.helpers.is_undefined(json.response)) {
        	//		kara.ui.container.save_container_response(json.response);
        	//	}
        	//	kara.ui.container.refresh_container(null);
        	//}
        }
        $('#_progress_').dialog('close');
      },
      onSubmit: function () {
        console.log('form[onSubmit] ---');
      	//self.show_status_bar_info(form.find('.status-bar'), 'loading', 'loading...');
      },
      onLoadSuccess: function () {
      	return false;
      },
      onLoadError: function () {
        console.log('form[onLoadError] ---');
      	//self.show_status_bar_info(form.find('.status-bar'), 'error', 'Oops... Problems during request');
      }
    });
	}
});