// Initialize your app
var is_login=false;
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

// Add views
var view1 = myApp.addView('#view-1');
var view2 = myApp.addView('#view-2', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
    
    
});
var view3 = myApp.addView('#view-3');
var view4 = myApp.addView('#view-4');

if(!isLogin()){
     view1.loadPage('login.html');
}else{
     view1.reloadPage('index.html');
}


function isLogin(){
    return is_login;
}

function login(){
    var user = $('#user').val();
    var password = $('#password').val();
    if(user==='test@test.com' && password==='test'){
        //is_login=true;
        view1.reloadPage('index.html');
        $$('div.views').removeClass('hidden-toolbar');
    }
    
}


myApp.onPageInit('about', function (page) {
  // Do something here for "about" page
  
})

