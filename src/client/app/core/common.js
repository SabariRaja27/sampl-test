(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('common', common);
    /* @ngInject */
    function common($q, $rootScope, $timeout, logger,config) {
        var service = {

            // common angular dependencies
            $broadcast: $broadcast,
            $q: $q,
            $timeout: $timeout,
            logger: logger,
            activateController: activateController
        };

        return service;

        function activateController(promises, controllerId) {
            return $q.all(promises).then(function (eventArgs) {
                var data = { controllerId: controllerId };
                $broadcast(config.events.controllerActivateSuccess, data);
            });
        }

        function $broadcast() {
            return $rootScope.$broadcast.apply($rootScope, arguments);
        }
    }
}());
