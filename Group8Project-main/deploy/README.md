# Hosting VALORA on AWS

The website sits on S3 behind CloudFront, and the API runs on Lambda. The database stays on Neon, which is billed separately. CloudFront gives the site an HTTPS address with no domain to buy.

Costs depend on use. At low traffic this should stay within AWS's free allowances, or close to them. The deploy script sets a bill warning at $3 a month, but **a warning doesn't stop or cap spending**.

## Before you start

1. An AWS account. It needs a payment card.
2. The [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html), signed in with `aws configure`. Check it with `aws sts get-caller-identity`.
3. Python 3.12 and Node.js, as used for local development.
4. All database migrations applied:
   ```bash
   cd backend
   python -m alembic upgrade head
   ```

## First deployment

1. Copy `deploy/production.env.example` to `deploy/production.env` and fill it in. This file holds your passwords, and git ignores it.
2. Make a new `SECRET_KEY`. Don't reuse the one from your laptop:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(48))"
   ```
3. Check everything builds. This sends nothing to AWS:
   ```bash
   python deploy/deploy.py --check
   ```
4. Deploy. The first run takes several minutes, and the site can take about 10 more to appear everywhere:
   ```bash
   python deploy/deploy.py
   ```
   It ends by printing the site's address.
5. Run `npm run build` in `FrontEnd` before using the app locally again. The deployment build points at the live site's address, not your local API.

## Deploying before the terms are finished

The deploy stops while `FrontEnd/app/pages/Auth/TermsContent.jsx` still has `[Insert ...]` blanks, because visitors would see them. To publish anyway, for example for a private test:

```bash
python deploy/deploy.py --allow-blank-terms
```

Fill in the blanks and deploy again before inviting real users.

## Updating the site

Run `python deploy/deploy.py` again. If the update includes a database change, run the migration first. The live site and your laptop share the same Neon database unless you set up a separate one.

## Sending forgot password emails

The site sends these through an email account. With Gmail:

1. Turn on 2-Step Verification on the Google account.
2. Create an [app password](https://myaccount.google.com/apppasswords) and copy it.
3. Fill in `deploy/production.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=the Gmail address
   SMTP_PASSWORD=the app password
   SMTP_FROM=the Gmail address
   ```
4. Send yourself a test. This doesn't touch AWS:
   ```bash
   python deploy/deploy.py --test-email you@example.com
   ```
5. Deploy again.

Emails come from that Gmail address, and anyone with access to your AWS account can read the app password. Using a separate Gmail account for the site keeps your personal one out of it.

## Checks after deploying

- Open the site and log in.
- Open a deep link, such as `/property/4`, and refresh the page.
- Upload a photo, then view it.
- Open `/api/v1/auth/me` while logged out. It should return an error message, not the home page.

## Good to know

- **Forgot password:** this needs the `SMTP_*` settings (see above). Without them no email is sent, and the link is only written to the API's logs.
- **Quiet periods:** the first request after a quiet spell can take several seconds while Lambda and Neon wake up.
- **Photos:** uploads are limited to 4 MB, because Lambda limits requests to about 6 MB.
- **Enquiry limit:** the limit of 5 enquiries per visitor is kept in memory, so on Lambda it's approximate. It only slows casual flooding.
- **Passwords in AWS:** the database address and `SECRET_KEY` are stored as Lambda settings, so anyone with access to your AWS account can read them. Keep that account to yourself and turn on multi-factor sign-in.

## Taking it down

```bash
aws cloudformation delete-stack --stack-name valora --region us-east-2
```

Empty the website bucket first, or the delete will fail. The separate `valora-artifacts-...` bucket isn't part of the stack, so delete it yourself. Neon isn't affected.
