import DarkServer from "./server";

module.exports = class DarkCore {
    public constructor() {
        this.main();
    }
    private main() {
        new DarkServer().run();
    }
}