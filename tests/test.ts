import * as Spectron from "spectron";
import * as path from "path";

const assert = require('assert');

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

   it('shows an initial window', (done) => {
      app.client.getWindowCount().then((count) => {
         assert.equal(count, 1)
         // Please note that getWindowCount() will return 2 if `dev tools` are opened.
         // assert.equal(count, 2)
      }).then(() => {
         // Check if the window is visible
         return app.browserWindow.isVisible();
      }).then((isVisible) => {
         // Verify the window is visible
         assert.equal(isVisible, true);
         done();
      });
   });
});