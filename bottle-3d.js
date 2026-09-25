import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const stage = document.querySelector('.bottle-scene');
const artwork = document.querySelector('.hero-art');
if (stage && artwork && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    camera.position.set(0, 0.15, 10.8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xe8f1df, 0x14231c, 2.1));
    const key = new THREE.DirectionalLight(0xffe2a2, 5.2);
    key.position.set(-4, 6, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -5;
    scene.add(key);
    const rim = new THREE.PointLight(0x88e5bd, 36, 16, 2);
    rim.position.set(4, 1.4, -2.8);
    scene.add(rim);
    const softbox = new THREE.PointLight(0xffc46b, 24, 14, 2);
    softbox.position.set(-4, -1, 3.7);
    scene.add(softbox);

    const bottle = new THREE.Group();
    scene.add(bottle);

    const outline = new THREE.Shape();
    outline.moveTo(-1.37, -1.78);
    outline.lineTo(1.37, -1.78);
    outline.quadraticCurveTo(1.59, -1.78, 1.59, -1.55);
    outline.lineTo(1.59, 0.98);
    outline.quadraticCurveTo(1.59, 1.19, 1.39, 1.38);
    outline.lineTo(1.08, 1.68);
    outline.lineTo(-1.08, 1.68);
    outline.lineTo(-1.39, 1.38);
    outline.quadraticCurveTo(-1.59, 1.19, -1.59, 0.98);
    outline.lineTo(-1.59, -1.55);
    outline.quadraticCurveTo(-1.59, -1.78, -1.37, -1.78);
    const glassGeometry = new THREE.ExtrudeGeometry(outline, {
      depth: 0.82, bevelEnabled: true, bevelSegments: 5,
      steps: 1, bevelSize: 0.12, bevelThickness: 0.12, curveSegments: 12
    });
    glassGeometry.computeVertexNormals();
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0x08734d, metalness: 0.14, roughness: 0.17,
      transmission: 0.28, thickness: 1.15, ior: 1.48,
      clearcoat: 1, clearcoatRoughness: 0.08, attenuationColor: new THREE.Color(0x075238),
      attenuationDistance: 2.2
    });
    const body = new THREE.Mesh(glassGeometry, glass);
    body.position.z = -0.41;
    body.castShadow = true;
    body.receiveShadow = true;
    bottle.add(body);

    const inner = new THREE.Mesh(
      new THREE.ShapeGeometry(outline, 12),
      new THREE.MeshPhysicalMaterial({ color: 0x07442f, roughness: 0.26, metalness: 0.08, side: THREE.DoubleSide })
    );
    inner.scale.set(0.93, 0.94, 1);
    inner.position.set(0, -0.02, 0.18);
    bottle.add(inner);

    const gold = new THREE.MeshStandardMaterial({ color: 0xc6a365, metalness: 0.86, roughness: 0.22 });
    const paleGold = new THREE.MeshStandardMaterial({ color: 0xf2dda9, metalness: 0.76, roughness: 0.2 });
    const cylinder = (radiusTop, radiusBottom, height, material, y, z = 0) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 64, 1), material);
      mesh.position.set(0, y, z);
      mesh.castShadow = true;
      bottle.add(mesh);
      return mesh;
    };
    cylinder(0.5, 0.5, 0.24, paleGold, 1.84);
    cylinder(0.62, 0.66, 0.86, gold, 2.37);
    cylinder(0.64, 0.64, 0.08, paleGold, 1.93);

    const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.61, 0.66, 0.1, 64), paleGold);
    capTop.position.set(0, 2.85, 0);
    bottle.add(capTop);
    for (let i = 0; i < 40; i += 1) {
      const angle = (i / 40) * Math.PI * 2;
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.76, 0.018), paleGold);
      rib.position.set(Math.sin(angle) * 0.644, 2.38, Math.cos(angle) * 0.644);
      rib.rotation.y = angle;
      bottle.add(rib);
    }

    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 900;
    labelCanvas.height = 520;
    const ctx = labelCanvas.getContext('2d');
    ctx.fillStyle = '#082e22';
    ctx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
    ctx.strokeStyle = '#c8a768';
    ctx.lineWidth = 5;
    ctx.strokeRect(18, 18, labelCanvas.width - 36, labelCanvas.height - 36);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(31, 31, labelCanvas.width - 62, labelCanvas.height - 62);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f2dfb1';
    ctx.font = '500 65px Georgia, serif';
    ctx.fillText('VELA VELI VO', 450, 190);
    ctx.font = '500 32px Arial, sans-serif';
    ctx.letterSpacing = '10px';
    ctx.fillText('MAIN CHARACTER', 450, 270);
    ctx.font = '400 22px Arial, sans-serif';
    ctx.letterSpacing = '8px';
    ctx.fillText('EAU DE PARFUM  ·  100 ML', 450, 340);
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    labelTexture.colorSpace = THREE.SRGBColorSpace;
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(2.23, 1.29),
      new THREE.MeshStandardMaterial({ map: labelTexture, roughness: 0.42, metalness: 0.12 })
    );
    label.position.set(0, 0.14, 0.53);
    bottle.add(label);

    const glintMaterial = new THREE.MeshBasicMaterial({ color: 0xffedc2, transparent: true, opacity: 0.72 });
    const glint = new THREE.Mesh(new THREE.PlaneGeometry(0.055, 2.55), glintMaterial);
    glint.position.set(-1.23, 0.08, 0.53);
    glint.rotation.z = 0.04;
    bottle.add(glint);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(2.45, 64),
      new THREE.MeshBasicMaterial({ color: 0x28372c, transparent: true, opacity: 0.17, depthWrite: false })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -1.96, 0.08);
    ground.scale.y = 0.33;
    scene.add(ground);

    const sparkleGeometry = new THREE.BufferGeometry();
    const sparkleCount = 68;
    const positions = new Float32Array(sparkleCount * 3);
    const phases = new Float32Array(sparkleCount);
    const baseHeights = new Float32Array(sparkleCount);
    for (let i = 0; i < sparkleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 7.4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6.8;
      baseHeights[i] = positions[i * 3 + 1];
      positions[i * 3 + 2] = -1.2 - Math.random() * 1.4;
      phases[i] = Math.random() * Math.PI * 2;
    }
    sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const sparkles = new THREE.Points(sparkleGeometry, new THREE.PointsMaterial({ color: 0xffe2aa, size: 0.035, transparent: true, opacity: 0.72, sizeAttenuation: true }));
    scene.add(sparkles);

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.position.z = rect.width < 560 ? 12.2 : 10.8;
      camera.updateProjectionMatrix();
      bottle.scale.setScalar(rect.width < 560 ? 0.82 : 1);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    resize();

    let drag = false;
    let lastX = 0;
    let lastY = 0;
    let targetY = 0;
    let keyboardY = 0;
    let targetX = -0.035;
    stage.tabIndex = 0;
    stage.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        keyboardY += event.key === 'ArrowLeft' ? -0.3 : 0.3;
        targetY = keyboardY;
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        targetX = THREE.MathUtils.clamp(targetX + (event.key === 'ArrowUp' ? -0.12 : 0.12), -0.32, 0.32);
      }
    });
    stage.addEventListener('pointerdown', (event) => {
      drag = true;
      lastX = event.clientX;
      lastY = event.clientY;
      stage.classList.add('is-dragging');
      stage.setPointerCapture(event.pointerId);
    });
    stage.addEventListener('pointermove', (event) => {
      if (!drag) return;
      targetY += (event.clientX - lastX) * 0.009;
      targetX = THREE.MathUtils.clamp(targetX + (event.clientY - lastY) * 0.005, -0.32, 0.32);
      lastX = event.clientX;
      lastY = event.clientY;
    });
    const release = () => { drag = false; stage.classList.remove('is-dragging'); };
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);
    stage.addEventListener('lostpointercapture', release);

    artwork.classList.add('has-3d');
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      if (!drag) targetY = keyboardY + Math.sin(t * 0.36) * 0.16;
      bottle.rotation.y += (targetY - bottle.rotation.y) * 0.045;
      bottle.rotation.x += (targetX - bottle.rotation.x) * 0.045;
      bottle.position.y = Math.sin(t * 0.82) * 0.11;
      glint.material.opacity = 0.45 + (Math.sin(t * 1.25) + 1) * 0.16;
      const sparklePositions = sparkleGeometry.attributes.position;
      for (let i = 0; i < sparkleCount; i += 1) {
        sparklePositions.array[i * 3 + 1] = baseHeights[i] + Math.sin(t * 0.38 + phases[i]) * 0.08;
      }
      sparklePositions.needsUpdate = true;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
  } catch (error) {
    console.warn('3D fragrance scene could not start; showing the original artwork instead.', error);
  }
}
