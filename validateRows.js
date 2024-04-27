import { utils } from 'xlsx/xlsx.mjs'
import { writeFileSync } from "fs";
import format from './format.js';

const checker = (arr, target) => target.every(v => arr.includes(v));

export function validRows(workbook) {
    const sheetName = workbook.SheetNames[0]; // Assuming you want to read the first sheet
    const sheet = workbook.Sheets[sheetName];
    const columns = utils.sheet_to_json(sheet, { header: 1})[0];
    return checker(columns, format)
}

export default function validateAddresses(workbook) {
    const sheetName = workbook.SheetNames[0]; // Assuming you want to read the first sheet
    const sheet = workbook.Sheets[sheetName];
    const arrayData = utils.sheet_to_json(sheet, { defval: ""})


    // ============== Enter Validation API here ===================
    const validated = [1, 3, 30, 33, 44].forEach(row => {
        arrayData[row]["Name"] = "Validated address"
    })
    // =============================================================

    return arrayData
}

export function sendFiles(jsonData, rowsPerFile = 10) {
    const group = splitArray(jsonData, 10);
    group.forEach((data, i) => {
        const ws = utils.json_to_sheet(data);
        const csv = utils.sheet_to_csv(ws)

        // Write the workbook to a file
        const filePath = `.generated_excel_${i + 1}.csv`;
        writeFileSync(filePath, csv, 'utf8');
    })
}



function splitArray(array, elementsPerArray) {
    return Array.from({ length: Math.ceil(array.length / elementsPerArray) }, (_, index) =>
        array.slice(index * elementsPerArray, (index + 1) * elementsPerArray)
    );
}