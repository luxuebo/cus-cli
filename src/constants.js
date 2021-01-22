const { version,bin } = require('../package.json')
const downloadDirectory = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.cus-cli-template`;//零时存放目录
const gitOrganization = 'lxb-cli';//github组织名称
const askjs = 'ask.js' //模板根目录如果存在 ask.js 文件就是需要填写预设信息的模板，不是简单模板
const commandStr = Object.keys(bin)[0]
module.exports ={
    version,
    downloadDirectory,
    gitOrganization,
    commandStr,
    askjs
}