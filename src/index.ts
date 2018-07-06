import DarkServer from "./server";
import { initDB } from "./models";

module.exports = class DarkCore {
    public constructor() {
        this.main();
    }
    private async main() {
        await initDB();
        new DarkServer().run();
    }
}
