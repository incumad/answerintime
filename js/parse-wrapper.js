var parseWrapper = {
    //Parse related keys 
    PARSEAPPID : "IScWyo9p63oekJrraak0OFJeF6sPkxEO44PKsZ8o",
    PARSEJSID : "XxGPjbfK32xNVOXrpbKGIHhxGFdcPWaaLy4XNmSP",
    PARSECLIENTKEY : "TCJ2kIjT9GVEqNCR0GIxTdEbhlTISK9F9AS6vHmM",
    
    initialize: function(isAlreadySetup) {
        Parse.initialize(this.PARSEAPPID, this.PARSEJSID);
        
        if (isAlreadySetup !== 'yes') {
            parseWrapper.subscribePushNotification();
        }
    },
    
    subscribePushNotification: function() {
        // Inicializamos Parse Plugin para not Push
        parsePlugin.initialize(this.PARSEAPPID, this.PARSECLIENTKEY, function() {
            parsePlugin.getInstallationId(function(id) {
                // TODO Coger el canal (esp) del idioma del movil
                parsePlugin.subscribe(app.channel, function() {
                    // OK subscripcion
                }, function(e) {
                    //ERROR subscripcion
                });
            }, function(e) {
                //ERROR get id installaction
            });
        }, function(e) {
            //ERROR 
        });
    },
            
    testCloudFunction: function() {
        Parse.Cloud.run('getFirstTimeToDie',{},{success: function(result) {alert(result);},error: function(error) {alert(error);}});
        Parse.Cloud.run('getTimeToDie',{'usuarioId':'LB97TVWmsb'},{success: function(result) {alert(result);},error: function(error) {alert(error);}});
        Parse.Cloud.run('getCurrentQuestionsUser',{'usuarioId':'LB97TVWmsb'},{success: function(result) {alert(result);},error: function(error) {alert(error);}});
        Parse.Cloud.run('saveAnswer',{'numRespuesta':1, 'pregObjectId':'tqBEx5iSol', 'userObjectId':'LB97TVWmsb','horas':10,'acierto':1},{success: function(result) {alert(result);},error: function(error) {alert(error);}});
    },
            
    testCloudWorkFunction: function(request, status) {
        
    },
    saveUsuario: function(usuarioData) {
        var usuario = new this.oUsuario();

        usuario.save(
            usuarioData, 
            { 
              success:function(usuario) {//guardar en locale storage id de usuario 
                                        localStorage.setItem("usuarioId",usuario.id);
                                        alert("El usuario se ha registrado correctamente en la app"); },
              error:function(usuario,error) { alert("Lo sentimos, hubo un problema con la red y no se pudo guardar tus datos. " + error); } 
            }
        );
    },
    getPreguntasModerar: function() {
        var Preguntas = Parse.Object.extend("PreguntasN");
        var query = new Parse.Query(Preguntas);
        var now = new Date();
        query.lessThanOrEqualTo("moderaDesde", now);
        query.greaterThanOrEqualTo("moderarHasta", now);
        query.find({
          success: function(results) {
            alert("Successfully retrieved " + results.length + " scores.");
            // Do something with the returned Parse.Object values
            for (var i = 0; i < results.length; i++) {
              var object = results[i];
              alert(object.id + ' - ' + object.get('playerName'));
            }
          },
          error: function(error) {
            alert("Error: " + error.code + " " + error.message);
          }
        });
    }


};


/* Pregunta Fields 
{
    objectId : '',
    acierto1 : 0,
    acierto2 : 0,
    acierto3 : 0,
    acierto4 : 0,
    acierto5 : 0,
    fechaFin : '',
    horas: 8,
    idioma: 'es',
    respuesta1: '',
    respuesta2 : '',
    respuesta3 : '',
    respuesta4 : '',
    respuesta5 : '',
    texto : '',
    createdAt : '',
    updatedAt : '',
    ACL : ''
}
*/
