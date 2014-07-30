'use strict';

/**
 * @ngdoc function
 * @name schemajsonApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the schemajsonApp
 */
angular.module('schemajsonApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
