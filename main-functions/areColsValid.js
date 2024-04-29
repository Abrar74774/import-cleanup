import { utils } from "xlsx";
import format from "../format.js";

const checker = (arr, target) => target.every(v => arr.includes(v));

export default function areColsValid(workbook) {
    const sheetName = workbook.SheetNames[0]; // Assuming you want to read the first sheet
    const sheet = workbook.Sheets[sheetName];
    const columns = utils.sheet_to_json(sheet, { header: 1 })[0];
    return checker(columns, format)
}