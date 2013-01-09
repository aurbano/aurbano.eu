$(document).ready(function(){
	// Some config
	var width = $(window).width();
	var widthRatio = 1903/584; // Screen / Width
	var itemRatio = 584/427; // Width / Height
	// Containers
	var itemWidth = 0;
	var itemHeight = 0;
	// Window resize
	$(window).bind('resize', function(){ sizes() });
	// Detect device orientation change
	$(window).bind('onorientationchange', function(){ sizes() });
	function sizes(){
		// Resizer, makes it a little more responsive
		width = $(window).width();
		var res = width;
		if(res > 1900) res = 1900;
		if(res < 960) res = 960;
		// Now set all sizes relative to that
		itemWidth = res/widthRatio;
		itemHeight = itemWidth/itemRatio;
		// Set them
		$('#showcase .img').css({
			width : itemWidth,
			height : itemHeight
		});
		$('#showcase .right').css({
			left : itemWidth + 20
		});
		$('#showcase .desc').css({
			height : $('#showcase .right').width() - itemWidth - 20
		});
		var minHeight = $('#showcase .desc').height();
		var useHeight = Math.max(minHeight+100,itemHeight+65);
		$('#showcase').css({
			height : useHeight
		});
	}
	sizes();
	var projects = new Array('cloudclient','quepiensas','chevismo','djsmusic');
	var curProject = 0;
	var autoDir = 1;
	var autoTimer = setInterval(function(){
		if(curProject==projects.length-1) autoDir = -1
		if(autoDir<0 && curProject<1) autoDir = 1; 
		if(autoDir>0) nextProject()
		if(autoDir<0) prevProject()
	},6000);
	// Next project
	function nextProject(){
		if(curProject>=projects.length) return true;
		// Move to the next
		var cur = projects[curProject];
		var next = projects[curProject+1];
		$('#'+cur).animate({left: -width+'px'},1000);
		$('#'+next).animate({left: '0'},1000);
		curProject++;
		if(curProject>=projects.length-1){
			$('#showcase > .next').fadeOut();	
		}
		$('#showcase > .prev').fadeIn();
	}
	// Previous project
	function prevProject(){
		if(curProject<=0) return true;
		// Move to the next
		var cur = projects[curProject];
		var prev = projects[curProject-1];
		$('#'+cur).animate({left: width+'px'},1000);
		$('#'+prev).animate({left: '0'},1000);
		curProject--;
		if(curProject<=0){
			$('#showcase > .prev').fadeOut();	
		}
		$('#showcase > .next').fadeIn();
	}
	// Apply actions
	$('#showcase > .next').click(function(event){
		event.preventDefault();
		clearInterval(autoTimer);
		nextProject();
		return true;
	});
	$('#showcase > .prev').click(function(event){
		event.preventDefault();
		clearInterval(autoTimer);
		prevProject();
		return true;
	});
	// SPAM
	function spam(){ $('#websiteForm').val('bot'); }
	setTimeout(spam,1000);
	// Tabs
	$('#tabs h2').siblings().hide();
	$($('#tabs a.selected').attr('href')).fadeIn();
	$('#work .indent>div:not(.featured)').hide();
	$('#tabs h2 a').click(function(event){
		event.preventDefault();
		event.stopPropagation();
		$('#tabs a.selected').removeClass('selected');
		$(this).addClass('selected');
		var href = $(this).attr('href');
		$('#tabs > div').removeClass('current');
		$(href).addClass('current');
		$('#tabs > div:not(.current)').slideUp(1000);
		$(href).slideDown(1000,function(){
			if(href=='#contact') $('#name').focus();	
		});
	});
	$('.img .next a').click(function(event){
		event.preventDefault();
		event.stopPropagation();
		$('.img .next').fadeOut();
		$('.img img').animate({top:-itemHeight},1000,function(){
			$('.img .prev').fadeIn();
		});
	});
	$('.img .prev a').click(function(event){
		event.preventDefault();
		event.stopPropagation();
		$('.img .prev').fadeOut();
		$('.img img').animate({top:2},1000,function(){
			$('.img .next').fadeIn();
		});
	});
	$('input, textarea').focus(function(){
		$(this).parents('.input').addClass('active');
	}).blur(function(){
		$(this).parents('.input').removeClass('active');
	});
	// Recursive function to show text :)
	var showText = function (target, message, index, interval) {   
		if(index < message.length){
			$(target).append(message[index++]);
			setTimeout(function(){ showText(target, message, index, interval); }, interval);
		}else $('#top').off("mouseover");
	}
	$('#top').mouseover(event,function(){
		$('#dot').text('');
		$('#top').off("mouseover");
		showText('#dot','rbano',0,100)
	});
	var keyTimer;
	$('#email').on('keyup',function(){ getGravatar(-1); } );
	$('#email').on('change',function(){ getGravatar(1); } );
	function getGravatar(t){
		if(t<0) clearTimeout(keyTimer);
		// This is to 
		keyTimer = setTimeout(function(){
			$.get('gravatar.php', {e:$('#email').val()}, function(data) {
				$('#gravatar img').attr('src',data.img);
			},'json');
		}, 300);
	}
});