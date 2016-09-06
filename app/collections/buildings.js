define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var urlTemplate = _.template(
    "https://<%= cartoDbUser %>.carto.com/api/v2/sql"
  );

  var CityBuildingQuery = function(table_name, categories, ranges) {
    this.tableName = table_name;
    this.categories = categories;
    this.ranges = ranges;
  };

  CityBuildingQuery.prototype.toRangeSql = function() {
    return _.map(this.ranges, function(range){
      return range.field + " BETWEEN " + range.min + " AND " + range.max;
    });
  };

  CityBuildingQuery.prototype.toWrappedValue = function(value) {
    return "'" + value + "'";
  };

  CityBuildingQuery.prototype.toCategorySql = function() {
    var self = this;
    return _.map(this.categories, function(category){
      var operation = (category.other === 'false' || category.other === false) ? "IN" : "NOT IN",
          values = _.map(category.values, self.toWrappedValue);
      if (values.length === 0) return "";
      return category.field + " " + operation + " (" + values.join(', ') + ")";
    });
  };

  CityBuildingQuery.prototype.toSql = function() {
    var table = this.tableName;
    var rangeSql = this.toRangeSql();
    var categorySql = this.toCategorySql();
    var filterSql = rangeSql.concat(categorySql).join(' AND ');
    var output = ["SELECT ST_X(the_geom) AS lng, ST_Y(the_geom) AS lat,* FROM " + table].concat(filterSql).filter(function(e) { return e.length > 0; });
    return output.join(" WHERE ");
  };

  var CityBuildings = Backbone.Collection.extend({


  });

  return CityBuildings;
});
