import * as Spectron from "spectron";
import * as path from "path";
import {dd} from "dumper.js";
import * as assert from "assert";

let electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');
if (process.platform === 'win32') {
   electronPath += '.cmd';
}

const appPath = path.join(__dirname, '..', 'main', 'main.js');

describe('Application launch', function () {
   this.timeout(10000);
   let app: Spectron.Application;

   beforeEach(function () {
      app = new Spectron.Application({
         path: electronPath,
         args: [appPath]
      });
      return app.start();
   });

   afterEach(function () {
      if (app && app.isRunning()) {
         return app.stop();
      }
   });

   it('shows an initial window', async () => {
      const count = await app.client.getWindowCount();
      assert.equal(count, 1, "window count");
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
      // assert.equal(count, 2)

      const isVisible = await app.browserWindow.isVisible();
      assert.equal(isVisible, true, "window is visible");

      const timerDoms = await app.client.$$("timers .timer");
      assert.equal(timerDoms.length, 1, "number of initial task = 1");
   });
});