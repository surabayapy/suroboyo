function is_undefined(val){
    return typeof(val) == 'undefined';
}

function is_int(val){
    var intRegex = /^\d+$/;
    if(intRegex.test(val)) return true;
    return false;
}
