// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navList = document.querySelector('.nav-list');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navList.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

// Check local storage
if (localStorage.getItem('theme') === 'light') {
    body.classList.add('light-mode');
    updateThemeIcon(true);
}

function updateThemeIcon(isLight) {
    if (themeToggle) {
        themeToggle.innerHTML = isLight
            ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>` // Moon icon
            : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>`; // Sun icon
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        const isLight = body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        updateThemeIcon(isLight);
    });
}

// Smooth scrolling for anchor links (optional, as CSS scroll-behavior handles most)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Reveal animations on scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden');
    observer.observe(section);
});

// HTML5 Audio Player
const musicBtn = document.getElementById('music-toggle');
const bgMusic = document.getElementById('bg-music');
let isPlaying = false;

if (musicBtn && bgMusic) {
    // Set initial volume
    bgMusic.volume = 0.5;

    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            isPlaying = false;
            musicBtn.classList.remove('playing');
            musicBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                </svg>
            `;
        } else {
            bgMusic.play().then(() => {
                isPlaying = true;
                musicBtn.classList.add('playing');
                musicBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                `;
            }).catch(error => {
                console.error("Audio play failed:", error);
                alert("Could not play music. Please interact with the page first or check your connection.");
            });
        }
    });
}

// Weather Widget
const weatherTemp = document.getElementById('weather-temp');
const weatherIcon = document.getElementById('weather-icon');
const weatherWind = document.getElementById('weather-wind');
const weatherPrecip = document.getElementById('weather-precip');

async function fetchWeather() {
    if (!weatherTemp) return;

    try {
        // Coordinates for Caldwell, NJ
        const lat = 40.8398;
        const lon = -74.2765;
        // Fetch current weather + windspeed, and hourly precipitation
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=precipitation&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.current_weather) {
            // Temperature
            const temp = Math.round(data.current_weather.temperature);
            weatherTemp.textContent = `${temp}°F`;

            // Wind Speed
            const wind = Math.round(data.current_weather.windspeed);
            if (weatherWind) weatherWind.textContent = `💨 ${wind} mph`;

            // Precipitation (Get current hour's forecast)
            const currentHour = new Date().getHours();
            const precip = data.hourly.precipitation[currentHour] || 0;
            // Show as percentage chance if available (Open-Meteo gives amount, so we show amount or estimate)
            // Actually Open-Meteo 'precipitation' is amount in mm/inch. 'precipitation_probability' is chance.
            // Let's re-fetch with probability if we want %, or just show amount.
            // User asked for "perpicipation", usually implies chance or amount. Let's show amount for now as it's simpler with current query.
            if (weatherPrecip) weatherPrecip.textContent = `💧 ${precip}"`;

            // Simple icon mapping based on weather code
            const code = data.current_weather.weathercode;
            let icon = '☀️'; // Default clear

            if (code >= 1 && code <= 3) icon = '⛅'; // Partly cloudy
            if (code >= 45 && code <= 48) icon = '🌫️'; // Fog
            if (code >= 51 && code <= 67) icon = '🌧️'; // Rain
            if (code >= 71 && code <= 77) icon = '❄️'; // Snow
            if (code >= 80 && code <= 82) icon = '🌦️'; // Showers
            if (code >= 95) icon = '⛈️'; // Thunderstorm

            weatherIcon.textContent = icon;
        }
    } catch (error) {
        console.error("Weather fetch failed:", error);
        weatherTemp.textContent = "N/A";
    }
}

// Fetch weather on load
fetchWeather();

// Chatbot Logic
const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const closeChat = document.getElementById('close-chat');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');

if (chatToggle && chatWindow && closeChat) {
    chatToggle.addEventListener('click', () => {
        chatWindow.classList.add('active');
    });

    closeChat.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });
}

function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotResponse(input) {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
        return "Hello! How can I help you today?";
    } else if (lowerInput.includes('education') || lowerInput.includes('school') || lowerInput.includes('university')) {
        return "Nishant is currently pursuing a Bachelor's in Accounting and CIS at Caldwell University (GPA 4.0), expected to graduate in 2028.";
    } else if (lowerInput.includes('experience') || lowerInput.includes('work') || lowerInput.includes('job')) {
        return "Nishant has experience as a Library Student Worker, Student Ambassador, and Event Manager at Caldwell University. He also founded the We Enthusiast Club.";
    } else if (lowerInput.includes('skill') || lowerInput.includes('python') || lowerInput.includes('java')) {
        return "Nishant's skills include Python, C++, Java, Microsoft Office, and Database Navigation. He also has strong leadership and communication skills.";
    } else if (lowerInput.includes('contact') || lowerInput.includes('email') || lowerInput.includes('phone')) {
        return "You can contact Nishant at nacharya@caldwell.edu or (443) 935-0868.";
    } else if (lowerInput.includes('project')) {
        return "Nishant has built this portfolio website and has experience with other academic projects.";
    } else {
        return "I'm not sure about that. Try asking about my education, experience, skills, or contact info!";
    }
}

function handleChat() {
    const text = chatInput.value.trim();
    if (text) {
        addMessage(text, true);
        chatInput.value = '';

        // Simulate typing delay
        setTimeout(() => {
            const response = getBotResponse(text);
            addMessage(response, false);
        }, 500);
    }
}

if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', handleChat);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleChat();
        }
    });
}
