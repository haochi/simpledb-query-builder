var inherits = require('./inherits');

function Predicate(attr, op, value){
  this.attr = attr;
  this.op = op;
  this.value = value;
  this.children = [];
  this.intersections = [];
  this.joiner = null;
}

Predicate.prototype.and = function(predicate){
  predicate.joiner = "AND";
  this.children.push(predicate);
  return this;
}

Predicate.prototype.or = function(predicate){
  predicate.joiner = "OR";
  this.children.push(predicate);
  return this;
}

Predicate.prototype.intersect = function(predicate){
  this.intersections.push(predicate);
  return this;
}

Predicate.prototype.toString = function(){
  var value = attr_value_escape(this.value);
  return [this.attr.name(), this.op, value].join(" ");
}

Predicate.prototype.to_sql = function(){
  var me = this.toString();

  var children = this.children.map(function(comparsion){
    return [comparsion.joiner, wrapper(comparsion.to_sql())].join(" ")
  });
  children.unshift(me);
  var current = children.join(" ");

  var intersections = this.intersections.map(function(comparsion){
    return wrapper(comparsion.to_sql());
  });
  // wrap current if there are any intersections
  if(intersections.length) current = wrapper(current);
  intersections.unshift(current);

  return intersections.join(" INTERSECTION ");
}

// derived classes
var Between = inherits(Predicate, function(attr, left, right){
  this.attr = attr;
  this.left = left;
  this.right = right;
});
Between.prototype.toString = function(){
  var left = attr_value_escape(this.left);
  var right = attr_value_escape(this.right);
  return [this.attr.name(), 'BETWEEN', wrapper([left, right].join(","))].join(" ");
}

var In = inherits(Predicate, function(attr, list){
  this.attr = attr;
  this.list = list;
});
In.prototype.toString = function(){
  var list = this.list.map(function(item){
    return attr_value_escape(item);
  });
  return [this.attr.name(), 'IN', wrapper(list.join(","))].join(" ");
}

var Null = inherits(Predicate, function(attr, is_null){
  this.attr = attr;
  this.op = is_null ? 'IS NULL' : 'IS NOT NULL';
});
Null.prototype.toString = function(){
  return [this.attr.name(), this.op].join(" ");
}

// helpers

function wrapper(str){
  return "("+str+")";
}
function attr_value_escape(value){
  return "'"+str(value).replace(/'/g, "''")+"'";
}
function str(obj){
  return ''+obj;
}

// exports

module.exports = {
  Predicate: Predicate,
  Between: Between,
  In: In,
  Null: Null,
}
