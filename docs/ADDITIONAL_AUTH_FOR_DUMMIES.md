# Additional Authentication For Dummies: The Setup Guide

This guide will walk you through the external administrative steps required to get Magic Link, Microsoft, and Facebook login working for Mise-en-place. You need to complete these steps in their respective developer portals _before_ the application code will successfully run these logins.

---

## 1. Magic Link (Email) Setup

To send Magic Links, the app needs to send emails. You need an SMTP (Simple Mail Transfer Protocol) service.

**Recommended Free Providers:**

- **Resend** (Modern, very easy to use)
- **SendGrid** (Industry standard)

**Steps (Using Resend as an example):**

1. Go to [Resend.com](https://resend.com) and create an account.
2. Go to **API Keys** and generate a new key.
3. In the Resend dashboard, go to **Domains**. Follow the instructions to add your custom domain (e.g., `mise-en-place.com`). You will need to add a few DNS records (TXT/MX) to your domain registrar (like GoDaddy or Cloudflare).
4. Wait for the domain to verify.
5. Get your SMTP credentials from Resend (Host, Port, Username usually `resend`, and your API Key as the password).
6. Save these values for the application's `.env` file:
   - `EMAIL_SERVER_USER`
   - `EMAIL_SERVER_PASSWORD`
   - `EMAIL_SERVER_HOST`
   - `EMAIL_SERVER_PORT`
   - `EMAIL_FROM` (e.g., `login@mise-en-place.com`)

---

## 2. Microsoft Login Setup

Microsoft uses its "Entra ID" (formerly Azure Active Directory) for OAuth.

**Steps:**

1. Go to the [Microsoft Azure Portal](https://portal.azure.com/) and log in.
2. Search for and select **Microsoft Entra ID**.
3. In the left sidebar, click **App registrations**, then **New registration**.
4. Name your app (e.g., "Mise-en-place").
5. Under **Supported account types**, select the option that includes "Accounts in any organizational directory and personal Microsoft accounts (e.g. Skype, Xbox)".
6. Under **Redirect URI**, select **Web**, and enter your app's callback URL.
   - Local testing: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
   - Production: `https://yourdomain.com/api/auth/callback/microsoft-entra-id`
7. Click **Register**.
8. **Get your Client ID:** On the Overview page, copy the **Application (client) ID**.
9. **Get your Client Secret:** Go to **Certificates & secrets** in the left sidebar. Click **New client secret**. Give it a description, click Add, and **copy the secret Value immediately** (it will be hidden later).
10. Save these to your `.env` file:
    - `MICROSOFT_CLIENT_ID`
    - `MICROSOFT_CLIENT_SECRET`

---

## 3. Facebook Login Setup

Facebook requires setting up a Meta Developer App.

**Steps:**

1. Go to the [Meta for Developers](https://developers.facebook.com/) portal and log in.
2. Click **My Apps** -> **Create App**.
3. Select **Authenticate and request data from users with Facebook Login** (or similar "Consumer" app option) and click Next.
4. Name your app (e.g., "Mise-en-place").
5. Once in the dashboard, find the **Facebook Login** product and click **Set Up**.
6. In the left sidebar under Facebook Login, click **Settings**.
7. In the **Valid OAuth Redirect URIs** field, enter your callbacks:
   - Local testing: `http://localhost:3000/api/auth/callback/facebook`
   - Production: `https://yourdomain.com/api/auth/callback/facebook`
8. Click **Save Changes**.
9. **Get your credentials:** Go to **App Settings** -> **Basic** in the left sidebar.
10. Copy the **App ID** and **App Secret** (you will need to enter your password to reveal it).
11. Save these to your `.env` file:
    - `FACEBOOK_CLIENT_ID`
    - `FACEBOOK_CLIENT_SECRET`

_(Note: To allow people other than yourself to log in, you will eventually need to switch the app from "Development" to "Live" mode at the top of the screen, which requires providing a URL to your Privacy Policy and potentially verifying your business)._

---

## The Final Checklist

Once you have completed all three setups, your local `.env` file should have the following new entries:

```env
# Email / Magic Link
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=your_resend_api_key
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=465
EMAIL_FROM=login@yourdomain.com

# Microsoft
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-secret

# Facebook
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```
