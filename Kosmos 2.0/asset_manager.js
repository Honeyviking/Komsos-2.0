class AssetManager {
    constructor() {
        this.assets = {};
        this.loadedAssets = 0;
        this.totalAssets = 0;
        this.onProgress = null;
        this.onComplete = null;
        
        // Asset-Liste definieren
        this.assetList = {
            'rocket': 'assets/rocket1.png',
            'ufo1': 'assets/ufo1.png',
            'ufo2': 'assets/ufo2.png',
            'bullet': 'assets/bullet.png',
            'explosion': 'assets/explosion.png',
            'bang': 'assets/bang.jpg'
        };
    }
    
    async loadAssets() {
        return new Promise((resolve, reject) => {
            const assetNames = Object.keys(this.assetList);
            this.totalAssets = assetNames.length;
            
            if (this.totalAssets === 0) {
                resolve();
                return;
            }
            
            this.onComplete = resolve;
            
            // Lade alle Assets
            assetNames.forEach(name => {
                this.loadAsset(name, this.assetList[name]);
            });
        });
    }
    
    loadAsset(name, url) {
        const texture = PIXI.Texture.from(url);
        
        // Event Listener für erfolgreiches Laden
        const onLoad = () => {
            this.assets[name] = texture;
            this.loadedAssets++;
            
            // Progress-Callback
            if (this.onProgress) {
                this.onProgress(this.loadedAssets, this.totalAssets);
            }
            
            // Vollständig geladen?
            if (this.loadedAssets >= this.totalAssets) {
                if (this.onComplete) {
                    this.onComplete();
                }
            }
            
            texture.off('loaded', onLoad);
            texture.off('error', onError);
        };
        
        // Event Listener für Fehler
        const onError = (error) => {
            console.warn(`Asset '${name}' konnte nicht geladen werden:`, error);
            // Fallback-Textur erstellen
            this.assets[name] = this.createFallbackTexture(name);
            this.loadedAssets++;
            
            if (this.loadedAssets >= this.totalAssets) {
                if (this.onComplete) {
                    this.onComplete();
                }
            }
            
            texture.off('loaded', onLoad);
            texture.off('error', onError);
        };
        
        // Events registrieren
        if (texture.baseTexture.valid) {
            // Bereits geladen
            onLoad();
        } else {
            texture.on('loaded', onLoad);
            texture.on('error', onError);
        }
    }
    
    createFallbackTexture(assetName) {
        const graphics = new PIXI.Graphics();
        
        switch(assetName) {
            case 'rocket':
                graphics.beginFill(0x00ff00);
                graphics.drawPolygon([0, 0, 20, 40, 40, 40, 20, 0]);
                graphics.endFill();
                break;
                
            case 'ufo1':
            case 'ufo2':
                graphics.beginFill(0xff0000);
                graphics.drawEllipse(20, 20, 20, 10);
                graphics.endFill();
                break;
                
            case 'bullet':
                graphics.beginFill(0xffff00);
                graphics.drawCircle(5, 5, 3);
                graphics.endFill();
                break;
                
            case 'explosion':
            case 'bang':
                graphics.beginFill(0xff6600);
                graphics.drawCircle(15, 15, 15);
                graphics.endFill();
                break;
                
            default:
                graphics.beginFill(0xff00ff);
                graphics.drawRect(0, 0, 32, 32);
                graphics.endFill();
        }
        
        return PIXI.Texture.from(graphics);
    }
    
    getAsset(name) {
        return this.assets[name] || this.createFallbackTexture(name);
    }
    
    setProgressCallback(callback) {
        this.onProgress = callback;
    }
    
    addAsset(name, url) {
        this.assetList[name] = url;
    }
    
    getLoadingProgress() {
        return this.totalAssets > 0 ? this.loadedAssets / this.totalAssets : 1;
    }
}

// Loading Screen Klasse
class LoadingScreen {
    constructor(game) {
        this.game = game;
        this.container = new PIXI.Container();
        this.createElements();
    }
    
    createElements() {
        // Hintergrund
        const bg = new PIXI.Graphics();
        bg.beginFill(0x000000);
        bg.drawRect(0, 0, this.game.app.screen.width, this.game.app.screen.height);
        bg.endFill();
        this.container.addChild(bg);
        
        // Loading Text
        this.loadingText = new PIXI.Text("Lade Assets...", {
            fontSize: 32,
            fill: 0xffffff,
            fontFamily: 'Arial'
        });
        this.loadingText.anchor.set(0.5);
        this.loadingText.x = this.game.app.screen.width / 2;
        this.loadingText.y = this.game.app.screen.height / 2 - 30;
        this.container.addChild(this.loadingText);
        
        // Progress Bar Background
        const progressBg = new PIXI.Graphics();
        progressBg.beginFill(0x333333);
        progressBg.drawRect(0, 0, 300, 20);
        progressBg.endFill();
        progressBg.x = this.game.app.screen.width / 2 - 150;
        progressBg.y = this.game.app.screen.height / 2 + 20;
        this.container.addChild(progressBg);
        
        // Progress Bar
        this.progressBar = new PIXI.Graphics();
        this.progressBar.x = this.game.app.screen.width / 2 - 150;
        this.progressBar.y = this.game.app.screen.height / 2 + 20;
        this.container.addChild(this.progressBar);
        
        // Progress Text
        this.progressText = new PIXI.Text("0%", {
            fontSize: 16,
            fill: 0xffffff
        });
        this.progressText.anchor.set(0.5);
        this.progressText.x = this.game.app.screen.width / 2;
        this.progressText.y = this.game.app.screen.height / 2 + 60;
        this.container.addChild(this.progressText);
    }
    
    updateProgress(loaded, total) {
        const progress = loaded / total;
        const progressWidth = 300 * progress;
        
        // Progress Bar zeichnen
        this.progressBar.clear();
        this.progressBar.beginFill(0x00ff00);
        this.progressBar.drawRect(0, 0, progressWidth, 20);
        this.progressBar.endFill();
        
        // Progress Text aktualisieren
        this.progressText.text = Math.round(progress * 100) + "%";
        
        // Loading Text Animation
        const dots = '.'.repeat((Math.floor(Date.now() / 500) % 4));
        this.loadingText.text = "Lade Assets" + dots;
    }
    
    show() {
        this.container.visible = true;
    }
    
    hide() {
        this.container.visible = false;
    }
}