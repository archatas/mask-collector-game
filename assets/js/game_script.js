var KEY_LEFT_CODE = 37;
var KEY_RIGHT_CODE = 39;
var KEY_UP_CODE = 38;
var KEY_DOWN_CODE = 40;
var TILE_SIZE = 35;
var sprites = {
    '#': STATIC_URL + 'img/brick.png',
    '*': STATIC_URL + 'img/collectable1.png',
    'X': STATIC_URL + 'img/avoidable.png',
    'e': STATIC_URL + 'img/exit.png',
    'p': STATIC_URL + 'img/player.png'
};
var labyrinth = JSON.parse('[["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"], ["#", "p", " ", "*", "*", "*", "*", "*", " ", " ", " ", "#"], ["#", "#", "#", "#", "#", "#", "#", "#", " ", "X", " ", "#"], ["#", " ", "*", "*", "*", " ", " ", " ", " ", " ", " ", "#"], ["#", " ", "X", "#", "#", "#", "#", "#", "#", "#", " ", "#"], ["#", " ", " ", "*", "*", "#", " ", " ", " ", "#", "e", "#"], ["#", "#", "#", "#", " ", "#", " ", "#", "*", "#", " ", "#"], ["#", " ", "*", "*", " ", " ", " ", "#", "*", " ", " ", "#"], ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"]]');
var animation_layer;
var player_position;
var player_sprite;
var collectables_positions = [];
var collectables_sprites = [];
var avoidables_positions = [];
var avoidables_sprites = [];

var BackgroundLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        this.init();
    },

    init:function () {
        this._super();
        var win_size = cc.director.getWinSize();

        //create the background image and position it at the center of screen
        var centerPos = cc.p(win_size.width / 2, win_size.height / 2);

        this.setPosition(TILE_SIZE / 2, - TILE_SIZE / 2);
        for (var y=0; y<labyrinth.length; y++) {
            for (var x=0; x<labyrinth[y].length; x++) {
                if (labyrinth[y][x] == "p") {
                    player_position = [x, y];
                } else if (labyrinth[y][x] == "*") {
                    collectables_positions.push([x, y]);
                    var image_path = STATIC_URL + 'img/collectable' + (Math.ceil(Math.random() * 2)) + '.png';
                    var sprite = cc.Sprite.create(image_path);
                    sprite.setPosition(x * TILE_SIZE, win_size.height-y * TILE_SIZE);
                    sprite.setScale(TILE_SIZE / sprite.getContentSize().width);
                    this.addChild(sprite, 0);
                    collectables_sprites.push(sprite);
                } else if ((labyrinth[y][x] == "X")) {
                    avoidables_positions.push([x, y]);
                    var image_path = STATIC_URL + 'img/avoidable.png';
                    var sprite = cc.Sprite.create(image_path);
                    sprite.setPosition(x * TILE_SIZE, win_size.height-y * TILE_SIZE);
                    sprite.setScale(TILE_SIZE / sprite.getContentSize().width);
                    this.addChild(sprite, 0);
                    avoidables_sprites.push(sprite);
                } else {
                    var image_path = sprites[labyrinth[y][x]];
                    if (image_path) {
                        var sprite = cc.Sprite.create(image_path);
                        sprite.setPosition(x * TILE_SIZE, win_size.height-y * TILE_SIZE);
                        sprite.setScale(TILE_SIZE / sprite.getContentSize().width);
                        this.addChild(sprite, 0);
                    }
                }
            }
        }
    }
});
var AnimationLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        this.init();
    },
    init: function () {
        this._super();
        var win_size = cc.director.getWinSize();

        this.setPosition(TILE_SIZE / 2, - TILE_SIZE / 2);

        //create the hero sprite
        player_sprite = new cc.Sprite(sprites['p']);
        player_sprite.attr({x: player_position[0] * TILE_SIZE, y: win_size.height - player_position[1] * TILE_SIZE});
        player_sprite.setScale(TILE_SIZE / player_sprite.getContentSize().width);

        this.addChild(player_sprite);
    }
});
var StatusLayer = cc.Layer.extend({
    labelCoin:null,
    labelMeter:null,
    coins:0,

    ctor:function () {
        this._super();
        this.init();
    },

    init:function () {
        this._super();

        var win_size = cc.director.getWinSize();

        this.setPosition(TILE_SIZE / 2, - TILE_SIZE / 2);

        this.labelCoin = new cc.LabelTTF("Coins:0", "Helvetica", 20);
        this.labelCoin.setColor(cc.color(0,0,0));//black color
        this.labelCoin.setPosition(cc.p(70, win_size.height - 20));
        this.addChild(this.labelCoin);

        this.labelMeter = new cc.LabelTTF("0M", "Helvetica", 20);
        this.labelMeter.setPosition(cc.p(win_size.width - 70, win_size.height - 20));
        this.addChild(this.labelMeter);
    }
});

var state = {};
var player_anim_in_progress = false;

var GameScene = cc.Scene.extend({
    ctor: function(space) {
        this._super();
        this.space = space;
        this.audioEngine = cc.audioEngine;
        this.init();
    },
    initPhysics: function() {
        //1. new space object
        this.space = new cc.Spacer();
    },
    onEnter: function () {
        var that = this;
        this._super();
        this.initPhysics();
        
        player_position = null;
        player_sprite = null;
        collectables_positions = [];
        collectables_sprites = [];
        avoidables_positions = [];
        avoidables_sprites = [];


        TILE_SIZE = 640 / labyrinth[0].length;

        //add three layer in the right order
        var gradient = cc.LayerGradient.create(cc.color(255,255,255,255), cc.color(255,255,255,255));
        this.addChild(gradient);
        this.addChild(new BackgroundLayer());
        animation_layer = new AnimationLayer(this.space);
        this.addChild(animation_layer);
        //this.addChild(new StatusLayer());

        if('keyboard' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed:function(key, event) {
                    switch(key) {
                    case KEY_LEFT_CODE:
                        state.isSwipeLeft = true;
                        break;
                    case KEY_RIGHT_CODE:
                        state.isSwipeRight = true;
                        break;
                    case KEY_UP_CODE:
                        state.isSwipeUp = true;
                        break;
                    case KEY_DOWN_CODE:
                        state.isSwipeDown = true;
                        break;
                    }
                    that.movePlayer();
                },
                onKeyReleased:function(key, event) {
                    switch(key) {
                    case KEY_LEFT_CODE:
                        state.isSwipeLeft = false;
                        break;
                    case KEY_RIGHT_CODE:
                        state.isSwipeRight = false;
                        break;
                    case KEY_UP_CODE:
                        state.isSwipeUp = false;
                        break;
                    case KEY_DOWN_CODE:
                        state.isSwipeDown = false;
                        break;
                    }
                }
            }, this);
        }
        this.scheduleUpdate();
    },
    afterAnim: function() {
        var that = this;
        player_anim_in_progress = false;
        var win_size = cc.director.getWinSize();
        for (var i=0; i<collectables_positions.length; i++) {
            if (collectables_positions[i][0] == player_position[0] && collectables_positions[i][1] == player_position[1]) {
                this.audioEngine.playEffect(STATIC_URL + 'audio/collected.mp3');
                collectables_positions.splice(i, 1);
                collectables_sprites[i].removeFromParent();
                collectables_sprites.splice(i, 1);
                continue;
            }
        }
        for (var i=0; i<avoidables_positions.length; i++) {
            if (avoidables_positions[i][0] == player_position[0] && avoidables_positions[i][1] == player_position[1]) {
                that.audioEngine.playEffect(STATIC_URL + 'audio/boom.mp3');
                avoidables_positions.splice(i, 1);
                avoidables_sprites[i].removeFromParent();
                avoidables_sprites.splice(i, 1);

                boom_sprite = new cc.Sprite(STATIC_URL + 'img/boom.png');
                boom_sprite.attr({x: player_position[0] * TILE_SIZE + TILE_SIZE / 2, y: win_size.height - player_position[1] * TILE_SIZE - TILE_SIZE / 2});
                boom_sprite.setScale(TILE_SIZE / player_sprite.getContentSize().width);

                that.addChild(boom_sprite);
                
                animation_layer.removeChild(player_sprite);
                that.schedule(function() {
                    that.removeChild(boom_sprite);
                    that.schedule(function() {
                        cc.game.restart();
                    }, 1.5);

                }, 0.5);
                
                continue;
            }
        }
        if (labyrinth[player_position[1]][player_position[0]] == "e") {
            if (!collectables_positions.length) {
                this.audioEngine.playEffect(STATIC_URL + 'audio/you-won.mp3');
                label = new cc.Sprite(STATIC_URL + 'img/you-won.png');
                label.setPosition(win_size.width / 2, win_size.height / 2);
                that.addChild(label);
                that.schedule(function() {
                    that.removeChild(label)
                }, 5);
            }
        }
    },
    movePlayer: function() {
        var that = this;
        if (player_anim_in_progress) {
            return;
        }

        var win_size = cc.director.getWinSize();
        if (state.isSwipeUp) {
            console.log("up");
            if (labyrinth[player_position[1]-1][player_position[0]] != '#') {
                player_anim_in_progress = true;
                player_position[1]--;
                // create the move action
                var actionTo = cc.moveTo(0.25, cc.p(player_position[0] * TILE_SIZE, win_size.height - player_position[1] * TILE_SIZE)).easing(cc.easeInOut(1));
                player_sprite.runAction(new cc.Sequence(actionTo, new cc.CallFunc(that.afterAnim, that)));
            }
        }
        if (state.isSwipeDown) {
            console.log("down");
            if (labyrinth[player_position[1]+1][player_position[0]] != '#') {
                player_anim_in_progress = true;
                player_position[1]++;
                // create the move action
                var actionTo = cc.moveTo(0.25, cc.p(player_position[0] * TILE_SIZE, win_size.height - player_position[1] * TILE_SIZE)).easing(cc.easeInOut(1));
                player_sprite.runAction(new cc.Sequence(actionTo, new cc.CallFunc(that.afterAnim, that)));
            }
        }
        if (state.isSwipeLeft) {
            console.log("left");
            if (labyrinth[player_position[1]][player_position[0]-1] != '#') {
                player_anim_in_progress = true;
                player_position[0]--;
                // create the move action
                var actionTo = cc.moveTo(0.25, cc.p(player_position[0] * TILE_SIZE, win_size.height - player_position[1] * TILE_SIZE)).easing(cc.easeInOut(1));
                player_sprite.setFlippedX(true);
                player_sprite.runAction(new cc.Sequence(actionTo, new cc.CallFunc(that.afterAnim, that)));
            }
        }
        if (state.isSwipeRight) {
            console.log("right");
            if (labyrinth[player_position[1]][player_position[0]+1] != '#') {
                player_anim_in_progress = true;
                player_position[0]++;
                // create the move action
                var actionTo = cc.moveTo(0.25, cc.p(player_position[0] * TILE_SIZE, win_size.height - player_position[1] * TILE_SIZE)).easing(cc.easeInOut(1));
                player_sprite.setFlippedX(false);
                player_sprite.runAction(new cc.Sequence(actionTo, new cc.CallFunc(that.afterAnim, that)));
            }
        }
    },
    update: function (dt) { // this is called in a loop
        /*
        for (var i = 0; i < this._projectiles.length; i++) {
            var projectile = this._projectiles[i];
            for (var j = 0; j < this._monsters.length; j++) {
                var monster = this._monsters[j];
                var projectileRect = projectile.getBoundingBox();
                var monsterRect = monster.getBoundingBox();
                if (cc.rectIntersectsRect(projectileRect, monsterRect)) {
                    cc.log("collision!");
                    cc.ArrayRemoveObject(this._projectiles, projectile);
                    projectile.removeFromParent();
                    cc.ArrayRemoveObject(this._monsters, monster);
                    monster.removeFromParent();
                }
            }
        }
        */
    }
});