import { db } from "../lib/db";

async function run() {
    const funds = await db.query.funds.findMany();
    console.log("FUNDS:");
    funds.forEach(f => console.log(f.id, f.title));

    const selections = await db.query.fundSelections.findMany();
    console.log("SELECTIONS:");
    console.log(selections.map(s => ({ app: s.applicationId, fund: s.fundId })));

    const apps = await db.query.applications.findMany();
    console.log("APPLICATIONS:");
    console.log(apps.filter(a => a.status === 'selected').map(a => ({ app: a.id, fund: a.fundId })));

    process.exit(0);
}
run();
