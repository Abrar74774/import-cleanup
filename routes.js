import express, { response } from 'express';
import { readFileSync } from "fs";
import { read } from "xlsx/xlsx.mjs";
import validateAddresses, { sendFiles, splitToCSVFiles, validRows } from './mainFunctions.js';
import fs from 'fs'

const router = express.Router();

router.get('/', express.static('./frontend/'))

router.get('/getFile', async (req, res) => {
	try {
		// Read the Excel file
		const buf = readFileSync("dupli_2.xlsx");
		const workbook = read(buf);

		if (!validRows(workbook)) {
			res.status(400).json({ "error": "invalid rows" })
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

router.get('/sendRequest', async (req, res) => {
	const hereRes = await fetch(`https://geocode.search.hereapi.com/v1/geocode?q=240+Washington+St.%2C+Boston&limit=1&apiKey=${process.env.HERE_API_KEY}`, 
	{
		method: "GET",
	})
	const json = await hereRes.json()
	console.log(json)
	res.json(json)

})

router.post('/upload', (req, res) => {
	const { fileData, fileName, email } = req.body;
if (!fileData || !fileName /*|| ! email*/) {
		res.status(400).send("Missing required parameters")
		return
	}

	// Write the file data to a temporary file
	const temp = `temp_${fileName}`;
	fs.writeFile(temp, Buffer.from(fileData), async (err) => {
		if (err) {
			fs.unlinkSync(temp);
			console.error('Error writing file:', err);
			res.status(500).send('Error writing file');
			return;
		}

		const buf = readFileSync(temp);
		const workbook = read(buf);

		if (!validRows(workbook)) {
			res.status(400).send("Error: invalid rows")
			fs.unlinkSync(temp);
			return
		}
		
		// Read the uploaded Excel file

		const validatedData = await validateAddresses(workbook);
		console.log(validatedData)
		res.json(validatedData)
		// const fileList = splitToCSVFiles(validatedData, 500);
		// try {
		// 	const emailResponse = await sendFiles("abrarshahriarhossain@gmail.com", fileName, fileList)
		// 	console.log('Email sent:', "emailResponse");
		// 	res.status(200).send('File uploaded and email sent');
		// } catch (e) {
		// 	console.error(e)
		// } finally {
		// 	fs.unlinkSync(temp);
		// }
	});
});

export default router;
