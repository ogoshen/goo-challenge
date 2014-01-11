define(['goo/loaders/DynamicLoader',
    'goo/util/rsvp'],
    function(
        DynamicLoader,
        RSVP
        ) {
        "use strict";

        var bundleQueue = [];
        var goo;
        var rootPath;
        var loader;

        function setRootPath(path) {
            rootPath = path;
        }

        function setGoo(go0) {
            goo = go0;
            loader = new DynamicLoader({
                world: goo.world,
                rootPath: rootPath,
                beforeAdd:function(){return true}  // return false to prevent auto-add to world
            });
        }

        function loadBundleQueue(successCallback, failCallback) {
            RSVP.all(bundleQueue).then(successCallback).then(null, failCallback);

            console.log("Load bundles: ", bundleQueue)
        }

        function addBundleToQueue(bundle) {
            bundleQueue.push(loader.loadFromBundle('project.project', bundle));
        }

        function getLoadedObjectByRef(ref) {
            return loader.getCachedObjectForRef(ref);
        }

        return {
            setGoo:setGoo,
            setRootPath:setRootPath,
            loadBundleQueue:loadBundleQueue,
            addBundleToQueue:addBundleToQueue,
            getLoadedObjectByRef:getLoadedObjectByRef
        }
    });
