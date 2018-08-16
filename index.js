const fs = require('fs');
const moment = require('moment');
const express = require('express');
const app = express();
const exec = require('child_process').exec;

const _liveText = 'livetext.txt';
const _livePrefix = 'online:';

const _port = 3000;

var userCount = 0;

app.get('/',function(req,res) {
	
	AddCounter(1);

	res.json({
		online: userCount
	});
});


var server = app.listen(_port,function() {
	console.log('App is running on port '+_port);
});


var _fileName = process.argv[2];
var _output = process.argv[3];

function Tick(){
	setInterval(function(){
			var number = Math.floor(Math.random()*10);
			AddCounter(number);
		  },10000);
}

function AddCounter(number){
	userCount = userCount+number;
	fs.writeFile('counter',_livePrefix+userCount,function(err){
		if(err)
			console.log(err);
		else
			console.log('online:'+userCount);
	});
	exec('/bin/mv counter '+_liveText);
}

function logTime(){
	return moment().format("YYYY-MM-DD h:mm:ss a");
}


function ffmpegLive(){

	var ffmpeg = require('fluent-ffmpeg');
	
	ffmpeg(_fileName)
		.inputOptions('-re')
		.addOptions([
			'-vf','drawtext=fontsize=16:fontfile=/usr/share/fonts/open-sans/OpenSans-Regular.ttf:textfile=livetext.txt:fontcolor=white:x=w-100:y=h-50:reload=1:box=1:boxcolor=black@0.5:boxborderw=10',
			'-vcodec libx264',
			'-preset veryfast',
			'-crf 22',
			'-maxrate 1000k',
			'-bufsize 3000k',
			'-acodec libmp3lame',
			'-ac 2',
			'-ar 44100',
			'-b:a 96k'
		])
		.format('flv')
		.output(_output,{
			end:true
		})
		.on('start',function(commandLine) {
			console.log('[' + logTime() + '] video ' + _fileName + ' is Pushing ');
			console.log(commandLine);
		})
		.on('error',function(err,stdout,stderr) {
			console.log('error: ' +err.message);
			console.log('stdout: '+stdout);
			console.log('stderr: '+stderr);
			server.close();
			process.exit(0);
		})
		.on('end',function(){
			console.log('[' + logTime() + '] video ' + _fileName + ' is Finished !');
			server.close();
			process.exit(0);
		})
		.run();
}

AddCounter(1);
ffmpegLive();
Tick();
