var util = require('util');

module.exports = function(klass, constructor){
  var newClass = function(){
    klass.apply(this);
    if(constructor !== undefined){
      constructor.apply(this, arguments);
    }
  }
  util.inherits(newClass, klass);
  return newClass;
}
