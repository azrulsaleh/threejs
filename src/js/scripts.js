import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

// import nebula from '../img/nebula.jpg';
// import stars from '../img/stars.jpg';

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
	45, 
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.set(-10, 30, 30);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
	color: 0xFFFFFF,
	side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;
scene.add(plane);

const boxGeometry = new THREE.BoxGeometry(10, 5);
const boxMaterial = new THREE.MeshStandardMaterial({color: 0x00FF00});
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.y = 5;
box.castShadow = true;
scene.add(box);

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
const sphereMaterial = new THREE.MeshStandardMaterial({
	color: 0x0000FF,
	wireframe: false
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(-10, 10, 0);
sphere.castShadow = true;
scene.add(sphere);

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
scene.add(directionalLight);
directionalLight.position.set(-30, 50, 0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -12;

const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
scene.add(dLightHelper);

const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(dLightShadowHelper);

const spotLight = new THREE.SpotLight(0xFFFFFF);
spotLight.position.set(-20, 20, 0);
spotLight.castShadow = true;
spotLight.angle = 0.5;
spotLight.distance = 100;
spotLight.decay = 2;
spotLight.penumbra = 0.5;
spotLight.intensity = 2000;
scene.add(spotLight);

spotLight.target = sphere;
scene.add(spotLight.target);

const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);

// scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);
// scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01);

renderer.setClearColor(0xE69913);

// const textureLoader = new THREE.TextureLoader();
// scene.background = textureLoader.load(stars);

const gui = new dat.GUI();
const options = {
	sphereColor: '#ffea00',
	wireframe: false,
	speed: 0.01,
	angle: 0.5,
	penumbra: 1,
	intensity: 1000
};
gui.addColor(options, 'sphereColor').onChange(function(e){
	sphere.material.color.set(e);
});
gui.add(options, 'wireframe').onChange(function(e){
	sphere.material.wireframe = e;
});
gui.add(options, 'speed', 0, 0.1);
gui.add(options, 'angle', 0, 1);
gui.add(options, 'penumbra', 0, 1);
gui.add(options, 'intensity', 0, 3000);

let step = 0;

function animate(time) {
	box.rotation.x = time / 1000;
	box.rotation.y = time / 1000;

	step += options.speed;
	sphere.position.y = 10 * Math.abs(Math.sin(step));

	spotLight.angle = options.angle;
	spotLight.penumbra = options.penumbra;
	spotLight.intensity = options.intensity;
	sLightHelper.update();

	renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);