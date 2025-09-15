const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    // 從請求中解構出所有需要的資料，包含新的 recipient
    const { host, port, secure, user, pass, recipient } = req.body;

    if (!host || !port || !user || !pass) {
        return res.status(400).json({ message: '缺少必要的欄位：host, port, user, pass' });
    }

    // 建立 Nodemailer transporter 物件 (與之前相同)
    let transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: secure,
        auth: {
            user: user,
            pass: pass,
        },
        connectionTimeout: 15000, // 增加超時時間以利寄信
        greetingTimeout: 15000,
        socketTimeout: 15000,
    });

    try {
        // ** 新的判斷邏輯 **
        // 如果 recipient 存在且不為空，則執行寄信
        if (recipient) {
            // 設定信件內容
            const mailOptions = {
                from: `"${user}" <${user}>`, // 寄件人
                to: recipient, // 收件人
                subject: 'SMTP 功能測試成功 ✔', // 主旨
                text: `這是一封由您的 SMTP 測試工具發送的郵件。\n\n發送帳號：${user}\nSMTP 伺服器：${host}:${port}\n時間：${new Date().toString()}`, // 純文字內容
                html: `<p>這是一封由您的 SMTP 測試工具發送的郵件。</p><ul><li><b>發送帳號:</b> ${user}</li><li><b>SMTP 伺服器:</b> ${host}:${port}</li><li><b>時間:</b> ${new Date().toString()}</li></ul>` // HTML 內容
            };
            
            // 執行寄信
            await transporter.sendMail(mailOptions);
            res.status(200).json({ success: true, message: `測試郵件已成功寄送至 ${recipient}` });

        } else {
            // 如果沒有 recipient，則執行原本的連線驗證
            await transporter.verify();
            res.status(200).json({ success: true, message: 'SMTP 伺服器連線及帳號密碼驗證成功！' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || '發生未知錯誤' });
    }
}
