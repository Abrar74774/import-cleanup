import format from "../config/format.js";

export default function fixCols(data) {
    const formatObject = format.reduce((o, key) => ({ ...o, [key]: '' }), {})
    const fixed = data.map(row => (
        {
            ...formatObject,
            ...row
        }
    )
    )
    return fixed
}