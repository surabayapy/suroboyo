(function(window, $, Class) {
	'use strict';
	
  // Cache frequently used object
  var document = window.document,
  location = window.location;

  // Create a namespace
  // To add a ns property to the object when you created. It assumed to be used to prefix such as a key name.
  // ns('foo.bar')
  // typeof foo.bar === 'object' // true
  // foo.bar.ns // "fooBar"
  //
  // Namespace you want to create
  // option. Object that you want to set to the name space (and function. Deprecated).
  //       Already exists object, value in the case was also object to extend.
  //			 If is not an object returns an exception (note that the value is in the case was a function would fall into this condition).
  var ns = function(ns, value) {
  	var path = ns.split('.'),
  	obj = window,
  	i, l, prop, last;
  	for (i = 0, l = path.length; i < l; ++i) {
  		prop = path[i];
  		last = i === l - 1;
  		if (obj[prop] === undefined) {
  			obj[prop] = last && value ? value : {};
  		} else {
        if ($.type(obj[prop]) !== 'object') throw new Error(prop + ' is not object.'); // Not acceptable because the complexity and dig than the object (function object)
        if (last && value) {
        	if ($.type(value) === 'object') {
        		$.extend(true, obj[prop], value);
        	} else throw new Error(value + ' value cannot extend.'); // Tell can not extend the exception object
        }
      }
      obj = obj[prop];
    }
    obj.ns || (obj.ns = ns.toLowerCase().replace(/\.(\w)/g, function(_, $1) {
    	return $1.toUpperCase();
    }));
     return obj;
  };

  ns('baka', {
  	w: $(window),
  	d: $(document),
  	h: $('html'),
  	ua: {}, // for navigator
  	ns: ns 
  });


  // baka.class('kara.Button', {});
  // Baka Class generator
  //baka.class = function(namespace, value) {
  //	var obj = {};
  //  console.log($.type(value));
  //	if (value === undefined) {
  //		obj = value ? value : {};
  //	} else {
  //      if (!(value instanceof Object)) {
  //			throw new Error(value + ' is not object.'); // Not acceptable because the complexity and dig than the object (function object)
  //		}
  //	}
  //	ns(namespace);
  //};

  // 1. baka.config(name, value);
  // 2. baka.config({name1: value1, name2: value2}); 
  // baka.config(name);
  // baka.config[name];
  baka.config = function(obj) {
  	if ($.type(obj) !== 'object') {
  		if (!arguments[1]) {
  			return baka.config[obj];
  		}
  		obj = {};
  		obj[arguments[0]] = arguments[1];
  	}
  	for (var name in obj) {
  		baka.config[name] =
  		$.type(baka.config[name]) === 'object' && $.type(obj[name]) === 'object' ?
  		$.extend(true, baka.config[name], obj[name]) :
  		obj[name];
  	}
  	return baka;
  };

  // Default Configuration
  baka.config({
    text: {}, // Translated text
    templates: {},   // template
    timeout: 1000 * 30,      
    apiCache: 1000 * 30 // To use the cache without re-request when within specified ms to had the same GET request
  });


  // Create a unique ID on the page
  baka.id = (function(id) {
  	return function() {
  		return (id++) + '.' + (+new Date);
  	};
  })(0);

  // baka.ua for
  (function() {
  	var ua = navigator.userAgent.toLowerCase();
  	if (/(?:msie|trident)/.test(ua)) {
  		baka.ua.ie = true;
  		baka.ua.v = +(/(?:msie|rv:?)\s?([\d\.]+)/.exec(ua) || [])[1];
  	} else if (/firefox/.test(ua)) {
  		baka.ua.firefox = true;
  	} else if (/chrome/.test(ua)) {
  		baka.ua.chrome = true;
  	} else if (/safari/.test(ua)) {
  		baka.ua.safari = true;
  	}
  	if (baka.ua.chrome || baka.ua.safari) {
  		baka.ua.webkit = true;
  	}
  })();

  // And outputs a log to the console
  (function() {
  	var supported = !!window.console;
  	baka.log = supported ?
  	function() {
  		if (!arguments.length) return;
  		var args = $.makeArray(arguments);
  		args.unshift(new Date().toTimeString().slice(0, 8));
  		'apply' in console.log ?
  		console.log.apply(console, args) :
  		console.dir ?
  		console.dir(args) :
  		console.log(args);
  	} :
  	function() {
  		if (!arguments.length) return;
  		var args = $.makeArray(arguments);
  		args.unshift(new Date().toTimeString().slice(0, 8));
  		$('#console').append(args.join(' '));
  	};
    // For no console.log browser
    supported || (window.console = {
    	log: function() {}
    });

    // whitecube baka.logger compatibility
    var makeLogFunc = function(level, name) {
    	var prefix = level + ' [' + name + ']';
    	return function() {
    		if (!arguments.length) return;
    		var args = $.makeArray(arguments);
    		args.unshift(prefix);
    	};
    };
    var makeLogger = function(name) {
    	return {
    		setDefaultLevel: function() {},
    		trace: makeLogFunc('trace', name),
    		debug: makeLogFunc('debug', name),
    		info: makeLogFunc('info', name),
    		warn: makeLogFunc('warn', name),
    		error: makeLogFunc('error', name)
    	};
    };
    baka.logger = function(name) {
    	if (!baka.logger.loggers[name]) {
    		baka.logger.loggers[name] = makeLogger(name);
    	}
    	return baka.logger.loggers[name];
    };
    baka.logger.loggers = {};
  })();
  // str string namespace or title
  // type string namespace type
  //      - "css": foo-bar
  //      - "class": FooBar
  //      - "prop": fooBar
  //      - "cookie": foo_bar
  baka.letterCase = function(str, type) {
  	str = str
  	.replace(/_([-A-Z\d]+)/g, '$1')
  	.replace(/(^|.)([-A-Z\d]+)/g, '$1_$2')
  	.replace(/([A-Z]+)([A-Z][a-z0-9])/g, '$1_$2')
  	.replace(/-/g, '');
  	switch (type) {
  		case 'css':
  		str = str
  		.replace(/_{2,}/g, '')
  		.replace(/_/g, '-')
  		.toLowerCase();
  		break;

  		case 'class':
  		str = str.replace(/_([a-z]|[0-9])/ig, function(_, letter) {
  			return letter.toUpperCase();
  		});
  		str = str.charAt(0).toUpperCase() + str.slice(1);
  		break;

  		case 'prop':
  		str = str
  		.replace(/_([a-z]|[0-9])/ig, function(_, letter) {
  			return letter.toUpperCase();
  		})
  		.replace(/^[A-Z]+/, function(_, letter) {
  			return letter.toLowerCase();
  		});
  		break;

  		default:
  		str = str.toLowerCase();
  	}
  	return str;
  };


  baka.truncate = function(str, max_length) {
  	str || (str = '');
  	return str.length > max_length ? str.slice(0, max_length) + '...' : str;
  };


  // 1234 -> 1,234
  var format_separator = /^(-?\d+)(\d{3})/;
  baka.format = function(v) {
  	v = v.toString();
  	/*jshint noempty:false */
  	while (v !== (v = v.replace(format_separator, '$1,$2'))) {}
  		return v;
  };

  // 1 -> 01
  // V number | value to be filled with string 0.
  // Places = 2 number option. Number of digits you want to fill.
  baka.padding = function(v, places) {
  	places || (places = 2);
  	var n = v.toString().split('.')[0].length;
  	while (n++ < places) {
  		v = '0' + v;
  	}
  	return v;
  };

  baka.unique = function(v) {
  	v.filter(function(item, i, v) {
  		return v.indexOf(item) === i;
  	});
  };


  // template
  // Baka.template ( 'foo-bar') and when he,
  // 1. return it if there is baka.config.templates [ 'foo-bar'].
  // 2. <script id = "template-foo-bar" type = "text / x-handlebars-template"> ... </ script>
  // Return to compile the contents of.
  // Later next time and save the results to baka.config.templates [ 'foo-bar'] is to use the cache
  // (Template is not a method to remove the cache because it assumes you do not want to overwrite).
  // Name string template name
  // Data object
  // Returns string
  // TODO: to be able to use a template other than Handlebars
  // baka.template = function(name, data) {
  // 	var template = baka.config.templates[name];
  // 	if (!template) {
  // 		template = Handlebars.compile($('#template-' + name).html());
  // 		baka.config.templates[name] = template;
  // 	}
  // 	return $.trim(template(data))
  // 	.replace(/^[\x20\t]+/mg, '').replace(/[\x20\t]+$/mg, '')
  // 	.replace(/[\r\n]+/g, '');
  // };


  // クエリーパラメーターを組み立てたりパースしたりする
  // GETで扱うURLが対象なので複雑なことは行わない。
  ns('baka.query', {
        // 値がnull/undefinedのキーをオブジェクトから削除する
        // queries object クエリーオブジェクト
        slim: function(queries) {
        	var k, v, ret = {};
        	for (k in queries) {
        		v = queries[k];
        		if (v !== null && v !== undefined) ret[k] = v;
        	}
        	return ret;
        },

    // URLを組み立てる
    // path string オプション。クエリーよりも前のパスを指定。省略した場合はlocation.pathnameが使われる
    // queries object クエリーオブジェクト
    // returns string パス文字列
    // TODO: pathを絶対URLにしたい
    build: function(path, queries) {
    	var encode = window.encodeURIComponent,
    	k, q = [];
    	if (arguments.length === 1) {
    		queries = path;
    		path = location.pathname;
    	}
    	queries = baka.query.slim(queries);
    	for (k in queries) {
    		q.push(encode(k) + '=' + encode(queries[k]));
    	}
    	q = q.join('&');
    	return path + (q.length ? (path.indexOf('?') === -1 ? '?' : '&') + q : '');
    },

    // 現在のURLのクエリーパラメーターを置き換えたURLを作成する
    // queries object クエリーオブジェクト。値がnull/undefinedのキーは無視する。
    // replaceState boolean オプション。ついでにhistory.replaceStateでlocationを書き換えるかどうか。
    // hash boolean オプション。location.hashを含めるか。デフォルトで含める。falseの場合含めない。
    // returns string パス文字列
    // TODO: 必要になったらpathも渡すようにする
    replace: function(queries, replaceState, hash) {
    	var url = baka.query.build(
    		$.extend(baka.query.parse(), queries)
    		) + (hash !== false ? location.hash : '');
    	if (url !== location.href && replaceState && window.history.replaceState) {
    		window.history.replaceState(null, '', url);
    	}
    	return url;
    },

    // クエリー文字列をパースする
    // query string オプション。クエリー文字列。値がない場合はキーを無視する。
    //       URL文字列を渡した場合は?以降を利用する。
    //       省略した場合location.searchをパースする。
    // returns object クエリーオブジェクト
    parse: function(query) {
    	query = (query || window.location.search)
    	.replace(/^[^?]*\?/, '')
    	.replace(/\+/g, ' ')
    	.split('&');
    	var decode = window.decodeURIComponent,
    	r = /^([^=]+)=(.*)$/,
    	i, q, m, ret = {};
    	for (i = 0; q = query[i]; ++i) {
    		m = r.exec(q) || [];
    		m[1] && (ret[decode(m[1])] = m[2] && decode(m[2]));
    	}
    	return ret;
    }
  });

  baka.query.base = baka.query.parse();


  ns('baka.html', {
  	escape: function(str) {
  		return str.toString()
  		.replace(/&/g, '&amp;')
  		.replace(/"/g, '&quot;')
  		.replace(/</g, '&lt;')
  		.replace(/>/g, '&gt;');
  	},
  	unescape: function(str) {
  		return str.toString()
  		.replace(/&quot;/g, '"')
  		.replace(/&lt;/g, '<')
  		.replace(/&gt;/g, '>')
  		.replace(/&amp;/g, '&');
  	},

    //To update the title element
    // 1. baka.html.title (title)
    // Title string | title you want to null set. Revert to the original title If you specify a null.
    //
    // 2. baka.html.title (function (title, initial_title))
    // Function function function that returns the title that you want to set.
    // Is a function of the current title, across the page read the original title.
    title: (function() {
    	var initial_title = document.title;
    	return function(title) {
    		var current_title = document.title;
    		title = $.type(title) === 'function' ?
    		title(current_title, initial_title) :
    		title;
    		title !== current_title && (document.title = title === null ? pixiv.title.original : title || '');
    	};
    })(),

    // Create a iframe 
    // I want to unify the method so as not to get lost in the attribute.
    iframe: function(src, q) {
    	src = baka.query.build(src, q);
    	return $('<iframe src="' + src + '" marginwidth="0" marginheight="0" frameborder="0" allowtransparency="true" scrolling="no"></iframe>');
    }
  });

})(window, jQuery, Class);