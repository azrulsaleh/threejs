import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import Stats from 'three/examples/jsm/libs/stats.module.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import nebula from 'url:../img/nebula.jpg';
import stars from 'url:../img/stars.jpg';

const chairUrl = new URL('../assets/monkey.glb', import.meta.url);

//window
const w = window.innerWidth;
const h = window.innerHeight;

//renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;

//scene
const scene = new THREE.Scene();
const sceneGridHelper = new THREE.GridHelper(100, 10, 0xFF0000, 0x00FF00);
scene.add(sceneGridHelper);
sceneGridHelper.rotation.x = Math.PI * -0.5;
sceneGridHelper.visible = false;
const sceneAxesHelper = new THREE.AxesHelper(100);
scene.add(sceneAxesHelper);
sceneAxesHelper.visible = false;

//camera
const _camera = {
	x: 0,
	y: 0,
	z: 100,
	fov: 45,
	aspect: w / h,
	near: 0.1,
	far: 1000,
};
const camera = new THREE.PerspectiveCamera(_camera.fov, _camera.aspect, _camera.near, _camera.far);
camera.position.set(_camera.x, _camera.y, _camera.z);
const targetPosition = new THREE.Vector3();
function updateCameraFrame() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    camera.aspect = aspect;

    // 2. Smoothly scale down the FOV and tilt the camera only when aspect > 1
    if (aspect <= 1) {
        // --- TALL TO SQUARE (STRICTLY TOP DOWN) ---
        camera.position.y = 0;
        camera.fov = _camera.fov;

        // Exact Z calculation to keep width framed
        const vFovRad = THREE.MathUtils.degToRad(camera.fov);
        const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);
        camera.position.z = targetWidth / (2 * Math.tan(hFovRad / 2));
    } else {
        // --- WIDE (SMOOTH TRANSITION) ---
        // As aspect grows beyond 1, we smoothly increase the tilt.
        // We use a factor that starts at 0 (when aspect = 1) and scales smoothly.
        const tiltFactor = (aspect - 1) / aspect; 

        // Smoothly blend Y and Z from their baseline values
        // camera.position.y = -targetWidth * tiltFactor * 0.8; // Smoothly drops from 0
        camera.position.y = -targetWidth * tiltFactor * 4; // Smoothly drops from 0

        // Base Z when aspect = 1
        const vFovRadBase = THREE.MathUtils.degToRad(_camera.fov);
        const baseZ = targetWidth / (2 * Math.tan(vFovRadBase / 2));

        // Smoothly pull Z closer as the window gets wider
        camera.position.z = THREE.MathUtils.lerp(baseZ, targetWidth / (aspect * 0.8), tiltFactor);

        // Calculate exact horizontal FOV required at this new, closer distance
        const distance = camera.position.length();
        const requiredHFovRad = 2 * Math.atan((targetWidth / 2) / distance);
        const requiredVFovRad = 2 * Math.atan(Math.tan(requiredHFovRad / 2) / aspect);

        camera.fov = THREE.MathUtils.radToDeg(requiredVFovRad);
    }

    // Always keep x at 0
    camera.position.x = 0;

    // Orient and update
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

//orbit
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

//skybox
renderer.setClearColor(0xE69913);
// const cubeTextureLoader = new THREE.CubeTextureLoader();
// cubeTextureLoader.load([
// 	nebula,
// 	nebula,
// 	stars,
// 	stars,
// 	stars,
// 	stars
// ], function(texture) {
//     texture.colorSpace = THREE.SRGBColorSpace;
//     scene.background = texture;
// });

//debug
const _debug = {
	stats: false,
};
const stats = new Stats();

//ambient light
const _aLight = {
	visible: true,
	color: '#FFFFFF',
	intensity: 5,
}
const aLight = new THREE.AmbientLight(_aLight.color);
scene.add(aLight);
aLight.intensity = _aLight.intensity;
aLight.visible = _aLight.visible;

//directional light
const _dLight = {
	visible: true,
	x: -20,
	y: -20,
	z: 30,
	color: '#FFFFFF',
	intensity: 10,
	helper: false,
	castShadow: true,
	shadowRadius: 30,
	shadowHelper: false,
};
const dLight = new THREE.DirectionalLight(_dLight.color, 0.8);
scene.add(dLight);
dLight.visible = _dLight.visible;
dLight.position.set(_dLight.x, _dLight.y, _dLight.z);
dLight.castShadow = _dLight.castShadow;
dLight.intensity = _dLight.intensity;
dLight.shadow.camera.bottom = -_dLight.shadowRadius;
dLight.shadow.camera.top = _dLight.shadowRadius;
dLight.shadow.camera.left = -_dLight.shadowRadius;
dLight.shadow.camera.right = _dLight.shadowRadius;
const dLightHelper = new THREE.DirectionalLightHelper(dLight, 5);
scene.add(dLightHelper);
dLightHelper.visible = _dLight.helper;
const dLightShadowHelper = new THREE.CameraHelper(dLight.shadow.camera);
scene.add(dLightShadowHelper);
dLightShadowHelper.visible = _dLight.shadowHelper;

//spot light
const _sLight = {
	x: 0,
	y: 0,
	z: 40,
	color: '#FFFFFF',
	castShadow: false,
	angle: 0.45,
	distance: 100,
	decay: 2,
	intensity: 5000,
	penumbra: 0,
	helper: false,
};
const sLight = new THREE.SpotLight(_sLight.color);
scene.add(sLight);
sLight.position.set(_sLight.x, _sLight.y, _sLight.z);
sLight.angle = _sLight.angle;
sLight.distance = _sLight.distance;
sLight.decay = _sLight.decay;
sLight.penumbra = _sLight.penumbra;
sLight.intensity = _sLight.intensity;
sLight.castShadow = _sLight.castShadow;
const sLightHelper = new THREE.SpotLightHelper(sLight);
scene.add(sLightHelper);
sLightHelper.visible = _sLight.helper;

//table
const _table = {
	radius: 30,
	segment: 64,
	depth: 5.0,
	color: '#0c5f82',
	receiveShadow: true,
	wireframe: false,
	bevel: true,
};
const paddingFactor = 1.1;
const targetWidth = _table.radius * 2 * paddingFactor;
const circleShape = new THREE.Shape();
circleShape.absarc(0, 0, _table.radius, 0, Math.PI * 2);
const depthShape = { depth: _table.depth, bevelEnabled: _table.bevel, curveSegments: _table.segment };
const tableGeo = new THREE.ExtrudeGeometry(circleShape, depthShape);
tableGeo.computeVertexNormals();
const tableMat = new THREE.MeshStandardMaterial({ 
	color: _table.color,
	wireframe: _table.wireframe,
});
const table = new THREE.Mesh(tableGeo, tableMat);
scene.add(table);
table.position.z = -_table.depth - 0.25;
table.receiveShadow = _table.receiveShadow;

//avatar
const _avatar = {
	w: 12,
	h: 6,
	color: '#965F8F',
	pos: [[0, -25, 3], [-25, 15, 3], [0, 30, 3], [25, 15, 3]],
}
const avatarGeo = new THREE.PlaneGeometry(_avatar.w, _avatar.h);
avatarGeo.translate(0, 0, _avatar.h / 2);
const avatarMat = new THREE.MeshBasicMaterial({color: _avatar.color});
const avatarA = new THREE.Mesh(avatarGeo, avatarMat);
const avatarB = new THREE.Mesh(avatarGeo, avatarMat);
const avatarC = new THREE.Mesh(avatarGeo, avatarMat);
const avatarD = new THREE.Mesh(avatarGeo, avatarMat);
scene.add(avatarA);
scene.add(avatarB);
scene.add(avatarC);
scene.add(avatarD);
avatarA.position.set(_avatar.pos[0][0], _avatar.pos[0][1], _avatar.pos[0][2]);
avatarB.position.set(_avatar.pos[1][0], _avatar.pos[1][1], _avatar.pos[1][2]);
avatarC.position.set(_avatar.pos[2][0], _avatar.pos[2][1], _avatar.pos[2][2]);
avatarD.position.set(_avatar.pos[3][0], _avatar.pos[3][1], _avatar.pos[3][2]);
const avatarOutline = new THREE.LineSegments(
	new THREE.EdgesGeometry(avatarA.geometry),
	new THREE.LineBasicMaterial({ color: 0x000000 })
)
avatarA.add(avatarOutline);
avatarB.add(avatarOutline);
avatarC.add(avatarOutline);
avatarD.add(avatarOutline);

//discard
const _discard = {
	visible: true,
	x: 0,
	y: 0,
	z: 0,
	color: '#FFFF00',
	w: 10,
	d: 5,
	h: 2,
	wireframe: false,
	castShadow: true,
	scale_w: 1,
	scale_h: 1,
	scale_z: 1,
};
const discardGeo = new THREE.BoxGeometry(_discard.w, _discard.d, _discard.h);
discardGeo.translate(0, 0, _discard.h / 2);
const discardMat = new THREE.MeshStandardMaterial({ color: _discard.color, wireframe: _discard.wireframe });
const discard = new THREE.Mesh(discardGeo, discardMat);
scene.add(discard);
discard.visible = _discard.visible;
discard.position.set(_discard.x, _discard.y, _discard.z);
discard.castShadow = _discard.castShadow;
const discardOutline = new THREE.LineSegments(
	new THREE.EdgesGeometry(discard.geometry),
	new THREE.LineBasicMaterial({ color: 0x000000 })
)
discard.add(discardOutline);

//bounce
const _bounce = {
	radius: 1,
	color: '#0000FF',
	wireframe: false,
	castShadow: false,
	animate: true,
	speed: 0.05,
	player: 1,
	pos: [[0, -20, 1], [-20, 20, 1], [0, 20, 1], [20, 20, 1]],
};
const bounceGeo = new THREE.ConeGeometry(_bounce.radius, 1, 3);
const bounceMat = new THREE.MeshStandardMaterial({ color: _bounce.color, wireframe: _bounce.wireframe });
const bounce = new THREE.Mesh(bounceGeo, bounceMat);
scene.add(bounce);
bounce.position.set(_bounce.pos[0][0], _bounce.pos[0][1], _bounce.pos[0][2]);
bounce.castShadow = _bounce.castShadow;
bounce.rotation.x = Math.PI * -0.5;
const bounceOutline = new THREE.LineSegments(
	new THREE.EdgesGeometry(bounce.geometry),
	new THREE.LineBasicMaterial({ color: 0x000000 })
)
bounce.add(bounceOutline);

//texture
// const textureLoader = new THREE.TextureLoader();
// textureLoader.load(stars, function(texture) {
//     texture.colorSpace = THREE.SRGBColorSpace;
//     scene.background = texture;
// });

//chair
const assetLoader = new GLTFLoader();
assetLoader.load(chairUrl.href, function(gltf) {
	const chair0 = gltf.scene;
	const chair1 = gltf.scene;
	scene.add(chair0);
	scene.add(chair1);
	chair0.position.set(0, -35, -5);
	chair1.position.set(0, 35, -5);
}, undefined, function(error) {
	console.error(error);
});

//frenzy
// const frenzyGeometry = new THREE.PlaneGeometry(10, 10, 10, 10);
// const frenzyMaterial = new THREE.MeshBasicMaterial({
// 	color: 0xFFFFFF,
// 	wireframe: true
// });
// const frenzy = new THREE.Mesh(frenzyGeometry, frenzyMaterial);
// scene.add(frenzy);
// frenzy.position.set(10, 10, 15);

//gui
const gui = new dat.GUI();
// gui.open();
const options = {
	cameraReset() { updateCameraFrame(); },

	bounceEnable: true,
	bounceColor: '#96ea42',
	bounceWireframe: false,
	bounceSpeed: 0.01,
	bounceAnimate: true,
	frenzyEnable: true,
	frenzyWireframe: true,
	frenzySpeed: 0.001,
	frenzyAnimate: false
};

//scene
const globalFolder = gui.addFolder("Global");
// globalFolder.open();
globalFolder.add(sceneGridHelper, 'visible').name("Grid Helper");
globalFolder.add(sceneAxesHelper, 'visible').name("Axes Helper");

//camera
const cameraFolder = globalFolder.addFolder("Camera");
cameraFolder.open();
const xController = cameraFolder.add(camera.position, "x", -100, 100, 1).onChange(e => { camera.lookAt(scene.position); }).name("X");
const yController = cameraFolder.add(camera.position, "y", -200, 0, 1).onChange(e => { camera.lookAt(scene.position); }).name("Y");
const zController = cameraFolder.add(camera.position, "z", 0, 200, 1).onChange(e => { camera.lookAt(scene.position); }).name("Z");
const fovController = cameraFolder.add(camera, "fov", 10, 120, 1).onChange(e => { camera.updateProjectionMatrix(); }).name("FOV");
cameraFolder.add(options, "cameraReset").onChange(() => { updateCameraFrame(); }).name("Reset");
cameraFolder.add(orbit, "enabled").name("Orbit");

const debugFolder = globalFolder.addFolder("Debug");
debugFolder.open();
debugFolder.add(_debug, 'stats').onChange((e) => {
	e ? document.body.appendChild(stats.dom) : document.body.removeChild(stats.dom);
}).name('Stats');

//lights
const lightsFolder = gui.addFolder("Lights");
// lightsFolder.open();

//ambient light
const aLightFolder = lightsFolder.addFolder('Ambient Light');
// aLightFolder.open();
aLightFolder.add(aLight, 'visible').name('Visible');
aLightFolder.addColor(_aLight, 'color').onChange((e) => { aLight.color.set(e); }).name('Color');
aLightFolder.add(aLight, "intensity", 0, 30, 1).name('Intensity');

//directional light
const dLightFolder = lightsFolder.addFolder('Directional Light');
// dLightFolder.open();
dLightFolder.add(dLight, 'visible').name('Visible');
dLightFolder.add(dLight.position, 'x', -100, 100, 1).name('X');
dLightFolder.add(dLight.position, 'y', -100, 100, 1).name('Y');
dLightFolder.add(dLight.position, 'z', 0, 100, 1).name('Z');
dLightFolder.addColor(_dLight, 'color').onChange((e) => { dLight.color.set(e); }).name('Color');
dLightFolder.add(dLight, 'intensity', 0, 100, 1).name('Intensity');
dLightFolder.add(dLightHelper, 'visible').name('Helper');
dLightFolder.add(dLight, 'castShadow').name('Cast Shadow');
dLightFolder.add(_dLight, 'shadowRadius', 0, 50, 1).onChange((e) => {
	dLight.shadow.camera.bottom = -e;
	dLight.shadow.camera.top = e;
	dLight.shadow.camera.left = -e;
	dLight.shadow.camera.right = e;
	dLight.shadow.camera.updateProjectionMatrix();
}).name('Shadow Radius');
dLightFolder.add(dLightShadowHelper, 'visible').name('Shadow Helper');

//spot light
const sLightFolder = lightsFolder.addFolder("Spot Light");
// sLightFolder.open();
sLightFolder.add(sLight, 'visible').name("Visible");
sLightFolder.add(sLight.position, 'x', -100, 100, 1).name("X");
sLightFolder.add(sLight.position, 'y', -100, 100, 1).name("Y");
sLightFolder.add(sLight.position, 'z', -100, 100, 1).name("Z");
sLightFolder.add(sLightHelper, 'visible').name("Helper");
sLightFolder.addColor(_sLight, "color").onChange(e => { sLight.color.set(e); }).name("Color");
sLightFolder.add(sLight, 'angle', 0, 1, 0.01).name('Angle');
sLightFolder.add(sLight, 'distance', 0, 100, 1).name('Distance');
sLightFolder.add(sLight, 'decay', 0, 3, 0.01).name('Decay');
sLightFolder.add(sLight, 'intensity', 0, 10000, 1).name('Intensity');
sLightFolder.add(sLight, 'penumbra', 0, 1, 0.1).name('Penumbra');
sLightFolder.add(sLight, 'castShadow').name('Cast Shadow');

//objects
const objectsFolder = gui.addFolder("Objects");
// objectsFolder.open();

//table
const tableFolder = objectsFolder.addFolder("Table");
tableFolder.open();
tableFolder.add(table, 'visible').name("Visible");
tableFolder.addColor(_table, 'color').onChange((e) => {
	tableMat.color.set(e);
}).name('Color'); 
tableFolder.add(table, 'receiveShadow').name('Receive Shadow');
tableFolder.add(tableMat, 'wireframe').name('Wireframe');

//discard
const discardFolder = objectsFolder.addFolder("Discard Pile");
discardFolder.open();
discardFolder.add(discard, 'visible').name('Show');
discardFolder.add(discard.position, 'x', -100, 100, 1).name("X");
discardFolder.add(discard.position, 'y', -100, 100, 1).name("Y");
discardFolder.add(discard.position, 'z', -100, 100, 1).name("Z");
discardFolder.addColor(_discard, 'color').onChange((e) => { discard.color.set(e) }).name("Color");
discardFolder.add(_discard, 'scale_w', 0.0, 3.0, 0.01).onChange((e) => { discard.scale.x = e; }).name("Width");
discardFolder.add(_discard, 'scale_h', 0.0, 3.0, 0.01).onChange((e) => { discard.scale.y = e; }).name("Depth");
discardFolder.add(_discard, 'scale_z', 0.0, 3.0, 0.01).onChange((e) => { discard.scale.z = e; }).name("Height");
discardFolder.add(discardMat, 'wireframe').name('Wireframe');
discardFolder.add(discardOutline, 'visible').name('Outline');
discardFolder.add(discard, 'castShadow').name('Cast Shadow');

//bounce
const bounceFolder = objectsFolder.addFolder("Bounce");
bounceFolder.open();
bounceFolder.add(bounce, 'visible').name("Visible");
bounceFolder.addColor(options, 'bounceColor').onChange(function(e){ bounce.material.color.set(e); }).name("Color");
bounceFolder.add(bounceMat, 'wireframe').name("Wireframe");
bounceFolder.add(_bounce, 'speed', 0, 0.5, 0.01).name("Speed");
bounceFolder.add(_bounce, 'animate').name('Animate');
bounceFolder.add(_bounce, 'player', 0, 3, 1).onChange((e) => {
	console.log(bounce.position);
	const v = _bounce.pos[e];
	bounce.position.set(v[0], v[1], v[2]);
}).name('Player');

//frenzy
// const frenzyFolder = objectsFolder.addFolder("Frenzy");
// frenzyFolder.open();
// frenzyFolder.add(options, 'frenzyEnable', 0, 1).onChange(function(e){
// 	e ? scene.add(frenzy) :	scene.remove(frenzy);
// }).name("Enable");
// frenzyFolder.add(options, 'frenzyWireframe').onChange(function(e){
// 	frenzy.material.wireframe = e;
// }).name("Wireframe");
// frenzyFolder.add(options, 'frenzySpeed', 0, 0.005, 0.0001).name("Speed");
// frenzyFolder.add(options, 'frenzyAnimate', 0, 1).name('Animate');

//window resize
updateCameraFrame();
window.addEventListener('resize', updateCameraFrame);

//animate
// const mousePosition = new THREE.Vector2();
// window.addEventListener('mousemove', function(e) {
// 	mousePosition.x = (e.clientX / this.window.innerWidth) * 2 - 1;
// 	mousePosition.y = -(e.clientY / this.window.innerHeight) * 2 + 1;
// });
// const rayCaster = new THREE.Raycaster();
let bounceStep = 0;
function animate(time) {
	stats.begin();

	xController.updateDisplay();
    yController.updateDisplay();
    zController.updateDisplay();
    fovController.updateDisplay();

	if (_bounce.animate) {
		bounceStep += _bounce.speed;
		bounce.translateY(Math.sin(bounceStep) * -0.05);
		bounce.rotation.y = time * 0.001;
	}

	avatarA.lookAt(camera.position);
	avatarB.lookAt(camera.position);
	avatarC.lookAt(camera.position);
	avatarD.lookAt(camera.position);
	avatarA.rotation.z = 0;
	avatarB.rotation.z = 0;
	avatarC.rotation.z = 0;
	avatarD.rotation.z = 0;

// 	rayCaster.setFromCamera(mousePosition, camera);
// 	const intersects = rayCaster.intersectObjects(scene.children);

// 	for (let i = 0; i < intersects.length; i++) {
// 		if (intersects[i].object.id === bounce.id)
// 			intersects[i].object.material.color.set(0xFF0000);
		
// 		if (intersects[i].object.name === 'theBox') {
// 			bounce.material.color.set(options.bounceColor);
// 			intersects[i].object.rotation.x = time / 1000;
// 			intersects[i].object.rotation.y = time / 1000;
// 		}
// 	}

// 	if (options.frenzyAnimate) {
// 		const speed = options.frenzySpeed;
// 		const t = time * speed;
// 		const pos = frenzy.geometry.attributes.position.array;
// 		for (let i = 0; i < frenzy.geometry.attributes.position.count * 3; i++)
// 			pos[i] = Math.random() * 10 - 5;
// 		frenzy.geometry.attributes.position.needsUpdate = true;
// 	}

	renderer.render(scene, camera);

	stats.end();
}
renderer.setAnimationLoop(animate);