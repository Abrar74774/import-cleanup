import express from 'express';
import { readFileSync } from "fs";
import * as xlsx from 'xlsx/xlsx.mjs'
import { read } from "xlsx/xlsx.mjs";
import validateRows from './validateRows.js';


const router = express.Router();

router.get('/getFile', async (req, res) => {
	try {
		// Read the Excel file
		const buf = readFileSync("dupli_2.xlsx");
		const workbook = read(buf);
		const data = validateRows(workbook)

		// Respond with the data
		res.json(data);
	} catch (err) {
		console.error('Error reading Excel file:', err);
		res.status(500).send('Error reading Excel file');
	}
}
);

export default router;
