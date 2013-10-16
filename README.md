SimpleDB Query Builder
======================

AWS's Node.js SDK doesn't support building SimpleDB select queries and hand writing/concatenating them feels weird, so I wrote this library to allow these queries to be built programatically.

API
---

There are three classes in this library, `Query`, `Predicate`, and `Attribute`. You probably won't be interacting the `Predicate` class directly, but instead using it through `Attribute`.

### Query

#### Class Variables

* `Query.ALL`
* `Query.ITEM_NAME`
* `Query.COUNT`

These are options for `Query#select`.

#### Class Methods

* `itemName()`: creates a `itemName()` attribute so it doesn't get escaped on serialization.

#### Methods

* `Query#select(param)`: Sets the attributes to return. `param` can be `Query.ALL`, `Query.ITEM_NAME`, `Query.COUNT`, a string of attributes (e.g. `'attr1,attr2,...attrN'`), or an array of `Attribute`s.
* `Query#from(domain:String)`: Sets the domain to select from.
* `Query#where(predicate:Predicate)`: Sets the `where` part of the query.
* `Query#intersect(predicate:Predicate)`: Intersects another predicate. Essentially it will be `(this INTERSECTION predicate)`.
* `Query#order(order_by: String, desc=false)`: Order result by `order_by`.
* `Query#limit(take:Number)`: Limit the number of rows to return.
* `Query#to_sql()`: Returns to string representation in quasi-SQL format.

### Predicate

#### Class Methods

* `Predicate#and(predicate)`: Logically `AND` two predicates
* `Predicate#or(predicate)`: Logically `OR` two predicates
* `Predicate#to_sql()`: Returns the predicate in quasi-SQL format.


### Attribute

#### Methods
* `new Attribute(name:String)`: Creates a new attribute with the attribute name `name` 
* `Attribute#equal(value:String)`: The equivalent of the SQL predicate `name = value`
* Similar methods are implemented for:
    * `not_equal`
    * `like`
    * `not_like`
    * `gt`: Greater than
    * `gte`: Greater than or equal to
    * `lt`: Less than
    * `lte`: Less than or equal to
* `between(left:String, right:String)`: Equivalent of `name BETWEEN left AND right`
* `in(list:Array)`: Equivalent of `name IN (list_item_1, ..., list_item_N)`
* `is_null()`: Equivalent of `name IS NULL`
* `is_not_null()`

### Example

    var builder = require('simpledb-query-builder')
      , attr = builder.attr
      , every = builder.every
      , Query = builder.Query;

    var first_name = attr("first_name");
    var last_name = attr("last_name");
    var grade = attr("grade");

    var predicate = first_name.equal("john")
      .and(last_name.not_equal("smith"))
      .and(grade.equal("8")
          .or(grade.equal("9")))
      .or(last_name.is_null())
      .and(last_name.is_not_null())
      .and(every(last_name).in([1]))
      .intersect(last_name.equal("johnson"))

    var query = new Query();
    query.select(Query.ALL).where(predicate).from("users").order(builder.itemName());
    query.limit(10);

    console.log(query.to_sql())
