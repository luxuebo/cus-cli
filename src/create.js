const axios = require('axios');
const logSymbols = require('log-symbols')
const chalk = require('chalk')
const ora = require('ora');
const Inquirer = require('inquirer');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
let downloadGitRepo = require('download-git-repo');
const MetalSmith = require('metalsmith'); // 遍历文件夹 找需不需要渲染
// consolidate 统一了 所有的模版引擎
let { render } = require('consolidate').ejs;
render = promisify(render);
// 可以把异步的api转换成promise
downloadGitRepo = promisify(downloadGitRepo);
let ncp = require('ncp');
const { 
  downloadDirectory, 
  gitOrganization, 
  commandStr,//脚手架命令
  askjs 
} = require('./constants');
ncp = promisify(ncp);
// create的所有逻辑
//选择从何处拉取模板 github组织中或者脚手架中
// 从githun中拉取模板
//     拉取你自己的所有项目列出 让用户选 安装哪个项目 projectName
//     选完后 在显示所有的版本号 1.0.0
//     可能还需要用户配置一些数据 来结合渲染项目，比如填写package.json中的内容
//     https://api.github.com/orgs/lxb-cli/repos 获取组织下的仓库
//从脚手架中拉取模板
//   选择模板
//   可能还需要用户配置一些数据 来结合渲染项目，比如填写package.json中的内容
// 1.获取项目列表
const fetchRepoList = async () => {
  const {
    data,
  } = await axios.get(`https://api.github.com/orgs/${gitOrganization}/repos`);
  return data;
};
// 2.抓取tag列表
const fetchTagList = async (repo) => {
  const {
    data,
  } = await axios.get(`https://api.github.com/repos/${gitOrganization}/${repo}/tags`);
  return data;
};
// 3.封装loading效果
const waitFnloading = (fn, message) => async (...args) => {
  const spinner = ora(message);
  spinner.start();
  const result = await fn(...args);
  spinner.succeed();
  return result;
};
//4.下载模板到临时目录
const download = async (repo, tag) => {
  let api = `lxb-cli/${repo}`;
  if (tag) {
    api += `#${tag}`;
  }
  const dest = `${downloadDirectory}/${repo}`;
  await downloadGitRepo(api, dest);
  return dest;//返回临时目录路径
};
//5.下载模板成功后控制台打印提示信息
function consoleInfo(projectName) {
  console.log(logSymbols.success, `项目:${chalk.magenta(projectName)} 创建成功`)
  console.log(`  let's go !!!`)
  console.log(chalk.cyan(`  cd ${projectName}`))
  console.log(chalk.cyan(`  npm install`))
  console.log(chalk.cyan(`  npm run dev`))
}
//6.获取当前文件夹中的子文件夹名称
let getFileDirectoryList = async (path) => {
  let directoryList = []//子文件列表
  const fileList = fs.readdirSync(path)
  fileList.forEach(function (item) {
    let stat = fs.lstatSync(path + '/' + item)
    if (stat.isDirectory() === true) {
      directoryList.push(item)
    }
  })
  return directoryList
}
//7.判断当前目录是否已存在和新创建的文件夹重名,是否继续
let isNextDo = async (projectName, copyTemplate,callback) => {
  //当前文件夹中的文件夹列表
  let currentDirectoryList = await getFileDirectoryList(process.cwd())
  //判断是否存在已有文件夹
  if (currentDirectoryList.includes(projectName)) {
    const {
      isReplace,
    } = await Inquirer.prompt({
      name: 'isReplace', // 获取选择后的结果
      type: 'confirm', // 什么方式显示在命令行
      message: ` ${projectName} 文件夹已存在,是否要替换?`, // 提示信息
    });
    if (!isReplace) {
      return
    } else {
      //存在文件夹 用户确认后继续下一步
      callback(copyTemplate,projectName)
    }
  } else {
    //不存在文件夹直接继续下一步
    callback(copyTemplate,projectName)
  }
}
//8.拷贝操作
let copyTemplate = async (result,projectName) => {
  if (!fs.existsSync(path.join(result, askjs))) {
    await ncp(result, path.resolve(projectName));
    consoleInfo(projectName)
  } else {
    // 复杂的需要模版渲染 渲染后在拷贝
    // 把git上的项目下载下来 如果有askjs 文件就是一个复杂的模版,
    // 我们需要用户选择, 选择后编译模版
    // 1.让用户填信息
    await new Promise((resolve, reject) => {
      MetalSmith(__dirname) // 如果你传入路径 他默认会遍历当前路径下的src文件夹
        .source(result)
        .destination(path.resolve(projectName))
        .use(async (files, metal, done) => {
          const args = require(path.join(result, askjs));
          const obj = await Inquirer.prompt(args);
          const meta = metal.metadata();
          Object.assign(meta, obj);
          delete files[askjs];
          done();
        })
        .use((files, metal, done) => {
          // 2.让用户天填写的信息去渲染模版
          // metalsmith 只要是模版编译 都需要这个模块
          const obj = metal.metadata();
          Reflect.ownKeys(files).forEach(async (file) => {
            // 这个是要处理的
            if (file.includes('js') || file.includes('json')) {
              let content = files[file].contents.toString(); // 文件内容
              if (content.includes('<%')) {
                content = await render(content, obj);
                files[file].contents = Buffer.from(content); // 渲染
              }
            }
          });
          // 根据用户的输入 下载模版
          // console.log(metal.metadata());
          done();
          consoleInfo(projectName)
        })
        .build((err) => {
          if (err) {
            reject();
          } else {
            resolve();
          }
        });
    });
  }
}
module.exports = async (projectName) => {
  //从哪里拉取模板 github或者脚手架中
  let templateWhereList = ['从github中拉取模板', '从cus-cli中拉取模板'];
  const {
    whereTemplate,
  } = await Inquirer.prompt({
    name: 'whereTemplate', // 获取选择后的结果
    type: 'list', // 什么方式显示在命令行
    message: '请选择从何处获取模板', // 提示信息
    choices: templateWhereList, // 选择的数据
  });
  if (templateWhereList.indexOf(whereTemplate) == 1) {
    //1.从cus-cli中拉取模板
    const result = path.resolve(__dirname, '../template')//获取根目录
    //获取文件脚手架中的模板列表
    let templateDirectoryList = await getFileDirectoryList(result);
    const {
      repo,
    } = await Inquirer.prompt({
      name: 'repo', // 获取选择后的结果
      type: 'list', // 什么方式显示在命令行
      message: '请选择一个项目模板创建项目', // 提示信息
      choices: templateDirectoryList, // 选择的数据
    });
    // 这个目录 项目名字是否已经存在 如果存在提示当前已经存在,是否继续，在回调函数中继续
    isNextDo(projectName, copyTemplate,async (copyTemplate1)=>{
      copyTemplate1(`${result}/${repo}`,projectName)
    })
  } else {
    //2.从github拉取模板
    let repos = await waitFnloading(fetchRepoList, '从github获取模板信息....')();
    repos = repos.map((item) => item.name);
    // 在获取之前 显示loading 关闭loading
    // 选择模版 inquirer
    const {
      repo,
    } = await Inquirer.prompt({
      name: 'repo', // 获取选择后的结果
      type: 'list', // 什么方式显示在命令行
      message: '请选择一个项目模板创建项目', // 提示信息
      choices: repos, // 选择的数据
    });
    // 通过当前选择的项目 拉去对应的版本
    // 2.1 获取对应的版本号
    let tags = await waitFnloading(fetchTagList, '从github获取版本信息......')(repo);
    tags = tags.map((item) => item.name);
    // 选择版本号
    const {
      tag,
    } = await Inquirer.prompt({
      name: 'tag', // 获取选择后的结果
      type: 'list', // 什么方式显示在命令行
      message: '请选择一个版本创建项目', // 提示信息
      choices: tags, // 选择的数据
    });
    // 下载模版
    // 2.2 把模版放到一个临时目录里存好,以备后期使用
    // download-git-repo
    const result = await waitFnloading(download, '下载模板.......')(repo, tag);//下载目录
    // 拿到了下载目录 直接拷贝当前执行的目录下即可 ncp
    // 把.{commandStr}-template 下的文件 拷贝到执行命令的目录下
    // 2.3 拷贝操作
    // 这个目录 项目名字是否已经存在 如果存在提示当前已经存在,是否继续，在回调函数中继续
    isNextDo(projectName, copyTemplate,async (copyTemplate1)=>{
      copyTemplate1(result,projectName)
    })
  }
};