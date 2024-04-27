import express, { response } from 'express';
import { readFileSync } from "fs";
import { read } from "xlsx/xlsx.mjs";
import * as xlsx from 'xlsx/xlsx.mjs'
import validateAddresses, { validRows } from './validateRows.js';
import mailchimpClient from './mailchimp.cjs';
import fs from 'fs'

const router = express.Router();

router.get('/', express.static('./frontend/', {
	setHeaders: (res, filePath) => {
		// Set the appropriate Content-Type header for JavaScript files
		if (filePath.endsWith('.js')) {
			res.setHeader('Content-Type', 'application/javascript');
		}
	}
}))

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

router.post('/upload', (req, res) => {
	const fileData = req.body.fileData;
	const fileName = req.body.fileName;

	// Write the file data to a temporary file
	fs.writeFile(fileName, Buffer.from(fileData), async (err) => {
		if (err) {
			console.error('Error writing file:', err);
			res.status(500).send('Error writing file');
			return;
		}

		// Read the uploaded Excel file
		const buf = readFileSync("dupli_2.xlsx");
		const workbook = read(buf);
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];
		const data = xlsx.utils.sheet_to_json(worksheet);

		// Process the data (you can customize this part according to your needs)
		console.log('Uploading data...');

		// Send email using Mandrill API
		const message = {
			text: 'File attached, for testing.',
			subject: 'Excel File',
			from_email: 'test@zenduit.com',
      		from_name: 'Sender Name',
			to: [{
				email: 'abrarshahriarhossain@gmail.com',
				name: 'Abrar',
				type: 'to'
			}],
			attachments: [{
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				name: fileName,
				content: fileData
			}]
		};

		// const respons = await mailchimpClient.users.ping()
		// const response = await mailchimpClient.users.ping();
  		// console.log(response);
		// res.status(200).send(respons)

		mailchimpClient.messages.send({ message: message }).then(
			(result) => {
				console.log('Email sent:', result);
				// Delete the temporary file
				fs.unlinkSync(fileName);
				res.status(200).send('File uploaded and email sent');
			}
			
		) 
		.catch((err) => {
			console.error('Error sending email:', err);
			res.status(500).send('Error sending email');
		});
	});
});

export default router;
