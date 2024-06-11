const esprima = require("esprima");
const estraverse = require("estraverse");
const escodegen = require("escodegen");
const fs = require("fs-extra");
const path = require("path");

module.exports.getEntryFile = async function getEntryFile(client_project_path) {
  const entryfile = getEntryFileFromPackageJson(client_project_path);
  if (entryfile) {
    return entryfile;
  }
  const possibleEntryFiles = ["app.js", "server.js", "index.js"];
  const foundFiles = await Promise.all(
    possibleEntryFiles.filter(async (file) => {
      if (await fs.pathExists(path.join(client_project_path, file))) {
        return file;
      } else {
        return null;
      }
    })
  );

  if (foundFiles.length > 0) {
    return foundFiles[0];
  } else {
    throw new Error("Unable to find entry file");
  }
};

function getEntryFileFromPackageJson(client_project_path) {
  try {
    const packageJsonPath = path.join(client_project_path, "package.json");
    if (fs.pathExistsSync(packageJsonPath)) {
      const packageJson = require(packageJsonPath);
      if (
        packageJson.main &&
        fs.pathExistsSync(path.join(client_project_path, packageJson.main))
      ) {
        return packageJson.main;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

module.exports.ClientProjectPath = function ClientProjectPath(projectId) {
  const client_project_dir = path.join(
    __dirname,
    "../Client_Projects/Projects"
  );
  const client_project_path = path.join(
    client_project_dir,
    `project_${projectId}`
  );
  return client_project_path;
};

module.exports.SharedNodeModules = function SharedNodeModules() {
  return path.join(__dirname, "../node_modules");
};

module.exports.modifyAppFile = async function modifyAppFile(filePath) {
  try {
      const code = await fs.readFile(filePath, 'utf8');  // Specify encoding
      // Parse the code to generate the AST
      let ast = esprima.parseScript(code, { range: true });

      // Variables to store the name of the express variable and the positions of app.listen calls
      let expressVarName = null;
      let appListenNodes = [];

      // First traversal to find the express variable and app.listen calls
      estraverse.traverse(ast, {
          enter: function (node, parent) {
              // Check for the express variable declaration
              if (
                  node.type === "VariableDeclarator" &&
                  node.init &&
                  node.init.type === "CallExpression" &&
                  node.init.callee.name === "express"
              ) {
                  expressVarName = node.id.name;
              }

              // Check for app.listen calls
              if (
                  node.type === "CallExpression" &&
                  node.callee.type === "MemberExpression" &&
                  node.callee.object.name === expressVarName &&
                  node.callee.property.name === "listen"
              ) {
                  appListenNodes.push(parent);
              }
          },
      });

      // Remove app.listen calls
      appListenNodes.forEach((node) => {
          const index = ast.body.indexOf(node);
          if (index !== -1) {
              ast.body.splice(index, 1);
          } else {
              // If not found in top-level body, traverse deeper to remove it
              estraverse.replace(ast, {
                  enter: function (n, p) {
                      if (n === node) {
                          return estraverse.VisitorOption.Remove;
                      }
                  }
              });
          }
      });

      // Add module.exports = app at the end of the file
      if (expressVarName) {
          const exportNode = esprima.parseScript(`module.exports = ${expressVarName};`).body[0];
          ast.body.push(exportNode);
      } else {
          throw new Error("Express variable not found.");
      }

      const modifiedCode = escodegen.generate(ast);
      await fs.writeFile(filePath, modifiedCode, 'utf8');  // Specify encoding

      console.log('file modified');
      return modifiedCode;

  } catch (error) {
      console.error('Error modifying file:', error);
      throw error;
  }
};

module.exports.checkForEntryFile = async function(localFilePath) {
  try{
     const filestat = fs.statSync(localFilePath);
     if(filestat.isDirectory()){
       console.error('Path belongs to a directory (in function checkEntryFile)', localFilePath);
       return false;
     }
     const projectId = getProjectIdFromLocalPath(localFilePath);
     if(!projectId){
       console.error('failed to detect projectId from localFilePath', localFilePath);
       return false;
     }
     const entry_file = await module.exports.getEntryFile(projectId);
     if(!entry_file) {
      console.log('failed to detect app file', localFilePath, entry_file)
      return false;
     }
     if(path.basename(localFilePath) == entry_file){
        return true;
     }

     return false;
  }
  catch(error){
    console.error(error);
  }
}

function getProjectIdFromLocalPath(localFilePath){
  const starting_path= module.exports.ClientProjectPath('');
  const startIdx = localFilePath.indexOf(starting_path);

  const substringStartIdx = startIdx + starting_path.length;
  const nextSlashIdx = localFilePath.indexOf('/', substringStartIdx);
  const nextBackslashIdx = localFilePath.indexOf('\\', substringStartIdx);

  let endIdx;
  if (nextSlashIdx === -1 && nextBackslashIdx === -1) {
      endIdx = localFilePath.length; 
  } else if (nextSlashIdx === -1) {
      endIdx = nextBackslashIdx;
  } else if (nextBackslashIdx === -1) {

 
      endIdx = nextSlashIdx;
  } else {
      endIdx = Math.min(nextSlashIdx, nextBackslashIdx);
  }

  const projectId = localFilePath.slice(substringStartIdx, endIdx);
  return projectId;
}
