// Basis-Klasse für UI-Screens
class UIScreen {
    constructor(game) {
        this.game = game;
        this.container = new PIXI.Container();
        this.isVisible = false;
    }
    
    show() {
        this.container.visible = true;
        this.isVisible = true;
    }
    
    hide() {
        this.container.visible = false;
        this.isVisible = false;
    }
    
    createBackground(color = 0x222244, alpha = 1) {
        const bg = new PIXI.Graphics();
        bg.beginFill(color, alpha);
        bg.drawRect(0, 0, this.game.app.screen.width, this.game.app.screen.height);
        bg.endFill();
        return bg;
    }
    
    createText(text, style, x, y) {
        const textObj = new PIXI.Text(text, style);
        textObj.anchor.set(0.5);
        textObj.x = x;
        textObj.y = y;
        return textObj;
    }
    
    createButton(text, style, x, y, callback) {
        const button = this.createText(text, style, x, y);
        button.interactive = true;
        button.buttonMode = true;
        button.on('pointerdown', callback);
        
        // Hover-Effekte
        button.on('pointerover', () => {
            button.scale.set(1.1);
        });
        button.on('pointerout', () => {
            button.scale.set(1.0);
        });
        
        return button;
    }
}

// Start-Bildschirm
class StartScreen extends UIScreen {
    constructor(game) {
        super(game);
        this.createElements();
    }
    
    createElements() {
        // Hintergrund
        const bg = this.createBackground(0x1a1a2e);
        this.container.addChild(bg);
        
        // Titel
        const title = this.createText("KosmosRaider", {
            fontSize: 48,
            fill: 0xffffff,
            fontWeight: 'bold',
            stroke: 0x000000,
            strokeThickness: 4
        }, this.game.app.screen.width / 2, 150);
        this.container.addChild(title);
        
        // Untertitel
        const subtitle = this.createText("Verteidige die Erde vor der UFO-Invasion!", {
            fontSize: 20,
            fill: 0xcccccc,
            fontStyle: 'italic'
        }, this.game.app.screen.width / 2, 200);
        this.container.addChild(subtitle);
        
        // Start-Button
        const startButton = this.createButton("SPIEL STARTEN", {
            fontSize: 36,
            fill: 0x00ff00,
            fontWeight: 'bold'
        }, this.game.app.screen.width / 2, 300, () => {
            this.game.startGame();
        });
        this.container.addChild(startButton);
        
        // Steuerung-Anweisungen
        const controls = this.createText(
            "Steuerung: Pfeiltasten = Bewegen, Leertaste = Schießen",
            {
                fontSize: 16,
                fill: 0x888888
            },
            this.game.app.screen.width / 2,
            400
        );
        this.container.addChild(controls);
        
        // Animierter Hintergrund-Effekt
        this.createAnimatedStars();
    }
    
    createAnimatedStars() {
        const stars = [];
        for (let i = 0; i < 50; i++) {
            const star = new PIXI.Graphics();
            star.beginFill(0xffffff, Math.random() * 0.8 + 0.2);
            star.drawCircle(0, 0, Math.random() * 2 + 1);
            star.endFill();
            
            star.x = Math.random() * this.game.app.screen.width;
            star.y = Math.random() * this.game.app.screen.height;
            
            this.container.addChild(star);
            stars.push(star);
        }
        
        // Animation der Sterne
        this.game.app.ticker.add(() => {
            if (!this.isVisible) return;
            
            stars.forEach(star => {
                star.alpha = 0.2 + Math.sin(Date.now() * 0.001 + star.x * 0.01) * 0.3;
            });
        });
    }
}

// Game Over Bildschirm
class GameOverScreen extends UIScreen {
    constructor(game) {
        super(game);
        this.createElements();
        this.hide();
    }
    
    createElements() {
        // Halbtransparenter Hintergrund
        const bg = this.createBackground(0x000000, 0.8);
        this.container.addChild(bg);
        
        // Game Over Text
        this.gameOverText = this.createText("GAME OVER", {
            fontSize: 48,
            fill: 0xff3333,
            fontWeight: 'bold',
            stroke: 0x000000,
            strokeThickness: 4
        }, this.game.app.screen.width / 2, 200);
        this.container.addChild(this.gameOverText);
        
        // Score Text
        this.finalScoreText = this.createText("", {
            fontSize: 32,
            fill: 0xffffff,
            fontWeight: 'bold'
        }, this.game.app.screen.width / 2, 260);
        this.container.addChild(this.finalScoreText);
        
        // Restart Button
        const restartButton = this.createButton("NOCHMAL SPIELEN", {
            fontSize: 28,
            fill: 0x00ff00,
            fontWeight: 'bold'
        }, this.game.app.screen.width / 2, 350, () => {
            this.game.restartGame();
        });
        this.container.addChild(restartButton);
        
        // Menu Button
        const menuButton = this.createButton("HAUPTMENÜ", {
            fontSize: 24,
            fill: 0x0099ff,
            fontWeight: 'bold'
        }, this.game.app.screen.width / 2, 400, () => {
            this.game.showStartScreen();
        });
        this.container.addChild(menuButton);
    }
    
    show(finalScore) {
        super.show();
        this.finalScoreText.text = `Endpunktzahl: ${finalScore}`;
        
        // Animation beim Anzeigen
        this.animateIn();
    }
    
    animateIn() {
        // Fade-In Animation
        this.container.alpha = 0;
        
        const fadeIn = () => {
            this.container.alpha += 0.05;
            if (this.container.alpha < 1) {
                requestAnimationFrame(fadeIn);
            }
        };
        fadeIn();
        
        // Shake-Effekt für Game Over Text
        let shakeCount = 0;
        const originalX = this.gameOverText.x;
        
        const shake = () => {
            if (shakeCount < 20) {
                this.gameOverText.x = originalX + (Math.random() - 0.5) * 10;
                shakeCount++;
                setTimeout(shake, 50);
            } else {
                this.gameOverText.x = originalX;
            }
        };
        shake();
    }
}

// Pause-Bildschirm (Bonus)
class PauseScreen extends UIScreen {
    constructor(game) {
        super(game);
        this.createElements();
        this.hide();
    }
    
    createElements() {
        // Halbtransparenter Hintergrund
        const bg = this.createBackground(0x000000, 0.6);
        this.container.addChild(bg);
        
        // Pause Text
        const pauseText = this.createText("PAUSIERT", {
            fontSize: 48,
            fill: 0xffff00,
            fontWeight: 'bold'
        }, this.game.app.screen.width / 2, 250);
        this.container.addChild(pauseText);
        
        // Fortsetzung-Hinweis
        const continueText = this.createText("Drücke ESC zum Fortsetzen", {
            fontSize: 24,
            fill: 0xffffff
        }, this.game.app.screen.width / 2, 320);
        this.container.addChild(continueText);
    }
}

// HUD (Heads-Up Display) für das Spiel
class GameHUD {
    constructor(game) {
        this.game = game;
        this.container = new PIXI.Container();
        this.createElements();
    }
    
    createElements() {
        // Score-Anzeige (wird bereits in Game-Klasse erstellt)
        
        // Health-Bar (für zukünftige Erweiterung)
        this.createHealthBar();
        
        // Mini-Map (für zukünftige Erweiterung)
        // this.createMiniMap();
    }
    
    createHealthBar() {
        // Platzhalter für Health-System
        const healthBg = new PIXI.Graphics();
        healthBg.beginFill(0x333333);
        healthBg.drawRect(10, 50, 200, 20);
        healthBg.endFill();
        
        const healthBar = new PIXI.Graphics();
        healthBar.beginFill(0x00ff00);
        healthBar.drawRect(12, 52, 196, 16);
        healthBar.endFill();
        
        this.container.addChild(healthBg);
        this.container.addChild(healthBar);
        
        // Vorerst verstecken
        this.container.visible = false;
    }
    
    show() {
        this.container.visible = true;
    }
    
    hide() {
        this.container.visible = false;
    }
}