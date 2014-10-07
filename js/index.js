var app = {
    clock : '',
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
        $( document ).ready(this.onDeviceReady);
        
    },
            
    // deviceready Event Handler
    onDeviceReady: function() {
        app.setTupClock('deviceready');
    }
};