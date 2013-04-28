var filter = exports.filter = function(filterObj,set) {
  // If an empty object is passed in either argument, return the set
  if (Object.keys(filterObj).length===0 || Object.keys(set).length===0) return set;
  var out={};
  for (var i in set) {
    if (set.hasOwnProperty(i)) {
      var filterMatched = 0;
      var filterLength = Object.keys(filterObj).length;
      for (var f in filterObj) {
        if (filterObj.hasOwnProperty(f)) {
          if (set[i].hasOwnProperty(f) && set[i][f] == filterObj[f]) 
            filterMatched++;
        }
      }
      if (filterMatched === filterLength) out[i] = set[i];
    }
  }
  return out;
};

exports.findSubDevice = function(filterObj,set) {
  var out={};
  for (var i in set) {
    if (set[i].hasOwnProperty('subDevices')) {
      var subDevices = set.subDevices;
      var filterMatched = 0;
      var filterLength = Object.keys(filterObj).length;
      var returned = filter(filterObj,set[i].subDevices);
      if (Object.keys(returned).length>0) {
        for (var r in returned) {
          if (returned.hasOwnProperty(r)) {
            out[r] = returned[r];
            out[r].guid = i;
          }
        }
      }
    }
  } 
  return out;
};