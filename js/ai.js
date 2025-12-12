function askAI() {
    const btn = document.getElementById('askBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');
    const loader = document.getElementById('loader');
    btnText.classList.add('hidden');
    btnIcon.classList.add('hidden');
    loader.classList.remove('hidden');
    btn.disabled = true;
    btn.style.cursor = 'not-allowed';
    setTimeout(() => {
        btnText.classList.remove('hidden');
        btnIcon.classList.remove('hidden');
        loader.classList.add('hidden');
        btn.disabled = false;
        btn.style.cursor = 'pointer';
    }, 3000);
}

















// পেজ লোড হওয়ার পর এই ইভেন্ট লিসেনারটি চালু হবে
document.addEventListener('DOMContentLoaded', function() {
    const queryInput = document.getElementById('userQuery');
    
    // Enter বাটন চাপলে askAI() কল হবে
    if (queryInput) {
        queryInput.addEventListener('keypress', function (e) {
            // যদি Enter চাপা হয় এবং Shift চাপা না থাকে (Shift+Enter দিয়ে নতুন লাইন হয়)
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // ডিফল্ট নতুন লাইন তৈরি করা বন্ধ করুন
                askAI(); // ফাংশনটি কল করুন
            }
        });
    }
});

// Helper function: ফাইলকে Base64 ফরম্যাটে কনভার্ট করার জন্য
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // "data:image/png;base64," প্রিফিক্সটি বাদ দিয়ে শুধু ডাটা রিটার্ন করবে
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function askAI() {
    // 1. API Key Setup:
    const apiKey = "AIzaSyC-6fUvbR4C1U30gfxE-_HX8ai40c4CERE"; 

    // Validation: API key bosano hoyeche kina check korbe
    if (apiKey === "YOUR_API_KEY_HERE" || apiKey === "") {
        alert('অনুগ্রহ করে ai.js ফাইলে আপনার Gemini API Key টি বসান।');
        return;
    }

    const queryInput = document.getElementById('userQuery');
    const imageInput = document.getElementById('imageInput'); // ইমেজের ইনপুট ধরা হলো
    const query = queryInput.value;
    
    // যদি টেক্সট এবং ছবি দুটোর কোনোটিই না থাকে
    if (!query.trim() && (!imageInput.files || imageInput.files.length === 0)) {
        alert('অনুগ্রহ করে আপনার প্রশ্নটি লিখুন অথবা গাছের ছবি দিন।');
        return;
    }

    // UI Elements
    const askBtn = document.getElementById('askBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');
    const loader = document.getElementById('loader');
    const responseArea = document.getElementById('responseArea');
    const aiResponse = document.getElementById('aiResponse');

    // Set Loading State
    askBtn.disabled = true;
    btnText.textContent = 'অপেক্ষা করুন...';
    btnIcon.classList.add('hidden');
    loader.classList.remove('hidden');
    responseArea.classList.add('hidden');
    
    // API Setup
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const systemPrompt = "তোমার নাম Aquabot। তুমি একটি স্মার্ট প্ল্যান্ট কেয়ার অ্যাসিস্ট্যান্ট। উত্তরের শুরুতে অবশ্যই 'আসসালামু আলাইকুম' বলে সম্বোধন করবে। তোমার কাজ হলো ব্যবহারকারীর গাছের যত্ন, রোগ নির্ণয়, এবং পানি দেওয়া সংক্রান্ত প্রশ্নের উত্তর দেওয়া। ব্যবহারকারী যদি গাছের ছবি দেয়, তবে সেটি বিশ্লেষণ করে রোগ বা সমস্যার সমাধান দাও। উত্তরগুলো খুব সংক্ষিপ্ত (সর্বোচ্চ ৩-৪ লাইনে) এবং বাংলায় দাও।";

    // Payload তৈরি করা (Text + Image)
    let userParts = [];
    
    // টেক্সট যোগ করা (যদি থাকে)
    if (query.trim()) {
        userParts.push({ text: query });
    }

    // ইমেজ যোগ করা (যদি থাকে)
    if (imageInput.files && imageInput.files.length > 0) {
        try {
            const imageFile = imageInput.files[0];
            const base64Image = await fileToBase64(imageFile);
            
            userParts.push({
                inlineData: {
                    mimeType: imageFile.type,
                    data: base64Image
                }
            });
        } catch (error) {
            console.error("Image processing error:", error);
            alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
            askBtn.disabled = false;
            btnText.textContent = 'জিজ্ঞাসা করুন';
            btnIcon.classList.remove('hidden');
            loader.classList.add('hidden');
            return;
        }
    }

    const payload = {
        contents: [{
            parts: userParts
        }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "দুঃখিত, আমি উত্তরটি খুঁজে পাইনি। আবার চেষ্টা করুন।";

        // Display Result
        aiResponse.innerText = text;
        responseArea.classList.remove('hidden');

    } catch (error) {
        console.error("AI Error:", error);
        aiResponse.innerText = "দুঃখিত, সার্ভারে সমস্যা হচ্ছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।";
        responseArea.classList.remove('hidden');
    } finally {
        // Reset State
        askBtn.disabled = false;
        btnText.textContent = 'জিজ্ঞাসা করুন';
        btnIcon.classList.remove('hidden');
        loader.classList.add('hidden');
        
        // ইনপুট ক্লিয়ার করার অপশন (ঐচ্ছিক)
        // queryInput.value = '';
        // imageInput.value = '';
    }
}