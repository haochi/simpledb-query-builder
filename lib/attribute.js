var comparison = require('./comparison');

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
  like: "like",
  not_like: "not like",
};

Object.keys(simple_operators).forEach(function(method_name){
  var operator = simple_operators[method_name];
  Attribute.prototype[method_name] = function(value){
    return new comparison.Comparision(this, operator, value);
  }
});

Attribute.prototype.between = function(left, right){
  return new comparison.Between(this, left, right);
}

Attribute.prototype.in = function(list){
  return new comparison.In(this, list);
}

Attribute.prototype.is_null = function(){
  return new comparison.Null(this, true);
}

Attribute.prototype.is_not_null = function(){
  return new comparison.Null(this, false);
}

Attribute.prototype.name = function(){
  var out;
  if(this.itemName){
    out = "itemName()";
  }else{
    out = "`"+this._name.replace(/`/g, "``")+"`";
    
    if(this.every){
      out = 'every'+wrapper(out);
    }
  }
  return out;
}

function itemName(){
  var attr = new Attribute("itemName()");
  attr.itemName = true;
  return attr;
}

function wrapper(str){
  return "("+str+")";
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
