var Attribute = require('./attribute')
  , predicate = require('./predicate')
  , attr = Attribute.attr
  , every = Attribute.every
  , itemName = Attribute.itemName()

function Query(){
  this.projection = Query.ALL;
  this.domain = null;
  this.expression = null;
  this.order_by = null;
  this.desc = false;
  this.take = null;
}
Query.ALL = 1;
Query.ITEM_NAME = 2;
Query.COUNT = 3;

Query.prototype.select = Query.prototype.project = function(projection){
  this.projection = projection;
  return this;
}

Query.prototype.from = function(domain){
  this.domain = domain;
  return this;
}

Query.prototype.where = function(expression){
  this.expression = expression;
  return this;
}

Query.prototype.order = function(attr, desc){
  this.order_by = attr;
  this.desc = !!desc;
  return this;
}

Query.prototype.limit = function(take){
  this.take = take;
  return this;
}

Query.prototype.to_sql = function(){
  var query = [];
  var projection = (function(me){
    var p = me.projection;
    if(p === Query.ALL){
      return "*";
    }else if(p === Query.ITEM_NAME){
      return itemName.name();
    }else if(p === Query.COUNT){
      return "COUNT(*)";
    }else if(typeof p === 'string'){
      return p;
    }else{
      return p.map(function(attr){
        return attr.name();
      }).join(",");
    }
  })(this);
  query.push("SELECT");
  query.push(projection);
  query.push("FROM");
  query.push(this.domain);
  if(this.expression){
    query.push("WHERE");
    query.push(this.expression.to_sql());
  }
  if(this.order_by){
    query.push("ORDER BY");
    query.push(this.order_by.name());
    if(this.desc){
      query.push("DESC");
    }
  }
  if(this.take){
    query.push("LIMIT");
    query.push(this.take);
  }
  return query.join(' ');
}

module.exports = {
  attr: attr,
  every: every,
  itemName: Attribute.itemName,
  Query: Query,
}
