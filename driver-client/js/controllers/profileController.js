angular.module('driverSide.profile', ['ngCookies'])
.controller('profileController', function($scope, $http, $rootScope, $cookies){
  $scope.socket;
  $scope.socket = io();
  $scope.userId = JSON.parse($cookies.get('user')).id;
  $scope.orders = [];
  $scope.ordersDone = 0;
  $scope.jobId = null;

  $scope.hasJob;

  $rootScope.socketConnect = function(){
    $scope.socket.on('dequeue', function(job){
      if (job === false){
        console.log('empty job');
        return;
      }

      $scope.ordersIds = [];
      $scope.jobId = job.jobId;

      for (var i=0; i<job.orders.length; i++){
        $scope.ordersIds.push(job.orders[i].id);
      }

      $http({
        method: "POST",
        url: '/api/getorders',
        data: { 
          orderIds: $scope.ordersIds,
          userId: $scope.userId
        }
      }).then(function(result){
        $scope.orders = result.data;
        $scope.hasJob = true;
        console.log("here are the orders",$scope.orders)
      });
    });
  };

  $scope.checkJobs = function(){
    $http({
      method: "GET",
      url: '/api/myJob'
    }).then(function(result){

      var job = result.data;
      job = JSON.parse(job);
      if (!job){
        $scope.hasJob = false;
        console.log("this is the value of hasJob if no job was returned", $scope.hasJob)
      }else{
        $scope.hasJob = true;
        // var parsedOrders = JSON.parse(job);
        $scope.orders = job;
        console.log("this is the value of hasJob if a job was returned", $scope.hasJob)
      }
    });
  };

  $scope.doneOrderIsReady = function(orderId){
    $http({
      method: "POST",
      url: 'http://127.0.0.1:8000/api/driverNotifications/doneOrderReceived',
      data: { orderId: orderId }
    }).then(function(result){
      
    });
  };

  $scope.doneOrderIsOnItsWay = function(orderId){
    $http({
      method: "POST",
      url: 'http://127.0.0.1:8000/api/driverNotifications/doneInProgress',
      data: { orderId: orderId }
    }).then(function(result){
      
    });
  };

  $scope.doneOrderDelivered = function(orderId){
    $http({
      method: "POST",
      url: 'http://127.0.0.1:8000/api/driverNotifications/doneOntheWay',
      data: { orderId: orderId }
    }).then(function(result){
      $scope.ordersDone++;
      if ($scope.ordersDone === $scope.orders.length){
        $http({
          method: "POST",
          url: '/api/finishJob',
          data: { 
            jobId: $scope.jobId,
            userId: $scope.userId 
          }
        }).
        then(function(result){
          $scope.ordersDone = 0;
          $scope.orders = [];
          $scope.hasJob = false;
        });
      }
    });
  };

  $scope.getJob = function(){
    $scope.socket.emit('request', $scope.userId);
  };
});