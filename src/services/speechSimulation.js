// src/services/speechSimulation.js
export class SpeechSimulation {
    constructor() {
        this.isRecording = false;
        this.onResult = null;
    }
    
    // Simulate speech-to-text with text input
    startListening(onResult) {
        this.onResult = onResult;
        this.isRecording = true;
        
        // For now, we'll use text input to simulate voice
        // Later this will be replaced with actual speech recognition
        console.log('🎤 Started listening simulation');
        return true;
    }
    
    stopListening() {
        this.isRecording = false;
        console.log('🎤 Stopped listening simulation');
        return true;
    }
    
    // Simulate corrupted speech-to-text (as your ML model is trained for)
    simulateCorruptedSTT(text) {
        const corruptions = [
            // Phonetic replacements
            { from: /\bto\b/g, to: 'too', chance: 0.3 },
            { from: /\bturn\b/g, to: 'tern', chance: 0.2 },
            { from: /\bthe\b/g, to: 'thee', chance: 0.25 },
            { from: /\bset\b/g, to: 'sit', chance: 0.2 },
            { from: /\bvolume\b/g, to: 'valium', chance: 0.15 },
            { from: /\btemperature\b/g, to: 'temprature', chance: 0.3 },
            { from: /\blights\b/g, to: 'lights', chance: 0.1 },
            { from: /\bclimate\b/g, to: 'climat', chance: 0.2 },
            
            // Missing words
            { from: /\bturn on the\b/g, to: 'turn on', chance: 0.3 },
            { from: /\bturn off the\b/g, to: 'turn off', chance: 0.3 },
            { from: /\bset the\b/g, to: 'set', chance: 0.25 },
            
            // Extra words
            { from: /\bvolume\b/g, to: 'volume level', chance: 0.2 },
            { from: /\bmusic\b/g, to: 'the music', chance: 0.25 },
            { from: /\bseats\b/g, to: 'car seats', chance: 0.2 },
            
            // Word order changes
            { from: /turn up the volume/g, to: 'volume turn up', chance: 0.15 },
            { from: /turn on lights/g, to: 'lights turn on', chance: 0.15 },
        ];
        
        let corrupted = text.toLowerCase();
        corruptions.forEach(corruption => {
            if (Math.random() < corruption.chance) {
                corrupted = corrupted.replace(corruption.from, corruption.to);
            }
        });
        
        // Random character drops (simulating poor audio quality)
        if (Math.random() < 0.1) {
            const chars = corrupted.split('');
            const dropIndex = Math.floor(Math.random() * chars.length);
            chars.splice(dropIndex, 1);
            corrupted = chars.join('');
        }
        
        return corrupted;
    }
    
    // Get random test command
    getRandomTestCommand() {
        const commands = [
            "Set temperature to 24 degrees",
            "Turn up the volume",
            "Turn on the lights", 
            "Heat the seats",
            "Play some music",
            "Make it cooler",
            "Dim the lights",
            "Stop the music",
            "Volume to 50",
            "Turn off climate control",
            "Brighten the lights",
            "Set temperature to 18",
            "Turn down volume",
            "Stop heating seats"
        ];
        
        return commands[Math.floor(Math.random() * commands.length)];
    }
}