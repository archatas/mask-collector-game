cc.game.onStart = function(){
    //load resources
    cc.view.setDesignResolutionSize(640, 480, cc.ResolutionPolicy.SHOW_ALL);

    cc.LoaderScene.preload(gameResources, function () {
        cc.director.runScene(new GameScene());
    }, this);
};
cc.game.run();
