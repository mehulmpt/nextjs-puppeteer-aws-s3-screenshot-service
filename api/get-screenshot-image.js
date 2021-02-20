import chromium from 'chrome-aws-lambda'
import AWS from 'aws-sdk'

const S3 = new AWS.S3({
	credentials: {
		accessKeyId: 'ACCESS_KEY',
		secretAccessKey: 'ACCESS_ID'
	}
})

async function getBrowserInstance() {
	const executablePath = await chromium.executablePath

	if (!executablePath) {
		// running locally
		const puppeteer = require('puppeteer')
		return puppeteer.launch({
			args: chromium.args,
			headless: true,
			defaultViewport: {
				width: 1280,
				height: 720
			},
			ignoreHTTPSErrors: true
		})
	}

	return chromium.puppeteer.launch({
		args: chromium.args,
		defaultViewport: {
			width: 1280,
			height: 720
		},
		executablePath,
		headless: chromium.headless,
		ignoreHTTPSErrors: true
	})
}

export default async (req, res) => {
	const url = req.body.url

	// Perform URL validation
	if (!url || !url.trim()) {
		res.json({
			status: 'error',
			error: 'Enter a valid URL'
		})

		return
	}

	let browser = null

	try {
		browser = await getBrowserInstance()
		let page = await browser.newPage()
		await page.goto(url)
		const imageBuffer = await page.screenshot()

		const fileName = 'uploaded_on_' + Date.now() + '.jpg'

		const params = {
			Bucket: 'aws-tutorial-codedamn',
			Key: fileName,
			Body: imageBuffer
		}

		S3.upload(params, (error, data) => {
			console.log(error, data)
			if (error) {
				return res.json({
					status: 'error',
					error: error.message || 'Something went wrong'
				})
			}

			const params = {
				Bucket: 'aws-tutorial-codedamn',
				Key: fileName,
				Expires: 60
			}

			const signedURL = S3.getSignedUrl('getObject', params)

			res.json({
				status: 'ok',
				data: signedURL
			})
		})

		// upload this buffer on AWS S3
	} catch (error) {
		console.log(error)
		res.json({
			status: 'error',
			data: error.message || 'Something went wrong'
		})
		// return callback(error);
	} finally {
		if (browser !== null) {
			await browser.close()
		}
	}
}
