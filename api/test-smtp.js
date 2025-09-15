const nodemailer = require('nodemailer');

// Vercel Serverless Function 的標準寫法
export default async function handler(req, res) {
    // 只接受 POST 請求
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { host, port, secure, user, pass } = req.body;

    // 基本的輸入驗證
    if (!host || !port || !user || !pass) {
        return res.status(400).json({ message: '缺少必要的欄位：host, port, user, pass' });
    }

    // 建立 Nodemailer transporter 物件
    let transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: secure, // true for 465, false for other ports
        auth: {
            user: user,
            pass: pass,
        },
        // 增加超時設定，避免等待過久
        connectionTimeout: 10000, // 10 秒
        greetingTimeout: 10000, // 10 秒
        socketTimeout: 10000, // 10 秒
    });

    try {
        // 使用 .verify() 方法來測試連線和認證
        await transporter.verify();
        res.status(200).json({ success: true, message: 'SMTP 伺服器連線及帳號密碼驗證成功！' });
    } catch (error) {
        // 如果驗證失敗，回傳詳細的錯誤訊息
        console.error(error);
        res.status(500).json({ success: false, message: error.message || '發生未知錯誤' });
    }
}
