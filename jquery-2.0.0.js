/*!
 * jQuery JavaScript Library v2.0.0、
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-04-18
 */
 /*
Jquery通过创建一个自调用匿名函数创建一个私有的命名空间。不会破坏全局的命名空间。
匿名函数从语法上叫函数直接量，javascript语法需要包围匿名函数的括号。
自调用匿名函数有两种写法。
第一种写法：(通过写一个函数表达式创建)
所有的函数都写在一个括号里面
(function(){
	console.info(this);
	console.info(arguments);
}(window));

第二种写法：(自执行匿名函数)
(function(){
	console.info(this);
	console.ingo(arguments);
})(window);
 */
 /**
匿名函数，封装。避免了匿名函数内部的jQuery代码与外部之间发生冲突(如使用了相同的变量名).
* @param {Object} 将window作为一个参数传入， window是DOM对象模型的最顶层对象，把全局变量传进来，
* 就避免了到外层去寻找,提高效率
* @param {undefined} 将undefined（未定义）作为一个的参数传入，防止undefined在外围被定义(占用)
* (undefined非关键字)。还有undefined在老一辈的浏览器是不被支持的，直接使用会报错，考虑兼容性，
* 因此增加一个形参undefined。不要用window.undefined传递给形参，window.undefined有可能被其他人修改了，
* 最好就是甚么都不传，形参的undefined就是真正的undefined了。
*/
// http://www.75team.com/archives/257
// 归根结底在于，在ECMAScript标准之中，undefined不是关键字。ECMAScriptV3中规定了名为undefined的全局变量，
// 初始值为undefined。这意味着undefined是可以被赋值的。于是如果不慎给undefined赋上了值
// 后面再使用undefined就会出错。为此，严谨的类库会对外声明一个不会用到的形参，把undefined重置。
// 上面是一种写法，还可以，简单地在这个当前作用域上var undefined;
(function( window, undefined ) {
/*
	通过传入window变量，使得window由全局变量变为局部变量，当jquery代码访问window时，
	不需要将作用域链回退到顶级作用域链，只样可以更快的访问window
*/
// http://segmentfault.com/q/1010000000311686
// 为什么传入window？
// 通过传入window变量，使得window由全局变量变为局部变量，当jquery代码访问window时，
// 不需要将作用域链回退到顶级作用域链，只样可以更快的访问window。同时将widow
// 作为参数传入，可以在压缩代码是进行优化。
// (function(a,b){})(window); // window 被优化为 a 
// 为什么传入undefined？
// 在自调用匿名函数的作用域内，确保 undefined 是真的未定义。
// 因为 undefined 能够被重写，赋予新的值。
// undefined = "now it's defined";
// alert( undefined );
// 浏览器测试结果：

// 浏览器     测试结果            结论
// ie8       now it's defined   可以改变
// firefox22 undefined          不能改变
// chrome31  undefined          不能改变
// opera12   undefined          不能改变

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//"use strict";
var
	// A central reference to the root jQuery(document)
	// jQuery(document)的一个引用
	rootjQuery,

	// The deferred used on DOM ready
	readyList,

	// Support: IE9
	// For `typeof xmlNode.method` instead of `xmlNode.method !== undefined`
	// 使用typeof method === 'undefined'来代替method === undefined,速度更快也更安全
	// http://www.2ality.com/2013/04/check-undefined.html
	// 可以使用void 0来表示undefined，因为void是一个操作符，运算后面的表达式
	// 结果返回undefined。所以void 0 永远都会返回unde。

	// http://www.cnblogs.com/ttltry-air/archive/2011/03/24/1993433.html
	// 无论是否声明过变量，使用typeof都不会抛出异常

	// 在函数的局部作用域中undefined的值可以被修改掉
	// function F(){
	//   var undefined = "age";
	//   var a = typeof undefined;
	//   console.log(a); //"string"
	//   return undefined;
	// }
	// console.log(F()); // "age"
	// 所以使用typeof undefined来检测更安全。

	// http://jsperf.com/type-of-undefined-vs-undefined
	// 从上面的网站测试可以看出使用"undefined"字符串来判断变量是否为 undefined速度更快

	core_strundefined = typeof undefined,

	// Use the correct document accordingly with window argument (sandbox)
	// 获取正确的window属性,以及简写减少查找次数
	location = window.location,
	document = window.document,
	docElem = document.documentElement,

	// Map over jQuery in case of overwrite
	// 保存jQuery变量，以防被覆盖
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// [[Class]] -> type pairs
	// class2Type存储的是javascript语言内部的数据类型，不包括外部的宿主环境提供的类型
	// javascript的语言内部类型仅仅只包括布尔、数字、字符串、数组、函数、日期、正则、对象、错误类型、undefined和null类型
	// 共11中类型
	class2type = {},

	// List of deleted data cache ids, so we can reuse them
	core_deletedIds = [],

	core_version = "2.0.0",

	// Save a reference to some core methods
	// 引用一些核心方法
	core_concat = core_deletedIds.concat, // 数组合并方法
	core_push = core_deletedIds.push, // 插入数组方法
	core_slice = core_deletedIds.slice, // 切割数据（在这里多用于将集合转换成数组）
	core_indexOf = core_deletedIds.indexOf, // 返回元素在数组的下标，不存在返回-1
	core_toString = class2type.toString, // 返回对象的原始字符串表示
	core_hasOwn = class2type.hasOwnProperty,// 判断一个对象是否有你给出名称的属性或对象
	core_trim = core_version.trim,// 去除字符串前后空格，IE6~8 不支持

	// Define a local copy of jQuery
	// The jQuery object is actually just the init constructor 'enhanced'
	// jQuery式的无new实例化其实就是借助于一个第三方函数，
	// 最容易理解的方式就是借助一个第三方函数F来说明问题：
	// 例如：
	// function F(){ }
	// 无new进行实例化并不代表不实例化，只不过我们调用的jQuery()或者$()函数里面
	// 把new的操作给封装起来了。
	// $ = function(){
	// 	return new F();
	// }
	// 但是这样的话，返回的就是F的实例对象了。也就是说现在$实例中的__proto__
	// 是指向了F.prototype对象了。如果还要返回$本身的实例怎办？
	// 其实只要修改原型指针即可。
	// 把F.prototype设置为$.prototype，这样构造函数F中的prototype指针就被改变了
	// 指向了$.prototype,而通过F构造函数构造的实例的__proto__也指向了已改变的
	// $.prototype。这样就直接把通过F构造函数构造的实例变成了$的实例对象了。
	// 所以可以看出第三方的构造函数F就是被借用了一下来完成无new的实现。
	// 所以在这里可以看出：F构造函数仅仅只是为了嫁接jQuery.prototype使用的
	// F并没有多少实用的意义。jQuery为了不那么麻烦，直接在自己的原型上
	// 构建了这样一个类似F构造函数的函数Init。最后只要把Init.prototype
	// 转移成$.prototype即可。
	// new F()中如果没有返回值，或者返回值是5中基本类型，那么new F()可以被看做
	// 是原型方法中的this，即F.prototype的引用。但是如果new F()返回的是数组、
	// 对象等，则返回值就这些对象本身。
	// 所以基于这个原则，在new F()的构造函数内部直接返回原型中的this即可。
	jQuery = function( selector, context ) {
		// jQuery对象实际上是init的构造函数的引用
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	// 用于匹配数字
    // source:正则表达式模式
	core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

	// Used for splitting on whitespace
	// 匹配任何非空白字符。一个以上
	core_rnotwhite = /\S+/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	/*
	 * jQUery2.0.3源码分析core 
	 * http://www.cnblogs.com/aaronjs/p/3281911.html
	 * 通过使用'|'来分割二义(两个选择器之间是或者的关系)，使用^匹配开头，使用$匹配结尾
	 * 1、^(?:(<[\w\W]+>)[^>]*或者2、#([\w-]*))$两部分
	 * 分析1：
	 * (?:pattern):括号中的?:表示非获取匹配，即只匹配不进行获取
	 * \s* : 匹配任何空白字符，包括空格、制表符、换页符等等 零次或多次 等价于{0,}
	 * (pattern) : 匹配pattern 并获取这一匹配。所获取的匹配可以从产生的 Matches 集合得到，使用 $0…$9 属性
	 * [\w\W]+ : 匹配于'[A-Za-z0-9_]'或[^A-Za-z0-9_]' 一次或多次， 等价{1,}
	 * (<[wW]+>) :这个表示字符串里要包含用<>包含的字符，例如<p>,<div>等等都是符合要求的
	 * [^>]* : 负值字符集合,字符串尾部是除了>的任意字符或者没有字符,零次或多次等价于{0,}
	 * 1是用来匹配html标签使用的。
	 * 分析2：
	 * 匹配结尾带上#号的任意字符，包括下划线与-
	 *
	 * exec方法解析：
	 * 如果执行exec方法的正则表达式没有分组（没有括号括起来的内容），那么如果有匹配，
	 * 他将返回一个只有一个元素的数组，这个数组唯一的元素就是该正则表达式匹配的第一个串;如果没有匹配则返回null。
	 * 
	 * exec如果找到了匹配，而且包含分组的话，返回的数组将包含多个元素，第一个元素是找到的匹配，
	 * 之后的元素依次为该匹配中的第一、第二...个分组（反向引用）
	 * 
	 * 总之就是：匹配HTML标记和ID表达式（<前面可以匹配任何空白字符，包括空格、制表符、换页符等等）
	 *
	 */
	// 检测是否为HTML标签或ID
	rquickExpr = /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	// Match a standalone tag
	// 用于匹配单独的一个标签，例如<div></div>、<a></a>、<br />等一个标签
	// 如果有多个标签就不行了。 <div></div><div></div>就匹配不了
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// Matches dashed string for camelizing(驼峰式命名方法)
	// 匹配由虚线分割的字符串并改成驼峰式命名法
	rmsPrefix = /^-ms-/,
	// 里面是一个捕获分组，需要使用()来捕获匹配的字母
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	// 用于jQuery.camelCase中的replace方法的回调
	// JavaScript 函数replace揭秘
	// http://www.cnblogs.com/whitewolf/archive/2013/03/14/2958720.html
	/*
		replace第二参数为函数的话，函数的参数有如下的规定：
		1、第一个参数为每次匹配的全文本
		2、中间的参数为子表达式匹配的字符串，个数不限，根据子表达式的个数而定($i(i:1-99))
		3、倒数第二个参数为匹配文本字符串的匹配下标位置
		4、最后一个参数表示字符串本身
	 */
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},

	// The ready event handler and self cleanup method
	// 就绪事件处理程序
	completed = function() {
		// 当触发了DOMContentLoaded事件或者load事件时执行该处理程序
		// 执行之后就调用工具方法jQuery.ready()方法。把我们自定义的
		// 需要在DOM加载完成之后执行的匿名函数添加到延迟队列当中准备执行
		document.removeEventListener( "DOMContentLoaded", completed, false );
		window.removeEventListener( "load", completed, false );
		jQuery.ready();
	};

// jQuery.fn是jQuery.prototype的简化写法
// 对于实例方法，可以直接使用$().method()来调用，同时还可以使用$.prototype.method()方式来调用

// 挂载在jQuery实例对象上的核心方法
/**
 * jquery             查看版本号
 * init               实例化jquery对象
 * selector           选择符
 * length             jquery对象的元素长度
 * toArray            jquery对象转化成数组
 * get                通过索引获取jquery对象中的DOM元素
 * pushStack          添加DOM到jquery的栈中
 * each               遍历jQuery对象中的DOM元素执行回调
 * ready              文档加载后执行函数
 * slice              截取指定的DOM元素
 * first              返回第一个DOM元素
 * last               返回最后一个DOM元素
 * eq                 返回指定索引的元素
 * map                映射jquery对象中DOM元素
 * end                取出压入栈的jquery对象
 */
jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	// jquery当前的版本号，在$()对象当中使用
	jquery: core_version,

	// 修正重写prototype导致的构造器丢失
	constructor: jQuery,
	// 基本上init就是个大熔炉，根据传入参数的类型做出不同的处理，如DOM对象，字符串，
	// 数组对象与NodeList这样的类数组对象转换成jQuery对象，如果是函数，则改成DOM加载。
	init: function( selector, context, rootjQuery ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		// 处理：$(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		/**
            * 下面要对selecotr对象进行进行分类的检查,不同类型,不同的处理.
            * selector可能的类型如下:
            * (1) string类型
            *         a) 没有context的情况
            *         b) 有context的情况
            * (2) 直接的一个DOM Element元素类型
            * (3) 函数(function)类型
            * (4) 类数组对象类型
            * (5) 数组类型
            */
		// Handle HTML strings
		// 首先第一步处理的就是字符串形式的选择符
		if ( typeof selector === "string" ) {
			// 快数查找 假设字符串的开始和结束与< >有关，是HTML，跳过正则表达式检查
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				// 如果字符串就是一个html的标签，跳过正则匹配，直接放入到匹配集合中
				match = [ null, selector, null ];
			// 如果不是以"<"或">"在字符串两头的，使用正则匹配。只保留标签里面的部分
			} else {
				// rquickExpr = /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/
				// 含有<>标签的都会匹配出来，而且即便字符串里面有#id的字符串，也不会进行匹配
				// 只有当字符串里面不含有<>时才会匹配#id.
				match = rquickExpr.exec( selector );
				// 如果匹配成功，此时，match数组里面存放的形式为：
				// [整个字符串,匹配成功的<br />等html标签,匹配的id]
				// match[1]和math[2]不能共存，只能存在一个。
			}

			// Match html or make sure no context is specified for #id
			// 符合条件且不存在所谓的上下文环境
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				// 1、处理:$('HTML') (处理HTML字符串)
				if ( match[1] ) {
					// instanceof：用于判断一个变量是否某个对象的实例
                    // 检测context是否为jQuery对象的一个实例，是(返回DOM对象)，否(返回自身)
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					// 兼容scripts脚本的写法
					// jQuery.merge是合并两个对象或数组，把后面一个的所有属性都存放到第一个对象中
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						// http://www.cnblogs.com/aaronjs/p/3281911.html
						// ownerDocument和 documentElement的区别
						// ownerDocument是Node对象的一个属性，返回的是某个元素的根节点文档对象：即document对象
						// documentElement是Document对象的属性，返回的是文档根节点
						// 对于HTML文档来说，documentElement是<html>标签对应的Element对象，ownerDocument是document对象
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					// 创建元素节点的另外一种方法，但是这种创建方式有所限制，
					// 比如html标签只能包含标签，中间不能包含文本和其他标签，只能是一对标签或单个的标签
					// 第二个参数是一个对象字面量的形式的对象，用来修饰通过标签创建的元素。事件的添加是
					// 通过on属性添加事件对象，如果直接添加事件处理程序，在这些直接添加的事件处理程序内部
					// 同样调用的是实例对象的方法on方法，进行事件处理程序的注册。
					// $('<button></button>',{
				 	//   text:'click',
				 	//   on:{
				 	//     click:function(event) {
				 	//       console.log(111);
				 	//     }
				 	//    }
				 	// })
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							// 如果添加的属性在实例对象上含有对应的属性方法，直接调用属性方法应用属性
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							// 如果只是简单的属性，通过attr方法来设置属性
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					// 创建的html标签被添加到了this中，并且可以通过索引来访问。
					return this;

				// HANDLE: $(#id)
				// 2、处理id字符串
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Inject the element directly into the jQuery object
						// 把元素直接注入到jQuery对象中
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			// 3、处理复杂的字符串
			// 如果程序走到这里，说明selector是上面无法解析的字符串，使用
			// 更加强大的sizzle引擎来查找
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		// 4、处理Node类型的节点
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// 5、处理函数类型，等价于ready
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		// 把第一个参数的值添加到第二个参数的数组里面
		// 
		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,


	// 把jquery对象转化成真正的数组对象
	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	// 通过索引获取jQuery中的对象，如果没有给定索引，返回全部的jquery对象
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		// 下面就是this.constructor，通过使用()进行方法调用创建一个新的jquery对象
		// jQueryjquery-2.0.0.js:62
		// function ( selector, context ) {
		// 	// The jQuery object is actually just the init constructor 'enhanced'
		// 	return new jQuery.fn.init( selector, context, rootjQuery );
		// }
		// 因为jQuery的构造函数借用的原型中init方法实现的，所以调用constructor
		// 方法会返回init的原型实例对象，等于新建的纯净的实例空对象
		// 把传递进来的elems兑现转化为数组添加到新创建的jquery对象当中。
		// 然后保存当前的jquery对象为新对象的prevObject属性当中。等于推入栈中。
		// 返回的是新创建的jquery对象
		// 使用end方法可以然jquery对象出栈，还原jquery对象。
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		// 把当前的上下文环境压入到栈中，等到需要的时候调用end方法取出。
		ret.prevObject = this;
		// 保持上下文环境
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	// 对于匹配列表中的每一个元素执行回调函数。
	// 在each的循环当中要想停止循环回调，只需要返回false即可停止循环。
	// callback的参数为索引值，元素本身
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	// 先使用Array.prototype.slice方法从对象实例中切割取出指定的元素，然后把
	// 选取出来的元素放到新建的纯净的jquery对象中，把原来的jquery对象入栈
	// 从jquery对象中选取出指定数目的元素
	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	// 因为是类数组的对象，所以通过下标索引来获取DOM元素，取出来元素后，进行封装入栈
	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	// 实例对象jQuery中的回调函数的参数为位置索引与值。
	// 调用工具方法的map则是元素的值和位置索引。
	map: function( callback ) {
		// jQuery.map映射函数有两个参数，一个是数组中取出来的元素，
		// 第二个参数为取出来的元素的索引值。在回调函数中this的值为全局对象
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			// 回调函数的参数一般都为先是索引值，然后是索引对应的元素
			// 过滤方法对应的则是元素和索引值。
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// 仅仅作为内部使用
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
// jquery中无new实例化的最关键的一句话，移花接木的作用。
// 把init的原型链修改为指向jquery.prototype的原型链，完成实例__proto__的变化。
// 完成从init实例到jquery实例的转变。
jQuery.fn.init.prototype = jQuery.fn;


// 把多个对象的内容添加到第一个对象中去
jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	// 处理深拷贝
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		// 跳过布尔值和目标对象
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	// 处理当目标对象为5种基本类型
	// target不是对象也不是函数，则强制设置为空对象。
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	//当参数只有一个，扩展jQUery本身。
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		// 仅仅只处理没有null/undefined的值
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			// 扩展基础对象
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				// 深拷贝的条件包括源对象是由对象字面量创建的对象或者是数组，才会递归进行遍历挂载
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];
					} else {
						// 把嵌套的目标子对象和嵌套的源子对象都取出来，递归进行挂载
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

//扩展工具方法
/*
	jQuery.extend({
        expando  :  生成唯一JQ字符串(内部)
        noConflict()  :  防止冲突
        isReady  :  DOM是否加载完(内部)
        readyWait  :  等待多少文件的计数器(内部)
        holdReady()  :  推迟DOM触发
        ready()  :  准备DOM触发
        isFunction()  :  是否为函数
        isArray()  :  是否为数组
        isWindow()  :  是否为window
        isNumeric()  :  是否为数字 
        type()  :  判断数据类型
        isPlainObject()  :  是否为对象自变量
        isEmptyObject()  :  是否为空的对象
        error()  :  抛出异常
        parseHTML()  :  解析节点
        parseJSON()  :  解析JSON
        parseXML()  :  解析XML
        noop()  :  空函数
        globalEval()  :  全局解析JS
        camelCase()  :  转驼峰
        nodeName()  :  是否为指定节点名(内部)
        each()  :  遍历集合
        trim()  :  去前后空格
        makeArray()  :  类数组转真数组
        inArray()  :  数组版indexOf
        merge()  :  合并数组
        grep()  :  过滤新数组
        map()  :  映射新数组
        guid  :  唯一标识符(内部)
        proxy()  :  改this指向
        access()  :  多功能值操作(内部)
        now()  :  当前时间
        swap()  :  CSS交换(内部)
	});

	jQuery.ready.promise = function(){};  监测DOM的异步操作(内部)

	function isArraylike(){}  类似数组的判断(内部)
*/

jQuery.extend({
	// Unique for each copy of jQuery on the page
	// Math.rodom() 产生16位小数 随机种子数
	// 'jQuery05192676805891097',非数字被替换掉了
	expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

	// 在类库的开头有两行代码
	// // Map over jQuery in case of overwrite
	// // 保存jQuery变量，以防被覆盖
	// _jQuery = window.jQuery,

	// // Map over the $ in case of overwrite
	// _$ = window.$,
	// 这两行代码就是为了把外界已经占用的$或者jQuery存放到内部的临时变量中，
	// 然后再noConflict方法中重新取出临时变量的值，覆盖暴漏在全局变量中的$或jQuery.
	// 这样全局变量中的$或者jQuery已经恢复了外界占用的这两个变量。同时方法
	// 返回一个纯净的jQuery变量对象，赋值给任意一个变量引用即可
	// http://ued.taobao.org/blog/2013/03/jquery-noconflict/
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	/*
		分析的extend方法的内部结构与实现原理。
        1，document.readyState。
        2, DOMContentloaded 与 load 。
        3，completed 方法原理。
        4，holdReady() 方法的作用与实现原理。
        5，getScript() 作用及实现原理。
	*/
	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	/*
		分析的extend方法的内部结构与实现原理，本集主要知识有以下几点：
		1，expando 实现及作用。
		2，noConflict 方法的作用及实现原理
		3，$(document).ready() 与 window.onload 的关系与区别。
		4，$().ready() 与 $.ready()。
		5，readyList.resolveWith() 。
	*/
	// Handle when the DOM is ready
	// 当DOM已经准备完毕了，执行ready方法。
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		// 执行ready回调函数队列，传入参数为document和jQuery。
		// 此处触发添加到resolve队列中的function。参数为document和单个jquery元素的数组。
		// 所以在ready的方法中的自定义函数有两个参数，分别为document和[jquery].
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		// 如果是绑定到ready事件上而不是使用ready(function(){})
		// 的形式，那么在这里触发ready事件是代码得以执行
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	// jQuery 1.3以后，在IE浏览器里，浏览器提供的函数比如'alert'
	// 还有 DOM 元素的方法比如 'getAttribute' 将不认为是函数,而会被认为是object
	/*
		Object.prototype.toString.call(alert) 
		-> "[object Object]" // IE下
		-> "[object Function]" // chrome下
 	*/
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	// 针对只高级浏览器，所以都带有isArray方法
	isArray: Array.isArray,

	/*
		http://stackoverflow.com/questions/9576283/jquerys-iswindow-method
		function isWindow(obj) {
		  var toString = Object.prototype.toString.call(obj);
		  return toString == '[object global]'  //chrome
		  || toString == '[object Window]' // FF、opera
		  || toString == '[object DOMWindow]';
		}
	*/
	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {
		// parseFloat():将参数中指定的字符串解析成为一个浮点数字并返回.
		/*  https://developer.mozilla.org/zh-CN/docs/JavaScript/Reference/Global_Objects/parseFloat
			parseFloat将它的字符串参数解析成为浮点数并返回.如果在解析过程中遇到了正负号(+或-),
			数字(0-9),小数点,或者科学记数法中的指数(e或E)以外的字符,则它会忽略该字符以及之后的所有字符,
			返回当前已经解析到的浮点数.同时参数字符串首位的空白符会被忽略.

			如果参数字符串的第一个字符不能被解析成为数字,则parseFloat返回NaN.

			你可以通过调用isNaN函数来判断parseFloat的返回结果是否是NaN.
			如果让NaN作为了任意数学运算的操作数,则运算结果必定也是NaN.
			not a number非数字
			
			https://developer.mozilla.org/zh-CN/docs/JavaScript/Reference/Global_Objects/isFinite
			isFinite 方法以它的参数的方式检查。如果参数是 NaN, 正无穷大或者负无穷大，会返回false,其他返回 true
		*/
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	// 判断对象的内部javascript类型
	type: function( obj ) {
		if ( obj == null ) {
			// 如果传进来的对象为null，使用String()构造函数返回null的字符串表示
			return String( obj );
		}
		// Support: Safari <= 5.1 (functionish RegExp)
		// 逻辑运算符的优先级
		// “&&” (逻辑与) 运算和“||”运算真好相反，“&&” 运算遇到false就返回。
		// http://uule.iteye.com/blog/1153552
		// JavaScript 运算符
		/* http://www.xiaoxiaozi.com/2010/02/22/1707/
			JavaScript 运算符优先级，优先级由高到低，相同优先级按照从左到右执行
			运算符	描述
			. [] ()	 							 属性访问、数组下标、函数调用以及表达式分组
			++ — – ~ ! delete new typeof void	 一元运算符、返回数据类型、对象创建、未定义值
			* / %	 							 乘法、除法、取模(乘除优先于加减是肯定的了)
			+ – +	 							 加法、减法、字符串连接
			<< >> >>>	 						 移位(这个用到的时候太少太少)
			< <= > >= instanceof	 			 小于、小于等于、大于、大于等于、instanceof
			== != === !==	 					 等于、不等于、全等于、非全等号
			&	 								 按位与(这个曾经用过)
			^	 								 按位异或(大学时用过，不过不是js)
			|	 								 按位或
			&&	 								 逻辑与(And)
			||	 								 逻辑或(Or)
			?:	 								 三目运算符，可翻译为，如果则，否则
			= oP=	 							 赋值、运算赋值(很无奈，第二个我没用过)
			,	 								 逗号运算符，可在一条语句中，执行多个运算，最常用于变量声明中
		*/
		// 所以下面的这个语句相当于下面加括号的那句话
		/* 意思表示如果传进来的对象为对象类型或者是函数类型的引用类型，调用class2type对象进行
		   类型比对，返回对应的类型字符串，如果找不到对应的类型字符串，直接返回"object"
		   如果对象不是对象类型也不是函数类型，而是简单的值类型，直接返回它的类型
		return (typeof obj === "obejct" || typeof obj === "function") ?
			(class2type[core_toString.call(obj)] || "object") :
			typeof obj;
		*/
		/*
			Object.prototype.toString.call(document.getElementsByTagName('ul'))
			-> "[object NodeList]" NodeList类型没有添加(type方法只针对javascript语言的类型)
		*/
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ core_toString.call(obj) ] || "object" : // 引用类型
			typeof obj; // 值类型
	},

	// 检测对象是否是由{}或者new Object()创建的
	isPlainObject: function( obj ) {
		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - DOM nodes
		// - window
		// 非对象字面量的对象包括：
		// 任何内部属性[[Class]]不是"[object Object]"对象、DOM节点还有window对象
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		// Support: Firefox <20
		// The try/catch suppresses exceptions thrown when attempting to access
		// the "constructor" property of certain host objects, ie. |window.location|
		// https://bugzilla.mozilla.org/show_bug.cgi?id=814622
		// $.isPlainObject( document.location )会抛出一个异常
		// 在window上人为的 添加isPrototypeOf属性,也不是纯粹的对象字面量
		try {
			if ( obj.constructor &&
					// 通过调用hasOwnProperty("isPrototypeOf")，来判断传进来的对象是否是通过对象字面量
					// 直接创建的。如果obj是通过对象字面量直接创建的对象，那么obj默认等于是通过
					// new object()创建的对象，所以obj.constructor.prototype指向Object对象，
					// 所以在Object对象上具有isPrototypeOf方法。
					!core_hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}
		} catch ( e ) {
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		return true;
	},

	// 是否是一个空对象，没有任何属性
	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html html的标签字符串
	// context (optional): If specified, the fragment will be created in this context, defaults to document 
	// 如果给出了，创建出来的fragment会被添加到这个上下文中，默认的是document
	// keepScripts (optional): If true, will include scripts passed in the html string
	// 默认情况下是不允许运行scripts标签中的代码的，除非第三个参数为true
	// http://segmentfault.com/q/1010000000200646
	// data: html字符串
	// context (可选): 如果定义, 将会在这个上下文中将创建的HTML片段, 默认是document
	// keepScripts (可选): 一个布尔值，表明是否在传递的HTML字符串中包含脚本。
	// 返回的是已经变成DOM元素的节点数组。
	parseHTML: function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
		context = context || document;

		// ^<(\w+)\s*\/?>(?:<\/\1>|)$ 字符串最前面和最后面必须都是"<"或">"
		// 而且是那种只有标签名，中间没有任何字符的字符串才能通过createElement方法创建
		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];

		// Single tag
		// 如果是纯标签,即开头和结尾时同样的标签且只有一个
		if ( parsed ) {
			return [ context.createElement( parsed[1] ) ];
		}

		// 如果不是纯标签，则进入buildFragment函数继续处理，该方法返回html碎片。
		parsed = jQuery.buildFragment( [ data ], context, scripts );

		if ( scripts ) {
			jQuery( scripts ).remove();
		}

		// 将生成的节点放入数组中返回
		// 把后面元素节点的子节点集合转化为数组。buildFramment方法返回的文档片段
		// 的子节点集合是组合成的节点集。
		return jQuery.merge( [], parsed.childNodes );
	},

	// 浏览器宿主环境自带的对象方法
	parseJSON: JSON.parse,

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}

		// Support: IE9
		try {
			tmp = new DOMParser();
			xml = tmp.parseFromString( data , "text/xml" );
		} catch ( e ) {
			xml = undefined;
		}

		if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	// 当回调不需要做任何事情的时候，可以使用noop方法
	noop: function() {},

	// Evaluates a script in a global context
	// 在全局上下文中执行script脚本代码
	// 把一段文本解析成脚本，利用script元素的text属性
	globalEval: function( code ) {
		var script,
				indirect = eval;

		code = jQuery.trim( code );

		if ( code ) {
			// If the code includes a valid, prologue position
			// strict mode pragma, execute code by injecting a
			// script tag into the document.
			// Inspired by code by Andrea Giammarchi
			// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
			// 如果字符串中含有use strict字符，把字符串添加到文档中进行执行，执行完成以后再删除该节点
			if ( code.indexOf("use strict") === 1 ) {
				script = document.createElement("script");
				script.text = code;
				document.head.appendChild( script ).parentNode.removeChild( script );
			} else {
			// Otherwise, avoid the DOM node creation, insertion
			// and removal by using an indirect global eval
			// 如果没有字符串标示，避免在DOM元素的创建，直接在全局环境中执行
				indirect( code );
			}
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	// Javascript 中 String.replace( ) 的妙用
	// http://www.codebit.cn/javascript/javascript-replace.html
	/*
		String.replace( ) 的简单用法
		var text = "javascript 非常强大 ！";
		text.replace(/javascript/i, "JavaScript");
		// 返回：JavaScript 非常强大 ！

		String.replace( ) 替换所有出现的目标字符
		var text= "javascript 非常强大 ！JAVASCRIPT 是我最喜欢的一门语言 ！";
		text.replace(/javascript/ig, "JavaScript");
		// 返回：JavaScript 非常强大 ！JavaScript 是我最喜欢的一门语言 ！

		String.replace( ) 实现调换位置
		var name= "Doe, John";
		name.replace(/(\w+)\s*,\s*(\w+)/, "$2 $1");
		// 返回：John Doe

		String.replace( ) 实现将所有双引号包含的字符替换成中括号包含的字符
		var text = '"JavaScript" 非常强大！';
		text.replace(/"([^"]*)"/g, "[$1]");
		// 返回：[JavaScript] 非常强大！

		String.replace( ) 将所有字符首字母大写
		var text = 'a journey of a thousand miles begins with single step.';
		text.replace(/\b\w+\b/g, function(word) {
		                           return word.substring(0,1).toUpperCase( ) +
		                                  word.substring(1);
		                         });
		// 返回：A Journey Of A Thousand Miles Begins With Single Step.
	*/
	// fcamelCase = function( all, letter ) {
	// 	return letter.toUpperCase();
	// },

	// 里面是一个捕获分组，需要使用()来捕获匹配的字母
	// rdashAlpha = /-([\da-z])/gi,
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	// 检测元素elem的那么属性值是否是第二个参数的值
	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	// 静态方法的each不同于实例方法的each，静态方法的each可以应用于任何集合，不管第一个参数是对象
	// 还是数组。如果对象是一个数组，回调每次循环的是数组的索引和数组项。索引值从0开始
	// 如果是对象，每次循环遍历都是属性名和属性值的键值对。
	// 第三个参数是供内部使用，是参数组成的数组。如果给定数据，在循环的时候，
	// 回调的参数就是给定的第三个参数
	each: function( obj, callback, args ) {
		// 设置回调函数执行的返回值，确定是否继续执行后面的元素
		var value,
			// 应用于for循环，把所有声明都放置到函数内部的开头是一个好的编程习惯
			i = 0,
			// 获取集合的长度，缓存起来，提高查找速度。
			length = obj.length,
			// 检测放进来的对象是否是类数组对象的集合
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					// 回调函数的参数确定是each循环内部的call方法调用
					// 如果回调执行过后返回的是false，直接跳出循环。
					// 如果没有返回值或者返回值为true，相当于continue，继续执行。
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// 取出文本两端的空格
	trim: function( text ) {
		return text == null ? "" : core_trim.call( text );
	},

	// results is for internal usage only
	// 把类数组对象转化为真正的数组对象
	// 第一个参数为类数组对象，把类数组对象转化为真正的数组对象
	// 后面一个参数为内部使用
	// makeArray是把值都给后面一个参数，而merge则是把值都给第一个参数
	makeArray: function( arr, results ) {
		var ret = results || [];

		// 对于第一个参数有两种判断，是数组或者不是数组
		// 如果第一种不是字符串，使用merge方法把值添加到第二个参数的对象中并修改length值
		if ( arr != null ) {
			// 鉴别字符串如果是字符串数组，直接存成数组转化
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			// 如果是数组，直接调用push方法推进数组中。
			} else {
				core_push.call( ret, arr );
			}
		}

		return ret;
	},

	// 最后一个参数i表示在arr数组中查找element元素的开始下标，默认为0
	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : core_indexOf.call( arr, elem, i );
	},

	/*
	 * 把两个数组或者伪数组的内容合并到第一个数组中去
	 * 只要第一个对象含有length属性且不为0即可
	 */
	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		// 首先检查第二个元素有没有length属性，所以不管是数组，还是伪数组对象,
		// 只要提供length属性，使用数字索引依次取出第二个对象中的属性存储到
		// 第一个对象的后面
		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}
		// 如果第二个对象没有length属性，那么也是依次从索引0开始取出知道索引对应的属性
		// 为undefined为止，存放到第一个对象中
		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		// 改变的是第一个数组，所以操作完成之后修改第一个数组的长度，
		// 如果第一个对象有length属性，改变length，如果没有，添加length属性
		// jquery对象都有一个length属性
		first.length = i;
		// 返回修改后的第一个数组
		return first;
	},

	// 使用过滤函数过滤数组，返回的是新的数组，对原来的数组不产生影响
	// 第三个参数表示当过滤的值有一个与给定的值相等时，不添加到过滤的数组中。
	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	// 第三个参数是供内部使用。
	// 通过映射函数吧数组映射成为另一组数组
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their
		// 如果要转化的对象是数组，通过下标访问逐个执行回调函数，执行后的值
		// 存放到一个新的数组中返回
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		// 如果第一个对象不是数组，通过使用属性遍历来执行回调
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		// 使用原生的数组concat连接方法把嵌套的数组的数据全部取出
		// $.map([1,2,3],function(n,index) {
	    //   return [n,2*n];
	    // });
		// 如果回调方法返回的就是一个嵌套的数组，那么最后组成的结果数组
		// 就是一个嵌套的数组。concat方法是把嵌套数组中的数据取出来
		return core_concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	// 有点像是call与apply方法调用，改变或者保持作用域
	/*	http://www.zhangxinxu.com/jq/api14/jQuery.proxy_function_scope.php
		jQuery 1.4 新增。返回一个新函数，并且这个函数始终保持了特定的作用域。
		当有事件处理函数要附加到元素上，但他们的作用域实际是指向另一个对象时，
		这个方法最有用了。此外，最妙的是，jQuery能够确保即便你绑定的函数是
		经过jQuery.proxy()处理过的函数，你依然可以传递原先的函数来准确无误地取消绑定。
		请参考下面的例子。
		
		这个函数还有另一种用法，jQuery.proxy( scope, name )。第一个参数是要设定的作用域对象。
		第二个参数是将要设置作用域的函数名（必须是第一个作用域对象的一个属性）。
	*/
	/*	http://wei89.blog.51cto.com/3607600/1334263
		JQuery.proxy(function,context):
		使用context代替function中的context。
		比如：
		var you = {
		 type: "person",
		 test: function(event) {
		   $("#log").append( this.type + " " );
		 }
		$("#test").click(you.test);调用这句只有相当于调用：
		$("#test").click(function(event){
		        $("#log").append( this.type + " " );
		});
		所以这里的this指的是$("#test").

		如果这样调用：$("#test").click($.proxy(you.test,you));
		此时的调用相当于：
		$("#test").click(function(event){
		        $("#log").append( you.type + " " );
		});
		虽然调用事件的对象是$("#test")，但是却可以使用$.proxy把事件执行内的对象改变为you。
	*/
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			length = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {
				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < length; i++ ) {
					fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
				}
			}
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: Date.now,

	// A method for quickly swapping in/out CSS properties to get correct calculations.
	// Note: this method belongs to the css module but it's needed here for the support module.
	// If support gets modularized, this method should be moved back to the css module.
	swap: function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		// 如果文档的加载状态现在已经是complete，使用一个异步，来执行jQuery.ready方法。
		// 因为
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
// 为什么缺少NodeList类型，因为检测都是针对javascript原生对象的。
// 布尔、数字、字符串、函数、数组、日期、正则、对象、错误类型
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

// 内部的私有方法，外界访问不到,仅仅提供给内部使用
// isArraylike方法的限定对象时array，arguments，nodelist
// 与拥有非负整数的length属性的object对象
function isArraylike( obj ) {
	// 加载对象的length属性
	var length = obj.length,
	// 获取对象的类型
		type = jQuery.type( obj );

	// 检测对象是否是window对象，如果是window对象返回false
	if ( jQuery.isWindow( obj ) ) {
		return false;
	}

	// nodetype为1，表示对象是一个DOM元素,也是类数组对象
	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	// 检测数组、含有length属性的对象、含有length属性且length属性的索引在对象中存在
	return type === "array" || type !== "function" &&
		( length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj );
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
/*!
 * Sizzle CSS Selector Engine v1.9.2-pre
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-04-16
 */
 // jQuery2.0.3源码解析系列
 // http://www.cnblogs.com/aaronjs/p/3279314.html
(function( window, undefined ) {

var i,
	cachedruns,
	Expr,
	getText,
	isXML,
	compile,
	outermostContext,
	sortInput,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	// 首选的上下文对象
	preferredDoc = window.document,
	support = {},
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	// 缓存词法分析的出来的选择符元素
	tokenCache = createCache(),
	// 缓存编译后的匹配器函数
	compilerCache = createCache(),
	hasDuplicate = false,
	sortOrder = function() { return 0; },

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Array methods
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments quoted,
	//   then not containing pseudos/brackets,
	//   then attribute selectors/non-parenthetical expressions,
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rsibling = new RegExp( whitespace + "*[+~]" ),
	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"boolean": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,
	funescape = function( _, escaped ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		return high !== high ?
			escaped :
			// BMP codepoint
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	// 检测push.slice是否调用成功
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

/**
 * For feature detection
 * @param {Function} fn The function to test for native support
 */
function isNative( fn ) {
	// 通过 + ""快速的转化成字符串
	return rnative.test( fn + "" );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var cache,
		keys = [];

	return (cache = function( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		// 使用(key + " ")为了避免与原生原型属性冲突
		if ( keys.push( key += " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key ] = value);
	});
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 * Sizzle标记一个函数有特殊用途
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 * 测试对元素特性的支持程度
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// 移除div节点并释放资源
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

// sizzle的入口点构造函数，外界通过jQuery.find方法访问
// 分三步，第一步是检测是否能使用三种快捷方式进行查找元素
// 第二步是看是否支持浏览器自带的原生方法querySelectorAll方法，如果支持直接进行查找
// 最后一步是，如果前两种都不行的话，使用自带的DOM引擎Sizzle进行查找元素
function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	// 检测设置上下文对象
	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	// 上面都是准备工作，一下两个检测语句是对异常情况的处理
	// 对于选择符的处理，如果选择符为空或者选择符不是字符串，直接返回结果集
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	// 如果上下文对象不是元素节点，返回一个空数组
	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	// document文档是html而且不存在种子集合
	// 使用原生方法进行元素查找
	if ( documentIsHTML && !seed ) {

		// Shortcuts
		// http://www.nczonline.net/blog/2010/09/28/why-is-getelementsbytagname-faster-that-queryselectorall/
		// 首先是使用getElementById、genElementsByTagName等这些方法，然后才去考虑使用QuerySelectorAll方法
		// 因为前面的方法返回的是动态元素集合，而后面的方法返回的是一个静态元素集合，也就是说后面的query方法在返回
		// 时，会做循环处理。
		// 快捷方式，如果只是简单地ID，class或者tag方式查找，那么直接使用浏览器自带的方法进行查找。
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		// 如果支持querySelectorAll原生方法，那么直接使用浏览器自带的方法进行查找，而不是用sizzle引擎
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && context.parentNode || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	// 手动设置了support.qsa 为false，为了让选择器内部进行选择，而不是使用原生的方法。
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Detect xml
 * @param {Element|Object} elem An element or a document
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * 设置引擎选择的上下文，并且检测浏览器对方法的支持情况，全部都存放在support对象中
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	// https://developer.mozilla.org/zh-CN/docs/DOM/Node.ownerDocument
	// ownerDocument属性返回当前节点所在的文档的文档节点.
	var doc = node ? node.ownerDocument || node : preferredDoc;

	// If no document and documentElement is available, return
	// https://developer.mozilla.org/zh-CN/docs/Web/API/document.documentElement
	// document.documentElement返回的元素是document的根元素（例如：HTML文档的根元素是<html>）。
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsHTML = !isXML( doc );

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		// 向空置的div元素中添加一个没有任何内容的text节点，通过tag来查找元素，看是否恩能取到元素节点
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	// Check if getElementsByClassName can be trusted
	support.getElementsByClassName = assert(function( div ) {
		div.innerHTML = "<div class='a'></div><div class='a i'></div>";

		// Support: Safari<4
		// Catch class over-caching
		div.firstChild.className = "i";
		// Support: Opera<10
		// Catch gEBCN failure to find non-leading classes
		return div.getElementsByClassName("i").length === 2;
	});

	// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
	// Detached nodes confoundingly follow *each other*
	support.sortDetached = assert(function( div1 ) {
		// Should return 1, but returns 4 (following)
		return div1.compareDocumentPosition( document.createElement("div") ) & 1;
	});

	// Support: IE<10
	// Check if getElementById returns elements by name
	// Support: Windows 8 Native Apps
	// Assigning innerHTML with "name" attributes throws uncatchable exceptions
	// (http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx)
	// and the broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
				var m = context.getElementById( id );

				return m ?
					m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
						[m] :
						undefined :
					[];
			}
		};
		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	// QSA and matchesSelector support
	// QSA :querySelectorAll 
	// 匹配选择符支持

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = true; // 这句话是我自己改的，便于调试。下面一句是原来的代码
	//rbuggyQSA = [];

	if(support.qsa = false) { // 这句话也是我自己改的，下面一句是原代码
	//if ( (support.qsa = isNative(doc.querySelectorAll)) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Support: Opera 10-12/IE8
			// ^= $= *= and empty values
			// Should not select anything
			// Support: Windows 8 Native Apps
			// The type attribute is restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "t", "" );

			if ( div.querySelectorAll("[t^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = isNative( (matches = docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = isNative(docElem.contains) || docElem.compareDocumentPosition ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					// 首先检测contains方法是否存在，如果存在直接使用，然后是comparedocumentposition方法
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				// 如果没有直接检测的方法，使用parentNode进行遍历
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	// Document order sorting
	sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b );

		if ( compare ) {
			// Disconnected nodes
			if ( compare & 1 ||
				(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

				// Choose the first element that is related to our preferred document
				if ( a === doc || contains(preferredDoc, a) ) {
					return -1;
				}
				if ( b === doc || contains(preferredDoc, b) ) {
					return 1;
				}

				// Maintain original order
				return sortInput ?
					( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
					0;
			}

			return compare & 4 ? -1 : 1;
		}

		// Not directly comparable, sort on existence of method
		return a.compareDocumentPosition ? -1 : 1;
	} :
	function( a, b ) {
		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Parentless nodes are either documents or disconnected
		} else if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	// rbuggyQSA always contains :focus, so no need for an existence check
	if ( support.matchesSelector && documentIsHTML &&
		(!rbuggyMatches || !rbuggyMatches.test(expr)) &&
		(!rbuggyQSA     || !rbuggyQSA.test(expr)) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		val = fn && fn( elem, name, !documentIsHTML );

	return val === undefined ?
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null :
		val;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	return results;
};

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns Returns -1 if a precedes b, 1 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && ( ~b.sourceIndex || MAX_NEGATIVE ) - ( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

// Fetches boolean attributes by node
function boolHandler( elem, name, isXML ) {
	var val;
	return isXML ?
		undefined :
		(val = elem.getAttributeNode( name )) && val.specified ?
			val.value :
			elem[ name ] === true ? name.toLowerCase() : null;
}

// Fetches attributes without interpolation
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
function interpolationHandler( elem, name, isXML ) {
	var val;
	return isXML ?
		undefined :
		(val = elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 ));
}

// Returns a function to use in pseudos for input types
// 检测input元素类型，包括radio, checkbox, file, password，image五种类型
//创建一个伪类的过滤函数,此方法是根据表单元素的type值生成
//比如:radio, :text, :checkbox, :file, :image等自定义伪类
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

// Returns a function to use in pseudos for buttons
// 检测button元素类型，submit, reset两种类型
//创建一个伪类的过滤函数,此方法是根据表单元素的type值或标签类型生成
//如果:button, :submit自定义伪类
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

// Returns a function to use in pseudos for positionals
//用于创建位置伪类的过滤函数，它们是模拟从左向右的顺序进行选择，
//匹配到它时的结果集的位置来挑选元素的
//比如:odd,:even, :eq, :gt, :lt, :first, :last
// 调用createPositionalPseudo方法，对于传入的两个参数
// 第一个参数种子集合，第二个是匹配项数组
// 调用完成之后种子集合中符合条件的项设置为false，matches数组中存放的就是匹配项
function createPositionalPseudo( fn ) {
	return markFunction(function PositionalPseudo1( argument ) {
		argument = +argument;
		return markFunction(function PositionalPseudo2( seed, matches ) {
			var j,
				// 调用实际的过滤器返回的是结果集合当中对应的索引数组 
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					//这里的j是数组索引值，matches数组中可能会出现undefinde值 如：var arr = []; arr[10] = 10;这里前9项会是undefined
					// 把查找到的对应索引位置的元素设置为false，
					seed[j] = !(matches[j] = seed[j]); 
				}
			}
		});
	});
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (see #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	// http://www.cnblogs.com/aaronjs/p/3310937.html
	// 其实不难发现，一个节点跟另一个节点有以下几种关系：
	// 祖宗和后代
	// 父亲和儿子   
	// 临近兄弟
	// 普通兄弟
	// 在CSS选择器里边分别是用：空格；>；+；~
	// 其中first表示时候是亲密关系，紧挨着的关系
	relative: {
		">": { dir: "parentNode", first: true }, // 父子节点关系
		" ": { dir: "parentNode" }, // 祖宗与后代关系
		"+": { dir: "previousSibling", first: true }, // 临近的兄弟关系
		"~": { dir: "previousSibling" } // 普通的兄弟关系
	},

	// 预处理阶段：
	// 1、属性预处理
	// 2、子节点预处理
	// 3、伪类预处理
	//正则出来的数组不能直接用需要过滤下如：attr正则出来的数组引号还有~=
	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			//不管有没有引号都把value值移到match[3]
 			//有引号["[name="username"]", "name", "=", """, "username", undefined]
 			//无引号["[name=username]", "name", "=", undefined, undefined, "username"]
			match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) { //匹配属性值必须有空格分隔（这个选择器测试属性值中的每个单词字符串，其中“word”是一个由空白分隔的字符串定义的）
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				child类型选择符例如nth-child(2n)/nth-child(3)
				1 type (only|nth|...) 								[nth/nth]
				2 what (child|of-type)								[child/child]
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)		[2n/-3] 匹配括号里面的字符2n/-3
				4 xn-component of xn+y argument ([+-]?\d*n|)		[2n/''] 匹配括号里有步进的字符，odd,even,2n等
				5 sign of xn-component								[''/undefined] 匹配步进里的正负号
				6 x of xn-component									[2/undfined] 匹配步进里的数字
				7 sign of y-component								[undefined/'-'] 匹配单个数字的正负号
				8 y of y-component									[undefined/3] 匹配单个数字的数字字符
				[3]匹配整个child后面括号里的内容，不管是步进还是数字
				[4]匹配的整个步进字符
				[5]匹配步进里的正负号
				[6]匹配步进里的数字字符
				[4,5,6]匹配步进
				[7]匹配数字里的正负号
				[8]匹配数字里的数字字符
				[7,8]匹配数字
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				// nth-child后面的括号里面需要有步进或者数字，否则报错
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				// 计算整理步进元素，如果是步进，match[4]就是步进的整个匹配出来的字符
				// match[5]为正负号，match[6]为步进的数字，如果没有步进的数字，默认步进为1
				// match[5]+match[6]是字符进行连接的，通过最前面的'+'操作符转化为数字
				// 还有一种情况就是步进为奇数或者偶数的时候，可以使用单词'event'和'odd'
				// 进行简写，这样的话，match[4]就是undefined，match[3]中就是匹配的单词
				// odd表示奇数，even表示偶数
				// 奇数单词odd或者偶数单词even，match[4]中都保存的是2
				// 而match[5]中则不一样，odd时为1，even时为0
				//处理(xn + y)
 		       //true和false分别转换为1和0,  true和false参与运算时会自动转换为1和0
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				// match[5]中表示的是数字。
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			//如果不是nth类型但是match[3]有值说明不是合法的CHILD选择器
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[5] && match[2];

			//如果是孩子伪类不处理
			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			//如果小括号内有引号 如：[":eq("2")", "eq", ""2"", """, "2", undefined, undefined, undefined, undefined, undefined, undefined]
			if ( match[4] ) {
				match[2] = match[4];

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			//返回捕获中仅仅需要的过滤方法（type和argument）
			return match.slice( 0, 3 );
		}
	},

	// 过滤处理包括
	// 标签、class、属性、子节点和伪类
	// 标签过滤是事先把要过滤的名称存放进来，
	filter: { //过滤函数（判断各节点是否符合条件）

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			// 通过判断事先存放进去的标签名称来返回不同的匿名函数
			return nodeNameSelector === "*" ?
				// 如果标签名是"*"，表示任何标签名称都匹配，所以返回的永远都是true
				function() { return true; } :
				// 如果有标签名，将比较传递进来的标签名与元素的nodeName
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
				});
		},

		//属性元匹配器工厂
		//name ：属性名
		//operator ：操作符
		//check ： 要检查的值
		//例如选择器 [type="checkbox"]中，name="type" operator="=" check="checkbox"
		"ATTR": function( name, operator, check ) {
			//返回一个元匹配器
			return function( elem ) {
				//先取出节点对应的属性值
				var result = Sizzle.attr( elem, name );

				// 
				if ( result == null ) {
					//如果操作符是不等号，返回真，因为当前属性为空 是不等于任何值的
					return operator === "!=";
				}
				//如果没有操作符，那就直接通过规则了
				if ( !operator ) {
					return true;
				}

				result += "";

					//如果是等号，判断目标值跟当前属性值相等是否为真
				return operator === "=" ? result === check :
					//如果是不等号，判断目标值跟当前属性值不相等是否为真
					operator === "!=" ? result !== check :
					//如果是起始相等，判断目标值是否在当前属性值的头部
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					//这样解释： lang*=en 匹配这样 <html lang="xxxxenxxx">的节点
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					//如果是末尾相等，判断目标值是否在当前属性值的末尾
					operator === "$=" ? check && result.slice( -check.length ) === check :
					//这样解释： lang~=en 匹配这样 <html lang="zh_CN en">的节点
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					//这样解释： lang=|en 匹配这样 <html lang="en-US">的节点
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					//其他情况的操作符号表示不匹配
					false;
			};
		},

		// 分别对应的参数为nth,child,3n/even/'',3/2/'',''/0/5
		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					// 如果过滤的元素有父节点，则继续进行下一步的筛选
					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						// 是否是简单的first|last|only这样不需要数字就可以确定位置的元素
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						// forward表示遍历的方向，如果选择符中有'last',则表示从最后一个子节点开始，否则就从第一个子节点开始
						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						// 非xml节点类型，nth-child把索引缓存存储在父节点中
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							// 从前一个缓存索引出开始查找元素
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								// 如果是第一次查找，没有缓存节点索引，那么在此处设置默认值
								// 并且把第一个开始的元素取出来
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									// 三个参数的意义分别是
									// dirruns参数表示节点查找移动的方向，1表示向后查找，0表示向前查找
									// nodeIndex参数是上一个元素在父节点中的位置索引，这样下一次进行遍历的时候直接从index标记的地方开始查找
									// diff参数表示当前元素在父节点中同类节点类型中的真正的索引位置，因为父节点元素下不光包括
									// 元素节点，还包括text节点(nodeType == 3)，所以要排除掉非元素节点，只有是元素(nodeType == 1)节点
									// 才会把diff索引值递增，最后通过此元素节点在父节点的同类子节点中的真正的位置索引来判断此元素
									// 是否是要求的元素节点
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						// xml类型的节点元素查找
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						// 在此处先减去最后一个参数，比如nth-child(2n+1),那么此处就是首先减去后面的后缀+1，即diff-1，
						// 然后使用做过减法运算后的元素位置索引与n前面的倍数做运算。检查是否是符合要求的元素节点。
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		// ^:((?:\\.|[\w-]|[^\x00-\xa0])+)(?:\(((['"])((?:\\.|[^\\])*?)\3|((?:\\.|[^\\()[\]]|\[[\x20\t\r\n\f]*((?:\\.|[\w-]|[^\x00-\xa0])+)[\x20\t\r\n\f]*(?:([*^$|!~]?=)[\x20\t\r\n\f]*(?:(['"])((?:\\.|[^\\])*?)\8|((?:\\.|[\w#-]|[^\x00-\xa0])+)|)|)[\x20\t\r\n\f]*\])*)|.*)\)|)
		// 上面的伪类表达式总共有10个分组：
		// [0]:表示能够匹配到的整个表达式的值
		// [1]:第一个匹配子项 ((?:\\.|[\w-]|[^\x00-\xa0])+)
		// 首先是两个括号，但是第二个括号是一个非捕获分组，只有第一个括号或捕获
		// 第一个参数是过滤器的类型，第二个参数是过滤器中的参数
		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			//用户可能用createPseuso（需要创建一个过滤函数做为参数）自定义一个伪类， 就像sizzle创建的一样
			if ( fn[ expando ] ) {
				// 使用过滤器中的参数调用对应类型的过滤器
				return fn( argument );
			}

			// But maintain support for old signatures
			//保持旧的签名支持
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function PSEUDO1( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		// 潜在的复杂伪类
		"not": markFunction(function not1( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				// 如果not表达式里面是位置选择符，则会进行标记处理 
				markFunction(function not2( seed, matches, context, xml ) {
					var elem,
					// 首先执行not过滤器里面的选择匹配器
						unmatched = matcher( seed, null, xml, [] ),
						// 执行完内部的匹配器之后，得到的结果为unmatched数组中保存的都是
						// 内部匹配器未匹配的集合，seed中则是完整的数据集合
						i = seed.length;

					// Match elements unmatched by `matcher`
					// 因为not操作是去与内部匹配器相反的的结果，所以内部匹配器为匹配的需要保留
					while ( i-- ) {
						// 因为未匹配的第一项值为false，所以第一次就不进行任何操作。那么在matches
						// 数组中就确少第一项。而seed中全部只有第一项得以保留。
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function has1( selector ) {
			return function has2( elem ) {
				// 意思就是说select元素是否是elem元素的子节点后代
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		// 匹配包含给定文本的元素
		// $("div:contains('John')")，里面是元素节点包含的文本文字，
		// 取出
		"contains": markFunction(function contains1( text ) {
			return function contains2( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function lang1( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including ext(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
		},

		// Position-in-collection
		// 位置伪类需要进行标记处理，使用setMatcher方法
		// 在初始化的时候，每个函数都已经被标记了
		// 为了方便调试，匿名函数我都添加了一个名称
		//"first": createPositionalPseudo(function() {
		// createPositionalPseudo方法中嵌套的fn函数的参数为[],种子集合长度,伪类中的参数
		"first": createPositionalPseudo(function first1() {
			return [ 0 ];
		}),

		//"last": createPositionalPseudo(function( matchIndexes, length ) {
		"last": createPositionalPseudo(function last1( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		//"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
		"eq": createPositionalPseudo(function eq1( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		//"even": createPositionalPseudo(function( matchIndexes, length ) {
		"even": createPositionalPseudo(function even1( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		//"odd": createPositionalPseudo(function( matchIndexes, length ) {
		"odd": createPositionalPseudo(function odd1( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		//"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
		"lt": createPositionalPseudo(function lt1( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		//"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
		"gt": createPositionalPseudo(function gt1( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
		// 在animate动画下面，添加了关于animate过滤的过滤条件
		// if ( jQuery.expr && jQuery.expr.filters ) {
		// 	jQuery.expr.filters.animated = function( elem ) {
		// 		return jQuery.grep(jQuery.timers, function( fn ) {
		// 			return elem === fn.elem;
		// 		}).length;
		// 	};
		// }
	}
};

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// 在预编译的词法解析阶段对选择字符串进行词法解析
function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	// 把整个选择操作符一个符号一个符号的进行处理，知道把所有的选择全部处理完为止
	while ( soFar ) {

		// Comma and first run
		// 以第一个逗号切割选择符,然后去掉前面的部分
		// rcomma = /^[\x20\t\r\n\f]*,[\x20\t\r\n\f]*/;
		// rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
		// 每次都会对选择符进行裁切，如果有","的话，循环把前面的选择符裁切完毕后，
		// 就会出现象这样的字符串" ,div:filterchild",因为选择符是以逗号为分割的标准
		// 所以经过裁切后出现","，就会把剩下的部分存储起来以便前面的部分处理完毕后
		// 在进行选择符剩余部分的操作。
		// 这个if语句处理","分割的选择符，把逗号后面的其他的选择符切割出来的
		// 词素存放到groups数组的下一个数组项中
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				//如果匹配到逗号或者空格,把逗号和空格删除掉继续进行分割
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( tokens = [] );
		}

		matched = false;

		// Combinators
		// rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),
		// 选出四种简单的节点关系符号，">+~"和空格，选择出来之后，直接推入到tokens数组中
		// 这个if语句处理关系选择符
		if ( (match = rcombinators.exec( soFar )) ) {
			// 如果是四种关系选择符中的一个，就把匹配到的该符号取出
			matched = match.shift();
			tokens.push( {
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			} );
			// 查找的字符中有那四种关系符号，推入数组后进行切割。
			soFar = soFar.slice( matched.length );
		}

		// Filters
		// Filters
        //这里开始分析这几种Token ： TAG, ID, CLASS, ATTR, CHILD, PSEUDO, NAME
        //将每个选择器组依次用ID,TAG,CLASS,ATTR,CHILD,PSEUDO这些正则进行匹配
        //Expr.filter里边对应地 就有这些key
	    /**
	     *
	     *
	     *matchExpr 过滤正则
	        ATTR: /^\[[\x20\t\r\n\f]*((?:\\.|[\w-]|[^\x00-\xa0])+)[\x20\t\r\n\f]*(?:([*^$|!~]?=)[\x20\t\r\n\f]*(?:(['"])((?:\\.|[^\\])*?)\3|((?:\\.|[\w#-]|[^\x00-\xa0])+)|)|)[\x20\t\r\n\f]*\]/
	        attr:
	        CHILD: /^:(only|first|last|nth|nth-last)-(child|of-type)(?:\([\x20\t\r\n\f]*(even|odd|(([+-]|)(\d*)n|)[\x20\t\r\n\f]*(?:([+-]|)[\x20\t\r\n\f]*(\d+)|))[\x20\t\r\n\f]*\)|)/i
	        CLASS: /^\.((?:\\.|[\w-]|[^\x00-\xa0])+)/
	        ID: /^#((?:\\.|[\w-]|[^\x00-\xa0])+)/
	        PSEUDO: /^:((?:\\.|[\w-]|[^\x00-\xa0])+)(?:\(((['"])((?:\\.|[^\\])*?)\3|((?:\\.|[^\\()[\]]|\[[\x20\t\r\n\f]*((?:\\.|[\w-]|[^\x00-\xa0])+)[\x20\t\r\n\f]*(?:([*^$|!~]?=)[\x20\t\r\n\f]*(?:(['"])((?:\\.|[^\\])*?)\8|((?:\\.|[\w#-]|[^\x00-\xa0])+)|)|)[\x20\t\r\n\f]*\])*)|.*)\)|)/
	        TAG: /^((?:\\.|[\w*-]|[^\x00-\xa0])+)/
	        bool: /^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i
	        needsContext: /^[\x20\t\r\n\f]*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\([\x20\t\r\n\f]*((?:-\d)?\d*)[\x20\t\r\n\f]*\)|)(?=[^-]|$)/i
	     *
	     */
        //如果通过正则匹配到了Token格式：match = matchExpr[ type ].exec( soFar )
        //然后看看需不需要预处理：!preFilters[ type ]
        //如果需要 ，那么通过预处理器将匹配到的处理一下 ： match = preFilters[ type ]( match )
        // 这个if语句处理过滤选择符
        // 循环过滤选择符，知道吧选择符切割完毕每次使用matchExpr选择正则进行匹配
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,
					type: type,
					matches: match
				} );
				soFar = soFar.slice( matched.length );
			}
		}

		// 当已经没有选择符可以处理的时候，跳出循环。
		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	//如果我们仅仅解析返回无效的长度，否则返回解析完的选择器对象或者抛出错误
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			// 在cache中缓存分析出来的tokens，键值key为选择操作符的在最后添加一个空格组成。
			// 值为词法分析组成的数组，最后的slice(0)是把结果转化为数组。
			tokenCache( selector, groups ).slice( 0 );
}

// 把选择符元素集合合并
function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

// addCombinator方法就是为了生成有位置词素的匹配器。
// 通过方向位置选择符，把节点的层次进行转换，把转换后的
// 节点元素放入到匹配器中进行匹配。
function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		// 局部变量就是为了保存这是第几次调用节点层次移动方法。
		// 用于创建不同的元素节点缓存数组的第一个值
		doneName = done++;

	// 四个表示位置关系的有两个为first:true，表示关系最近的。分别是
	// >:表示直系父子关系和+:紧邻的兄弟关系
	return combinator.first ?
		// Check against closest ancestor/preceding element
		// 检测距离最近的父节点或者是临近的兄弟节点
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					// 把通过移动得到的元素放入过滤器中继续进行过滤
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		// 检测所有的祖宗节点或者兄弟节点
		function( elem, context, xml ) {
			var data, cache, outerCache,
				// 层次关系选择符在整个选择符中的位置为doneName，
				// 该值相当于在DOM树中从上到下的层级位置。
				// 组成的键值的意义为：
				//                 	 div元素---------------------相当于层级0，doneName = 0
				//				   /   		\
				//				 div   		div -----------------相当于层级1，doneName = 1
				//				/  \   		/  \
				// 			   p   div     p   div---------------相当于层级2，doneName = 2
				// 层级关系如上所示，每一层的节点元素的标记数组的第一项键值都是一样的。
				dirkey = dirruns + " " + doneName;

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						// 一直进行查找，知道查找到终结点为止
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				//如果是不紧密的位置关系
                //那么一直匹配到true为止
                //例如祖宗关系的话，就一直找父亲节点直到有一个祖先节点符合规则为止

    			// matcher为当前词素前的“终极匹配器”
				// combinator为位置词素
				// 根据关系选择器检查
				// 如果是这类没有位置词素的选择器：’#id.aaron[name="checkbox"]‘
				// 从右到左依次看看当前节点elem是否匹配规则即可。但是由于有了位置词素，
				// 那么判断的时候就不是简单判断当前节点了，
				// 可能需要判断elem的兄弟或者父亲节点是否依次符合规则。
				// 这是一个递归深搜的过程。
				// 然后用同样的方式递归下去，直接到tokens分解完毕
				// 返回的结果一个根据关系选择器分组后在组合的嵌套很深的闭包函数
				// 所以matchers又经过一层包装了
				while ( (elem = elem[ dir ]) ) {
					// 对传递进来的元素进行了某一个维度上的深度遍历后，
					// 检查得到的元素是不是元素节点。如果不是元素节点继续在这个维度上进行遍历
					if ( elem.nodeType === 1 || checkNonElements ) {
						// 首先检查元素是否含有标记，如果没有标记，设置一个标记对象
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						// 检查标记对象的parentNode/previousSibling属性中是否含有一个数组对象
						// 数组对象的第一项是所在层级位置组成的键值key，第二项是元素节点是否
						// 符合要求的标志，如果为true表示符合要求，如果为数字，表示不符合要求
						// 数字为该元素在种子集合中的位置索引。
						if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
							// 如果元素已经含有标记属性对象，而且标记数组的第二项为true
							// 表示此元素已经进行了匹配，而且符合条件，那么种子集合中的
							// 该元素也符合要求，直接返回true。或者第二项不等于true，
							// 继续循环遍历元素节点。
							if ( (data = cache[1]) === true || data === cachedruns ) {
								return data === true;
							}
						} else {
							// 如果外部缓存中不存在元素，在这里进行遍历的时候，同时设置给元素设置一个标志
							// 用来标志该元素是否是符合要求的元素节点
							// 在元素的Sizzle-1.9834789237478属性中添加一个对象，该对象中包含一个数组
							// 如果通过层次选择器移动了当前的节点层次，使用matcher比较当前的元素是否符合要求
							// 如果符合要求，matcher返回为true，则此节点的标记属性中的数组第二项被设置为true
							// 如果不符合要求，被设置为此元素在种子集合中的索引值。这样在下次此元素被遍历到的时候，
							// 首先查看元素是否有标记，如果没有标记说明此元素没有被遍历过，处理元素
							// 如果元素被标记了，而且标记数组的第二项为true，说明此元素复合要求，直接返回true
							// 如果标记的第二项不为true，而是一个数字，说明此元素不符合要求，继续进行递归遍历
							// 知道查找到符合要求的或者一直查找到元素的上下文。再确定是否符合要求。
							cache = outerCache[ dir ] = [ dirkey ];
							// 设置标记数组第二项
							cache[1] = matcher( elem, context, xml ) || cachedruns;
							// 如果第二项不等于true，继续进行循环遍历
							if ( cache[1] === true ) {
								return true;
							}
						}
					}
				}
			}
		};
}

// 返回一个匿名函数，可以直接执行传递进来的匹配器
// 这个是应用于不含有过滤选择符匹配器
function elementMatcher( matchers ) {
	// 分解这个子匹配器，返回又一个curry函数，给addCombinator方法
	return matchers.length > 1 ?
		//如果是多个匹配器的情况，那么就需要elem符合全部匹配器规则
		function( elem, context, xml ) {
			var i = matchers.length;
			//从右到左开始匹配
			while ( i-- ) {
				//如果有一个没匹配中，那就说明该节点elem不符合规则
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		//单个匹配器的话就返回自己即可
		matchers[0];
}

// 第一个参数是一个含有false元素的未匹配集合，如果没有过滤器，则此函数的作用就是
// 把集合中包含的false元素剔除掉，只剩下真正的集合元素。如果含有过滤函数
// 首先会把false元素剔除掉，然后再匹配过滤函数进行过滤。
function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			// 如果没有过滤函数，直接把元素添加到新集合中，
			// 如果有过滤函数，执行过滤函数，符合要求的才会被添加到新集合中
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					// 此处的map是记录未匹配的数组中数据项符合条件的下标值集合，
					// 用于以后修正数据项使用
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

//如：'\#test a input[name="username"]:last[type="text"] [value*=2]'（不建议写这样的选择器）
//preFilter位置伪类之前的所有选择器过滤函数 如：'a input[name="username"]'选择器的匹配函数
//selector 位置伪类之前的所有选择器 如：'a input[name="username"]'
//matcher 位置伪类匹配函数
//postFilter如果位置伪类后面还有选择器, 且关系选择器之前（如果有的话） 此选择器的匹配函数
//postFinder如果位置伪类后面还有关系选择器，第一个关系选择器以后的匹配函数
//postSelector如果位置伪类后面还有关系选择器，第一个关系选择器以后的选择器 如：' [value*=2]'

//还是这个例子：div:first input:checked + p
//第1个参数，preFilter，前置过滤器，相当于“div”过滤器
//第2个参数，selector，前置过滤器的字符串格式，相当于“div”input:checked + p
//第3个参数，matcher，当前位置伪类“:first”的匹配器/过滤器
//第4个参数，postFilter，后置过滤器，相当于“ ”
//第5个参数，postFinder，后置搜索器，相当于在前边过滤出来的集合里边再搜索剩下的规则的一个搜索器
//第6个参数，postSelector，后置搜索器对应的选择器字符串，相当于“input:checked + p”
function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}

	//工厂方法，生成一个打上标记的匹配器！
	return markFunction(function setMatcher1( seed, results, context, xml ) { //得到位置伪类之前的选择器的元素后在筛选出符合条件伪类选择器的元素
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			//根据把位置伪类前面的选择器查找出元素然后再筛选位置伪类和它后面的选择器
			//取出种子集合seed
      		//这个函数是递归调用Sizzle构造函数来寻找DOM结果集
      		// 使用的是闭包外面一层的selector，也就是伪类的前置选择器。
      		// 首先检查种子集合中是否含有元素集合，如果没有，使用过滤选择符前置的选择器进行查找元素。
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			// 前置过滤出来的DOM集合
      		// condense函数的功能主要就是对传递进去的元素集合执行preFilter过滤
      		// 过滤后符合要求的元素集合返回给matcherIn输入集合
      		// 使用前置过滤器来过滤结果集。
      		// seed为undefined说明是使用过滤器第一次进行查找过滤，因为是第一次查找，但是种子集合中没有
      		// 任何元素，所以首先会通过前置的选择符使用multipleContext方法来查找符合要求的元素集合
      		// 因为上一步已经通过multipleContext方法查找了元素，所以在此处的seed || !selector的意思就是
      		// 这是第一次查找过滤，上面已经通过selector进行了元素集合的查找，所以这里不需要使用前置过滤器
      		// 如果传递进来的seed种子集合中含有元素集合，则这里会进行前置过滤器的过滤操作。
			matcherIn = preFilter && ( seed || !selector ) ?
				// 对传递进来的结果集合应用匹配器，符合匹配条件的保留返回给matcherIn。
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				//如果postFinder存在，或者筛选的种子集存在，再或者筛选的种子集不存在但是postFilter存在或results中有值
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		//通过刚刚createPositionalPseudo生成的位置过滤器
    	//把matcherIn过滤出matcherOut
    	// 1、首先使用匹配器本身进行匹配
		if ( matcher ) {
			// 应用过滤器本身。符合过滤条件的返回给matchOut，
			// 这个通过matcher匹配的过程不是仅仅把符合条件的取出来，
			// 同时还要在原集合中把符合条件的那一项设置为false，
			// 这样在原集合中剩下的就是不符合条件
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		//这个时候matcherOut对应的是规则“div:first ”找到的DOM节点
    	//接着从matcherOut中用后置规则“ input:checked + p”过滤！
    	//先用postFilter过滤出候选集，后置过滤器，是紧跟着位置伪类的
    	// 非层次选择符才会有，如果位置伪类后面紧跟着的是层次选择符
    	// 则postFilter为false，不执行此处进行过滤
		if ( postFilter ) {
			// postMap存储的是符合条件的索引值数组
			// 首先是矫正匹配出来的元素集合中的元素，存放在temp临时变量里面
			// 修正数组的索引值，同时存储matcherOut原数组中对应的索引值
			temp = condense( matcherOut, postMap );
			// 使用后置过滤器过滤矫正后的元素集合
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				//把没有匹配失败的元素放到matcherIn中
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		//用后置搜索器从候选集筛出结果
		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			// 这一步是修正及去除matcherOut中不符合要求的数据项。
			// 
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			//如果有后置搜索器，用它搜索结果集
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			//否则，直接就是push到结果集
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

// 从选择符元素中创建匹配器
// 返回的是一个setMatcher
// 传入的是字符序列，返回的是setmatcher闭包过滤器
function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		// 是否是四种节点关系中的一种
		// 这里是在处理位置伪类后面的层次选择符使用的，用来确定层次关系
		// 例如选择符为.first>ul:first > li:not(:first)
		// 在.first>ul:first后面会进行另一次循环进行创建过滤器，则后面的表达式
		// 再进行循环创建时选择符为 > li:not(:first),所以在此处确定相对关系为
		// leadingRelative = {dir: "parentNode",first: true}
		leadingRelative = Expr.relative[ tokens[0].type ],
		// 默认是祖宗与后代的关系
		implicitRelative = leadingRelative || Expr.relative[" "],
		// 通过第一个字符来确定创建闭包过滤器的起始位置
		// 因为如果第一个位置是关系选择符，那么就只能从下一个位置开始创建
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		// 确保这些元素可以在context中找到
		matchContext = addCombinator( function matchContext1( elem ) {
			// 比较传递进来的元素是否是传递进来的上下文
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function matchAnyContext2( elem ) {
			// 确定传递进来的上下文是否包括传递的元素
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		 //这里用来确定元素在哪个context
		matchers = [ function Context1( elem, context, xml ) {
			// 这里的上下文确定是通过上面的leadingRelative关系，如果上下文context没有进行设置
			// 那么默认就是document，则outermostContext = false,所以此处返回true，而不会进入到
			// 上下文的过滤操作中。因为页面上所有的元素的最终根节点肯定是document，所以不需要进行
			// 过滤操作，而如果在前面设置了上下文context，那么此处的context就是一个元素节点，
			// 同时outmostContext与context相同，所以会继续执行后面的macthContext操作。
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				// 这里的操作时在设置了上下文的基础上进行的，如果不设置上下文context，代码不会执行到这里。
				// 如果context上下文没有nodeType属性，说明context上下文是一个元素集合，使用matchAnyContext
				// 进行过滤，如果context含有NodeType属性，则使用matchContext进行过滤操作。
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	// Expr.relative 匹配关系选择器类型
  	// "空 > ~ +"
	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			//当遇到关系选择器时elementMatcher函数将matchers数组中的函数生成一个函数
			//（elementMatcher利用了闭包所以matchers一直存在内存中）
			// matcher其实最终结果返回的就是bool值,但是这里返回只是一个闭包函数，不会马上执行，
			// 这个过程换句话就是 编译成一个匿名函数继续往下分解.如果遇到关系选着符就会合并分组了
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			// 过滤  ATTR CHILD CLASS ID PSEUDO TAG
			// apply方法调用时是把后面跟的array参数
			// 因为是使用apply方式进行调用，所以分词器里面对应位置的选择符当做参数传递到filter中
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
  			//返回一个特殊的位置匹配函数
  			//伪类会把selector分两部分
  			// 参考：http://rapheal.sinaapp.com/2013/02/13/jquery-src-sizzle-position-pseudo/
			if ( matcher[ expando ] ) { //如果含有位置伪类的选择器，因为伪类的函数都被打了标记
				// Find the next relative operator (if any) for proper handling
				// 发现下一个关系操作符（如果有话）并做适当处理
				// 此处可以发现i的位置表明在后续选择符的处理上，只要遇到位置选择器，就调用setMatcher进行一次匹配
				// 所以此处的i表示位置选择符的下一个位置。
				j = ++i;
				// 找到下个位置（+~>空格）的索引
				// j的循环遍历是在查找关系选择符，如果找到关系选择符，在setmatcher匹配器中就会出现后置查找器
				// 如果一直到达了词法集合的最后都没有找到，说明后面的都是当做过滤器来使用
				// 所以可以看出，i值表示当前处理的位置，j值表示后置关系选择符的位置
				// 则i与j之间的选择符作为后置过滤器，j以后直至选择符末尾都是作为查找器。
				for ( ; j < len; j++ ) {
					// 如果过滤选择符后面紧接着就是四种关系选择符之一，那么直接就跳出循环
					// 这样i == j，那么在setMatcher方法中第四个参数postFilter就不存在。
					if ( Expr.relative[ tokens[j].type ] ) { //如果位置伪类后面还有关系选择器还需要筛选
						break;
					}
				}

				//看到没？是通过setMatcher来生成匹配器的！
      			//还是这个例子：div:first input:checked + p
      			//这里的位置伪类就是:first，以他为分界线，用setMatcher来处理
				return setMatcher(
					//第1个参数，preFilter，前置过滤器，相当于“div”过滤器
					i > 1 && elementMatcher( matchers ), // 前置的过滤器，相当于div的过滤器

					//第2个参数，selector，前置过滤器的字符串格式，相当于“div”
					i > 1 && toSelector( tokens.slice( 0, i - 1 ) ).replace( rtrim, "$1" ),

					//第3个参数，matcher，当前位置伪类“:first”的匹配器/过滤器
					matcher,

					// 第4个参数，postFilter，后置过滤器，看是否有四个关系选择器，如果有四个关系选择器
					// 第4个参数就是关系选择生成的匹配器，如果没有四种关系选择器，则此处的参数就是
					// 剩下的所有选择符组成的集合，含有后置过滤器的意思就是说位置伪类选择符后面紧跟的
					// 还是属于对当前元素集合的过滤操作，过滤作用的主体还是经过位置伪类过滤后的集合
					i < j && matcherFromTokens( tokens.slice( i, j ) ),

					//第5个参数，postFinder，后置搜索器，相当于在前边过滤出来的集合里边再搜索剩下的规则的一个搜索器
					// 如果关系选择器存在，则第五个参数就是关系选择器后面跟着的选择符生成的匹配器
					// 如果一旦存在层次选择符，说明后面要进行操作的不再是经过前面位置伪类过滤后的元素集合了
					// 而是通过层次关系移动节点关系层次的元素集合，相当于说，当前经过过滤后的集合为[a],
					// 当前的层次关系为>(子类选择符),则需要通过a.children这样的关系选择出来子类的元素集合
					// 这样就把层次关系移动到了子类的层次上。
					// **********************************************************************************
					// 调用matcherFromTokens返回的是直接可以执行的匹配器，非超级匹配器
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),

					//第6个参数，postSelector，后置搜索器对应的选择器字符串，相当于“input:checked + p”
					//如果关系选择器存在，第6个参数就是选择器后面的选择符，如果不存在就是false。
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	// 通过elementMatcher生成一个终极匹配器
	return elementMatcher( matchers );
}

// 创建匹配器的入口点，最终的superMatcher
// 超级匹配器最终返回的是未匹配的元素集合
function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	// A counter to specify which element is currently being matched
	// 指示当前被匹配的是哪个元素的计数器
	var matcherCachedRuns = 0,
		bySet = setMatchers.length > 0,
		// 是否有匹配器可以进行匹配
		byElement = elementMatchers.length > 0,
		// superMatcher方法是matcherFromGroupMatchers( elementMatchers, setMatchers )
		// 方法return出来的，但是最后执行起重要作用的是它
		// 最后一个参数expandContext表示是否扩充上下文，扩充上下文就是上下文的范围扩大为当前上下文的父节点元素
		superMatcher = function( seed, context, xml, results, expandContext ) {
			var elem, j, matcher,
				setMatched = [],
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				// 是否使用外层上下文
				outermost = expandContext != null,
				contextBackup = outermostContext,
				// We must always have either seed elements or context
				// 有可能是直接从seed中查询过滤，也有可能在context或者context的父节点范围内。
				// 如果不是从seed开始，那只能把整个DOM树节点取出来过滤了，把整个DOM树节点取出来过滤了，
				// 它会先执行Expr.find["TAG"]( "*", outermost )这句代码等到一个elems集合（数组合集）
				// 可以看出对于优化选择器，最右边应该写一个作用域的搜索范围context比较好
				// 有两种情况下会执行后面的find语句，有多个选择符以逗号分隔。就是有伪类选择符。
				// 上下文表示如果选择符中包含有+~这两个层次选择符之一，说明接下来选择的元素是
				// 当前上下文的兄弟节点，所以进行查找的话上下文要移动到parentNode上。
				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
				// Use integer dirruns iff this is the outermost matcher
				//　当且仅当这是最外层的匹配器的时候使用整数dirruns
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

			if ( outermost ) {
				// 扩充上下文是在提供了上下文的基础上进行的，如果没有提供上下文，那么outmostContext
				// 就为false，因为不提供上下文的情况下，默认提供的上下文是document
				outermostContext = context !== document && context;
				cachedruns = matcherCachedRuns;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			// 循环遍历获取到的元素节点集合依次使用闭包过滤器进行过滤
			for ( ; (elem = elems[i]) != null; i++ ) {
				// 如果存在过滤器，而且元素也存在，执行过滤器进行过滤
				if ( byElement && elem ) {
					j = 0;
					// 开始遍历查找出来的元素节点集合
					// 对每个节点应用编译函数(闭包)进行过滤查找
					while ( (matcher = elementMatchers[j++]) ) {
						// 每个闭包都返回一个bool值来指示结果是否正确
						// 选择符中间的逗号是一种或的关系，表示元素满足两者之间的任何一个都会被添加到结果集中
						if ( matcher( elem, context, xml ) ) {
							// 如果查找正确，直接推入结果集中
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
						// 节点元素的位置索引值逐渐变化
						cachedruns = ++matcherCachedRuns;
					}
				}

				// Track unmatched elements for set filters
				//对于位置过滤器执行的操作。
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					// 延长数组中的每个元素
					if ( seed ) {
						//重新组装成一个新的过滤集合，种子集合中不进行改动
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			// 此处的i表示种子集合的长度
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					// 整合不需要进行排序的匹配的元素
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					// 丢弃数组中的标记占位符false，获取真正的匹配元素
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			// 因为这两个都是全局变量，所以在过滤结束以后使用最里层的匹配参数覆盖这两个变量
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			// 相对于正常情况下的选择符，返回unmatched集合也无妨
			// 因为传递进来的数组results是引用类型，所以在compile方法中调用的
			// 时候，调用superMathcer结束以后，results中已经保存了结果集
			// 不匹配的数组中包含不符合要求的项，匹配的项的位置使用false占位符
			// 表明剩下的项都是非匹配项。
			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

// 编译函数，创建元素匹配器
compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		// 含有位置伪类的过滤函数集合的存放位置，从前向后开始搜索第一个位置伪类的位置，从此处开始
		// 先查找此位置前面的标签的元素，然后进行向后进行过滤
		setMatchers = [],
		// 不含有位置伪类的其他的所有的过滤函数，都是自右向左开始遍历过滤
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		// 此处对多个选择符分组进行逐个处理从后向前处理
		while ( i-- ) {
			// 这里的cached表示创建的闭包匹配器
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		// 缓存包含匹配器的入口函数
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

// 在给定的上下文中执行查询元素操作
function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

// 执行元素匹配
function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		// tokenize方法进行选择符的词法分析 
		match = tokenize( selector );

	// seed表示查询出来的节点元素结果集
	if ( !seed ) {
		// Try to minimize operations if there is only one group
		// match表示选择符的组数，以“，”分割选择符，分割出来的组数存放到match中
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			// 如果选择符中第一个是ID，则设置上下文
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					context.nodeType === 9 && documentIsHTML &&
					Expr.relative[ tokens[1].type ] ) {
				
				// 把第一个ID元素查找到的元素作为下面查找的上下文，缩小查找的返回。
				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;
				}

				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			//其中： "needsContext"= new RegExp( "^[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(((?:-\\d)?\\d*)\\)|)(?=[^-]|$)", "i" )
            //即是表示如果没有一些结构伪类，这些是需要用另一种方式过滤，在之后文章再详细剖析。
            //那么就从最后一条规则开始，先找出seed集合
            // 如果选择符中含有关系选择符或者位置伪类选择符都直接使用编译函数进行模板编译
            // 选择符最开头是+、>、~、""或者:even,:odd,:eq,::lt,:gt,:nth,:first,:last
            // 在此处决定是从前向后还是从后向前进行过滤
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			// 如果选择符中含有位置伪类选择符，不是用正常的方式进行查找，跳过下面的步骤。
			// 所以i = 0，跳过查找。
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				// Expr.find查找三种类型，id、class和tag，如果是其他的类型，直接排除向前继续查找
				// 直到找到这三种类型的元素，查找元素然后进行过滤。
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					// 尝试一下能否通过这个搜索器搜到符合条件的初始集合seed
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && context.parentNode || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						// 如果结果集为空，即没有查找到符合选择符要求的节点元素，或者tokens集合中没有元素了
						// 提前返回。
						// 如果通过find方法查找到了元素节点，就以此结果集为基础，在此结果集上进行筛选
						// 同时把对应的选择符从tokens里排除
						tokens.splice( i, 1 );
						// toSelector方法表示把剩余的选择符连接起来成一个字符串返回。
						// 去掉了查找结果集对应的选择操作符
						selector = seed.length && toSelector( tokens );
						// 如果此时选择符中没有任何字符，说明查找操作已经结束
						// 直接把本次查找的结果返回即可
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}

						// 如果选择符中还有选择符，说明查找需要继续。
						// 跳出结果集的查找，进而进行结果集的筛选
						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// 编译和执行过滤函数
	// Provide `match` to avoid retokenization(改组；改编；重新制定；整顿) if we modified the selector above
	// 如果我们在上面修改了选择符，在这里就要提供match(经过切割后的此法分析字符数组)
	// 以避免进行重组
	// 交由compile来生成一个称为终极匹配器
    // 通过这个匹配器过滤seed，把符合条件的结果放到results里边
    //
    //    //生成编译函数
    //  var superMatcher =   compile( selector, match )
    //
    //  //执行
    //    superMatcher(seed,context,!documentIsHTML,results,rsibling.test( selector ))
    //
	compile( selector, match )(
		seed, // 最初的结果集
		context, // 上下文
		!documentIsHTML, // 是否是XML文档
		results, // 最终的结果
		// 检查选择符中是否含有兄弟关系选择符
		// prev + next                   匹配所有紧接在 prev 元素后的相邻元素          元素集合
    	// prev ~ siblings               匹配 prev 元素之后的所有兄弟元素            元素集合
    	// prev + next 可以使用 .next() 代替，而 prev ~siblings 可以使用 nextAll() 代替。
		rsibling.test( selector ) // 选择符中是否还剩余(+或者~)两种选择符
	);
	return results;
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Initialize against the default document
setDocument();

// Support: Chrome<<14
// Always assume duplicates if they aren't passed to the comparison function
[0, 0].sort( sortOrder );
support.detectDuplicates = hasDuplicate;

// Support: IE<8
// Prevent attribute/property "interpolation"
assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild.getAttribute("href") !== "#" ) {
		var attrs = "type|href|height|width".split("|"),
			i = attrs.length;
		while ( i-- ) {
			Expr.attrHandle[ attrs[i] ] = interpolationHandler;
		}
	}
});

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
assert(function( div ) {
	if ( div.getAttribute("disabled") != null ) {
		var attrs = booleans.split("|"),
			i = attrs.length;
		while ( i-- ) {
			Expr.attrHandle[ attrs[i] ] = boolHandler;
		}
	}
});

// 在此处把sizzle内部的私有方法暴露给外界调用
// 暴露了5个方法和2个属性,通常情况下外部也很少直接使用
// 而是把这几个暴露的方法挂载到原型对象上进行调用。
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );

// jQuery.find = Sizzle;这句话表示Sizzle的构造函数暴漏给外界的jQuery.find方法，
// 使用jQuery.find方法调用的就是sizzle构造函数。在sizzle的构造函数里面首先会
// 判断是否能用现代浏览器支持的高级方法进行元素的查找，如果可以就直接使用
// 如果不行则使用引擎进行查找。即私有方法select方法。
// select方法首先在定义变量的时候就使用tokenize方法对选择符进行了词法分析
// 分析得到的选择符元素存储在match数组中，match数组是一个嵌套数组，第一层是
// 整体的选择符数组，就是以逗号分隔的选择符分隔出来的数组，一个逗号分割出来的
// 是两个选择符数组，则match为2，没有逗号分隔，match为1。图示为：
//               "div > p ~ input.aaron[type="checkbox"], #id:first-child"
//				 +++++++++++++++++++++++++++++++++++++++  +++++++++++++++
	// 		match				[0]								[1]
	// 每个数组对应的元素如下：	 |								 |					
	// ['div','>','p','input','.aaron','[type="checkbox"]']	['#id',':first-child']	
// 把选择符分隔以后进行查找。查找有两种方式，从左向右和从右向左。从效率角度考虑来说
// 从右向左的方式要高于从左向右，因为从树的叶子节点向上查找排除的效率要高于从根节点
// 向叶子节点查找的效率。而判断查找方向的依据就是选择符中是否含有伪类选择符。如果含有
// 伪类选择符，方向是从左向右的，如果没有则是sizzle默认的方法从右向左进行查找。
// 从右向左的查找是从最后一个选择符元素开始，从后向前的查找元素的类型是否为id,class或者tag
// 如果是三者中的任一种，通过原生的方法进行元素查找。查找出来的元素集合称之为seed种子集合
// 只要查找出来一个选择符元素，立即终止元素的查找。同时从选择符集合中排除进行查找的选择符
// 得到的种子集合与剩余的选择符通过compile编译函数进行筛选。
// compile方法首先进行构建一个巨大的闭包筛选器，返回一个curry化的入口函数。构建完成之后
// 传参调用，执行闭包筛选器。
/************************************************ 上面的都是sizzle的函数  *********************************************/

// 下面的是异步队列函数
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	// 第一次初始化的时候如果options对象里面没有数据，利用传递进来的参数使用空格进行分割后，
	// 填充到options对象中。
	jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 * 默认情况下回调队列充当事件回调队列，同时可以被触发多次
 *
 * Possible options: 参数选项
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *					确保回调队列仅仅只被触发一次
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *					持续保留前一个值，在执行完.fire()之后添加的任何回调函数，当再次遇到.fire()
 *					时，会将"最近一次"调用使用的参数作为此次调用的参数，立即调用最近添加的所有的函数
 *					，然后执行回调函数的列表(就像延迟对象一样)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *					保证一个回调函数植被添加一次(也就是在回调列表中没有重复的回调函数)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *					当回调函数返回false时，中断调用。
 *
 * jQuery.callbacks介绍
 * http://jquerydoc.duapp.com/jQuery.Callbacks.htm
 * 默认情况下，一个回调函数列表就像一个事件回调列表，可以被“调用”多次。
 */

jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	// 定义的都是私有变量，外界访问不到，给调试带来了很大的麻烦呀！
	// 调试的时候只能看到callback对象上一堆的方法，看不到变量呀！ 
	var // Last fire value (for non-forgettable lists)
		//默认值为false，表示此函数列表还没有触发过，一旦此函数列表触发过了，将有两种可能的情况：  
        //如果flags.once=true，那么memory=true，以后在fire时，一发现memory=true,将什么也不做  
        //如果flags.memory=true,那么memory=[context , args]  
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		// 如果是'once'的方式，stack为undefined，所以在执行完fire后，关闭list列表，不在提供回调触发
		//如果flags.once=true，那么当你调用fire时，而且这时上一轮的fire还没有执行完毕，这时候将会把 [context , args]入栈  
        //然后等上一次fire完结后，它会继续判断stack里边是否还有值，有的话会拿出[context , args]再次执行所有的函数列表  
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			// 如果该回调队列被设置为memory，则记录传递进来的data
			memory = options.memory && data;
			// 设置标记，表示已经触发了回调
			fired = true;
			// 记录已经触发过的位置，下次再继续调用从此位置开始调用。
			// 这样调用的就是未触发的回调
			firingIndex = firingStart || 0;
			firingStart = 0;
			// 触发的长度为回调列表的长度
			firingLength = list.length;
			// 表示正在触发回调
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				// 从回调队列里面取出回调函数进行调用
				//这是唯一处理flags.stopOnFalse的地方
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					// 阻止未来可能由于add所产生的回调
					//只要flags.stopOnFalse=true,并且函数返回了false，那么memory强制设为true,这时候flags.memory将会失去作用  
                    //因为flags.memory=true的作用就是 设置memory=[context , args]  
					memory = false; // To prevent further calls using add
					// 由于参数stopOnFalse为true，所以当有回调函数返回值为false时退出循环
					break;
				}
			}
			// 标记回调结束
			firing = false;
			// 如果列表存在
			//当触发执行完毕后，还要检查一下stack的情况，处理flags.once=false,并且调用了多次的fire()  
			if ( list ) {
				// 如果堆栈存在。如果是使用once方式，stack栈为undefined。
				// Deferred模块的延迟体现在这个地方，使用once和memory。
				// 因为是once，所以stack为undefined，跳过此处执行else if语句
				if ( stack ) {
					// 如果堆栈不为空
					if ( stack.length ) {
						// 从堆栈头部取出递归触发
						fire( stack.shift() );
					}
				// 否则，是否有记忆
				// 因为有memory特性，所以执行此处，清空list队列，但是保存了传递进来的参数
				// [context,arguments]数组
				} else if ( memory ) {
					// 列表清空
					list = [];
				// 否则阻止回调列表的回调
				// 既然已经触发过了,并且没有额外的控制，如没有设置flags.once=false,
				// 没有设置flags.memory=true,那么作废该 Callbacks吧
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					// 保存当前的长度是为了在add方法的else子句中自动调用fire方法提供
					// 触发的位置信息
					var start = list.length;
					//这里用了一个立即执行的add函数来添加回调
					//直接遍历传过来的arguments进行push
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							//如果所传参数为函数，则push
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							// 假如传过来的参数为数组或array-like，则继续调用添加，
							// 从这里可以看出add的传参可以有add(fn),add([fn1,fn2]),add(fn1,fn2)
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								// 递归添加回调函数
								add( arg );
							} 
							// 下面的三行是为了我方便调试加上的，就是为了测试在调用resolve方法的时候
							// 三个不同的回调队列分别发生了什么变化
							else {
								list["flag"] = arg;
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					// 我们是否把回调队列添加到正在批量触发中
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					// 如果是使用memory，如果我们没有触发它，在这里面会正确的调用
					// 这里的memory是在第一次触发回调队列是保存的调用参数
					// 也就是说在memory的回调队列中第一次触发以后，后面会自动触发添加的回调。
					} else if ( memory ) {
						// start是从列表的长度信息中提取出来的
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							// 从查找到的位置开始，向后删除一项
							list.splice( index, 1 );
							// Handle firing indexes
							//删除以后调整触发的位置以及长度信息
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			// 检查要添加的回调函数是否在回调列表中，如果没有指定参数，返回刘表是否有回调函数
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			// 从列表中清除所有的回调函数
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			// 禁用回调列表中的回调，禁用以后再也不能使用此回调队列
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			// 回调列表是否可用
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			// 可以自定义上下文及参数进行触发调用
			fireWith: function( context, args ) {
				args = args || [];
				args = [ context, args.slice ? args.slice() : args ];
				// 回调列表没有被触发的情况下，执行触发操作
				if ( list && ( !fired || stack ) ) {
					// 如果现在回调列表正在被触发进行回调函数的调用，把参数入栈，延迟调用
					if ( firing ) {
						stack.push( args );
					// 如果没有进行调用，直接触发回调
					} else {
						// 最终是调用内部的私有方法fire触发，
						// 参数为数组，第一项为执行上下文，后面的一项为调用参数
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			// 触发调用回调，作用是封装上下文及参数，调用fireWith方法
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};

/* jQuery中的Deferred对象详解
  * http://www.ruanyifeng.com/blog/2011/08/a_detailed_explanation_of_jquery_deferred_object.html
  * 在jquery中deferred对象有三种执行状态：未完成、已完成和已失败。
  * 如果执行状态是已完成(resolved)，deferred对象立刻调用done()方法指定的回调函数
  * 如果执行状态是已失败,deferred对象立刻调用fail方法指定的回调函数，
  * 如果执行状态是未完成，则继续等待或者调用progress()方法指定的回调函数(jquery1.7添加)。
  * 
  * 在执行ajax操作时，deferred对象会根据返回的结果自动改变自身的执行状态，但是在自定的
  * 延迟函数中，这个执行状态必须由程序员手动指定。resolve()方法是将deferred对象
  * 的执行状态从“未完成”改变为"已完成"，从而触发done(),于此同时还有一个reject()方法
  * 作用是将deferred对象的执行状态从“未完成”改为"已失败"，从而触发fail()方法
  *
  * deferred对象的状态可以从外部改变，所以jquery提供了deferred.promise()方法
  * 作用就是在原来的deferred对象上返回另一个deferred对象，后者只开放与改变状态
  * 无关的方法(例如done()方法和fail()方法),屏蔽与改变执行状态有关的方法(例如resolve()方法和reject())
  * 从而使得执行状态不能被改变
  */

jQuery.extend({

	/*
	 * 通过调用$.Deferred()方法创建的延迟对象中包含两个对象，一个是真实的延迟对象deferred
	 * 另一个就是阉割版的延迟对象promise对象。
	 */
	Deferred: function( func ) {
		// Deferred对象内部有三个回调函数队列，分别为resolve队列，reject队列和notify队列。
		// 其中resolve(已完成)对应的done方法只是把回调函数添加到resolve队列中去。
		// 而reject(已失败)对应的fail方法也只是把回调函数添加到reject队列中去
		// notify(未完成)也是同样的道理
		var tuples = [
				// action, add listener, listener list, final state
				// 动作、监听器、监听列表和最后的状态
				// 因为三个队列都是memory状态的队列，所以当把回调函数添加完成后，调用resolve方法/reject方法触发
				// 触发后的结果会保存在闭包的memory中，等到下次使用done/fail方法添加回调的时候，自动触发fire方法
				// 执行新添加到队列里的回调函数。其参数就是上次保存在memory中的参数。
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			// 状态为“正在处理中”
			state = "pending",
			// deferred对象的简化版
			promise = {
				state: function() {
					return state;
				},
				// 使用always方法为成功，失败状态添加同一个回调函数
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				// 调用then方法之后，返回的是已经把参数函数添加到各自的队列中的promise对象，只能添加不能触发
				// 正是因为then方法返回的是一个新的promise对象，这个promise对象中保存的是then方法中的回调执行的结果
				// 所以使得then方法的链式调用成为现实。
				/* http://www.cnblogs.com/aaronjs/p/3356505.html
				 * 例如
				 * var def = $.Deferred();                    then方法中的回调的挂载位置                结果保存
				 * def.then(function(value1) {                            def中                       then1的value1中
				 *		return value1 * 2; 
				 * }).then(function(value2) {                             then1中                     then2的value2中
				 * 		return value2*2;
				 * }).then(function(value3) {                             then2中                     then3的value3中
				 *      console.log(value3);
				 * });
				 *
				 * def.resolve(5); 等于是一个触发器，触发一连串的后续操作。
				 * 
				 */
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					// then方法返回的是局部新创建的一个Deferred对象,这个局部变量保存的是传递进来的函数执行后的结果
					// 也就是说then方法中你传递进来的函数执行后的结果被保存在了新创建的promise对象的memory中了
					// 而全局的deferred对象中保存的是传递进来的参数，如果要对传递进来的原始参数进行操作，
					// 可以使用手动创建的deferred对象。
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								// 此处的fns是通过闭包引用的参数arguments。
								// 遍历创建的三个函数队列，同时依次取出arguments队列里面对应的
								// 需要执行的函数进行执行。
								fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							// 依次遍历三个队列，执行其中的done、fail和progress方法。就是把传进来的参数
							// 即要执行的方法依次添加到对应的回调函数队列中去。resolve、reject和notify队列
							deferred[ tuple[1] ](function() {
								// 如果对应参数的三个函数都存在，依次执行方法。
								// 如果只含有其中的一个或者两个，也同样会吧匿名函数添加到对应的额队列中去。
								// 这里面的函数是在触发了resolve/reject方法后执行的。是在list队列的第四个函数
								var returned = fn && fn.apply( this, arguments );
								// 此处的newDefer对象时构造对象后传递进来的新构造的Deferred对象。
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									// 如果执行的结果还是deferred对象，就把相信创建的延迟对象挂载到返回
									// 的延迟对象的后面，实现先内后外的执行方式。
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									// 此处调用resolveWith方法触发的是通过上面的jQuery.Deferred(function(){})
									// 创建的一个新的deferred对象的方法。
									newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					// deferred.promise()方法返回只能添加回调的对象，这个对象与$.Deferred()返回的对象不同，
					// 只能done/fail/progress，不能resolve/reject/notify。即只能调用callbacks.add，
					// 没有callbacks.fire。它是正统Deferred对象的阉割版。
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				// 内部就是把延迟对象复制到obj对象中
				// 如果调用promise方法不适用参数，也就是把promise对象返回。仅仅是添加函数队列的方法
				// deferred对象中则包含了触发状态的各种方法。即promise对象值添加不改变状态
				// deferred对象可以改变状态

				// 在原来的deferred对象上返回另一个deferred对象，后者只开放与改变执行状态无关的方法
				//（比如done()方法和fail()方法），屏蔽与改变执行状态有关的方法（比如resolve()方法和reject()方法），
				// 从而使得执行状态不能被改变。

				// var d = $.Deferred()，与 var p = d.promise(); 这两者的区别主要就在于， 
				// d 包含了 resolve, resolveWith, reject 与 rejectWith 这四个方法。
				// 而这四个方法就是用来触发 done, fail, always 这些个回调函数的。
				// 之所以要返回 d.promise()： 一是因为 CommonJS promise/A 本来就应当是这样子的；
				// 二也是用来避免返回的对象能够主动地调用到resolve与reject这些关键性的方法。
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		// 构建三种状态对应的三个列表
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			// 三个列表的对应的done、fail和progress只是把回调添加到自己的回调列表中去
			// 在此处添加的三个方法：done、fail和progress
			promise[ tuple[1] ] = list.add;

			// Handle state
			// 处理状态
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					// 每个队列里面都含有一个状态，比如resolve队列的状态是resolved，reject队列的状态是rejected
					// 所以，当执行回调队列里面的回调函数时，首先第一步就是设置此延迟对象的状态state为对应队列的状态
					// 第二步就是调用相对队列的不可用函数，因为执行一个队列说明另一个队列就不会执行，所以要设置另一个队列
					// 不可用，第三步是锁定执行队列，其实也就是置空处理。然后紧接着就是执行用户自定义的回调函数
					state = stateString;

				/*
					异或运算 ^
					当两个值都是true时，异或结果为false;
					当两个值都是false时，异或结果也为false;
					只能其中一个值为true时，一个为false时，其结果才为true；典型的异性相吸，同性相斥
				*/
				// [ reject_list | resolve_list ].disable; progress_list.lock
				// 添加到各自队列中的三个函数分别为：
				// resolve队列的函数为:设置状态为已完成函数、设置reject队列不可用函数和progress队列锁住函数
				// reject队列的函数为:设置状态为已失败函数、设置resolve队列不可用函数和progress队列锁住函数
				// 即每个队列的函数为设置自己的状态和设置另外一个队列不可用
				// 所以disable的函数取得都是另外一个队列的函数。 
				// 比如第一个为resolve添加，第二个参数为tuples[ 0 ^ 1 = 1][2].disable = reject.disable,
				// 第二个为reject添加，第二个参数为tuples[1 ^ 1 = 0][2].disable = resolve.disable,
				// 每个队列内部都会含有三个内部函数，当执行的时候，首先执行内置的函数，执行完毕才会执行
				// 用户自定义的函数
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock , tuples[i][0]); // 最后一个参数tuples[i][0]是我自己添加的，方便调试
			}

			// deferred[ resolve | reject | notify ]
			// 组织封装上下文和参数，调用' 'With方法触发进行调用
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			// 直接调用回调队列的fireWith方法，可以传递自己的上下文与参数
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		// 代码执行到此处的时候。deferred对象已经组装完成了队列。
		// 包括三个队列的触发方法.
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},
	/*
	// Deferred helper
	// when方法保证多个异步操作全部成功后才回调
	// when，可以理解为deferred的一个中转站，比如我有一个函数，我要在这个函数执行完后再触发回调，
	// when就是做这样的工作，它需要这个函数返回deferred对象，然后返回的是deferred.promise对象，
	// 从而可以实现$.when(fn).done(fnDone)的链式操作，因为done其实也就是Callbacks.add，
	// 所以这里相当于fnDone这个回调push进回调数组，然后在所传的函数里面有一句resolve()
	// 或reject()执行一下回调数组，从而触发回调。就是这样。
    // PS:对于when我还有很多不明白，比如传多个函数，有人说要两个函数都resolve，才能执行done，
    // 但我测试回调的done或fail是以第一个函数为准的，也就是说如果它为resolve，
    // 那么回调会进入done，否则则进入fail，还有待观察
    // when方法中传递的参数一般都会当做回调函数的参数数组
    */
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});

jQuery.support = (function( support ) {
	var input = document.createElement("input"),
		fragment = document.createDocumentFragment(),
		div = document.createElement("div"),
		select = document.createElement("select"),
		opt = select.appendChild( document.createElement("option") );

	// Finish early in limited environments
	if ( !input.type ) {
		return support;
	}

	input.type = "checkbox";

	// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
	// Check the default checkbox/radio value ("" on old WebKit; "on" elsewhere)
	support.checkOn = input.value !== "";

	// Must access the parent to make an option select properly
	// Support: IE9, IE10
	support.optSelected = opt.selected;

	// Will be defined later
	support.reliableMarginRight = true;
	support.boxSizingReliable = true;
	support.pixelPosition = false;

	// Make sure checked status is properly cloned
	// Support: IE9, IE10
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Check if an input maintains its value after becoming a radio
	// Support: IE9, IE10
	input = document.createElement("input");
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "checked", "t" );
	input.setAttribute( "name", "t" );

	fragment.appendChild( input );

	// Support: Safari 5.1, Android 4.x, Android 2.3
	// old WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: Firefox, Chrome, Safari
	// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
	support.focusinBubbles = "onfocusin" in window;

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, marginDiv,
			// Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
			divReset = "padding:0;margin:0;border:0;display:block;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box",
			body = document.getElementsByTagName("body")[ 0 ];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

		// Check box-sizing and margin behavior.
		body.appendChild( container ).appendChild( div );
		div.innerHTML = "";
		// Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
		div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%";

		// Workaround failing boxSizing test due to offsetWidth returning wrong value
		// with some non-1 values of body zoom, ticket #13543
		jQuery.swap( body, body.style.zoom != null ? { zoom: 1 } : {}, function() {
			support.boxSizing = div.offsetWidth === 4;
		});

		// Use window.getComputedStyle because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Support: Android 2.3
			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. (#3333)
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = div.appendChild( document.createElement("div") );
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";

			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		body.removeChild( container );
	});

	return support;
})( {} );

/*
	Implementation Summary

	1. Enforce API surface and semantic compatibility with 1.9.x branch
	2. Improve the module's maintainability by reducing the storage
		paths to a single mechanism.
	3. Use the same single mechanism to support "private" and "user" data.
	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	5. Avoid exposing implementation details on user objects (eg. expando properties)
	6. Provide a clear path for implementation upgrade to WeakMap in 2014
*/
var data_user, data_priv,
	rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

function Data() {
	// Support: Android < 4,
	// Old WebKit does not have Object.preventExtensions/freeze method,
	// return new empty object instead with no [[set]] accessor
	Object.defineProperty( this.cache = {}, 0, {
		get: function() {
			return {};
		}
	});

	this.expando = jQuery.expando + Math.random();
}

Data.uid = 1;

Data.accepts = function( owner ) {
	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType ?
		owner.nodeType === 1 || owner.nodeType === 9 : true;
};

Data.prototype = {
	key: function( owner ) {
		// We can accept data for non-element nodes in modern browsers,
		// but we should not, see #8335.
		// Always return the key for a frozen object.
		if ( !Data.accepts( owner ) ) {
			return 0;
		}

		var descriptor = {},
			// Check if the owner object already has a cache key
			unlock = owner[ this.expando ];

		// If not, create one
		if ( !unlock ) {
			unlock = Data.uid++;

			// Secure it in a non-enumerable, non-writable property
			try {
				descriptor[ this.expando ] = { value: unlock };
				Object.defineProperties( owner, descriptor );

			// Support: Android < 4
			// Fallback to a less secure definition
			} catch ( e ) {
				descriptor[ this.expando ] = unlock;
				jQuery.extend( owner, descriptor );
			}
		}

		// Ensure the cache object
		if ( !this.cache[ unlock ] ) {
			this.cache[ unlock ] = {};
		}

		return unlock;
	},
	set: function( owner, data, value ) {
		var prop,
			// There may be an unlock assigned to this node,
			// if there is no entry for this "owner", create one inline
			// and set the unlock as though an owner entry had always existed
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		// Handle: [ owner, key, value ] args
		if ( typeof data === "string" ) {
			cache[ data ] = value;

		// Handle: [ owner, { properties } ] args
		} else {
			// Support an expectation from the old data system where plain
			// objects used to initialize would be set to the cache by
			// reference, instead of having properties and values copied.
			// Note, this will kill the connection between
			// "this.cache[ unlock ]" and "cache"
			if ( jQuery.isEmptyObject( cache ) ) {
				this.cache[ unlock ] = data;
			// Otherwise, copy the properties one-by-one to the cache object
			} else {
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
		}
	},
	get: function( owner, key ) {
		// Either a valid cache is found, or will be created.
		// New caches will be created and the unlock returned,
		// allowing direct access to the newly created
		// empty data object. A valid owner object must be provided.
		var cache = this.cache[ this.key( owner ) ];

		return key === undefined ?
			cache : cache[ key ];
	},
	access: function( owner, key, value ) {
		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				((key && typeof key === "string") && value === undefined) ) {
			return this.get( owner, key );
		}

		// [*]When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i, name,
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		if ( key === undefined ) {
			this.cache[ unlock ] = {};

		} else {
			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = key.concat( key.map( jQuery.camelCase ) );
			} else {
				// Try the string as a key before any manipulation
				if ( key in cache ) {
					name = [ key ];
				} else {
					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					name = jQuery.camelCase( key );
					name = name in cache ?
						[ name ] : ( name.match( core_rnotwhite ) || [] );
				}
			}

			i = name.length;
			while ( i-- ) {
				delete cache[ name[ i ] ];
			}
		}
	},
	hasData: function( owner ) {
		return !jQuery.isEmptyObject(
			this.cache[ owner[ this.expando ] ] || {}
		);
	},
	discard: function( owner ) {
		delete this.cache[ this.key( owner ) ];
	}
};

// These may be used throughout the jQuery core codebase
data_user = new Data();
data_priv = new Data();


jQuery.extend({
	acceptData: Data.accepts,

	hasData: function( elem ) {
		return data_user.hasData( elem ) || data_priv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return data_user.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		data_user.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to data_priv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return data_priv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		data_priv.remove( elem, name );
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var attrs, name,
			elem = this[ 0 ],
			i = 0,
			data = null;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = data_user.get( elem );

				if ( elem.nodeType === 1 && !data_priv.get( elem, "hasDataAttrs" ) ) {
					attrs = elem.attributes;
					for ( ; i < attrs.length; i++ ) {
						name = attrs[ i ].name;

						if ( name.indexOf( "data-" ) === 0 ) {
							name = jQuery.camelCase( name.substring(5) );
							dataAttr( elem, name, data[ name ] );
						}
					}
					data_priv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				data_user.set( this, key );
			});
		}

		return jQuery.access( this, function( value ) {
			var data,
				camelKey = jQuery.camelCase( key );

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {
				// Attempt to get data from the cache
				// with the key as-is
				data = data_user.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to get data from the cache
				// with the key camelized
				data = data_user.get( elem, camelKey );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, camelKey, undefined );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each(function() {
				// First, attempt to store a copy or reference of any
				// data that might've been store with a camelCased key.
				var data = data_user.get( this, camelKey );

				// For HTML5 data-* attribute interop, we have to
				// store property names with dashes in a camelCase form.
				// This might not apply to all properties...*
				data_user.set( this, camelKey, value );

				// *... In the case of properties that might _actually_
				// have dashes, we need to also store a copy of that
				// unchanged property.
				if ( key.indexOf("-") !== -1 && data !== undefined ) {
					data_user.set( this, key, value );
				}
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			data_user.remove( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? JSON.parse( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			data_user.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}
jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = data_priv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = data_priv.access( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		hooks.cur = fn;
		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return data_priv.get( elem, key ) || data_priv.access( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				data_priv.remove( elem, [ type + "queue", key ] );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while( i-- ) {
			tmp = data_priv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var nodeHook, boolHook,
	rclass = /[\t\r\n]/g,
	rreturn = /\r/g,
	rfocusable = /^(?:input|select|textarea|button)$/i;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each(function() {
			delete this[ jQuery.propFix[ name ] || name ];
		});
	},

	addClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}
					elem.className = jQuery.trim( cur );

				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = arguments.length === 0 || typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}
					elem.className = value ? jQuery.trim( cur ) : "";
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.match( core_rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			// Toggle whole class name
			} else if ( type === core_strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					data_priv.set( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : data_priv.get( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val,
				self = jQuery(this);

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// IE6-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];
					if ( (option.selected = jQuery.inArray( jQuery(option).val(), values ) >= 0) ) {
						optionSet = true;
					}
				}

				// force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attr: function( elem, name, value ) {
		var hooks, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === core_strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.boolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {
			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( core_rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.boolean.test( name ) ) {
					// Set corresponding property to false
					elem[ propName ] = false;
				}

				elem.removeAttribute( name );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
				ret :
				( elem[ name ] = value );

		} else {
			return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
				ret :
				elem[ name ];
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				return elem.hasAttribute( "tabindex" ) || rfocusable.test( elem.nodeName ) || elem.href ?
					elem.tabIndex :
					-1;
			}
		}
	}
});

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};
jQuery.each( jQuery.expr.match.boolean.source.match( /\w+/g ), function( i, name ) {
	var getter = jQuery.expr.attrHandle[ name ] || jQuery.find.attr;

	jQuery.expr.attrHandle[ name ] = function( elem, name, isXML ) {
		var fn = jQuery.expr.attrHandle[ name ],
			ret = isXML ?
				undefined :
				/* jshint eqeqeq: false */
				// Temporarily disable this handler to check existence
				(jQuery.expr.attrHandle[ name ] = undefined) !=
					getter( elem, name, isXML ) ?

					name.toLowerCase() :
					null;

		// Restore handler
		jQuery.expr.attrHandle[ name ] = fn;

		return ret;
	};
});

// Support: IE9+
// Selectedness for an option in an optgroup can be inaccurate
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		}
	};
}

jQuery.each([
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
});

// Radios and checkboxes getter/setter
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	};
	if ( !jQuery.support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			// Support: Webkit
			// "" is returned instead of "on" if a value isn't specified
			return elem.getAttribute("value") === null ? "on" : elem.value;
		};
	}
});
var rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.hasData( elem ) && data_priv.get( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;
			data_priv.remove( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = core_hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = core_hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( data_priv.get( cur, "events" ) || {} )[ event.type ] && data_priv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
				jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = core_slice.call( arguments ),
			handlers = ( data_priv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.disabled !== true || event.type !== "click" ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: Safari 6.0+, Chrome < 28
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle, false );
	}
};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && e.preventDefault ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && e.stopPropagation ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// Support: Chrome 15+
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// Create "bubbling" focus and blur events
// Support: Firefox, Chrome, Safari
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});
var isSimple = /^.[^:#\[\.,]*$/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	// jquery用来处理复杂的选择符的实例方法，调用sizzle选择器暴露给外部的接口jQuery.find静态方法
	// 如果是调用流程到了这里，说明是复杂选择符，选择出的元素通过pushStack方法包裹rootjQuery对象
	// 然后把新生成的jquery对象直接返回。在init的构造器中也是直接返回查询得到的包裹后的jquery对象
	find: function( selector ) {
		var self, matched, i,
			l = this.length;

		if ( typeof selector !== "string" ) {
			self = this;
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < l; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		matched = [];
		for ( i = 0; i < l; i++ ) {
			// 这里第二个参数是上下文对象，如果this对象中已经包含了一些元素，则遍历这些元素
			// 把每一个元素当做上下文进行选择符的查询。结果保存在第三个参数matched中。
			jQuery.find( selector, this[ i ], matched );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		// 如果有多个上下文元素，首先是排除查询的集合中的重复项，然后进行一个入栈操作。
		matched = this.pushStack( l > 1 ? jQuery.unique( matched ) : matched );
		matched.selector = ( this.selector ? this.selector + " " : "" ) + selector;
		return matched;
	},

	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter(function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector || [], true) );
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector || [], false) );
	},

	is: function( selector ) {
		return !!selector && (
			typeof selector === "string" ?
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				rneedsContext.test( selector ) ?
					jQuery( selector, this.context ).index( this[ 0 ] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = ( rneedsContext.test( selectors ) || typeof selectors !== "string" ) ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
				// Always skip document fragments
				if ( cur.nodeType < 11 && (pos ?
					pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector(cur, selectors)) ) {

					cur = matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return core_indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return core_indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( jQuery.unique(all) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

function sibling( cur, dir ) {
	while ( (cur = cur[dir]) && cur.nodeType !== 1 ) {}

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {
			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.unique( matched );
			}

			// Reverse order for parents* and prev*
			if ( name[ 0 ] === "p" ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		var elem = elems[ 0 ];

		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 && elem.nodeType === 1 ?
			jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
			jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
				return elem.nodeType === 1;
			}));
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( (elem = elem[ dir ]) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		});

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		});

	}

	if ( typeof qualifier === "string" ) {
		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( core_indexOf.call( qualifier, elem ) >= 0 ) !== not;
	});
}
var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	// 有些标签是需要嵌套在其他标签之内的插入到文档中才算完整的标签
	// 比如td标签，必须放在table->tbody->tr之后才算是完成的标签，所以外层要嵌套三个标签
	wrapMap = {

		// Support: IE 9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],

		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		// 默认的标签是不在外层嵌套任何标签的。深度为零，标签为空。
		_default: [ 0, "", "" ]
	};

// Support: IE 9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.col = wrapMap.thead;
wrapMap.th = wrapMap.td;

jQuery.fn.extend({
	text: function( value ) {
		return jQuery.access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[ 0 ] && this[ 0 ].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	append: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		var elem,
			elems = selector ? jQuery.filter( selector, this ) : this,
			i = 0;

		for ( ; (elem = elems[i]) != null; i++ ) {
			if ( !keepData && elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem ) );
			}

			if ( elem.parentNode ) {
				if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
					setGlobalEval( getAll( elem, "script" ) );
				}
				elem.parentNode.removeChild( elem );
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return jQuery.access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var
			// Snapshot the DOM in case .domManip sweeps something relevant into its fragment
			args = jQuery.map( this, function( elem ) {
				return [ elem.nextSibling, elem.parentNode ];
			}),
			i = 0;

		// Make the changes, replacing each context element with the new content
		this.domManip( arguments, function( elem ) {
			var next = args[ i++ ],
				parent = args[ i++ ];

			if ( parent ) {
				jQuery( this ).remove();
				parent.insertBefore( elem, next );
			}
		// Allow new content to include elements from the context set
		}, true );

		// Force removal if there was no new content (e.g., from empty arguments)
		return i ? this : this.remove();
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, callback, allowIntersection ) {

		// Flatten any nested arrays
		args = core_concat.apply( [], args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction || !( l <= 1 || typeof value !== "string" || jQuery.support.checkClone || !rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				self.domManip( args, callback, allowIntersection );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, !allowIntersection && this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							// Support: QtWebKit
							// jQuery.merge because core_push.apply(_, arraylike) throws
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( this[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!data_priv.access( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Hope ajax is available...
								jQuery._evalUrl( node.src );
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}

		return this;
	}
});

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: QtWebKit
			// .get() because core_push.apply(_, arraylike) throws
			core_push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Support: IE >= 9
		// Fix Cloning issues
		if ( !jQuery.support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) && !jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	// 第一个参数接受的是一个数组，这样方法的适用性就变得很强了，不仅仅可以适用于单个文档元素的构建
	// 同时还可以来构建很多个这样的字符串。前提是多个要转换的字符串必须要以数组的形式传递进来。
	// 参数：elems表示标签字符串，context表示上下文，scripts表示是否省略script标签的解析
	// 创建文档片段分为两步，第一步是使用fragment当做一个中间件，使用它的innerHTML属性把html字符串
	// 转化为节点元素，然后再进行修正提取，存放到节点元素数组nodes中。第一步的最后是清理文档片段，
	// 还原到初识状态。第二步是把转化后的节点元素添加到文档片段中，然后再处理script标签问题。
	// 最后添加完毕后，返回文档片段。
	buildFragment: function( elems, context, scripts, selection ) {
		var elem, tmp, tag, wrap, contains, j,
			i = 0,
			l = elems.length,
			fragment = context.createDocumentFragment(),
			nodes = [];

		// 循环检测要添加的元素集合，分三种情况进行处理，
		// 把要处理的数组转化成节点元素数组
		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				// 如果是jquery对象，直接把对象缓存到nodes数组中
				if ( jQuery.type( elem ) === "object" ) {
					// Support: QtWebKit
					// jQuery.merge because core_push.apply(_, arraylike) throws
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				// 如果没有html标签在字符串中，文本类型的直接生成一个文本节点
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				// 把html字符串转化为DOM节点
				// 将HTML代码赋值给一个DIV元素的innerHTML属性，然后取DIV元素的子元素，即可得到转换后的DOM元素
				} else {
					// 创建了一个临时的tmp元素（div），这样调用innerHTML方法，
					// 用来储存创建的节点的内容，fragment本身只是起到一个容器的作用
					// https://developer.mozilla.org/zh-CN/docs/DOM/Node.appendChild
					// appendChild 方法会把要插入的这个节点引用作为返回值返回.
					tmp = tmp || fragment.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					// rtagName匹配标签里的元素名称，匹配的数组有两部分
					// [匹配的整个字符串(<div、<b等不包括右边尖括号)，
					// 匹配的第一个分组,是第一个匹配字符串里的标签名(div、b等)]
					// tag就是取出第一个匹配子分组里的标签名。
					tag = ( rtagName.exec( elem ) || ["", ""] )[ 1 ].toLowerCase();
					// 这里的wrapMap对象是为了处理嵌套标签的，如果有嵌套标签，取出对应的标签的数组
					// 数组的第二项添加到
					wrap = wrapMap[ tag ] || wrapMap._default;
					// 修正所有浏览器中的XHTML样式的标签
					// replace标签时为了将自闭和标签替换为成对的标签。如<div/>替换成<div></div>
					// 子关闭标签指的是没有对应的关闭标签，而只是在标签名后添加一个"/"来标示。
					// $1、$2分别表示对应的正则rxhtmlTag的第一个分组和第二个分组
					// 如果有多个标签，直接使用innerHTML属性插入到元素中。即可变成DOM元素
					// rxhtmlTag = <(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/
					// 首先过滤掉不需要修正的标签：area|br|col|embed|hr|img|input|link|meta|param
					// (?!p)表示反前向声明，要求接下来的字符不与模式p进行匹配。如果字符串中出现这些标签
					// 不做任何处理。
					// 然后是嵌套的分组，(([\w:]+)[^>]*)
					// 首先看第一个分组，(([\w:]+)[^>]*)，从左边数第一个圆括号所包括的所有字符
					// 匹配“<>”中间所有的字符，是为分组1，即$1,
					// 然后是第二个分组，([\w:]+) ，从左边数第二个圆括号里的字符
					// 匹配值匹配标签名称，因为空格不匹配\w,所以是以空格或者>为结束的
					// 所以replace方法的模式替换方式为把匹配出来的分组中的分组1，即尖括号中的所有字符串
					// 都放到第一个$1的位置，而仅仅只把标签名称放到$2的位置，这样就完成了
					// 子关闭标签的修正过程。返回的结果为修正完成标签。
					// 如果是嵌套标签，再在两边添加上需要嵌套的标签
					// 直接使用innerHTML属性插入到元素中。即可变成DOM元素
					tmp.innerHTML = wrap[ 1 ] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					// wrapMap对象取出来的一项的内容如：[3,'<table><tbody><tr>','</table>','</tbody>','<//tr>']
					// 第一项是一个数字，标签要插入的元素在完整的标签里的深度，第二项和第三项分别表示
					// 要添加在外层的左右标签
					// 所以要从组成的标签中一层一层的剥离出我们想要转化的DOM节点元素。
					j = wrap[ 0 ];
					// 为了修正标签的嵌套问题，添加了外层标签，但是需要的仅仅是我们添加的元素节点
					// 所以此处要把转化成节点元素的标签从嵌套的层级中提取出来。但是只提取到标签元素的上一级
					// 比如添加的是<td>1111</td>,那么经过修正后的标签为<table><tbody><tr><td>111</td></tr></tbody></table>
					// 整个的文档片段的标签层次为<div><table><tbody><tr><td>111</td></tr></tbody></table></div>,
					// 嵌套深度为3，即提取结束以后tmp为<tr><td>111</td></tr>，因为tmp引用的是fragment，所以tmp与fragment
					// 引用的内容相同。
					while ( j-- ) {
						tmp = tmp.firstChild;
					}

					// Support: QtWebKit
					// jQuery.merge because core_push.apply(_, arraylike) throws
					// 因为最外层还有一个div标签，虽然通过元素深度去除了外层包裹的元素，但是
					// 最开始创建的div标签也算是，所以这里取得是子节点的集合childNodes.
					// 是一个类数组的nodeList
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					// 保存顶级容器div元素节点，因为已经添加修正元素节点，所以fragment中还是包含这些元素
					tmp = fragment.firstChild;

					// Fixes #12346
					// Support: Webkit, IE
					// 因为fragment现在还不确定是最终的，因为node可能还有其他的节点
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		// 清除为了准备工作而添加到文档片段中的节点元素，
		// 把文档片段中的所有子节点元素全部清除。
		// 已便下面真正的元素节点添加工作。
		fragment.textContent = "";

		i = 0;
		// 此处进行处理后的元素节点添加
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			// 
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			// 检测元素节点是否在文档对象中。
			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			// 把节点元素添加到文档片段中，并且检查被添加的元素中是否包含script标签，
			// 如果包含script标签，并把标签中的内容提取出来
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				// 缓存数组系统缓存标签内容
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			l = elems.length,
			i = 0,
			special = jQuery.event.special;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( jQuery.acceptData( elem ) ) {

				data = data_priv.access( elem );

				if ( data ) {
					for ( type in data.events ) {
						if ( special[ type ] ) {
							jQuery.event.remove( elem, type );

						// This is a shortcut to avoid jQuery.event.remove's overhead
						} else {
							jQuery.removeEvent( elem, type, data.handle );
						}
					}
				}
			}
			// Discard any remaining `private` and `user` data
			// One day we'll replace the dual arrays with a WeakMap and this won't be an issue.
			// (Splices the data objects out of the internal cache arrays)
			data_user.discard( elem );
			data_priv.discard( elem );
		}
	},

	_evalUrl: function( url ) {
		return jQuery.ajax({
			url: url,
			type: "GET",
			dataType: "text",
			async: false,
			global: false,
			success: jQuery.globalEval
		});
	}
});

// Support: 1.x compatibility
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType === 1 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName("tbody")[0] ||
			elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );

	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute("type");
	}

	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var l = elems.length,
		i = 0;

	for ( ; i < l; i++ ) {
		data_priv.set(
			elems[ i ], "globalEval", !refElements || data_priv.get( refElements[ i ], "globalEval" )
		);
	}
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( data_priv.hasData( src ) ) {
		pdataOld = data_priv.access( src );
		pdataCur = jQuery.extend( {}, pdataOld );
		events = pdataOld.events;

		data_priv.set( dest, pdataCur );

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( data_user.hasData( src ) ) {
		udataOld = data_user.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		data_user.set( dest, udataCur );
	}
}


function getAll( context, tag ) {
	var ret = context.getElementsByTagName ? context.getElementsByTagName( tag || "*" ) :
			context.querySelectorAll ? context.querySelectorAll( tag || "*" ) :
			[];

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], ret ) :
		ret;
}

// Support: IE >= 9
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && manipulation_rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}
jQuery.fn.extend({
	wrapAll: function( html ) {
		var wrap;

		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapAll( html.call(this, i) );
			});
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	}
});
var curCSS, iframe,
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rmargin = /^margin/,
	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + core_pnum + ")", "i" ),
	elemdisplay = { BODY: "block" },

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function isHidden( elem, el ) {
	// isHidden might be called from jQuery#filter function;
	// in that case, element will be second argument
	elem = el || elem;
	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

// NOTE: we've included the "window" in window.getComputedStyle
// because jsdom on node.js will break without it.
function getStyles( elem ) {
	return window.getComputedStyle( elem, null );
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = data_priv.get( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = data_priv.access( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
			}
		} else {

			if ( !values[ index ] ) {
				hidden = isHidden( elem );

				if ( display && display !== "none" || !hidden ) {
					data_priv.set( elem, "olddisplay", hidden ? display : jQuery.css(elem, "display") );
				}
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.fn.extend({
	css: function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		var bool = typeof state === "boolean";

		return this.each(function() {
			if ( bool ? state : isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": "cssFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Fixes #8908, it can be done more correctly by specifying setters in cssHooks,
			// but it would mean to define eight (for every problematic property) identical functions
			if ( !jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
				style[ name ] = value;
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	}
});

curCSS = function( elem, name, _computed ) {
	var width, minWidth, maxWidth,
		computed = _computed || getStyles( elem ),

		// Support: IE9
		// getPropertyValue is only needed for .css('filter') in IE9, see #12537
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
		style = elem.style;

	if ( computed ) {

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// Support: Safari 5.1
		// A tribute to the "awesome hack by Dean Edwards"
		// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
		// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
		if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret;
};


function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {
			// Use the already-created iframe if possible
			iframe = ( iframe ||
				jQuery("<iframe frameborder='0' width='0' height='0'/>")
				.css( "cssText", "display:block !important" )
			).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[0].contentWindow || iframe[0].contentDocument ).document;
			doc.write("<!doctype html><html><body>");
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}

// Called ONLY from within css_defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
		display = jQuery.css( elem[0], "display" );
	elem.remove();
	return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
	// Support: Android 2.3
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				if ( computed ) {
					// Support: Android 2.3
					// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
					// Work around by temporarily setting element display to inline-block
					return jQuery.swap( elem, { "display": "inline-block" },
						curCSS, [ elem, "marginRight" ] );
				}
			}
		};
	}

	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = {
				get: function( elem, computed ) {
					if ( computed ) {
						computed = curCSS( elem, prop );
						// if curCSS returns percentage, fallback to offset
						return rnumnonpx.test( computed ) ?
							jQuery( elem ).position()[ prop ] + "px" :
							computed;
					}
				}
			};
		});
	}

});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});
var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function(){
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function(){
			var type = this.type;
			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !manipulation_rcheckableType.test( type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}
jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.extend({
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	}
});
var
	// Document location
	ajaxLocParts,
	ajaxLocation,

	ajax_nonce = jQuery.now(),

	ajax_rquery = /\?/,
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( core_rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ){
	jQuery.fn[ type ] = function( fn ){
		return this.on( type, fn );
	};
});

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,
			// URL without anti-cache param
			cacheURL,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( core_rnotwhite ) || [""];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + ajax_nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ajax_nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

		// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}
// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {
	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery("<script>").prop({
					async: true,
					charset: s.scriptCharset,
					src: s.url
				}).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});
var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( ajax_nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( ajax_rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});
jQuery.ajaxSettings.xhr = function() {
	try {
		return new XMLHttpRequest();
	} catch( e ) {}
};

var xhrSupported = jQuery.ajaxSettings.xhr(),
	xhrSuccessStatus = {
		// file protocol always yields status code 0, assume 200
		0: 200,
		// Support: IE9
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	// Support: IE9
	// We need to keep track of outbound xhr and abort them manually
	// because IE is not smart enough to do it all by itself
	xhrId = 0,
	xhrCallbacks = {};

if ( window.ActiveXObject ) {
	jQuery( window ).on( "unload", function() {
		for( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]();
		}
		xhrCallbacks = undefined;
	});
}

jQuery.support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
jQuery.support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport(function( options ) {
	var callback;
	// Cross domain only allowed if supported through XMLHttpRequest
	if ( jQuery.support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i, id,
					xhr = options.xhr();
				xhr.open( options.type, options.url, options.async, options.username, options.password );
				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}
				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}
				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers["X-Requested-With"] ) {
					headers["X-Requested-With"] = "XMLHttpRequest";
				}
				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}
				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							delete xhrCallbacks[ id ];
							callback = xhr.onload = xhr.onerror = null;
							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {
								complete(
									// file protocol always yields status 0, assume 404
									xhr.status || 404,
									xhr.statusText
								);
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,
									// Support: IE9
									// #11426: When requesting binary data, IE9 will throw an exception
									// on any attempt to access responseText
									typeof xhr.responseText === "string" ? {
										text: xhr.responseText
									} : undefined,
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};
				// Listen to events
				xhr.onload = callback();
				xhr.onerror = callback("error");
				// Create the abort callback
				callback = xhrCallbacks[( id = xhrId++ )] = callback("abort");
				// Do send the request
				// This may raise an exception which is actually
				// handled in jQuery.ajax (so no try/catch here)
				xhr.send( options.hasContent && options.data || null );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});
var fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [function( prop, value ) {
			var end, unit,
				tween = this.createTween( prop, value ),
				parts = rfxnum.exec( value ),
				target = tween.cur(),
				start = +target || 0,
				scale = 1,
				maxIterations = 20;

			if ( parts ) {
				end = +parts[2];
				unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

				// We need to compute starting value
				if ( unit !== "px" && start ) {
					// Iteratively approximate from a nonzero starting point
					// Prefer the current property, because this process will be trivial if it uses the same units
					// Fallback to end or a simple constant
					start = jQuery.css( tween.elem, prop, true ) || end || 1;

					do {
						// If previous iteration zeroed out, double until we get *something*
						// Use a string for doubling factor so we don't accidentally see scale as unchanged below
						scale = scale || ".5";

						// Adjust and apply
						start = start / scale;
						jQuery.style( tween.elem, prop, start + unit );

					// Update scale, tolerating zero or NaN from tween.cur()
					// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
					} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
				}

				tween.unit = unit;
				tween.start = start;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
			}
			return tween;
		}]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
	jQuery.each( props, function( prop, value ) {
		var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( collection[ index ].call( animation, prop, value ) ) {

				// we're done with this property
				return;
			}
		}
	});
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	createTweens( animation, props );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var index, prop, value, length, dataShow, toggle, tween, hooks, oldfire,
		anim = this,
		style = elem.style,
		orig = {},
		handled = [],
		hidden = elem.nodeType && isHidden( elem );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE9-10 do not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		if ( jQuery.css( elem, "display" ) === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			style.display = "inline-block";
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always(function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		});
	}


	// show/hide pass
	dataShow = data_priv.get( elem, "fxshow" );
	for ( index in props ) {
		value = props[ index ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ index ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
				if( value === "show" && dataShow !== undefined && dataShow[ index ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			handled.push( index );
		}
	}

	length = handled.length;
	if ( length ) {
		dataShow = data_priv.get( elem, "fxshow" ) || data_priv.access( elem, "fxshow", {} );
		if ( "hidden" in dataShow ) {
			hidden = dataShow.hidden;
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;

			data_priv.remove( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( index = 0 ; index < length ; index++ ) {
			prop = handled[ index ];
			tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
			orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );
				doAnimation.finish = function() {
					anim.stop( true );
				};
				// Empty animations, or finishing resolves immediately
				if ( empty || data_priv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = data_priv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = data_priv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.cur && hooks.cur.finish ) {
				hooks.cur.finish.call( this );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		});
	}
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth? 1 : 0;
	for( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	}
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	if ( timer() && jQuery.timers.push( timer ) ) {
		jQuery.fx.start();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}
jQuery.fn.offset = function( options ) {
	if ( arguments.length ) {
		return options === undefined ?
			this :
			this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
	}

	var docElem, win,
		elem = this[ 0 ],
		box = { top: 0, left: 0 },
		doc = elem && elem.ownerDocument;

	if ( !doc ) {
		return;
	}

	docElem = doc.documentElement;

	// Make sure it's not a disconnected DOM node
	if ( !jQuery.contains( docElem, elem ) ) {
		return box;
	}

	// If we don't have gBCR, just use 0,0 rather than error
	// BlackBerry 5, iOS 3 (original iPhone)
	if ( typeof elem.getBoundingClientRect !== core_strundefined ) {
		box = elem.getBoundingClientRect();
	}
	win = getWindow( doc );
	return {
		top: box.top + win.pageYOffset - docElem.clientTop,
		left: box.left + win.pageXOffset - docElem.clientLeft
	};
};

jQuery.offset = {

	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) && ( curCSSTop + curCSSLeft ).indexOf("auto") > -1;

		// Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// We assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();

		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || docElem;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position") === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || docElem;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : window.pageXOffset,
					top ? val : window.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Limit scope pollution from any deprecated API
// (function() {

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;

// })();
if ( typeof module === "object" && typeof module.exports === "object" ) {
	// Expose jQuery as module.exports in loaders that implement the Node
	// module pattern (including browserify). Do not create the global, since
	// the user will be storing it themselves locally, and globals are frowned
	// upon in the Node module world.
	module.exports = jQuery;
} else {
	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.
	if ( typeof define === "function" && define.amd ) {
		define( "jquery", [], function () { return jQuery; } );
	}
}

// If there is a window object, that at least has a document property,
// define jQuery and $ identifiers
if ( typeof window === "object" && typeof window.document === "object" ) {
	window.jQuery = window.$ = jQuery;
}

})( window );
