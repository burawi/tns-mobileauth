var fs = require("file-system");
var fetchModule = require("fetch");


module.exports = function (origin,lang,test) {

    var langDefaults = {
        error: 'Error',
        ok: 'OK'
    };

    lang = Object.assign({},langDefaults,lang);
    if(test === undefined) test = false;

    var ajax = require('tns-ajax')(test);

    var AlertFail = function (response,fail) {
        alert({
            title: lang.error,
            message: response.msg,
            okButtonText: lang.ok
        });
        if(fail !== undefined) fail(response);
    };

    var exports = {};

    exports.getSessionFile = function(){
        var documents = fs.knownFolders.documents();
        var sessionFile = documents.getFile("session.txt");
        return sessionFile;
    };

    exports.getClientSession = function(success,fail) {
        var sessionFile = exports.getSessionFile();
        sessionFile.readText().then(function(txt){
            if(txt.length != 0){
                var session = {};
                try {
                    session = JSON.parse(txt);
                } catch(e){}
                if(session.hasOwnProperty('sessionId') && session.hasOwnProperty('secretKey')){
                    success(session);
                }else{
                    if(test) console.log('Session has not right properties');
                    fail();
                }
            }else{
                if(test) console.log('Session file is empty');
                fail();
            }
        }, function (error) {
            console.log(error);
        });
    };

    exports.getSessionServer = function(session,uri,callback) {
        uri = origin + uri;
        var json = {session: session};
        ajax.post(uri,json,function (sessionServer) {
            callback(sessionServer);
        });
    };

    exports.ifSessionOk = function(uri,fn,ifNotFn) {
        exports.getClientSession(function (session) {
            exports.getSessionServer(session,uri, function (sessionServer) {
                if(sessionServer.success){
                    fn(sessionServer);
                }else{
                    if(test) console.log('Session does not match in server');
                    ifNotFn();
                }
            });
        },function () {
            ifNotFn();
        });
    };

    exports.login = function(uri,user,success,fail) {
        uri = origin + uri;
        ajax.post(uri,user,function (response) {
            if (response.success) {
                var sessionFile = exports.getSessionFile();
                var session = {
                    sessionId: response.sessionId,
                    secretKey: response.secretKey
                };
                sessionFile.writeTextSync(JSON.stringify(session));
                success(response)
            } else {
                AlertFail(response,fail);
            }
        });
    };
    
    exports.logout = function (callback) {
        var sessionFile = exports.getSessionFile();
        sessionFile.remove().then(function() {
            callback();
        });
    };

    exports.postWithSession = function (uri,json,success,fail) {
        uri = origin + uri;
        json = {
            operation: json
        };
        if(test) console.log('Executing session.postWithSession');
        exports.getClientSession(function (session) {
            json.session = session;
            if(test) console.log('Got Session in session.postWithSession');
            ajax.post(uri,json,function (response) {
                if (response.success) {
                    success(response)
                } else {
                    AlertFail(response,fail);
                }
            })
        });
    };

    return exports;
};
