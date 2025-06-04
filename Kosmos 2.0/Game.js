class Game {
    constructor() {
        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0x1a1a2e
        });
        
        this.score = 0;
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'
        this.gameObjects = [];
        this.intervals = [];
        
        // UI Elemente
        this.scoreText = null;
        this.startScreen = null;
        this.gameOverScreen = null;
        
        // Spiel-Entitäten
        this.rocket = null;
        this.ufos = [];
        this.bullets = [];
        
        // Input Handler
        this.inputHandler = new InputHandler(this);
        
        // Asset Manager
        this.assetManager = new AssetManager();
        
        this.init();
    }
    
    async init() {
        document.body.appendChild(this.app.view);
        
        // Assets laden
        await this.assetManager.loadAssets();
        
        // UI initialisieren
        this.initUI();
        
        // Event Listeners
        this.setupEventListeners();
        
        // Game Loop starten
        this.startGameLoop();
        
        // Startscreen anzeigen
        this.showStartScreen();
    }
    
    initUI() {
        this.createScoreDisplay();
        this.createStartScreen();
        this.createGameOverScreen();
    }
    
    createScoreDisplay() {
        this.scoreText = new PIXI.Text("Score: 0", {
            fontSize: 24,
            fill: 0xffffff,
            fontFamily: 'Arial'
        });
        this.scoreText.x = 10;
        this.scoreText.y = 10;
        this.scoreText.visible = false;
        this.app.stage.addChild(this.scoreText);
    }
    
    createStartScreen() {
        this.startScreen = new StartScreen(this);
        this.app.stage.addChild(this.startScreen.container);
    }
    
    createGameOverScreen() {
        this.gameOverScreen = new GameOverScreen(this);
        this.app.stage.addChild(this.gameOverScreen.container);
    }
    
    setupEventListeners() {
        // Input Handler bereits im Konstruktor initialisiert
        this.inputHandler.enable();
    }
    
    startGameLoop() {
        this.app.ticker.add(() => {
            this.update();
        });
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Input verarbeiten
        this.inputHandler.update();
        
        // Alle Spielobjekte aktualisieren
        this.gameObjects.forEach(obj => {
            if (obj.update) obj.update();
        });
        
        // Kollisionen prüfen
        this.checkCollisions();
        
        // Tote Objekte entfernen
        this.cleanupObjects();
        
        // UI aktualisieren
        this.updateUI();
    }
    
    checkCollisions() {
        // Bullet-UFO Kollisionen
        this.bullets.forEach(bullet => {
            this.ufos.forEach(ufo => {
                if (bullet.isAlive && ufo.isAlive && this.isColliding(bullet, ufo)) {
                    this.handleBulletUfoCollision(bullet, ufo);
                }
            });
        });
        
        // Rocket-UFO Kollisionen
        if (this.rocket && this.rocket.isAlive) {
            this.ufos.forEach(ufo => {
                if (ufo.isAlive && this.isColliding(this.rocket, ufo)) {
                    this.handleRocketUfoCollision();
                }
            });
        }
    }
    
    handleBulletUfoCollision(bullet, ufo) {
        // Explosion erstellen
        const explosion = new Explosion(ufo.sprite.x, ufo.sprite.y, 'ufo');
        this.addGameObject(explosion);
        
        // Objekte zerstören
        bullet.destroy();
        ufo.destroy();
        
        // Score erhöhen
        this.increaseScore();
    }
    
    handleRocketUfoCollision() {
        // Rocket Explosion
        const explosion = new Explosion(this.rocket.sprite.x, this.rocket.sprite.y, 'rocket');
        this.addGameObject(explosion);
        
        // Rocket zerstören
        this.rocket.destroy();
        
        // Game Over
        this.gameOver();
    }
    
    isColliding(obj1, obj2) {
        const bounds1 = obj1.sprite.getBounds();
        const bounds2 = obj2.sprite.getBounds();
        
        return bounds1.x < bounds2.x + bounds2.width &&
               bounds1.x + bounds1.width > bounds2.x &&
               bounds1.y < bounds2.y + bounds2.height &&
               bounds1.y + bounds1.height > bounds2.y;
    }
    
    cleanupObjects() {
        this.gameObjects = this.gameObjects.filter(obj => {
            if (!obj.isAlive) {
                this.app.stage.removeChild(obj.sprite);
                return false;
            }
            return true;
        });
        
        this.bullets = this.bullets.filter(bullet => bullet.isAlive);
        this.ufos = this.ufos.filter(ufo => ufo.isAlive);
    }
    
    addGameObject(obj) {
        this.gameObjects.push(obj);
        this.app.stage.addChild(obj.sprite);
        
        // Spezielle Listen für bestimmte Objekttypen
        if (obj instanceof Bullet) {
            this.bullets.push(obj);
        } else if (obj instanceof UFO) {
            this.ufos.push(obj);
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        
        // Screens verwalten
        this.startScreen.hide();
        this.gameOverScreen.hide();
        this.scoreText.visible = true;
        
        // Alte Objekte entfernen
        this.clearGameObjects();
        
        // Rocket erstellen
        this.rocket = new Rocket(400, 500);
        this.addGameObject(this.rocket);
        
        // UFO Spawning starten
        this.startUFOSpawning();
    }
    
    startUFOSpawning() {
        const spawnInterval = setInterval(() => {
            if (this.gameState !== 'playing') {
                clearInterval(spawnInterval);
                return;
            }
            
            const ufo = new UFO(
                Math.random() * (this.app.screen.width - 100),
                -50
            );
            this.addGameObject(ufo);
        }, 1000);
        
        this.intervals.push(spawnInterval);
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.scoreText.visible = false;
        this.gameOverScreen.show(this.score);
        this.clearIntervals();
    }
    
    restartGame() {
        this.clearGameObjects();
        this.clearIntervals();
        this.startGame();
    }
    
    showStartScreen() {
        this.gameState = 'start';
        this.startScreen.show();
        this.gameOverScreen.hide();
        this.scoreText.visible = false;
    }
    
    increaseScore() {
        this.score++;
        this.updateUI();
    }
    
    updateUI() {
        this.scoreText.text = `Score: ${this.score}`;
    }
    
    clearGameObjects() {
        this.gameObjects.forEach(obj => {
            this.app.stage.removeChild(obj.sprite);
        });
        this.gameObjects = [];
        this.bullets = [];
        this.ufos = [];
        this.rocket = null;
    }
    
    clearIntervals() {
        this.intervals.forEach(clearInterval);
        this.intervals = [];
    }
    
    shoot() {
        if (!this.rocket || !this.rocket.isAlive) return;
        
        const bullet = new Bullet(
            this.rocket.sprite.x + this.rocket.sprite.width / 2,
            this.rocket.sprite.y
        );
        this.addGameObject(bullet);
    }
}