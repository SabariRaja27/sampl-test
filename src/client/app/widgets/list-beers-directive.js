(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('listBeers', listBeers);

    /* @ngInject */
    function listBeers (config,logger,$timeout,$rootScope) {
        //logger.info("Inside listBeers");       
        var directive = {
            scope: {              
                 'beers' : '@',
                  'links' : '=' 
            },
            templateUrl: 'app/widgets/widget-beers.html',
            restrict: 'E',
            link: function(scope, element) {
                $timeout(function() {
                  $('.carousel').carousel({
                        interval: $rootScope.menuDelay
                    });
                  //$('.carousel-inner .item',element).first().addClass('active');
                });
              },
            /* @ngInject */
            controller : function($scope,$rootScope){
                $scope.grouptitle=true;
                $scope.data =  JSON.parse($scope.beers);
                $scope.slideTimeInterval = $rootScope.menuDelay;
                if(bb_config.enableGroup != true){
                    $scope.grouptitle=false;
                }
                
            }
        };
        return directive;        
    }
})();