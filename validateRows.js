import { utils } from 'xlsx/xlsx.mjs'

export default function validateRows(workbook) {
    const sheetName = workbook.SheetNames[0]; // Assuming you want to read the first sheet
    const sheet = workbook.Sheets[sheetName];
    return utils.sheet_to_json(sheet);
}