var $$;

var app = {
    clock : '',
    isAlreadySetup : '',
    enableQuestions : [],
    isLogged : false,
    mainView : '', 
    
    initialize: function() {
        this.setupViews();
        this.bindEvents();
    },
    
    
    setupViews : function() {
        var myApp = new Framework7();
        // Export selectors engine
        $$ = Dom7;
        
        // Init main view
        app.mainView = myApp.addView('.view-main');
        
        // asocio a la carga de la pagina inicial, el ver si tiene preguntas
        myApp.onPageInit('index-1', app.iniChecks);
        
        // Add views
        myApp.addView('#view-2', {
            // Because we use fixed-through navbar we can enable dynamic navbar
            dynamicNavbar: true
        });
        myApp.addView('#view-3');
        myApp.addView('#view-4');
        
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
        $('.cd-life').mbComingsoon({ expiryDate: austDay, speed:100 });
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
        Parse.Cloud.run('getCurrentQuestionsUser',{'usuarioId':'LB97TVWmsb','channel':'esp'},{
            success: function(results) { 
                if (results.length > 0) {
                    app.enableQuestions = results;
                    app.showQuestion();
                } else {
                    // Si no tiene preguntas iniciamos directamente el reloj
                    // Inicializamos el reloj con el tiempo del usuario en juego
                    Parse.Cloud.run('getTimeToDie',{'usuarioId':'LB97TVWmsb'},{
                        success: function(result) {app.setTupClock(result);}
                    });
                }
            }, 
            error: function(error) {}});
    },
    
    isLogin : function(){
        return app.isLogged;
    },

    login : function(){
        var user = $('#user').val();
        var password = $('#password').val();
        if(user==='test@test.com' && password==='test'){
            //isLogged=true;
            app.mainView.reloadPage('index.html');
            $$('div.views').removeClass('hidden-toolbar');
        }

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

            app.mainView.loadContent(html);
            
            // pongo en marcha el temporizador
            var countdown = new Date();
            countdown.setTime(countdown.getTime() + 12000); // 10 segundos de cuenta atras
            $('#cd-question').mbComingsoon({ expiryDate: countdown, speed:100, callback: function(){alert('se acabo el tiempo, hacemos cosas como mostrar el reloj y demas');}});

        }
    },        
            
    devCloud: function() {

    

    },        
            
    runTests: function() {
        parseWrapper.testSaveParse();
    }
    
};