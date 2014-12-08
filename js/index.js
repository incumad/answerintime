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
    // TODO estos campos se tienen que inicializar
    idUsuario : 'LB97TVWmsb', 
    channel : 'esp', 
    idFB : '10152328083557543', 
    nombreUsuario: 'Guillermo Sánchez Oliveros', // TODO se tiene que leer del movil       
    //
    
    currentQuestion : '', // Pregunta activa actual
    
    initialize: function() {
        this.setupViews();
        this.bindEvents();
        initRuleta();
        openFB.init({appId: '728946893842507'});   

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
        
        // asocio a la carga de la pagina inicial, el ver si tiene preguntas
        app.f7App.onPageInit('index-1', app.iniChecks);
        
        /*
        // Add views
        app.f7App.addView('#view-2', {
            // Because we use fixed-through navbar we can enable dynamic navbar
            dynamicNavbar: true
        });
        app.f7App.addView('#view-3');
        app.f7App.addView('#view-4');
        */
        
        // Asocio acciones a los botones de las vistas
        $('#sm-question').click(app.submitNewQuestion);
        
        // Vista inicial
        if(!this.isLogin()){
            app.mainView.loadPage('login.html');
        }else{
            app.mainView.reloadPage('index.html');
        }        
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
            
    // Bind Event Listeners
    bindEvents: function() {
        this.isAlreadySetup = localStorage.getItem("is_already_setup");
        
        document.addEventListener('deviceready', this.onDeviceReady, false);
        
        // @TODO COMENTARLO DENTRO DE LA APLICACION MOVIL !!!!!
        app.isAlreadySetup = 'yes'; $( document ).ready(this.onDeviceReady); 
        
    },
            
    // deviceready Event Handler
    onDeviceReady: function() {
        parseWrapper.initialize(app.isAlreadySetup);
        
        // Ya no debe hacer las operaciones de setup inicial
        if (this.isAlreadySetup !== 'yes') {
            this.isAlreadySetup = 'yes';
            localStorage.setItem("is_already_setup",'yes');
        }
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
                    Parse.Cloud.run('getInitSettings',{'usuarioId':app.idUsuario},{
                        success: function(result) {
                            app.daysOfLive = result.daysOfLive;
                            $('.daysOfLive').html(app.daysOfLive);
                            app.setTupClock(result.msToDie);
                        }
                    });
                }
            }, 
            error: function(error) {}});
    },
    
    isLogin : function(){
        var userId = localStorage.getItem('usuarioId');
      
        if (userId !== null){
            return false;
        }
        return false;

    },

    login : function(){
               openFB.login(
                function(response) {
                    if(response.status === 'connected') {
                        alert('Facebook login succeeded, got access token: ' + response.authResponse.token);
                        app.setinfoUser();
                        app.mainView.loadPage('login.html');
                    } else {
                        alert('Facebook login failed: ' + response.error);
                    }
                }, {scope: 'email,read_stream,publish_stream'});

    }, 
         setinfoUser : function(){
      openFB.api({
               path: '/me',
               success: function(data) {
               var dataUser = {first_name: data.first_name,
                                gender: data.gender,
                                idFB: data.id,
                                last_name : data.last_name,
                                link : data.link,
                                name: data.name,
                                locale: data.locale,
                                email: data.email,
                                hometown: data.hometown,
                                birthday: data.birthday}
                 // parseWrapper.saveUsuario(dataUser);
                 
               },
               error: function(error){alert(error.message);}
              });
       openFB.api({
            path: '/me/friendlists',
            success: function(response) {
                var data = response.data
                $.each( data, function( key, value ) {
                    alert(key);
                    return false;
                });
                alert(JSON.stringify(data));
                
               
            },
            error: function(error){alert(error.message);}
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
            var html = compiledTemplate(context);
            
            app.currentQuestion = context;

            app.mainView.loadContent(html);
            
            // pongo en marcha el temporizador
            var countdown = new Date();
            countdown.setTime(countdown.getTime() + 12000); // 10 segundos de cuenta atras
            $('.cd-question-'+question.id).mbComingsoon({ expiryDate: countdown, speed:100, callBack: app.finishQuestionTime, localization: {
                days: "días", hours: "horas", minutes: "minutos", seconds: "segundos"}});

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
            msg = 'La proxima contesta mas rápido';
        } else if ($$( questionInput ).val() === '0') { // Respuesta incorrecta
            msg = 'Oooo... respuesta incorrecta, la proxima vez será';
            numRespuesta = $$( questionInput ).attr('num');
        } else { // Respuesta correcta
            msg = 'Correcto!!! Si señor tu si que sabes!';
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
      // Compruebo que los campos estan rellenados correctamente
      var texto = $('#mk-question-texto').val();
      var respuesta1 = $('#mk-question-respuesta1').val();
      var respuesta2 = $('#mk-question-respuesta2').val();
      var respuesta3 = $('#mk-question-respuesta3').val();
      var respuesta4 = $('#mk-question-respuesta4').val();
      var acierto = [0,0,0,0];
      acierto[$("input[name$='mk-question-correcta']:checked").val()] = 1;
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
            'texto' : texto
            };
        
            Parse.Cloud.run('saveNewQuestion',dataQuestion,
                {
                    success: function(result) {
                        msg = 'Gracias por mandarnos tu pregunta, en cuanto sea moderada recibiras tu tiempo extra ;)';
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
                            msg = 'Oooo se acabo tu tiempo, es una pena pero vas a perder todos tus logros en cuestionados, aunque sabemos que quieres seguir jugando así que no te preocupes puedes volver a NACER :)';
                            app.f7App.alert(msg,':(', function(){app.mainView.reloadPage('index.html');});
                        },
                        error: function(error) {
                            msg = 'Oooo se acabo tu tiempo, es una pena pero vas a perder todos tus logros en cuestionados, aunque sabemos que quieres seguir jugando así que no te preocupes puedes volver a NACER :)';
                            app.f7App.alert(msg,':(');
                        }
                    }
                );
        }
    },
    
    
    // aqui pruebo el codigo para el cloud        
    devCloud: function(request, response) {
    

    }
    
};