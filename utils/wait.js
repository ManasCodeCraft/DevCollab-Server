
module.exports.waitInMs = async function (timeMs){
    await new Promise((resolve) => setTimeout(resolve, timeMs));
}