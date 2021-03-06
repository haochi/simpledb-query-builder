var predicate = require('./predicate');
var helpers = require('./helpers');

function Attribute(name){
  if(!(this instanceof Attribute)){
    return new Attribute(name);
  }
  this._name = name;
}

var simple_operators = {
  equal: "=",
  not_equal: "!=",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  like: "LIKE",
  not_like: "NOT LIKE",
};

Object.keys(simple_operators).forEach(function(method_name){
  var operator = simple_operators[method_name];
  Attribute.prototype[method_name] = function(value){
    return new predicate.Predicate(this, operator, value);
  }
});

Attribute.prototype.between = function(left, right){
  return new predicate.Between(this, left, right);
}

Attribute.prototype.in = function(list){
  return new predicate.In(this, list);
}

Attribute.prototype.is_null = function(){
  return new predicate.Null(this, true);
}

Attribute.prototype.is_not_null = function(){
  return new predicate.Null(this, false);
}

Attribute.prototype.name = function(){
  var out;
  if(this.itemName){
    out = "itemName()";
  }else{
    out = helpers.attr_name_escape(this._name);
    
    if(this.every){
      out = 'every'+helpers.wrapper(out);
    }
  }
  return out;
}

function itemName(){
  var attr = new Attribute("itemName()");
  attr.itemName = true;
  return attr;
}

function every(attribute){
  var attr = new Attribute(attribute._name);
  attr.every = true;
  return attr;
}

module.exports = {
  attr: Attribute,
  every: every,
  itemName: itemName,
}
