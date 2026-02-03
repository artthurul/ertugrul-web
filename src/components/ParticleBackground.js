/*
 * Date: 2026-02-02
 * Developer: Ertuğrul Eren Durak
 * Copyright © 2026 All Rights Reserved.
 * File Purpose: Three.js particle system creating an interactive 
 * futuristic text animation with mouse-reactive particles.
 * Based on advanced particle morphing technique with raycasting.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

const ParticleBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scene, camera, renderer, particles, geometryCopy, planeArea;
    let raycaster, mouse, colorChange;
    let isMouseDown = false;

    const config = {
      text: 'ERTUĞRUL EREN\n    DURAK',
      amount: 1500,
      particleSize: 1,
      textSize: 16,
      area: 250,
      ease: 0.05,
    };

    // Initialize scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      1,
      10000
    );
    camera.position.set(0, 0, 100);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(-200, 200);
    colorChange = new THREE.Color();

    // Helper functions
    function visibleHeightAtZDepth(depth, cam) {
      const cameraOffset = cam.position.z;
      if (depth < cameraOffset) depth -= cameraOffset;
      else depth += cameraOffset;
      const vFOV = (cam.fov * Math.PI) / 180;
      return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
    }

    function visibleWidthAtZDepth(depth, cam) {
      const height = visibleHeightAtZDepth(depth, cam);
      return height * cam.aspect;
    }

    function distance(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }

    // Create invisible plane for mouse interaction
    const planeGeometry = new THREE.PlaneGeometry(
      visibleWidthAtZDepth(100, camera),
      visibleHeightAtZDepth(100, camera)
    );
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0 });
    planeArea = new THREE.Mesh(planeGeometry, planeMaterial);
    planeArea.visible = false;
    scene.add(planeArea); // Add to scene so raycaster can interact with it

    // Load font and particle texture
    const loader = new FontLoader();
    const textureLoader = new THREE.TextureLoader();
    
    loader.load(
      'https://threejs.org/examples/fonts/droid/droid_sans_mono_regular.typeface.json',
      (font) => {
        textureLoader.load(
          'https://res.cloudinary.com/dfvtkoboz/image/upload/v1605013866/particle_a64uzf.png',
          (particleTexture) => {
            createText(font, particleTexture);
          },
          undefined,
          (error) => {
            console.error('Particle texture loading error:', error);
          }
        );
      },
      undefined,
      (error) => {
        console.error('Font loading error:', error);
      }
    );

    function createText(font, particleTexture) {
      const thePoints = [];
      let shapes = font.generateShapes(config.text, config.textSize);
      const geometry = new THREE.ShapeGeometry(shapes);
      geometry.computeBoundingBox();

      const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
      const yMid = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2.85;

      geometry.center();

      // Process holes (important for letters like O, A, D, etc.)
      const holeShapes = [];
      for (let q = 0; q < shapes.length; q++) {
        const shape = shapes[q];
        if (shape.holes && shape.holes.length > 0) {
          for (let j = 0; j < shape.holes.length; j++) {
            const hole = shape.holes[j];
            holeShapes.push(hole);
          }
        }
      }
      shapes.push.apply(shapes, holeShapes);

      const colors = [];
      const sizes = [];

      // Set initial color to white/cyan so particles are visible
      colorChange.setHSL(0.5, 1, 1);

      for (let x = 0; x < shapes.length; x++) {
        const shape = shapes[x];
        const amountPoints = shape.type === 'Path' ? config.amount / 2 : config.amount;
        const points = shape.getSpacedPoints(amountPoints);

        points.forEach((element) => {
          const a = new THREE.Vector3(element.x, element.y, 0);
          thePoints.push(a);
          colors.push(colorChange.r, colorChange.g, colorChange.b);
          sizes.push(1);
        });
      }

      const geoParticles = new THREE.BufferGeometry().setFromPoints(thePoints);
      geoParticles.translate(xMid - 5, yMid - 10, 0); // -5 x offset (left), -10 y offset to center
      geoParticles.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
      geoParticles.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

      const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(0xffffff) },
          pointTexture: { value: particleTexture },
        },
        vertexShader: `
          attribute float size;
          attribute vec3 customColor;
          varying vec3 vColor;

          void main() {
            vColor = customColor;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform sampler2D pointTexture;
          varying vec3 vColor;

          void main() {
            gl_FragColor = vec4(color * vColor, 1.0);
            gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
          }
        `,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
      });

      particles = new THREE.Points(geoParticles, shaderMaterial);
      scene.add(particles);

      geometryCopy = new THREE.BufferGeometry();
      geometryCopy.copy(particles.geometry);
      
      console.log('Particles created successfully with', thePoints.length, 'points');
    }

    function render() {
      if (!particles) return;

      const time = ((0.001 * performance.now()) % 12) / 12;
      const zigzagTime = (1 + Math.sin(time * 2 * Math.PI)) / 6;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(planeArea);

      if (intersects.length > 0) {
        const pos = particles.geometry.attributes.position;
        const copy = geometryCopy.attributes.position;
        const coulors = particles.geometry.attributes.customColor;
        const size = particles.geometry.attributes.size;

        const mx = intersects[0].point.x;
        const my = intersects[0].point.y;

        for (let i = 0, l = pos.count; i < l; i++) {
          const initX = copy.getX(i);
          const initY = copy.getY(i);
          const initZ = copy.getZ(i);

          let px = pos.getX(i);
          let py = pos.getY(i);
          let pz = pos.getZ(i);

          // Default color
          colorChange.setHSL(0.5, 1, 1);
          coulors.setXYZ(i, colorChange.r, colorChange.g, colorChange.b);
          coulors.needsUpdate = true;

          size.array[i] = config.particleSize;
          size.needsUpdate = true;

          let dx = mx - px;
          let dy = my - py;

          const mouseDistance = distance(mx, my, px, py);
          const d = (dx = mx - px) * dx + (dy = my - py) * dy;
          const f = -config.area / d;

          if (isMouseDown) {
            const t = Math.atan2(dy, dx);
            px -= f * Math.cos(t);
            py -= f * Math.sin(t);

            colorChange.setHSL(0.5 + zigzagTime, 1.0, 0.5);
            coulors.setXYZ(i, colorChange.r, colorChange.g, colorChange.b);
            coulors.needsUpdate = true;

            if (px > initX + 70 || px < initX - 70 || py > initY + 70 || py < initY - 70) {
              colorChange.setHSL(0.15, 1.0, 0.5);
              coulors.setXYZ(i, colorChange.r, colorChange.g, colorChange.b);
              coulors.needsUpdate = true;
            }
          } else {
            if (mouseDistance < config.area) {
              if (i % 5 === 0) {
                const t = Math.atan2(dy, dx);
                px -= 0.03 * Math.cos(t);
                py -= 0.03 * Math.sin(t);

                colorChange.setHSL(0.15, 1.0, 0.5);
                coulors.setXYZ(i, colorChange.r, colorChange.g, colorChange.b);
                coulors.needsUpdate = true;

                size.array[i] = config.particleSize / 1.2;
                size.needsUpdate = true;
              } else {
                const t = Math.atan2(dy, dx);
                px += f * Math.cos(t);
                py += f * Math.sin(t);

                pos.setXYZ(i, px, py, pz);
                pos.needsUpdate = true;

                size.array[i] = config.particleSize * 1.3;
                size.needsUpdate = true;
              }

              if (px > initX + 10 || px < initX - 10 || py > initY + 10 || py < initY - 10) {
                colorChange.setHSL(0.15, 1.0, 0.5);
                coulors.setXYZ(i, colorChange.r, colorChange.g, colorChange.b);
                coulors.needsUpdate = true;

                size.array[i] = config.particleSize / 1.8;
                size.needsUpdate = true;
              }
            }
          }

          px += (initX - px) * config.ease;
          py += (initY - py) * config.ease;
          pz += (initZ - pz) * config.ease;

          pos.setXYZ(i, px, py, pz);
          pos.needsUpdate = true;
        }
      }

      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(render);

    // Event handlers
    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const onMouseDown = () => {
      isMouseDown = true;
      config.ease = 0.01;
    };

    const onMouseUp = () => {
      isMouseDown = false;
      config.ease = 0.05;
    };

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      
      if (renderer) {
        renderer.setAnimationLoop(null);
      }
      
      if (container && renderer && renderer.domElement) {
        try {
          container.removeChild(renderer.domElement);
        } catch (e) {
          console.warn('Cleanup error:', e);
        }
      }
      
      if (scene) scene.clear();
      if (renderer) renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 1 }} />;
};

export default ParticleBackground;
