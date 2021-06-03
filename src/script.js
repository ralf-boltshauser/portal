import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import firefliesVertexShader from './shaders/fireflies/vertex.glsl'
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl'
import portalVertexShader from './shaders/portal/vertex.glsl'
import portalFragmentShader from './shaders/portal/fragment.glsl'
/**
 * Base
 */
// Debug


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

const bakedTexture = textureLoader.load('texture.jpg')
bakedTexture.flipY = false; 
bakedTexture.encoding = THREE.sRGBEncoding;
// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)


const bakedMaterial = new THREE.MeshBasicMaterial({map: bakedTexture})

const poleLightMaterial =  new THREE.MeshBasicMaterial({color: 0xffffe5,side: THREE.DoubleSide})
const portalMaterial =  new THREE.ShaderMaterial({
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader,  
    uniforms:
    {
        uTime: { value: 0 }
    },
})

gltfLoader.load(
    'portal.glb',
    (gltf) => {
        const child = gltf.scene.children.find(child => child.name== "baked"); 
        child.material = bakedMaterial;
            
        const poleLightMeshes = gltf.scene.children.filter(child => /pole/.test(child.name));
        
        poleLightMeshes.forEach(pole => pole.material = poleLightMaterial);
        
        const portal = gltf.scene.children.find(child => /portal/.test(child.name));
        
        portal.material = portalMaterial;

        scene.add(gltf.scene)

    }
)

/**
 * Fireflies
 */

const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 30
const positions = new Float32Array(firefliesCount * 3)
const scale = new Float32Array(firefliesCount)
const randomness = new Float32Array(firefliesCount)

for (let i = 0; i < firefliesCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 4; 
    positions[i * 3 + 1] = (Math.random()) * 1 + 0.5; 
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4; 

    scale[i] = Math.random();
    randomness[i] = Math.random(); 
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); 
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scale, 1)); 
firefliesGeometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 1)); 

const firefliesMaterial = new THREE.ShaderMaterial({
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    uniforms: {
        uTime: {value: 0},
        uPixelRatio: {value: Math.min(window.devicePixelRatio, 2)},
        uSize: {value: 40}

    }
}); 
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial); 
scene.add(fireflies); 

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    firefliesMaterial.uniforms.uPixelRatio.vlaue = Math.min(window.devicePixelRatio, 2);
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setClearColor('#201919')
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    firefliesMaterial.uniforms.uTime.value = elapsedTime
    portalMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()