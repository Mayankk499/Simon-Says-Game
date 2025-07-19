class SimonGame {
            constructor() {
                this.sequence = [];
                this.playerSequence = [];
                this.level = 0;
                this.isPlaying = false;
                this.isShowingSequence = false;
                
                this.buttons = document.querySelectorAll('.simon-button');
                this.startBtn = document.getElementById('startBtn');
                this.resetBtn = document.getElementById('resetBtn');
                this.scoreElement = document.getElementById('score');
                this.messageElement = document.getElementById('message');
                
                this.colors = ['red', 'blue', 'green', 'yellow'];
                this.sounds = this.createSounds();
                
                this.init();
            }
            
            createSounds() {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const frequencies = { red: 220, blue: 277, green: 330, yellow: 415 };
                
                return Object.keys(frequencies).reduce((sounds, color) => {
                    sounds[color] = (duration = 0.3) => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.value = frequencies[color];
                        oscillator.type = 'sine';
                        
                        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + duration);
                    };
                    return sounds;
                }, {});
            }
            
            init() {
                this.buttons.forEach(button => {
                    button.addEventListener('click', (e) => this.handleButtonClick(e));
                });
                
                this.startBtn.addEventListener('click', () => this.startGame());
                this.resetBtn.addEventListener('click', () => this.resetGame());
            }
            
            startGame() {
                this.isPlaying = true;
                this.sequence = [];
                this.level = 0;
                this.updateScore();
                this.startBtn.disabled = true;
                this.messageElement.textContent = 'Watch carefully!';
                this.nextRound();
            }
            
            nextRound() {
                this.level++;
                this.playerSequence = [];
                this.addToSequence();
                this.showSequence();
            }
            
            addToSequence() {
                const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
                this.sequence.push(randomColor);
            }
            
            async showSequence() {
                this.isShowingSequence = true;
                this.setButtonsEnabled(false);
                
                await this.delay(1000);
                
                for (let i = 0; i < this.sequence.length; i++) {
                    const color = this.sequence[i];
                    await this.highlightButton(color);
                    await this.delay(200);
                }
                
                this.isShowingSequence = false;
                this.setButtonsEnabled(true);
                this.messageElement.textContent = 'Your turn! Repeat the sequence.';
            }
            
            async highlightButton(color) {
                const button = document.getElementById(color);
                button.classList.add('active');
                this.sounds[color]();
                
                await this.delay(500);
                button.classList.remove('active');
            }
            
            handleButtonClick(e) {
                if (!this.isPlaying || this.isShowingSequence) return;
                
                const clickedColor = e.target.dataset.color;
                this.playerSequence.push(clickedColor);
                
                // Visual and audio feedback
                e.target.classList.add('pulse');
                this.sounds[clickedColor]();
                setTimeout(() => e.target.classList.remove('pulse'), 500);
                
                this.checkPlayerInput();
            }
            
            checkPlayerInput() {
                const currentIndex = this.playerSequence.length - 1;
                const isCorrect = this.playerSequence[currentIndex] === this.sequence[currentIndex];
                
                if (!isCorrect) {
                    this.gameOver();
                    return;
                }
                
                if (this.playerSequence.length === this.sequence.length) {
                    this.updateScore();
                    this.messageElement.textContent = 'Correct! Get ready for the next round...';
                    setTimeout(() => this.nextRound(), 1500);
                }
            }
            
            gameOver() {
                this.isPlaying = false;
                this.messageElement.textContent = `Game Over! Final Score: ${this.level - 1}`;
                this.startBtn.disabled = false;
                this.startBtn.textContent = 'Play Again';
                
                // Flash all buttons red
                this.buttons.forEach(button => {
                    button.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
                });
                
                setTimeout(() => {
                    this.resetButtonColors();
                }, 1000);
            }
            
            resetButtonColors() {
                const colors = {
                    red: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                    blue: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
                    green: 'linear-gradient(135deg, #45b7d1, #96c93d)',
                    yellow: 'linear-gradient(135deg, #f9ca24, #f0932b)'
                };
                
                this.buttons.forEach(button => {
                    const color = button.dataset.color;
                    button.style.background = colors[color];
                });
            }
            
            resetGame() {
                this.isPlaying = false;
                this.isShowingSequence = false;
                this.sequence = [];
                this.playerSequence = [];
                this.level = 0;
                this.updateScore();
                this.messageElement.textContent = 'Click Start to begin!';
                this.startBtn.disabled = false;
                this.startBtn.textContent = 'Start Game';
                this.setButtonsEnabled(true);
                this.resetButtonColors();
            }
            
            updateScore() {
                this.scoreElement.textContent = Math.max(0, this.level - 1);
            }
            
            setButtonsEnabled(enabled) {
                this.buttons.forEach(button => {
                    button.disabled = !enabled;
                });
            }
            
            delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
        }
        
        // Initialize the game when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            new SimonGame();
        });