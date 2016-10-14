(function() {
    'use strict';

    angular
        .module('app.product')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates(), '/' + bb_config.locationId + '/' + bb_config.templateId);
    }

    function getStates() {
        return [
            {
                state: 'product',
                config: {
                    url: '/' + bb_config.locationId + '/' + bb_config.templateId,
                    templateUrl: 'app/product/product.html',
                    controller: 'Product',
                    controllerAs: 'vm',
                    title: '/' + bb_config.locationId,
                    settings: {
                        nav: 1
                    }
                }
            }
        ];
    }
})();
