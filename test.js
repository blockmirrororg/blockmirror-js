const childProcess = require('child_process');
 
childProcess.exec('rm -rf ../running && mkdir ../running && cd "../running" && ../build/test/test_network ../config.json', function (error, stdout, stderr) {
    if (error) {
        console.log(error.stack);
        console.log('Error code: '+error.code);
        console.log('Signal received: '+error.signal);
    }
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
});
