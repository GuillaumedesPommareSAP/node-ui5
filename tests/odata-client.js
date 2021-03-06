'use strict'

const { assert } = require('./common')

module.exports = ({ sap }) => {
  sap.ui.require([
    'sap/ui/model/odata/v2/ODataModel'
  ], async function (ODataModel) {
    console.log('Creating ODataModel...')
    const model = new ODataModel({
      serviceUrl: 'https://services.odata.org/V2/OData/OData.svc'
    })
    await model.metadataLoaded()
    console.log('Loading products...')
    model.read('/Products', {
      success: data => {
        data.results.forEach(product => {
          console.log(product.Name.padEnd(20, ' '), product.Description)
        })
        assert(() => data.results.length !== 0)
      }
    })
  })
}
