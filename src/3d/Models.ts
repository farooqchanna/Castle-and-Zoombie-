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

    // If wallHpLevel > 1, add extra iron armor plating to walls
    if (wallHpLevel > 1) {
      const ironPlateGeo = new THREE.BoxGeometry(10, 3, 0.4);
      const leftPlate = new THREE.Mesh(ironPlateGeo, GameMaterials.ironTrim);
      leftPlate.position.set(-6, 2.5, -4.1);
      castle.add(leftPlate);

      const rightPlate = new THREE.Mesh(ironPlateGeo, GameMaterials.ironTrim);
      rightPlate.position.set(6, 2.5, -4.1);
      castle.add(rightPlate);
    }

    // Torches on Towers and Gate with warm flickering lights
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

    // Banners on Left and Right Towers
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

    // Metal sconce
    const sconceGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
    const sconce = new THREE.Mesh(sconceGeo, GameMaterials.ironTrim);
    sconce.rotation.z = 0.3;
    torch.add(sconce);

    // Flame cone
    const flameGeo = new THREE.ConeGeometry(0.18, 0.45, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff7700 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0.1, 0.35, 0);
    flame.name = 'Flame';
    torch.add(flame);

    // Light
    const light = new THREE.PointLight(0xffaa44, 2.0, 14, 1.5);
    light.position.set(0.1, 0.4, 0.2);
    light.name = 'TorchLight';
    torch.add(light);

    return torch;
  }

  // Boiling Oil Cauldron above the Gate
  public static createCauldron(): THREE.Group {
    const cauldron = new THREE.Group();
    cauldron.name = 'Cauldron';

    // Iron Pot
    const potGeo = new THREE.CylinderGeometry(0.8, 0.5, 0.9, 12);
    const pot = new THREE.Mesh(potGeo, GameMaterials.ironTrim);
    pot.castShadow = true;
    cauldron.add(pot);

    // Molten Lava / Oil surface inside
    const oilGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.08, 12);
    const oil = new THREE.Mesh(oilGeo, GameMaterials.moltenOil);
    oil.position.y = 0.38;
    cauldron.add(oil);

    // Suspension chains / pivot frame
    const barGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8);
    const bar = new THREE.Mesh(barGeo, GameMaterials.ironTrim);
    bar.rotation.z = Math.PI / 2;
    bar.position.y = 0.35;
    cauldron.add(bar);

    return cauldron;
  }

  // 3D Human / Citizen Defender Model (Archers & Soldiers)
  public static createDefender(rank: SoldierRank = 'rookie'): THREE.Group {
    const defender = new THREE.Group();
    defender.name = 'Defender';

    // Material by rank
    let clothMat = GameMaterials.clothRookie;
    if (rank === 'captain') clothMat = GameMaterials.clothCaptain;
    if (rank === 'major') clothMat = GameMaterials.clothMajor;
    if (rank === 'archer') clothMat = GameMaterials.clothArcher;

    // Torso / Tunic
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.85, 0.45);
    const torso = new THREE.Mesh(torsoGeo, clothMat);
    torso.position.y = 0.95;
    torso.castShadow = true;
    defender.add(torso);

    // Head
    const headGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
    const head = new THREE.Mesh(headGeo, GameMaterials.skinHuman);
    head.position.y = 1.6;
    head.castShadow = true;
    defender.add(head);

    // Helmet / Cap
    const helmGeo = new THREE.BoxGeometry(0.46, 0.22, 0.46);
    const helmMat = (rank === 'major' || rank === 'captain') ? GameMaterials.ironTrim : clothMat;
    const helm = new THREE.Mesh(helmGeo, helmMat);
    helm.position.y = 1.78;
    defender.add(helm);

    // Left Arm (Holding Bow)
    const armGeo = new THREE.BoxGeometry(0.2, 0.65, 0.2);
    const leftArm = new THREE.Mesh(armGeo, clothMat);
    leftArm.position.set(-0.46, 0.95, 0.2);
    leftArm.rotation.x = -Math.PI / 4;
    leftArm.name = 'LeftArm';
    defender.add(leftArm);

    // Right Arm (Drawing bowstring)
    const rightArm = new THREE.Mesh(armGeo, clothMat);
    rightArm.position.set(0.46, 0.95, 0);
    rightArm.name = 'RightArm';
    defender.add(rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.24, 0.65, 0.24);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.2, 0.32, 0);
    defender.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.2, 0.32, 0);
    defender.add(rightLeg);

    // Bow in Left Hand
    const bow = this.createBow();
    bow.position.set(-0.52, 0.95, 0.55);
    bow.name = 'Bow';
    defender.add(bow);

    // Quiver on Back
    const quiverGeo = new THREE.CylinderGeometry(0.14, 0.1, 0.7, 8);
    const quiver = new THREE.Mesh(quiverGeo, GameMaterials.castleWood);
    quiver.position.set(0.2, 1.1, -0.32);
    quiver.rotation.z = -0.3;
    defender.add(quiver);

    return defender;
  }

  // 3D Citizen Collector Model (Runs out to gather gold)
  public static createCollector(): THREE.Group {
    const collector = new THREE.Group();
    collector.name = 'Collector';

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.65, 0.8, 0.4);
    const torso = new THREE.Mesh(torsoGeo, GameMaterials.clothCollector);
    torso.position.y = 0.9;
    torso.castShadow = true;
    collector.add(torso);

    // Head
    const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const head = new THREE.Mesh(headGeo, GameMaterials.skinHuman);
    head.position.y = 1.5;
    head.castShadow = true;
    collector.add(head);

    // Scarf / Cap
    const capGeo = new THREE.BoxGeometry(0.44, 0.18, 0.44);
    const cap = new THREE.Mesh(capGeo, GameMaterials.clothCollector);
    cap.position.y = 1.68;
    collector.add(cap);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.18, 0.6, 0.18);
    const leftArm = new THREE.Mesh(armGeo, GameMaterials.clothCollector);
    leftArm.position.set(-0.42, 0.9, 0);
    leftArm.name = 'LeftArm';
    collector.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, GameMaterials.clothCollector);
    rightArm.position.set(0.42, 0.9, 0);
    rightArm.name = 'RightArm';
    collector.add(rightArm);

    // Legs
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

    // Treasure Sack on hip/back
    const sackGeo = new THREE.SphereGeometry(0.32, 8, 8);
    const sackMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.8 });
    const sack = new THREE.Mesh(sackGeo, sackMat);
    sack.position.set(-0.35, 0.7, -0.2);
    collector.add(sack);

    return collector;
  }

  // 3D Bow Model
  public static createBow(): THREE.Group {
    const bow = new THREE.Group();
    bow.name = 'Bow';

    // Curved stave
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, -0.65, 0),
      new THREE.Vector3(0.2, 0, 0.15),
      new THREE.Vector3(0, 0.65, 0)
    );
    const bowGeo = new THREE.TubeGeometry(curve, 12, 0.04, 6, false);
    const bowMesh = new THREE.Mesh(bowGeo, GameMaterials.castleWood);
    bow.add(bowMesh);

    // Bowstring
    const stringGeo = new THREE.CylinderGeometry(0.01, 0.01, 1.3, 4);
    const stringMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
    const stringMesh = new THREE.Mesh(stringGeo, stringMat);
    stringMesh.position.set(0, 0, 0);
    bow.add(stringMesh);

    return bow;
  }

  // 3D Arrow Projectile
  public static createArrow(): THREE.Group {
    const arrow = new THREE.Group();
    arrow.name = 'Arrow';

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.1, 6);
    const shaft = new THREE.Mesh(shaftGeo, GameMaterials.arrowShaft);
    shaft.rotation.x = Math.PI / 2;
    arrow.add(shaft);

    // Broadhead Tip
    const tipGeo = new THREE.ConeGeometry(0.08, 0.22, 4);
    const tip = new THREE.Mesh(tipGeo, GameMaterials.arrowTip);
    tip.rotation.x = Math.PI / 2;
    tip.position.z = 0.65;
    arrow.add(tip);

    // Feathers / Fletchings
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

  // 3D Zombie Horde Models (Walker, Runner, Tank, Exploder, Siege, Boss)
  public static createZombie(type: 'walker' | 'runner' | 'tank' | 'exploder' | 'siege' | 'boss'): THREE.Group {
    const zombie = new THREE.Group();
    zombie.name = `Zombie_${type}`;

    if (type === 'walker') {
      // Classic Decayed Shambler
      const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.45);
      const torsoMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
      const torso = new THREE.Mesh(torsoGeo, torsoMat);
      torso.position.y = 1.0;
      torso.castShadow = true;
      zombie.add(torso);

      // Head
      const headGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
      const head = new THREE.Mesh(headGeo, GameMaterials.zombieSkin);
      head.position.y = 1.7;
      head.name = 'Head';
      head.castShadow = true;
      zombie.add(head);

      // Glowing Eyes
      const eyeGeo = new THREE.SphereGeometry(0.06, 6, 6);
      const leftEye = new THREE.Mesh(eyeGeo, GameMaterials.zombieEyeGlow);
      leftEye.position.set(-0.12, 1.75, -0.24);
      zombie.add(leftEye);

      const rightEye = new THREE.Mesh(eyeGeo, GameMaterials.zombieEyeGlow);
      rightEye.position.set(0.12, 1.75, -0.24);
      zombie.add(rightEye);

      // Arms reaching forward
      const armGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);
      const leftArm = new THREE.Mesh(armGeo, GameMaterials.zombieSkin);
      leftArm.position.set(-0.48, 1.1, -0.3);
      leftArm.rotation.x = Math.PI / 2.5;
      leftArm.name = 'LeftArm';
      zombie.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, GameMaterials.zombieSkin);
      rightArm.position.set(0.48, 1.0, -0.25);
      rightArm.rotation.x = Math.PI / 2.8;
      rightArm.name = 'RightArm';
      zombie.add(rightArm);

      // Legs
      const legGeo = new THREE.BoxGeometry(0.24, 0.65, 0.24);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.9 });
      const leftLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.2, 0.32, 0);
      leftLeg.name = 'LeftLeg';
      zombie.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, legMat);
      rightLeg.position.set(0.2, 0.32, 0);
      rightLeg.name = 'RightLeg';
      zombie.add(rightLeg);

    } else if (type === 'runner') {
      // Fast, hunched feral sprinter
      const torsoGeo = new THREE.BoxGeometry(0.55, 0.8, 0.35);
      const torsoMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.85 });
      const torso = new THREE.Mesh(torsoGeo, torsoMat);
      torso.position.set(0, 0.85, -0.15);
      torso.rotation.x = Math.PI / 6; // Hunched forward
      torso.castShadow = true;
      zombie.add(torso);

      // Head
      const headGeo = new THREE.BoxGeometry(0.38, 0.38, 0.38);
      const head = new THREE.Mesh(headGeo, GameMaterials.zombieSkinRunner);
      head.position.set(0, 1.45, -0.4);
      head.name = 'Head';
      zombie.add(head);

      // Piercing Yellow Eyes
      const eyeGeo = new THREE.SphereGeometry(0.05, 6, 6);
      const leftEye = new THREE.Mesh(eyeGeo, GameMaterials.runnerEyeGlow);
      leftEye.position.set(-0.1, 1.5, -0.6);
      zombie.add(leftEye);

      const rightEye = new THREE.Mesh(eyeGeo, GameMaterials.runnerEyeGlow);
      rightEye.position.set(0.1, 1.5, -0.6);
      zombie.add(rightEye);

      // Long feral arms
      const armGeo = new THREE.BoxGeometry(0.16, 0.8, 0.16);
      const leftArm = new THREE.Mesh(armGeo, GameMaterials.zombieSkinRunner);
      leftArm.position.set(-0.38, 0.8, -0.3);
      leftArm.name = 'LeftArm';
      zombie.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, GameMaterials.zombieSkinRunner);
      rightArm.position.set(0.38, 0.8, -0.3);
      rightArm.name = 'RightArm';
      zombie.add(rightArm);

      // Legs
      const legGeo = new THREE.BoxGeometry(0.2, 0.65, 0.2);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.9 });
      const leftLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.16, 0.32, 0);
      leftLeg.name = 'LeftLeg';
      zombie.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, legMat);
      rightLeg.position.set(0.16, 0.32, 0);
      rightLeg.name = 'RightLeg';
      zombie.add(rightLeg);

    } else if (type === 'tank') {
      // Armored Juggernaut
      const torsoGeo = new THREE.BoxGeometry(1.4, 1.4, 0.9);
      const torso = new THREE.Mesh(torsoGeo, GameMaterials.zombieSkinTank);
      torso.position.y = 1.35;
      torso.castShadow = true;
      zombie.add(torso);

      // Spiked Iron Pauldrons on Shoulders
      const pauldronGeo = new THREE.BoxGeometry(0.7, 0.5, 0.8);
      const leftPauldron = new THREE.Mesh(pauldronGeo, GameMaterials.ironTrim);
      leftPauldron.position.set(-0.95, 1.85, 0);
      zombie.add(leftPauldron);

      const rightPauldron = new THREE.Mesh(pauldronGeo, GameMaterials.ironTrim);
      rightPauldron.position.set(0.95, 1.85, 0);
      zombie.add(rightPauldron);

      // Head with iron horned helm
      const headGeo = new THREE.BoxGeometry(0.65, 0.65, 0.65);
      const head = new THREE.Mesh(headGeo, GameMaterials.ironTrim);
      head.position.y = 2.25;
      head.name = 'Head';
      zombie.add(head);

      // Red eye slit
      const slitGeo = new THREE.BoxGeometry(0.45, 0.08, 0.1);
      const slit = new THREE.Mesh(slitGeo, GameMaterials.zombieEyeGlow);
      slit.position.set(0, 2.3, -0.34);
      zombie.add(slit);

      // Massive arms
      const armGeo = new THREE.BoxGeometry(0.45, 1.1, 0.45);
      const leftArm = new THREE.Mesh(armGeo, GameMaterials.zombieSkinTank);
      leftArm.position.set(-0.95, 1.1, -0.2);
      leftArm.name = 'LeftArm';
      zombie.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, GameMaterials.zombieSkinTank);
      rightArm.position.set(0.95, 1.1, -0.2);
      rightArm.name = 'RightArm';
      zombie.add(rightArm);

      // Legs
      const legGeo = new THREE.BoxGeometry(0.45, 0.75, 0.45);
      const leftLeg = new THREE.Mesh(legGeo, GameMaterials.ironTrim);
      leftLeg.position.set(-0.4, 0.38, 0);
      leftLeg.name = 'LeftLeg';
      zombie.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, GameMaterials.ironTrim);
      rightLeg.position.set(0.4, 0.38, 0);
      rightLeg.name = 'RightLeg';
      zombie.add(rightLeg);

    } else if (type === 'exploder') {
      // Bloater / Pulsating Bomb Fiend
      const torsoGeo = new THREE.SphereGeometry(0.85, 12, 10);
      const torso = new THREE.Mesh(torsoGeo, GameMaterials.zombieSkinExploder);
      torso.position.y = 1.15;
      torso.name = 'Belly';
      torso.castShadow = true;
      zombie.add(torso);

      // Glowing pustules
      const pustuleGeo = new THREE.SphereGeometry(0.25, 8, 8);
      const p1 = new THREE.Mesh(pustuleGeo, GameMaterials.exploderPustule);
      p1.position.set(-0.45, 1.45, -0.4);
      zombie.add(p1);

      const p2 = new THREE.Mesh(pustuleGeo, GameMaterials.exploderPustule);
      p2.position.set(0.45, 1.35, 0.45);
      zombie.add(p2);

      const p3 = new THREE.Mesh(pustuleGeo, GameMaterials.exploderPustule);
      p3.position.set(0.1, 1.7, 0.2);
      zombie.add(p3);

      // Small sickly head
      const headGeo = new THREE.BoxGeometry(0.38, 0.38, 0.38);
      const head = new THREE.Mesh(headGeo, GameMaterials.zombieSkinExploder);
      head.position.set(0, 1.95, -0.2);
      head.name = 'Head';
      zombie.add(head);

      // Legs
      const legGeo = new THREE.BoxGeometry(0.24, 0.5, 0.24);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x4a148c });
      const leftLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.3, 0.25, 0);
      leftLeg.name = 'LeftLeg';
      zombie.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, legMat);
      rightLeg.position.set(0.3, 0.25, 0);
      rightLeg.name = 'RightLeg';
      zombie.add(rightLeg);

    } else if (type === 'siege') {
      // Siege Fiend with rolling catapult arm
      const torsoGeo = new THREE.BoxGeometry(0.8, 1.0, 0.5);
      const torso = new THREE.Mesh(torsoGeo, GameMaterials.stoneWall);
      torso.position.y = 1.05;
      zombie.add(torso);

      // Head
      const headGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
      const head = new THREE.Mesh(headGeo, GameMaterials.zombieSkin);
      head.position.y = 1.75;
      head.name = 'Head';
      zombie.add(head);

      // Heavy wooden catapult arm on back
      const beamGeo = new THREE.BoxGeometry(0.18, 1.6, 0.18);
      const beam = new THREE.Mesh(beamGeo, GameMaterials.castleWood);
      beam.position.set(0.35, 1.6, -0.4);
      beam.rotation.x = -Math.PI / 4;
      beam.name = 'CatapultArm';
      zombie.add(beam);

      // Burning Boulder cup
      const cupGeo = new THREE.DodecahedronGeometry(0.3, 0);
      const cup = new THREE.Mesh(cupGeo, GameMaterials.moltenOil);
      cup.position.set(0.35, 2.2, -0.9);
      zombie.add(cup);

      // Legs
      const legGeo = new THREE.BoxGeometry(0.28, 0.65, 0.28);
      const leftLeg = new THREE.Mesh(legGeo, GameMaterials.stoneWall);
      leftLeg.position.set(-0.25, 0.32, 0);
      leftLeg.name = 'LeftLeg';
      zombie.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, GameMaterials.stoneWall);
      rightLeg.position.set(0.25, 0.32, 0);
      rightLeg.name = 'RightLeg';
      zombie.add(rightLeg);

    } else if (type === 'boss') {
      // Giant Abomination Boss (scale 2.2x)
      const torsoGeo = new THREE.BoxGeometry(1.8, 2.2, 1.1);
      const torsoMat = new THREE.MeshStandardMaterial({
        color: 0x212121,
        roughness: 0.4,
        metalness: 0.7,
      });
      const torso = new THREE.Mesh(torsoGeo, torsoMat);
      torso.position.y = 2.2;
      torso.castShadow = true;
      zombie.add(torso);

      // Giant horned helm
      const headGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
      const head = new THREE.Mesh(headGeo, GameMaterials.ironTrim);
      head.position.y = 3.65;
      head.name = 'Head';
      zombie.add(head);

      // Horns
      const hornGeo = new THREE.ConeGeometry(0.2, 0.9, 6);
      const leftHorn = new THREE.Mesh(hornGeo, GameMaterials.ironTrim);
      leftHorn.position.set(-0.6, 4.2, 0);
      leftHorn.rotation.z = 0.5;
      zombie.add(leftHorn);

      const rightHorn = new THREE.Mesh(hornGeo, GameMaterials.ironTrim);
      rightHorn.position.set(0.6, 4.2, 0);
      rightHorn.rotation.z = -0.5;
      zombie.add(rightHorn);

      // Massive Spiked Axe in Hand
      const axePoleGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.2, 8);
      const axePole = new THREE.Mesh(axePoleGeo, GameMaterials.castleWood);
      axePole.position.set(1.4, 2.2, -0.6);
      zombie.add(axePole);

      const axeBladeGeo = new THREE.BoxGeometry(0.8, 1.0, 0.1);
      const axeBlade = new THREE.Mesh(axeBladeGeo, GameMaterials.ironTrim);
      axeBlade.position.set(1.4, 3.4, -0.6);
      zombie.add(axeBlade);

      // Legs
      const legGeo = new THREE.BoxGeometry(0.6, 1.1, 0.6);
      const leftLeg = new THREE.Mesh(legGeo, torsoMat);
      leftLeg.position.set(-0.55, 0.55, 0);
      leftLeg.name = 'LeftLeg';
      zombie.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, torsoMat);
      rightLeg.position.set(0.55, 0.55, 0);
      rightLeg.name = 'RightLeg';
      zombie.add(rightLeg);
    }

    return zombie;
  }

  // 3D Coin Model
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
}
