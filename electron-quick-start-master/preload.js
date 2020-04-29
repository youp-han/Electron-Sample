// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {

  //const replaceText = (selector, text) => {
  //  const element = document.getElementById(selector)
  //  if (element) element.innerText = text
  //}

  //for (const type of ['chrome', 'node', 'electron']) {
  //  replaceText(`${type}-version`, process.versions[type])
  //}


  //checking process running
  const exec = require('child_process').exec;
  const isRunning = (query, cb) => {
      let platform = process.platform;
      let cmd = '';
      switch (platform) {
          case 'win32' : cmd = `tasklist`; break;
          case 'darwin' : cmd = `ps -ax | grep ${query}`; break;
          case 'linux' : cmd = `ps -A`; break;
          default: break;
      }
      exec(cmd, (err, stdout, stderr) => {
          cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
      });
  }

  let nameOfProcessRunning = 'PccNTMon.exe'  

  isRunning(nameOfProcessRunning, (status) => {
    console.log('PccNTMon-running', status)//true/false
  })

})
