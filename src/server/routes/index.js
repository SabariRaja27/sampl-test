module.exports = function(app) {
    var api = '/api';
    var data = '/../../data/';
    
    var jsonfileservice = require('./utils/jsonfileservice')();

    app.get(api + '/beer/:id', getBeer);
    app.get(api + '/beers', getBeers);

    function getBeer(req, res, next) {
        var json = jsonfileservice.getJsonFromFile(data + 'beers.json');
        var customer = json.filter(function(c) {
            return c.id === parseInt(req.params.id);
        });
        res.send(customer[0]);
    }

    function getBeers(req, res, next) {
        var json = jsonfileservice.getJsonFromFile(data + 'beers.json');
        res.send(json);
    }
};
