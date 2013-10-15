var query = require('./query')
  , attr = query.attr
  , every = query.every
  , Query = query.Query;

var first_name = attr("first_name");
var last_name = attr("last_name");
var grade = attr("grade");

var query = first_name.equal("haochi")
  .and(last_name.not_equal("yahoo"))
  .and(grade.equal("7"))
  .and(grade.equal("8")
      .or(grade.equal("9")))
  .or(grade.equal("10"))
  .or(last_name.not_like("a''bcdefg%")
      .or(last_name.between("a", "b")
        .and(first_name.not_like("abc"))))
  .or(last_name.in([1,2,3]))
  .or(last_name.is_null())
  .and(last_name.is_not_null())
  .and(every(last_name).in([1]))


var query2 = first_name.equal("haochi").and(last_name.equal("chen"))

var query3 = new Query();
query3.select(Query.ALL).where(query).from("users").order("first_name");
query3.limit(10);

console.log(query3.to_sql())

/*
class attr -> creates attribute
  all methods returns a Comparison object
  * equal
  * not_equal
  * ...

class Comparison
  * and
  * or

every(attr) -> creates `every` attribute
intersection(*comparsion)
*/
