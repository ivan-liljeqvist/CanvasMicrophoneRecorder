

//function to generate unique IDs

function guid() {
   	function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
   	}
   	return _p8() + _p8(true) + _p8(true) + _p8();
}

//function to make web requests. used for uploading

function xhr(url, data, callback) { 
			var request = new XMLHttpRequest(); 
			request.onreadystatechange = function () { 
				if (request.readyState == 4 && request.status == 200) { 
					callback(request.responseText); } 
				}; 
				request.open('POST', url); request.send(data); 
}

//start recording canvas and microphone

var recorder;
var recordRTC;
var videoElement;

function startRecordingCanvas(canvasElementId){
	var elementToShare = document.getElementById(canvasElementId);
	
	//record canvas
	
	recorder = RecordRTC(elementToShare, {
    	type: 'canvas'
	});
	
	recorder.startRecording();
	
	//record microphone
	
	navigator.getUserMedia({audio: true}, function(mediaStream) {
   		recordRTC = RecordRTC(mediaStream);
   		recordRTC.startRecording();
	},function(error) { /* do something */ });
	
}

function stopRecordingCanvas(callback){
	
	//stop video recording
	recorder.stopRecording(function(url) {
		//when we've stopped video - stop audio
		recordRTC.stopRecording(function(audioURL) {
			//we've stopped the recording. Notify the callback.
			callback();
		});
	});
	

}

/*
	make sure that the recording is stopped before calling this method.
*/

function uploadToVidMe(callback,title,description){
	
	//generate random session id
	var sessionID=guid();
	
	
	var videoFileType = 'video'; 
	var videofileName = 'videofilename'+sessionID; 
 
	var videoFormData = new FormData(); 
	videoFormData.append(videoFileType + '-filename', videofileName); 
	videoFormData.append(videoFileType + '-blob', recorder.getBlob());
			
		
	xhr('http://ec2-52-28-52-147.eu-central-1.compute.amazonaws.com/vidme/upload.php', videoFormData, function (fName) { 
				
				/*
					Take care of the audio.
				*/
				
				var fileType = 'audio'; 
				var fileName = 'audiofilename'+sessionID; 
 
				var formData = new FormData(); 
				formData.append(fileType + '-filename', fileName); 
				formData.append(fileType + '-blob', recordRTC.getBlob()); 

				console.log("Uploading!");
		
				xhr('http://ec2-52-28-52-147.eu-central-1.compute.amazonaws.com/vidme/upload.php', formData, function (fName) { 
					/*
						Take care of the merge.
					*/
					
					var mergeData=new FormData();
					mergeData.append('merging',true);
					mergeData.append('sessionID',sessionID);
					mergeData.append('title',title);
					mergeData.append('description',description);
					
					console.log("Start merging");
					
					xhr('http://ec2-52-28-52-147.eu-central-1.compute.amazonaws.com/vidme/upload.php', mergeData, 
						function (mergeDone) { 
							var url=mergeDone;
							var splits=url.split(".me/");
							var embedUrl=splits[0]+".me/e/"+splits[1];
							var embedCode="<iframe src='"+embedUrl+"' width='500' height='300' frameborder='0' allowfullscreen webkitallowfullscreen mozallowfullscreen scrolling='no'></iframe>";
							callback(mergeDone,embedCode); 
						});
				}); 
	}); 
}



