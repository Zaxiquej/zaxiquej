// Standard expansion now targets only playable one-, two- and three-card combinations.
const small = require("./expand-small.cjs");
module.exports = { buildExpanded: small.buildExpanded };
if (require.main === module) small.main().catch(error => { console.error(error); process.exitCode = 1; });
