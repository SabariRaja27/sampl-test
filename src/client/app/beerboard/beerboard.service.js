(function() {
    'use strict';

    angular
        .module('app.beerboard')
        .factory('beerboardservice', beerboardservice);
    /* @ngInject */
    function beerboardservice($http, $location, $q, exception, logger,common,config,beerboard,CacheFactory,$rootScope) {
        
        setCache();
        
        var readyPromise;
        var headersForGet= { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-BeerBoard-API-Key' : beerboard.apiKey};
        var restApiHost = bb_config.restApiHost;
        var awsApiHost = bb_config.awsApiHost;
        var exceptionalEmailApi = bb_config.exceptionalEmailApi;
        $rootScope.keyDuplicationCheck = false;
        var service = {
            getLocations: getLocations,
            getLocation: getLocation,
            getMenus: getMenus,
            getMenu: getMenu,
            sendEmail: sendEmail,
          //  getBeer: getBeer,
            getLocationsDeltaChanges: getLocationsDeltaChanges,
            ready: ready
        };

        return service;
        
        
         function getLocations(req) {
             
           // logger.info('getLocations (start) '); 
            var deferred = $q.defer(); //promise
            $http({
                method: 'GET',
                url: restApiHost + 'bbtv/getBBTVLocations',
                //data: req,
                headers: headersForGet,
                cache: CacheFactory.get('locationCache')
            }).success(function (data, status, headers, config) {
                deferred.resolve(data);
            }).error(function (data, status, headers, config) {
                deferred.reject(status);
            });
           //  logger.info('getLocations (end)'); 
            return deferred.promise;
        }
        
        
         function getLocation(req) {
            
         }
        
         function getMenus(req) { 
             
            
             var deferred = $q.defer(); //promise
            $http({
                method: 'GET',
                url: restApiHost + 'bbtv/getBeerBoardMenuData?locationId=' + req.locationId + '&bar_id=' + req.bar_id + '&product_type=' + req.product_type,
                headers: headersForGet,
                cache: CacheFactory.get('menusCache')
            }).success(function (data, status, headers, config) {
                deferred.resolve(data);
            }).error(function (data, status, headers, config) {
                deferred.reject(status);
            });
            return deferred.promise;
         }
         function sendEmail(req) {        
            
            var deferred = $q.defer(); //promise
           // var jsonData = JSON.stringify(req);
            $http({
                method: 'POST',
                url: exceptionalEmailApi ,
                data: req ,
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json'}
                
            }).success(function (data, status, headers, config) {
                deferred.resolve(data);
            }).error(function (data, status, headers, config) {
                deferred.reject(status);
            });
            return deferred.promise;
         }

         function getMenu(req) {
           
         }
        
         function getLocationsDeltaChanges(req) {
             var deferred = $q.defer(); //promise
            $http({
                method: 'GET',
                url: restApiHost + 'bbtv/getBeerBoardTvUpdates?timeStamp=' + req.timeStamp,
                //data: req,
                headers: headersForGet
            }).success(function (data, status, headers, config) {
                deferred.resolve(data);
            }).error(function (data, status, headers, config) {
                deferred.reject(status);
            });
            return deferred.promise;
         }
        /*as we are using getMenus function instead of getBeer to get beerDetails,we don't need this cache method*/
         /*function getBeer(req) {
             
             var deferred = $q.defer(); //promise
            $http({
                method: 'GET',
                url: restApiHost + 'beerDetails?beerId=' + req.Id,
                //data: req,
                headers: headersForGet,
                cache: CacheFactory.get('beerCache')
            }).success(function (data, status, headers, config) {
                deferred.resolve(data);
            }).error(function (data, status, headers, config) {
                deferred.reject(status);
            });
            return deferred.promise;
         }*/


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
        
        function setCache(){
            CacheFactory('locationCache', {
                maxAge: 15 * 60 * 1000, // Items added to this cache expire after 15 minutes
                cacheFlushInterval: null, // This cache will clear itself every hour
                deleteOnExpire: 'none', // Items will be deleted from this cache when they expire
                storageMode: 'localStorage' // This cache will use `localStorage`.
              });
           
            CacheFactory('menusCache', { 
                maxAge: 10 * 60 * 1000, // Items added to this cache expire after 15 minutes
                cacheFlushInterval: null, // This cache will clear itself every hour
                deleteOnExpire: 'aggressive', // Items will be deleted from this cache when they expire
                onExpire: function (key, value) { //Added by Kamal, when maxAge completes calling API to get updated values
                    var _this = this;
                    
                    //key.headers = headersForGet;
                    console.log('key= ' + key);
                    $rootScope.keyDuplicationCheck = key.includes('locationId=' + bb_config.locationId);
                    var deferred = $q.defer(); //promise
                    $http({
                        method: 'GET',
                        url: key,
                        //data: req,
                        headers: headersForGet,
                        cache: CacheFactory.get('beerCache')
                        }).success(function (data, status, headers, config) {
                       // console.log(JSON.stringify(data));

                            $rootScope.currentBeerList = JSON.stringify(data);
                            /*comparing the old data with new data*/
                            $rootScope.comparedBeerData = _.isEqual($rootScope.initialBeerList, $rootScope.currentBeerList );
                            /*if there is any data changes happens ,the changed data will be used*/
                            
                                if(!$rootScope.comparedBeerData && $rootScope.keyDuplicationCheck){
                                /*flag to mention the beerdata has been changed*/
                                $rootScope.isBeerDataChanged = true;
                                console.log('success API response, update new data into local cache');
                                _this.put(key, data);  
                                }
                                else{
                                    console.log('success API response, No change in response data, Loading old data');
                                    _this.put(key, value);
                                }
                            
                                                    
                        }).error(function (data, status, headers, config) {
                        console.log('Error in API response ,loading old data');
                        _this.put(key, value);
                    });
                    
                },
                storageMode: 'localStorage' // This cache will use `localStorage`.
              });
             /*as we are using getMenus function instead of getBeer to get beerDetails,we don't need this cache method*/
            /*CacheFactory('beerCache', {
                maxAge: 15 * 60 * 1, // Items added to this cache expire after 15 minutes
                cacheFlushInterval: 60 * 60 * 1000, // This cache will clear itself every hour
                deleteOnExpire: 'none', // Items will be deleted from this cache when they expire
                storageMode: 'localStorage' // This cache will use `localStorage`.
              });*/
            
        }

    }
})();
