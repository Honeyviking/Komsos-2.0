// Basis-Klasse für alle Spielobjekte
class GameObject {
    constructor(x, y, texture) {
        this.sprite = PIXI.Sprite.from(texture);
        this.sprite.x = x;
        this.sprite.y = y;
        this.isAlive = true;
        this.velocity = { x: 0, y: 0 };
    }
    
    update() {
        // Basis-Update: Position basierend auf Geschwindigkeit
        this.sprite.x += this.velocity.x;
        this.sprite.y += this.velocity.y;
        
        // Objekt zerstören wenn außerhalb des Bildschirms
        if (this.isOutOfBounds()) {
            this.destroy();
        }
    }
    
    isOutOfBounds() {
        return this.sprite.x < -100 || 
               this.sprite.x > 900 || 
               this.sprite.y < -100 || 
               this.sprite.y > 700;
    }
    
    destroy() {
        this.isAlive = false;
    }
    
    setScale(scaleX, scaleY = scaleX) {
        this.sprite.scale.set(scaleX, scaleY);
    }
}

// Rocket-Klasse
class Rocket extends GameObject {
    constructor(x, y) {
        super(x, y, 'assets/rocket1.png');
        this.setScale(0.3);
        this.speed = 5;
    }
    
    update() {
        // Rocket bewegt sich nicht automatisch
        // Bewegung wird durch Input Handler gesteuert
    }
    
    moveLeft() {
        this.sprite.x -= this.speed;
        this.sprite.x = Math.max(0, this.sprite.x);
    }
    
    moveRight() {
        this.sprite.x += this.speed;
        this.sprite.x = Math.min(800 - this.sprite.width, this.sprite.x);
    }
    
    moveUp() {
        this.sprite.y -= this.speed;
        this.sprite.y = Math.max(0, this.sprite.y);
    }
    
    moveDown() {
        this.sprite.y += this.speed;
        this.sprite.y = Math.min(600 - this.sprite.height, this.sprite.y);
    }
}

// UFO-Klasse
class UFO extends GameObject {
    constructor(x, y) {
        const ufoType = Math.random() > 0.5 ? 1 : 2;
        super(x, y, `assets/ufo${ufoType}.png`);
        this.setScale(0.1);
        this.velocity.y = 1 + Math.random() * 2; // Zufällige Geschwindigkeit
    }
    
    update() {
        super.update();
        
        // Optional: Seitliche Bewegung hinzufügen
        this.sprite.x += Math.sin(this.sprite.y * 0.01) * 0.5;
    }
}

// Bullet-Klasse
class Bullet extends GameObject {
    constructor(x, y) {
        super(x, y, 'assets/bullet.png');
        this.setScale(0.05);
        this.velocity.y = -10; // Bewegt sich nach oben
    }
    
    update() {
        super.update();
    }
}

// Explosion-Klasse
class Explosion extends GameObject {
    constructor(x, y, type = 'ufo') {
        const texture = type === 'ufo' ? 'assets/explosion.png' : 'assets/bang.jpg';
        super(x, y, texture);
        this.setScale(0.1);
        
        // Explosion hat eine Lebensdauer
        this.lifetime = 1000; // 1 Sekunde
        this.timer = 0;
        
        // Animation
        this.animationSpeed = 0.02;
        this.maxScale = 0.15;
    }
    
    update() {
        this.timer += 16; // Ungefähr 60 FPS
        
        // Animation: Größe ändern
        const progress = this.timer / this.lifetime;
        const scale = 0.1 + (this.maxScale - 0.1) * Math.sin(progress * Math.PI);
        this.setScale(scale);
        
        // Explosion nach Lebensdauer zerstören
        if (this.timer >= this.lifetime) {
            this.destroy();
        }
    }
}

// Partikel-Klasse für erweiterte Effekte
class Particle extends GameObject {
    constructor(x, y, color = 0xffffff) {
        // Einfacher Partikel als Grafik
        const graphics = new PIXI.Graphics();
        graphics.beginFill(color);
        graphics.drawCircle(0, 0, 2);
        graphics.endFill();
        
        // Textur aus Graphics erstellen
        const texture = app.renderer.generateTexture(graphics);
        super(x, y, texture);
        
        // Zufällige Geschwindigkeit
        this.velocity.x = (Math.random() - 0.5) * 4;
        this.velocity.y = (Math.random() - 0.5) * 4;
        
        // Lebensdauer
        this.lifetime = 500 + Math.random() * 500;
        this.timer = 0;
        
        // Alpha-Fade
        this.initialAlpha = 1;
    }
    
    update() {
        super.update();
        
        this.timer += 16;
        
        // Alpha-Fade
        const progress = this.timer / this.lifetime;
        this.sprite.alpha = this.initialAlpha * (1 - progress);
        
        // Partikel nach Lebensdauer zerstören
        if (this.timer >= this.lifetime) {
            this.destroy();
        }
    }
}

// Partikel-System für Effekte
class ParticleSystem {
    constructor(game) {
        this.game = game;
        this.particles = [];
    }
    
    createExplosion(x, y, count = 10, color = 0xffffff) {
        for (let i = 0; i < count; i++) {
            const particle = new Particle(x, y, color);
            this.particles.push(particle);
            this.game.addGameObject(particle);
        }
    }
    
    update() {
        // Tote Partikel entfernen
        this.particles = this.particles.filter(particle => particle.isAlive);
    }
}