"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o;}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o;},_typeof(o);}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,_toPropertyKey(descriptor.key),descriptor);}}function _createClass(Constructor,protoProps,staticProps){if(protoProps)_defineProperties(Constructor.prototype,protoProps);if(staticProps)_defineProperties(Constructor,staticProps);Object.defineProperty(Constructor,"prototype",{writable:false});return Constructor;}function _toPropertyKey(arg){var key=_toPrimitive(arg,"string");return _typeof(key)==="symbol"?key:String(key);}function _toPrimitive(input,hint){if(_typeof(input)!=="object"||input===null)return input;var prim=input[Symbol.toPrimitive];if(prim!==undefined){var res=prim.call(input,hint||"default");if(_typeof(res)!=="object")return res;throw new TypeError("@@toPrimitive must return a primitive value.");}return(hint==="string"?String:Number)(input);}var BinaryWriter=/*#__PURE__*/function(){function BinaryWriter(size){_classCallCheck(this,BinaryWriter);if(!size||size<=0){size=Buffer.poolSize/2;}this._buffer=Buffer.alloc(size);this._length=0;}_createClass(BinaryWriter,[{key:"writeUnsignedByte",value:function writeUnsignedByte(value){this.checkAlloc(1);this._buffer.writeUInt8(value,this._length);}},{key:"writeByte",value:function writeByte(value){this.checkAlloc(1);this._buffer.writeInt8(value,this._length);}},{key:"writeUInt16",value:function writeUInt16(value){this.checkAlloc(2);this._buffer.writeUInt16BE(value,this._length);}},{key:"writeInt16",value:function writeInt16(value){this.checkAlloc(2);this._buffer.writeInt16BE(value,this._length);}},{key:"WriteUnsignedInt",value:function WriteUnsignedInt(value){this.checkAlloc(4);this._buffer.writeUInt32BE(value,this._length);}},{key:"WriteSByte",value:function WriteSByte(value){this.checkAlloc(1);// Assurez-vous qu'il y a suffisamment d'espace dans le buffer
this._buffer.writeInt8(value,this._length);}},{key:"WriteLong",value:function WriteLong(value){this.checkAlloc(8);this._buffer.writeBigInt64BE(BigInt(value),this._length);}},{key:"WriteInt",value:function WriteInt(value){this.checkAlloc(4);this._buffer.writeInt32BE(value,this._length);}},{key:"writeFloat",value:function writeFloat(value){this.checkAlloc(4);this._buffer.writeFloatBE(value,this._length);this._length+=4;}},{key:"writeDouble",value:function writeDouble(value){this.checkAlloc(8);this._buffer.writeDoubleBE(value,this._length);this._length+=8;}},{key:"writeBytes",value:function writeBytes(data){this.checkAlloc(data.length);data.copy(this._buffer,this._length,0,data.length);this._length+=data.length;}},{key:"writeStringUtf8",value:function writeStringUtf8(value){this.checkAlloc(length);this._buffer.write(value,this._length,length,"utf8");this._length+=length;}},{key:"writeStringUnicode",value:function writeStringUnicode(value){var length=Buffer.byteLength(value,"ucs2");this.checkAlloc(length);this._buffer.write(value,this._length,length,"ucs2");this._length+=length;}},{key:"writeStringZeroUtf8",value:function writeStringZeroUtf8(value){this.writeStringUtf8(value);this.writeUnsignedByte(0);}},{key:"writeStringZeroUnicode",value:function writeStringZeroUnicode(value){this.writeStringUnicode(value);this.writeUInt16(0);}},{key:"getLength",value:function getLength(){return this._length;}},{key:"reset",value:function reset(){this._length=0;}},{key:"toBuffer",value:function toBuffer(){return Buffer.concat([this._buffer.slice(0,this._length)]);}},{key:"checkAlloc",value:function checkAlloc(size){var needed=this._length+size;if(this._buffer.length>=needed)return;var chunk=Math.max(Buffer.poolSize/2,1024);var chunkCount=Math.ceil(needed/chunk);var buffer=Buffer.alloc(chunkCount*chunk);this._buffer.copy(buffer,0,0,this._length);this._buffer=buffer;}}]);return BinaryWriter;}();var _default=exports["default"]=BinaryWriter;