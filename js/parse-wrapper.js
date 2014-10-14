var parseWrapper = {
    //Parse related keys 
    PARSEAPPID : "IScWyo9p63oekJrraak0OFJeF6sPkxEO44PKsZ8o",
    PARSEJSID : "XxGPjbfK32xNVOXrpbKGIHhxGFdcPWaaLy4XNmSP",
    PARSECLIENTKEY : "TCJ2kIjT9GVEqNCR0GIxTdEbhlTISK9F9AS6vHmM",
    //Parse app objects 
    oPregunta : '',
    oUsuario : '',
    
    initialize: function(isAlreadySetup) {
        Parse.initialize(this.PARSEAPPID, this.PARSEJSID);
        
        this.oPregunta = Parse.Object.extend("Pregunta");
        this.oUsuario = Parse.Object.extend("Usuario");
        
        if (isAlreadySetup !== 'yes') {
            parseWrapper.subscribePushNotification();
        }
    },
            
    savePregunta: function(preguntaData) {
        var pregunta = new this.oPregunta();

        pregunta.save(
            preguntaData, 
            { 
              success:function(object) { alert("Gracias por tu pregunta! En cuanto se valide recibiras tu tiempo extra :)."); },
              error:function(object,error) { alert("Lo sentimos, hubo un problema con la red y no se pudo salvar tu pregunta prueba mas tarde. " + error); } 
            }
        );
    },
    
    subscribePushNotification: function() {
        // Inicializamos Parse Plugin para not Push
        parsePlugin.initialize(this.PARSEAPPID, this.PARSECLIENTKEY, function() {
            parsePlugin.getInstallationId(function(id) {
                // TODO Coger el canal (esp) del idioma del movil
                parsePlugin.subscribe('esp', function() {
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
    
    testSaveParse: function() {
        var testData = {
            acierto1: 1,
            texto : 'Esta es mi primera pregunta enviada a parse',
            respuesta1: 'Si',
            respuesta2: 'No',
            respuesta3: 'Tal vez',
            respuesta4: 'Ninguna de las anteriores'
        };
        
        this.savePregunta(testData);
    },
            
    testCloudFunction: function() {
        Parse.Cloud.run('getFirstTimeToDie',{},{success: function(result) {alert(result);},error: function(error) {alert(error);}});
        Parse.Cloud.run('getTimeToDie',{'usuarioId':'LB97TVWmsb'},{success: function(result) {alert(result);},error: function(error) {alert(error);}});
        Parse.Cloud.run('getCurrentQuestionsUser',{'usuarioId':'LB97TVWmsb'},{success: function(result) {alert(result);},error: function(error) {alert(error);}});
    },
            
    testCloudWorkFunction: function(request, status) {
        
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


Parse.Push.send({
   channels : ["yourChannel" ],
                                         
   data: {
            alert: msgToSend,                            
         }
  }, {
  success: function() {
       console.log("Success SENT: " + response);   
   },
      error: function(error) {
        console.log("Error error.message);    
     }
 });

*/
