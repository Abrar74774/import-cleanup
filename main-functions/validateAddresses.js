import pThrottle from 'p-throttle';
import requestThrottleConfig from "../config/requestThrottleConfig.js";


const throttle = pThrottle(requestThrottleConfig);

const delay = ms => new Promise(res => setTimeout(res, ms));

export default async function validateAddresses(arrayData, testing = true) {
    try {
        
        let validated = []
        let unvalidated = []
        if (!testing) {
            const allRequests = arrayData.map(row => throttle(() => fetch(`https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(row.Address)}&limit=1&apiKey=${process.env.HERE_API_KEY}`))) 
            // const responses = await Promise.all(allRequests.map(func => {() => func()}))
            // // const responses2 = await Promise.all(responses)
            await Promise.all(arrayData.map(async (row, i) => {
                let json;
                do {
                    if (json && json.items.error) {
                        console.log("entering delay")
                        await delay(1000)
                    }
                    const hereRes = await allRequests[i]()
                    if (!hereRes.ok) {
                        const json = await hereRes.json()
                        console.log(json)
                        throw Error(json)
                    }
                    json = await hereRes.json()
                    console.log(json.items)
                } while (json.items.error)
                if (!(json.items && json.items[0])) unvalidated.push(row)
                else validated.push({...row, Address: json.items[0].title})
            }))
        } else {
            unvalidated.push(arrayData.pop())
            unvalidated.push(arrayData.pop())
            unvalidated.push(arrayData.pop())
            validated = arrayData
        }
        console.log(validated)
        return ({validated, unvalidated})
    } catch (e) {
        throw Error(e)
    }
}

