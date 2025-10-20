module.exports = {
    apps: [
      {
        name: "runWithPm2",
        script: "runWithPm2.ts",
        interpreter: "node",
        node_args: "-r ts-node/register"
      },
      {
        name: "bot",
        script: "bot/index.ts",
        interpreter: "node",
        node_args: "-r ts-node/register"
      }
    ]
  }
  