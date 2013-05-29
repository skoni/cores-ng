(function() {

  var module = angular.module('cores.services');

  // Get a new file id

  var getFileId = (function(id) {
    return function() { return ++id; };
  })(0);


  // Get a new ref/submodule id

  var getRefId = (function(id) {
    return function() { return ++id; };
  })(0);

  // watch the scope for changes until condition() returns true and call then()

  function watchUntil(scope, condition, then) {
    var unwatch = scope.$watch(function(scope) {
      if (condition(scope)) {
        unwatch();
        then(scope);
      }
    });
  }


  function StandardCtrl($scope) {
    var unwatch = $scope.$watch('model', function stdWatch() {
      unwatch();
      $scope.$emit('ready');
    });
  }
  
  
  module.service('crCommon', function() {
    return {
      getFileId: getFileId,
      getRefId: getRefId,

      watchUntil: watchUntil,
      
      StandardCtrl: StandardCtrl
    };
  });

})();