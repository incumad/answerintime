var app = {
    clock : '',
    isAlreadySetup : '',
    
    initialize: function() {
        this.bindEvents();
    },
            
    setTupClock: function() {
        var austDay = new Date();
	austDay = new Date("October 29, 2014 11:13:00");
        $('#myCounter').mbComingsoon({ expiryDate: austDay, speed:100 });
    },        
            
    // Bind Event Listeners
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        
        // TODO COMENTARLO DENTRO DE LA APLICACION MOVIL !!!!!
        // $( document ).ready(this.onDeviceReady);
        
    },
            
    // deviceready Event Handler
    onDeviceReady: function() {
        // Primera carga de la aplicacion
        this.isAlreadySetup = localStorage.getItem("is_already_setup");
        
        this.isAlreadySetup = 0;
        
        app.setTupClock('deviceready');
        parseWrapper.initialize(this.isAlreadySetup);
        
        // Ya no debe hacer las operaciones de setup inicial
        if (this.isAlreadySetup !== 'yes') {
            this.isAlreadySetup = 1;
            localStorage.setItem("is_already_setup",'yes');
        }
        
        //tests
        //app.runTests();
    },
            
    runTests: function() {
        parseWrapper.testSaveParse();
    }        
};