# CanvasMicrophoneRecorder
A JS library for recording canvas and microphone and uploading the video to vid.me.

To start recording just give it a canvas or div ID.

```javascript
startRecordingCanvas("myCanvas");
```

To stop recording and upload to vid.me:

```javascript

stopRecordingCanvas(function(){
	
		/*
			on complete. 
			start uploading or set some flag that the recording has stopped.
			just make sure that you don't upload before this callback function
		*/
		
		uploadToVidMe(onUploadToVidMeComplete,"vid.me title","vid.me description");
		
	
	});
```
