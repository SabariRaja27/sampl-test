    (function() {
    'use strict';

    angular
        .module('app.core', [
            /* Angular modules */
            'ngAnimate',
            'ngSanitize',
            /* Cross-app modules */
            'blocks.exception',
            'blocks.logger',
            'blocks.router',
            'blocks.underscore',
            /* 3rd-party modules */
            'ui.router',
            'ngplus',
            'angular-cache'
        ]);
})();
