"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o;}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o;},_typeof(o);}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,_toPropertyKey(descriptor.key),descriptor);}}function _createClass(Constructor,protoProps,staticProps){if(protoProps)_defineProperties(Constructor.prototype,protoProps);if(staticProps)_defineProperties(Constructor,staticProps);Object.defineProperty(Constructor,"prototype",{writable:false});return Constructor;}function _toPropertyKey(arg){var key=_toPrimitive(arg,"string");return _typeof(key)==="symbol"?key:String(key);}function _toPrimitive(input,hint){if(_typeof(input)!=="object"||input===null)return input;var prim=input[Symbol.toPrimitive];if(prim!==undefined){var res=prim.call(input,hint||"default");if(_typeof(res)!=="object")return res;throw new TypeError("@@toPrimitive must return a primitive value.");}return(hint==="string"?String:Number)(input);}var Account=/*#__PURE__*/function(){function Account(id,username,password,pseudo,email,is_verified,firstname,lastname,birthdate,secretQuestion,login_at,logout_at,created_at,updated_at,deleted_at,IP,role,is_banned,tagNumber){_classCallCheck(this,Account);this._id=id;this._username=username;this._password=password;this._pseudo=pseudo;this._email=email;this._is_verified=is_verified;this._firstname=firstname;this._lastname=lastname;this._birthdate=birthdate;this._secretQuestion=secretQuestion;this._login_at=login_at;this._logout_at=logout_at;this._created_at=created_at;this._updated_at=updated_at;this._deleted_at=deleted_at;this._IP=IP;this._role=role;this._is_banned=is_banned;this._tagNumber=tagNumber;}_createClass(Account,[{key:"id",get:function get(){return this._id;}},{key:"username",get:function get(){return this._username;}},{key:"password",get:function get(){return this._password;}},{key:"pseudo",get:function get(){return this._pseudo;}},{key:"email",get:function get(){return this._email;}},{key:"is_verified",get:function get(){return this._is_verified;}},{key:"firstname",get:function get(){return this._firstname;}},{key:"lastname",get:function get(){return this._lastname;}},{key:"birthdate",get:function get(){return this._birthdate;}},{key:"secretQuestion",get:function get(){return this._secretQuestion;}},{key:"login_at",get:function get(){return this._login_at;}},{key:"IP",get:function get(){return this._IP;}},{key:"is_banned",get:function get(){return this._is_banned;}},{key:"role",get:function get(){return this._role;}},{key:"is_admin",get:function get(){return this._role===5;}},{key:"logout_at",get:function get(){return this._logout_at;}},{key:"created_at",get:function get(){return this._created_at;}},{key:"updated_at",get:function get(){return this._updated_at;}},{key:"deleted_at",get:function get(){return this._deleted_at;}},{key:"tagNumber",get:function get(){return this._tagNumber;}},{key:"getRandomTagNumber",value:function getRandomTagNumber(){return Math.floor(Math.random()*100000);}},{key:"setPseudo",value:function setPseudo(pseudo){this._pseudo=pseudo;}},{key:"toString",value:function toString(){return JSON.stringify(this);}}]);return Account;}();var _default=exports["default"]=Account;