SimpleDB Query Builder
======================

AWS's Node.js SDK doesn't support building SimpleDB select queries and hand writing/concatenating them feels weird, so I wrote this library to allow these queries to be built programatically.

API
---

There are three classes in this library, `Query`, `Comparison`, and `Attribute`. You probably won't be interacting the `Comparison` class directly, but instead using it through `Attribute`.

### Query

#### Class Variables

* `Query.ALL`
* `Query.ITEM_NAME`
* `Query.COUNT`

These are options for `Query#select`.

#### Methods

* `Query#select(param)`: Sets the attributes to return. `param` can be `Query.ALL`, `Query.ITEM_NAME`, `Query.COUNT`, a string of attributes (e.g. `'attr1,attr2,...attrN'`), or an array of `Attribute`s.
* `Query#from(domain:String)`: Sets the domain to select from.
* `Query#where(comparison:Comparison)`: Sets the `where` part of the query.
* `Query#intersect(comparison)`: Intersects another comparison. Essentially it will be `(this INTERSECTION comparison)`.
* `Query#order(order_by: String, desc=false)`: Order result by `order_by`.
* `Query#limit(take:Number)`: Limit the number of rows to return.
* `Query#to_sql()`: Returns to string representation in quasi-SQL format.

### Comparison

#### Class Methods

* `Comparison#and`: Logically `AND` two comparisons
* `Comparison#or`: Logically `OR` two comparisons
* `Comparison#to_sql`: Returns the comparison in qualsi-SQL format.


### Attribute

#### Class Methods

* `itemName()`: creates a `itemName()` attribute so it doesn't get escaped on serialization.

#### Methods
* `new Attribute(name)`: Creates a new attribute with the attribute name `name` 
* `Attribute#equal(value:String)`: The equivalent of the SQL comparison `name = value`
* Similar methods are implemnted for:
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

    var comparison = first_name.equal("john")
      .and(last_name.not_equal("smith"))
      .and(grade.equal("8")
          .or(grade.equal("9")))
      .or(last_name.is_null())
      .and(last_name.is_not_null())
      .and(every(last_name).in([1]))

    var query = new Query();
    query.select(Query.ALL).where(comparison).from("users").order("first_name");
    query.limit(10);

    console.log(query.to_sql())
