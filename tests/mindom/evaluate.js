'use strict'

const {
  XML,
  assert
} = require('./common')

const Node = require('../../src/mindom/Node')
const Window = require('../../src/mindom/Window')
const window = new Window({
  baseURL: 'http://localhost'
})
assert(() => window)

const parser = new window.DOMParser()
assert(() => parser)

const xmlSource = `<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">
  <edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0">
    <Schema xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://schemas.microsoft.com/ado/2007/05/edm" Namespace="ODataDemo">
      <EntityType Name="Product">
        <Key>
          <PropertyRef Name="ID" />
        </Key>
        <Property Name="ID" Type="Edm.Int32" Nullable="false" />
        <Property Name="Name" Type="Edm.String" Nullable="true" m:FC_TargetPath="SyndicationTitle" m:FC_ContentKind="text" m:FC_KeepInContent="false" />
        <Property Name="Description" Type="Edm.String" Nullable="true" m:FC_TargetPath="SyndicationSummary" m:FC_ContentKind="text" m:FC_KeepInContent="false" />
        <Property Name="ReleaseDate" Type="Edm.DateTime" Nullable="false" />
        <Property Name="DiscontinuedDate" Type="Edm.DateTime" Nullable="true" />
        <Property Name="Rating" Type="Edm.Int32" Nullable="false" />
        <Property Name="Price" Type="Edm.Decimal" Nullable="false" />
        <NavigationProperty Name="Category" Relationship="ODataDemo.Product_Category_Category_Products" FromRole="Product_Category" ToRole="Category_Products" />
        <NavigationProperty Name="Supplier" Relationship="ODataDemo.Product_Supplier_Supplier_Products" FromRole="Product_Supplier" ToRole="Supplier_Products" />
      </EntityType>
      <EntityType Name="Category">
        <Key>
          <PropertyRef Name="ID" />
        </Key>
        <Property Name="ID" Type="Edm.Int32" Nullable="false" />
        <Property Name="Name" Type="Edm.String" Nullable="true" m:FC_TargetPath="SyndicationTitle" m:FC_ContentKind="text" m:FC_KeepInContent="true" />
        <NavigationProperty Name="Products" Relationship="ODataDemo.Product_Category_Category_Products" FromRole="Category_Products" ToRole="Product_Category" />
      </EntityType>
      <EntityType Name="Supplier">
        <Key>
          <PropertyRef Name="ID" />
        </Key>
        <Property Name="ID" Type="Edm.Int32" Nullable="false" />
        <Property Name="Name" Type="Edm.String" Nullable="true" m:FC_TargetPath="SyndicationTitle" m:FC_ContentKind="text" m:FC_KeepInContent="true" />
        <Property Name="Address" Type="ODataDemo.Address" Nullable="false" />
        <Property Name="Concurrency" Type="Edm.Int32" Nullable="false" ConcurrencyMode="Fixed" />
        <NavigationProperty Name="Products" Relationship="ODataDemo.Product_Supplier_Supplier_Products" FromRole="Supplier_Products" ToRole="Product_Supplier" />
      </EntityType>
      <ComplexType Name="Address">
        <Property Name="Street" Type="Edm.String" Nullable="true" />
        <Property Name="City" Type="Edm.String" Nullable="true" />
        <Property Name="State" Type="Edm.String" Nullable="true" />
        <Property Name="ZipCode" Type="Edm.String" Nullable="true" />
        <Property Name="Country" Type="Edm.String" Nullable="true" />
      </ComplexType>
      <Association Name="Product_Category_Category_Products">
        <End Role="Product_Category" Type="ODataDemo.Product" Multiplicity="*" />
        <End Role="Category_Products" Type="ODataDemo.Category" Multiplicity="0..1" />
      </Association>
      <Association Name="Product_Supplier_Supplier_Products">
        <End Role="Product_Supplier" Type="ODataDemo.Product" Multiplicity="*" />
        <End Role="Supplier_Products" Type="ODataDemo.Supplier" Multiplicity="0..1" />
      </Association>
      <EntityContainer Name="DemoService" m:IsDefaultEntityContainer="true">
        <EntitySet Name="Products" EntityType="ODataDemo.Product" />
        <EntitySet Name="Categories" EntityType="ODataDemo.Category" />
        <EntitySet Name="Suppliers" EntityType="ODataDemo.Supplier" />
        <AssociationSet Name="Products_Category_Categories" Association="ODataDemo.Product_Category_Category_Products">
          <End Role="Product_Category" EntitySet="Products" />
          <End Role="Category_Products" EntitySet="Categories" />
        </AssociationSet>
        <AssociationSet Name="Products_Supplier_Suppliers" Association="ODataDemo.Product_Supplier_Supplier_Products">
          <End Role="Product_Supplier" EntitySet="Products" />
          <End Role="Supplier_Products" EntitySet="Suppliers" />
        </AssociationSet>
        <FunctionImport Name="GetProductsByRating" EntitySet="Products" ReturnType="Collection(ODataDemo.Product)" m:HttpMethod="GET">
          <Parameter Name="rating" Type="Edm.Int32" Mode="In" />
        </FunctionImport>
      </EntityContainer>
    </Schema>
  </edmx:DataServices>
</edmx:Edmx>`
const document = parser.parseFromString(xmlSource, XML)

const namespacePrefixes = {
  edmx: 'http://docs.oasis-open.org/odata/ns/edmx',
  d: 'http://docs.oasis-open.org/odata/ns/edm'
}

function selectNodes (xpath, rootNode) {
  console.log(xpath.yellow)
  const result = document.evaluate(xpath, rootNode, prefix => namespacePrefixes[prefix] || null, /* ORDERED_NODE_SNAPSHOT_TYPE: */ 7, null)
  assert(() => result)
  return result
}

const allSchema = selectNodes('//d:Schema', document)
assert(() => allSchema.snapshotLength === 1)
const schemaNode = allSchema.snapshotItem(0)
assert(() => schemaNode && schemaNode.nodeType === Node.ELEMENT_NODE)
assert(() => schemaNode.nodeName === 'Schema')
assert(() => schemaNode.getAttribute('Namespace') === 'ODataDemo')
