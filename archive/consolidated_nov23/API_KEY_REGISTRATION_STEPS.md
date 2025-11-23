# 📝 API Key Registration Guide - Step by Step

**Date**: November 23, 2025  
**Goal**: Register remaining OpenUV & Visual Crossing API keys (Storm Glass complete) and add them to `.env`  
**Estimated Time**: 30-45 minutes  
**Current Status**: ⏳ IN PROGRESS — Storm Glass ✅, OpenUV ❌, Visual Crossing ❌

---

## Why We Need These Keys

Your OceanCare application uses **8 free APIs** to provide real-time environmental data:
- **6 APIs are already working** (GNews, Google Maps, Storm Glass, Open-Meteo, OpenAQ, Nominatim)
- **2 APIs are waiting for registration** (OpenUV, Visual Crossing)

Without the OpenUV & Visual Crossing keys, users will see helpful warning messages on:
- **Volunteer page**: UV Index and sun safety recommendations will be unavailable
- **Climate trends**: 90-day forecasts will show basic data only
- **Debris Report page**: Marine weather now works (Storm Glass ✅), but multi-day forecasts still show basic data until Visual Crossing is active

**With the remaining keys registered**, all features unlock immediately.

---

## API 1: Storm Glass (Marine Weather) ✅ Completed

### What It Does
- Provides real-time marine weather data (waves, swell, water temperature)
- Used on the Debris Report page to inform cleanup decisions
- Shows users when conditions are safe for ocean activities

> Storm Glass was registered and validated on Nov 23. Keep these steps for onboarding or re-registration; skip ahead if the key remains active.

### Step-by-Step Registration (Reference)

#### Step 1.1: Navigate to Storm Glass
1. Open new browser tab
2. Go to: **https://stormglass.io/**
3. You should see the homepage with "Sign Up" button in top right

#### Step 1.2: Create Account
1. Click **"Sign Up"** button (top right)
2. Fill in the form:
   - **Email**: Use your project email
   - **Password**: Create a secure password (save it!)
   - Check "I agree to Terms" checkbox
3. Click **"Create Account"**
4. **IMPORTANT**: Check your email inbox
   - You'll receive a verification email
   - Click the verification link within 24 hours
   - Complete verification

#### Step 1.3: Access API Key
1. After email verification, log in to Storm Glass
2. In the dashboard, look for:
   - **Settings** or **Account** section (usually top right)
   - Or **API Keys** directly in navigation
3. Find the **API Key** section
4. You should see your default API key (looks like: `abc123def456...`)
5. Click **Copy** to copy the key to clipboard

#### Step 1.4: Activate Key
1. **Critical**: Some APIs require activation
2. In the same API Keys section, look for an "Activate" button or toggle
3. If you see **"Key Status: Inactive"**, click to activate
4. Wait for status to change to **"Active"**
5. This usually takes 1-2 minutes

#### Step 1.5: Save Your Key
1. **Copy the full API key** (usually 32+ characters)
2. Paste it into a text editor or notepad temporarily
3. Keep it safe - don't share publicly

**Free Tier Limits**:
- 50 requests per day
- Perfect for development and testing

---

## API 2: OpenUV (UV Index & Sun Safety)

### What It Does
- Provides real-time UV Index data
- Calculates sun safety recommendations (SPF needed)
- Used on the Volunteer page to help volunteers prepare for outdoor work

### Step-by-Step Registration

#### Step 2.1: Navigate to OpenUV
1. Open new browser tab
2. Go to: **https://openuv.io/**
3. Look for **Sign Up** or **Get API Key** button

#### Step 2.2: Create Account
1. Click **Sign Up**
2. Enter:
   - **Email**: Your project email
   - **Password**: Secure password (save it!)
   - **Confirm Password**: Repeat password
3. Accept terms if required
4. Click **Sign Up** or **Create Account**
5. **Check your email** for verification link
   - Click link to verify email
   - Return to OpenUV

#### Step 2.3: Get API Key
1. Log in to OpenUV dashboard
2. Navigate to **Account** or **API Keys** section
3. You'll see your API key displayed (usually shown as: `0123456789abcdef...`)
4. Click **Copy** or highlight and manually copy

#### Step 2.4: Activate (if needed)
1. Check if there's an "Activate Key" button
2. If it says "Inactive", click to activate
3. Wait for confirmation

#### Step 2.5: Save Your Key
1. Copy the full API key
2. Paste into your notepad with other keys
3. Keep safe

**Free Tier Limits**:
- 50 requests per day
- Perfect for the volunteer workflow

---

## API 3: Visual Crossing (Climate Trends)

### What It Does
- Provides 90-day climate forecast and historical trends
- Shows temperature trends, precipitation, severe weather risks
- Used on the Climate Trends section of the homepage

### Step-by-Step Registration

#### Step 3.1: Navigate to Visual Crossing
1. Open new browser tab
2. Go to: **https://www.visualcrossing.com/**
3. Look for **Sign Up** link (usually top right or prominent button)

#### Step 3.2: Create Account
1. Click **Sign Up** or **Get Started**
2. You may be asked to choose your role:
   - Select something like "Developer" or "API User"
3. Fill in account details:
   - **Email**: Your project email
   - **Password**: Secure password (save it!)
   - **Confirm Password**: Repeat
4. Complete CAPTCHA if shown
5. Click **Create Account** or **Sign Up**
6. **Verify your email**:
   - Check inbox for verification email
   - Click verification link
   - Confirm email verification

#### Step 3.3: Get API Key
1. After verification, log into Visual Crossing
2. Go to your **Account** page
3. Look for **API Key** section
4. You should see your API key displayed (long string like: `abc123def456ghi789...`)
5. Click **Copy** next to the key

#### Step 3.4: Verify Free Tier
1. Check that it says "Free Plan" or "Developer Plan"
2. Confirm it shows: **1,000 requests per day**
3. No credit card required!

#### Step 3.5: Save Your Key
1. Copy the API key
2. Add to your notepad with the other two keys

**Free Tier Limits**:
- 1,000 requests per day (most generous!)
- No credit card required

---

## All Three Keys Accounted For 🎉

By completing the remaining registrations you should have the following safely stored (Storm Glass already verified on Nov 23):
```
Storm Glass API Key: abc123def456...   # ✅ already in .env
OpenUV API Key: 0123456789abcdef...    # newly collected
Visual Crossing API Key: abc123def456ghi789...   # newly collected
```

### Next Step: Update Your `.env` File

**Time needed**: 5 minutes

1. Open your project folder in VS Code (or your editor)
2. Find the `.env` file in the project root
3. **IMPORTANT**: Confirm the Storm Glass entry is already populated. If you see placeholders, update them as follows (either `STORMGLASS_API_KEY` or the alias `STORM_GLASS_API_KEY` works):
   ```
   STORMGLASS_API_KEY=abc123def456...
   OPENUV_API_KEY=0123456789abcdef...
   VISUAL_CROSSING_API_KEY=abc123def456ghi789...
   ```

4. **Verify**:
   - No `your_` prefix remains
   - No spaces around the `=` sign
   - Each key is complete (paste the entire key)
   - No quotation marks around keys

5. **Save the file** (Ctrl+S)

---

## Verify It All Works!

After updating `.env`:

```bash
# In your terminal, run:
node launch-setup-helper.js
```

**Expected output**:
```
✅ STORMGLASS_API_KEY configured
✅ OPENUV_API_KEY configured
✅ VISUAL_CROSSING_API_KEY configured
```

If all three show ✅, you're ready for the next phase!

---

## Troubleshooting

### "Verification email never arrived"
1. Check spam/junk folder
2. Wait up to 10 minutes (emails can be slow)
3. Request "Resend email" link on signup page if available
4. Use a different email address and retry

### "I got the API key but it shows as 'Inactive'"
1. Some APIs auto-activate, some require manual activation
2. Look for "Activate" button in API Keys section
3. Click to activate
4. Usually activates within 1-2 minutes
5. If stuck for >5 minutes, try logging out and back in

### "Can't find the API key in my dashboard"
1. Log out completely
2. Log back in
3. Look for **Settings** → **API** or **Developer** section
4. Storm Glass: Check menu on left side
5. OpenUV: Usually in **Account** area
6. Visual Crossing: Check **Account** → **API Key**

### "Keys are registered but tests still fail"
1. Verify `.env` file has no placeholder text remaining
2. Verify each key is complete (not cut off)
3. Verify no extra spaces or quotes
4. Save the file
5. Stop and restart your server (`npm start`)
6. Try again

---

## Security Notes ⚠️

- **Never commit `.env` to GitHub** - it's already in `.gitignore`
- **Don't share your API keys** in Slack, emails, or public places
- **Each API has rate limits** - the free tier is perfect for your needs
- **Costs stay $0** as long as you stay within free tier limits

---

## Next Steps After Registration

Once you've registered the remaining keys and updated `.env` (Storm Glass already ✅):

1. **Run setup verification**:
   ```bash
   node launch-setup-helper.js
   ```
   Should show 6/6 checks passing ✅ (Storm Glass already green)

2. **Validate APIs are live**:
   ```bash
   node validate-api-keys.js
   ```
   Should show 5 green ✅ checks (OpenUV & Visual Crossing will flip from ⚠️ to ✅)

3. **Run test suite**:
   ```bash
   npm test
   ```
   Should show 21/21 tests passing ✅ (last run Nov 23; rerun to confirm with live keys)

4. **Start server and test**:
   ```bash
   npm start
   ```
   Then visit http://localhost:3000 in your browser

---

**Congratulations!** 🎉 Once you've completed these steps, you've unlocked the critical path for Week 1.

**Estimated total time**: 30-45 minutes for remaining registrations + `.env` update

**Questions?** Check the troubleshooting section above or run the setup helper for diagnostics.
