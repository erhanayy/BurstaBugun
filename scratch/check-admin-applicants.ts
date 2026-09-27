import { getAdminApplicants } from "../lib/actions/admin";

async function main() {
    const apps = await getAdminApplicants();
    const withSelections = apps.filter(a => a.selections && a.selections.length > 0);
    console.log(`Total apps: ${apps.length}`);
    console.log(`Apps with selections: ${withSelections.length}`);
    if (withSelections.length > 0) {
        console.log("Example selection fund name:", withSelections[0].selections[0].fund?.name);
    }
    process.exit(0);
}
main().catch(console.error);
