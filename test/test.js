var assert = require('assert')
  , builder = require('../lib/query')
  , attr = builder.attr
  , every = builder.every
  , Query = builder.Query;

function q(){
  return (new Query).from("mydomain");
}

describe('Queries from Query 101', function(){

  describe('Basic', function(){
    it('should select all from mydomain', function(){
      var query = q().to_sql()
      assert.equal(query, "SELECT * FROM mydomain");
    })
  })

  describe('=', function(){
    it('should filter where city = Seattle', function(){
      var query = q().where(attr("city").equal("Seattle")).to_sql()
      assert.equal(query, "SELECT * FROM mydomain WHERE `city` = 'Seattle'");
    })

    it('should filter where city = Seattle or city = Portland', function(){
      var city = attr("city")
      var query = q().where(city.equal("Seattle").or(city.equal("Portland"))).to_sql()
      assert.equal(query, "SELECT * FROM mydomain WHERE `city` = 'Seattle' OR `city` = 'Portland'");
    })
  })

  describe('!=', function(){
    it('should filter where name != John', function(){
      var query = q().where(attr("name").equal("John")).to_sql()
      assert.equal(query, "SELECT * FROM mydomain WHERE `name` = 'John'");
    })

    it('should filter where name != John and name != Humberto', function(){
      var name = attr("name")
      var query = q().where(name.not_equal("John").and(name.not_equal("Humberto"))).to_sql()
      assert.equal(query, "SELECT * FROM mydomain WHERE `name` != 'John' AND `name` != 'Humberto'");
    })
  })

})

describe('More Complex Queries', function(){
  it('should nest correctly', function(){
    var name = attr("name")
      , email = attr("email")
      , score = attr("score")
    var query = q().where(
      name.equal("John").or(
        name.equal("Ben").and(email.equal("example@example.com"))
      ).and(score.equal("100"))
    ).to_sql()

    assert.equal(query, "SELECT * FROM mydomain WHERE `name` = 'John' OR (`name` = 'Ben' AND `email` = 'example@example.com') AND `score` = '100'")
  })
})


