console.log('Loading function');

exports.handler = function(event, context) {
  console.log("Receive Event:", JSON.stringify(event, null, 2));
  context.succeed("alwary true");
};
