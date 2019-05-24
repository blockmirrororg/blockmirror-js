const spawn = require("child_process").spawn;
const subProcess = spawn("bash");

/**
 * 
 * @param {*} data 
 */
function onData(data) {
  process.stdout.write(data);
}

subProcess.stdout.on("data", onData);
subProcess.stderr.on("data", onData);

subProcess.on("error", function() {
  console.log("error");
});

subProcess.on("close", (code) => {
  console.log(`子进程退出码：${code}`);
});

subProcess.stdin.write("rm -rf ../running \n");
subProcess.stdin.write("mkdir ../running \n");
subProcess.stdin.write("cd ../running \n");
subProcess.stdin.write("../build/test/test_network ../config.json \n");
