	// Helpers
	shuffle = function(o) {
		for ( var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x)
			;
		return o;
	};

	String.prototype.hashCode = function(){
		// See http://www.cse.yorku.ca/~oz/hash.html		
		var hash = 5381;
		for (i = 0; i < this.length; i++) {
			char = this.charCodeAt(i);
			hash = ((hash<<5)+hash) + char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	}

	Number.prototype.mod = function(n) {
		return ((this%n)+n)%n;
	}
/*
	venues = {
		"116208"  : "Multiplica tu apuesta por 2",
		"66271"   : "Divide tu apuesta por 2",
		"5518"    : "Pierde todo tu tiempo apostado",
		"392360"  : "Divide tu tiempo apostado por la mitad",
		"2210952" : "Suma la mitad a tu tiempo apostado",
		"207306"  : "Pierde todo tu tiempo apostado",
		"41457"   : "Divide tu tiempo apostado por la mitad",
		"101161"  : "TNR Cafe",
		"257424"  : "Afghan Kabob House",
		"512060"  : "The Perfect Pita",
		"66244"   : "California Tortilla",
		"352867"  : "Pho 75 - Rosslyn",
		"22493"   : "Ragtime",
		"268052"  : "Subway",
		"5665"    : "Summers Restaurant & Sports Bar",
		"129724"  : "Cosi",
		"42599"   : "Ray's Hell Burger"
	};
        */
        
        
        	venues = {
		"1"  : "Pierdes todo",
		"2"   : "Multiplicas por 2",
		"3"    : "Pierdes todo",
		"4"  : "Restas la mitad",
		"5" : "Sumas la mitad",
		"6"  : "Restas la mitad",
		"7" : "Sumas la mitad",
		"8"  : "Pierdes todo",
		"9"   : "Multiplicas por 2",
		"10"    : "Pierdes todo",
		"11"  : "Restas la mitad",
		"12" : "Sumas la mitad",
		"13"  : "Restas la mitad",
		"14" : "Sumas la mitad"
                };


	$(function() {
                /*
		var venueContainer = $('#venues ul');
		$.each(venues, function(key, item) {
			venueContainer.append(
		        $(document.createElement("li"))
		        .append(
	                $(document.createElement("input")).attr({
                         id:    'venue-' + key
                        ,name:  item
                        ,value: item
                        ,type:  'checkbox'
                        ,checked:true
	                })
	                .change( function() {
	                	var cbox = $(this)[0];
	                	var segments = wheel.segments;
	                	var i = segments.indexOf(cbox.value);

	                	if (cbox.checked && i == -1) {
	                		segments.push(cbox.value);

	                	} else if ( !cbox.checked && i != -1 ) {
	                		segments.splice(i, 1);
	                	}

	                	segments.sort();
	                	wheel.update();
	                } )

		        ).append(
	                $(document.createElement('label')).attr({
	                    'for':  'venue-' + key
	                })
	                .text( item )
		        )
		    )
		});
                */

		//$('#venues ul>li').tsort("input", {attr: "value"});
	});


	// WHEEL!
	var wheel = {

		timerHandle : 0,
		timerDelay : 33,

		angleCurrent : 0,
		angleDelta : 0,

		size : 290,

		canvasContext : null,

		colors : [ '#ffff00', '#ffc700', '#ff9100', '#ff6301', '#ff0000', '#c6037e',
		           '#713697', '#444ea1', '#2772b2', '#0297ba', '#008e5b', '#8ac819' ],

		//segments : [ 'Andrew', 'Bob', 'Fred', 'John', 'China', 'Steve', 'Jim', 'Sally', 'Andrew', 'Bob', 'Fred', 'John', 'China', 'Steve', 'Jim'],
		segments : [],

		seg_colors : [], // Cache of segments to colors
		
		maxSpeed : Math.PI / 16,

		upTime : 1000, // How long to spin up for (in ms)
		downTime : 10000, // How long to slow down for (in ms)

		spinStart : 0,

		frames : 0,

		centerX : 300,
		centerY : 300,
                
                currentSegment: '',

		spin : function() {
            
                        var maxBet = app.maxBet; 
                        
                        if (maxBet > 24) {
                            maxBet = 24;
                        }
                        
                        if (maxBet < 1) {
                            maxBet = 1;
                        }

			// Start the wheel only if it's not already spinning
			if (wheel.timerHandle == 0) {
                                
                                if ($$('#apuesta-horas').val() < 1) {
                                    $$('#apuesta-horas').val(1);
                                } else if ($$('#apuesta-horas').val() > maxBet) {
                                    $$('#apuesta-horas').val(maxBet);
                                }
                            
                                app.f7App.confirm('Vas a jugarte ' + $$('#apuesta-horas').val() + ' horas de tu tiempo', '¿Estas seguro?', function () {
                                    // TODO restamos las horas de parse
                                    var dataBet = {
                                        'userObjectId':app.idUsuario,
                                        'horas': (parseInt($$('#apuesta-horas').val()) * -1) // tengo que restar al usuario estas horas
                                    };
                                    Parse.Cloud.run('loadBet',dataBet,
                                        {
                                            success: function(result) {
                                                wheel.spinStart = new Date().getTime();
                                                wheel.maxSpeed = Math.PI / (16 + Math.random()); // Randomly vary how hard the spin is
                                                wheel.frames = 0;                                    
                                                wheel.timerHandle = setInterval(wheel.onTimerTick, wheel.timerDelay);
                                            },
                                            error: function(error) {
                                                msg = 'Hubo un error al reslizar tu apuesta, intentalo denuevo mas tarde';
                                                app.f7App.alert(msg,':(');
                                            }
                                        }
                                    );
                                });                            

				//wheel.sound.play();
                                

			}
		},

		onTimerTick : function() {

			wheel.frames++;

			wheel.draw();

			var duration = (new Date().getTime() - wheel.spinStart);
			var progress = 0;
			var finished = false;

			if (duration < wheel.upTime) {
				progress = duration / wheel.upTime;
				wheel.angleDelta = wheel.maxSpeed
						* Math.sin(progress * Math.PI / 2);
			} else {
				progress = duration / wheel.downTime;
				wheel.angleDelta = wheel.maxSpeed
						* Math.sin(progress * Math.PI / 2 + Math.PI / 2);
				if (progress >= 1)
					finished = true;
			}

			wheel.angleCurrent += wheel.angleDelta;
			while (wheel.angleCurrent >= Math.PI * 2)
				// Keep the angle in a reasonable range
				wheel.angleCurrent -= Math.PI * 2;

			if (finished) {
				clearInterval(wheel.timerHandle);
				wheel.timerHandle = 0;
				wheel.angleDelta = 0;
                                // TODO indicamos lo que gana y se lo decimos a parse
                                
                                // Vemos que valor a tocado
                                var action = 0;
                                $.each(venues, function(key, item) {
                                    if (wheel.currentSegment == item) {
                                        action = key;
                                    }
                                });
                                
                                var pt = ['1','3','8','10'];// pierdes todo
                                var m2 = ['2','9']; // multiplicas por 2
                                var rm = ['4','11','6','13']; // restas la mitad
                                var sm = ['5','7','12','14']; // sumas mitad
                                
                                var sTextR = '';
                                var stitleR = '';
                                var hApostadas = parseInt($$('#apuesta-horas').val());
                                var hResultantes = 0;
                                
                                if (pt.indexOf(action) > 0) {
                                    stitleR = ':(';
                                    sTextR = 'Has perdido ' + hApostadas + ' horas';
                                    
                                    
                                } else if (m2.indexOf(action) > 0) {
                                    stitleR = ':)';
                                    sTextR = 'Has ganado ' + hApostadas + ' horas';
                                    hResultantes = hApostadas * 2;
                                    
                                } else if (rm.indexOf(action) > 0) {
                                    stitleR = ':(';
                                    sTextR = 'Has perdido ' + (hApostadas/2) + ' horas';
                                    hResultantes = hApostadas / 2;
                                    
                                } else if (sm.indexOf(action) > 0) {
                                    stitleR = ':)';
                                    sTextR = 'Has ganado ' + (hApostadas/2) + ' horas';
                                    hResultantes = hApostadas + (hApostadas / 2);
                                }
                                
                                if (hResultantes > 0) {
                                    var dataBet = {
                                        'userObjectId':app.idUsuario,
                                        'horas': hResultantes // tengo que sumar al usuario estas horas
                                    };
                                    Parse.Cloud.run('loadBet',dataBet,
                                        {
                                            error: function(error) {
                                                msg = 'Hubo un error tecnico al cobrar tu apuesta';
                                                app.f7App.alert(msg,':(');
                                            }
                                        }
                                    );  
                                }
                                app.getParams = 1;
                                app.f7App.alert(sTextR, stitleR);
			}

			/*
			// Display RPM
			var rpm = (wheel.angleDelta * (1000 / wheel.timerDelay) * 60) / (Math.PI * 2);
			$("#counter").html( Math.round(rpm) + " RPM" );
			 */
		},

		init : function(optionList) {
			try {
				wheel.initWheel();
				//wheel.initAudio();
				wheel.initCanvas();
				wheel.draw();

				$.extend(wheel, optionList);

			} catch (exceptionData) {
				alert('Wheel is not loaded ' + exceptionData);
			}

		},

		initAudio : function() {
			var sound = document.createElement('audio');
			sound.setAttribute('src', 'wheel.mp3');
			wheel.sound = sound;
		},

		initCanvas : function() {
			var canvas = $('#wheel #canvas').get(0);

			canvas.addEventListener("click", wheel.spin, false);
                        
                        
			wheel.canvasContext = canvas.getContext("2d");
		},

		initWheel : function() {
			shuffle(wheel.colors);
		},

		// Called when segments have changed
		update : function() {
			// Ensure we start mid way on a item
			//var r = Math.floor(Math.random() * wheel.segments.length);
			var r = 0;
			wheel.angleCurrent = ((r + 0.5) / wheel.segments.length) * Math.PI * 2;

			var segments = wheel.segments;
			var len      = segments.length;
			var colors   = wheel.colors;
			var colorLen = colors.length;

			// Generate a color cache (so we have consistant coloring)
			var seg_color = new Array();
			for (var i = 0; i < len; i++)
				seg_color.push( colors [ segments[i].hashCode().mod(colorLen) ] );

			wheel.seg_color = seg_color;

			wheel.draw();
		},

		draw : function() {
			wheel.clear();
			wheel.drawWheel();
			wheel.drawNeedle();
		},

		clear : function() {
			var ctx = wheel.canvasContext;
			ctx.clearRect(0, 0, 1000, 800);
		},

		drawNeedle : function() {
			var ctx = wheel.canvasContext;
			var centerX = wheel.centerX;
			var centerY = wheel.centerY;
			var size = wheel.size;

			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000000';
			ctx.fileStyle = '#ffffff';

			ctx.beginPath();

			ctx.moveTo(centerX + size - 40, centerY);
			ctx.lineTo(centerX + size + 20, centerY - 10);
			ctx.lineTo(centerX + size + 20, centerY + 10);
			ctx.closePath();

			ctx.stroke();
			ctx.fill();

			// Which segment is being pointed to?
			var i = wheel.segments.length - Math.floor((wheel.angleCurrent / (Math.PI * 2))	* wheel.segments.length) - 1;

			// Now draw the winning name
			ctx.textAlign = "left";
			ctx.textBaseline = "middle";
			ctx.fillStyle = '#000000';
			ctx.font = "2em Arial";
                        wheel.currentSegment = wheel.segments[i];
			ctx.fillText(wheel.segments[i], centerX + size + 25, centerY);
		},

		drawSegment : function(key, lastAngle, angle) {
			var ctx = wheel.canvasContext;
			var centerX = wheel.centerX;
			var centerY = wheel.centerY;
			var size = wheel.size;

			var segments = wheel.segments;
			var len = wheel.segments.length;
			var colors = wheel.seg_color;

			var value = segments[key];
			
			ctx.save();
			ctx.beginPath();

			// Start in the centre
			ctx.moveTo(centerX, centerY);
			ctx.arc(centerX, centerY, size, lastAngle, angle, false); // Draw a arc around the edge
			ctx.lineTo(centerX, centerY); // Now draw a line back to the centre

			// Clip anything that follows to this area
			//ctx.clip(); // It would be best to clip, but we can double performance without it
			ctx.closePath();

			ctx.fillStyle = colors[key];
			ctx.fill();
			ctx.stroke();

			// Now draw the text
			ctx.save(); // The save ensures this works on Android devices
			ctx.translate(centerX, centerY);
			ctx.rotate((lastAngle + angle) / 2);

			ctx.fillStyle = '#000000';
			ctx.fillText(value.substr(0, 20), size / 2 + 20, 0);
			ctx.restore();

			ctx.restore();
		},

		drawWheel : function() {
			var ctx = wheel.canvasContext;

			var angleCurrent = wheel.angleCurrent;
			var lastAngle    = angleCurrent;

			var segments  = wheel.segments;
			var len       = wheel.segments.length;
			var colors    = wheel.colors;
			var colorsLen = wheel.colors.length;

			var centerX = wheel.centerX;
			var centerY = wheel.centerY;
			var size    = wheel.size;

			var PI2 = Math.PI * 2;

			ctx.lineWidth    = 1;
			ctx.strokeStyle  = '#000000';
			ctx.textBaseline = "middle";
			ctx.textAlign    = "center";
			ctx.font         = "1.4em Arial";

			for (var i = 1; i <= len; i++) {
				var angle = PI2 * (i / len) + angleCurrent;
				wheel.drawSegment(i - 1, lastAngle, angle);
				lastAngle = angle;
			}
			// Draw a center circle
			ctx.beginPath();
			ctx.arc(centerX, centerY, 20, 0, PI2, false);
			ctx.closePath();

			ctx.fillStyle   = '#ffffff';
			ctx.strokeStyle = '#000000';
			ctx.fill();
			ctx.stroke();

			// Draw outer circle
			ctx.beginPath();
			ctx.arc(centerX, centerY, size, 0, PI2, false);
			ctx.closePath();

			ctx.lineWidth   = 10;
			ctx.strokeStyle = '#000000';
			ctx.stroke();
		}
	};

	function initRuleta() {
		wheel.init();

		var segments = new Array();
                $.each(venues, function(key, item) {
			segments.push( item );
		});
                
		/*$.each($('#venues input:checked'), function(key, cbox) {
			segments.push( cbox.value );
		});*/

		wheel.segments = segments;
		wheel.update();

		// Hide the address bar (for mobile devices)!
		setTimeout(function() {
			window.scrollTo(0, 1);
		}, 0);
	};

