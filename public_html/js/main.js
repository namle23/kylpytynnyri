var sceneKylpy, sceneBG, camera, cameraBG, webGLRenderer;
var filter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;
var fileReader = new FileReader();
var inner;
function init() {

    var stats = initStats();
    sceneKylpy = new THREE.Scene();
    sceneBG = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraBG = new THREE.OrthographicCamera(-window.innerWidth, window.innerWidth, window.innerHeight, -window.innerHeight, -10000, 10000);
    cameraBG.position.z = 50;
    // create render
    webGLRenderer = new THREE.WebGLRenderer();
    webGLRenderer.setClearColor(new THREE.Color(0x000, 1.0));
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    webGLRenderer.shadowMap.enabled = true;
    var coal, cap, outter, pipe, ring, smoke;
    var loader = new THREE.JSONLoader();
    loader.load('asset/coal.js', function (geometry, mat) {
        coal = new THREE.Mesh(geometry, mat[0]);
        coal.scale.x = 10;
        coal.scale.y = 10;
        coal.scale.z = 10;
        sceneKylpy.add(coal);
    });
    loader.load('asset/cap.js', function (geometry, mat) {
        cap = new THREE.Mesh(geometry, mat[0]);
        cap.scale.x = 10;
        cap.scale.y = 10;
        cap.scale.z = 10;
    });
    loader.load('asset/inner.js', function (geometry, mat) {
        inner = new THREE.Mesh(geometry, mat[0]);
        inner.scale.x = 10;
        inner.scale.y = 10;
        inner.scale.z = 10;
        sceneKylpy.add(inner);
    });
    loader.load('asset/outter.js', function (geometry, mat) {
        outter = new THREE.Mesh(geometry, mat[0]);
        outter.scale.x = 10;
        outter.scale.y = 10;
        outter.scale.z = 10;
        sceneKylpy.add(outter);
    });
    loader.load('asset/pipe.js', function (geometry, mat) {
        pipe = new THREE.Mesh(geometry, mat[0]);
        pipe.scale.x = 10;
        pipe.scale.y = 10;
        pipe.scale.z = 10;
        sceneKylpy.add(pipe);
    });
    loader.load('asset/ring.js', function (geometry, mat) {
        ring = new THREE.Mesh(geometry, mat[0]);
        ring.scale.x = 10;
        ring.scale.y = 10;
        ring.scale.z = 10;
        sceneKylpy.add(ring);
    });
    loader.load('asset/smoke.js', function (geometry, mat) {
        smoke = new THREE.Mesh(geometry, mat[0]);
        smoke.scale.x = 10;
        smoke.scale.y = 10;
        smoke.scale.z = 10;
        sceneKylpy.add(smoke);
    });
    // position the camera 
    camera.position.x = 50;
    camera.position.y = 80;
    camera.position.z = 40;
    var orbitControls = new THREE.OrbitControls(camera);
    //for rotation
    var clock = new THREE.Clock();
    var delta = clock.getDelta();
    var ambientLight = new THREE.AmbientLight(0x383838);
    sceneKylpy.add(ambientLight);
    // add spotlight
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(300, 300, 300);
    spotLight.intensity = 1;
    sceneKylpy.add(spotLight);

    fileReader.onload = function (event) {
        try {
            localStorage.setItem("b", event.target.result);
        } catch (DOMException) {
            alert("Image size too large! Choose another image or clear localStorage.")
        }
        try {
            switchBackground();
        } catch (e) {
            console.log(e);
        }
        location.reload();
    };
    //declare local storage chosen file
    var backgroundImagePath = localStorage.getItem("b");
    //set custom background
    function switchBackground()
    {
        var background = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(backgroundImagePath),
            depthTest: false
        });
        var bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), background);
        bgPlane.position.z = -100;
        bgPlane.scale.set(window.innerWidth * 2, window.innerHeight * 2, 1);
        sceneBG.add(bgPlane);
    }

    if (backgroundImagePath === null)
    {
        var background = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture("asset/bg/lake.jpg"),
            depthTest: false
        });
        var bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), background);
        bgPlane.position.z = -100;
        bgPlane.scale.set(window.innerWidth * 2, window.innerHeight * 2, 1);
        sceneBG.add(bgPlane);
    } else {
        $(switchBackground);
    }
    // append renderer output to HTML
    document.getElementById("WebGL").appendChild(webGLRenderer.domElement);
    //add event mouse click to select object
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    //add two scenes together
    var bgPass = new THREE.RenderPass(sceneBG, cameraBG);
    var renderPass = new THREE.RenderPass(sceneKylpy, camera);
    renderPass.clear = false;
    var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    effectCopy.renderToScreen = true;
    // render 2 scenes to one image
    var composer = new THREE.EffectComposer(webGLRenderer);
    composer.renderTarget1.stencilBuffer = true;
    composer.addPass(bgPass);
    composer.addPass(renderPass);
    composer.addPass(effectCopy);
    //create material for inner
    var blackMaterial = new THREE.MeshPhongMaterial({
        color: 0x323232
    });
    var grayMaterial = new THREE.MeshPhongMaterial({
        color: 0xcccccc
    });
    var blueMaterial = new THREE.MeshPhongMaterial({
        color: 0x008B8B
    });
    //function select object
    function onDocumentMouseDown(event) {

        var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
        vector = vector.unproject(camera);
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var intersects = raycaster.intersectObjects([inner]);
        if (intersects.length > 0) {

            //create popup
            function popUp() {
                var popup = document.createElement("div");
                popup.className = "popup";
                popup.id = "test";
                var cancel = document.createElement("div");
                cancel.className = "cancel";
                cancel.innerHTML = "X";
                cancel.onclick = function (event) {
                    popup.parentNode.removeChild(popup)
                };
                var innerBlue = document.createElement("input");
                innerBlue.type = "button";
                innerBlue.id = "innerBlueCSS";
                innerBlue.onclick = function () {
                    inner.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            child.material = blueMaterial;
                        }
                    });
                }

                var innerBlack = document.createElement("input");
                innerBlack.type = "button";
                innerBlack.id = "innerBlackCSS";
                innerBlack.onclick = function () {
                    inner.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            child.material = blackMaterial;
                        }
                    });
                }

                var innerGray = document.createElement("input");
                innerGray.type = "button";
                innerGray.id = "innerGrayCSS";
                innerGray.onclick = function () {
                    inner.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            child.material = grayMaterial;
                        }
                    });
                }

                popup.appendChild(innerBlue);
                popup.appendChild(innerBlack);
                popup.appendChild(innerGray);
                popup.appendChild(cancel);
                document.body.appendChild(popup);
            }
            $(popUp);
        }
    }

    //add controls
    var controls = new function () {
        this.message = "Click inner toggle color";
        this.rotate = true;
        this.capColor = "blue";
        this.custom = "Coming soon...";
        this.addCap = function () {
            sceneKylpy.add(cap);
        };
        this.removeCap = function () {
            sceneKylpy.remove(cap);
        };

//        this.saveScene = function () {
//            var setPositionObject = {
//                camX: camera.position.x,
//                camY: camera.position.y,
//                camZ: camera.position.z
//            }
//            var setPositionJson = JSON.stringify(setPositionObject);
//            localStorage.setItem("positionJson", setPositionJson);
//            console.log(setPositionJson);
//        };
        this.restoreScene = function () {
            var getPositionJson = localStorage.getItem("positionJson");
            var getPositionObject = JSON.parse(getPositionJson);

            camera.position.x = getPositionObject.camX;
            camera.position.y = getPositionObject.camY;
            camera.position.z = getPositionObject.camZ;

            console.log(getPositionObject);
        };
    };
    var gui = new dat.GUI();
    gui.add(controls, "message");
    gui.add(controls, "rotate");
    gui.add(controls, "addCap");
    gui.add(controls, "removeCap");
//    gui.add(controls, "saveScene");
    gui.add(controls, "restoreScene");
    //add folder
    var customizeFolder = gui.addFolder("Customize");
    customizeFolder.add(controls, "custom");

    render();
    function render() {
        webGLRenderer.autoClear = false;
        stats.update();
        orbitControls.update(delta);
        if (controls.rotate) {
            if (coal) {
                try {
                    coal.rotation.y += 0.001;
                    cap.rotation.y += 0.001;
                    outter.rotation.y += 0.001;
                    pipe.rotation.y += 0.001;
                    ring.rotation.y += 0.001;
                    smoke.rotation.y += 0.001;
                    inner.rotation.y += 0.001;
                } catch (e) {
                    console.log("Rotation error");
                }
            }
        }
        // render using requestAnimationFrame
        requestAnimationFrame(render);
        composer.render(delta);
        composer.render();
    }

    function initStats() {

        var stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.getElementById("Stats").appendChild(stats.domElement);
        return stats;
    }
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    cameraBG.aspect = window.innerWidth / window.innerHeight;
    cameraBG.updateProjectionMatrix();
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
}

function loadImageFile(chosenFile) {
    if (!chosenFile.files.length) {
        return;
    }
    var oFile = chosenFile.files[0];
    if (!filter.test(oFile.type)) {
        alert("File format invalid!");
        return;
    }
    fileReader.readAsDataURL(oFile);
}

function removeImageFile() {
    localStorage.removeItem("b");
    location.reload();
}

window.onload = init;

//save camera position when user leave page
window.onbeforeunload = function () {
    var setPositionObject = {
        camX: camera.position.x,
        camY: camera.position.y,
        camZ: camera.position.z
    }
    var setPositionJson = JSON.stringify(setPositionObject);
    localStorage.setItem("positionJson", setPositionJson);
};

window.addEventListener('resize', onResize, false);