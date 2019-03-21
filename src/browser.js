'use strict'

const path = require('path')
const resources = require('./resources')

module.exports = async function (settings) {
  let promiseResolve
  let promiseReject
  const promise = new Promise((resolve, reject) => {
    promiseResolve = resolve
    promiseReject = reject
  })

  const resourceroots = Object.keys(settings.resourceroots).reduce((roots, root) => {
    roots[root] = resources.declare(settings.resourceroots[root])
    return roots
  }, {
    'node-ui5': resources.declare(path.join(__dirname, '../lib'))
  })

  let window
  if (settings.fastButIncompleteSimulation) {
    window = require('./mindom/factory')(settings)
  } else {
    window = require('./jsdom/factory')(settings)
  }

  // Inject factory hooks
  window.__factory__ = {
    resolve: sap => {
      if (settings.exposeAsGlobals) {
        global.window = window
        global.sap = sap
      }
      promiseResolve({ window, sap })
    },
    reject: reason => {
      promiseReject(reason)
    }
  }

  // Create the UI5 bootstrap node
  var ui5Boot = window.document.createElement('script')
  ui5Boot.id = 'sap-ui-bootstrap'
  ui5Boot.setAttribute('src', settings.bootstrapLocation)
  ui5Boot.setAttribute('data-sap-ui-compatVersion', 'edge')
  ui5Boot.setAttribute('data-sap-ui-frameOptions', 'allow')
  ui5Boot.setAttribute('data-sap-ui-resourceroots', JSON.stringify(resourceroots))
  window.document.documentElement.appendChild(ui5Boot)

  // Create the custom bootstrap node
  var customBoot = window.document.createElement('script')
  customBoot.textContent = `
  if (typeof sap !== 'undefined') {
    sap.ui.getCore().attachInit(function() {
      window.__factory__.resolve(sap)
    })
  } else {
    window.__factory__.reject(new Error('Invalid bootstrap'))
  }`
  window.document.documentElement.appendChild(customBoot)

  return promise
}
