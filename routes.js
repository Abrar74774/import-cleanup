import express, { response } from 'express';
import { readFileSync } from "fs";
import { read } from "xlsx/xlsx.mjs";
import fs from 'fs'
import validateAddresses from './main-functions/validateAddresses.js';
import areColsValid from './main-functions/areColsValid.js';
import splitToCSVFiles from './main-functions/splitToCSVFiles.js';
import sendFiles from './main-functions/sendFiles.js';

const router = express.Router();

router.get('/', express.static('./frontend/'))

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

		if (!areColsValid(workbook)) {
			res.status(400).send("Error: invalid rows")
			fs.unlinkSync(temp);
			return
		}
		
		// Read the uploaded Excel file

		try {
			const results = await validateAddresses(workbook, false); // set second param as false to send reqs to Here Api
			const validatedfileList = splitToCSVFiles(results.validated, 500);
			const unvalidatedfileList = splitToCSVFiles(results.unvalidated, 500);
			const emailResponse = await sendFiles(process.env.DEFAULT_RECEIVER_EMAIL, fileName, validatedfileList, unvalidatedfileList)
			console.log('Email sent:', emailResponse);
			res.status(200).send('File uploaded and email sent');
		} catch (e) {
			console.error(e)
		} finally {
			fs.unlinkSync(temp);
		}
	});
});

export default router;
