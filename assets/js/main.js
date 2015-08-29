cc.game.onStart = function(){
    //load resources
    cc.view.setDesignResolutionSize(640, 480, cc.ResolutionPolicy.SHOW_ALL);
    cc.LoaderScene.preload(gameResources, function () {
        cc.director.runScene(new GameScene());
    }, this);
};
cc.game.onRestart = function(){
    cc.view.setDesignResolutionSize(640, 480, cc.ResolutionPolicy.SHOW_ALL);
    cc.director.runScene(new GameScene());
};
cc.game.restart = function () {
    cc.director.popToSceneStackLevel(0);
    cc.audioEngine && cc.audioEngine.end();
    cc.game.onRestart();
}

cc.game.run();