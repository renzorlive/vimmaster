// VIM Master Game - Social Media Sharing System

import { 
    getBadges, getPracticedCommands, getCurrentLevel, getChallengeMode
} from './game-state.js';

import { exportProgress } from './progress-system.js';

class VimMasterSharingSystem {
    constructor() {
        this.gameUrl = 'https://github.com/renzorlive/vimmaster'; // Update with your actual GitHub repo
        this.gameName = 'VIM Master';
        this.gameDescription = 'Master the Art of Text Editing with Interactive VIM Learning';
    }
    
    // Get current game data for sharing
    getGameData() {
        return {
            level: getCurrentLevel() + 1,
            totalLevels: 15, // Total available levels
            levelsCompleted: getCurrentLevel() + 1, // Actual levels completed
            badges: Array.from(getBadges()),
            commandsPracticed: getPracticedCommands().size,
            progressCode: exportProgress(),
            timestamp: new Date().toISOString()
        };
    }
    
    // Generate shareable achievement card
    generateCard(achievement) {
        const gameData = this.getGameData();
        return this.generateCanvasAchievementCard({
            achievement: achievement.name,
            description: achievement.description,
            level: gameData.level,
            totalLevels: gameData.totalLevels,
            badgesCount: gameData.badges.length,
            commandsCount: gameData.commandsPracticed,
            progressCode: gameData.progressCode
        });
    }
    
    // Generate Canvas-based achievement card
    generateCanvasAchievementCard(data) {
        // Create canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 800;
        canvas.height = 600;
        
        // Create gradient background - back to the beautiful blue/purple theme
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, '#1e3a8a');  // Blue
        gradient.addColorStop(1, '#7c3aed');  // Purple
        
        // Fill background
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);
        
        // Add background pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 800; i += 20) {
            for (let j = 0; j < 600; j += 20) {
                ctx.beginPath();
                ctx.arc(i, j, 1, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
        
        // Draw ASCII logo at the top - using yellow/orange color for better visibility
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#fbbf24';  // Yellow/orange color for the ASCII logo
        ctx.textAlign = 'center';
        ctx.shadowBlur = 3;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw each line of the ASCII logo individually for better control
        const logoLines = [
            '██╗   ██╗██╗███╗   ███╗    ███╗   ███╗ █████╗ ███████╗████████╗███████╗██████╗',
            '██║   ██║██║████╗ ████║    ████╗ ████║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗',
            '██║   ██║██║██╔████╔██║    ██╔████╔██║███████║███████╗   ██║   █████╗  ██████╔╝',
            '╚██╗ ██╔╝██║██║╚██╔╝██║    ██║╚██╔╝██║██╔══██║╚════██║   ██║   ██╔══╝  ██╔══██╗',
            ' ╚████╔╝ ██║██║ ╚═╝ ██║    ██║ ╚═╝ ██║██║  ██║███████╗   ██║   ███████╗██║  ██║',
            '  ╚═══╝  ╚═╝╚═╝     ╚═╝    ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝'
        ];
        
        const logoStartY = 35;
        const lineHeight = 16;
        
        logoLines.forEach((line, index) => {
            ctx.fillText(line, 400, logoStartY + (index * lineHeight));
        });
        
        // Set text properties for achievement content - back to white text for blue background
        ctx.textAlign = 'center';
        ctx.font = 'bold 48px Arial, sans-serif';
        ctx.fillStyle = 'white';  // White text for better contrast on blue background
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw achievement icon (emoji as text) - moved down to make room for logo
        ctx.font = 'bold 80px Arial, sans-serif';
        ctx.fillText('🏆', 400, 180);
        
        // Draw achievement title
        ctx.font = 'bold 36px Arial, sans-serif';
        ctx.fillText(data.achievement, 400, 260);
        
        // Draw description
        ctx.font = '20px Arial, sans-serif';
        ctx.shadowBlur = 5;
        ctx.fillStyle = 'white';  // White text for description
        this.wrapText(ctx, data.description, 400, 310, 700, 30);
        
        // Draw progress stats
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.shadowBlur = 3;
        ctx.fillStyle = 'white';  // White text for stats
        
        // Level progress
        const progressPercent = Math.round((data.level / data.totalLevels) * 100);
        ctx.fillText(`Level ${data.level} of ${data.totalLevels}`, 400, 410);
        
        // Progress bar
        const barWidth = 400;
        const barHeight = 20;
        const barX = (800 - barWidth) / 2;
        const barY = 440;
        
        // Background bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';  // Light white background for progress bar
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress bar - using a nice green color
        const progressWidth = (progressPercent / 100) * barWidth;
        ctx.fillStyle = '#10b981';
        ctx.fillRect(barX, barY, progressWidth, barHeight);
        
        // Progress percentage
        ctx.fillStyle = 'white';  // White text for percentage
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText(`${progressPercent}%`, 400, 460);
        
        // Stats grid
        ctx.font = '18px Arial, sans-serif';
        ctx.fillText(`Badges: ${data.badgesCount}`, 200, 510);
        ctx.fillText(`Commands: ${data.commandsCount}`, 600, 510);
        
        // Footer
        ctx.font = '16px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';  // Semi-transparent white for footer
        ctx.fillText('VIM Master - Master the Art of Text Editing', 400, 570);
        
        return canvas;
    }
    
    // Helper function to wrap text
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }
    
    // Download achievement card as image
    downloadAchievementCard(achievement) {
        try {
            const canvas = this.generateCard(achievement);
            const link = document.createElement('a');
            link.download = `vim-master-${achievement.name}-achievement.png`;
            link.href = canvas.toDataURL();
            link.click();
        } catch (error) {
            console.error('Failed to download achievement card:', error);
        }
    }
    
    // Share achievement card
    shareAchievementCard(achievement, platform) {
        try {
            const canvas = this.generateCard(achievement);
            
            if (platform === 'download') {
                this.downloadAchievementCard(achievement);
            } else if (platform === 'clipboard') {
                this.copyToClipboard(canvas);
            } else {
                this.shareAchievement(achievement, platform);
            }
        } catch (error) {
            console.error('Failed to share achievement card:', error);
        }
    }
    
    // Copy image to clipboard
    async copyToClipboard(canvas) {
        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const clipboardItem = new ClipboardItem({
                'image/png': blob
            });
            await navigator.clipboard.write([clipboardItem]);
            console.log('Achievement card copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            // Fallback to download
            this.downloadAchievementCard(achievement);
        }
    }
    
    // Generate beautiful achievement card HTML (fallback)
    generateAchievementCard(data) {
        const cardHtml = `
            <div class="achievement-card" style="
                background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%);
                border-radius: 20px;
                padding: 30px;
                color: white;
                font-family: 'Fira Code', monospace;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                max-width: 500px;
                margin: 20px auto;
                position: relative;
                overflow: hidden;
            ">
                <!-- Background Pattern -->
                <div style="
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
                    background-size: 20px 20px;
                    animation: float 6s ease-in-out infinite;
                    pointer-events: none;
                "></div>
                
                <!-- Achievement Icon -->
                <div style="
                    font-size: 4rem;
                    margin-bottom: 20px;
                    filter: drop-shadow(0 0 20px rgba(255,255,255,0.3));
                    animation: bounce 2s ease-in-out infinite;
                ">🏆</div>
                
                <!-- Achievement Title -->
                <h2 style="
                    font-size: 1.8rem;
                    font-weight: bold;
                    margin-bottom: 10px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">${data.achievement}</h2>
                
                <!-- Achievement Description -->
                <p style="
                    font-size: 1rem;
                    margin-bottom: 25px;
                    opacity: 0.9;
                    line-height: 1.4;
                ">${data.description}</p>
                
                <!-- Progress Stats -->
                <div style="
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    margin-bottom: 25px;
                ">
                    <div style="
                        background: rgba(255,255,255,0.1);
                        padding: 15px;
                        border-radius: 10px;
                        backdrop-filter: blur(10px);
                    ">
                        <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 5px;">${data.level}</div>
                        <div style="font-size: 0.9rem; opacity: 0.8;">Current Level</div>
                    </div>
                    
                    <div style="
                        background: rgba(255,255,255,0.1);
                        padding: 15px;
                        border-radius: 10px;
                        backdrop-filter: blur(10px);
                    ">
                        <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 5px;">${data.badgesCount}</div>
                        <div style="font-size: 0.9rem; opacity: 0.8;">Badges Earned</div>
                    </div>
                    
                    <div style="
                        background: rgba(255,255,255,0.1);
                        padding: 15px;
                        border-radius: 10px;
                        backdrop-filter: blur(10px);
                    ">
                        <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 5px;">${data.commandsCount}</div>
                        <div style="font-size: 0.9rem; opacity: 0.8;">Commands Practiced</div>
                    </div>
                </div>
                
                <!-- Progress Bar -->
                <div style="
                    background: rgba(255,255,255,0.1);
                    height: 8px;
                    border-radius: 4px;
                    margin-bottom: 20px;
                    overflow: hidden;
                ">
                    <div style="
                        background: linear-gradient(90deg, #10b981, #34d399);
                        height: 100%;
                        width: ${(data.level / data.totalLevels) * 100}%;
                        border-radius: 4px;
                        transition: width 0.5s ease;
                    "></div>
                </div>
                
                <!-- Progress Text -->
                <div style="
                    font-size: 0.9rem;
                    opacity: 0.8;
                    margin-bottom: 25px;
                ">
                    ${data.level} of ${data.totalLevels} levels completed
                </div>
                
                <!-- Share Buttons -->
                <div style="
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    flex-wrap: wrap;
                ">
                    <button onclick="sharingSystem.downloadAchievementCard({name: '${data.achievement}', description: '${data.description}'})" style="
                        background: linear-gradient(135deg, #10b981, #059669);
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-size: 0.9rem;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        💾 Download Card
                    </button>
                    
                    <button onclick="sharingSystem.shareAchievementCard({name: '${data.achievement}', description: '${data.description}'}, 'clipboard')" style="
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-size: 0.9rem;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        📋 Copy to Clipboard
                    </button>
                </div>
            </div>
        `;
        
        return cardHtml;
    }
    
    // Generate profile card
    generateProfileCard() {
        const gameData = this.getGameData();
        const progressPercent = Math.round((gameData.level / gameData.totalLevels) * 100);
        
        return `
            <div class="profile-card" style="
                background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%);
                border-radius: 25px;
                padding: 40px;
                color: white;
                font-family: 'Fira Code', monospace;
                text-align: center;
                box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                max-width: 600px;
                margin: 0 auto;
                position: relative;
                overflow: hidden;
            ">
                <!-- ASCII Logo Header -->
                <div style="
                    font-family: monospace;
                    font-size: 0.6rem;
                    line-height: 0.8;
                    color: rgba(255,255,255,0.9);
                    margin-bottom: 20px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
                ">
                    <pre style="margin: 0; text-align: center; white-space: pre;">${this.generateAsciiLogo()}</pre>
                </div>
                
                <!-- Background Pattern -->
                <div style="
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
                    background-size: 25px 25px;
                    animation: float 8s ease-in-out infinite;
                    pointer-events: none;
                "></div>
                
                <!-- Profile Header -->
                <div style="
                    font-size: 3rem;
                    margin-bottom: 20px;
                    filter: drop-shadow(0 0 25px rgba(255,255,255,0.4));
                    animation: bounce 3s ease-in-out infinite;
                ">👤</div>
                
                <h1 style="
                    font-size: 2.5rem;
                    font-weight: bold;
                    margin-bottom: 10px;
                    text-shadow: 0 3px 6px rgba(0,0,0,0.4);
                ">VIM Master Profile</h1>
                
                <!-- Circular Progress -->
                <div style="
                    width: 150px;
                    height: 150px;
                    margin: 30px auto;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <!-- Progress Circle Background -->
                    <svg width="150" height="150" style="transform: rotate(-90deg)">
                        <circle
                            cx="75"
                            cy="75"
                            r="65"
                            stroke="rgba(255,255,255,0.2)"
                            stroke-width="12"
                            fill="none"
                        />
                        <circle
                            cx="75"
                            cy="75"
                            r="65"
                            stroke="#10b981"
                            stroke-width="12"
                            fill="none"
                            stroke-dasharray="${2 * Math.PI * 65}"
                            stroke-dashoffset="${2 * Math.PI * 65 * (1 - progressPercent / 100)}"
                            style="transition: stroke-dashoffset 1s ease"
                        />
                    </svg>
                    
                    <!-- Progress Text -->
                    <div style="
                        position: absolute;
                        font-size: 2rem;
                        font-weight: bold;
                        color: white;
                    ">${progressPercent}%</div>
                </div>
                
                <!-- Stats Grid -->
                <div style="
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin: 30px 0;
                ">
                    <div style="
                        background: rgba(255,255,255,0.1);
                        padding: 20px;
                        border-radius: 15px;
                        backdrop-filter: blur(15px);
                        border: 1px solid rgba(255,255,255,0.2);
                    ">
                        <div style="font-size: 2rem; font-weight: bold; margin-bottom: 8px;">${gameData.level}</div>
                        <div style="font-size: 1rem; opacity: 0.9;">Current Level</div>
                    </div>
                    
                    <div style="
                        background: rgba(255,255,255,0.1);
                        padding: 20px;
                        border-radius: 15px;
                        backdrop-filter: blur(15px);
                        border: 1px solid rgba(255,255,255,0.2);
                    ">
                        <div style="font-size: 2rem; font-weight: bold; margin-bottom: 8px;">${gameData.badges.length}</div>
                        <div style="font-size: 1rem; opacity: 0.9;">Badges Earned</div>
                    </div>
                    
                    <div style="
                        background: rgba(255,255,255,0.1);
                        padding: 20px;
                        border-radius: 15px;
                        backdrop-filter: blur(15px);
                        border: 1px solid rgba(255,255,255,0.2);
                    ">
                        <div style="font-size: 2rem; font-weight: bold; margin-bottom: 8px;">${gameData.commandsPracticed}</div>
                        <div style="font-size: 1rem; opacity: 0.9;">Commands Practiced</div>
                    </div>
                    
                    <div style="
                        background: rgba(255,255,255,0.1);
                        padding: 20px;
                        border-radius: 15px;
                        backdrop-filter: blur(15px);
                        border: 1px solid rgba(255,255,255,0.2);
                    ">
                        <div style="font-size: 2rem; font-weight: bold; margin-bottom: 8px;">${gameData.level}</div>
                        <div style="font-size: 1rem; opacity: 0.9;">Levels Completed</div>
                    </div>
                </div>
                
                <!-- Badges Display -->
                <div style="margin: 30px 0;">
                    <h3 style="
                        font-size: 1.5rem;
                        font-weight: bold;
                        margin-bottom: 20px;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">🎯 Earned Badges</h3>
                    
                    ${this.generateBadgesDisplay(gameData.badges)}
                </div>
                
                <!-- Progress Code -->
                <div style="
                    background: rgba(0,0,0,0.3);
                    padding: 20px;
                    border-radius: 15px;
                    margin: 30px 0;
                    border: 1px solid rgba(255,255,255,0.2);
                ">
                    <h4 style="
                        font-size: 1.2rem;
                        font-weight: bold;
                        margin-bottom: 15px;
                        color: #10b981;
                    ">💾 Progress Code</h4>
                    
                    <div style="
                        background: rgba(0,0,0,0.5);
                        padding: 15px;
                        border-radius: 10px;
                        font-family: 'Courier New', monospace;
                        font-size: 0.8rem;
                        word-break: break-all;
                        color: #10b981;
                        border: 1px solid rgba(16, 185, 129, 0.3);
                        margin-bottom: 15px;
                    ">${gameData.progressCode}</div>
                    
                    <button onclick="copyProgressCode()" style="
                        background: linear-gradient(135deg, #10b981, #059669);
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-size: 1rem;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        📋 Copy Progress Code
                    </button>
                </div>
                
                <!-- Social Share Buttons -->
                <div style="margin: 30px 0;">
                    <h3 style="
                        font-size: 1.5rem;
                        font-weight: bold;
                        margin-bottom: 20px;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">📤 Share Your Progress</h3>
                    
                    <div style="
                        display: flex;
                        gap: 15px;
                        justify-content: center;
                        flex-wrap: wrap;
                    ">
                        <button onclick="sharingSystem.shareToTwitter()" style="
                            background: linear-gradient(135deg, #1da1f2, #0d8bd9);
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 25px;
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            font-size: 1rem;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            🐦 Share on Twitter
                        </button>
                        
                        <button onclick="sharingSystem.shareToFacebook()" style="
                            background: linear-gradient(135deg, #4267b2, #365899);
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 25px;
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            font-size: 1rem;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            📘 Share on Facebook
                        </button>
                        
                        <button onclick="sharingSystem.smartShare()" style="
                            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 25px;
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            font-size: 1rem;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            📱 Smart Share
                        </button>
                    </div>
                </div>
                
                <!-- GitHub Link -->
                <div style="
                    margin-top: 40px;
                    padding: 20px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 15px;
                    border: 1px solid rgba(255,255,255,0.2);
                ">
                    <h4 style="
                        font-size: 1.2rem;
                        font-weight: bold;
                        margin-bottom: 15px;
                        color: #10b981;
                    ">🔗 Open Source</h4>
                    
                    <p style="
                        margin-bottom: 20px;
                        opacity: 0.9;
                        line-height: 1.5;
                    ">VIM Master is an open-source project. Contribute, star, or fork on GitHub!</p>
                    
                    <a href="${this.gameUrl}" target="_blank" style="
                        background: linear-gradient(135deg, #333, #555);
                        color: white;
                        text-decoration: none;
                        padding: 15px 30px;
                        border-radius: 25px;
                        font-weight: bold;
                        display: inline-block;
                        transition: all 0.3s ease;
                        font-size: 1rem;
                        border: 1px solid rgba(255,255,255,0.2);
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        🐙 View on GitHub
                    </a>
                </div>
            </div>
        `;
    }
    
    // Generate badges display
    generateBadgesDisplay(badges) {
        if (badges.length === 0) {
            return `
                <div style="
                    background: rgba(255,255,255,0.1);
                    padding: 20px;
                    border-radius: 15px;
                    border: 1px solid rgba(255,255,255,0.2);
                ">
                    <div style="font-size: 1.2rem; margin-bottom: 10px;">🎯 No Badges Yet</div>
                    <p style="opacity: 0.8; line-height: 1.4;">Complete levels in the game to earn your first badge!</p>
                </div>
            `;
        }
        
        const badgeEmojis = {
            'beginner': '🌟',
            'searchmaster': '🔍',
            'movement': '🏃',
            'insertion': '✏️',
            'deletion': '🗑️',
            'visual': '👁️',
            'undo': '↩️',
            'challenge': '⚡',
            'expert': '🎓',
            'master': '👑'
        };
        
        return `
            <div style="
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            ">
                ${badges.map(badge => `
                    <div style="
                        background: linear-gradient(135deg, #fbbf24, #f59e0b);
                        padding: 15px;
                        border-radius: 15px;
                        text-align: center;
                        min-width: 100px;
                        border: 2px solid rgba(255,255,255,0.3);
                        box-shadow: 0 5px 15px rgba(251, 191, 36, 0.3);
                        animation: badgeGlow 2s ease-in-out infinite alternate;
                    ">
                        <div style="font-size: 2rem; margin-bottom: 8px;">${badgeEmojis[badge] || '🏆'}</div>
                        <div style="
                            font-size: 0.9rem;
                            font-weight: bold;
                            text-transform: capitalize;
                            color: #92400e;
                        ">${badge}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Share achievement
    shareAchievement(achievement, platform) {
        const shareData = {
            title: `I earned the ${achievement.name} badge in VIM Master!`,
            text: `${achievement.description} 🎯`,
            url: this.gameUrl
        };
        
        switch (platform) {
            case 'twitter':
                this.shareToTwitter(shareData);
                break;
            case 'facebook':
                this.shareToFacebook(shareData);
                break;
            default:
                this.smartShare(shareData);
        }
    }
    
    // Share to Twitter
    shareToTwitter(shareData = null) {
        if (!shareData) {
            // Create default share data for general profile sharing
            shareData = {
                title: "🚀 I'm mastering VIM with VIM Master! Check out my progress and achievements!",
                url: window.location.origin + "/profile.html"
            };
        }
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}`;
        window.open(url, '_blank', 'width=600,height=400');
    }
    
    // Share to Facebook
    shareToFacebook(shareData = null) {
        if (!shareData) {
            // Create default share data for general profile sharing
            shareData = {
                title: "🚀 I'm mastering VIM with VIM Master! Check out my progress and achievements!",
                url: window.location.origin + "/profile.html"
            };
        }
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.title)}`;
        window.open(url, '_blank', 'width=600,height=400');
    }
    
    // Smart share (native share on mobile, modal on desktop)
    smartShare(shareData) {
        if (this.isMobile() && navigator.share) {
            this.nativeShare(shareData);
        } else {
            this.showShareModal(shareData);
        }
    }
    
    // Native share API
    async nativeShare(shareData) {
        try {
            await navigator.share(shareData);
        } catch (error) {
            console.log('Share cancelled or failed:', error);
        }
    }
    
    // Show share modal
    showShareModal(shareData) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 20px;
                max-width: 400px;
                text-align: center;
                font-family: Arial, sans-serif;
            ">
                <h3 style="margin-bottom: 20px; color: #333;">Share Your Achievement!</h3>
                <p style="margin-bottom: 20px; color: #666;">${shareData.title}</p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button onclick="this.closest('.share-modal').remove()" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 10px;
                        cursor: pointer;
                    ">Close</button>
                    <button onclick="window.open('https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}', '_blank')" style="
                        background: #1da1f2;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 10px;
                        cursor: pointer;
                    ">Share on Twitter</button>
                </div>
            </div>
        `;
        
        modal.className = 'share-modal';
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // Check if mobile device
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // Generate ASCII logo
    generateAsciiLogo() {
        return `
    ██╗   ██╗██╗███╗   ███╗    ███╗   ███╗ █████╗ ███████╗████████╗███████╗██████╗ 
    ██║   ██║██║████╗ ████║    ████╗ ████║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗
    ██║   ██║██║██╔████╔██║    ██╔████╔██║███████║███████╗   ██║   █████╗  ██████╔╝
    ╚██╗ ██╔╝██║██║╚██╔╝██║    ██║╚██╔╝██║██╔══██║╚════██║   ██║   ██╔══╝  ██╔══██╗
     ╚████╔╝ ██║██║ ╚═╝ ██║    ██║ ╚═╝ ██║██║  ██║███████╗   ██║   ███████╗██║  ██║
      ╚═══╝  ╚═╝╚═╝     ╚═╝    ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
        `;
    }
}

// Create and export singleton instance
export const sharingSystem = new VimMasterSharingSystem();

// Export individual functions for direct use
export const generateCard = (achievement) => sharingSystem.generateCard(achievement);
export const generateProfileCard = () => sharingSystem.generateProfileCard();
export const generateAsciiLogo = () => sharingSystem.generateAsciiLogo();
export const downloadAchievementCard = (achievement) => sharingSystem.downloadAchievementCard(achievement);
export const shareAchievementCard = (achievement, platform) => sharingSystem.shareAchievementCard(achievement, platform);
