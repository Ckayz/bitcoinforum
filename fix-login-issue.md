# Fix Login Issue - Email Confirmation

## The Problem
After registration, Supabase requires email confirmation by default. Until you confirm your email, you can't login even with the correct password.

## Quick Fix - Disable Email Confirmation (Development)

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Settings**
3. Scroll down to **Email Confirmation**
4. **Turn OFF** "Enable email confirmations"
5. Save the settings

## Alternative - Check Your Email
If you want to keep email confirmation:
1. Check your email inbox (including spam folder)
2. Click the confirmation link
3. Then try logging in again

## For Existing Unconfirmed Users
If you already registered but can't login:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find your user account
3. Click on the user
4. Set **Email Confirmed** to `true`
5. Save

## Test Login
After making these changes, try logging in again with your email and password.

The "wrong password" error is misleading - it's actually an "unconfirmed email" error.
