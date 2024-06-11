const Deploy = require("../models/Deploy");
const { setUpClientRoute } = require("./clientRouteSetUp");
const { runClientProject } = require("./runClientProject");

module.exports.loadAllClientApps = async function () {
    try {
      const projects = await Deploy.find();
      for (let project of projects) {
            console.log(`Loading Project - ${project.project}`)
            await runClientProject(project.project);
            setUpClientRoute(project.project);
      }
      console.log('All client Apps are ready!')
    } catch (error) {
      console.error("Error loading client apps");
      console.error(error);
    }
};

