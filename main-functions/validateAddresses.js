import { utils } from "xlsx/xlsx.mjs";
import pThrottle from 'p-throttle';


const throttle = pThrottle({
	limit: 4,
	interval: 1000
});

export default async function validateAddresses(workbook, testing = true) {
    const sheetName = workbook.SheetNames[0]; // Assuming you want to read the first sheet
    const sheet = workbook.Sheets[sheetName];
    const arrayData = utils.sheet_to_json(sheet, { defval: "" })

    
    
    // ============== Enter Validation API here ===================
    let validated = []
    let unvalidated = []
    if (!testing) {
        const allRequests = arrayData.map(row => throttle(() => fetch(`https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(row.Address)}&limit=1&apiKey=${process.env.HERE_API_KEY}`))) 
        // const responses = await Promise.all(allRequests.map(func => {() => func()}))
        // // const responses2 = await Promise.all(responses)
        await Promise.all(arrayData.map(async (row, i) => {
            const hereRes = await allRequests[i]()
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
    return ({validated, unvalidated})
}

