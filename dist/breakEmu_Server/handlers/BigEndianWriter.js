"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _ByteArray=_interopRequireDefault(require("./ByteArray"));function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{"default":obj};}function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o;}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o;},_typeof(o);}function _regeneratorRuntime(){"use strict";/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */_regeneratorRuntime=function _regeneratorRuntime(){return e;};var t,e={},r=Object.prototype,n=r.hasOwnProperty,o=Object.defineProperty||function(t,e,r){t[e]=r.value;},i="function"==typeof Symbol?Symbol:{},a=i.iterator||"@@iterator",c=i.asyncIterator||"@@asyncIterator",u=i.toStringTag||"@@toStringTag";function define(t,e,r){return Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}),t[e];}try{define({},"");}catch(t){define=function define(t,e,r){return t[e]=r;};}function wrap(t,e,r,n){var i=e&&e.prototype instanceof Generator?e:Generator,a=Object.create(i.prototype),c=new Context(n||[]);return o(a,"_invoke",{value:makeInvokeMethod(t,r,c)}),a;}function tryCatch(t,e,r){try{return{type:"normal",arg:t.call(e,r)};}catch(t){return{type:"throw",arg:t};}}e.wrap=wrap;var h="suspendedStart",l="suspendedYield",f="executing",s="completed",y={};function Generator(){}function GeneratorFunction(){}function GeneratorFunctionPrototype(){}var p={};define(p,a,function(){return this;});var d=Object.getPrototypeOf,v=d&&d(d(values([])));v&&v!==r&&n.call(v,a)&&(p=v);var g=GeneratorFunctionPrototype.prototype=Generator.prototype=Object.create(p);function defineIteratorMethods(t){["next","throw","return"].forEach(function(e){define(t,e,function(t){return this._invoke(e,t);});});}function AsyncIterator(t,e){function invoke(r,o,i,a){var c=tryCatch(t[r],t,o);if("throw"!==c.type){var u=c.arg,h=u.value;return h&&"object"==_typeof(h)&&n.call(h,"__await")?e.resolve(h.__await).then(function(t){invoke("next",t,i,a);},function(t){invoke("throw",t,i,a);}):e.resolve(h).then(function(t){u.value=t,i(u);},function(t){return invoke("throw",t,i,a);});}a(c.arg);}var r;o(this,"_invoke",{value:function value(t,n){function callInvokeWithMethodAndArg(){return new e(function(e,r){invoke(t,n,e,r);});}return r=r?r.then(callInvokeWithMethodAndArg,callInvokeWithMethodAndArg):callInvokeWithMethodAndArg();}});}function makeInvokeMethod(e,r,n){var o=h;return function(i,a){if(o===f)throw new Error("Generator is already running");if(o===s){if("throw"===i)throw a;return{value:t,done:!0};}for(n.method=i,n.arg=a;;){var c=n.delegate;if(c){var u=maybeInvokeDelegate(c,n);if(u){if(u===y)continue;return u;}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if(o===h)throw o=s,n.arg;n.dispatchException(n.arg);}else"return"===n.method&&n.abrupt("return",n.arg);o=f;var p=tryCatch(e,r,n);if("normal"===p.type){if(o=n.done?s:l,p.arg===y)continue;return{value:p.arg,done:n.done};}"throw"===p.type&&(o=s,n.method="throw",n.arg=p.arg);}};}function maybeInvokeDelegate(e,r){var n=r.method,o=e.iterator[n];if(o===t)return r.delegate=null,"throw"===n&&e.iterator["return"]&&(r.method="return",r.arg=t,maybeInvokeDelegate(e,r),"throw"===r.method)||"return"!==n&&(r.method="throw",r.arg=new TypeError("The iterator does not provide a '"+n+"' method")),y;var i=tryCatch(o,e.iterator,r.arg);if("throw"===i.type)return r.method="throw",r.arg=i.arg,r.delegate=null,y;var a=i.arg;return a?a.done?(r[e.resultName]=a.value,r.next=e.nextLoc,"return"!==r.method&&(r.method="next",r.arg=t),r.delegate=null,y):a:(r.method="throw",r.arg=new TypeError("iterator result is not an object"),r.delegate=null,y);}function pushTryEntry(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e);}function resetTryEntry(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e;}function Context(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(pushTryEntry,this),this.reset(!0);}function values(e){if(e||""===e){var r=e[a];if(r)return r.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var o=-1,i=function next(){for(;++o<e.length;)if(n.call(e,o))return next.value=e[o],next.done=!1,next;return next.value=t,next.done=!0,next;};return i.next=i;}}throw new TypeError(_typeof(e)+" is not iterable");}return GeneratorFunction.prototype=GeneratorFunctionPrototype,o(g,"constructor",{value:GeneratorFunctionPrototype,configurable:!0}),o(GeneratorFunctionPrototype,"constructor",{value:GeneratorFunction,configurable:!0}),GeneratorFunction.displayName=define(GeneratorFunctionPrototype,u,"GeneratorFunction"),e.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===GeneratorFunction||"GeneratorFunction"===(e.displayName||e.name));},e.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,GeneratorFunctionPrototype):(t.__proto__=GeneratorFunctionPrototype,define(t,u,"GeneratorFunction")),t.prototype=Object.create(g),t;},e.awrap=function(t){return{__await:t};},defineIteratorMethods(AsyncIterator.prototype),define(AsyncIterator.prototype,c,function(){return this;}),e.AsyncIterator=AsyncIterator,e.async=function(t,r,n,o,i){void 0===i&&(i=Promise);var a=new AsyncIterator(wrap(t,r,n,o),i);return e.isGeneratorFunction(r)?a:a.next().then(function(t){return t.done?t.value:a.next();});},defineIteratorMethods(g),define(g,u,"Generator"),define(g,a,function(){return this;}),define(g,"toString",function(){return"[object Generator]";}),e.keys=function(t){var e=Object(t),r=[];for(var n in e)r.push(n);return r.reverse(),function next(){for(;r.length;){var t=r.pop();if(t in e)return next.value=t,next.done=!1,next;}return next.done=!0,next;};},e.values=values,Context.prototype={constructor:Context,reset:function reset(e){if(this.prev=0,this.next=0,this.sent=this._sent=t,this.done=!1,this.delegate=null,this.method="next",this.arg=t,this.tryEntries.forEach(resetTryEntry),!e)for(var r in this)"t"===r.charAt(0)&&n.call(this,r)&&!isNaN(+r.slice(1))&&(this[r]=t);},stop:function stop(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval;},dispatchException:function dispatchException(e){if(this.done)throw e;var r=this;function handle(n,o){return a.type="throw",a.arg=e,r.next=n,o&&(r.method="next",r.arg=t),!!o;}for(var o=this.tryEntries.length-1;o>=0;--o){var i=this.tryEntries[o],a=i.completion;if("root"===i.tryLoc)return handle("end");if(i.tryLoc<=this.prev){var c=n.call(i,"catchLoc"),u=n.call(i,"finallyLoc");if(c&&u){if(this.prev<i.catchLoc)return handle(i.catchLoc,!0);if(this.prev<i.finallyLoc)return handle(i.finallyLoc);}else if(c){if(this.prev<i.catchLoc)return handle(i.catchLoc,!0);}else{if(!u)throw new Error("try statement without catch or finally");if(this.prev<i.finallyLoc)return handle(i.finallyLoc);}}}},abrupt:function abrupt(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r];if(o.tryLoc<=this.prev&&n.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break;}}i&&("break"===t||"continue"===t)&&i.tryLoc<=e&&e<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=t,a.arg=e,i?(this.method="next",this.next=i.finallyLoc,y):this.complete(a);},complete:function complete(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),y;},finish:function finish(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),resetTryEntry(r),y;}},"catch":function _catch(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;resetTryEntry(r);}return o;}}throw new Error("illegal catch attempt");},delegateYield:function delegateYield(e,r,n){return this.delegate={iterator:values(e),resultName:r,nextLoc:n},"next"===this.method&&(this.arg=t),y;}},e;}function asyncGeneratorStep(gen,resolve,reject,_next,_throw,key,arg){try{var info=gen[key](arg);var value=info.value;}catch(error){reject(error);return;}if(info.done){resolve(value);}else{Promise.resolve(value).then(_next,_throw);}}function _asyncToGenerator(fn){return function(){var self=this,args=arguments;return new Promise(function(resolve,reject){var gen=fn.apply(self,args);function _next(value){asyncGeneratorStep(gen,resolve,reject,_next,_throw,"next",value);}function _throw(err){asyncGeneratorStep(gen,resolve,reject,_next,_throw,"throw",err);}_next(undefined);});};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,_toPropertyKey(descriptor.key),descriptor);}}function _createClass(Constructor,protoProps,staticProps){if(protoProps)_defineProperties(Constructor.prototype,protoProps);if(staticProps)_defineProperties(Constructor,staticProps);Object.defineProperty(Constructor,"prototype",{writable:false});return Constructor;}function _toPropertyKey(arg){var key=_toPrimitive(arg,"string");return _typeof(key)==="symbol"?key:String(key);}function _toPrimitive(input,hint){if(_typeof(input)!=="object"||input===null)return input;var prim=input[Symbol.toPrimitive];if(prim!==undefined){var res=prim.call(input,hint||"default");if(_typeof(res)!=="object")return res;throw new TypeError("@@toPrimitive must return a primitive value.");}return(hint==="string"?String:Number)(input);}// import { BinaryWriter, Encoding } from "csharp-binary-stream"
// class BigEndianWriter implements IDataWriter {
// 	private writer: BinaryWriter
// 	public position: number
// 	constructor(buffer: Buffer) {
// 		this.writer = new BinaryWriter(buffer)
// 		this.position = 0
// 	}
// 	WriteSByte(value: number): void {
// 		throw new Error("Method not implemented.")
// 	}
// 	get Data(): number[] {
// 		return this.writer.toArray()
// 	}
// 	get Writer(): BinaryWriter {
// 		return this.writer
// 	}
// 	WriteSingle(value: number): void {
// 		throw new Error("Method not implemented.")
// 	}
// 	public WriteShort(short: number): void {
// 		this.writer.writeShort(short) // Utilisez writeUInt16 pour Big Endian
// 	}
// 	public WriteInt(int: number): void {
// 		this.writer.writeInt(int) // Utilisez writeUInt32 pour Big Endian
// 	}
// 	public WriteLong(long: number): void {
// 		this.writer.writeLong(long) // Utilisez writeBigInt64 pour Big Endian
// 	}
// 	public WriteUShort(ushort: number): void {
// 		this.writer.writeUnsignedShort(ushort)
// 	}
// 	public WriteUInt(uint: number): void {
// 		this.writer.writeUnsignedInt(uint)
// 	}
// 	public WriteULong(ulong: number): void {
// 		this.writer.writeUnsignedLong(ulong)
// 	}
// 	public WriteByte(byte: number): void {
// 		this.writer.writeByte(byte)
// 	}
// 	public WriteBoolean(bool: boolean): void {
// 		this.writer.writeBoolean(bool)
// 	}
// 	public WriteChar(char: string): void {
// 		this.writer.writeChar(char, Encoding.Utf8)
// 	}
// 	public WriteUTF(str: string): void {
// 		this.writer.writeString(str, Encoding.Utf8)
// 	}
// 	public WriteUTFBytes(str: string): void {
// 		this.writer.writeString(str, Encoding.Utf8)
// 	}
// 	public WriteFloat(float: number): void {
// 		this.writer.writeFloat(float)
// 	}
// 	public WriteDouble(double: number): void {
// 		this.writer.writeDouble(double)
// 	}
// 	public WriteBytes(data: number[]): void {
// 		this.writer.writeBytes(data) // Convertissez Buffer en Uint8Array
// 	}
// 	Clear(): void {
//     this.writer.clear()
// 	}
// 	Seek(offset: number): void {
// 		this.position = offset
// 	}
// }
var BigEndianWriter=/*#__PURE__*/function(){function BigEndianWriter(size){_classCallCheck(this,BigEndianWriter);this.writer=new _ByteArray["default"]();}_createClass(BigEndianWriter,[{key:"Data",get:function get(){return this.writer.toArray();}},{key:"Writer",get:function get(){return this.writer;}},{key:"WriteSByte",value:function WriteSByte(value){throw new Error("Method not implemented.");}},{key:"WriteSingle",value:function WriteSingle(value){throw new Error("Method not implemented.");}},{key:"WriteShort",value:function WriteShort(_short){this.writer.writeShort(_short);}},{key:"WriteInt",value:function WriteInt(_int){this.writer.writeInt(_int);}},{key:"WriteLong",value:function WriteLong(_long){this.writer.writeLong(_long);}},{key:"WriteUShort",value:function WriteUShort(ushort){this.writer.writeUnsignedShort(ushort);}},{key:"WriteUInt",value:function WriteUInt(uint){this.writer.writeUnsignedInt(uint);}},{key:"WriteULong",value:function WriteULong(ulong){this.writer.writeUnsignedLong(ulong);}},{key:"WriteByte",value:function WriteByte(_byte){//check if buffer is full
if(this.writer.length>=this.writer.buffer.length){this.writer.expand(1);}this.writer.writeByte(_byte);}},{key:"WriteBoolean",value:function WriteBoolean(bool){this.writer.writeBoolean(bool?1:0);}},{key:"WriteChar",value:function WriteChar(_char){this.writer.writeShort(_char.charCodeAt(0));}},{key:"WriteUTF",value:function(){var _WriteUTF=_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(str){var _this=this;return _regeneratorRuntime().wrap(function _callee$(_context){while(1)switch(_context.prev=_context.next){case 0:new Promise(function(resolve,reject){_this.writer.writeUTF(str);resolve();});case 1:case"end":return _context.stop();}},_callee);}));function WriteUTF(_x){return _WriteUTF.apply(this,arguments);}return WriteUTF;}()},{key:"WriteUTFBytes",value:function WriteUTFBytes(str){this.writer.writeBytes(Buffer.from(str,"utf8"));}},{key:"WriteFloat",value:function WriteFloat(_float){this.writer.writeFloat(_float);}},{key:"WriteDouble",value:function WriteDouble(_double){this.writer.writeDouble(_double);}},{key:"WriteBytes",value:function WriteBytes(data){this.writer.writeBytes(data);}},{key:"dispose",value:function dispose(){this.writer.clear();}},{key:"Clear",value:function Clear(){this.writer.clear();}},{key:"Seek",value:function Seek(offset){}}]);return BigEndianWriter;}();// class BigEndianWriter implements IDataWriter {
//   private buffer: Buffer;
//   public position: number;
//   constructor(size: number = 0) {
//     this.buffer = Buffer.alloc(size);
//     this.position = 0;
//   }
//   private ensureCapacity(additionalSize: number) {
//     if (this.position + additionalSize > this.buffer.length) {
//       let newBuffer = Buffer.alloc(this.buffer.length + additionalSize + 1024);
//       this.buffer.copy(newBuffer);
//       this.buffer = newBuffer;
//     }
//   }
//   get Data(): Buffer {
//     return this.buffer
//   }
//   get Writer(): BinaryWriter {
//     throw new Error("BinaryWriter not used in BigEndianWriter.");
//   }
//   WriteShort(value: number): void {
//     this.ensureCapacity(2);
//     this.buffer.writeInt16BE(value, this.position);
//     this.position += 2;
//   }
//   WriteInt(value: number): void {
//     this.ensureCapacity(4);
//     this.buffer.writeInt32BE(value, this.position);
//     this.position += 4;
//   }
//   WriteLong(value: number): void {
//     // Assuming value is within the safe integer range for JavaScript
//     this.ensureCapacity(8);
//     this.buffer.writeBigInt64BE(BigInt(value), this.position);
//     this.position += 8;
//   }
//   WriteUShort(value: number): void {
//     this.ensureCapacity(2);
//     this.buffer.writeUInt16BE(value, this.position);
//     this.position += 2;
//   }
//   WriteUInt(value: number): void {
//     this.ensureCapacity(4);
//     this.buffer.writeUInt32BE(value, this.position);
//     this.position += 4;
//   }
//   WriteULong(value: number): void {
//     this.ensureCapacity(8);
//     this.buffer.writeBigUInt64BE(BigInt(value), this.position);
//     this.position += 8;
//   }
//   WriteByte(value: number): void {
//     this.ensureCapacity(1);
//     this.buffer.writeUInt8(value, this.position);
//     this.position += 1;
//   }
//   WriteSByte(value: number): void {
//     this.ensureCapacity(1);
//     this.buffer.writeInt8(value, this.position);
//     this.position += 1;
//   }
//   WriteFloat(value: number): void {
//     this.ensureCapacity(4);
//     this.buffer.writeFloatBE(value, this.position);
//     this.position += 4;
//   }
//   WriteBoolean(value: boolean): void {
//     this.WriteByte(value ? 1 : 0);
//   }
//   WriteChar(value: string): void {
//     this.WriteShort(value.charCodeAt(0));
//   }
//   WriteDouble(value: number): void {
//     this.ensureCapacity(8);
//     this.buffer.writeDoubleBE(value, this.position);
//     this.position += 8;
//   }
//   WriteSingle(value: number): void {
//     this.WriteFloat(value);
//   }
//   WriteUTF(value: string): void {
//     const strBuffer = Buffer.from(value, "utf8");
//     this.WriteUShort(strBuffer.length);
//     this.WriteBytes(strBuffer);
//   }
//   WriteUTFBytes(value: string): void {
//     const strBuffer = Buffer.from(value, "utf8");
//     this.WriteBytes(strBuffer);
//   }
//   WriteBytes(value: Buffer): void {
//     this.ensureCapacity(value.length);
//     value.copy(this.buffer, this.position);
//     this.position += value.length;
//   }
//   Clear(): void {
//     this.position = 0;
//     this.buffer.fill(0);
//   }
//   Seek(offset: number): void {
//     if (offset < 0 || offset > this.buffer.length) {
//       throw new Error("Offset is outside the bounds of the buffer");
//     }
//     this.position = offset;
//   }
// }
var _default=exports["default"]=BigEndianWriter;