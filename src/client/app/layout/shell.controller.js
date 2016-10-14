(function() {
    'use strict';

    angular
        .module('app.layout')
        .controller('Shell', Shell);
    /* @ngInject */
    function Shell($state,$scope,$timeout, config,logger,$rootScope,CacheFactory) {
        var vm = this;
        vm.backbutton = false;
        vm.title = config.appTitle;
        vm.busyMessage = 'Please wait ...';
        vm.imageContext = bb_config.imageContext;
        vm.isBusy = true;
        vm.showSplash = true;
        vm.tagline = {
            text: '',
            link: ''
        };

        activate();

        function activate() {
            //logger.success(config.appTitle + ' loaded!', null);
            hideSplash();
        }

        function hideSplash() {
            //Force a 1 second delay so we can see the splash.
            $timeout(function() {
                vm.showSplash = false;
            }, 1000);
        }

        $rootScope.$on(config.events.viewLoaded,
            function (event, data) {
                vm.backbutton = data.backbutton;
            }
        );
        $scope.clearCache = function(){
            CacheFactory.get('menusCache').removeAll();
            localStorage.clear();           
            $state.go('product', {}, {reload: true});
        }
    }
})();
