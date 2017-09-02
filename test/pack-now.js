// Native
const path = require('path')

// Packages
const crossSpawn = require('cross-spawn')
const test = require('ava')

test.serial('make binary', async t => {
  if (!process.env.CI) {
    t.true(true)
    return
  }

  const result = await spawn('npm', ['run', 'pack'])
  t.is(result.code, 0)
})

const binary = {
  darwin: 'now-macos',
  linux: 'now-linux',
  win32: 'now-win.exe'
}[process.platform]

const binaryPath = path.resolve(__dirname, '../packed/' + binary)
const deployHelpMessage = `To deploy, run in any directory of your choosing`

test.serial('packed "now help" prints deploy help message', async t => {
  if (!process.env.CI) {
    t.true(true)
    return
  }

  const {stdout, code} = await spawn(binaryPath, ['help'])

  t.is(code, 0)
  t.true(stdout.length > 1)
  t.true(stdout.includes(deployHelpMessage))
})

function spawn(command, args) {
  return new Promise((resolve, reject) => {
    const child = crossSpawn.spawn(command, args)

    let stdout = ''
    child.stdout.on('data', data => {
      stdout += data
    })

    child.on('error', err => {
      reject(err)
    })

    child.on('close', code => {
      resolve({
        code,
        stdout
      })
    })
  })
}
