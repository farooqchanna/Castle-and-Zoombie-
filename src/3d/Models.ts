import * as THREE from 'three';
import { GameMaterials } from './Materials';
import { SoldierRank } from '../systems/CitizenManager';

export class ModelFactory {
  // Create the Fortress / Castle Compound
  public static createCastle(wallHpLevel: number = 1): THREE.Group {
    const castle = new THREE.Group();
    castle.name = 'CastleGroup';

    // Main Curtain Wall (Stone)
    const wallGeo = new THREE.BoxGeometry(26, 6.5, 3.5);
    const mainWall = new THREE.Mesh(wallGeo, GameMaterials.stoneWall);
    mainWall.position.set(0, 3.25, -6);
    mainWall.castShadow = true;
    mainWall.receiveShadow = true;
    castle.add(mainWall);

    // Crenellations / Merlons along the top edge
    const merlonGeo = new THREE.BoxGeometry(1.6, 1.2, 0.8);
    for (let x = -12; x <= 12; x += 2.4) {
      if (Math.abs(x) < 2) continue; // Gap for cauldron
      const merlon = new THREE.Mesh(merlonGeo, GameMaterials.stoneWall);
      merlon.position.set(x, 7.1, -4.4);
      merlon.castShadow = true;
      castle.add(merlon);
    }

    // Rear wall / Walkway platform
    const platformGeo = new THREE.BoxGeometry(25, 0.4, 2.5);
    const platform = new THREE.Mesh(platformGeo, GameMaterials.castleWood);
    platform.position.set(0, 6.3, -6);
    platform.receiveShadow = true;
    castle.add(platform);

    // Left Flanking Tower
    const towerGeo = new THREE.CylinderGeometry(2.8, 3.2, 10, 16);
    const leftTower = new THREE.Mesh(towerGeo, GameMaterials.stoneWall);
    leftTower.position.set(-13.5, 5, -6);
    leftTower.castShadow = true;
    leftTower.receiveShadow = true;
    castle.add(leftTower);

    // Left Tower Conical Roof
    const roofGeo = new THREE.ConeGeometry(3.5, 4, 16);
    const leftRoof = new THREE.Mesh(roofGeo, GameMaterials.towerRoof);
    leftRoof.position.set(-13.5, 12, -6);
    leftRoof.castShadow = true;
    castle.add(leftRoof);

    // Right Flanking Tower
    const rightTower = new THREE.Mesh(towerGeo, GameMaterials.stoneWall);
    rightTower.position.set(13.5, 5, -6);
    rightTower.castShadow = true;
    rightTower.receiveShadow = true;
    castle.add(rightTower);

    // Right Tower Conical Roof
    const rightRoof = new THREE.Mesh(roofGeo, GameMaterials.towerRoof);
    rightRoof.position.set(13.5, 12, -6);
    rightRoof.castShadow = true;
    castle.add(rightRoof);

    // Fortified Arched Gate
    const gateFrameGeo = new THREE.BoxGeometry(5.2, 5.2, 3.8);
    const gateFrame = new THREE.Mesh(gateFrameGeo, GameMaterials.stoneWall);
    gateFrame.position.set(0, 2.6, -5.9);
    castle.add(gateFrame);

    // Wooden Gate Doors
    const doorGeo = new THREE.BoxGeometry(4.2, 4.4, 0.6);
    const door = new THREE.Mesh(doorGeo, GameMaterials.castleWood);
    door.position.set(0, 2.2, -4.3);
    door.name = 'GateDoor';
    door.castShadow = true;
    door.receiveShadow = true;
    castle.add(door);

    // Iron reinforcement bands on gate
    const bandGeo = new THREE.BoxGeometry(4.3, 0.35, 0.7);
    const band1 = new THREE.Mesh(bandGeo, GameMaterials.ironTrim);
    band1.position.set(0, 1.2, -4.3);
    castle.add(band1);
    const band2 = new THREE.Mesh(bandGeo, GameMaterials.ironTrim);
    band2.position.set(0, 3.2, -4.3);
    castle.add(band2);

    // Wall iron plating for higher levels
    if (wallHpLevel > 1) {
      const ironPlateGeo = new THREE.BoxGeometry(10, 3, 0.4);
      const leftPlate = new THREE.Mesh(ironPlateGeo, GameMaterials.ironTrim);
      leftPlate.position.set(-6, 2.5, -4.1);
      castle.add(leftPlate);

      const rightPlate = new THREE.Mesh(ironPlateGeo, GameMaterials.ironTrim);
      rightPlate.position.set(6, 2.5, -4.1);
      castle.add(rightPlate);
    }

    // Torches
    const torch1 = this.createTorch();
    torch1.position.set(-3.2, 4.5, -4.0);
    castle.add(torch1);

    const torch2 = this.createTorch();
    torch2.position.set(3.2, 4.5, -4.0);
    castle.add(torch2);

    const torchLeftTower = this.createTorch();
    torchLeftTower.position.set(-13.5, 9, -3.2);
    castle.add(torchLeftTower);

    const torchRightTower = this.createTorch();
    torchRightTower.position.set(13.5, 9, -3.2);
    castle.add(torchRightTower);

    // Banners
    const bannerGeo = new THREE.BoxGeometry(1.2, 3.5, 0.05);
    const bannerMat = new THREE.MeshStandardMaterial({ color: 0x1976d2, roughness: 0.7 });
    const leftBanner = new THREE.Mesh(bannerGeo, bannerMat);
    leftBanner.position.set(-13.5, 6, -3.1);
    castle.add(leftBanner);

    const rightBanner = new THREE.Mesh(bannerGeo, bannerMat);
    rightBanner.position.set(13.5, 6, -3.1);
    castle.add(rightBanner);

    return castle;
  }

  public static createTorch(): THREE.Group {
    const torch = new THREE.Group();
    torch.name = 'Torch';

    const sconceGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
    const sconce = new THREE.Mesh(sconceGeo, GameMaterials.ironTrim);
    sconce.rotation.z = 0.3;
    torch.add(sconce);

    const flameGeo = new THREE.ConeGeometry(0.18, 0.45, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff7700 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0.1, 0.35, 0);
    flame.name = 'Flame';
    torch.add(flame);

    const light = new THREE.PointLight(0xffaa44, 2.0, 14, 1.5);
    light.position.set(0.1, 0.4, 0.2);
    light.name = 'TorchLight';
    torch.add(light);

    return torch;
  }

  public static createCauldron(): THREE.Group {
    const cauldron = new THREE.Group();
    cauldron.name = 'Cauldron';

    const potGeo = new THREE.CylinderGeometry(0.8, 0.5, 0.9, 12);
    const pot = new THREE.Mesh(potGeo, GameMaterials.ironTrim);
    pot.castShadow = true;
    cauldron.add(pot);

    const oilGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.08, 12);
    const oil = new THREE.Mesh(oilGeo, GameMaterials.moltenOil);
    oil.position.y = 0.38;
    cauldron.add(oil);

    const barGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8);
    const bar = new THREE.Mesh(barGeo, GameMaterials.ironTrim);
    bar.rotation.z = Math.PI / 2;
    bar.position.y = 0.35;
    cauldron.add(bar);

    return cauldron;
  }

  // 3D Defender Model
  public static createDefender(rank: SoldierRank = 'rookie'): THREE.Group {
    const defender = new THREE.Group();
    defender.name = 'Defender';

    let clothMat = GameMaterials.clothRookie;
    if (rank === 'captain') clothMat = GameMaterials.clothCaptain;
    if (rank === 'major') clothMat = GameMaterials.clothMajor;
    if (rank === 'archer') clothMat = GameMaterials.clothArcher;

    const torsoGeo = new THREE.BoxGeometry(0.7, 0.85, 0.45);
    const torso = new THREE.Mesh(torsoGeo, clothMat);
    torso.position.y = 0.95;
    torso.castShadow = true;
    defender.add(torso);

    const headGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
    const head = new THREE.Mesh(headGeo, GameMaterials.skinHuman);
    head.position.y = 1.6;
    head.castShadow = true;
    defender.add(head);

    const helmGeo = new THREE.BoxGeometry(0.46, 0.22, 0.46);
    const helmMat = (rank === 'major' || rank === 'captain') ? GameMaterials.ironTrim : clothMat;
    const helm = new THREE.Mesh(helmGeo, helmMat);
    helm.position.y = 1.78;
    defender.add(helm);

    const armGeo = new THREE.BoxGeometry(0.2, 0.65, 0.2);
    const leftArm = new THREE.Mesh(armGeo, clothMat);
    leftArm.position.set(-0.46, 0.95, 0.2);
    leftArm.rotation.x = -Math.PI / 4;
    leftArm.name = 'LeftArm';
    defender.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, clothMat);
    rightArm.position.set(0.46, 0.95, 0);
    rightArm.name = 'RightArm';
    defender.add(rightArm);

    const legGeo = new THREE.BoxGeometry(0.24, 0.65, 0.24);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.2, 0.32, 0);
    defender.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.2, 0.32, 0);
    defender.add(rightLeg);

    const bow = this.createBow();
    bow.position.set(-0.52, 0.95, 0.55);
    bow.name = 'Bow';
    defender.add(bow);

    const quiverGeo = new THREE.CylinderGeometry(0.14, 0.1, 0.7, 8);
    const quiver = new THREE.Mesh(quiverGeo, GameMaterials.castleWood);
    quiver.position.set(0.2, 1.1, -0.32);
    quiver.rotation.z = -0.3;
    defender.add(quiver);

    return defender;
  }

  // 3D Collector Model
  public static createCollector(): THREE.Group {
    const collector = new THREE.Group();
    collector.name = 'Collector';

    const torsoGeo = new THREE.BoxGeometry(0.65, 0.8, 0.4);
    const torso = new THREE.Mesh(torsoGeo, GameMaterials.clothCollector);
    torso.position.y = 0.9;
    torso.castShadow = true;
    collector.add(torso);

    const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const head = new THREE.Mesh(headGeo, GameMaterials.skinHuman);
    head.position.y = 1.5;
    head.castShadow = true;
    collector.add(head);

    const capGeo = new THREE.BoxGeometry(0.44, 0.18, 0.44);
    const cap = new THREE.Mesh(capGeo, GameMaterials.clothCollector);
    cap.position.y = 1.68;
    collector.add(cap);

    const armGeo = new THREE.BoxGeometry(0.18, 0.6, 0.18);
    const leftArm = new THREE.Mesh(armGeo, GameMaterials.clothCollector);
    leftArm.position.set(-0.42, 0.9, 0);
    leftArm.name = 'LeftArm';
    collector.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, GameMaterials.clothCollector);
    rightArm.position.set(0.42, 0.9, 0);
    rightArm.name = 'RightArm';
    collector.add(rightArm);

    const legGeo = new THREE.BoxGeometry(0.22, 0.6, 0.22);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x424242, roughness: 0.9 });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.18, 0.3, 0);
    leftLeg.name = 'LeftLeg';
    collector.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.18, 0.3, 0);
    rightLeg.name = 'RightLeg';
    collector.add(rightLeg);

    const sackGeo = new THREE.SphereGeometry(0.32, 8, 8);
    const sackMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.8 });
    const sack = new THREE.Mesh(sackGeo, sackMat);
    sack.position.set(-0.35, 0.7, -0.2);
    collector.add(sack);

    return collector;
  }

  public static createBow(): THREE.Group {
    const bow = new THREE.Group();
    bow.name = 'Bow';

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, -0.65, 0),
      new THREE.Vector3(0.2, 0, 0.15),
      new THREE.Vector3(0, 0.65, 0)
    );
    const bowGeo = new THREE.TubeGeometry(curve, 12, 0.04, 6, false);
    const bowMesh = new THREE.Mesh(bowGeo, GameMaterials.castleWood);
    bow.add(bowMesh);

    const stringGeo = new THREE.CylinderGeometry(0.01, 0.01, 1.3, 4);
    const stringMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
    const stringMesh = new THREE.Mesh(stringGeo, stringMat);
    stringMesh.position.set(0, 0, 0);
    bow.add(stringMesh);

    return bow;
  }

  public static createArrow(): THREE.Group {
    const arrow = new THREE.Group();
    arrow.name = 'Arrow';

    const shaftGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.1, 6);
    const shaft = new THREE.Mesh(shaftGeo, GameMaterials.arrowShaft);
    shaft.rotation.x = Math.PI / 2;
    arrow.add(shaft);

    const tipGeo = new THREE.ConeGeometry(0.08, 0.22, 4);
    const tip = new THREE.Mesh(tipGeo, GameMaterials.arrowTip);
    tip.rotation.x = Math.PI / 2;
    tip.position.z = 0.65;
    arrow.add(tip);

    const fletchGeo = new THREE.BoxGeometry(0.01, 0.12, 0.22);
    const fletch1 = new THREE.Mesh(fletchGeo, GameMaterials.arrowFletchRed);
    fletch1.position.z = -0.45;
    arrow.add(fletch1);

    const fletch2 = new THREE.Mesh(fletchGeo, GameMaterials.arrowFletchGold);
    fletch2.rotation.z = Math.PI / 2;
    fletch2.position.z = -0.45;
    arrow.add(fletch2);

    return arrow;
  }

  public static createCoin(): THREE.Group {
    const coin = new THREE.Group();
    coin.name = 'Coin';

    const coinGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16);
    const coinMesh = new THREE.Mesh(coinGeo, GameMaterials.goldCoin);
    coinMesh.rotation.x = Math.PI / 2;
    coinMesh.castShadow = true;
    coin.add(coinMesh);

    return coin;
  }

  // =========================================================================
  // CARTOON BOBBLEHEAD ZOMBIE BUILDER (Tim Burton / PvZ Stylized 3D)
  // Matching the user's provided samples exactly!
  // =========================================================================

  public static createZombie(type: 'walker' | 'runner' | 'tank' | 'exploder' | 'siege' | 'boss'): THREE.Group {
    const zombie = new THREE.Group();
    zombie.name = `Zombie_${type}`;

    // Select skin and clothing materials based on type & reference images
    let skinMat = GameMaterials.zombieSkinOlive;
    let shirtMat = GameMaterials.clothRedShirt;
    let pantsMat = GameMaterials.clothKhakiPants;
    let eyeLeftMat = GameMaterials.eyeMatNormal;
    let eyeRightMat = GameMaterials.eyeMatBloodshot;
    let hasSpikyHair = true;
    let hasForeheadStitch = true;
    let scale = 1.0;

    if (type === 'walker') {
      // Direct match to Image 1 & 3: Kid Bobblehead Zombie
      skinMat = GameMaterials.zombieSkinOlive;
      shirtMat = GameMaterials.clothRedShirt;
      pantsMat = GameMaterials.clothKhakiPants;
      eyeLeftMat = GameMaterials.eyeMatNormal;
      eyeRightMat = GameMaterials.eyeMatBloodshot;
      hasSpikyHair = true;
      hasForeheadStitch = true;
    } else if (type === 'runner') {
      // Direct match to Image 2: Bald Overcoat Bobblehead
      skinMat = GameMaterials.zombieSkinPaleYellow;
      shirtMat = GameMaterials.clothDarkCoat;
      pantsMat = GameMaterials.clothDarkPants;
      eyeLeftMat = GameMaterials.eyeMatYellow;
      eyeRightMat = GameMaterials.eyeMatYellow;
      hasSpikyHair = false; // Bald bulbous head
      hasForeheadStitch = true;
    } else if (type === 'tank') {
      // Heavy Armored Cartoon Brute
      skinMat = GameMaterials.zombieSkinTank;
      shirtMat = GameMaterials.clothDarkCoat;
      pantsMat = GameMaterials.clothDarkPants;
      eyeLeftMat = GameMaterials.eyeMatBloodshot;
      eyeRightMat = GameMaterials.eyeMatNormal;
      hasSpikyHair = false;
      hasForeheadStitch = true;
      scale = 1.25;
    } else if (type === 'exploder') {
      // Bloated Round Balloon Bobblehead
      skinMat = GameMaterials.zombieSkinExploder;
      shirtMat = GameMaterials.clothOrangeShirt;
      pantsMat = GameMaterials.clothDarkPants;
      eyeLeftMat = GameMaterials.eyeMatSpiral;
      eyeRightMat = GameMaterials.eyeMatSpiral;
      hasSpikyHair = false;
      hasForeheadStitch = false;
    } else if (type === 'siege') {
      // Siege Fiend with Sling
      skinMat = GameMaterials.zombieSkinTeal;
      shirtMat = GameMaterials.clothOrangeShirt;
      pantsMat = GameMaterials.clothKhakiPants;
      eyeLeftMat = GameMaterials.eyeMatNormal;
      eyeRightMat = GameMaterials.eyeMatYellow;
      hasSpikyHair = true;
      hasForeheadStitch = true;
    } else if (type === 'boss') {
      // Mega Gargantuan Boss Bobblehead
      skinMat = GameMaterials.zombieSkinTank;
      shirtMat = GameMaterials.clothDarkCoat;
      pantsMat = GameMaterials.clothDarkPants;
      eyeLeftMat = GameMaterials.eyeMatBloodshot;
      eyeRightMat = GameMaterials.eyeMatBloodshot;
      hasSpikyHair = true;
      hasForeheadStitch = true;
      scale = 2.2;
    }

    // -------------------------------------------------------------
    // 1. CARTOON BOBBLEHEAD (HEAD GROUP - wobbles during walking)
    // -------------------------------------------------------------
    const headGroup = new THREE.Group();
    headGroup.name = 'HeadGroup';
    // Position head on top of the small torso
    headGroup.position.set(0, 1.5, 0);

    // Bulbous Head Sphere (oversized ~45% of entire body height!)
    const headGeo = new THREE.SphereGeometry(0.72, 22, 18);
    // Slightly squash and flare for cartoon chin/cheek shape
    headGeo.scale(1.08, 0.98, 0.95);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.name = 'Head';
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Big Floppy Cup Ears on Sides (Left & Right)
    const earGeo = new THREE.TorusGeometry(0.18, 0.05, 8, 16);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.76, 0.02, 0);
    leftEar.rotation.y = Math.PI / 2.3;
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.76, 0.02, 0);
    rightEar.rotation.y = -Math.PI / 2.3;
    headGroup.add(rightEar);

    // Sunken Dark Eye Sockets
    const socketGeo = new THREE.TorusGeometry(0.33, 0.04, 8, 20);
    const leftSocket = new THREE.Mesh(socketGeo, GameMaterials.eyeSocketDark);
    leftSocket.position.set(-0.31, 0.12, 0.54);
    headGroup.add(leftSocket);

    const rightSocket = new THREE.Mesh(socketGeo, GameMaterials.eyeSocketDark);
    rightSocket.position.set(0.31, 0.12, 0.54);
    headGroup.add(rightSocket);

    // Giant Bulging Glossy Cartoon Eyes!
    const eyeGeo = new THREE.SphereGeometry(0.32, 18, 16);

    const leftEye = new THREE.Mesh(eyeGeo, eyeLeftMat);
    leftEye.position.set(-0.31, 0.12, 0.52);
    // Rotate eye so pupil faces forward
    leftEye.rotation.y = -Math.PI / 2;
    leftEye.castShadow = true;
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeRightMat);
    rightEye.position.set(0.31, 0.12, 0.52);
    rightEye.rotation.y = -Math.PI / 2;
    rightEye.castShadow = true;
    headGroup.add(rightEye);

    // Tiny Decaying Cartoon Button Nose
    const noseGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.position.set(0, -0.06, 0.68);
    headGroup.add(nose);

    // Open Gaping Mouth Cavity
    const mouthGeo = new THREE.BoxGeometry(0.42, 0.22, 0.15);
    const mouth = new THREE.Mesh(mouthGeo, GameMaterials.mouthCavity);
    mouth.position.set(0, -0.32, 0.6);
    headGroup.add(mouth);

    // Crooked Yellowish Rotten Teeth
    const toothGeo = new THREE.BoxGeometry(0.07, 0.1, 0.05);

    // Bottom crooked teeth
    const toothB1 = new THREE.Mesh(toothGeo, GameMaterials.rottenTeeth);
    toothB1.position.set(-0.12, -0.28, 0.65);
    toothB1.rotation.z = -0.15;
    headGroup.add(toothB1);

    const toothB2 = new THREE.Mesh(toothGeo, GameMaterials.rottenTeeth);
    toothB2.position.set(0.02, -0.27, 0.65);
    toothB2.rotation.z = 0.1;
    headGroup.add(toothB2);

    const toothB3 = new THREE.Mesh(toothGeo, GameMaterials.rottenTeeth);
    toothB3.position.set(0.14, -0.29, 0.65);
    toothB3.rotation.z = -0.2;
    headGroup.add(toothB3);

    // Top crooked teeth
    const toothT1 = new THREE.Mesh(toothGeo, GameMaterials.rottenTeeth);
    toothT1.position.set(-0.08, -0.23, 0.65);
    toothT1.rotation.z = 0.2;
    headGroup.add(toothT1);

    const toothT2 = new THREE.Mesh(toothGeo, GameMaterials.rottenTeeth);
    toothT2.position.set(0.09, -0.24, 0.65);
    toothT2.rotation.z = -0.12;
    headGroup.add(toothT2);

    // Forehead Surgical Stitches / Scar (as in Reference 1 & 2)
    if (hasForeheadStitch) {
      // Main dark scar seam
      const seamGeo = new THREE.BoxGeometry(0.35, 0.025, 0.04);
      const seam = new THREE.Mesh(seamGeo, GameMaterials.eyeSocketDark);
      seam.position.set(0.18, 0.52, 0.52);
      seam.rotation.z = 0.4;
      headGroup.add(seam);

      // Cross stitches
      for (let s = -2; s <= 2; s++) {
        const stitchCross = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.03), GameMaterials.stitchThread);
        stitchCross.position.set(0.18 + s * 0.06, 0.52 + s * 0.025, 0.53);
        stitchCross.rotation.z = -0.7;
        headGroup.add(stitchCross);
      }
    }

    // Messy Wild Spiky Hair Strands (as in Reference 1)
    if (hasSpikyHair) {
      const hairGroup = new THREE.Group();
      hairGroup.name = 'HairGroup';

      const spikeGeo = new THREE.ConeGeometry(0.08, 0.38, 4);
      const hairCount = 22;

      for (let i = 0; i < hairCount; i++) {
        const spike = new THREE.Mesh(spikeGeo, GameMaterials.cartoonHairDark);
        const theta = (i / hairCount) * Math.PI * 2;
        const radius = 0.35 + Math.random() * 0.25;
        const yOffset = 0.58 + Math.random() * 0.12;

        spike.position.set(Math.cos(theta) * radius, yOffset, Math.sin(theta) * radius * 0.85);
        spike.rotation.x = (Math.random() - 0.5) * 0.8 + (Math.sin(theta) > 0 ? 0.3 : -0.3);
        spike.rotation.z = (Math.random() - 0.5) * 0.8 + (Math.cos(theta) > 0 ? -0.4 : 0.4);
        spike.rotation.y = Math.random() * Math.PI;
        hairGroup.add(spike);
      }
      headGroup.add(hairGroup);
    }

    // Tank Helmet
    if (type === 'tank') {
      const helmGeo = new THREE.CylinderGeometry(0.68, 0.76, 0.45, 12);
      const helm = new THREE.Mesh(helmGeo, GameMaterials.ironTrim);
      helm.position.set(0, 0.55, 0);
      headGroup.add(helm);

      // Horn spikes
      const hornGeo = new THREE.ConeGeometry(0.14, 0.55, 6);
      const leftHorn = new THREE.Mesh(hornGeo, GameMaterials.ironTrim);
      leftHorn.position.set(-0.6, 0.75, 0);
      leftHorn.rotation.z = 0.6;
      headGroup.add(leftHorn);

      const rightHorn = new THREE.Mesh(hornGeo, GameMaterials.ironTrim);
      rightHorn.position.set(0.6, 0.75, 0);
      rightHorn.rotation.z = -0.6;
      headGroup.add(rightHorn);

      // Prominent bottom tusks
      const tuskGeo = new THREE.ConeGeometry(0.06, 0.25, 4);
      const tuskL = new THREE.Mesh(tuskGeo, GameMaterials.rottenTeeth);
      tuskL.position.set(-0.16, -0.22, 0.68);
      tuskL.rotation.x = -Math.PI;
      headGroup.add(tuskL);

      const tuskR = new THREE.Mesh(tuskGeo, GameMaterials.rottenTeeth);
      tuskR.position.set(0.16, -0.22, 0.68);
      tuskR.rotation.x = -Math.PI;
      headGroup.add(tuskR);
    }

    // Boss Crown
    if (type === 'boss') {
      const crownGeo = new THREE.CylinderGeometry(0.72, 0.68, 0.3, 10);
      const crown = new THREE.Mesh(crownGeo, GameMaterials.goldCoin);
      crown.position.set(0, 0.75, 0);
      headGroup.add(crown);
    }

    zombie.add(headGroup);

    // -------------------------------------------------------------
    // 2. SPINDLY NECK & SMALL STYLIZED TORSO
    // -------------------------------------------------------------
    // Skinny neck
    const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.3, 10);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 1.15, 0);
    zombie.add(neck);

    // Torso (tapered cartoon chest)
    const torsoGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.72, 12);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.set(0, 0.75, 0);
    torso.name = 'Belly';
    torso.castShadow = true;
    zombie.add(torso);

    // Tattered jagged bottom hem fringe
    const fringeGeo = new THREE.ConeGeometry(0.08, 0.18, 4);
    for (let f = 0; f < 8; f++) {
      const angle = (f / 8) * Math.PI * 2;
      const fringe = new THREE.Mesh(fringeGeo, shirtMat);
      fringe.position.set(Math.cos(angle) * 0.42, 0.34, Math.sin(angle) * 0.42);
      fringe.rotation.x = Math.PI;
      zombie.add(fringe);
    }

    // Exploder Glowing Pustules
    if (type === 'exploder') {
      // Swollen pear-shaped belly
      torso.scale.set(1.4, 1.1, 1.35);

      const pGeo = new THREE.SphereGeometry(0.16, 8, 8);
      const p1 = new THREE.Mesh(pGeo, GameMaterials.exploderPustule);
      p1.position.set(-0.35, 0.85, 0.45);
      zombie.add(p1);

      const p2 = new THREE.Mesh(pGeo, GameMaterials.exploderPustule);
      p2.position.set(0.32, 0.7, 0.48);
      zombie.add(p2);

      const p3 = new THREE.Mesh(pGeo, GameMaterials.exploderPustule);
      p3.position.set(0.05, 0.95, 0.52);
      zombie.add(p3);
    }

    // -------------------------------------------------------------
    // 3. SPINDLY ARMS & SPLAYED CARTOON ZOMBIE HANDS
    // -------------------------------------------------------------
    const createArmWithHand = (isLeft: boolean) => {
      const armGroup = new THREE.Group();
      armGroup.name = isLeft ? 'LeftArm' : 'RightArm';

      const sign = isLeft ? -1 : 1;

      // Arm sleeve & upper arm
      const armUpperGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.45, 8);
      const armUpper = new THREE.Mesh(armUpperGeo, shirtMat);
      armUpper.position.set(0, -0.22, 0);
      armGroup.add(armUpper);

      // Bare green forearm reaching forward in classic zombie pose
      const forearmGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.45, 8);
      const forearm = new THREE.Mesh(forearmGeo, skinMat);
      forearm.position.set(0, -0.45, 0.22);
      forearm.rotation.x = Math.PI / 3;
      armGroup.add(forearm);

      // Splayed Cartoon Zombie Hand (Large flat palm with 4 clawed fingers)
      const palmGeo = new THREE.BoxGeometry(0.16, 0.06, 0.16);
      const palm = new THREE.Mesh(palmGeo, skinMat);
      palm.position.set(0, -0.65, 0.42);
      palm.rotation.x = Math.PI / 4;
      armGroup.add(palm);

      // 4 Spread-out cartoon fingers
      const fingerGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.18, 6);
      for (let fin = -1.5; fin <= 1.5; fin += 1) {
        const finger = new THREE.Mesh(fingerGeo, skinMat);
        finger.position.set(fin * 0.045, -0.73, 0.52);
        finger.rotation.x = Math.PI / 3;
        finger.rotation.z = -fin * 0.15;
        armGroup.add(finger);
      }

      armGroup.position.set(sign * 0.48, 0.95, 0);
      return armGroup;
    };

    const leftArmGroup = createArmWithHand(true);
    zombie.add(leftArmGroup);

    const rightArmGroup = createArmWithHand(false);
    zombie.add(rightArmGroup);

    // -------------------------------------------------------------
    // 4. TATTERED PANTS & CHUNKY CARTOON SHOES
    // -------------------------------------------------------------
    const createLegWithShoe = (isLeft: boolean) => {
      const legGroup = new THREE.Group();
      legGroup.name = isLeft ? 'LeftLeg' : 'RightLeg';
      const sign = isLeft ? -1 : 1;

      // Shorts / Pants upper leg
      const pantGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.38, 8);
      const pantMesh = new THREE.Mesh(pantGeo, pantsMat);
      pantMesh.position.set(0, 0.35, 0);
      legGroup.add(pantMesh);

      // Skinny green zombie shin
      const shinGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.3, 8);
      const shinMesh = new THREE.Mesh(shinGeo, skinMat);
      shinMesh.position.set(0, 0.15, 0);
      legGroup.add(shinMesh);

      // Chunky Rounded Cartoon Sneaker / Boot
      const shoeGroup = new THREE.Group();
      shoeGroup.position.set(0, 0.06, 0.06);

      // Rounded toe box
      const toeGeo = new THREE.CapsuleGeometry(0.14, 0.22, 8, 8);
      toeGeo.rotateX(Math.PI / 2);
      const toeMesh = new THREE.Mesh(toeGeo, GameMaterials.cartoonShoe);
      toeMesh.castShadow = true;
      shoeGroup.add(toeMesh);

      // Thick dark sole trim
      const soleGeo = new THREE.BoxGeometry(0.28, 0.05, 0.44);
      const soleMesh = new THREE.Mesh(soleGeo, GameMaterials.cartoonShoeSole);
      soleMesh.position.y = -0.06;
      shoeGroup.add(soleMesh);

      legGroup.add(shoeGroup);

      legGroup.position.set(sign * 0.22, 0, 0);
      return legGroup;
    };

    const leftLegGroup = createLegWithShoe(true);
    zombie.add(leftLegGroup);

    const rightLegGroup = createLegWithShoe(false);
    zombie.add(rightLegGroup);

    // -------------------------------------------------------------
    // 5. WEAPONS / SPECIAL ACCESSORIES
    // -------------------------------------------------------------
    if (type === 'siege') {
      // Strapped catapult arm on back
      const beamGeo = new THREE.BoxGeometry(0.14, 1.4, 0.14);
      const beam = new THREE.Mesh(beamGeo, GameMaterials.castleWood);
      beam.position.set(0.3, 1.3, -0.45);
      beam.rotation.x = -Math.PI / 4;
      beam.name = 'CatapultArm';
      zombie.add(beam);

      const cupGeo = new THREE.DodecahedronGeometry(0.26, 0);
      const cup = new THREE.Mesh(cupGeo, GameMaterials.moltenOil);
      cup.position.set(0.3, 1.9, -0.85);
      zombie.add(cup);
    }

    if (type === 'boss') {
      // Giant spiked battleaxe in right hand
      const axeGroup = new THREE.Group();
      const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8);
      const pole = new THREE.Mesh(poleGeo, GameMaterials.castleWood);
      axeGroup.add(pole);

      const bladeGeo = new THREE.BoxGeometry(0.8, 1.0, 0.12);
      const blade = new THREE.Mesh(bladeGeo, GameMaterials.ironTrim);
      blade.position.set(0, 1.0, 0.25);
      axeGroup.add(blade);

      axeGroup.position.set(0.8, 0.8, 0.4);
      axeGroup.rotation.x = Math.PI / 4;
      zombie.add(axeGroup);
    }

    // Overall type scale
    if (scale !== 1.0) {
      zombie.scale.set(scale, scale, scale);
    }

    return zombie;
  }
}
