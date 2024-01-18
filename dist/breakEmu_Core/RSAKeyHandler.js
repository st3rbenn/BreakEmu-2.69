"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _crypto=require("crypto");var _fs=require("fs");var _Logger=_interopRequireDefault(require("../breakEmu_Core/Logger"));function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{"default":obj};}function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o;}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o;},_typeof(o);}function _toConsumableArray(arr){return _arrayWithoutHoles(arr)||_iterableToArray(arr)||_unsupportedIterableToArray(arr)||_nonIterableSpread();}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o,minLen){if(!o)return;if(typeof o==="string")return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);if(n==="Object"&&o.constructor)n=o.constructor.name;if(n==="Map"||n==="Set")return Array.from(o);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return _arrayLikeToArray(o,minLen);}function _iterableToArray(iter){if(typeof Symbol!=="undefined"&&iter[Symbol.iterator]!=null||iter["@@iterator"]!=null)return Array.from(iter);}function _arrayWithoutHoles(arr){if(Array.isArray(arr))return _arrayLikeToArray(arr);}function _arrayLikeToArray(arr,len){if(len==null||len>arr.length)len=arr.length;for(var i=0,arr2=new Array(len);i<len;i++)arr2[i]=arr[i];return arr2;}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,_toPropertyKey(descriptor.key),descriptor);}}function _createClass(Constructor,protoProps,staticProps){if(protoProps)_defineProperties(Constructor.prototype,protoProps);if(staticProps)_defineProperties(Constructor,staticProps);Object.defineProperty(Constructor,"prototype",{writable:false});return Constructor;}function _defineProperty(obj,key,value){key=_toPropertyKey(key);if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else{obj[key]=value;}return obj;}function _toPropertyKey(arg){var key=_toPrimitive(arg,"string");return _typeof(key)==="symbol"?key:String(key);}function _toPrimitive(input,hint){if(_typeof(input)!=="object"||input===null)return input;var prim=input[Symbol.toPrimitive];if(prim!==undefined){var res=prim.call(input,hint||"default");if(_typeof(res)!=="object")return res;throw new TypeError("@@toPrimitive must return a primitive value.");}return(hint==="string"?String:Number)(input);}var RSAKeyHandler=/*#__PURE__*/function(){function RSAKeyHandler(){_classCallCheck(this,RSAKeyHandler);_defineProperty(this,"logger",new _Logger["default"]("RSAKeyHandler"));_defineProperty(this,"encryptedPublicKey",Buffer.alloc(0));_defineProperty(this,"publicKey",Buffer.alloc(0));_defineProperty(this,"privateKey","");}_createClass(RSAKeyHandler,[{key:"generateKeyPair",value:function generateKeyPair(){var _generateKeyPairSync=(0,_crypto.generateKeyPairSync)("rsa",{modulusLength:1024,publicKeyEncoding:{type:"spki",format:"der"},privateKeyEncoding:{type:"pkcs1",format:"pem"}}),publicKey=_generateKeyPairSync.publicKey,privateKey=_generateKeyPairSync.privateKey;var privKey=(0,_fs.readFileSync)(__dirname+"/private.pem","utf-8");var encryptedPublicKey=(0,_crypto.privateEncrypt)((0,_crypto.createPrivateKey)(privKey),publicKey);this.privateKey=privateKey;this.publicKey=publicKey;this.encryptedPublicKey=encryptedPublicKey;}},{key:"getAttribute",value:function getAttribute(){return{publicKey:(0,_crypto.createPublicKey)({key:this.publicKey,format:"der",type:"spki"})["export"]({format:"pem",type:"spki"}).toString(),privateKey:this.privateKey,salt:_toConsumableArray(Array(32)).map(function(){return Math.random().toString(36)[2];}).join("")};}}],[{key:"getInstance",value:function getInstance(){if(!RSAKeyHandler.instance){RSAKeyHandler.instance=new RSAKeyHandler();}return RSAKeyHandler.instance;}}]);return RSAKeyHandler;}();var _default=exports["default"]=RSAKeyHandler;