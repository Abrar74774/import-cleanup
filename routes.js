import express, { response } from 'express';
import { readFileSync } from "fs";
import { read } from "xlsx/xlsx.mjs";
import fs from 'fs'
import validateAddresses from './main-functions/validateAddresses.js';
import areColsValid from './main-functions/areColsValid.js';
import splitToCSVFiles from './main-functions/splitToCSVFiles.js';
import sendFiles from './main-functions/sendFiles.js';
import fixCols from './main-functions/fixCols.js';
import { utils } from 'xlsx';


const router = express.Router();


router.get('/batch', async (req, res) => {
	// For testing batch geocoding api (api not included in Here Base Plan)
	const hereRes = await fetch(`https://batch.geocoder.ls.hereapi.com/6.2/jobs?apiKey=${process.env.HERE_API_KEY}&indelim=%7C&outdelim=%7C&action=run&outcols=displayLatitude,displayLongitude,locationLabel,houseNumber,street,district,city,postalCode,county,state,country&outputcombined=false`,
		{
			method: "POST",
			body: `recId|searchText|country
	0001|Invalidenstraße 116 10115 Berlin|DEU
	0002|Am Kronberger Hang 8 65824 Schwalbach|DEU
	0003|425 W Randolph St Chicago IL 60606|USA
	0004|One Main Street Cambridge MA 02142|USA
	0005|200 S Mathilda Ave Sunnyvale CA 94086|USA`
		})
	const json = await hereRes.json()
	res.json(json)
})

router.post('/upload', (req, res) => {
	const { fileData, fileName, email } = req.body;
	if (!fileData || !fileName || !email) {
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
		const sheetName = workbook.SheetNames[0]; // Assuming you want to read the first sheet
		const sheet = workbook.Sheets[sheetName];
		let data = utils.sheet_to_json(sheet, { defval: "" });

		if (!areColsValid(data)) {
			data = fixCols(data)
		}

		if (!data.every(row => row.Address && row.Address.length)) {
			res.status(400).send('\'Address\' not found')
			return
		}

		// Read the uploaded Excel file
		res.status(200).send('File uploaded. Sending email');

		try {
			const results = await validateAddresses(data, false); // set second param as false to send reqs to Here Api
			const validatedfileList = splitToCSVFiles(results.validated, 250);
			const unvalidatedfileList = splitToCSVFiles(results.unvalidated, 250);
			const emailResponse = await sendFiles(process.env.DEFAULT_RECEIVER_EMAIL, fileName, validatedfileList, unvalidatedfileList)
			console.log('Email sent:', emailResponse);
		} catch (e) {
			console.error(e)
		} finally {
			fs.unlinkSync(temp);
		}
	});
});

export default router;
