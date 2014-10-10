var app = {
    clock : '',
    isAlreadySetup : '',
    
    initialize: function() {
        this.bindEvents();
    },
            
    setTupClock: function(msToDye) {
        var austDay = new Date();
        austDay.setTime(austDay.getTime() + msToDye);
        $('#myCounter').mbComingsoon({ expiryDate: austDay, speed:100 });
        
        // Salvamos la ultima fecha de muerte para mostrar el reloj
        // en caso de que haya fallo al llamar al servidor
        localStorage.setItem("lastDateSalved",austDay.getTime());
    },        
            
    // Bind Event Listeners
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        
        // @TODO COMENTARLO DENTRO DE LA APLICACION MOVIL !!!!!
        //$( document ).ready(this.onDeviceReady);
        
    },
            
    // deviceready Event Handler
    onDeviceReady: function() {
        // Primera carga de la aplicacion
        this.isAlreadySetup = localStorage.getItem("is_already_setup");
        parseWrapper.initialize(this.isAlreadySetup);
        
        // Inicializamos el reloj con el tiempo del usuario en juego
        Parse.Cloud.run('getTimeToDye',{'usuarioId':'LB97TVWmsb'},{
            success: function(result) {app.setTupClock(result);}
        });
        
        // Ya no debe hacer las operaciones de setup inicial
        if (this.isAlreadySetup !== 'yes') {
            this.isAlreadySetup = 1;
            localStorage.setItem("is_already_setup",'yes');
        }
    },
            
    devCloud: function() {
        var test = 'Thu Feb 04 2016 18:20:00 GMT+0100 (CET)';
        var fechaFinal = new Date(test);
        var fechaServidor = new Date();
        var msToDye = fechaFinal.getTime() - fechaServidor.getTime();
        if (msToDye > 0) {
            //response.success(msToDye);
        } else {
            //response.success(0);
        }
    },        
            
    runTests: function() {
        parseWrapper.testSaveParse();
    }
    
};