
kara.containers = Array();

baka.ns('kara.ui.container', {
	add_container: function(options) {
		if(options.container){
			kara.containers.push(options.container)
		}
		return;
	},
	get_container: function(){
		if(kara.containers.length > 0){
			return kara.containers[kara.containers.length - 1]
		}
		return null;
	},
	delete_container: function(){
		kara.containers.pop();
		return;
	},
	refresh_container: function(container) { 
    if(!container) container = kara.containers.pop();
    var container = $(container);
    var container_type = this.get_container_type($(container));
    switch(container_type){
        case('datagrid'):
            container.datagrid('reload');
            break;
        case ('treegrid'):
            container.treegrid('reload');
            break;
        case('combobox'):
            container.combobox('reload');
            break;
        case('combogrid'):
            var grid = container.combogrid('grid');
            grid.datagrid('reload');
            break;
    }
	},
	save_container_response: function(data){
    var container = this.get_container();
    $(container).data('response', data);
    return;
	},
	container_action: function(options) {
    this.add_container(options);
    var url = kara.ui.helpers.get_action_url(options);
    $.post(url).always(function(){this.refresh_container(null);});
	},
	container_picker: function(options) {
    this.add_container(options);
    var container = $(this.get_container());
    var row = this.get_selected(container);
    if(!row) {
        kara.ui.actions.dialogopen('/system_need_select_row');
        return;
    }
    container.closest('.easyui-dialog').dialog('destroy');
    this.delete_container();
    this.save_container_response(row.id);
	},
	get_selected: function(container) {
    var container_type = this.get_container_type(container);
    var row = null;
    switch(container_type){
        case('datagrid'):
            row = container.datagrid('getSelected');
            break;
        case('treegrid'):
            row = container.treegrid('getSelected');
            break;
        case('combogrid'):
            var grid = container.combogrid('grid');
            row = grid.datagrid('getSelected');
            break;
    }
    return row;
	},
	get_checked: function(container) {
    var container_type = this.get_container_type(container);
    var rows = null;
    switch(container_type){
        case('datagrid'):
            rows = container.datagrid('getChecked');
            break;
        case('treegrid'):
            rows = container.treegrid('getChecked');
            break;
    }
    return rows;
	},
	get_container_type: function(container) {
    var container_type = null;
    if(container.hasClass('easyui-datagrid')) container_type = 'datagrid';
    else if(container.hasClass('easyui-treegrid')) container_type = 'treegrid';
    else if(container.hasClass('easyui-combobox')) container_type = 'combobox';
    else if(container.hasClass('easyui-combotree')) container_type = 'combotree';
    else if(container.hasClass('easyui-combogrid')) container_type = 'combogrid';
    return container_type;
	}
});