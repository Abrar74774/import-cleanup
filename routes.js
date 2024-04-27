import express from 'express';
import { readFileSync } from "fs";
import { read } from "xlsx/xlsx.mjs";
import validateAddresses, { validRows } from './validateRows.js';


const router = express.Router();

router.get('/getFile', async (req, res) => {
	try {
		// Read the Excel file
		const buf = readFileSync("dupli_2.xlsx");
		const workbook = read(buf);

		if (!validRows(workbook)) {
			res.status(400).json({"error": "invalid rows"})
			return
		}
		
		const data = validateAddresses(workbook)

		// Respond with the data
		res.json(data);
	} catch (err) {
		console.error('Error reading Excel file:', err);
		res.status(500).send('Error reading Excel file');
	}
}
);

export default router;
