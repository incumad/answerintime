var parseWrapper = {
    //Parse related keys 
    PARSEAPPID : "IScWyo9p63oekJrraak0OFJeF6sPkxEO44PKsZ8o",
    PARSEJSID : "XxGPjbfK32xNVOXrpbKGIHhxGFdcPWaaLy4XNmSP",
    PARSECLIENTKEY : "TCJ2kIjT9GVEqNCR0GIxTdEbhlTISK9F9AS6vHmM",
    
    initialize: function(isAlreadySetup) {


        Parse.initialize(this.PARSEAPPID, this.PARSEJSID);
        
        if (isAlreadySetup !== 'yes') {
            parseWrapper.subscribePushNotification();
        } else {
            parseWrapper.setReady();
        }
        
    },
    
    subscribePushNotification: function() {

try {

        // Inicializamos Parse Plugin para not Push
        parsePlugin.initialize(parseWrapper.PARSEAPPID, parseWrapper.PARSECLIENTKEY, function() {
            
            parseWrapper.setReady();
            
            parsePlugin.getInstallationId(function(id) {
                // TODO Coger el canal (esp) del idioma del movil
                parsePlugin.subscribe(app.channel, function() {
                    // OK subscripcion
                }, function(e) {
                    //ERROR subscripcion
                    alert('error ' + e);
                });
            }, function(e) {
                //ERROR get id installaction
                alert('error ' + e);
            });
        }, function(e) {
            alert('error ' + e);
        });
}
catch (e) {
    alert(e);
}


        
        
        
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
       
        var oUsuario = Parse.Object.extend("Usuario");

        var usuario = new oUsuario();
        var query = new Parse.Query(oUsuario);
        var userId = 0;
        query.equalTo("idFB", usuarioData.idFB);
        query.find({
          success: function(results) {
            // Do something with the returned Parse.Object values
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                userId = object.id;             
            }
            
            if (userId===0){
                   usuario.save(
                      usuarioData, 
                      { 
                        success:function(usuario) {//guardar en locale storage id de usuario
                                                  localStorage.setItem("usuarioId",usuario.id);
                                                  app.idUsuario = usuario.id;
                                                  
                                                    app.mainView.loadPage('index.html');
                                                    $$('div.views').removeClass('hidden-toolbar');
                                                  
                                                  },
                        error:function(usuario,error) { alert("Lo sentimos, hubo un problema con la red y no se pudo guardar tus datos. " + error); } 
                      }
                  );  
            }else{
                localStorage.setItem("usuarioId",userId);
                app.idUsuario = userId;
                app.mainView.loadPage('index.html');
                $$('div.views').removeClass('hidden-toolbar');                
            }
          },
          error: function(error) {
            alert("Error: " + error.code + " " + error.message);
          }
        });
       
        
    },
    
    getPreguntasModerar: function() {
        var Preguntas = Parse.Object.extend("PreguntaNueva");
        var query = new Parse.Query(Preguntas);
        var now = new Date();
        
        var moderatedIds = app.getControlModerateQuestions();
        
        query.lessThanOrEqualTo("moderarDesde", now);
        query.greaterThanOrEqualTo("moderarHasta", now);
        query.notEqualTo("indUso", '1');
        query.notContainedIn("objectId",moderatedIds);
        
        query.find({
          success: function(results) {
            // Do something with the returned Parse.Object values
            for (var i = 0; i < results.length; i++) {
              var question = results[i];
              
                var templateM = $$('#moderate-question').html();
                var compiledTemplate = Template7.compile(templateM);
                

                // Now we may render our compiled template by passing required context
                var context = {
                    texto: question.get('texto'),
                    pregObjectId: question.id,
                    creadorNombre:question.get('creadorNombre'),
                    moderarDesde:question.get('moderarDesde').toLocaleString('es'),
                    respuesta1: question.get('respuesta1'),
                    respuesta2: question.get('respuesta2'),
                    respuesta3: question.get('respuesta3'),
                    respuesta4: question.get('respuesta4')
                };
                var html = compiledTemplate(context);
                
                $('#moderatelist').append(html);
            }
          },
          error: function(error) {
            alert("Error: " + error.code + " " + error.message);
          }
        });
    },
    
    setReady: function() {
        $( document ).trigger({
                    type:"coreready"
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
