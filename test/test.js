var assert = require('assert')
  , builder = require('../lib/query')
  , attr = builder.attr
  , every = builder.every
  , Query = builder.Query;

function q(){
  return (new Query).from("mydomain");
}

describe('Queries from Query 101', function(){

  describe('comparison', function(){
    operators = {
      '=': 'equal',
      '!=': 'not_equal',
      '>': 'gt',
      '>=': 'gte',
      '<': 'lt',
      '<=': 'lte',
      'LIKE': 'like',
      'NOT LIKE': 'not_like',
    }
    Object.keys(operators).forEach(function(operator){
      var method = operators[operator];
      describe(operator, function(){
        it('should filter where grade '+operator+' 1', function(){
          var grade = attr("grade");
          var query = q().where(grade[method]("1")).to_sql()
          assert.equal(query, "SELECT * FROM `mydomain` WHERE grade "+operator+" '1'")
        })
      })
    })
  })

  describe('other predicates', function(){
    describe('in', function(){
      it('should filter grade in (1,2,3)', function(){
        var grade = attr("grade");
        var query = q().where(grade.in([1,2,3])).to_sql()
        assert.equal(query, "SELECT * FROM `mydomain` WHERE grade IN ('1','2','3')")
      })
    })

    describe('between', function(){
      it('should filter grade between 1 and 3)', function(){
        var grade = attr("grade");
        var query = q().where(grade.between(1,3)).to_sql()
        assert.equal(query, "SELECT * FROM `mydomain` WHERE grade BETWEEN '1' AND '3'")
      })
    })

    var nullOperators = { 'IS NULL': 'is_null', 'IS NOT NULL': 'is_not_null' };

    Object.keys(nullOperators).forEach(function(operator){
      var method = nullOperators[operator];
      describe(operator, function(){
        it('should filter grade ' + operator, function(){
          var grade = attr("grade");
          var query = q().where(grade[method]()).to_sql()
          assert.equal(query, "SELECT * FROM `mydomain` WHERE grade " + operator)
        })
      })
    })
  })

  describe('escaping', function(){
    it('reserved keywords in attribute name should be quoted', function(){
      var where = attr("where")
      var query = q().where(where.not_equal("USA").and(where.not_equal("Canada"))).to_sql()
      assert.equal(query, "SELECT * FROM `mydomain` WHERE `where` != 'USA' AND `where` != 'Canada'");
    })

    it('not standard identifiers should be quoted', function(){
      var where = attr("1World1Dream")
      var query = q().where(where.not_equal("true")).to_sql()
      assert.equal(query, "SELECT * FROM `mydomain` WHERE `1World1Dream` != 'true'");
    })

    it("values with one single quote should be properly escaped", function(){
      var last_name = attr("last_name")
      var query = q().where(last_name.like("O'Neal%")).to_sql()
      assert.equal(query, "SELECT * FROM `mydomain` WHERE last_name LIKE 'O''Neal%'");
    })

    it("asterisk in attribute name should be escaped", function(){
      var last_name = attr("last`name")
      var query = q().where(last_name.like("O'Neal%")).to_sql()
      assert.equal(query, "SELECT * FROM `mydomain` WHERE `last``name` LIKE 'O''Neal%'");
    })

    it("domain name should be escaped (otherwise hyphens in domains break query)", function(){
      var domain = "my-domain";
      var where = attr("1World1Dream");
      var query = (new Query).from("my-domain").where(where.not_equal("true")).to_sql();
      assert.equal(query, "SELECT * FROM `my-domain` WHERE `1World1Dream` != 'true'");
    })
  })

})

describe('Projection', function(){
  it('should select all by default', function(){
    var query = q().to_sql()
    assert.equal(query, "SELECT * FROM `mydomain`");
  })

  it('should select all', function(){
    var query = q().select(Query.ALL).to_sql()
    assert.equal(query, "SELECT * FROM `mydomain`");
  })

  it('should select count(*)', function(){
    var query = q().select(Query.COUNT).to_sql()
    assert.equal(query, "SELECT COUNT(*) FROM `mydomain`");
  })

  it('should select itemName()', function(){
    var query = q().select(Query.ITEM_NAME).to_sql()
    assert.equal(query, "SELECT itemName() FROM `mydomain`");
  })
})

describe('Order', function(){
  it('should order by name and use default ordering', function(){
    var query = q().select(Query.ITEM_NAME).order(attr('name')).to_sql()
    assert.equal(query, "SELECT itemName() FROM `mydomain` ORDER BY name");
  })

  it('should order by itemName DESC', function(){
    var query = q().select(Query.ITEM_NAME).order(attr('name'), true).to_sql()
    assert.equal(query, "SELECT itemName() FROM `mydomain` ORDER BY name DESC");
  })
})

describe('Limit', function(){
  it('should limit 10', function(){
    var query = q().select(Query.ITEM_NAME).limit(10).to_sql()
    assert.equal(query, "SELECT itemName() FROM `mydomain` LIMIT 10");
  })
})

describe('More Complex Queries', function(){
  var name = attr("name")
    , email = attr("email")
    , score = attr("score")

  it('should nest correctly', function(){
    var query = q().where(
      name.equal("John").or(
        name.equal("Ben").and(email.equal("example@example.com"))
      ).and(score.equal("100"))
    ).to_sql()

    assert.equal(query, "SELECT * FROM `mydomain` WHERE name = 'John' OR (name = 'Ben' AND email = 'example@example.com') AND score = '100'")
  })

  it('should intersect correctly', function(){
    var query = q().where(name.equal("John").intersect(name.equal("Ben"))).to_sql()
    assert.equal(query, "SELECT * FROM `mydomain` WHERE (name = 'John') INTERSECTION (name = 'Ben')")
  })
})

describe('The Examples Should be Valid', function(){
  it('should pass', function(){
    var first_name = attr("first_name");
    var last_name = attr("last_name");
    var grade = attr("grade");

    var query_zero_sql = (new Query).select(Query.ALL).from("users").where(first_name.equal("John")).to_sql()
    assert.equal(query_zero_sql, "SELECT * FROM `users` WHERE first_name = 'John'")

    var query_one = new Query;
    var predicate_one = first_name.equal("John").and(grade.gt("7"))
    var query_one_sql = query_one.select(Query.COUNT).from("users").where(predicate_one).to_sql()
    assert.equal(query_one_sql, "SELECT COUNT(*) FROM `users` WHERE first_name = 'John' AND grade > '7'")

    var query_two = new Query;
    var predicate_two = first_name.equal("John").and(grade.gt("7")).intersect(first_name.equal("Joseph").and(grade.lt("8")))
    var query_two_sql = query_two.from("users").where(predicate_two).to_sql()
    assert.equal(query_two_sql, "SELECT * FROM `users` WHERE (first_name = 'John' AND grade > '7') INTERSECTION (first_name = 'Joseph' AND grade < '8')")
  })
})
