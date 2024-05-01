import { utils } from "xlsx";
import format from "../config/format.js";

const checker = (arr, target) => target.every(v => arr.includes(v));

export default function areColsValid(data) {
    const sheet = utils.json_to_sheet(data)
    const columns = utils.sheet_to_json(sheet, { header: 1 })[0];
    return checker(columns, format)
}