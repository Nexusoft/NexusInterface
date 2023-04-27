const Application = require('spectron').Application;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const electronPath = require('electron');
const path = require('path');

chai.should();
chai.use(chaiAsPromised);
this.app = null;
var appRef = null;
var errorOutput = [];
var appPath = '';

describe('Application launch and Daemon Load', function () {
  this.timeout(1000000);

  before(function () {
    if (process.platform === 'win32') {
      appPath = 'release/win-unpacked/Nexus Wallet.exe';
    } else if (process.platform === 'darwin') {
      appPath = 'release/mac-unpacked/nexus_wallet';
    } else {
      appPath = 'release/linux-unpacked/nexus_wallet';
    }

    this.app = new Application({
      path: path.join(__dirname, '..', appPath),
      args: [path.join(__dirname, '..', appPath)],
    });
    appRef = this.app;
    let fs = require('fs');
    fs.mkdir('Test-Output', () => {});
    return this.app.start();
  });

  beforeEach(function () {
    chaiAsPromised.transferPromiseness = this.app.transferPromiseness;
  });

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      //return this.app.stop()
    }
    if (this.currentTest.state == 'failed') {
      var testTitle = this.currentTest.title;
      console.log(this.currentTest);
      errorOutput.push(this.currentTest.title);
      errorOutput.push('\n');
      errorOutput.push(this.currentTest.err);
      errorOutput.push('\n \n \n');
      this.app.browserWindow.capturePage().then(function (imageBuffer) {
        let fs = require('fs');
        fs.writeFile(
          'Test-Output/Nexus_Fail_Test_' + testTitle + '.png',
          imageBuffer,
          function () {}
        );
      });
    }
  });

  after(function () {
    //let fs = require('fs')
    //fs.writeFile('Test-Output/Nexus_Fail_Test_Stats.txt', errorOutput, function() {})
    if (this.app && this.app.isRunning()) {
      // return this.app.stop()
    }
  });

  it('opens a window', function () {
    return this.app.client
      .waitUntilWindowLoaded()
      .getWindowCount()
      .should.eventually.have.at.least(1)
      .browserWindow.isMinimized()
      .should.eventually.be.false.browserWindow.isVisible()
      .should.eventually.be.true.browserWindow.isFocused()
      .should.eventually.be.true.browserWindow.getBounds()
      .should.eventually.have.property('width')
      .and.be.above(0)
      .browserWindow.getBounds()
      .should.eventually.have.property('height')
      .and.be.above(0);
  });
  it('tests the title', function () {
    return this.app.client
      .waitUntilWindowLoaded()
      .pause(2000)
      .getTitle()
      .should.eventually.equal('Nexus');
  });

  it('Test Close Agreement', function () {
    return this.app.client
      .waitUntilWindowLoaded()
      .pause(2000)
      .click('button*=I have read and Accept the Agreement');
    //.element('button*=Accept').click();
  });

  it('Test Close Experiment', function () {
    return this.app.client
      .waitUntilWindowLoaded()
      .pause(3000)
      .click("button*=Don't");
    //.element('button[class="button primary"]').click();
  });
  this.app;
  it('Test Close Encrypt', function () {
    return this.app.client
      .waitUntilWindowLoaded()
      .pause(3000)
      .click('button*=Ignore');
  });

  it('Wait Till Daemon Loads', function () {
    return this.app.client
      .waitUntilWindowLoaded()
      .pause(3500)
      .waitUntilTextExists('div', 'CONNECTIONS', 2147483646);
  });
});

describe('Run Page Tests', function () {
  this.timeout(222000000);

  afterEach(function () {
    if (this.currentTest.state == 'failed') {
      var testTitle = this.currentTest.title;
      console.log(this.currentTest);
      errorOutput.push(this.currentTest.title);
      errorOutput.push('\n');
      errorOutput.push(this.currentTest.err);
      errorOutput.push('\n \n \n');
      appRef.browserWindow.capturePage().then(function (imageBuffer) {
        let fs = require('fs');
        fs.writeFile(
          'Test-Output/Nexus_Fail_Test_' + testTitle + '.png',
          imageBuffer,
          function () {}
        );
      });
    }
  });

  after(function () {
    let fs = require('fs');
    fs.writeFile(
      'Test-Output/Nexus_Fail_Test_Stats.txt',
      errorOutput,
      function () {}
    );
  });
  /*
  it('Test Disable Bootstrap', function() {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(5000)
      .waitUntilTextExists(
        'h3',
        'Would you like to reduce the time it takes to sync by downloading a recent version of the database?',
        20000
      )
      .click('button*=No, let it sync from scratch');
  });
*/
  it('Test Go To Send', function () {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(5000)
      .element('nav')
      .element('a[href^="#/Send"]')
      .click()
      .pause(1000)
      .waitUntilTextExists('label', 'SEND FROM', 50000);
  });

  it('Add To Queue', function () {
    return (
      appRef.client
        .waitUntilWindowLoaded()
        //.element('#addContactTimeZoneSelect')
        //.selectByValue('-420')
        .setValue(
          'input[placeholder="Recipient Address"]',
          '2SBUwJAQMK5BbhUb7QtirKj8r56ae1GwERtQ6svU6MBmbA1iKHd'
        )
        .setValue('input[placeholder="0.00000"]', 99999999)
        .setValue(
          'textarea[placeholder="Enter Your Message',
          'TEST MESSAGE FROM TESTS'
        )
        .element('span[direction="down"]')
        .click()
        .element('//div[contains(text(),"default")]')
        .click()
        .click('button*=Send To Multiple Recipients')
    );
  });

  it('Test Go To Transactions', function () {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(5000)
      .element('nav')
      .element('a[href^="#/Transactions"]')
      .click()
      .pause(1000)
      .waitUntilTextExists('label', 'SEARCH ADDRESS', 50000);
  });

  it('Test Go To Market', function () {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(5000)
      .element('nav')
      .element('a[href^="#/Market"]')
      .click()
      .pause(1000)
      .waitUntilTextExists('b', '24hr Change', 50000);
  });

  it('Test Go To Address Book', function () {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(5000)
      .element('nav')
      .element('a[href^="#/AddressBook"]')
      .click()
      .pause(1000)
      .waitUntilTextExists('span', 'Address Book', 50000);
  });

  it('Test Add Contact', function () {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(1000)
      .element('(//button[*])[2]')
      .click()
      .setValue(
        'input[placeholder="Their Nexus Address"]',
        '2SBUwJAQMK5BbhUb7QtirKj8r56ae1GwERtQ6svU6MBmbA1iKHd'
      )
      .setValue('input[name="name"]', 'Test Contact')

      .setValue('input[placeholder="Phone Number"]', '9990001234')
      .setValue('textarea[name="notes"]', 'Test Contact Creation From Tests')
      .element('span[direction="down"]')
      .click()
      .pause(500)
      .element('//div[contains(text(),"(UTC-4.00)")]')
      .click()
      .setValue('input[name="email"]', 'test@foo.bar')

      .pause(3000)
      .element('button[type="submit"]')
      .click();
  });

  it('Test Go To Settings', function () {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(5000)
      .element('nav')
      .element('a[href^="#/Settings"]')
      .click()
      .pause(1000)
      .waitUntilTextExists('span', 'Settings', 50000);
  });

  it('Test Backup wallet', function () {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(1000)
      .click('button*=Backup Wallet')
      .pause(500)
      .click('button*=Yes')
      .pause(100)
      .waitUntilTextExists('div', 'Wallet Backed Up', 5000)
      .pause(1000);
  });

  it('Change Fiat Settings', function () {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(1000)
      .element('//div[contains(text(),"United States Dollar (USD)")]')
      .click()
      .pause(500)
      .element('//div[contains(text(),"Euro")]')
      .click()
      .pause(500)
      .element('nav')
      .element('a[href^="#/"]')
      .click()
      .waitUntilTextExists('div', 'EUR')
      .element('nav')
      .element('a[href^="#/Settings"]')
      .click()
      .pause(500)
      .element('//div[contains(text(),"Euro (EUR)")]')
      .click()
      .pause(500)
      .element('//div[contains(text(),"United States")]')
      .click()
      .pause(500);
  });

  it('Test Go Terminal', function () {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(5000)
      .element('nav')
      .element('a[href^="#/Terminal"]')
      .click()
      .pause(1000)
      .waitUntilTextExists('div', 'Clear Console', 10000)
      .setValue(
        'input[placeholder="Enter Console Commands Here (ex: getinfo, help)"]',
        'getinfo'
      )
      .element('button*=Execute')
      .click()
      .waitUntilTextExists('div', 'protocolversion: 20000', 5000);
  });
  /*
  it('Test Go To Exchange', function() {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(5000)
      .element('nav')
      .element('a[href^="#/Exchange"]')
      .click()
      .pause(1000)
      .waitUntilTextExists('span', 'Exchange', 50000);
  });

  it('Test Go To Trust', function() {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(5000)
      .element('nav')
      .element('a[href^="#/List"]')
      .click()
      .pause(1000)
      .waitUntilTextExists('span', 'Trust List', 50000);
  });

  

  it ("Test Encryption", function () {
    return appRef.client.waitUntilWindowLoaded().pause(5000).element("settings-container").element('a[href^="#/Settings/Unencrypted"]')
    .click().pause(500)
    .setValue('input[id="newPass"]',"Password")
    .setValue('input[id="passChk"]', "Password")
    .click('button*=Encrypt and Restart')
    ;
  });

  it ("Test Login", function () {
    return appRef.client.waitUntilWindowLoaded().pause(5000).element("settings-container").element('a[href^="#/Settings/Security"]')
    .click().pause(500)
    .setValue('input[type="date"]',"2019-1-1")
    .setValue('input[type="time"]',"01:01")
    .setValue('input[id="pass"]', "Password")
    .click('button*=Submit')
    .waitUntilTextExists('span',"Change Password",50000)
    ;
  });

  */
});
