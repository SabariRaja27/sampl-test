/* 
This file will be dynamically while creating website by Lambda service
*/
(function() {
    'use strict';

    angular
        .module('app.beerboard')       
        .constant('beerboard', {locationId: '1063'
                                , version : '1.0.0'
                                , createdAt : ''
                                , modifiedAt : ''
                                , restApiHost : 'http://api.beerboard.com/nodejsserver/'   
                                , awsApiHost: 'https://who6hlymp2.execute-api.us-east-1.amazonaws.com/tst/'
                                , apiKey : '7d58317f9276019ce8dc7bebac913090'});
})();
