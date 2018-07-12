const reducerFunctions = {
  'average': function(seriesData) {
    const values = seriesData.map((val) => val.value);
    return values.reduce((prev, curr) => prev + curr, 0) / values.length;
  },
  'min': function(seriesData) {
    const values = seriesData.map((val) => val.value);
    return Math.min(...values);
  },
  'max': function(seriesData) {
    const values = seriesData.map((val) => val.value);
    return Math.max(...values);
  },
  'list': function(seriesData) {
    return seriesData;
  }
};

module.exports = reducerFunctions;
