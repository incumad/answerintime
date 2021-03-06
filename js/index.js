var $$;

var app = {
    clock : '',
    isAlreadySetup : '',
    enableQuestions : [],
    isLogged : false,
    mainView : '',
    f7App : '',
    isDieMsgShow: false,
    daysOfLive: 2,
    dev: 0, // desarrollo
    moderateTime: 0,
    msToDie: 0,
    getParams: 0,
    isInvitado : 0,
    isAdmin: 0,
    //
    idUsuario : '', 
    channel : 'esp',
    //channel : 'test', // @@@@@@@@@@@@@@@@@@@ TODO quitar
    idFB : '', 
    nombreUsuario: '',
    amigos: [],
    //
    currentQuestion : '', // Pregunta activa actual
    
    initialize: function() {
        openFB.init({appId: '1515642338701364'});   
        
        this.bindEvents();
        initRuleta();        
    },
            
// Bind Event Listeners
    bindEvents: function() {
        $( document ).on( "coreready", function() {
            app.setupViews();
        });
        
        // @TODO COMENTARLO DENTRO DE LA APLICACION MOVIL !!!!!
        //app.isAlreadySetup = 'yes';$( document ).ready(this.onDeviceReady);app.dev = 1;app.isAdmin = 1;
        
        document.addEventListener('deviceready', this.onDeviceReady, false);
        
        document.addEventListener("resume", app.onResume, false);
        
        document.addEventListener("offline", app.onOffline, false);
        
        $( document ).on( "userready", function() {
            app.iniChecks();
        });        
        
        
    },
            
    // deviceready Event Handler
    onDeviceReady: function() {
        
        app.isAlreadySetup = localStorage.getItem("is_already_setup");
        
        parseWrapper.initialize(app.isAlreadySetup);

        // Ya no debe hacer las operaciones de setup inicial
        if (app.isAlreadySetup !== 'yes') {
            app.isAlreadySetup = 'yes';
            localStorage.setItem("is_already_setup",'yes');
        }

        //TEST:
        //app.devCloud({params:{'SO':'web'}}); 
    },
    
    // cuando se abre el movil        
    onResume: function() {
        app.iniChecks();
    },
    
    onOffline: function() {
        app.f7App.alert('No tienes conexión a internet la aplicación no funcionara correctamente');
    },

    controlIniChecks: function() {
        if (app.getParams == 1) {
            app.getParams = 0;
            app.iniChecks();
        }
    },
    
    setupViews : function() {
        app.f7App = new Framework7();
        // Export selectors engine
        $$ = Dom7;
        
        // Init main view
        app.mainView = app.f7App.addView('.view-main', {
            // Because we use fixed-through navbar we can enable dynamic navbar
            dynamicNavbar: true
        });
        
        
        // Asocio acciones a los botones de las vistas
        $('#sm-question').click(app.submitNewQuestion);
        
        $('#moderationlink').click(app.iniModeration);
        
        $('#homeLink').click(app.controlIniChecks);
        
        
        
        // asocio a la carga de la pagina inicial, el ver si tiene preguntas
        app.f7App.onPageInit('index-1', app.iniChecks);
        
        app.f7App.onPageInit('about', app.iniRankingChannel);
        
        app.f7App.onPageInit('services', app.iniRankingFriends);
        

        if(app.isLogin()) {
            app.addControlSuggestReview();
            app.mainView.reloadPage('index.html');
        } else {
            // Se instala el invitado la primera vez
            app.setInfoInvitado();
        }
        
        
        
        /* 
        else {
            $$('.toolbar').addClass('hidden');
            app.mainView.loadPage('login.html');
        }
        */
    },
            
    setTupClock: function(msToDye) {
        var austDay = new Date();
        austDay.setTime(austDay.getTime() + msToDye);
        $('.cd-life-aux').empty();
        $('.cd-life-aux').html('<div class="cd-life"></div>');
        var pp = $('.cd-life').mbComingsoon({ expiryDate: austDay, speed:100, callBack: app.finishTimeDie, localization: {
                days: "días", hours: "horas", minutes: "minutos", seconds: "segundos"}});
        pp.stop();
        // Salvamos la ultima fecha de muerte para mostrar el reloj
        // en caso de que haya fallo al llamar al servidor
        localStorage.setItem("lastDateSalved",austDay.getTime());
    },            
            
            
    iniChecks: function() {
        // Comprobamos si hay preguntas para el usuario
        Parse.Cloud.run('getCurrentQuestionsUser',{'usuarioId':app.idUsuario,'channel':app.channel},{
            success: function(results) { 
                if (results.length > 0) {
                    app.enableQuestions = results;
                    app.showQuestion();
                } else {
                    // Si no tiene preguntas iniciamos directamente el reloj
                    // Inicializamos el reloj con el tiempo del usuario en juego
                    app.f7App.showPreloader();
                    Parse.Cloud.run('getInitSettings',{'usuarioId':app.idUsuario},{
                        success: function(result) {
                            app.daysOfLive = result.daysOfLive;
                            
                            var msgDias = 'muy pocos';
                            
                            if (app.daysOfLive >= 2) {
                                msgDias = app.daysOfLive;
                            }
                            
                            $('.daysOfLive').html(msgDias);
                            $('.nameOfLive').html(app.nombreUsuario);
                            app.setTupClock(result.msToDie);
                            app.msToDie = result.msToDie;
                            app.maxBet = Math.ceil((app.msToDie / (1000 * 60 * 60)) * 0.1); // maximo un 10% de tu tiempo
                            $('.maxBet').html(app.maxBet);
                            
                            if (app.isInvitado !== 'yes') {
                                $('.invitadomsg').hide();
                            }
                            
                            app.f7App.hidePreloader();
                            
                            // Vemos si le decimos que opine en market
                            app.getControlSuggestReview();                            
                        }
                    });
                }
            }, 
            error: function(error) {}});
    },
    
    isLogin : function(){
        var userId = localStorage.getItem('usuarioId');
        
        if (app.dev === 1) {
            app.idUsuario = 'LbguQ6YEK5';
            app.idFB = '10152763590018323';
            app.nombreUsuario = 'Javier';
            app.amigos = ['1532762753639693','10152328083557543'];
            app.isInvitado = 'yes';
            return true;
        }        
        
        
        if (userId !== null){
            app.idUsuario = userId;
            app.idFB = localStorage.getItem("idFB");
            app.nombreUsuario = localStorage.getItem("nombreUsuario");
            app.isInvitado =  localStorage.getItem("isInvitado");
            
            if ((app.idFB == '10152763590018323') || (app.idFB == '10152617649867543')) {
                app.isAdmin = 1;
            }
            return true;
        } else {
            return false;
        }
    },

    login : function(){
               app.addControlSuggestReview();
               
               // Probando en web app.mainView.loadPage('index.html');return;
               openFB.login(
                function(response) {
                    if(response.status === 'connected') {
                        if (app.idUsuario == '' || app.isInvitado === 'yes') {
                            app.setinfoUser();
                        } else {
                            // Guardamos los amigos
                            app.setInfoFriends();
                            app.mainView.loadPage('index.html');
                        }
                    } else {
                        alert('Facebook login failed: ' + response.error);
                    }
                }, {scope: 'email,read_stream,publish_stream,user_friends'}); // he quitado este read_friendlists

    }, 
    
    setinfoUser : function(){
      openFB.api({
               path: '/me',
               success: function(data) {
                
                var diasVidaIniciales = 5;
                var msDiasVidaIniciales = parseInt(diasVidaIniciales * (24 * 60 * 60 * 1000));
                var fecha = new Date();


                fecha.setTime(fecha.getTime() + msDiasVidaIniciales);                   
                   
               var dataUser = {first_name: data.first_name,
                                finish_time: fecha,
                                gender: data.gender,
                                idFB: data.id,
                                last_name : data.last_name,
                                link : data.link,
                                name: data.name,
                                locale: data.locale,
                                email: data.email,
                                hometown: data.hometown,
                                birthday: data.birthday,
                                SO: device.platform};
                    
                if (app.isInvitado === 'yes') {
                    dataUser.id = app.idUsuario;
                    dataUser.invitado = 0;
                }   
                    
                parseWrapper.saveUsuario(dataUser);
    
                localStorage.setItem("idFB",data.id);
                localStorage.setItem("nombreUsuario",data.first_name);
                
                app.idFB = data.id;
                app.nombreUsuario = data.first_name;            
            
                
                
                // Guardamos los amigos
                app.setInfoFriends();                
                 
               },
               error: function(error){alert(error.message);}
              });
    },
    
    setInfoInvitado:function(){
        Parse.Cloud.run('saveGuest',{'SO':device.platform},
                    {
                        success: function(data) {
                            app.idUsuario = data.userId;
                            localStorage.setItem('usuarioId', app.idUsuario);
                            app.nombreUsuario = data.name;
                            localStorage.setItem("nombreUsuario",app.nombreUsuario);
                            app.isInvitado = 'yes';
                            localStorage.setItem("isInvitado",'yes');
                            app.mainView.reloadPage('index.html');
                        },
                        error: function(error) {
                            alert('hubo un error al salvar tu usuario invitado');
                        }
                    }
                );      
    },
    
    setInfoFriends: function() {
        openFB.api({path: '/me/friends', 
              success: function(response) {
                   var data = response.data
                  $.each( data, function( key, value ) {
                    app.amigos[key] = value.id;
                  });
              }, 
              error: function(error) {alert(error.message);}
            });
    },
            
    // Muestra una pregunta al usuario         
    showQuestion: function() {
        if (app.enableQuestions.length > 0) {
            // Saco la primera pregunta pendiente
            var question = app.enableQuestions.pop();
            // la muestro usando templates
            
            var template = $$('#template-question').html();
            var compiledTemplate = Template7.compile(template);

            // Now we may render our compiled template by passing required context
            var context = {
                texto: question.get('texto'),
                pregObjectId: question.id,
                horas: question.get('horas'),
                acierto1: question.get('acierto1'),
                acierto2: question.get('acierto2'),
                acierto3: question.get('acierto3'),
                acierto4: question.get('acierto4'),
                respuesta1: question.get('respuesta1'),
                respuesta2: question.get('respuesta2'),
                respuesta3: question.get('respuesta3'),
                respuesta4: question.get('respuesta4')
            };
            
            var textoAcierto = '';
            
            if (context.acierto1 == 1) {
                textoAcierto = context.respuesta1;
            }
            if (context.acierto2 == 1) {
                textoAcierto = context.respuesta2;
            }
            if (context.acierto3 == 1) {
                textoAcierto = context.respuesta3;
            }
            if (context.acierto4 == 1) {
                textoAcierto = context.respuesta4;
            }
            
            context.textoAcierto = textoAcierto;
            
            var html = compiledTemplate(context);
            
            app.currentQuestion = context;
            
            console.log('------------------->>>>empiezaladepuracion');

            var result = app.mainView.loadContent(html);
            
            
            // pongo en marcha el temporizador
            var countdown = new Date();
            countdown.setTime(countdown.getTime() + 12000); // 10 segundos de cuenta atras
            $('.cd-question-'+question.id).mbComingsoon({ expiryDate: countdown, speed:100, callBack: app.finishQuestionTime, localization: {
                days: "días", hours: "horas", minutes: "minutos", seconds: "segundos"}});
        
            console.log('------------------->>>>terminaladepuracion');
        }
    },
      
    // Comprueba si hay preguntas que mostrar, si no las hay muestra
    // la pantalla principal       
    nextQuestion: function() {
        if (app.enableQuestions.length > 0) {
            app.showQuestion(); // Seguimos mostrando preguntas
        } else { // ya no hay preguntas

            app.mainView.reloadPage('index.html');
            /*Parse.Cloud.run('getTimeToDie',{'usuarioId':app.idUsuario},{
                success: function(result) {app.setTupClock(result);}
            });*/            
        }
    },        
    
    // Cuando se acaba el tiempo de cuenta atras de una pregunta
    finishQuestionTime: function() {
        var msg = '...';
        var sTitle = ':(';
        var acierto = 0;
        var numRespuesta = 0;
        var questionInput = "input[name$='question-radio-"+ app.currentQuestion.pregObjectId+"']:checked";
        
        if($$( questionInput ).length === 0) { // No contesto nada
            msg = 'La próxima contesta mas rápido. La respuesta correcta era ' + $('#textoAcierto').val();
        } else if ($$( questionInput ).val() === '0') { // Respuesta incorrecta
            msg = 'Oooo... respuesta incorrecta, la próxima vez será. La respuesta correcta era ' + $('#textoAcierto-'+ app.currentQuestion.pregObjectId).val();
            numRespuesta = $$( questionInput ).attr('num');
        } else { // Respuesta correcta
            msg = 'Correcto!!! Si señor tú sí que sabes!';
            sTitle = ':)';
            acierto = 1;
            numRespuesta = $$( questionInput ).attr('num');
        }
        
        Parse.Cloud.run('saveAnswer',{'numRespuesta':parseInt(numRespuesta), 'pregObjectId':app.currentQuestion.pregObjectId, 'userObjectId':app.idUsuario,'horas':app.currentQuestion.horas,'acierto':acierto},
            {
                success: function(result) {
                    app.f7App.alert(msg,sTitle, app.nextQuestion);
                },
                error: function(error) {
                    app.f7App.alert(msg,sTitle, app.nextQuestion);
                }
            }
        );
    },
    
    // Compruena que la pregunta es correcta y la envia
    submitNewQuestion: function() {
      
      var controlDay = '';
      var today = new Date();
      var votosFavor = 0;
      
      
      if (app.isAdmin != 1) {
        controlDay = localStorage.getItem("control_send_question_day");
        if (today.getDate() == controlDay) {
              app.f7App.alert(msg,':( Sólo se puede enviar una pregunta al día');
              return;
        }
      } else {
          votosFavor = 1000;
      }
      
        
      // Compruebo que los campos estan rellenados correctamente
      var texto = $('#mk-question-texto').val();
      var respuesta1 = $('#mk-question-respuesta1').val();
      var respuesta2 = $('#mk-question-respuesta2').val();
      var respuesta3 = $('#mk-question-respuesta3').val();
      var respuesta4 = $('#mk-question-respuesta4').val();
      var acierto = [0,0,0,0];
      acierto[(parseInt($("input[name$='mk-question-correcta']:checked").val())-1)] = 1;
      var msg = '';
      
      if (texto.length < 5) {
          msg += 'Pregunta<br/>';
      }
      if (respuesta1.length < 1) {
          msg += 'Respuesta 1<br/>';
      }
      if (respuesta2.length < 1) {
          msg += 'Respuesta 2<br/>';
      }
      if (respuesta3.length < 1) {
          msg += 'Respuesta 3<br/>';
      }
      if (respuesta4.length < 1) {
          msg += 'Respuesta 4<br/>';
      }
      
      if (msg.length > 0) {
        app.f7App.alert(msg,':( Por favor revisa los siguientes campos');
      } else {
          
          var dataQuestion = {
            'acierto1' : acierto[0],
            'acierto2' : acierto[1],
            'acierto3' : acierto[2],
            'acierto4' : acierto[3],
            'creadorIdFB' : app.idFB,
            'creadorNombre' : app.nombreUsuario,            
            'idioma' : app.channel,
            'respuesta1' : respuesta1,
            'respuesta2' : respuesta2,
            'respuesta3' : respuesta3,
            'respuesta4' : respuesta4,
            'texto' : texto,
            'votosFavor': votosFavor
            };
        
            Parse.Cloud.run('saveNewQuestion',dataQuestion,
                {
                    success: function(result) {
                        var sendDay = new Date();
                        localStorage.setItem("control_send_question_day",sendDay.getDate());
                        app.getParams = 1;
                        msg = 'Gracias por mandarnos tu pregunta, te has ganado un tu tiempo extra ;) muy valioso';
                        app.f7App.alert(msg,':)');
                    },
                    error: function(error) {
                        msg = 'Hubo un error al guardar tu pregunta, intentalo denuevo mas tarde';
                        app.f7App.alert(msg,':(');
                    }
                }
            );
      }
      
    },
    
    // Se le acabo el tiempo
    finishTimeDie: function() {
        if (!app.isDieMsgShow) {
            app.isDieMsgShow = true;
            Parse.Cloud.run('dieProcess',{'userObjectId':app.idUsuario},
                    {
                        success: function(result) {
                            msg = 'Oooo se acabo tu tiempo, es una pena pero vas a perder todos tus logros en Cuestionados, aunque sabemos que quieres seguir jugando así que no te preocupes puedes volver a NACER :)';
                            app.f7App.alert(msg,':(', function(){

                                app.mainView.reloadPage('index.html');});
                        },
                        error: function(error) {
                            msg = 'Oooo se acabo tu tiempo, es una pena pero vas a perder todos tus logros en Cuestionados, aunque sabemos que quieres seguir jugando así que no te preocupes puedes volver a NACER :)';
                            app.f7App.alert(msg,':(');
                        }
                    }
                );
        }
    },
    
    iniRankingChannel: function(){
        var oUsuarios = Parse.Object.extend("Usuario");
        var usuarioQuery = new Parse.Query(oUsuarios);
        usuarioQuery.descending("finish_time");
        usuarioQuery.greaterThan("idFB",'');                  
        
        usuarioQuery.limit(100);
        
        usuarioQuery.find({
                success: function(results) {
                    app.drawRanking('rankglobal',results);
                },
                error: function() {
                    alert('Error al traer los usuarios');
                }
          });
    },
            
            
    iniRankingFriends: function() {
        var oUsuarios = Parse.Object.extend("Usuario");
        var usuarioQuery = new Parse.Query(oUsuarios);
        
        if (app.isInvitado === 'yes') {
            var sLiNf = '<li class="rankinvitado">Para poder ver a tus amigos conectate a traves de Facebook<div class="content-block login-btn-content"><a href="#" class="button button-big login-submit button-fill color-orange" onclick="app.login();">Conectar <img class="fblog" src="img/FB-f-Logo__white_29.png"/></a></div></li>';
            $('#rankfriends').append(sLiNf);
        } else {
        
            usuarioQuery.containedIn("idFB",
                      app.amigos);

            usuarioQuery.descending("finish_time");

            usuarioQuery.find({
                    success: function(results) {
                        app.drawRanking('rankfriends',results);
                    },
                    error: function() {
                        alert('Error al traer los usuarios');
                    }
              });
        }
    },
            
    drawRanking: function(idUl, results) {
        for (var i = 0; i < results.length; ++i) {

            var finishDate = results[i].get("finish_time");
            var fechaFinal = new Date(finishDate);
            var fechaServidor = new Date();
            var msToDye = fechaFinal.getTime() - fechaServidor.getTime();

            var diasToDie = Math.floor(msToDye / (1000 * 60 * 60 * 24));
            if (diasToDie < 0) {
                diasToDie = 0;
            }

            var sLi = '<li class="item-content"><div class="item-media"><span class="badge">' + (i+1) + '</span></div><div class="item-inner"><div class="item-title">' + results[i].get("name") + '</div><div class="item-after">con ' + diasToDie + ' días por vivir</div></div></li>';
            $('#' + idUl).append(sLi);
        }
    },
            
    iniModeration: function() {
        if (app.moderateTime != 1) {
            parseWrapper.getPreguntasModerar();
            app.moderateTime = 1;
        }
    },
            
    modera: function(id,option) {
        $('#bs-'+id).hide( "slow" );
        
        if (app.isAdmin == 1) {
            if (option == '1') {
                option = '3';
            } else {
                option = '4';
            }
        }
        
        data = {'id':id,'option':option, 'userObjectId': app.idUsuario};
        
        
        
        app.addControlModerateQuestions(id);
        
        Parse.Cloud.run('moderaProcess',data,{
            success: function(result) {app.getParams = 1;}
        });
        
    },
    
    addControlModerateQuestions: function(id) {
        var aControl = JSON.parse(localStorage.getItem('aControlModerateQuestions'));
        if (aControl == null) {
            aControl = new Array();
        }
        aControl.push(id);
        localStorage.setItem('aControlModerateQuestions',JSON.stringify(aControl));
    },
            
    getControlModerateQuestions: function() {
        var aControl = JSON.parse(localStorage.getItem('aControlModerateQuestions'));
        if (aControl == null) {
            aControl = new Array();
        }
        if (aControl.length > 50) {
            aControl = new Array();
            localStorage.setItem('aControlModerateQuestions',JSON.stringify(aControl));
        }
        
        return aControl;
    },
            
    addControlSuggestReview: function() {
        var dateControl = new Date();
        var aControl = JSON.parse(localStorage.getItem('aControlSuggestReview'));
        if (aControl == null) {
            aControl = new Array();
        }
        var control = localStorage.getItem('flagControlSuggestReview');  
        if (control != 'stop') {
            aControl.push(dateControl);
            localStorage.setItem('aControlSuggestReview',JSON.stringify(aControl));
        }
    },
            
    getControlSuggestReview: function() {
        var aControl = JSON.parse(localStorage.getItem('aControlSuggestReview'));
        if (aControl == null) {
            aControl = new Array();
        }
        if (aControl.length > 3) {
            aControl = new Array();
            localStorage.setItem('aControlSuggestReview',JSON.stringify(aControl));
            var msg = '¿Te está gustando Cuestionados?, escribe una opinión sobre el juego y gana 48 horas de vida extra';
            
            app.f7App.confirm(msg, ':)', 
                  function () {
                    var dataBet = {
                        'userObjectId':app.idUsuario,
                        'horas': 48
                    };
                    Parse.Cloud.run('loadBet',dataBet,
                        {
                            error: function(error) {
                                msg = 'Hubo un error tecnico al regalarte los 2 días';
                                app.f7App.alert(msg,':(');
                            }
                        }
                    );                      
                    localStorage.setItem('flagControlSuggestReview','stop');
                    if (device.platform == 'Android') {
                        window.open('https://play.google.com/store/apps/details?id=net.cuestionados.app', '_system', 'location=no');
                    } else {
                        window.open('http://www.apple.com/itunes/', '_system', 'location=no');
                    }
                  }
                );
        }
        
        return aControl;
    },            
            
    
    // aqui pruebo el codigo para el cloud        
    devCloud: function(request, status) {
        
    var query = new Parse.Query("Usuario");
    query.descending("invitado");
         
    query.first({    
        success: function(object) {
            
                    var guestNumber = object.get("invitado");
                    
                    if(typeof guestNumber !== "undefined") {
                        guestNumber = guestNumber + 1;
                    } else {
                        guestNumber = 1;
                        
                    }
                    
                    var name = 'invitado-' + guestNumber;
                    
                    var diasVidaIniciales = 5;
                    var msDiasVidaIniciales = parseInt(diasVidaIniciales * (24 * 60 * 60 * 1000));
                    var fecha = new Date();

                    fecha.setTime(fecha.getTime() + msDiasVidaIniciales);                   

                    var dataUser = {first_name: name,
                                    finish_time: fecha,
                                    last_name : name,
                                    name: name,
                                    SO: request.params.SO,
                                    invitado: guestNumber};

                    var oUsuario = Parse.Object.extend("Usuario");
                    var usuario = new oUsuario();

                    usuario.save(
                       dataUser, 
                       { 
                         success:function(usuario) {//guardar en locale storage id de usuario
                                    alert(usuario.id);
                                    response.success(usuario.id);

                                },
                         error:function(usuario,error) { 
                            status.error("Error salvando el invitado " + guestNumber + " : " + error.code + " " + error.message);
                        } 
                       }
                   );  
            
        },
        error: function(error) {
            status.error("Error cogiendo nuevo numero de invitado: " + error.code + " " + error.message);
        }//error
    });        
        
    }
    
};