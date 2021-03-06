import expect from 'expect.js';

const TEST_DISCOVER_START_TIME = '2015-09-19 06:31:44.000';
const TEST_DISCOVER_END_TIME = '2015-09-23 18:31:44.000';
const TEST_COLUMN_NAMES = ['@message'];

export default function ({ getService, getPageObjects }) {
  const retry = getService('retry');
  const docTable = getService('docTable');
  const PageObjects = getPageObjects(['common', 'header', 'discover']);

  describe('context link in discover', function contextSize() {
    before(async function() {
      await PageObjects.common.navigateToApp('discover');
      await PageObjects.header.setAbsoluteRange(TEST_DISCOVER_START_TIME, TEST_DISCOVER_END_TIME);
      await Promise.all(TEST_COLUMN_NAMES.map((columnName) => (
        PageObjects.discover.clickFieldListItemAdd(columnName)
      )));
    });

    it('should open the context view with the selected document as anchor', async function () {
      const discoverDocTable = await docTable.getTable();
      const firstRow = (await docTable.getBodyRows(discoverDocTable))[0];
      const firstTimestamp = await (await docTable.getFields(firstRow))[0]
        .getVisibleText();

      // add a column in Discover
      await (await docTable.getRowExpandToggle(firstRow)).click();
      const firstDetailsRow = (await docTable.getDetailsRows(discoverDocTable))[0];
      await (await docTable.getRowActions(firstDetailsRow))[0].click();

      // check the column in the Context View
      await retry.try(async () => {
        const contextDocTable = await docTable.getTable();
        const anchorRow = await docTable.getAnchorRow(contextDocTable);
        const anchorTimestamp = await (await docTable.getFields(anchorRow))[0]
          .getVisibleText();
        expect(anchorTimestamp).to.equal(firstTimestamp);
      });
    });

    it('should open the context view with the same columns', async function () {
      const table = await docTable.getTable();
      await retry.try(async () => {
        const headerFields = await docTable.getHeaderFields(table);
        const columnNames = await Promise.all(headerFields.map((headerField) => (
          headerField.getVisibleText()
        )));
        expect(columnNames).to.eql([
          'Time',
          ...TEST_COLUMN_NAMES,
        ]);
      });
    });
  });

}
