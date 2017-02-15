baka.ns('kara.ui.fields', {
    field: null,
    opts: null,
    init: function() {
        $('[data-k-field]').each(function(){
            var self = this;
            this.field = $(this).data('k-field');
            this.opts = $.parser.parseOptions(this);
            console.log(kara.fun.setup(kara.ui, 'setup'));
            _.map(kara.fun.setup(kara.ui, 'setup'), function(clsObj) {
                console.log(self.opts);
                console.log(clsObj);
                for (var obj in clsObj) {
                    console.log(self.opts);
                    clsObj[obj].setup(self, self.opts);
                }

            });
        });
    }
});