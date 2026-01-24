var app = angular.module('FitnessApp', []);

app.controller('MainCtrl', function ($scope, $interval, $timeout, $http) {
    console.log("App Started!");

    $scope.page = 5;

    $scope.pg_up = function(){
        $scope.page ++;
    };
   
});