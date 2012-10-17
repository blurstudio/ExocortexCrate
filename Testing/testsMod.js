
var childp = require('child_process');


var TestDesc = function(params){

	for(var v in params){
		if(!params.hasOwnProperty(v)) continue;
		this[v] = params[v];
	}
}

// --- Status:
// Not Started
// AllPassed
// Failed

var pdProto = TestDesc.prototype;
pdProto.toString = function(){
	return [
	'exepath: ', this.exepath,
	'testdir: ', this.testdir,
	'arguments: ', this.arguments,
	'maxfile: ', this.maxfile,
	'dispname: ', this.dispName
	].join(' ');
}


var bDebugXSI = false;//open XSI in non-batchmode with environmental variables set. Then load the test script manually.



pdProto.execute = function(){

	var script = this.scriptPath + this.scriptName;



	var runStr = "";
	if(this.app === "max"){
		runStr = ["\"", this.exepath,"\"" , ' -U MAXScript ', this.arguments, ' ', script].join('');
	}
	else if(this.app === "xsi"){
		//if(bDebugXSI){
			runStr = ["\"", this.exepath,"\""].join('');
		//}
		//else{
		//	runStr = ["\"", this.exepath,"\"", ' -continue -lang Python -script ', script].join('');
		//}
	}

	console.log('runStr: '+runStr);
	console.log('wdir: '+this.testdir);
	console.log('script: '+script);

	var envVar = process.env;
	
	//copy over custom environmental variables
    for(var v in this.runEnvVars){
		if(!this.runEnvVars.hasOwnProperty(v)) continue;
		envVar[v] = this.runEnvVars[v];
	}
	envVar["testPath"] = this.testdir+"/";
	envVar["testName"] = this.testName;
	envVar["genBaseline"] = this.genBaseline;
	envVar["PYTHONPATH"] = __dirname+"/Scripts/Python/common";
	envVar["script"] = script;

	console.log(script);

	var that = this;
	this.child = childp.exec(runStr, {cwd: this.testdir, env:envVar }, function (error, stdout, stderr) {

		if (error !== null) {
			if( error.signal == 'SIGTERM'){
				
			}
			else if(error.code != 0) {

			}
			console.log('errcode: '+error.code);
			that.errcode = error.code;
		}


		console.log('stdout: '+stdout);
		console.log('stderr: '+stderr);
		that.pid = 0;

		that.completionCallback.call(that.completionContext, that);
	});

	this.pid = this.child.pid;
	this.status = 'Running';

	console.log('Starting test...');

	return true;
}

exports.TestDesc = TestDesc;
