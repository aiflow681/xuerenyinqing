/**
 * 樱花花园 - Sakura Garden Game
 * 使用 Phaser 3 引擎开发
 */

// 游戏配置
const gameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#ffd6e8',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 100 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// 游戏变量
let player;
let cursors;
let score = 0;
let scoreText;
let gameOver = false;
let fallingObjects;
let spawnTimer;
let lives = 5;
let livesText;

// 启动游戏
const game = new Phaser.Game(gameConfig);

function preload() {
    // 由于我们使用代码生成图形，这里不需要加载外部资源
    // 所有图形将在 create 函数中动态生成
}

function create() {
    // 创建背景
    createBackground(this);
    
    // 创建玩家（熊猫）
    player = createPlayer(this);
    
    // 创建掉落物体组
    fallingObjects = this.physics.add.group();
    
    // 创建UI
    scoreText = this.add.text(16, 16, '分数: 0', {
        fontSize: '32px',
        fill: '#ff1493',
        fontFamily: 'Arial',
        stroke: '#ffffff',
        strokeThickness: 4
    });
    
    livesText = this.add.text(16, 56, '生命: ❤❤❤❤❤', {
        fontSize: '28px',
        fill: '#ff1493',
        fontFamily: 'Arial'
    });
    
    // 设置输入
    cursors = this.input.keyboard.createCursorKeys();
    
    // 触摸/鼠标控制 - 熊猫跟随手指/鼠标
    this.input.on('pointermove', (pointer) => {
        if (!gameOver) {
            // 平滑移动到指针位置
            const targetX = Phaser.Math.Clamp(pointer.x, 50, 750);
            player.x = Phaser.Math.Linear(player.x, targetX, 0.3);
        }
    });
    
    // 点击时也立即移动
    this.input.on('pointerdown', (pointer) => {
        if (!gameOver) {
            const targetX = Phaser.Math.Clamp(pointer.x, 50, 750);
            player.x = targetX;
        }
    });
    
    // 定时生成掉落物体
    spawnTimer = this.time.addEvent({
        delay: 1000,
        callback: spawnFallingObject,
        callbackScope: this,
        loop: true
    });
    
    // 碰撞检测
    this.physics.add.overlap(player, fallingObjects, collectObject, null, this);
}

function update() {
    if (gameOver) {
        return;
    }
    
    // 键盘控制
    if (cursors && cursors.left && cursors.left.isDown) {
        player.x -= 5;
    } else if (cursors && cursors.right && cursors.right.isDown) {
        player.x += 5;
    }
    
    // 限制玩家移动范围
    if (player && player.x) {
        player.x = Phaser.Math.Clamp(player.x, 50, 750);
    }
    
    // 检查掉落物体是否超出屏幕
    if (fallingObjects && fallingObjects.children) {
        fallingObjects.children.entries.forEach((obj) => {
            if (obj && obj.y > 650) {
                // 只是销毁，不减生命（太难了）
                obj.destroy();
            }
        });
    }
}

function createBackground(scene) {
    // 创建渐变背景
    const graphics = scene.add.graphics();
    
    // 使用 Phaser 的渐变填充
    graphics.fillGradientStyle(0xffd6e8, 0xffd6e8, 0xff99cc, 0xff99cc, 1);
    graphics.fillRect(0, 0, 800, 600);
    
    // 添加樱花树装饰
    for (let i = 0; i < 3; i++) {
        drawCherryTree(scene, 100 + i * 300, 500);
    }
    
    // 添加飘落的花瓣背景动画
    for (let i = 0; i < 20; i++) {
        createFloatingPetal(scene);
    }
}

function drawCherryTree(scene, x, y) {
    const graphics = scene.add.graphics();
    
    // 树干
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(x - 10, y - 100, 20, 100);
    
    // 树冠（樱花）
    for (let i = 0; i < 15; i++) {
        const offsetX = Phaser.Math.Between(-40, 40);
        const offsetY = Phaser.Math.Between(-60, -20);
        const size = Phaser.Math.Between(15, 25);
        
        graphics.fillStyle(0xffb3d9, 0.7);
        graphics.fillCircle(x + offsetX, y - 100 + offsetY, size);
    }
}

function createFloatingPetal(scene) {
    const x = Phaser.Math.Between(0, 800);
    const y = Phaser.Math.Between(-100, 600);
    
    const petal = scene.add.graphics();
    petal.fillStyle(0xffb3d9, 0.6);
    petal.fillEllipse(0, 0, 8, 12);
    petal.x = x;
    petal.y = y;
    
    // 飘落动画
    scene.tweens.add({
        targets: petal,
        y: 700,
        x: x + Phaser.Math.Between(-50, 50),
        rotation: Phaser.Math.PI2,
        duration: Phaser.Math.Between(5000, 8000),
        ease: 'Sine.easeInOut',
        onComplete: () => {
            petal.destroy();
            createFloatingPetal(scene);
        }
    });
}

function createPlayer(scene) {
    // 创建熊猫角色
    const panda = scene.add.container(400, 520);
    
    // 身体
    const body = scene.add.graphics();
    body.fillStyle(0xffffff, 1);
    body.fillCircle(0, 0, 40);
    
    // 头
    const head = scene.add.graphics();
    head.fillStyle(0xffffff, 1);
    head.fillCircle(0, -50, 35);
    
    // 耳朵
    const leftEar = scene.add.graphics();
    leftEar.fillStyle(0x000000, 1);
    leftEar.fillCircle(-25, -70, 15);
    
    const rightEar = scene.add.graphics();
    rightEar.fillStyle(0x000000, 1);
    rightEar.fillCircle(25, -70, 15);
    
    // 眼睛
    const leftEye = scene.add.graphics();
    leftEye.fillStyle(0x000000, 1);
    leftEye.fillCircle(-12, -55, 8);
    leftEye.fillStyle(0xffffff, 1);
    leftEye.fillCircle(-10, -57, 3);
    
    const rightEye = scene.add.graphics();
    rightEye.fillStyle(0x000000, 1);
    rightEye.fillCircle(12, -55, 8);
    rightEye.fillStyle(0xffffff, 1);
    rightEye.fillCircle(14, -57, 3);
    
    // 鼻子
    const nose = scene.add.graphics();
    nose.fillStyle(0x000000, 1);
    nose.fillCircle(0, -45, 5);
    
    // 嘴巴
    const mouth = scene.add.graphics();
    mouth.lineStyle(2, 0x000000, 1);
    mouth.arc(0, -40, 8, 0, Math.PI, false);
    mouth.strokePath();
    
    // 手臂
    const leftArm = scene.add.graphics();
    leftArm.fillStyle(0xffffff, 1);
    leftArm.fillCircle(-35, 10, 15);
    
    const rightArm = scene.add.graphics();
    rightArm.fillStyle(0xffffff, 1);
    rightArm.fillCircle(35, 10, 15);
    
    panda.add([body, leftArm, rightArm, head, leftEar, rightEar, leftEye, rightEye, nose, mouth]);
    
    // 添加物理
    scene.physics.add.existing(panda);
    panda.body.setCollideWorldBounds(true);
    panda.body.setSize(80, 80);
    
    // 添加摇摆动画
    scene.tweens.add({
        targets: panda,
        angle: -5,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    return panda;
}

function spawnFallingObject() {
    if (gameOver) return;
    
    const x = Phaser.Math.Between(50, 750);
    const type = Phaser.Math.Between(0, 100);
    
    let obj;
    
    if (type < 40) {
        // 40% 概率生成樱花花瓣（粉色）
        obj = createSakuraPetal(this, x);
        obj.setData('type', 'good');
        obj.setData('points', 10);
    } else if (type < 65) {
        // 25% 概率生成金币（黄色）
        obj = createGoldCoin(this, x);
        obj.setData('type', 'good');
        obj.setData('points', 20);
    } else if (type < 85) {
        // 20% 概率生成蝴蝶（紫色）
        obj = createButterfly(this, x);
        obj.setData('type', 'good');
        obj.setData('points', 15);
    } else if (type < 95) {
        // 10% 概率生成枯叶（棕色，减分）
        obj = createBadLeaf(this, x);
        obj.setData('type', 'bad');
        obj.setData('points', -10);
    } else {
        // 5% 概率生成炸弹X（红色，致命）
        obj = createBomb(this, x);
        obj.setData('type', 'deadly');
        obj.setData('points', 0);
    }
    
    fallingObjects.add(obj);
    
    // 设置下落速度（更慢）
    if (obj.body) {
        obj.body.setVelocityY(Phaser.Math.Between(80, 150));
    }
}

function createSakuraPetal(scene, x) {
    const petal = scene.add.graphics();
    
    // 明亮的粉色花瓣
    petal.fillStyle(0xff69b4, 1);
    petal.fillEllipse(0, 0, 14, 20);
    
    // 白色中心
    petal.fillStyle(0xffffff, 0.8);
    petal.fillEllipse(0, 0, 7, 10);
    
    // 粉色边缘
    petal.lineStyle(2, 0xff1493, 1);
    petal.strokeEllipse(0, 0, 14, 20);
    
    petal.x = x;
    petal.y = -20;
    
    scene.physics.add.existing(petal);
    petal.body.setSize(24, 24);
    
    // 旋转动画
    scene.tweens.add({
        targets: petal,
        rotation: Phaser.Math.PI2,
        duration: 2000,
        repeat: -1
    });
    
    return petal;
}

function createGoldCoin(scene, x) {
    const coin = scene.add.graphics();
    
    // 金黄色圆形
    coin.fillStyle(0xffd700, 1);
    coin.fillCircle(0, 0, 15);
    
    // 橙色边缘
    coin.lineStyle(3, 0xff8c00, 1);
    coin.strokeCircle(0, 0, 15);
    
    // 内部高光
    coin.fillStyle(0xffff00, 0.6);
    coin.fillCircle(-5, -5, 6);
    
    coin.x = x;
    coin.y = -20;
    
    scene.physics.add.existing(coin);
    coin.body.setSize(30, 30);
    
    // 闪烁动画
    scene.tweens.add({
        targets: coin,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 400,
        yoyo: true,
        repeat: -1
    });
    
    return coin;
}

function createButterfly(scene, x) {
    const butterfly = scene.add.container(x, -20);
    
    // 紫色蝴蝶
    // 左翅膀
    const leftWing = scene.add.graphics();
    leftWing.fillStyle(0x9370db, 1);
    leftWing.fillEllipse(-10, 0, 16, 22);
    leftWing.fillStyle(0xffffff, 0.6);
    leftWing.fillCircle(-10, 0, 6);
    leftWing.lineStyle(2, 0x4b0082, 1);
    leftWing.strokeEllipse(-10, 0, 16, 22);
    
    // 右翅膀
    const rightWing = scene.add.graphics();
    rightWing.fillStyle(0x9370db, 1);
    rightWing.fillEllipse(10, 0, 16, 22);
    rightWing.fillStyle(0xffffff, 0.6);
    rightWing.fillCircle(10, 0, 6);
    rightWing.lineStyle(2, 0x4b0082, 1);
    rightWing.strokeEllipse(10, 0, 16, 22);
    
    // 身体
    const body = scene.add.graphics();
    body.fillStyle(0x000000, 1);
    body.fillEllipse(0, 0, 5, 18);
    
    butterfly.add([leftWing, rightWing, body]);
    
    scene.physics.add.existing(butterfly);
    butterfly.body.setSize(32, 32);
    
    // 翅膀扇动动画
    scene.tweens.add({
        targets: [leftWing, rightWing],
        scaleY: 0.7,
        duration: 200,
        yoyo: true,
        repeat: -1
    });
    
    return butterfly;
}

function createBadLeaf(scene, x) {
    const leaf = scene.add.graphics();
    
    // 深棕色枯叶
    leaf.fillStyle(0x654321, 1);
    leaf.fillEllipse(0, 0, 18, 26);
    
    // 更深的边缘
    leaf.lineStyle(2, 0x3e2723, 1);
    leaf.strokeEllipse(0, 0, 18, 26);
    
    // 叶脉
    leaf.lineStyle(2, 0x3e2723, 1);
    leaf.lineBetween(0, -13, 0, 13);
    leaf.lineBetween(0, -5, -8, 0);
    leaf.lineBetween(0, 5, 8, 0);
    
    leaf.x = x;
    leaf.y = -20;
    
    scene.physics.add.existing(leaf);
    leaf.body.setSize(26, 32);
    
    // 旋转动画
    scene.tweens.add({
        targets: leaf,
        rotation: -Phaser.Math.PI2,
        duration: 1500,
        repeat: -1
    });
    
    return leaf;
}

function createBomb(scene, x) {
    const bomb = scene.add.container(x, -20);
    
    // 红色炸弹圆形
    const circle = scene.add.graphics();
    circle.fillStyle(0xff0000, 1);
    circle.fillCircle(0, 0, 18);
    circle.lineStyle(3, 0x8b0000, 1);
    circle.strokeCircle(0, 0, 18);
    
    // 白色X标记
    const xMark = scene.add.graphics();
    xMark.lineStyle(5, 0xffffff, 1);
    xMark.lineBetween(-10, -10, 10, 10);
    xMark.lineBetween(-10, 10, 10, -10);
    
    // 黑色X边缘
    const xOutline = scene.add.graphics();
    xOutline.lineStyle(7, 0x000000, 1);
    xOutline.lineBetween(-10, -10, 10, 10);
    xOutline.lineBetween(-10, 10, 10, -10);
    
    bomb.add([circle, xOutline, xMark]);
    
    scene.physics.add.existing(bomb);
    bomb.body.setSize(36, 36);
    
    // 脉动动画（警告效果）
    scene.tweens.add({
        targets: bomb,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    return bomb;
}

function collectObject(player, obj) {
    const type = obj.getData('type');
    const points = obj.getData('points');
    const scene = obj.scene;
    
    if (type === 'good') {
        // 收集好物体
        score += points;
        scoreText.setText('分数: ' + score);
        
        // 粒子效果（不闪屏）
        createCollectEffect(scene, obj.x, obj.y);
    } else if (type === 'bad') {
        // 碰到坏物体（减分和减生命）
        score += points;
        scoreText.setText('分数: ' + score);
        loseLife.call(scene);
        
        // 震动效果
        scene.cameras.main.shake(200, 0.01);
    } else if (type === 'deadly') {
        // 碰到炸弹X - 减1条命
        loseLife.call(scene);
        
        // 强烈震动和红色闪光
        scene.cameras.main.shake(400, 0.02);
        scene.cameras.main.flash(300, 255, 0, 0);
    }
    
    obj.destroy();
}

function createCollectEffect(scene, x, y) {
    // 创建简单的粒子爆炸效果（使用图形代替粒子系统）
    for (let i = 0; i < 10; i++) {
        const particle = scene.add.graphics();
        const color = Phaser.Math.RND.pick([0xffb3d9, 0xff69b4, 0xffd700]);
        particle.fillStyle(color, 1);
        particle.fillCircle(0, 0, 5);
        particle.x = x;
        particle.y = y;
        
        const angle = (Math.PI * 2 / 10) * i;
        const speed = Phaser.Math.Between(100, 200);
        
        scene.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * speed,
            y: y + Math.sin(angle) * speed,
            alpha: 0,
            scale: 0,
            duration: 600,
            ease: 'Power2',
            onComplete: () => particle.destroy()
        });
    }
}

function loseLife() {
    lives--;
    
    const hearts = '❤'.repeat(lives) + '🖤'.repeat(5 - lives);
    if (livesText) {
        livesText.setText('生命: ' + hearts);
    }
    
    if (lives <= 0) {
        endGame.call(this);
    }
}

function endGame() {
    gameOver = true;
    spawnTimer.remove();
    
    // 显示游戏结束
    const gameOverText = this.add.text(400, 250, '游戏结束!', {
        fontSize: '64px',
        fill: '#ff1493',
        fontFamily: 'Arial',
        stroke: '#ffffff',
        strokeThickness: 8
    }).setOrigin(0.5);
    
    const finalScoreText = this.add.text(400, 320, '最终分数: ' + score, {
        fontSize: '48px',
        fill: '#ff69b4',
        fontFamily: 'Arial',
        stroke: '#ffffff',
        strokeThickness: 6
    }).setOrigin(0.5);
    
    const restartText = this.add.text(400, 400, '点击重新开始', {
        fontSize: '32px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        backgroundColor: '#ff69b4',
        padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    restartText.on('pointerdown', () => {
        this.scene.restart();
        score = 0;
        lives = 5;
        gameOver = false;
    });
    
    // 闪烁动画
    this.tweens.add({
        targets: restartText,
        alpha: 0.5,
        duration: 500,
        yoyo: true,
        repeat: -1
    });
}
