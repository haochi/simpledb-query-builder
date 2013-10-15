var inherits = require('./inherits');

function Comparision(attr, op, value){
  this.attr = attr;
  this.op = op;
  this.value = value;
  this.children = [];
  this.joiner = null;
}

Comparision.prototype.and = function(comparision){
  comparision.joiner = "AND";
  this.children.push(comparision);
  return this;
}

Comparision.prototype.or = function(comparision){
  comparision.joiner = "OR";
  this.children.push(comparision);
  return this;
}

Comparision.prototype.toString = function(){
  var value = attr_value_escape(this.value);
  return [this.attr.name(), this.op, value].join(" ");
}

Comparision.prototype.to_sql = function(){
  var me = this.toString();

  var children = this.children.map(function(comparsion){
    return [comparsion.joiner, wrapper(comparsion.to_sql())].join(" ")
  });

  if(children.length){
    return [me, children.join(" ")].join(" ");
  }else{
    return me;
  }
}

// derived classes
var Between = inherits(Comparision, function(attr, left, right){
  this.attr = attr;
  this.left = left;
  this.right = right;
});
Between.prototype.toString = function(){
  var left = attr_value_escape(this.left);
  var right = attr_value_escape(this.right);
  return [this.attr.name(), 'BETWEEN', wrapper([left, right].join(","))].join(" ");
}

var In = inherits(Comparision, function(attr, list){
  this.attr = attr;
  this.list = list;
});
In.prototype.toString = function(){
  var list = this.list.map(function(item){
    return attr_value_escape(item);
  });
  return [this.attr.name(), 'IN', wrapper(list.join(","))].join(" ");
}

var Null = inherits(Comparision, function(attr, is_null){
  this.attr = attr;
  this.op = is_null ? 'IS NULL' : 'IS NOT NULL';
});
Null.prototype.toString = function(){
  return [this.attr.name(), this.op].join(" ");
}

function intersection(){
  var list = Array.prototype.slice.call(arguments);
  return list.map(function(comparison){
    return wrapper(comparison.to_sql());
  }).join(" INTERSECT ");
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
  intersection: intersection,
  Comparision: Comparision,
  Between: Between,
  In: In,
  Null: Null,
}
