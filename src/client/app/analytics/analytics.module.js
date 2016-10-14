(function() {
    'use strict';
    angular
        .module('app.analytics', ['app.core','app.beerboard'])
        .config(config);  
    
     /* @ngInject */
     function config($httpProvider) {
        $httpProvider.interceptors.push("analyticsInterceptor");
    }
})();
