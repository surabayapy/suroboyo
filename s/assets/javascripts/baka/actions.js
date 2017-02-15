baka.ns('kara.ui.actions', {
	init: function() {
        console.log('kara.ui.actions');
		baka.logger('kara.ui.actions').debug('init setup');
	},
	blank_open: function (options) {
		kara.container.add_container(options);
		var url = kara.ui.helpers.get_action_url(options);
		window.open(url , '_tab');
		kara.ui.container.delete_container();
	},
	dialog_open: function(options) {
		kara.ui.container.add_container(options);
		var url = kara.ui.helpers.get_action_url(options);

		this.dialog_url(url);
	},
	dialog_url: function(url) {
		$('#_progress_').dialog('open');
		$('#_dialog_').load(url,
			function(data){
				data = kara.ui.helpers.disable_inputs(data);
				$('#_dialog_').html(data);
				$('#_progress_').dialog('close');
				$.parser.parse('#_dialog_');
			}
			);
	},
	tab_open: function (options) {
		var url = options.url.trim();
		if(!url || url == '/') return;
		var title = options.title;
		var main_tabs = $('#_tabs_');
		if(main_tabs.tabs('exists', title)){
			main_tabs.tabs('select', title);
		} else {
			main_tabs.tabs('add', {
				title: title,
				selected: true,
				closable: true,
				href: url,
				extractor:function(data){
					data = $.fn.panel.defaults.extractor(data);
					return data;
				},
				tools:[{
					iconCls:'icon-mini-refresh',
					handler:function(){
						var li = $(this).closest('li');
						var ul = $(this).closest('ul');
						var idx = ul.find('li').index(li);
						var tab = $('#_tabs_').tabs('getTab', idx);
						tab.panel('refresh');
					}
				}]
			});
		}
	},
	do: function($el) {
		var action = $($el).data('k-action');
		if (typeof action === 'undefined') return;
		var opts = $.parser.parseOptions($el);
		switch (action) {
			case('tab_open'):
				this.tab_open(opts);
				break;
			case('dialog_open'):
				this.dialog_open(opts);
				break;
			case('blank_open'):
				this.blank_open(opts);
				break;
			case('refresh'):
				kara.ui.container.add_container(opts);
				kara.ui.container.refresh_container(null);
				break;
			case('container_action'):
				kara.ui.container.container_action(opts);
				break;
			case('container_picker'):
				kara.ui.container.container_picker(opts);
				break;
		}
	}
});

baka.ns('kara.ui.dropdown', {
	init: function() {
		$('[data-dropdown]').each(function() {
			$(this).on('click', function(){
				var $button, $menu;
				$button = $(this);
				$menu = $button.siblings(".dropdown-menu");
				$menu.toggleClass("show-menu");
			});
		});
	}
});