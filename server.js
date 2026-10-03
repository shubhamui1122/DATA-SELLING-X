const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const VAULT_FILE = path.join(__dirname, 'database_vault.json');

// स्थायी तिजोरी (Database Vault) को इनिशियलाइज़ करना
function getVault() {
    if (!fs.existsSync(VAULT_FILE)) {
        const defaultVault = {
            users: {},
            workers: {
                "worker1": { active: true, name: "Balolia Operative" },
                "worker2": { active: true, name: "Telegram Moderator" }
            },
            owner: { master_code: "OWNERSHUBHAM11", master_pin: "8734812286", total_gb_profit: 0.00 },
            global_ad: { media_url: "", description: "Welcome to Core Protocol", target_link: "https://t.me" },
            tickets: []
        };
        fs.writeFileSync(VAULT_FILE, JSON.stringify(defaultVault, null, 2));
    }
    return JSON.parse(fs.readFileSync(VAULT_FILE, 'utf8'));
}

function saveVault(data) {
    fs.writeFileSync(VAULT_FILE, JSON.stringify(data, null, 2));
}

// ६-अंकों का यूनिक UID जनरेट करने वाला इंजन
function generateUID(vault) {
    let uid;
    do {
        uid = Math.floor(100000 + Math.random() * 900000).toString();
    } while (vault.users[uid]);
    return uid;
}
// १-मोबाइल नंबर वन-रजिस्ट्री लॉक और सुरक्षा गेट
app.post('/api/auth/register', (req, res) => {
    const { username, mobile, password } = req.body;
    const vault = getVault();
    
    for (let uId in vault.users) {
        if (vault.users[uId].mobile === mobile) {
            return res.status(400).json({ error: "One-Mobile Registry Lock Active. Device already registered." });
        }
    }
    
    const uid = generateUID(vault);
    vault.users[uid] = {
        uid: uid,
        username: username,
        mobile: mobile,
        password: password,
        balance: 0.00,
        shared_mb: 0.00,
        referrals: 0,
        withdrawals: []
    };
    saveVault(vault);
    res.json({ success: true, uid: uid, user: vault.users[uid] });
});

app.post('/api/auth/login', (req, res) => {
    const { uid, password } = req.body;
    const vault = getVault();
    if (vault.users[uid] && vault.users[uid].password === password) {
        return res.json({ success: true, user: vault.users[uid] });
    }
    res.status(400).json({ error: "Invalid UID or Password Terminal Error." });
});

// ६-घंटे का कड़ा टाइम-लॉक्ड फॉरगेट पासवर्ड गेट (दोपहर 1:00 - शाम 7:00)
app.post('/api/auth/forget-password', (req, res) => {
    const { uid, mobile, newPassword } = req.body;
    const currentHour = new Date().getHours(); 
    
    // दोपहर 13:00 (1 PM) से 19:00 (7 PM) का पहरा
    if (currentHour < 13 || currentHour >= 19) {
        return res.status(403).json({ error: "Forget Password Gate is Locked. Open only between 1:00 PM to 7:00 PM." });
    }
    
    const vault = getVault();
    if (vault.users[uid] && vault.users[uid].mobile === mobile) {
        vault.users[uid].password = newPassword;
        saveVault(vault);
        return res.json({ success: true, message: "Password updated successfully through Worker Bridge." });
    }
    res.status(400).json({ error: "UID and Mobile matching synchronization failed." });
});
// १-MB प्रोग्रेसिव लाइव अर्निंग लूप (₹13.75 प्रति GB)
app.post('/api/user/mine', (req, res) => {
    const { uid, mb_chunk } = req.body; // mb_chunk = 1.00 MB
    const vault = getVault();
    if (!vault.users[uid]) return res.status(400).json({ error: "User terminal missing." });
    
    vault.users[uid].shared_mb += parseFloat(mb_chunk);
    vault.users[uid].balance += 0.0134; // 1 MB = 1.34 पैसे
    vault.owner.total_gb_profit += 0.0107; // मालिक का प्रति MB का ₹1.07 का शुद्ध मुनाफा (₹10.75/GB)
    saveVault(vault);
    res.json({ success: true, balance: vault.users[uid].balance, shared_mb: vault.users[uid].shared_mb });
});

// २४-घंटे एक्टिव कस्टमर सपोर्ट (No Time Lock)
app.post('/api/support/ticket', (req, res) => {
    const { uid, mobile, issue } = req.body;
    const vault = getVault();
    const ticket = {
        id: "TKT-" + Math.floor(1000 + Math.random() * 9000),
        uid: uid,
        mobile: mobile,
        issue: issue,
        status: "OPEN",
        reply: ""
    };
    vault.tickets.push(ticket);
    saveVault(vault);
    res.json({ success: true, message: "Ticket transmitted to active worker queue." });
});

// 'Add Your Ad' विज्ञापन डेप्लॉयर मैनेजर
app.post('/api/admin/deploy-ad', (req, res) => {
    const { media_url, description, target_link } = req.body;
    const vault = getVault();
    vault.global_ad = { media_url, description, target_link };
    saveVault(vault);
    res.json({ success: true, message: "New network popup advertisement deployed successfully." });
});

app.get('/api/global/ad', (req, res) => {
    const vault = getVault();
    res.json(vault.global_ad);
});
// विथड्रॉल रूम (₹50 फ़र्स्ट टाइम, बाद में ₹100 लॉक + ₹6 GST लोड डिडक्शन)
app.post('/api/user/withdraw', (req, res) => {
    const { uid, amount, upi_id, method } = req.body;
    const vault = getVault();
    const user = vault.users[uid];
    if (!user) return res.status(400).json({ error: "User node missing." });
    
    const amt = parseFloat(amount);
    const isFirstTime = user.withdrawals.length === 0;
    const limit = isFirstTime ? 50 : 100;
    
    if (user.balance < amt) return res.status(400).json({ error: "Insufficient wallet balance." });
    if (amt < limit) return res.status(400).json({ error: `Minimum limit lock active. Requires ₹${limit}.` });
    
    const finalPayout = amt - 6.00; // ₹6 फिक्स नेटवर्क लोड/GST कटौती
    const wdxOrder = {
        id: "WDX-" + Math.floor(100000 + Math.random() * 900000),
        uid: uid,
        amount: amt,
        payout: finalPayout,
        upi_id: upi_id,
        method: method,
        status: "PENDING",
        date: new Date().toLocaleDateString()
    };
    
    user.balance -= amt;
    user.withdrawals.push(wdxOrder);
    saveVault(vault);
    res.json({ success: true, order: wdxOrder, current_balance: user.balance });
});

// सुप्रीम मास्टर ओनर कंट्रोल (Success/Reject जादुई बटन्स)
app.post('/api/owner/action', (req, res) => {
    const { master_code, master_pin, order_id, action } = req.body; // action = "SUCCESS" or "REJECT"
    const vault = getVault();
    
    if (master_code !== vault.owner.master_code || master_pin !== vault.owner.master_pin) {
        return res.status(403).json({ error: "Supreme Master Privilege Access Denied." });
    }
    
    let found = false;
    for (let uId in vault.users) {
        const user = vault.users[uId];
        const wdx = user.withdrawals.find(w => w.id === order_id);
        if (wdx && wdx.status === "PENDING") {
            wdx.status = action === "SUCCESS" ? "SUCCESSFUL" : "REJECTED";
            if (action === "REJECT") {
                user.balance += wdx.amount; // रिजेक्ट होने पर पैसा सीधे वॉलेट में रिफंड!
            }
            found = true;
            break;
        }
    }
    
    if (!found) return res.status(400).json({ error: "Order ID missing or already processed." });
    saveVault(vault);
    res.json({ success: true, message: `Order status synchronized to ${action}FUL.` });
});

app.listen(PORT, () => {
    console.log(`DATA-SELLING-X Server Core live on port ${PORT}`);
});
