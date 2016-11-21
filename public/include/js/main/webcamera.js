var camera = {},cameraSupport = false;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
if(typeof getUserMedia != "undefined"){
	cameraSupport = true;
}

function camera2photo(canvasID, videoID){
	var canvas = document.getElementById(canvasID),
		context = canvas.getContext("2d"),
		video = document.getElementById(videoID);
	$("#"+videoID).hide();
	$("#"+canvasID).show();
	//拍照
	context.drawImage(video, 0, 0, 300, 240);
	cameraStop(videoID);
}

function getCameraPhoto(canvasID){
	var canvas = document.getElementById(canvasID);
	//取得照片資料
	var imgBase64 = canvas.toDataURL();
	return imgBase64;
}

function clearCameraPhoto(canvasID){
	var canvas = document.getElementById(canvasID),
		context = canvas.getContext("2d");
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function cameraStop(videoID){
	if(typeof camera[videoID] != "undefined"){
		camera[videoID].getTracks()[0].stop();
		camera[videoID] = null;
	}
}

function cameraPlay(videoID){
	// Grab elements, create settings, etc.
	// var video = document.getElementById(videoID),
	var video = $("#"+videoID),
		videoObj = { "video": true },
		errBack = function(error) {
			console.log("Video capture error: ", error); 
		};
		//getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	if(cameraSupport){
		getUserMedia.call(navigator,videoObj, function(stream) {
			var tmpStream;
			// console.log(window.webkitURL);
			if (window.webkitURL) {
		        tmpStream = window.webkitURL.createObjectURL(stream);
		    } else {
		        tmpStream = URL.createObjectURL(stream);
		    }
		    // console.log(tmpStream);
		    // video.src = tmpStream;
		    // video.play();
		    video.attr("src",tmpStream);
		    camera[videoID] = stream;
			video.get(0).play();
		}, errBack);
	}
	// Put video listeners into place
}