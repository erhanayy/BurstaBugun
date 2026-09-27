import fs from "fs";
const files = fs.readdirSync("./app/api/webhooks", { recursive: true });
console.log(files);
