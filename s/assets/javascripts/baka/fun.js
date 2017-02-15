

baka.ns('kara.fun', {
    listObj: null,
    setup: function(object, prop) {
        var objs = this.findMap(object);
        baka.logger('kara.fun').debug(objs);
        this.listObj = [];
        this.splitInit(objs, prop);
        return this.listObj;
    },
    findMap: function(object) {
        return _.map(object, function(val, key){
            return _.assign({'name': key}, val);
        });
    },
    find: function(obj, prop) {
        if(obj instanceof Object && $.type(obj) === 'object') {
            return _.filter(obj, function(o) {
                if (o === null) {
                    return false;
                } else {
                    return o[prop];
                }
            });
        }
        return false;
    },
    splitInit: function (objs, prop) {
        for (var obj in objs) {
            if(objs[obj] instanceof Object && $.type(objs[obj]) === 'object') {
                var find_it = this.find(objs[obj], prop);
                if (find_it.length > 0){
                    this.listObj.push(find_it);
                }
                this.splitInit(objs[obj], prop);
            }
        }
    }
});