import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import { InteractionManager } from 'three.interactive';

let mixer;

// Scene
const scene = new THREE.Scene();

// Light
const light = new THREE.SpotLight();
light.position.set(5, 5, 5);
scene.add(light);

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(0.8, 1.4, 3.0);

// Clock
const clock = new THREE.Clock();

// Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// InteractionManager
const interactionManager = new InteractionManager(renderer, camera, renderer.domElement);

// GLTF loader
const gltfLoader = new GLTFLoader();

// RGBE loader
const rgbeLoader = new RGBELoader();
rgbeLoader.load('models/environment/studio_small_09_2k.pic', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;

    gltfLoader.load(
        // resource URL
        'models/character/scene.gltf',
        // called when the resource is loaded
        function (gltf) {
            // position the model in the center of the scene
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());

            gltf.scene.position.x += (gltf.scene.position.x - center.x);
            gltf.scene.position.y += (gltf.scene.position.y - center.y);
            gltf.scene.position.z += (gltf.scene.position.z - center.z);

            const model = gltf.scene;

            // Animations
            var animations = gltf.animations;
            mixer = new THREE.AnimationMixer(model);
            var action = mixer.clipAction(animations[0]);
            action.play();

            scene.add(model);

            let objectsHover = [];

            model.traverse(function (child) {
                if (child.children.length === 0) {
                    if (child.material) {
                        child.material = child.material.clone();
                        child.userData.initialEmissive = child.material.emissive.clone();
                        child.material.emissiveIntensity = 0.5;
                    }

                    child.addEventListener('mouseover', function (e) {
                        e.target.material.color.set(0xff0000);
                        document.body.style.cursor = "pointer";
                    })

                    child.addEventListener('mouseout', function (e) {
                        e.target.material.color.set(0xffffff);
                        document.body.style.cursor = "default";
                    })

                    child.addEventListener('mousedown', function (e) {
                        // e.target.scale.set(1.1, 1.1, 1.1);
                        // var bb = new THREE.Box3();
                        // bb.setFromObject(child);
                        // bb.setFromCenterAndSize(e.target);
                    })

                    child.addEventListener('click', function (e) {
                        // e.target.scale.set(2.0, 2.0, 2.0);
                    })

                    interactionManager.add(child);
                }
            });
        },
        // called while loading is progressing
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // called when loading has errors
        function (error) {
            console.log('An error happened');
        }
    );
},
    // called while loading is progressing
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // called when loading has errors
    function (error) {
        console.log('An error happened');
    }
);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener('change', render); // use if there is no animation loop
controls.minDistance = 1;
controls.maxDistance = 3;
controls.target.set(0, 0, 0);
controls.minPolarAngle = Math.PI / 2.5;
controls.maxPolarAngle = Math.PI / 2.5;
controls.minAzimuthAngle = 0; // - Math.PI / 10;
controls.maxAzimuthAngle = 0; // Math.PI / 10;
controls.update();

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

// render function
function render() {
    renderer.render(scene, camera);
}

// animate function
function animate() {
    requestAnimationFrame(animate);

    // update the animation
    var delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    // update interactions
    interactionManager.update();

    render();
};

animate();