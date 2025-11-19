import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { GetObjectCommand, type GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import { getSupabaseS3Client } from '$lib/s3Client';
import { PUBLIC_SUPABASE_STORAGE_BUCKET_NAME } from '$env/static/public';

function toReadableStream(body: GetObjectCommandOutput['Body']) {
	if (!body) {
		return null;
	}

	if (body instanceof Readable) {
		return Readable.toWeb(body);
	}

	return body as ReadableStream<Uint8Array>;
}

export const GET: RequestHandler = async ({ url }) => {
	const keyParam = url.searchParams.get('key');
	const bucketParam = url.searchParams.get('bucket');

	if (!keyParam) {
		throw error(400, 'Missing key query parameter');
	}

	const bucket = bucketParam || PUBLIC_SUPABASE_STORAGE_BUCKET_NAME;

	if (!bucket) {
		throw error(500, 'Storage bucket is not configured');
	}

	const objectKey = decodeURIComponent(keyParam).replace(/^\/+/, '');

	if (!objectKey) {
		throw error(400, 'Invalid object key');
	}

	try {
		const client = getSupabaseS3Client();
		const command = new GetObjectCommand({
			Bucket: bucket,
			Key: objectKey
		});

		const response = await client.send(command);
		const bodyStream = toReadableStream(response.Body);

		if (!bodyStream) {
			throw error(404, 'Object not found');
		}

		const headers = new Headers();
		headers.set('Content-Type', response.ContentType ?? 'application/octet-stream');
		headers.set('Cache-Control', response.CacheControl ?? 'public, max-age=3600, immutable');

		if (response.ContentLength) {
			headers.set('Content-Length', String(response.ContentLength));
		}

		if (response.LastModified instanceof Date) {
			headers.set('Last-Modified', response.LastModified.toUTCString());
		}

		return new Response(bodyStream, {
			status: 200,
			headers
		});
	} catch (err) {
		console.error('Error fetching object from Supabase Storage S3', err);
		throw error(404, 'Image not found');
	}
};
