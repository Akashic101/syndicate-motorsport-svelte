import { S3Client } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

let cachedClient: S3Client | null = null;

function getProjectRef(): string | null {
	try {
		const hostname = new URL(PUBLIC_SUPABASE_URL).hostname;
		return hostname.split('.')[0] ?? null;
	} catch {
		return env.SUPABASE_PROJECT_REF ?? null;
	}
}

export function getSupabaseS3Client(): S3Client {
	if (cachedClient) return cachedClient;

	const accessKeyId = env.ACCESS_KEY_ID;
	const secretAccessKey = env.SECRET_ACCESS_KEY;
	const region = env.SUPABASE_S3_REGION ?? 'eu-north-1';
	const projectRef = getProjectRef();

	if (!accessKeyId || !secretAccessKey || !projectRef) {
		throw new Error(
			'Missing ACCESS_KEY_ID, SECRET_ACCESS_KEY, or Supabase project reference for S3 authentication.'
		);
	}

	cachedClient = new S3Client({
		forcePathStyle: true,
		region,
		endpoint: `https://${projectRef}.storage.supabase.co/storage/v1/s3`,
		credentials: {
			accessKeyId,
			secretAccessKey
		}
	});

	return cachedClient;
}
