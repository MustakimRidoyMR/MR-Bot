
// Google Sheets API কনফিগারেশন
const SHEET_ID = 'আপনার_Google_Sheet_ID';
const API_KEY = 'আপনার_API_Key';

// Google Sheets এ ডেটা সেভ করার ফাংশন
async function saveToGoogleSheets(formData) {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1:append?valueInputOption=RAW&key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                values: [[
                    formData.name,
                    formData.email,
                    formData.subject,
                    formData.message,
                    new Date().toISOString() // জমা দেওয়ার সময়
                ]]
            })
        });
        
        if (!response.ok) {
            throw new Error('ডেটা সেভ করতে সমস্যা হয়েছে');
        }
        
        return true;
    } catch (error) {
        console.error('এরর:', error);
        return false;
    }
}

// মূল কোড
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // ফর্ম ডেটা নেওয়া
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // বেসিক ভ্যালিডেশন
        if (!name || !email || !subject || !message) {
            alert('সব ফিল্ড পূরণ করুন');
            return;
        }
        
        // ইমেইল ভ্যালিডেশন
        if (!isValidEmail(email)) {
            alert('সঠিক ইমেইল দিন');
            return;
        }
        
        // সাবমিট বাটন ডিসেবল
        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'পাঠানো হচ্ছে...';
        
        try {
            // ডেটা পাঠানো
            const success = await saveToGoogleSheets({
                name,
                email,
                subject,
                message
            });
            
            if (success) {
                showSuccess();
                contactForm.reset();
                console.log('ডেটা সফলভাবে সেভ হয়েছে!');
            } else {
                throw new Error('ডেটা সেভ করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('এরর:', error);
            alert('দুঃখিত, একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        } finally {
            // সাবমিট বাটন রি-এনাবল
            submitButton.disabled = false;
            submitButton.textContent = 'পাঠান';
        }
    });
}
