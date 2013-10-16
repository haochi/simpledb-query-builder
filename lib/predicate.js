var inherits = require('./inherits');
var helpers = require('./helpers');

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
  var value = helpers.attr_value_escape(this.value);
  return [this.attr.name(), this.op, value].join(" ");
}

Predicate.prototype.to_sql = function(){
  var me = this.toString();

  var children = this.children.map(function(comparsion){
    var right = comparsion.to_sql();
    if(comparsion.children.length){
      right = helpers.wrapper(right);
    }
    return [comparsion.joiner, right].join(" ")
  });
  children.unshift(me);
  var current = children.join(" ");

  var intersections = this.intersections.map(function(comparsion){
    return helpers.wrapper(comparsion.to_sql());
  });
  // wrap current if there are any intersections
  if(intersections.length) current = helpers.wrapper(current);
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
  var left = helpers.attr_value_escape(this.left);
  var right = helpers.attr_value_escape(this.right);
  return [this.attr.name(), 'BETWEEN', helpers.wrapper([left, right].join(","))].join(" ");
}

var In = inherits(Predicate, function(attr, list){
  this.attr = attr;
  this.list = list;
});
In.prototype.toString = function(){
  var list = this.list.map(function(item){
    return helpers.attr_value_escape(item);
  });
  return [this.attr.name(), 'IN', helpers.wrapper(list.join(","))].join(" ");
}

var Null = inherits(Predicate, function(attr, is_null){
  this.attr = attr;
  this.op = is_null ? 'IS NULL' : 'IS NOT NULL';
});
Null.prototype.toString = function(){
  return [this.attr.name(), this.op].join(" ");
}

// exports

module.exports = {
  Predicate: Predicate,
  Between: Between,
  In: In,
  Null: Null,
}
