const { exec } = require('child_process')

const command = "ps -acxo pid,ppid,pcpu,pmem,vsz,rss,state,command -r | grep 'Google Chrome Helper'"
const limitMem = 200000

guard()
setInterval(guard, 60 * 1000)


function guard() {
  exec(command, (err, stdout, stderr) => {
    console.log(stdout)
    const processes = parseLines(stdout)
    killFatHelper(processes)
  });
}

function parseLines(str) {
  const lines = str.split(/\r?\n/)
  let rev = [];
  for (const line of lines) {
    const words = line.split(/\s+/)
    const firstWord = words[0]
    if (firstWord === '') words.splice(0,1);
    if (!words.length) continue;
    rev.push({
      pid: words[0],
      ppid: words[1],
      pcpu: words[2],
      pmem: words[3],
      vsz: words[4],
      rss: parseInt(words[5]),
      state: words[6]
    })
  }
  rev = rev.sort((a, b) => {
    if (a.rss > b.rss)
      return -1
    if (a.rss < b.rss)
      return 1
    return 0;
  })
  return rev;
}

function killFatHelper(processes) {
  for (const p of processes) {
    console.log(`rss: ${p.rss}`)
    if (p.rss > limitMem) {
      console.log(`kill pid: ${p.pid}`)
      exec(`kill -9 ${p.pid}`, (err, stdout, stderr) => {
        console.log(stdout)
      });
    }
  }
}