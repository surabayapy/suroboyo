
$.handlebars({
    templatePath: 'static/templates',
    templateExtension: 'hbs'
});

$.extend($.fn.textbox.defaults.inputEvents, {
    keyup: function(e){
        var t = $(e.data.target);
        t.textbox('setValue', t.textbox('getText'));
    }
});

kara.app = Class.extend({
    init: function(opts) {
        $.extend(this, opts);
        this.setupReady();
    },
    setupReady: function() {
        _.flatMap(kara.fun.setup(kara, 'init'), function(clsObj) {
            for (var obj in clsObj) {
                clsObj[obj].init();
            }
        });

        baka.d.on('click', '._action', function(e){
            e.preventDefault();
            kara.ui.actions.do(this);
        });

        $('._action').on('click', function(e){
            e.preventDefault();
            kara.ui.actions.do(this);
        });

        baka.d.on('click', 'form._ajax input[type=reset]', function (e) {
            e.preventDefault();
            $(this).closest('.easyui-dialog').dialog('destroy');
            kara.ui.container.delete_container();
        });

        baka.d.on('click', 'form._ajax input[type=submit]', function (e) {
            e.preventDefault();
            kara.ui.forms.submit($(this).closest('form._ajax'));
        });
    }
});
$(document).ready(function(){new kara.app()});
