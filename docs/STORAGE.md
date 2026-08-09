# Media storage (Railway / production)

Community post photos must use **permanent storage**. Railway containers use ephemeral disk by default — uploads disappear after redeploy unless you configure one of the options below.

## Option A — Cloudflare R2 (recommended)

1. Create an R2 bucket with **public access** enabled.
2. Create an R2 API token.
3. In **Railway → backend service → Variables**, set:

```
MEDIA_DISK=s3
AWS_ACCESS_KEY_ID=<r2-access-key>
AWS_SECRET_ACCESS_KEY=<r2-secret>
AWS_DEFAULT_REGION=auto
AWS_BUCKET=<bucket-name>
AWS_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
AWS_URL=https://pub-<hash>.r2.dev
AWS_USE_PATH_STYLE_ENDPOINT=false
APP_URL=https://agriconnect-production-f13f.up.railway.app
```

4. Redeploy the backend.

New uploads store the permanent public URL in `community_post_images.url`. Photos survive refresh, logout, and redeploys.

## Option B — Railway volume (public disk)

1. In Railway, add a volume mounted at `/app/storage/app/public`.
2. Keep `MEDIA_DISK=public` (default).
3. Set `APP_URL` to your Railway backend URL.
4. Redeploy.

Files persist on the volume. **Re-upload** any posts created before the volume was attached — those files are already lost.

## Local development

```
MEDIA_DISK=public
APP_URL=http://localhost:8000
```

Run `php artisan storage:link` once.
