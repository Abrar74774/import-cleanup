import { utils } from "xlsx/xlsx.mjs";

export default async function validateAddresses(workbook, testing = true) {
    const sheetName = workbook.SheetNames[0]; // Assuming you want to read the first sheet
    const sheet = workbook.Sheets[sheetName];
    const arrayData = utils.sheet_to_json(sheet, { defval: "" })


    // ============== Enter Validation API here ===================
    let validated = []
    let unvalidated = []
    if (!testing) {
        await Promise.all(arrayData.map(async (row) => {
            const hereRes = await fetch(`https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(row.Address)}&limit=1&apiKey=${process.env.HERE_API_KEY}`)
            if (!hereRes.ok) {
                const json = await hereRes.json()
                console.log(json)
                throw Error(json)
            }
            const json = await hereRes.json()
            console.log(json.items)
            if (!(json.items && json.items[0])) unvalidated.push(row)
            else validated.push({...row, Address: json.items[0].title})
        }))
    } else {
        unvalidated.push(arrayData.pop())
        unvalidated.push(arrayData.pop())
        unvalidated.push(arrayData.pop())
        validated = arrayData
    }
    // =============================================================
    console.log(validated)
    return {validated, unvalidated}
}