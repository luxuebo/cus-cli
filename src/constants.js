const { version,bin } = require('../package.json')
const downloadDirectory = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.cus-cli-template`;//零时存放目录
const gitOrganization = 'lxb-cli';//github阻止
const commandStr = Object.keys(bin)[0]
module.exports ={
    version,
    downloadDirectory,
    gitOrganization,
    commandStr
}