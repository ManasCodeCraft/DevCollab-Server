const { NodeVM } = require('vm2');
const fs = require('fs');
const path = require('path')
const { SharedNodeModules, ClientProjectPath, getEntryFile } = require("../utils/deploymentUtils");
const ConsoleLog = require('../models/ConsoleLog');
const ClientAppManager = require('./clientAppManager');

module.exports.runClientProject = async function runClientProject(projectId) {
    const shared_node_modules = SharedNodeModules();
    const client_project_path = ClientProjectPath(projectId);
    const entry_file_name = await getEntryFile(client_project_path);
    if (!entry_file_name) {
      throw new Error("Entry file not found");
    }
    const entryFilePath = path.join(client_project_path, entry_file_name);

    const code = fs.readFileSync(entryFilePath, "utf-8");

    const vm = new NodeVM({
      console: "redirect",
      sandbox: {},
      require: {
        builtin: ["*"],
        external: true,
        root: [client_project_path, shared_node_modules],
        resolve: (moduleName) => {
          if (moduleName.startsWith("./") || moduleName.startsWith("../")) {
            return path.resolve(projectPath, moduleName);
          } else {
            return require.resolve(moduleName, { paths: [shared_node_modules] });
          }
        },
      },
    });
  
    vm.on("console.log", async (message) => {
        const log = new ConsoleLog({ type: "console", details: message, project: projectId })
        await log.save();
    });
  
    vm.on("console.error", async (message) => {
        const log = new ConsoleLog({ type: "error", details: message, project: projectId })
        await log.save();
    });
  
    const vm_app = vm.run(code, entryFilePath);
    ClientAppManager.addClientApp(projectId, [vm, vm_app])

    return vm_app;
  };