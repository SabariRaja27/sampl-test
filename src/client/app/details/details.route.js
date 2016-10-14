(function() {
    'use strict';

    angular
        .module('app.details')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'details',
                config: {
                    url: '/' + bb_config.locationId + '/' + bb_config.templateId + '/beer/' + '{id:int}' ,
                    templateUrl: 'app/details/details.html',
                    controller: 'Details',
                    controllerAs: 'vm',
                    title: ' - Beer',
                    settings: {
                        nav: 2
                    }
                }
            }
        ];
    }
})();
