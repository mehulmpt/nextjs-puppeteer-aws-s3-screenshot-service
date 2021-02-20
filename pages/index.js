import Head from 'next/head'
import { useState } from 'react'
import styles from '../styles/Home.module.css'
import Image from 'next/image'

export default function Home() {
	const [websiteURL, setWebsiteURL] = useState('')

	const [imageURL, setImageURL] = useState('/')

	async function submitWebsiteURL() {
		const res = await fetch('/api/get-screenshot-image', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				url: websiteURL
			})
		}).then((res) => res.json())

		setImageURL(res.data)
		console.log(res)
	}

	return (
		<div className={styles.container}>
			<Head>
				<title>Create Next App</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Image key={imageURL} src={imageURL} width={1280} height={720} />

			<div className={styles.inputArea}>
				<input
					type="text"
					value={websiteURL}
					onChange={(e) => setWebsiteURL(e.target.value)}
					placeholder="Enter a website URL"
				/>
				<button onClick={submitWebsiteURL}>Submit URL</button>
			</div>
		</div>
	)
}
