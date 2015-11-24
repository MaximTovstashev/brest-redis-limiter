var _ = require('lodash');

var BrestLimiter = {

    init: function(brest, callback){
        var self = this;
        var client = brest.attachment('redis').client();
        BrestLimiter.limiter = require('./limiter')(brest.getApp(), client);
        BrestLimiter.settings = brest.getSetting('limiter', {
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

        callback();
    },

    resource: {
        init: function(resource, callback) {
            if (resource.description.limiter) {
                var settings = _.defaultsDeep(resource.description.limiter, BrestLimiter.settings);
                settings.path = resource.getURI();
                settings.method = 'all';
                BrestLimiter.limiter(settings);
            }
            callback(null, BrestLimiter);
        }
    },

    method: {
        init: function(method, callback) {
            var settings = {};
            if (method.description.limiter) {
                settings = _.defaults(method.description.limiter, BrestLimiter.settings);
                settings.method = method.getMethod().toLowerCase();
                settings.path = method.getURI();
                BrestLimiter.limiter(settings);

            }
            if (BrestLimiter.settings.whenAuth && !method.description.noAuth) {
                settings = _.defaults(BrestLimiter.settings.whenAuth, BrestLimiter.settings);
                settings.method = method.getMethod().toLowerCase();
                settings.path = method.getURI();
                BrestLimiter.limiter(settings);
            }
            callback(null, BrestLimiter);
        }
    }
};

module.exports = BrestLimiter;