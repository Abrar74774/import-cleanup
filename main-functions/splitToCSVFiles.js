import { utils } from "xlsx/xlsx.mjs";

export default function splitToCSVFiles(jsonData, rowsPerFile = 10) {
    const group = splitArray(jsonData, rowsPerFile);
    const fileList = []
    group.forEach((data, i) => {
        data = data.sort((a, b) =>  ('' + a.Address).localeCompare(b.Address))
        const ws = utils.json_to_sheet(data);
        const csv = utils.sheet_to_csv(ws)
        fileList.push(csv)
    })
    return fileList
}

function splitArray(array, elementsPerArray) {
    return Array.from({ length: Math.ceil(array.length / elementsPerArray) }, (_, index) =>
        array.slice(index * elementsPerArray, (index + 1) * elementsPerArray)
    );
}