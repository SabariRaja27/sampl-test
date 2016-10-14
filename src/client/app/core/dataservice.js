(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('dataservice', dataservice);

    dataservice.$inject = ['$http', '$location', '$q', 'exception', 'logger'];
    /* @ngInject */
    function dataservice($http, $location, $q, exception, logger) {
        var readyPromise;

        var service = {
            getBeer: getBeer,
            getBeers: getBeers,
            ready: ready
        };

        return service;

        function getBeer(id) {
            return $http.get('/api/beer/' + id)
                .then(getBeerComplete)
                .catch(function(message) {
                    exception.catcher('XHR Failed for getCustomer')(message);
                    $location.url('/');
                });

            function getBeerComplete(data, status, headers, config) {
                return data.data;
            }
        }

        function getBeers() {
            return $http.get('/api/beers')
                .then(getBeersComplete)
                .catch(function(message) {
                    exception.catcher('XHR Failed for getCustomers')(message);
                    $location.url('/');
                });

            function getBeersComplete(data, status, headers, config) {
                return data.data;
            }
        }

        function getReady() {
            if (!readyPromise) {
                // Apps often pre-fetch session data ("prime the app")
                // before showing the first view.
                // This app doesn't need priming but we add a
                // no-op implementation to show how it would work.
                logger.info('Primed the app data');
                readyPromise = $q.when(service);
            }
            return readyPromise;
        }

        function ready(promisesArray) {
            return getReady()
                .then(function() {
                    return promisesArray ? $q.all(promisesArray) : readyPromise;
                })
                .catch(exception.catcher('"ready" function failed'));
        }
    }
})();
