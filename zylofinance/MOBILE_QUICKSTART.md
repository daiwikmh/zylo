# 🚀 Mobile App - 3 Minute Setup

Get your Zylo Finance mobile app running in 3 minutes!

## Prerequisites Check

- ✅ Node.js 22 installed (`nvm use 22`)
- ✅ Xcode (for iOS) or Android Studio (for Android) installed
- ✅ Mobile device or emulator/simulator ready

## Step-by-Step Guide

### 1️⃣ Get Your Computer's IP Address

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig | findstr IPv4
```

**Example result:** `192.168.1.100` ← Copy this!

### 2️⃣ Update Capacitor Config

Open `capacitor.config.ts` and uncomment/update these lines:

```typescript
server: {
  url: 'http://192.168.1.100:3000',  // ← Paste your IP here!
  cleartext: true
},
```

### 3️⃣ Start Development Server

```bash
npm run dev
```

✅ Keep this terminal running!

### 4️⃣ Sync Capacitor (New Terminal)

```bash
npm run cap:sync
```

### 5️⃣ Open in IDE

**For iOS:**
```bash
npm run cap:ios
```
Then click ▶️ Play in Xcode

**For Android:**
```bash
npm run cap:android
```
Then click ▶️ Run in Android Studio

### 6️⃣ Test!

The app should open on your device/simulator and show the Neo-brutalist UI!

## Troubleshooting

### "Cannot connect to dev server"
- ✅ Ensure `npm run dev` is running
- ✅ Device and computer on **same WiFi**
- ✅ IP address correct in `capacitor.config.ts`
- ✅ No firewall blocking port 3000

### "White screen" or "Web content not found"
```bash
npm run cap:sync
```
Then rebuild in Xcode/Android Studio

### iOS: "Developer Mode Required"
- Settings > Privacy & Security > Developer Mode > On
- Restart device

### Android: "Installation failed"
- Enable USB debugging
- Settings > Developer Options > USB Debugging

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run cap:sync` | Sync changes to native apps |
| `npm run cap:ios` | Open iOS project in Xcode |
| `npm run cap:android` | Open Android project in Android Studio |
| `npm run mobile:setup` | Quick sync command |

## What You're Running

Your mobile app features **Neo-brutalist design** with:

✅ **Bold Yellow & Green** color scheme
✅ **Heavy rounded corners** (24-32px)
✅ **Thick black borders** (3-4px)
✅ **High contrast** UI
✅ **Brutal-style shadows**
✅ **Dashboard** with balance card
✅ **Action cards** (Withdraw/Deposit)
✅ **Gauge widget** with progress
✅ **Transaction list**
✅ **Bottom tab navigation**

## Next Steps

1. **Connect your wallet** - Web3Auth works on mobile!
2. **Test transactions** - Use Coston2 testnet
3. **Customize colors** - Edit `app/src/styles/mobile-theme.ts`
4. **Add features** - Build in `app/src/components/mobile/`

## Need More Help?

📖 **Detailed Guide:** See `HOW_TO_RUN_MOBILE.md`
📋 **Setup Summary:** See `MOBILE_SETUP_SUMMARY.md`
🔧 **Capacitor Docs:** https://capacitorjs.com/docs

---

**Happy Building!** 📱✨
