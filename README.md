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
* `Query#order(order_by:Attribute, desc=false)`: Order result by `order_by`.
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

    (new Query).select(Query.ALL).from("users").where(first_name.equal("John")).to_sql()
    // SELECT * FROM users WHERE first_name = 'John'

    var query_one = new Query;
    var predicate_one = first_name.equal("John").and(grade.gt("7"))
    query_one.select(Query.COUNT).from("users").where(predicate_one).to_sql()
    // SELECT COUNT(*) FROM users WHERE first_name = 'John' AND grade > '7'

    var query_two = new Query;
    var predicate_two = first_name.equal("John").and(grade.gt("7")).intersect(first_name.equal("Joseph").and(grade.lt("8")))
    query_two.from("users").where(predicate_two).to_sql()
    // SELECT * FROM users WHERE (first_name = 'John' AND grade > '7') INTERSECTION (first_name = 'Joseph' AND grade < '8')
