(function() {
    'use strict';

    angular
        .module('app.product')
        .factory('ProductService', ProductService);
    /* @ngInject */
    function ProductService($http, $location, $q, exception, logger,common,config) {

        var readyPromise;

        var service = {
            getProduct: getProduct,
            getProducts: getProducts,
            ready: ready
        };

        return service;

        function getProduct(req) {
            var deferred = $q.defer(); //promise
            $http({
                method: 'GET',
                url: config.restApiHost + '/product/' + req.id,
                //data: req,
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json'}
            }).success(function (data, status, headers, config) {
                deferred.resolve(data);
            }).error(function (data, status, headers, config) {
                deferred.reject(status);
            });
            return deferred.promise;
        }

        function getProducts(req) {
            var deferred = $q.defer(); //promise
            $http({
                method: 'GET',
                url: config.restApiHost + 'beers.json',
                //data: req,
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json'}
            }).success(function (data, status, headers, config) {
                deferred.resolve(data);
            }).error(function (data, status, headers, config) {
                deferred.reject(status);
            });
            return deferred.promise;
        }

        function ready(promisesArray) {
            return getReady()
                .then(function() {
                    return promisesArray ? $q.all(promisesArray) : readyPromise;
                })
                .catch(exception.catcher('"ready" function failed'));
        }

        function getReady() {
            if (!readyPromise) {
                // Apps often pre-fetch session data ("prime the app")
                // before showing the first view.
                // This app doesn't need priming but we add a
                // no-op implementation to show how it would work.
                //logger.info('Primed the app data');
                readyPromise = $q.when(service);
            }
            return readyPromise;
        }

    }
})();
