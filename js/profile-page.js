// VIM Master Profile Page - Main JavaScript

import { 
    getBadges, getPracticedCommands, getCurrentLevel, getChallengeMode,
    setBadges, setPracticedCommands, setCurrentLevel, setChallengeMode
} from './game-state.js';

import { exportProgress } from './progress-system.js';

import { 
    sharingSystem, generateCard, generateProfileCard, generateAsciiLogo
} from './sharing-system.js';

// Profile page initialization
function initializeProfilePage() {
    // Load progress data from localStorage first
    loadProgressData();
    
    // Set up ASCII logo
    setupAsciiLogo();
    
    // Generate floating particles
    createFloatingParticles();
    
    // Generate profile card
    generateProfileSection();
    
    // Generate achievement cards
    generateAchievementSection();
    
    // Set up smooth scrolling for navigation
    setupSmoothScrolling();
    
    // Set up copy progress code functionality
    setupCopyProgressCode();
}

// Load progress data from localStorage
function loadProgressData() {
    try {
        const savedProgress = localStorage.getItem('vimMasterProgress');
        if (savedProgress) {
            const progressData = JSON.parse(savedProgress);
            
            // Apply the loaded progress to game state
            if (progressData.badges) {
                setBadges(progressData.badges);
            }
            if (progressData.practicedCommands) {
                setPracticedCommands(progressData.practicedCommands);
            }
            if (typeof progressData.currentLevel === 'number') {
                setCurrentLevel(progressData.currentLevel);
            }
            if (typeof progressData.challengeMode === 'boolean') {
                setChallengeMode(progressData.challengeMode);
            }
            
            console.log('Progress data loaded:', progressData);
        } else {
            console.log('No saved progress found in localStorage');
        }
    } catch (error) {
        console.error('Failed to load progress data:', error);
    }
}

// Set up ASCII logo
function setupAsciiLogo() {
    const asciiLogo = document.getElementById('ascii-logo');
    if (asciiLogo) {
        asciiLogo.textContent = generateAsciiLogo();
    }
}

// Create floating particles background
function createFloatingParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random positioning
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random animation delay
        particle.style.animationDelay = Math.random() * 6 + 's';
        
        // Random size
        const size = Math.random() * 3 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random opacity
        particle.style.opacity = Math.random() * 0.6 + 0.2;
        
        particlesContainer.appendChild(particle);
    }
}

// Generate profile section
function generateProfileSection() {
    const container = document.getElementById('profile-card-container');
    if (!container) return;
    
    try {
        const profileCard = generateProfileCard();
        container.innerHTML = profileCard;
    } catch (error) {
        console.error('Failed to generate profile card:', error);
        container.innerHTML = `
            <div class="bg-gradient-to-br from-red-900/50 to-red-800/50 rounded-xl p-8 border border-red-600/50 backdrop-blur-sm text-center">
                <div class="text-6xl mb-4">⚠️</div>
                <h3 class="text-2xl font-bold mb-4">Profile Unavailable</h3>
                <p class="text-red-200 mb-4">Unable to load your profile data. Please return to the game and try again.</p>
                <a href="index.html" class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                    Return to Game
                </a>
            </div>
        `;
    }
}

// Generate achievement section
function generateAchievementSection() {
    const container = document.getElementById('achievement-cards-container');
    if (!container) return;
    
    try {
        const badges = Array.from(getBadges());
        
        if (badges.length === 0) {
            container.innerHTML = `
                <div class="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-xl p-8 border border-yellow-600/50 backdrop-blur-sm text-center max-w-2xl mx-auto">
                    <div class="text-6xl mb-4">🎯</div>
                    <h3 class="text-2xl font-bold mb-4 text-yellow-200">No Badges Yet</h3>
                    <p class="text-yellow-100 mb-6">Complete levels in the game to earn your first badge and unlock achievement sharing!</p>
                    <div class="bg-yellow-800/30 rounded-lg p-4 mb-6">
                        <h4 class="text-lg font-semibold mb-2 text-yellow-200">How to Earn Badges:</h4>
                        <ul class="text-yellow-100 text-left max-w-md mx-auto space-y-2">
                            <li>• Complete levels to unlock new VIM commands</li>
                            <li>• Practice movement commands (h, j, k, l)</li>
                            <li>• Master search and navigation</li>
                            <li>• Complete speed challenges</li>
                        </ul>
                    </div>
                    <a href="index.html" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                        🚀 Start Playing
                    </a>
                </div>
            `;
            return;
        }
        
        // Generate achievement cards for each badge
        const achievementCards = badges.map(badge => {
            const achievement = {
                name: badge,
                description: getBadgeDescription(badge)
            };
            
            return `
                <div class="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-700/50 backdrop-blur-sm">
                    <div class="text-center mb-4">
                        <div class="text-4xl mb-2">🏆</div>
                        <h3 class="text-xl font-bold text-blue-200 mb-2">${achievement.name}</h3>
                        <p class="text-blue-100 text-sm mb-4">${achievement.description}</p>
                    </div>
                    
                    <!-- Canvas Preview -->
                    <div class="mb-4 flex justify-center">
                        <div id="canvas-preview-${badge}" class="border border-blue-600/50 rounded-lg overflow-hidden">
                            <!-- Canvas will be inserted here -->
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex flex-wrap gap-2 justify-center">
                        <button onclick="sharingSystem.downloadAchievementCard({name: '${achievement.name}', description: '${achievement.description}'})" 
                                class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 text-sm">
                            💾 Download
                        </button>
                        
                        <button onclick="sharingSystem.shareAchievementCard({name: '${achievement.name}', description: '${achievement.description}'}, 'clipboard')" 
                                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 text-sm">
                            📋 Copy
                        </button>
                        
                        <button onclick="sharingSystem.shareAchievement({name: '${achievement.name}', description: '${achievement.description}'}, 'twitter')" 
                                class="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 text-sm">
                            🐦 Twitter
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = `
            <div class="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                ${achievementCards}
            </div>
            
            <div class="text-center mt-8">
                <p class="text-gray-400 mb-4">Share these beautiful achievement cards on social media!</p>
                <div class="flex flex-wrap justify-center gap-4">
                    <button onclick="sharingSystem.shareToTwitter()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                        🐦 Share All on Twitter
                    </button>
                    <button onclick="sharingSystem.shareToFacebook()" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                        📘 Share All on Facebook
                    </button>
                </div>
            </div>
        `;
        
        // Generate and insert canvas previews
        badges.forEach(badge => {
            const previewContainer = document.getElementById(`canvas-preview-${badge}`);
            if (previewContainer) {
                const achievement = {
                    name: badge,
                    description: getBadgeDescription(badge)
                };
                const canvas = sharingSystem.generateCard(achievement);
                
                // Scale down the canvas for preview
                const previewCanvas = document.createElement('canvas');
                const previewCtx = previewCanvas.getContext('2d');
                previewCanvas.width = 300;
                previewCanvas.height = 225;
                previewCtx.drawImage(canvas, 0, 0, 300, 225);
                
                previewContainer.appendChild(previewCanvas);
            }
        });
        
    } catch (error) {
        console.error('Failed to generate achievement cards:', error);
        container.innerHTML = `
            <div class="bg-gradient-to-br from-red-900/50 to-red-800/50 rounded-xl p-8 border border-red-600/50 backdrop-blur-sm text-center">
                <div class="text-6xl mb-4">⚠️</div>
                <h3 class="text-2xl font-bold mb-4">Achievements Unavailable</h3>
                <p class="text-red-200">Unable to load your achievements. Please return to the game and try again.</p>
            </div>
        `;
    }
}

// Get badge description
function getBadgeDescription(badge) {
    const descriptions = {
        'beginner': 'Completed your first VIM level! Welcome to the world of efficient text editing.',
        'searchmaster': 'Mastered search and navigation commands. You can now find text like a pro!',
        'movement': 'Became proficient with VIM movement commands. Your cursor flies across the screen!',
        'insertion': 'Learned to insert and edit text efficiently. No more switching between modes!',
        'deletion': 'Mastered text deletion commands. Clean up text with surgical precision!',
        'visual': 'Unlocked visual selection mode. Select and manipulate text blocks easily!',
        'undo': 'Mastered the undo system. Never fear making mistakes again!',
        'challenge': 'Completed speed challenges! You\'re getting faster every day!',
        'expert': 'Reached advanced VIM levels. You\'re becoming a true text editing master!',
        'master': 'Achieved VIM mastery! You can now edit text with incredible efficiency!'
    };
    
    return descriptions[badge] || `Earned the ${badge} badge through your VIM mastery!`;
}

// Set up smooth scrolling for navigation
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Set up copy progress code functionality
function setupCopyProgressCode() {
    // Make copyProgressCode function globally available
    window.copyProgressCode = async function() {
        try {
            const progressCode = exportProgress();
            await navigator.clipboard.writeText(progressCode);
            
            // Show success message
            showCopySuccessMessage();
        } catch (error) {
            console.error('Failed to copy progress code:', error);
            showCopyErrorMessage();
        }
    };
}

// Show copy success message
function showCopySuccessMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: bold;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
    `;
    message.textContent = '✅ Progress code copied to clipboard!';
    
    document.body.appendChild(message);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        message.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Show copy error message
function showCopyErrorMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: bold;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
    `;
    message.textContent = '❌ Failed to copy progress code';
    
    document.body.appendChild(message);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        message.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Add CSS animations for messages
function addMessageAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add message animations
    addMessageAnimations();
    
    // Initialize profile page
    initializeProfilePage();
    
    // Make sharingSystem globally available for onclick handlers
    window.sharingSystem = sharingSystem;
});

// Export functions for potential external use
export {
    initializeProfilePage,
    generateProfileSection,
    generateAchievementSection,
    setupSmoothScrolling,
    setupCopyProgressCode
};
