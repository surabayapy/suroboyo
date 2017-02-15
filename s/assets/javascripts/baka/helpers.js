baka.ns('kara.ui.helpers', {
	get_action_url: function(options) {
		var container = $(kara.ui.container.get_container());
		var url = options.url;
		var param_name = options.param?options.param:'id';
		switch(options.property){
			case('with_row'):
			var row = kara.ui.container.get_selected(container);
			if(!row) {
				kara.ui.actions.dialog_url('/system_need_select_row');
				return;
			}
			if(url.indexOf('?') == -1) url = url + '?' + param_name + '=' + row[param_name];
			else url = url + '&' + param_name + '=' + row[param_name];
			break;
			case('with_rows'):
			var rows = kara.ui.container.get_checked(container);
			if(!rows.length){
				kara.ui.actions.dialog_url('/system_need_select_rows');
				return;
			}
			var params = Array();
			$.each(rows, function(i, row){params.push(row[param_name]);});
			if(url.indexOf('?') == -1) url = url + '?' + param_name + '=' + params.join();
			else url = url + '&' + param_name + '=' + params.join();
			break;
		}
		var params_str = options.params_str?options.params_str:null;
		if(params_str){
			if(url.indexOf('?') == -1) url = url + '?' + params_str;
			else url = url + '&' + params_str;
		}
		return url;
	},
	get_params_str: function(options) {
		var params_str = options.params_str? options.params_str : null;
		if ($.isFunction(params_str)) {
			params_str = params_str();
		}
		console.log(params.str);
		return params_str;
	},
	disable_inputs: function(data) {
		var form = $(data).find('form');
		if(form.hasClass('readonly')){
			var d = $('<div>').html(data);
			d = this.disable_obj_inputs(d);
			return d.html();
		}
		return data;
	},
	disable_obj_inputs: function(obj) {
		obj.find(":input").attr("disabled", true);
		obj.find("[type=reset]").attr("disabled", false);
		obj.find("[type=submit]").addClass("disable");
		return obj;
	},
	clear_inputs: function(selector) {
		$(selector).find('.easyui-datebox').datebox('clear');
		$(selector).find('.easyui-datetimebox').datetimebox('clear');
		$(selector).find('.easyui-combobox').combobox('clear');
		$(selector).find('.easyui-combogrid').combogrid('clear');
		$(selector).find('.easyui-combotree').combotree('clear');
		$(selector).find('.easyui-numberbox').numberbox('clear');
	},
	add_datebox_clear_btn: function(selector) {
		var datebox_buttons = $.extend([], $.fn.datebox.defaults.buttons);
		datebox_buttons.splice(1, 0, {
			text: 'Clear',
			handler: function(target){
				$(target).datebox('clear');
			}
		});
		$(selector).datebox({
			buttons: datebox_buttons
		});
	},
	add_datetimebox_clear_btn: function(selector) {
		var datetimebox_buttons = $.extend([], $.fn.datetimebox.defaults.buttons);
		datetimebox_buttons.splice(1, 0, {
			text: 'Clear',
			handler: function(target){
				$(target).datetimebox('clear');
			}
		});
		$(selector).datetimebox({
			buttons: datetimebox_buttons
		});
	},
	get_higher_zindex: function() {
		var highest = -999;
		$("*").each(function() {
			var current = parseInt($(this).css("z-index"), 10);
			if(current && highest < current) highest = current;
		});
		return highest;
	},
	getKeyByValue: function(obj, value) {
		var key = null;
		for (var name in obj) {
			if (obj.hasOwnProperty(name) && obj[name] === value) {
				key = name;
				break;
			}
		}
		return key;
	},
	payment_indicator: function(percent) {
		var text = $('<span>').html(percent + '%');
		if(percent > 100) percent = 100;
		var el = $('<div>').css('width', percent + '%').html('&nbsp;');
		el = $('<div>').addClass('payment-indicator tc')
		.css('width', '100%').append(text).append(el);
		el = $('<div>').append(el);
		return el.html();
	},
	dt_formatter: function(date, format) {
		return Date.format(date, format);
	},
	dt_parser: function(s, format) {
		if(!s) return new Date();
		return Date.parseFormatted(s, format);
	},
	get_icon: function(cls) {
		return $('<span/>').addClass('fa ' + cls);
	},
	datagrid_resource_cell_styler: function(){
		return 'background-color:#ededed';
	},
	status_formatter: function(status) {
		if(status){
			var span = $('<span/>').html(status.title);
			span.addClass('status-label ' + status.key);
			return $('<div/>').append(span).html();
		}
	},
	account_item_type_formatter: function(item_type) {
		if(item_type){
			var span = $('<span/>').addClass('fa mr05');
			var title = $('<span/>').html(item_type.title);
			switch(item_type.key){
				case 'revenue':
				span.addClass('fa-long-arrow-right');
				break;
				case 'expenses':
				span.addClass('fa-long-arrow-left');
				break;
				default:
				span.addClass('fa-arrows-h');
				break;
			}
			return $('<div/>').append(span).append(title).html();
		}
	},
	format_download_link: function(url) {
		var span = $('<span/>').addClass('fa fa-download');
		var a = $('<a target="_blank"/>').attr('href', url).append(span);
		return $('<div/>').append(a).html();
	},
	is_undefined: function(val){
		return typeof(val) == 'undefined';
	}
});