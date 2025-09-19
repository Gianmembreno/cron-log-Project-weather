require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Configuration
const API_KEY = process.env.OPENWEATHER_API_KEY;
const CITY = process.env.CITY || 'London';
const UNITS = process.env.UNITS || 'metric'; // metric, imperial, or kelvin
const LOG_FILE = path.join(__dirname, 'data', 'weather_log.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

async function fetchWeatherData() {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=${UNITS}&appid=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract relevant data
        const logEntry = {
            timestamp: new Date().toISOString(),
            city: data.name,
            country: data.sys.country,
            temperature: data.main.temp,
            feels_like: data.main.feels_like,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            weather: data.weather[0].main,
            description: data.weather[0].description,
            wind_speed: data.wind.speed,
            clouds: data.clouds.all
        };
        
        // Read existing log file or create new array
        let logs = [];
        if (fs.existsSync(LOG_FILE)) {
            const fileContent = fs.readFileSync(LOG_FILE, 'utf8');
            logs = JSON.parse(fileContent);
        }
        
        // Add new entry
        logs.push(logEntry);
        
        // Write back to file
        fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
        
        console.log(`✅ Weather data logged at ${logEntry.timestamp}`);
        console.log(`📍 ${logEntry.city}, ${logEntry.country}`);
        console.log(`🌡️  ${logEntry.temperature}°${UNITS === 'metric' ? 'C' : 'F'} - ${logEntry.description}`);
        
        return logEntry;
        
    } catch (error) {
        console.error('❌ Error fetching weather data:', error.message);
        
        // Log error
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: error.message
        };
        
        let errorLogs = [];
        const errorFile = path.join(__dirname, 'data', 'error_log.json');
        if (fs.existsSync(errorFile)) {
            errorLogs = JSON.parse(fs.readFileSync(errorFile, 'utf8'));
        }
        errorLogs.push(errorLog);
        fs.writeFileSync(errorFile, JSON.stringify(errorLogs, null, 2));
        
        process.exit(1);
    }
}

// Run the logger
fetchWeatherData();