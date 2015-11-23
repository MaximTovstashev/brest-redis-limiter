var _ = require('lodash');

var BrestLimiter = {

    init: function(brest, callback){
        var self = this;
        var client = brest.attachment('redis').client();
        BrestLimiter.app = brest.getApp();
        BrestLimiter.limiter = require('express-limiter')(brest.getApp(), client);
        BrestLimiter.settings = brest.getSetting('limiter', {
             global: true,
             lookup: ['connection.remoteAddress'],
             total: 150,
             expire: 60*60
        });

        if (BrestLimiter.settings.global) {
            var settings = _.defaultsDeep({
                path: '*',
                method: 'all'
            }, BrestLimiter.settings);
            BrestLimiter.limiter(settings);
        }

        //brest.getApp().use();
        callback();
    },

    resource: {
        init: function(resource, callback) {
            if (resource.description.limiter) {
                BrestLimiter.limiter(
                    _.defaultsDeep(resource.description.limiter,
                        {path: resource.getURI(),
                            method: 'all'},
                        BrestLimiter.settings));
            }

            callback(null, BrestLimiter);
        }
    },

    method: {
        init: function(method, callback) {
            if (method.description.limiter) {
                console.log('Method limiter', method.description.limiter);
                BrestLimiter.limiter(
                    _.defaultsDeep(method.description.limiter,
                            {path: method.getURI(),
                             method: 'all'},
                             BrestLimiter.settings));
            }
            callback(null, BrestLimiter);
        }
    }
};

module.exports = BrestLimiter;