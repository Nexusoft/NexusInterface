const Application = require('spectron').Application
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const electronPath = require('electron')
const path = require('path')

chai.should()
chai.use(chaiAsPromised)
this.app = null
var appRef = null

describe('Application launch and Daemon Load', function() {
  this.timeout(1000000)

  before(function() {
    this.app = new Application({
      path: path.join(
        __dirname,
        '..',
        'release/linux-unpacked/nexus-tritium-beta'
      ),
      args: [
        path.join(__dirname, '..', 'release/linux-unpacked/nexus-tritium-beta'),
      ],
    })
    appRef = this.app
    return this.app.start()
  })

  beforeEach(function() {
    chaiAsPromised.transferPromiseness = this.app.transferPromiseness
  })

  afterEach(function() {
    if (this.app && this.app.isRunning()) {
      //return this.app.stop()
    }
  })

  after(function() {
    if (this.app && this.app.isRunning()) {
      // return this.app.stop()
    }
  })

  it('opens a window', function() {
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
      .and.be.above(0)
  })
  it('tests the title', function() {
    return this.app.client
      .waitUntilWindowLoaded()
      .pause(2000)
      .getTitle()
      .should.eventually.equal('Nexus Tritium Wallet')
  })

  it('Test Close Agreement', function() {
    return this.app.client
      .waitUntilWindowLoaded()
      .pause(2000)
      .click('button*=ACCEPT')
    //.element('button*=Accept').click();
  })

  it('Test Close Experiment', function() {
    return this.app.client
      .waitUntilWindowLoaded()
      .pause(3000)
      .click("button*=Don't")
    //.element('button[class="button primary"]').click();
  })
  this.app
  it('Test Close Encrypt', function() {
    return this.app.client
      .waitUntilWindowLoaded()
      .pause(3000)
      .click('button*=Ignore')
  })

  it('Wait Till Daemon Loads', function() {
    return this.app.client
      .waitUntilWindowLoaded()
      .pause(3500)
      .waitUntilTextExists('span', 'Connections', 2147483646)
  })
})

describe('Run Page Tests', function() {
  this.timeout(222000000)

  it('Test Go To Send', function() {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(5000)
      .element('#navigation')
      .element('a[href^="#/SendRecieve"]')
      .click()
      .pause(1000)
      .waitUntilTextExists('span', 'Queue', 50000)
  })

  it('Add To Queue', function() {
    return appRef.client
      .waitUntilWindowLoaded()
      .setValue(
        'input[placeholder="NXS Address"]',
        '2SBUwJAQMK5BbhUb7QtirKj8r56ae1GwERtQ6svU6MBmbA1iKHd'
      )
      .setValue('input[placeholder="0.00000"]', 99999999)
      .setValue(
        'textarea[placeholder="Enter Your Message',
        'TEST MESSAGE FROM TESTS'
      )
      .click('button*=Add To Queue')
      .waitUntilTextExists(
        'td',
        '2SBUwJAQMK5BbhUb7QtirKj8r56ae1GwERtQ6svU6MBmbA1iKHd'
      )
  })

  it('Test Go To Transactions', function() {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(5000)
      .element('#navigation')
      .element('a[href^="#/Transactions"]')
      .click()
      .pause(1000)
      .waitUntilTextExists('span', 'Transactions', 50000)
  })

  it('Test Go To Market', function() {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(5000)
      .element('#navigation')
      .element('a[href^="#/Market"]')
      .click()
      .pause(1000)
      .waitUntilTextExists('span', 'Market Information', 50000)
  })

  it('Test Go To Address Book', function() {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(5000)
      .element('#navigation')
      .element('a[href^="#/Addressbook"]')
      .click()
      .pause(1000)
      .waitUntilTextExists('span', 'Address Book', 50000)
  })

  it('Test Add Contact', function() {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(1000)
      .click('button*=Add Contact')
      .setValue('input[id="new-account-name"]', 'Test Contact')
      .setValue('input[id="new-account-phone"]', '9990001234')
      .element('#addContactTimeZoneSelect')
      .selectByValue('-420')
      .setValue(
        'textarea[id="new-account-notes"]',
        'Test Contact Creation From Tests'
      )
      .setValue(
        'input[id="nxsaddress"]',
        '2SBUwJAQMK5BbhUb7QtirKj8r56ae1GwERtQ6svU6MBmbA1iKHd'
      )
      .click('button[id="modalAddOrEditContact"]')
  })

  it('Test Go To Settings', function() {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(5000)
      .element('#navigation')
      .element('a[href^="#/Settings"]')
      .click()
      .pause(1000)
      .waitUntilTextExists('span', 'Settings', 50000)
  })

  it('Change Fiat Settings', function() {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(1000)
      .element('#fiatSelector')
      .selectByValue('JPY')
      .pause(500)
      .element('#navigation')
      .element('a[href^="#/"]')
      .click()
      .waitUntilTextExists('span', '(JPY)')
  })

  it('Test Go Terminal', function() {
    //console.log(this.app.client.waitUntilWindowLoaded().getWindowCount().should.eventually.equal(1).element("overviewPage"));

    // .waitUntilTextExists('span',"Please wait for the daemon to load")
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(5000)
      .element('#navigation')
      .element('a[href^="#/Terminal"]')
      .click()
      .pause(1000)
      .waitUntilTextExists('span', 'ClearConsole', 100000000)
      .setValue('input[id="input-text"]', 'getinfo')
      .element('button[id="terminal-console-input-button"]')
      .click()
      .waitUntilTextExists('div', 'balance: 0')
  })

  it('Test Go To Exchange', function() {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(5000)
      .element('#navigation')
      .element('a[href^="#/Exchange"]')
      .click()
      .pause(1000)
      .waitUntilTextExists('span', 'Exchange', 50000)
  })

  it('Test Go To Trust', function() {
    return appRef.client
      .waitUntilWindowLoaded()
      .pause(5000)
      .element('#navigation')
      .element('a[href^="#/List"]')
      .click()
      .pause(1000)
      .waitUntilTextExists('span', 'Trust List', 50000)
  })
})
