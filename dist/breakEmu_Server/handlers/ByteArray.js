"use strict";function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o;}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o;},_typeof(o);}Object.defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _iconvLite=require("iconv-lite");var _zlib=require("zlib");var _amf0Ts=require("amf0-ts");var _amf3Ts=require("amf3-ts");var _lzmaNative=require("lzma-native");var _Symbol$toStringTag;function _slicedToArray(arr,i){return _arrayWithHoles(arr)||_iterableToArrayLimit(arr,i)||_unsupportedIterableToArray(arr,i)||_nonIterableRest();}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o,minLen){if(!o)return;if(typeof o==="string")return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);if(n==="Object"&&o.constructor)n=o.constructor.name;if(n==="Map"||n==="Set")return Array.from(o);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return _arrayLikeToArray(o,minLen);}function _arrayLikeToArray(arr,len){if(len==null||len>arr.length)len=arr.length;for(var i=0,arr2=new Array(len);i<len;i++)arr2[i]=arr[i];return arr2;}function _iterableToArrayLimit(r,l){var t=null==r?null:"undefined"!=typeof Symbol&&r[Symbol.iterator]||r["@@iterator"];if(null!=t){var e,n,i,u,a=[],f=!0,o=!1;try{if(i=(t=t.call(r)).next,0===l){if(Object(t)!==t)return;f=!1;}else for(;!(f=(e=i.call(t)).done)&&(a.push(e.value),a.length!==l);f=!0);}catch(r){o=!0,n=r;}finally{try{if(!f&&null!=t["return"]&&(u=t["return"](),Object(u)!==u))return;}finally{if(o)throw n;}}return a;}}function _arrayWithHoles(arr){if(Array.isArray(arr))return arr;}function _regeneratorRuntime(){"use strict";/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */_regeneratorRuntime=function _regeneratorRuntime(){return e;};var t,e={},r=Object.prototype,n=r.hasOwnProperty,o=Object.defineProperty||function(t,e,r){t[e]=r.value;},i="function"==typeof Symbol?Symbol:{},a=i.iterator||"@@iterator",c=i.asyncIterator||"@@asyncIterator",u=i.toStringTag||"@@toStringTag";function define(t,e,r){return Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}),t[e];}try{define({},"");}catch(t){define=function define(t,e,r){return t[e]=r;};}function wrap(t,e,r,n){var i=e&&e.prototype instanceof Generator?e:Generator,a=Object.create(i.prototype),c=new Context(n||[]);return o(a,"_invoke",{value:makeInvokeMethod(t,r,c)}),a;}function tryCatch(t,e,r){try{return{type:"normal",arg:t.call(e,r)};}catch(t){return{type:"throw",arg:t};}}e.wrap=wrap;var h="suspendedStart",l="suspendedYield",f="executing",s="completed",y={};function Generator(){}function GeneratorFunction(){}function GeneratorFunctionPrototype(){}var p={};define(p,a,function(){return this;});var d=Object.getPrototypeOf,v=d&&d(d(values([])));v&&v!==r&&n.call(v,a)&&(p=v);var g=GeneratorFunctionPrototype.prototype=Generator.prototype=Object.create(p);function defineIteratorMethods(t){["next","throw","return"].forEach(function(e){define(t,e,function(t){return this._invoke(e,t);});});}function AsyncIterator(t,e){function invoke(r,o,i,a){var c=tryCatch(t[r],t,o);if("throw"!==c.type){var u=c.arg,h=u.value;return h&&"object"==_typeof(h)&&n.call(h,"__await")?e.resolve(h.__await).then(function(t){invoke("next",t,i,a);},function(t){invoke("throw",t,i,a);}):e.resolve(h).then(function(t){u.value=t,i(u);},function(t){return invoke("throw",t,i,a);});}a(c.arg);}var r;o(this,"_invoke",{value:function value(t,n){function callInvokeWithMethodAndArg(){return new e(function(e,r){invoke(t,n,e,r);});}return r=r?r.then(callInvokeWithMethodAndArg,callInvokeWithMethodAndArg):callInvokeWithMethodAndArg();}});}function makeInvokeMethod(e,r,n){var o=h;return function(i,a){if(o===f)throw new Error("Generator is already running");if(o===s){if("throw"===i)throw a;return{value:t,done:!0};}for(n.method=i,n.arg=a;;){var c=n.delegate;if(c){var u=maybeInvokeDelegate(c,n);if(u){if(u===y)continue;return u;}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if(o===h)throw o=s,n.arg;n.dispatchException(n.arg);}else"return"===n.method&&n.abrupt("return",n.arg);o=f;var p=tryCatch(e,r,n);if("normal"===p.type){if(o=n.done?s:l,p.arg===y)continue;return{value:p.arg,done:n.done};}"throw"===p.type&&(o=s,n.method="throw",n.arg=p.arg);}};}function maybeInvokeDelegate(e,r){var n=r.method,o=e.iterator[n];if(o===t)return r.delegate=null,"throw"===n&&e.iterator["return"]&&(r.method="return",r.arg=t,maybeInvokeDelegate(e,r),"throw"===r.method)||"return"!==n&&(r.method="throw",r.arg=new TypeError("The iterator does not provide a '"+n+"' method")),y;var i=tryCatch(o,e.iterator,r.arg);if("throw"===i.type)return r.method="throw",r.arg=i.arg,r.delegate=null,y;var a=i.arg;return a?a.done?(r[e.resultName]=a.value,r.next=e.nextLoc,"return"!==r.method&&(r.method="next",r.arg=t),r.delegate=null,y):a:(r.method="throw",r.arg=new TypeError("iterator result is not an object"),r.delegate=null,y);}function pushTryEntry(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e);}function resetTryEntry(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e;}function Context(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(pushTryEntry,this),this.reset(!0);}function values(e){if(e||""===e){var r=e[a];if(r)return r.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var o=-1,i=function next(){for(;++o<e.length;)if(n.call(e,o))return next.value=e[o],next.done=!1,next;return next.value=t,next.done=!0,next;};return i.next=i;}}throw new TypeError(_typeof(e)+" is not iterable");}return GeneratorFunction.prototype=GeneratorFunctionPrototype,o(g,"constructor",{value:GeneratorFunctionPrototype,configurable:!0}),o(GeneratorFunctionPrototype,"constructor",{value:GeneratorFunction,configurable:!0}),GeneratorFunction.displayName=define(GeneratorFunctionPrototype,u,"GeneratorFunction"),e.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===GeneratorFunction||"GeneratorFunction"===(e.displayName||e.name));},e.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,GeneratorFunctionPrototype):(t.__proto__=GeneratorFunctionPrototype,define(t,u,"GeneratorFunction")),t.prototype=Object.create(g),t;},e.awrap=function(t){return{__await:t};},defineIteratorMethods(AsyncIterator.prototype),define(AsyncIterator.prototype,c,function(){return this;}),e.AsyncIterator=AsyncIterator,e.async=function(t,r,n,o,i){void 0===i&&(i=Promise);var a=new AsyncIterator(wrap(t,r,n,o),i);return e.isGeneratorFunction(r)?a:a.next().then(function(t){return t.done?t.value:a.next();});},defineIteratorMethods(g),define(g,u,"Generator"),define(g,a,function(){return this;}),define(g,"toString",function(){return"[object Generator]";}),e.keys=function(t){var e=Object(t),r=[];for(var n in e)r.push(n);return r.reverse(),function next(){for(;r.length;){var t=r.pop();if(t in e)return next.value=t,next.done=!1,next;}return next.done=!0,next;};},e.values=values,Context.prototype={constructor:Context,reset:function reset(e){if(this.prev=0,this.next=0,this.sent=this._sent=t,this.done=!1,this.delegate=null,this.method="next",this.arg=t,this.tryEntries.forEach(resetTryEntry),!e)for(var r in this)"t"===r.charAt(0)&&n.call(this,r)&&!isNaN(+r.slice(1))&&(this[r]=t);},stop:function stop(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval;},dispatchException:function dispatchException(e){if(this.done)throw e;var r=this;function handle(n,o){return a.type="throw",a.arg=e,r.next=n,o&&(r.method="next",r.arg=t),!!o;}for(var o=this.tryEntries.length-1;o>=0;--o){var i=this.tryEntries[o],a=i.completion;if("root"===i.tryLoc)return handle("end");if(i.tryLoc<=this.prev){var c=n.call(i,"catchLoc"),u=n.call(i,"finallyLoc");if(c&&u){if(this.prev<i.catchLoc)return handle(i.catchLoc,!0);if(this.prev<i.finallyLoc)return handle(i.finallyLoc);}else if(c){if(this.prev<i.catchLoc)return handle(i.catchLoc,!0);}else{if(!u)throw new Error("try statement without catch or finally");if(this.prev<i.finallyLoc)return handle(i.finallyLoc);}}}},abrupt:function abrupt(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r];if(o.tryLoc<=this.prev&&n.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break;}}i&&("break"===t||"continue"===t)&&i.tryLoc<=e&&e<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=t,a.arg=e,i?(this.method="next",this.next=i.finallyLoc,y):this.complete(a);},complete:function complete(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),y;},finish:function finish(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),resetTryEntry(r),y;}},"catch":function _catch(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;resetTryEntry(r);}return o;}}throw new Error("illegal catch attempt");},delegateYield:function delegateYield(e,r,n){return this.delegate={iterator:values(e),resultName:r,nextLoc:n},"next"===this.method&&(this.arg=t),y;}},e;}function asyncGeneratorStep(gen,resolve,reject,_next,_throw,key,arg){try{var info=gen[key](arg);var value=info.value;}catch(error){reject(error);return;}if(info.done){resolve(value);}else{Promise.resolve(value).then(_next,_throw);}}function _asyncToGenerator(fn){return function(){var self=this,args=arguments;return new Promise(function(resolve,reject){var gen=fn.apply(self,args);function _next(value){asyncGeneratorStep(gen,resolve,reject,_next,_throw,"next",value);}function _throw(err){asyncGeneratorStep(gen,resolve,reject,_next,_throw,"throw",err);}_next(undefined);});};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,_toPropertyKey(descriptor.key),descriptor);}}function _createClass(Constructor,protoProps,staticProps){if(protoProps)_defineProperties(Constructor.prototype,protoProps);if(staticProps)_defineProperties(Constructor,staticProps);Object.defineProperty(Constructor,"prototype",{writable:false});return Constructor;}function _classPrivateMethodInitSpec(obj,privateSet){_checkPrivateRedeclaration(obj,privateSet);privateSet.add(obj);}function _classPrivateFieldInitSpec(obj,privateMap,value){_checkPrivateRedeclaration(obj,privateMap);privateMap.set(obj,value);}function _checkPrivateRedeclaration(obj,privateCollection){if(privateCollection.has(obj)){throw new TypeError("Cannot initialize the same private elements twice on an object");}}function _defineProperty(obj,key,value){key=_toPropertyKey(key);if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else{obj[key]=value;}return obj;}function _toPropertyKey(arg){var key=_toPrimitive(arg,"string");return _typeof(key)==="symbol"?key:String(key);}function _toPrimitive(input,hint){if(_typeof(input)!=="object"||input===null)return input;var prim=input[Symbol.toPrimitive];if(prim!==undefined){var res=prim.call(input,hint||"default");if(_typeof(res)!=="object")return res;throw new TypeError("@@toPrimitive must return a primitive value.");}return(hint==="string"?String:Number)(input);}function _classPrivateMethodGet(receiver,privateSet,fn){if(!privateSet.has(receiver)){throw new TypeError("attempted to get private field on non-instance");}return fn;}function _classPrivateFieldGet(receiver,privateMap){var descriptor=_classExtractFieldDescriptor(receiver,privateMap,"get");return _classApplyDescriptorGet(receiver,descriptor);}function _classApplyDescriptorGet(receiver,descriptor){if(descriptor.get){return descriptor.get.call(receiver);}return descriptor.value;}function _classPrivateFieldSet(receiver,privateMap,value){var descriptor=_classExtractFieldDescriptor(receiver,privateMap,"set");_classApplyDescriptorSet(receiver,descriptor,value);return value;}function _classExtractFieldDescriptor(receiver,privateMap,action){if(!privateMap.has(receiver)){throw new TypeError("attempted to "+action+" private field on non-instance");}return privateMap.get(receiver);}function _classApplyDescriptorSet(receiver,descriptor,value){if(descriptor.set){descriptor.set.call(receiver,value);}else{if(!descriptor.writable){throw new TypeError("attempted to set read only private field");}descriptor.value=value;}}//@ts-ignore
//@ts-ignore
//@ts-ignore
var CompressionAlgorithm={DEFLATE:"deflate",LZMA:"lzma",ZLIB:"zlib"};var Endian={LITTLE_ENDIAN:"LE",BIG_ENDIAN:"BE"};var ObjectEncoding={AMF0:0,AMF3:3};/**
 * @description Helper function that converts data types to a buffer
 * @param {Buffer|Array|Number} v
 * @returns {Buffer}
 */var convert=function convert(v){return Buffer.isBuffer(v)?v:Array.isArray(v)?Buffer.from(v):Number.isInteger(v)?Buffer.alloc(v):Buffer.alloc(0);};var _position=/*#__PURE__*/new WeakMap();var _endian=/*#__PURE__*/new WeakMap();var _objectEncoding=/*#__PURE__*/new WeakMap();var _readBufferFunc=/*#__PURE__*/new WeakSet();var _writeBufferFunc=/*#__PURE__*/new WeakSet();_Symbol$toStringTag=Symbol.toStringTag;var ByteArray=/*#__PURE__*/function(){/**
	 * @constructor
	 * @param {Buffer|Array|Number} buffer
	 */function ByteArray(){var buffer=arguments.length>0&&arguments[0]!==undefined?arguments[0]:Buffer.alloc(0);_classCallCheck(this,ByteArray);/**
	 * @private
	 * @description Writes a buffer function
	 * @param {Number} value
	 * @param {String} func
	 * @param {Number} pos
	 */_classPrivateMethodInitSpec(this,_writeBufferFunc);/**
	 * @private
	 * @description Reads a buffer function
	 * @param {String} func
	 * @param {Number} pos
	 * @returns {Number}
	 */_classPrivateMethodInitSpec(this,_readBufferFunc);_defineProperty(this,"_bitPosition",0);/**
	 * @private
	 * @description The current position
	 * @type {Number}
	 */_classPrivateFieldInitSpec(this,_position,{writable:true,value:void 0});/**
	 * @private
	 * @description The byte order
	 * @type {String}
	 */_classPrivateFieldInitSpec(this,_endian,{writable:true,value:void 0});/**
	 * @private
	 * @description The object encoding
	 * @type {Number}
	 */_classPrivateFieldInitSpec(this,_objectEncoding,{writable:true,value:void 0});/**
		 * @description Holds the data
		 * @type {Buffer}
		 */this.buffer=convert(buffer);/**
		 * @private
		 * @description The current position
		 * @type {Number}
		 */_classPrivateFieldSet(this,_position,0);/**
		 * @private
		 * @description The byte order
		 * @type {String}
		 */_classPrivateFieldSet(this,_endian,Endian.BIG_ENDIAN);/**
		 * @private
		 * @description The object encoding
		 * @type {Number}
		 */_classPrivateFieldSet(this,_objectEncoding,ObjectEncoding.AMF3);}/**
	 * @static
	 * @description Registers a class alias
	 * @param {Number} encoding
	 * @param {String} aliasName
	 * @param {ObjectEncoding} classObject
	 */_createClass(ByteArray,[{key:_Symbol$toStringTag,get:/**
	 * @description Override for Object.prototype.toString.call
	 * @returns {String}
	 */function get(){return"ByteArray";}/**
	 * @description Returns the current position
	 * @returns {Number}
	 */},{key:"position",get:function get(){return _classPrivateFieldGet(this,_position);}/**
	 * @description Sets the position
	 * @param {Number} value
	 */},{key:"position",set:function set(value){if(value>=0){_classPrivateFieldSet(this,_position,value);}else{throw new TypeError("Invalid value for position: '".concat(value,"'."));}}/**
	 * @description Returns the byte order
	 * @returns {String}
	 */},{key:"endian",get:function get(){return _classPrivateFieldGet(this,_endian);}/**
	 * @description Sets the byte order
	 * @param {String} value
	 */},{key:"endian",set:function set(value){if(value==="LE"||value==="BE"){_classPrivateFieldSet(this,_endian,value);}else{throw new TypeError("Invalid value for endian: '".concat(value,"'."));}}/**
	 * @description Returns the object encoding
	 * @returns {Number}
	 */},{key:"objectEncoding",get:function get(){return _classPrivateFieldGet(this,_objectEncoding);}/**
	 * @description Sets the object encoding
	 * @param {Number} encoding
	 */},{key:"objectEncoding",set:function set(encoding){if(encoding===ObjectEncoding.AMF0||encoding===ObjectEncoding.AMF3){_classPrivateFieldSet(this,_objectEncoding,encoding);}else{throw new Error("Unknown object encoding: '".concat(encoding,"'."));}}/**
	 * @description Returns the length of the buffer
	 * @returns {Number}
	 */},{key:"length",get:function get(){return this.buffer.length;}/**
	 * @description Sets the length of the buffer
	 * @param {Number} value
	 */},{key:"length",set:function set(value){if(!Number.isInteger(value)||value<0){throw new TypeError("Invalid value for length: '".concat(value,"'."));}if(value===0){this.clear();}else if(value!==this.length){if(value<this.length){this.buffer=this.buffer.slice(0,value);_classPrivateFieldSet(this,_position,this.length);}else{this.expand(value);}}}/**
	 * @description Returns the amount of bytes available
	 * @returns {Number}
	 */},{key:"bytesAvailable",get:function get(){return this.length-_classPrivateFieldGet(this,_position);}},{key:"expand",value:/**
	 * @private
	 * @description Expands the buffer when needed
	 * @param {Number} value
	 */function expand(value){if(this.bytesAvailable<value){var old=this.buffer;var size=old.length+(value-this.bytesAvailable);this.buffer=Buffer.alloc(size);old.copy(this.buffer);}}/**
	 * @description Simulates signed overflow
	 * @author truelossless
	 * @param {Number} value
	 * @param {Number} bits
	 * @returns {Number}
	 */},{key:"signedOverflow",value:function signedOverflow(value,bits){var sign=1<<bits-1;return(value&sign-1)-(value&sign);}/**
	 * @description Clears the buffer and sets the position to 0
	 */},{key:"clear",value:function clear(){this.buffer=Buffer.alloc(0);_classPrivateFieldSet(this,_position,0);}/**
	 * @description Compresses the buffer
	 * @param {String} algorithm
	 */},{key:"compress",value:(function(){var _compress=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(){var algorithm,_args=arguments;return _regeneratorRuntime().wrap(function _callee$(_context){while(1)switch(_context.prev=_context.next){case 0:algorithm=_args.length>0&&_args[0]!==undefined?_args[0]:CompressionAlgorithm.ZLIB;if(!(this.length===0)){_context.next=3;break;}return _context.abrupt("return");case 3:algorithm=algorithm.toLowerCase();if(!(algorithm===CompressionAlgorithm.ZLIB)){_context.next=8;break;}this.buffer=(0,_zlib.deflateSync)(this.buffer,{level:9});_context.next=19;break;case 8:if(!(algorithm===CompressionAlgorithm.DEFLATE)){_context.next=12;break;}this.buffer=(0,_zlib.deflateRawSync)(this.buffer);_context.next=19;break;case 12:if(!(algorithm===CompressionAlgorithm.LZMA)){_context.next=18;break;}_context.next=15;return(0,_lzmaNative.LZMA)().compress(this.buffer,1);case 15:this.buffer=_context.sent;_context.next=19;break;case 18:throw new Error("Invalid compression algorithm: '".concat(algorithm,"'."));case 19:_classPrivateFieldSet(this,_position,this.length);case 20:case"end":return _context.stop();}},_callee,this);}));function compress(){return _compress.apply(this,arguments);}return compress;}()/**
	 * @description Reads a boolean
	 * @returns {Boolean}
	 */)},{key:"readBoolean",value:function readBoolean(){return this.readByte()!==0;}/**
	 * @description Reads a signed byte
	 * @returns {Number}
	 */},{key:"readByte",value:function readByte(){var value=this.buffer.readInt8(_classPrivateFieldGet(this,_position));_classPrivateFieldSet(this,_position,_classPrivateFieldGet(this,_position)+1);return value;}/**
	 * @description Reads multiple signed bytes from a ByteArray
	 * @param {ByteArray} bytes
	 * @param {Number} offset
	 * @param {Number} length
	 */},{key:"readBytes",value:function readBytes(bytes){var offset=arguments.length>1&&arguments[1]!==undefined?arguments[1]:0;var length=arguments.length>2&&arguments[2]!==undefined?arguments[2]:0;if(length===0){length=this.bytesAvailable;}if(length>this.bytesAvailable){throw new RangeError("End of buffer was encountered.");}if(bytes.length<offset+length){this.expand(offset+length);}for(var i=0;i<length;i++){this.buffer[i+offset]=this.buffer[i+_classPrivateFieldGet(this,_position)];}_classPrivateFieldSet(this,_position,_classPrivateFieldGet(this,_position)+length);return bytes;}/**
	 * @description Reads a double
	 * @returns {Number}
	 */},{key:"readDouble",value:function readDouble(){return _classPrivateMethodGet(this,_readBufferFunc,_readBufferFunc2).call(this,"readDouble",8);}/**
	 * @description Reads a float
	 * @returns {Number}
	 */},{key:"readFloat",value:function readFloat(){return _classPrivateMethodGet(this,_readBufferFunc,_readBufferFunc2).call(this,"readFloat",4);}/**
	 * @description Reads a signed int
	 * @returns {Number}
	 */},{key:"readInt",value:function readInt(){return _classPrivateMethodGet(this,_readBufferFunc,_readBufferFunc2).call(this,"readInt32",4);}/**
	 * @description Reads a signed long
	 * @returns {BigInt}
	 */},{key:"readLong",value:function readLong(){//@ts-ignore
return _classPrivateMethodGet(this,_readBufferFunc,_readBufferFunc2).call(this,"readBigInt64",8);}/**
	 * @description Reads a multibyte string
	 * @param {Number} length
	 * @param {String} charset
	 * @returns {String}
	 */},{key:"readMultiByte",value:function readMultiByte(length){var charset=arguments.length>1&&arguments[1]!==undefined?arguments[1]:"utf8";var position=_classPrivateFieldGet(this,_position);_classPrivateFieldSet(this,_position,_classPrivateFieldGet(this,_position)+length);if((0,_iconvLite.encodingExists)(charset)){var b=this.buffer.slice(position,_classPrivateFieldGet(this,_position));var stripBOM=(charset==="utf8"||charset==="utf-8")&&b.length>=3&&b[0]===0xef&&b[1]===0xbb&&b[2]===0xbf;var value=(0,_iconvLite.decode)(b,charset,{stripBOM:stripBOM});if(b.length!==length){throw new RangeError("End of buffer was encountered.");}return value;}else{throw new Error("Invalid character set: '".concat(charset,"'."));}}/**
	 * @description Reads an object
	 * @returns {Object}
	 */},{key:"readObject",value:function readObject(){var _ref=_classPrivateFieldGet(this,_objectEncoding)===ObjectEncoding.AMF0?_amf0Ts.AMF0.parse(this.buffer,_classPrivateFieldGet(this,_position)):_amf3Ts.AMF3.parse(this.buffer,_classPrivateFieldGet(this,_position)),_ref2=_slicedToArray(_ref,2),position=_ref2[0],value=_ref2[1];_classPrivateFieldSet(this,_position,_classPrivateFieldGet(this,_position)+position);return value;}/**
	 * @description Reads a signed short
	 * @returns {Number}
	 */},{key:"readShort",value:function readShort(){return _classPrivateMethodGet(this,_readBufferFunc,_readBufferFunc2).call(this,"readInt16",2);}/**
	 * @description Reads an unsigned byte
	 * @returns {Number}
	 */},{key:"readUnsignedByte",value:function readUnsignedByte(){var _this$position,_this$position2;return this.buffer.readUInt8((_classPrivateFieldSet(this,_position,(_this$position=_classPrivateFieldGet(this,_position),_this$position2=_this$position++,_this$position)),_this$position2));}},{key:"toArray",value:function toArray(){return Array.from(this.buffer);}},{key:"readBit",value:function readBit(){var value=this.buffer.readUInt8(_classPrivateFieldGet(this,_position));var bit=value>>7-this._bitPosition&1;this._bitPosition=this._bitPosition===7?0:this._bitPosition+1;if(this._bitPosition===0){var _this$position3,_this$position4;_classPrivateFieldSet(this,_position,(_this$position3=_classPrivateFieldGet(this,_position),_this$position4=_this$position3++,_this$position3)),_this$position4;}return bit;}},{key:"readBits",value:function readBits(numBits){var r=0;for(var i=0;i<numBits;i++){r|=this.readBit()<<numBits-i-1;}return r;}/**
	 * @description Reads an unsigned int
	 * @returns {Number}
	 */},{key:"readUnsignedInt",value:function readUnsignedInt(){return _classPrivateMethodGet(this,_readBufferFunc,_readBufferFunc2).call(this,"readUInt32",4);}/**
	 * @description Reads an unsigned short
	 * @returns {Number}
	 */},{key:"readUnsignedShort",value:function readUnsignedShort(){return _classPrivateMethodGet(this,_readBufferFunc,_readBufferFunc2).call(this,"readUInt16",2);}/**
	 * @description Reads an unsigned long
	 * @returns {BigInt}
	 */},{key:"readUnsignedLong",value:function readUnsignedLong(){//@ts-ignore
return _classPrivateMethodGet(this,_readBufferFunc,_readBufferFunc2).call(this,"readBigUInt64",8);}/**
	 * @description Reads a UTF-8 string
	 * @returns {String}
	 */},{key:"readUTF",value:function readUTF(){return this.readMultiByte(this.readUnsignedShort());}/**
	 * @description Reads UTF-8 bytes
	 * @param {Number} length
	 * @returns {String}
	 */},{key:"readUTFBytes",value:function readUTFBytes(length){return this.readMultiByte(length);}/**
	 * @description Converts the buffer to JSON
	 * @returns {Object}
	 */},{key:"toJSON",value:function toJSON(){return Object.assign({},this.buffer.toJSON().data);}/**
	 * @description Converts the buffer to a string
	 * @param {String} charset
	 * @returns {String}
	 */},{key:"toString",value:function toString(){var charset=arguments.length>0&&arguments[0]!==undefined?arguments[0]:"utf8";if((0,_iconvLite.encodingExists)(charset)){return(0,_iconvLite.decode)(this.buffer,charset);}else{throw new Error("Invalid character set: '".concat(charset,"'."));}}/**
	 * @description Decompresses the buffer
	 * @param {String} algorithm
	 */},{key:"uncompress",value:(function(){var _uncompress=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(){var algorithm,_args2=arguments;return _regeneratorRuntime().wrap(function _callee2$(_context2){while(1)switch(_context2.prev=_context2.next){case 0:algorithm=_args2.length>0&&_args2[0]!==undefined?_args2[0]:CompressionAlgorithm.ZLIB;if(!(this.length===0)){_context2.next=3;break;}return _context2.abrupt("return");case 3:algorithm=algorithm.toLowerCase();if(!(algorithm===CompressionAlgorithm.ZLIB)){_context2.next=8;break;}this.buffer=(0,_zlib.inflateSync)(this.buffer,{level:9});_context2.next=19;break;case 8:if(!(algorithm===CompressionAlgorithm.DEFLATE)){_context2.next=12;break;}this.buffer=(0,_zlib.inflateRawSync)(this.buffer);_context2.next=19;break;case 12:if(!(algorithm===CompressionAlgorithm.LZMA)){_context2.next=18;break;}_context2.next=15;return(0,_lzmaNative.LZMA)().decompress(this.buffer);case 15:this.buffer=_context2.sent;_context2.next=19;break;case 18:throw new Error("Invalid decompression algorithm: '".concat(algorithm,"'."));case 19:_classPrivateFieldSet(this,_position,0);case 20:case"end":return _context2.stop();}},_callee2,this);}));function uncompress(){return _uncompress.apply(this,arguments);}return uncompress;}()/**
	 * @description Writes a boolean
	 * @param {Boolean} value
	 */)},{key:"writeBoolean",value:function writeBoolean(value){this.writeByte(value?1:0);}/**
	 * @description Writes a signed byte
	 * @param {Number} value
	 */},{key:"writeByte",value:function writeByte(value){var _this$position5,_this$position6;this.expand(1);this.buffer.writeInt8(this.signedOverflow(value,8),(_classPrivateFieldSet(this,_position,(_this$position5=_classPrivateFieldGet(this,_position),_this$position6=_this$position5++,_this$position5)),_this$position6));}/**
	 * @description Writes multiple signed bytes to a ByteArray
	 * @param {ByteArray} bytes
	 * @param {Number} offset
	 * @param {Number} length
	 */},{key:"writeBytes",value:function writeBytes(bytes){var offset=arguments.length>1&&arguments[1]!==undefined?arguments[1]:0;var length=arguments.length>2&&arguments[2]!==undefined?arguments[2]:0;if(length===0){length=bytes.length-offset;}this.expand(length);for(var i=0;i<length;i++){this.buffer[i+_classPrivateFieldGet(this,_position)]=bytes.buffer[i+offset];}_classPrivateFieldSet(this,_position,_classPrivateFieldGet(this,_position)+length);}/**
	 * @description Writes a double
	 * @param {Number} value
	 */},{key:"writeDouble",value:function writeDouble(value){_classPrivateMethodGet(this,_writeBufferFunc,_writeBufferFunc2).call(this,value,"writeDouble",8);}/**
	 * @description Writes a float
	 * @param {Number} value
	 */},{key:"writeFloat",value:function writeFloat(value){_classPrivateMethodGet(this,_writeBufferFunc,_writeBufferFunc2).call(this,value,"writeFloat",4);}/**
	 * @description Writes a signed int
	 * @param {Number} value
	 */},{key:"writeInt",value:function writeInt(value){_classPrivateMethodGet(this,_writeBufferFunc,_writeBufferFunc2).call(this,this.signedOverflow(value,32),"writeInt32",4);}/**
	 * @description Writes a signed long
	 * @param {BigInt} value
	 */},{key:"writeLong",value:function writeLong(value){_classPrivateMethodGet(this,_writeBufferFunc,_writeBufferFunc2).call(this,value,"writeBigInt64",8);}/**
	 * @description Writes a multibyte string
	 * @param {String} value
	 * @param {String} charset
	 */},{key:"writeMultiByte",value:function writeMultiByte(value){var charset=arguments.length>1&&arguments[1]!==undefined?arguments[1]:"utf8";_classPrivateFieldSet(this,_position,_classPrivateFieldGet(this,_position)+Buffer.byteLength(value));if((0,_iconvLite.encodingExists)(charset)){this.buffer=Buffer.concat([this.buffer,(0,_iconvLite.encode)(value,charset)]);}else{throw new Error("Invalid character set: '".concat(charset,"'."));}}/**
	 * @description Writes an object
	 * @param {Object} value
	 */},{key:"writeObject",value:function writeObject(value){var bytes=_classPrivateFieldGet(this,_objectEncoding)===ObjectEncoding.AMF0?_amf0Ts.AMF0.stringify(value):_amf3Ts.AMF3.stringify(value);_classPrivateFieldSet(this,_position,_classPrivateFieldGet(this,_position)+bytes.length);this.buffer=Buffer.concat([this.buffer,Buffer.from(bytes)]);}/**
	 * @description Writes a signed short
	 * @param {Number} value
	 */},{key:"writeShort",value:function writeShort(value){_classPrivateMethodGet(this,_writeBufferFunc,_writeBufferFunc2).call(this,this.signedOverflow(value,16),"writeInt16",2);}/**
	 * @description Writes an unsigned byte
	 * @param {Number} value
	 */},{key:"writeUnsignedByte",value:function writeUnsignedByte(value){var _this$position7,_this$position8;this.expand(1);this.buffer.writeUInt8(value,(_classPrivateFieldSet(this,_position,(_this$position7=_classPrivateFieldGet(this,_position),_this$position8=_this$position7++,_this$position7)),_this$position8));}/**
	 * @description Writes an unsigned int
	 * @param {Number} value
	 */},{key:"writeUnsignedInt",value:function writeUnsignedInt(value){_classPrivateMethodGet(this,_writeBufferFunc,_writeBufferFunc2).call(this,value,"writeUInt32",4);}/**
	 * @description Writes an unsigned short
	 * @param {Number} value
	 */},{key:"writeUnsignedShort",value:function writeUnsignedShort(value){_classPrivateMethodGet(this,_writeBufferFunc,_writeBufferFunc2).call(this,value,"writeUInt16",2);}/**
	 * @description Writes an unsigned long
	 * @param {BigInt} value
	 */},{key:"writeUnsignedLong",value:function writeUnsignedLong(value){_classPrivateMethodGet(this,_writeBufferFunc,_writeBufferFunc2).call(this,value,"writeBigUInt64",8);}/**
	 * @description Writes a UTF-8 string
	 * @param {String} value
	 */},{key:"writeUTF",value:(function(){var _writeUTF=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(value){var _this=this;return _regeneratorRuntime().wrap(function _callee3$(_context3){while(1)switch(_context3.prev=_context3.next){case 0:return _context3.abrupt("return",new Promise(function(resolve,reject){try{_this.writeUnsignedShort(Buffer.byteLength(value));_this.writeMultiByte(value);resolve();}catch(error){reject(error);}}));case 1:case"end":return _context3.stop();}},_callee3);}));function writeUTF(_x){return _writeUTF.apply(this,arguments);}return writeUTF;}()/**
	 * @description Writes UTF-8 bytes
	 * @param {String} value
	 */)},{key:"writeUTFBytes",value:function writeUTFBytes(value){this.writeMultiByte(value);}}],[{key:"registerClassAlias",value:function registerClassAlias(encoding,aliasName,classObject){if(encoding===ObjectEncoding.AMF0){_amf0Ts.AMF0.registerClassAlias(aliasName,classObject);}else if(encoding===ObjectEncoding.AMF3){_amf3Ts.AMF3.registerClassAlias(aliasName,classObject);}else{throw new Error("Unknown object encoding: '".concat(encoding,"'."));}}}]);return ByteArray;}();function _readBufferFunc2(func,pos){//@ts-ignore
var value=this.buffer["".concat(func).concat(_classPrivateFieldGet(this,_endian))](_classPrivateFieldGet(this,_position));_classPrivateFieldSet(this,_position,_classPrivateFieldGet(this,_position)+pos);return value;}function _writeBufferFunc2(value,func,pos){this.expand(pos);//@ts-ignore
this.buffer["".concat(func).concat(_classPrivateFieldGet(this,_endian))](value,_classPrivateFieldGet(this,_position));_classPrivateFieldSet(this,_position,_classPrivateFieldGet(this,_position)+pos);}var _default=exports["default"]=ByteArray;