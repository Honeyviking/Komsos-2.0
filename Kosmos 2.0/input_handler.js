class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.enabled = false;
        
        // Konfiguration
        this.moveSpeed = 5;
        this.shootCooldown = 200; // Millisekunden zwischen Schüssen
        this.lastShot = 0;
        
        // Key-Mappings
        this.keyMap = {
            LEFT: [37, 65],     // Pfeil links, A
            RIGHT: [39, 68],    // Pfeil rechts, D
            UP: [38, 87],       // Pfeil hoch, W
            DOWN: [40, 83],     // Pfeil runter, S
            SHOOT: [32],        // Leertaste
            PAUSE: [27, 80]     // ESC, P
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keydown Events
        document.addEventListener('keydown', (e) => {
            this.keys[e.keyCode] = true;
            this.handleKeyDown(e);
        });
        
        // Keyup Events
        document.addEventListener('keyup', (e) => {
            this.keys[e.keyCode] = false;
            this.handleKeyUp(e);
        });
        
        // Verhindere Standard-Verhalten für bestimmte Tasten
        document.addEventListener('keydown', (e) => {
            if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
                e.preventDefault();
            }
        });
    }
    
    handleKeyDown(e) {
        if (!this.enabled) return;
        
        // Spezielle einmalige Aktionen
        if (this.isKeyPressed('SHOOT')) {
            this.handleShoot();
        }
        
        if (this.isKeyPressed('PAUSE')) {
            this.handlePause();
        }
    }
    
    handleKeyUp(e) {
        // Hier können spezifische Key-Up Events behandelt werden
    }
    
    update() {
        if (!this.enabled || this.game.gameState !== 'playing') return;
        
        // Kontinuierliche Bewegung
        this.handleMovement();
    }
    
    handleMovement() {
        const rocket = this.game.rocket;
        if (!rocket || !rocket.isAlive) return;
        
        // Bewegung in alle Richtungen
        if (this.isKeyDown('LEFT')) {
            rocket.moveLeft();
        }
        if (this.isKeyDown('RIGHT')) {
            rocket.moveRight();
        }
        if (this.isKeyDown('UP')) {
            rocket.moveUp();
        }
        if (this.isKeyDown('DOWN')) {
            rocket.moveDown();
        }
    }
    
    handleShoot() {
        const currentTime = Date.now();
        
        // Cooldown prüfen
        if (currentTime - this.lastShot < this.shootCooldown) {
            return;
        }
        
        this.game.shoot();
        this.lastShot = currentTime;
    }
    
    handlePause() {
        // TODO: Pause-Funktionalität implementieren
        console.log('Pause gedrückt');
    }
    
    // Hilfsmethoden für Key-Checking
    isKeyDown(action) {
        return this.keyMap[action].some(key => this.keys[key]);
    }
    
    isKeyPressed(action) {
        return this.keyMap[action].some(key => this.keys[key]);
    }
    
    enable() {
        this.enabled = true;
    }
    
    disable() {
        this.enabled = false;
    }
    
    // Konfiguration ändern
    setMoveSpeed(speed) {
        this.moveSpeed = speed;
    }
    
    setShootCooldown(cooldown) {
        this.shootCooldown = cooldown;
    }
    
    // Custom Key-Mapping hinzufügen
    addKeyMapping(action, keyCodes) {
        this.keyMap[action] = keyCodes;
    }
}