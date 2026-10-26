import * as THREE from 'three';
import { GameMaterials } from './Materials';
import { SoldierRank } from '../systems/CitizenManager';

export class ModelFactory {
  // Create the Fortress / Castle Compound (High-Detail Medieval Tabletop Diorama)
  public static createCastle(wallHpLevel: number = 1): THREE.Group {
    const castle = new THREE.Group();
    castle.name = 'CastleGroup';

    // -----------------------------------------------------------------------
    // 1. FRONT FORTIFIED CURTAIN WALL & RAMPARTS
    // -----------------------------------------------------------------------
    const wallGeo = new THREE.BoxGeometry(32, 6.5, 3.5);
    const mainWall = new THREE.Mesh(wallGeo, GameMaterials.stoneWall);
    mainWall.position.set(0, 3.25, -6);
    mainWall.castShadow = true;
    mainWall.receiveShadow = true;
    castle.add(mainWall);

    // Stone Crenellations / Merlons along ramparts
    const merlonGeo = new THREE.BoxGeometry(1.6, 1.2, 0.8);
    for (let x = -14; x <= 14; x += 2.4) {
      if (Math.abs(x) < 2.2) continue; // Gap for cauldron & gate portal
      const merlon = new THREE.Mesh(merlonGeo, GameMaterials.stoneWall);
      merlon.position.set(x, 7.1, -4.4);
      merlon.castShadow = true;
      castle.add(merlon);
    }

    // Rear wall / Walkway platform for archers
    const platformGeo = new THREE.BoxGeometry(31, 0.4, 2.6);
    const platform = new THREE.Mesh(platformGeo, GameMaterials.castleWood);
    platform.position.set(0, 6.3, -6);
    platform.receiveShadow = true;
    castle.add(platform);

    // Wooden handrail along back of rampart walk
    const railGeo = new THREE.BoxGeometry(31, 0.15, 0.15);
    const handrail = new THREE.Mesh(railGeo, GameMaterials.darkWood);
    handrail.position.set(0, 7.2, -7.2);
    castle.add(handrail);

    // -----------------------------------------------------------------------
    // 2. FLANKING WATCHTOWERS (LEFT & RIGHT)
    // -----------------------------------------------------------------------
    const towerGeo = new THREE.CylinderGeometry(3.0, 3.5, 11, 20);
    const roofGeo = new THREE.ConeGeometry(3.8, 4.8, 20);

    // Left Flanking Tower
    const leftTower = new THREE.Mesh(towerGeo, GameMaterials.stoneWall);
    leftTower.position.set(-14.0, 5.5, -6);
    leftTower.castShadow = true;
    leftTower.receiveShadow = true;
    castle.add(leftTower);

    // Left Tower Conical Blue Slate Roof (Matching Diorama Reference!)
    const leftRoof = new THREE.Mesh(roofGeo, GameMaterials.roofSlateBlue);
    leftRoof.position.set(-14.0, 13.4, -6);
    leftRoof.castShadow = true;
    castle.add(leftRoof);

    // Left Roof Finial / Spire
    const finialGeo = new THREE.CylinderGeometry(0.06, 0.18, 1.6, 8);
    const leftFinial = new THREE.Mesh(finialGeo, GameMaterials.ironTrim);
    leftFinial.position.set(-14.0, 16.5, -6);
    castle.add(leftFinial);

    // Right Flanking Tower
    const rightTower = new THREE.Mesh(towerGeo, GameMaterials.stoneWall);
    rightTower.position.set(14.0, 5.5, -6);
    rightTower.castShadow = true;
    rightTower.receiveShadow = true;
    castle.add(rightTower);

    // Right Tower Conical Blue Slate Roof
    const rightRoof = new THREE.Mesh(roofGeo, GameMaterials.roofSlateBlue);
    rightRoof.position.set(14.0, 13.4, -6);
    rightRoof.castShadow = true;
    castle.add(rightRoof);

    // Right Roof Finial / Spire
    const rightFinial = new THREE.Mesh(finialGeo, GameMaterials.ironTrim);
    rightFinial.position.set(14.0, 16.5, -6);
    castle.add(rightFinial);

    // -----------------------------------------------------------------------
    // 3. FORTIFIED BARBICAN GATEHOUSE & WOODEN GATES
    // -----------------------------------------------------------------------
    const gateFrameGeo = new THREE.BoxGeometry(5.4, 5.8, 4.0);
    const gateFrame = new THREE.Mesh(gateFrameGeo, GameMaterials.stoneWall);
    gateFrame.position.set(0, 2.9, -5.9);
    gateFrame.castShadow = true;
    castle.add(gateFrame);

    // Gatehouse Arch Keystone & Trim
    const archTrimGeo = new THREE.BoxGeometry(5.6, 0.6, 4.2);
    const archTrim = new THREE.Mesh(archTrimGeo, GameMaterials.bridgeStone);
    archTrim.position.set(0, 5.9, -5.9);
    castle.add(archTrim);

    // Wooden Gate Doors
    const doorGeo = new THREE.BoxGeometry(4.2, 4.6, 0.6);
    const door = new THREE.Mesh(doorGeo, GameMaterials.castleWood);
    door.position.set(0, 2.3, -4.3);
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
    band2.position.set(0, 3.4, -4.3);
    castle.add(band2);

    // Portcullis Grate (Iron Spiked Gate above)
    const portcullisGeo = new THREE.BoxGeometry(4.0, 2.5, 0.15);
    const portcullis = new THREE.Mesh(portcullisGeo, GameMaterials.ironTrim);
    portcullis.position.set(0, 4.6, -4.1);
    castle.add(portcullis);

    // Wall iron plating for higher levels
    if (wallHpLevel > 1) {
      const ironPlateGeo = new THREE.BoxGeometry(11, 3.2, 0.4);
      const leftPlate = new THREE.Mesh(ironPlateGeo, GameMaterials.ironTrim);
      leftPlate.position.set(-6.5, 2.5, -4.1);
      castle.add(leftPlate);

      const rightPlate = new THREE.Mesh(ironPlateGeo, GameMaterials.ironTrim);
      rightPlate.position.set(6.5, 2.5, -4.1);
      castle.add(rightPlate);
    }

    // Gate Torches
    const torch1 = this.createTorch();
    torch1.position.set(-3.2, 4.8, -3.8);
    castle.add(torch1);

    const torch2 = this.createTorch();
    torch2.position.set(3.2, 4.8, -3.8);
    castle.add(torch2);

    const torchLeftTower = this.createTorch();
    torchLeftTower.position.set(-14.0, 9.5, -3.0);
    castle.add(torchLeftTower);

    const torchRightTower = this.createTorch();
    torchRightTower.position.set(14.0, 9.5, -3.0);
    castle.add(torchRightTower);

    // Royal Blue Castle Banners
    const bannerGeo = new THREE.BoxGeometry(1.2, 3.6, 0.05);
    const leftBanner = new THREE.Mesh(bannerGeo, GameMaterials.flagBlue);
    leftBanner.position.set(-14.0, 6.2, -2.8);
    castle.add(leftBanner);

    const rightBanner = new THREE.Mesh(bannerGeo, GameMaterials.flagBlue);
    rightBanner.position.set(14.0, 6.2, -2.8);
    castle.add(rightBanner);

    // -----------------------------------------------------------------------
    // 4. THE ARCHED STONE BRIDGE OVER THE RIVER (Iconic Diorama Feature!)
    // -----------------------------------------------------------------------
    const bridgeGroup = this.createStoneBridge();
    castle.add(bridgeGroup);

    // -----------------------------------------------------------------------
    // 5. INNER LIVING MEDIEVAL COURTYARD & VILLAGE (Behind the Wall!)
    // -----------------------------------------------------------------------
    const villageGroup = this.createVillageCourtyard();
    castle.add(villageGroup);

    // -----------------------------------------------------------------------
    // 6. THE GRAND CITADEL / ROUND KEEP (Rear Center Landmark!)
    // -----------------------------------------------------------------------
    const keepGroup = this.createCitadelKeep();
    keepGroup.position.set(0, 0, -25);
    castle.add(keepGroup);

    // -----------------------------------------------------------------------
    // 7. SURROUNDING ALPINE CONIFER TREES
    // -----------------------------------------------------------------------
    const treePositions = [
      { x: -19, z: -4, h: 5.5 },
      { x: -21, z: -10, h: 6.8 },
      { x: -20, z: -18, h: 7.2 },
      { x: -19, z: -26, h: 8.0 },
      { x: 19, z: -4, h: 5.5 },
      { x: 21, z: -10, h: 6.8 },
      { x: 20, z: -18, h: 7.2 },
      { x: 19, z: -26, h: 8.0 },
      // Trees along riverbanks
      { x: -15, z: 12, h: 5.2 },
      { x: -18, z: 16, h: 6.4 },
      { x: 15, z: 12, h: 5.2 },
      { x: 18, z: 16, h: 6.4 },
    ];

    for (const tp of treePositions) {
      const tree = this.createAlpineTree(tp.h);
      tree.position.set(tp.x, 0, tp.z);
      castle.add(tree);
    }

    return castle;
  }

  // =========================================================================
  // THE ARCHED STONE BRIDGE (Matching Reference Image Exact Architecture!)
  // =========================================================================
  public static createStoneBridge(): THREE.Group {
    const bridge = new THREE.Group();
    bridge.name = 'StoneBridge';

    // Bridge Roadway: Arches gently from Z = 14 to Z = -2.5 (Length = 16.5m, Width = 5.2m)
    const roadLength = 16.5;
    const roadWidth = 5.2;
    const bridgeGeo = new THREE.BoxGeometry(roadWidth, 0.45, roadLength);
    const bridgeMesh = new THREE.Mesh(bridgeGeo, GameMaterials.cobblestone);
    bridgeMesh.position.set(0, 0.35, 5.75); // Center of span
    bridgeMesh.receiveShadow = true;
    bridgeMesh.castShadow = true;
    bridge.add(bridgeMesh);

    // Stone Arch Abutment under bridge (supporting piers in river bed)
    const pierGeo = new THREE.CylinderGeometry(1.4, 1.8, 1.6, 12);
    pierGeo.rotateZ(Math.PI / 2);
    const centerArch = new THREE.Mesh(pierGeo, GameMaterials.bridgeStone);
    centerArch.position.set(0, -0.2, 6.0);
    centerArch.castShadow = true;
    bridge.add(centerArch);

    // Medieval Triangular Cutwaters (avant-becs to part river flow)
    const cutwaterGeo = new THREE.ConeGeometry(1.1, 1.6, 3);
    cutwaterGeo.rotateX(Math.PI / 2);
    const leftCutwater = new THREE.Mesh(cutwaterGeo, GameMaterials.bridgeStone);
    leftCutwater.position.set(-2.8, -0.25, 6.0);
    leftCutwater.rotation.y = -Math.PI / 2;
    leftCutwater.castShadow = true;
    bridge.add(leftCutwater);

    const rightCutwater = new THREE.Mesh(cutwaterGeo, GameMaterials.bridgeStone);
    rightCutwater.position.set(2.8, -0.25, 6.0);
    rightCutwater.rotation.y = Math.PI / 2;
    rightCutwater.castShadow = true;
    bridge.add(rightCutwater);

    // Stone Side Pier Foundations
    const sidePierGeo = new THREE.BoxGeometry(5.6, 1.6, 2.4);
    const frontPier = new THREE.Mesh(sidePierGeo, GameMaterials.bridgeStone);
    frontPier.position.set(0, -0.3, 13.5);
    bridge.add(frontPier);

    const backPier = new THREE.Mesh(sidePierGeo, GameMaterials.bridgeStone);
    backPier.position.set(0, -0.3, -1.8);
    bridge.add(backPier);

    // Left and Right Stone Parapets / Balustrades
    const parapetGeo = new THREE.BoxGeometry(0.5, 0.75, roadLength);

    const leftParapet = new THREE.Mesh(parapetGeo, GameMaterials.bridgeStone);
    leftParapet.position.set(-2.6, 0.75, 5.75);
    leftParapet.castShadow = true;
    leftParapet.receiveShadow = true;
    bridge.add(leftParapet);

    const rightParapet = new THREE.Mesh(parapetGeo, GameMaterials.bridgeStone);
    rightParapet.position.set(2.6, 0.75, 5.75);
    rightParapet.castShadow = true;
    rightParapet.receiveShadow = true;
    bridge.add(rightParapet);

    // Decorative Stone Pillar Posts along Parapet
    const postGeo = new THREE.BoxGeometry(0.7, 1.05, 0.7);
    const postPositionsZ = [-2.2, 2.0, 6.0, 10.0, 13.8];

    for (const pz of postPositionsZ) {
      // Left post
      const lp = new THREE.Mesh(postGeo, GameMaterials.bridgeStone);
      lp.position.set(-2.6, 0.85, pz);
      lp.castShadow = true;
      bridge.add(lp);

      // Right post
      const rp = new THREE.Mesh(postGeo, GameMaterials.bridgeStone);
      rp.position.set(2.6, 0.85, pz);
      rp.castShadow = true;
      bridge.add(rp);

      // Post cap stone
      const capGeo = new THREE.BoxGeometry(0.85, 0.15, 0.85);
      const lc = new THREE.Mesh(capGeo, GameMaterials.bridgeStone);
      lc.position.set(-2.6, 1.45, pz);
      bridge.add(lc);

      const rc = new THREE.Mesh(capGeo, GameMaterials.bridgeStone);
      rc.position.set(2.6, 1.45, pz);
      bridge.add(rc);
    }

    // Street Lanterns mounted on bridge entry and midpoint posts
    const lantern1 = this.createLantern();
    lantern1.position.set(-2.6, 1.55, 13.8);
    bridge.add(lantern1);

    const lantern2 = this.createLantern();
    lantern2.position.set(2.6, 1.55, 13.8);
    bridge.add(lantern2);

    const lantern3 = this.createLantern();
    lantern3.position.set(-2.6, 1.55, 2.0);
    bridge.add(lantern3);

    const lantern4 = this.createLantern();
    lantern4.position.set(2.6, 1.55, 2.0);
    bridge.add(lantern4);

    return bridge;
  }

  // =========================================================================
  // INNER LIVING VILLAGE & COURTYARD (Behind Fortress Ramparts)
  // =========================================================================
  public static createVillageCourtyard(): THREE.Group {
    const courtyard = new THREE.Group();
    courtyard.name = 'VillageCourtyard';

    // Cobblestone Village Ground Floor (Z = -7 to -34, X = -20 to 20)
    const villageGroundGeo = new THREE.PlaneGeometry(38, 28);
    villageGroundGeo.rotateX(-Math.PI / 2);
    const villageGround = new THREE.Mesh(villageGroundGeo, GameMaterials.cobblestone);
    villageGround.position.set(0, 0.02, -20.5);
    villageGround.receiveShadow = true;
    courtyard.add(villageGround);

    // Central Stone Village Fountain / Well (Z = -14, X = 0)
    const fountain = this.createVillageFountain();
    fountain.position.set(0, 0, -14);
    courtyard.add(fountain);

    // -----------------------------------------------------------------------
    // MEDIEVAL HALF-TIMBER HOUSES (6 Distinct Procedural Houses!)
    // -----------------------------------------------------------------------
    // House 1: Merchant House (North-West) - Slate Blue Gabled Roof, Dormers
    const house1 = this.createMedievalHouse({
      width: 5.4,
      depth: 6.2,
      height: 6.5,
      roofType: 'slate',
      hasDormer: true,
      hasChimney: true,
      chimneySide: 'left',
    });
    house1.position.set(-9.5, 0, -13.5);
    house1.rotation.y = 0.15;
    courtyard.add(house1);

    // House 2: Guild House (North-East) - Terracotta Roof, Stone Chimney
    const house2 = this.createMedievalHouse({
      width: 5.4,
      depth: 6.2,
      height: 6.5,
      roofType: 'terracotta',
      hasDormer: true,
      hasChimney: true,
      chimneySide: 'right',
    });
    house2.position.set(9.5, 0, -13.5);
    house2.rotation.y = -0.15;
    courtyard.add(house2);

    // House 3: Village Cottage (West Mid) - Cozy Half-Timber with Terracotta Roof
    const house3 = this.createMedievalHouse({
      width: 4.8,
      depth: 5.5,
      height: 5.8,
      roofType: 'terracotta',
      hasDormer: false,
      hasChimney: true,
      chimneySide: 'left',
    });
    house3.position.set(-13.0, 0, -21.0);
    house3.rotation.y = 0.35;
    courtyard.add(house3);

    // House 4: Town Apothecary (East Mid) - Slate Blue Roof with High Gable
    const house4 = this.createMedievalHouse({
      width: 4.8,
      depth: 5.5,
      height: 5.8,
      roofType: 'slate',
      hasDormer: true,
      hasChimney: true,
      chimneySide: 'right',
    });
    house4.position.set(13.0, 0, -21.0);
    house4.rotation.y = -0.35;
    courtyard.add(house4);

    // House 5: Blacksmith Workshop (North-West Rear) - Wide Chimney & Anvil
    const house5 = this.createMedievalHouse({
      width: 5.0,
      depth: 5.8,
      height: 5.4,
      roofType: 'slate',
      hasDormer: false,
      hasChimney: true,
      chimneySide: 'left',
    });
    house5.position.set(-8.8, 0, -28.0);
    house5.rotation.y = 0.05;
    courtyard.add(house5);

    // House 6: Village Bakery (North-East Rear) - Warm Terracotta Roof
    const house6 = this.createMedievalHouse({
      width: 5.0,
      depth: 5.8,
      height: 5.4,
      roofType: 'terracotta',
      hasDormer: false,
      hasChimney: true,
      chimneySide: 'right',
    });
    house6.position.set(8.8, 0, -28.0);
    house6.rotation.y = -0.05;
    courtyard.add(house6);

    // -----------------------------------------------------------------------
    // VILLAGE MARKET STALLS (Vibrant Red, Yellow, Blue Striped Awnings!)
    // -----------------------------------------------------------------------
    // Stall 1: Red-and-Ivory Striped Awning (Produce & Food)
    const stall1 = this.createMarketStall(GameMaterials.awningRed, 'produce');
    stall1.position.set(-4.5, 0, -9.8);
    stall1.rotation.y = 0.2;
    courtyard.add(stall1);

    // Stall 2: Saffron Yellow Striped Awning (Pottery & Goods)
    const stall2 = this.createMarketStall(GameMaterials.awningYellow, 'pottery');
    stall2.position.set(4.5, 0, -9.8);
    stall2.rotation.y = -0.2;
    courtyard.add(stall2);

    // Stall 3: Royal Blue Striped Awning (Apothecary & Potions)
    const stall3 = this.createMarketStall(GameMaterials.awningBlue, 'potions');
    stall3.position.set(-3.8, 0, -18.2);
    stall3.rotation.y = Math.PI - 0.2;
    courtyard.add(stall3);

    // -----------------------------------------------------------------------
    // COURTYARD DETAILS (Barrels, Crates, Carts)
    // -----------------------------------------------------------------------
    // Stacked Barrels
    const barrel1 = this.createBarrel();
    barrel1.position.set(-1.8, 0.45, -8.5);
    courtyard.add(barrel1);

    const barrel2 = this.createBarrel();
    barrel2.position.set(-2.5, 0.45, -8.7);
    courtyard.add(barrel2);

    const barrel3 = this.createBarrel();
    barrel3.position.set(-2.1, 1.25, -8.6);
    courtyard.add(barrel3);

    // Supply Crates
    const crateGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const crate1 = new THREE.Mesh(crateGeo, GameMaterials.castleWood);
    crate1.position.set(2.2, 0.4, -8.5);
    crate1.castShadow = true;
    courtyard.add(crate1);

    const crate2 = new THREE.Mesh(crateGeo, GameMaterials.castleWood);
    crate2.position.set(2.9, 0.4, -8.6);
    crate2.rotation.y = 0.4;
    crate2.castShadow = true;
    courtyard.add(crate2);

    // Wooden Farm Cart with Wheels
    const cart = this.createWoodCart();
    cart.position.set(3.8, 0, -17.5);
    cart.rotation.y = -0.4;
    courtyard.add(cart);

    return courtyard;
  }

  // =========================================================================
  // MEDIEVAL HALF-TIMBER HOUSE (Procedural Diorama Architecture)
  // =========================================================================
  public static createMedievalHouse(options: {
    width: number;
    depth: number;
    height: number;
    roofType: 'slate' | 'terracotta';
    hasDormer: boolean;
    hasChimney: boolean;
    chimneySide: 'left' | 'right';
  }): THREE.Group {
    const house = new THREE.Group();

    const { width, depth, height, roofType, hasDormer, hasChimney, chimneySide } = options;

    // Ground Floor: Stone Foundation Base
    const stoneBaseH = 1.4;
    const stoneBaseGeo = new THREE.BoxGeometry(width, stoneBaseH, depth);
    const stoneBase = new THREE.Mesh(stoneBaseGeo, GameMaterials.stoneWall);
    stoneBase.position.set(0, stoneBaseH / 2, 0);
    stoneBase.castShadow = true;
    stoneBase.receiveShadow = true;
    house.add(stoneBase);

    // First Floor: Half-Timber Plaster Walls
    const wallH = height - stoneBaseH;
    const wallGeo = new THREE.BoxGeometry(width + 0.2, wallH, depth + 0.2);
    const wallMesh = new THREE.Mesh(wallGeo, GameMaterials.timberWall);
    wallMesh.position.set(0, stoneBaseH + wallH / 2, 0);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    house.add(wallMesh);

    // Wooden Door on front facade
    const doorGeo = new THREE.BoxGeometry(1.0, 1.8, 0.1);
    const door = new THREE.Mesh(doorGeo, GameMaterials.darkWood);
    door.position.set(0, 0.9, depth / 2 + 0.15);
    house.add(door);

    // Windows with Warm Candlelight Glow!
    const windowGeo = new THREE.BoxGeometry(0.8, 0.9, 0.08);

    // Front Window
    const winFront1 = new THREE.Mesh(windowGeo, GameMaterials.windowGlow);
    winFront1.position.set(-1.4, stoneBaseH + 1.4, depth / 2 + 0.16);
    house.add(winFront1);

    const winFront2 = new THREE.Mesh(windowGeo, GameMaterials.windowGlow);
    winFront2.position.set(1.4, stoneBaseH + 1.4, depth / 2 + 0.16);
    house.add(winFront2);

    // Timber Window Frames & Shutters
    const shutterGeo = new THREE.BoxGeometry(0.35, 0.9, 0.04);
    const shutterLeft = new THREE.Mesh(shutterGeo, GameMaterials.darkWood);
    shutterLeft.position.set(-1.4 - 0.45, stoneBaseH + 1.4, depth / 2 + 0.18);
    house.add(shutterLeft);

    const shutterRight = new THREE.Mesh(shutterGeo, GameMaterials.darkWood);
    shutterRight.position.set(1.4 + 0.45, stoneBaseH + 1.4, depth / 2 + 0.18);
    house.add(shutterRight);

    // Pitched Gable Roof (Triangular Prism)
    const roofRoofMat = roofType === 'slate' ? GameMaterials.roofSlateBlue : GameMaterials.roofTerracotta;
    const roofH = 2.4;
    const roofOverhang = 0.5;

    // Roof slope geometry
    const roofGeo = new THREE.ConeGeometry((width + roofOverhang * 2) * 0.72, roofH, 4);
    roofGeo.rotateY(Math.PI / 4);
    roofGeo.scale(1.0, 1.0, (depth + roofOverhang * 2) / (width + roofOverhang * 2));
    const roofMesh = new THREE.Mesh(roofGeo, roofRoofMat);
    roofMesh.position.set(0, height + roofH / 2, 0);
    roofMesh.castShadow = true;
    house.add(roofMesh);

    // Stone Chimney with Chimney Pot
    if (hasChimney) {
      const chimneyGeo = new THREE.BoxGeometry(0.8, height + roofH + 0.5, 0.8);
      const chimney = new THREE.Mesh(chimneyGeo, GameMaterials.stoneWall);
      const cx = chimneySide === 'left' ? -width / 2 + 0.4 : width / 2 - 0.4;
      chimney.position.set(cx, (height + roofH + 0.5) / 2, -depth / 4);
      chimney.castShadow = true;
      house.add(chimney);

      // Terracotta Chimney Pot
      const potGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.6, 8);
      const pot = new THREE.Mesh(potGeo, GameMaterials.roofTerracotta);
      pot.name = 'ChimneyPot';
      pot.position.set(cx, height + roofH + 0.7, -depth / 4);
      house.add(pot);
    }

    // Attic Dormer Window
    if (hasDormer) {
      const dormerGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const dormer = new THREE.Mesh(dormerGeo, GameMaterials.timberWall);
      dormer.position.set(0, height + 0.6, depth / 3);
      house.add(dormer);

      const dormerRoofGeo = new THREE.ConeGeometry(0.9, 0.8, 4);
      dormerRoofGeo.rotateY(Math.PI / 4);
      const dormerRoof = new THREE.Mesh(dormerRoofGeo, roofRoofMat);
      dormerRoof.position.set(0, height + 1.4, depth / 3);
      house.add(dormerRoof);

      const dormerWin = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.05), GameMaterials.windowGlow);
      dormerWin.position.set(0, height + 0.6, depth / 3 + 0.62);
      house.add(dormerWin);
    }

    return house;
  }

  // =========================================================================
  // VILLAGE MARKET STALL (Vibrant Canvas Canopies & Wooden Counters)
  // =========================================================================
  public static createMarketStall(canopyMat: THREE.Material, goodsType: string): THREE.Group {
    const stall = new THREE.Group();

    // Wooden Counter Table
    const tableGeo = new THREE.BoxGeometry(2.4, 0.85, 1.4);
    const table = new THREE.Mesh(tableGeo, GameMaterials.castleWood);
    table.position.set(0, 0.42, 0);
    table.castShadow = true;
    stall.add(table);

    // 4 Corner Timber Posts
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6);
    const postCoords = [
      { x: -1.1, z: -0.6 },
      { x: 1.1, z: -0.6 },
      { x: -1.1, z: 0.6 },
      { x: 1.1, z: 0.6 },
    ];
    for (const pc of postCoords) {
      const post = new THREE.Mesh(postGeo, GameMaterials.darkWood);
      post.position.set(pc.x, 1.1, pc.z);
      post.castShadow = true;
      stall.add(post);
    }

    // Curved Canvas Awning Canopy
    const awningGeo = new THREE.CylinderGeometry(1.5, 1.5, 2.6, 12, 1, false, 0, Math.PI);
    awningGeo.rotateZ(Math.PI / 2);
    const awning = new THREE.Mesh(awningGeo, canopyMat);
    awning.position.set(0, 2.2, 0);
    awning.scale.set(1.0, 0.45, 0.7);
    awning.castShadow = true;
    stall.add(awning);

    // Decorative Goods on Table
    if (goodsType === 'produce') {
      // Fruit / Cabbage spheres
      const fruitGeo = new THREE.SphereGeometry(0.12, 6, 6);
      const appleMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.4 });
      const melonMat = new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.5 });

      for (let i = -0.7; i <= 0.7; i += 0.35) {
        const apple = new THREE.Mesh(fruitGeo, appleMat);
        apple.position.set(i, 0.95, -0.2);
        stall.add(apple);

        const melon = new THREE.Mesh(fruitGeo, melonMat);
        melon.position.set(i + 0.1, 0.95, 0.2);
        stall.add(melon);
      }
    } else if (goodsType === 'pottery') {
      // Clay urns & pots
      const potGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.35, 8);
      const clayMat = new THREE.MeshStandardMaterial({ color: 0xa16239, roughness: 0.6 });
      for (let i = -0.6; i <= 0.6; i += 0.4) {
        const pot = new THREE.Mesh(potGeo, clayMat);
        pot.position.set(i, 1.02, (Math.random() - 0.5) * 0.4);
        stall.add(pot);
      }
    } else {
      // Potions & scrolls
      const bottleGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.28, 8);
      const redPotion = new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0x880000 });
      const bluePotion = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x004488 });
      const b1 = new THREE.Mesh(bottleGeo, redPotion);
      b1.position.set(-0.4, 0.98, 0);
      stall.add(b1);
      const b2 = new THREE.Mesh(bottleGeo, bluePotion);
      b2.position.set(0.4, 0.98, 0);
      stall.add(b2);
    }

    return stall;
  }

  // =========================================================================
  // VILLAGE STONE FOUNTAIN / WELL (Center Courtyard)
  // =========================================================================
  public static createVillageFountain(): THREE.Group {
    const fountain = new THREE.Group();

    // Octagonal Stone Basin
    const basinGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.8, 8);
    const basin = new THREE.Mesh(basinGeo, GameMaterials.stoneWall);
    basin.position.y = 0.4;
    basin.castShadow = true;
    fountain.add(basin);

    // Water Surface
    const waterGeo = new THREE.CylinderGeometry(2.1, 2.1, 0.1, 8);
    const water = new THREE.Mesh(waterGeo, GameMaterials.fountainWater);
    water.position.y = 0.72;
    fountain.add(water);

    // Center Stone Spire Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.5, 0.7, 2.0, 8);
    const pillar = new THREE.Mesh(pillarGeo, GameMaterials.bridgeStone);
    pillar.position.y = 1.4;
    pillar.castShadow = true;
    fountain.add(pillar);

    // Top Basin Tier
    const topBasinGeo = new THREE.CylinderGeometry(1.1, 1.2, 0.4, 8);
    const topBasin = new THREE.Mesh(topBasinGeo, GameMaterials.bridgeStone);
    topBasin.position.y = 2.4;
    fountain.add(topBasin);

    // Top Water Plume Sphere
    const plumeGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const plume = new THREE.Mesh(plumeGeo, GameMaterials.fountainWater);
    plume.position.y = 2.75;
    fountain.add(plume);

    return fountain;
  }

  // =========================================================================
  // GRAND CITADEL / HIGH STONE KEEP (Majestic Rear Center Landmark!)
  // =========================================================================
  public static createCitadelKeep(): THREE.Group {
    const keep = new THREE.Group();

    // Tower Level 1: Huge Cylindrical Stone Keep
    const keep1Geo = new THREE.CylinderGeometry(5.2, 5.8, 14, 24);
    const keep1 = new THREE.Mesh(keep1Geo, GameMaterials.stoneWall);
    keep1.position.y = 7;
    keep1.castShadow = true;
    keep1.receiveShadow = true;
    keep.add(keep1);

    // Stone Machicolation Cornice Ring (corbelled overhang)
    const corbelGeo = new THREE.CylinderGeometry(5.8, 5.2, 1.2, 24);
    const corbel = new THREE.Mesh(corbelGeo, GameMaterials.bridgeStone);
    corbel.position.y = 14.4;
    corbel.castShadow = true;
    keep.add(corbel);

    // Tower Level 2: Upper Parapet Citadel
    const keep2Geo = new THREE.CylinderGeometry(4.6, 5.0, 6, 24);
    const keep2 = new THREE.Mesh(keep2Geo, GameMaterials.stoneWall);
    keep2.position.y = 17.5;
    keep2.castShadow = true;
    keep.add(keep2);

    // Battlements Crenellations around Upper Parapet
    const merlonGeo = new THREE.BoxGeometry(0.9, 1.0, 0.6);
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      const merlon = new THREE.Mesh(merlonGeo, GameMaterials.stoneWall);
      merlon.position.set(Math.cos(a) * 4.6, 21.0, Math.sin(a) * 4.6);
      merlon.rotation.y = -a;
      merlon.castShadow = true;
      keep.add(merlon);
    }

    // High Conical Blue Slate Roof Spire (Towering Landmark!)
    const spireGeo = new THREE.ConeGeometry(5.2, 8.5, 24);
    const spire = new THREE.Mesh(spireGeo, GameMaterials.roofSlateBlue);
    spire.position.y = 24.8;
    spire.castShadow = true;
    keep.add(spire);

    // Brass Finial & Royal Heraldic Banner
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 3.2, 8);
    const pole = new THREE.Mesh(poleGeo, GameMaterials.ironTrim);
    pole.position.y = 30.0;
    keep.add(pole);

    const bannerGeo = new THREE.BoxGeometry(2.4, 1.4, 0.06);
    const banner = new THREE.Mesh(bannerGeo, GameMaterials.flagBlue);
    banner.position.set(1.2, 30.2, 0);
    banner.castShadow = true;
    keep.add(banner);

    // Arched Windows on the Keep with Warm Interior Light
    const winGeo = new THREE.BoxGeometry(0.8, 1.6, 0.2);
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
      const win = new THREE.Mesh(winGeo, GameMaterials.windowGlow);
      win.position.set(Math.cos(a) * 5.25, 9.0, Math.sin(a) * 5.25);
      win.rotation.y = -a + Math.PI / 2;
      keep.add(win);
    }

    return keep;
  }

  // =========================================================================
  // ALPINE CONIFER / FIR TREE (Layered Miniature Tabletop Diorama Tree)
  // =========================================================================
  public static createAlpineTree(totalHeight: number = 6.0): THREE.Group {
    const tree = new THREE.Group();

    // Trunk
    const trunkH = totalHeight * 0.35;
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.32, trunkH, 8);
    const trunk = new THREE.Mesh(trunkGeo, GameMaterials.pineTrunk);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    tree.add(trunk);

    // 4 Layered Conical Needle Foliage Tiers
    const tiers = 4;
    const foliageH = totalHeight - trunkH * 0.6;
    for (let i = 0; i < tiers; i++) {
      const t = i / tiers;
      const tierR = (1.0 - t * 0.65) * 2.2;
      const tierH = (foliageH / tiers) * 1.5;
      const coneGeo = new THREE.ConeGeometry(tierR, tierH, 8);
      const cone = new THREE.Mesh(coneGeo, GameMaterials.pineNeedles);
      cone.position.y = trunkH * 0.6 + i * (foliageH / tiers) + tierH * 0.4;
      cone.castShadow = true;
      cone.receiveShadow = true;
      tree.add(cone);
    }

    return tree;
  }

  // =========================================================================
  // STREET LANTERN & PROPS
  // =========================================================================
  public static createLantern(): THREE.Group {
    const lantern = new THREE.Group();
    lantern.name = 'Lantern';

    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 6);
    const post = new THREE.Mesh(postGeo, GameMaterials.ironTrim);
    post.position.y = 0.35;
    lantern.add(post);

    const cageGeo = new THREE.BoxGeometry(0.35, 0.45, 0.35);
    const cage = new THREE.Mesh(cageGeo, GameMaterials.ironTrim);
    cage.position.y = 0.75;
    lantern.add(cage);

    const glassGeo = new THREE.BoxGeometry(0.26, 0.36, 0.26);
    const glass = new THREE.Mesh(glassGeo, GameMaterials.windowGlow);
    glass.position.y = 0.75;
    lantern.add(glass);

    const light = new THREE.PointLight(0xffb74d, 1.8, 10, 1.4);
    light.position.y = 0.75;
    lantern.add(light);

    return lantern;
  }

  public static createBarrel(): THREE.Group {
    const barrel = new THREE.Group();
    const geo = new THREE.CylinderGeometry(0.38, 0.34, 0.9, 10);
    const mesh = new THREE.Mesh(geo, GameMaterials.castleWood);
    mesh.castShadow = true;
    barrel.add(mesh);

    // Iron Hoops
    const hoopGeo = new THREE.CylinderGeometry(0.39, 0.39, 0.08, 10);
    const hoop1 = new THREE.Mesh(hoopGeo, GameMaterials.ironTrim);
    hoop1.position.y = 0.25;
    barrel.add(hoop1);

    const hoop2 = new THREE.Mesh(hoopGeo, GameMaterials.ironTrim);
    hoop2.position.y = -0.25;
    barrel.add(hoop2);

    return barrel;
  }

  public static createWoodCart(): THREE.Group {
    const cart = new THREE.Group();

    // Cart Bed
    const bedGeo = new THREE.BoxGeometry(1.6, 0.4, 2.2);
    const bed = new THREE.Mesh(bedGeo, GameMaterials.castleWood);
    bed.position.y = 0.7;
    bed.castShadow = true;
    cart.add(bed);

    // Wooden Spoke Wheels (Left & Right)
    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 12);
    wheelGeo.rotateZ(Math.PI / 2);

    const leftWheel = new THREE.Mesh(wheelGeo, GameMaterials.darkWood);
    leftWheel.position.set(-0.95, 0.55, 0);
    leftWheel.castShadow = true;
    cart.add(leftWheel);

    const rightWheel = new THREE.Mesh(wheelGeo, GameMaterials.darkWood);
    rightWheel.position.set(0.95, 0.55, 0);
    rightWheel.castShadow = true;
    cart.add(rightWheel);

    // Cart Shafts (handles)
    const shaftGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.8, 6);
    shaftGeo.rotateX(Math.PI / 2);
    const leftShaft = new THREE.Mesh(shaftGeo, GameMaterials.darkWood);
    leftShaft.position.set(-0.5, 0.5, 1.8);
    cart.add(leftShaft);

    const rightShaft = new THREE.Mesh(shaftGeo, GameMaterials.darkWood);
    rightShaft.position.set(0.5, 0.5, 1.8);
    cart.add(rightShaft);

    return cart;
  }

  public static createTorch(): THREE.Group {
    const torch = new THREE.Group();
    torch.name = 'Torch';

    const sconceGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
    const sconce = new THREE.Mesh(sconceGeo, GameMaterials.ironTrim);
    sconce.rotation.z = 0.3;
    torch.add(sconce);

    const flameGeo = new THREE.ConeGeometry(0.18, 0.45, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0.1, 0.35, 0);
    flame.name = 'Flame';
    torch.add(flame);

    const light = new THREE.PointLight(0xffbb33, 2.8, 16, 1.2);
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

  // =========================================================================
  // BOY SCOUT DEFENDER & COLLECTOR WITH BIONIC MECHANICAL ARMS
  // (Matching User's Reference Sample Exactly!)
  // =========================================================================

  public static createDefender(rank: SoldierRank = 'rookie'): THREE.Group {
    return this.createScoutCharacter('soldier', rank);
  }

  public static createCollector(): THREE.Group {
    return this.createScoutCharacter('collector', 'rookie');
  }

  public static createScoutCharacter(role: 'soldier' | 'collector', rank: SoldierRank = 'rookie'): THREE.Group {
    const scout = new THREE.Group();
    scout.name = role === 'soldier' ? `Scout_Soldier_${rank}` : 'Scout_Collector';

    // -------------------------------------------------------------
    // 1. HEAD & CARTOON FACE
    // -------------------------------------------------------------
    const headGroup = new THREE.Group();
    headGroup.name = 'HeadGroup';
    headGroup.position.set(0, 1.45, 0);

    // Stylized boy head
    const headGeo = new THREE.SphereGeometry(0.38, 20, 18);
    headGeo.scale(1.0, 1.05, 0.95);
    const head = new THREE.Mesh(headGeo, GameMaterials.skinScout);
    head.name = 'Head';
    head.castShadow = true;
    headGroup.add(head);

    // Big expressive cartoon anime blue eyes with Star Sparkle pupils!
    const eyeGeo = new THREE.SphereGeometry(0.16, 16, 14);

    const leftEye = new THREE.Mesh(eyeGeo, GameMaterials.eyeMatScout);
    leftEye.position.set(-0.16, 0.04, 0.28);
    leftEye.rotation.y = -Math.PI / 2;
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, GameMaterials.eyeMatScout);
    rightEye.position.set(0.16, 0.04, 0.28);
    rightEye.rotation.y = -Math.PI / 2;
    headGroup.add(rightEye);

    // Friendly cartoon smile / mouth with white teeth
    const mouthGeo = new THREE.BoxGeometry(0.2, 0.08, 0.08);
    const mouth = new THREE.Mesh(mouthGeo, GameMaterials.mouthCavity);
    mouth.position.set(0, -0.16, 0.32);
    headGroup.add(mouth);

    const teethGeo = new THREE.BoxGeometry(0.16, 0.04, 0.06);
    const teeth = new THREE.Mesh(teethGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
    teeth.position.set(0, -0.14, 0.33);
    headGroup.add(teeth);

    // Cartoon round ears
    const earGeo = new THREE.TorusGeometry(0.09, 0.03, 8, 14);
    const leftEar = new THREE.Mesh(earGeo, GameMaterials.skinScout);
    leftEar.position.set(-0.38, 0, 0);
    leftEar.rotation.y = Math.PI / 2;
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, GameMaterials.skinScout);
    rightEar.position.set(0.38, 0, 0);
    rightEar.rotation.y = -Math.PI / 2;
    headGroup.add(rightEar);

    // Blonde Swept Quiff / Pompadour Hair (Direct match to reference image!)
    const hairGroup = new THREE.Group();
    // Front sweeping pompadour wave
    const quiffGeo = new THREE.CapsuleGeometry(0.14, 0.28, 8, 8);
    quiffGeo.rotateX(Math.PI / 3);
    quiffGeo.rotateZ(0.2);
    const quiff = new THREE.Mesh(quiffGeo, GameMaterials.scoutBlondeHair);
    quiff.position.set(-0.06, 0.36, 0.22);
    hairGroup.add(quiff);

    // Hair back/top volume
    const hairCapGeo = new THREE.SphereGeometry(0.36, 16, 12, 0, Math.PI * 2, 0, Math.PI / 1.8);
    const hairCap = new THREE.Mesh(hairCapGeo, GameMaterials.scoutBlondeHair);
    hairCap.position.set(0, 0.08, -0.05);
    hairGroup.add(hairCap);

    headGroup.add(hairGroup);

    // Green Scout Side Cap (Forage Cap) perched jauntily on head
    const capGeo = new THREE.BoxGeometry(0.24, 0.16, 0.36);
    const cap = new THREE.Mesh(capGeo, GameMaterials.scoutCapGreen);
    cap.position.set(0.14, 0.34, -0.04);
    cap.rotation.z = -0.25;
    cap.rotation.x = -0.1;
    headGroup.add(cap);

    // Major / Captain Rank Flair
    if (rank === 'major') {
      // Crimson vanguard beret badge
      const badgeGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const badge = new THREE.Mesh(badgeGeo, new THREE.MeshStandardMaterial({ color: 0xff1744, metalness: 0.8 }));
      badge.position.set(0.24, 0.38, 0.1);
      headGroup.add(badge);
    } else if (rank === 'archer') {
      // Golden master ranger feather
      const featherGeo = new THREE.ConeGeometry(0.04, 0.28, 4);
      const feather = new THREE.Mesh(featherGeo, GameMaterials.goldCoin);
      feather.position.set(0.22, 0.46, -0.05);
      feather.rotation.z = -0.4;
      headGroup.add(feather);
    }

    scout.add(headGroup);

    // -------------------------------------------------------------
    // 2. SCOUT UNIFORM & TORSO
    // -------------------------------------------------------------
    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.22, 10);
    const neck = new THREE.Mesh(neckGeo, GameMaterials.skinScout);
    neck.position.set(0, 1.25, 0);
    scout.add(neck);

    // Scout Collared Shirt
    const shirtGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.62, 12);
    const shirt = new THREE.Mesh(shirtGeo, GameMaterials.scoutShirtGreen);
    shirt.position.set(0, 0.9, 0);
    shirt.castShadow = true;
    scout.add(shirt);

    // Scout Neckerchief / Scarf (Rust brown for soldier, Orange for collector)
    const scarfMat = role === 'collector' ? GameMaterials.scoutScarfOrange : GameMaterials.scoutScarfRust;
    const scarfGeo = new THREE.ConeGeometry(0.28, 0.26, 4);
    scarfGeo.rotateX(Math.PI);
    const scarf = new THREE.Mesh(scarfGeo, scarfMat);
    scarf.position.set(0, 1.12, 0.18);
    scarf.scale.set(1.0, 0.7, 0.5);
    scout.add(scarf);

    // Gold Slide Woggle / Ring on neckerchief
    const woggleGeo = new THREE.TorusGeometry(0.06, 0.025, 8, 12);
    const woggle = new THREE.Mesh(woggleGeo, GameMaterials.goldWoggle);
    woggle.position.set(0, 1.05, 0.24);
    scout.add(woggle);

    // Brown Leather Belt with Gold Buckle
    const beltGeo = new THREE.CylinderGeometry(0.37, 0.37, 0.08, 12);
    const belt = new THREE.Mesh(beltGeo, GameMaterials.scoutBelt);
    belt.position.set(0, 0.62, 0);
    scout.add(belt);

    const buckleGeo = new THREE.BoxGeometry(0.12, 0.1, 0.06);
    const buckle = new THREE.Mesh(buckleGeo, GameMaterials.goldWoggle);
    buckle.position.set(0, 0.62, 0.36);
    scout.add(buckle);

    // -------------------------------------------------------------
    // 3. CYBERNETIC MECHANICAL / BIONIC ARMS & HANDS
    // (Direct from Reference Image: Bionic Elbow, Chrome Forearm & Mechanical Hand!)
    // -------------------------------------------------------------

    // LEFT ARM (Bionic Gauntlet Arm)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.name = 'LeftArm';

    // Short scout sleeve
    const sleeveGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.22, 10);
    const sleeveL = new THREE.Mesh(sleeveGeo, GameMaterials.scoutShirtGreen);
    sleeveL.position.set(0, -0.1, 0);
    leftArmGroup.add(sleeveL);

    // Flesh upper arm
    const armUpperGeo = new THREE.CylinderGeometry(0.09, 0.085, 0.26, 8);
    const armUpperL = new THREE.Mesh(armUpperGeo, GameMaterials.skinScout);
    armUpperL.position.set(0, -0.28, 0);
    leftArmGroup.add(armUpperL);

    // Mechanical Bionic Elbow Hinge (Chrome + Dark hydraulic joint)
    const elbowGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.12, 8);
    elbowGeo.rotateZ(Math.PI / 2);
    const elbowL = new THREE.Mesh(elbowGeo, GameMaterials.bionicJointDark);
    elbowL.position.set(0, -0.42, 0);
    leftArmGroup.add(elbowL);

    // Cybernetic Mechanical Forearm Casing
    const forearmGeo = new THREE.BoxGeometry(0.18, 0.34, 0.18);
    const forearmL = new THREE.Mesh(forearmGeo, GameMaterials.bionicMetalChrome);
    forearmL.position.set(0, -0.58, 0.14);
    forearmL.rotation.x = Math.PI / 4;
    leftArmGroup.add(forearmL);

    if (role === 'soldier') {
      // Soldier Bionic Hand holds Bow or Wrist Launcher
      const handGeo = new THREE.BoxGeometry(0.16, 0.12, 0.18);
      const handL = new THREE.Mesh(handGeo, GameMaterials.bionicKnuckles);
      handL.position.set(0, -0.72, 0.28);
      leftArmGroup.add(handL);

      // Bow attached to Bionic Left Hand
      const bow = this.createBow();
      bow.position.set(0, -0.72, 0.38);
      bow.name = 'Bow';
      leftArmGroup.add(bow);
    } else {
      // Collector GIANT MECHANICAL SCOOP / COIN HARVESTER HAND! (From Image!)
      const palmGeo = new THREE.BoxGeometry(0.24, 0.08, 0.22);
      const palmL = new THREE.Mesh(palmGeo, GameMaterials.bionicMetalChrome);
      palmL.position.set(0, -0.72, 0.28);
      leftArmGroup.add(palmL);

      // Articulating mechanical finger segments
      const fingerGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.22, 6);
      for (let f = -1.5; f <= 1.5; f++) {
        const finger = new THREE.Mesh(fingerGeo, GameMaterials.bionicKnuckles);
        finger.position.set(f * 0.065, -0.84, 0.38);
        finger.rotation.x = Math.PI / 3.5;
        leftArmGroup.add(finger);
      }
    }

    leftArmGroup.position.set(-0.46, 1.15, 0);
    scout.add(leftArmGroup);

    // RIGHT ARM (Bionic Power Fist - from Image!)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.name = 'RightArm';

    const sleeveR = new THREE.Mesh(sleeveGeo, GameMaterials.scoutShirtGreen);
    sleeveR.position.set(0, -0.1, 0);
    rightArmGroup.add(sleeveR);

    const armUpperR = new THREE.Mesh(armUpperGeo, GameMaterials.skinScout);
    armUpperR.position.set(0, -0.28, 0);
    rightArmGroup.add(armUpperR);

    const elbowR = new THREE.Mesh(elbowGeo, GameMaterials.bionicJointDark);
    elbowR.position.set(0, -0.42, 0);
    rightArmGroup.add(elbowR);

    const forearmR = new THREE.Mesh(forearmGeo, GameMaterials.bionicMetalChrome);
    forearmR.position.set(0, -0.58, 0);
    rightArmGroup.add(forearmR);

    // Clenched Mechanical Power Fist with metallic knuckle studs!
    const fistGeo = new THREE.BoxGeometry(0.18, 0.16, 0.18);
    const fistR = new THREE.Mesh(fistGeo, GameMaterials.bionicKnuckles);
    fistR.position.set(0, -0.76, 0);
    rightArmGroup.add(fistR);

    // Knuckle studs
    for (let k = -1; k <= 1; k++) {
      const studGeo = new THREE.SphereGeometry(0.03, 6, 6);
      const stud = new THREE.Mesh(studGeo, GameMaterials.bionicMetalChrome);
      stud.position.set(k * 0.055, -0.82, 0.09);
      rightArmGroup.add(stud);
    }

    rightArmGroup.position.set(0.46, 1.15, 0);
    scout.add(rightArmGroup);

    // -------------------------------------------------------------
    // 4. SCOUT SHORTS, RIBBED SOCKS & HIKING BOOTS
    // -------------------------------------------------------------
    const createScoutLeg = (isLeft: boolean) => {
      const legGroup = new THREE.Group();
      legGroup.name = isLeft ? 'LeftLeg' : 'RightLeg';
      const sign = isLeft ? -1 : 1;

      // Olive Scout Shorts
      const shortGeo = new THREE.CylinderGeometry(0.17, 0.18, 0.32, 10);
      const shorts = new THREE.Mesh(shortGeo, GameMaterials.scoutShortsGreen);
      shorts.position.set(0, 0.44, 0);
      legGroup.add(shorts);

      // Folded cuff rim
      const cuffGeo = new THREE.TorusGeometry(0.18, 0.035, 8, 12);
      cuffGeo.rotateX(Math.PI / 2);
      const cuff = new THREE.Mesh(cuffGeo, GameMaterials.scoutShortsGreen);
      cuff.position.set(0, 0.28, 0);
      legGroup.add(cuff);

      // Ribbed Green Knee-High Socks (from image!)
      const sockGeo = new THREE.CylinderGeometry(0.11, 0.095, 0.34, 10);
      const sock = new THREE.Mesh(sockGeo, GameMaterials.scoutSocks);
      sock.position.set(0, 0.22, 0);
      legGroup.add(sock);

      // Brown Lace-Up Hiking Boots
      const bootGroup = new THREE.Group();
      bootGroup.position.set(0, 0.07, 0.05);

      const toeGeo = new THREE.CapsuleGeometry(0.12, 0.2, 8, 8);
      toeGeo.rotateX(Math.PI / 2);
      const boot = new THREE.Mesh(toeGeo, GameMaterials.scoutBoots);
      boot.castShadow = true;
      bootGroup.add(boot);

      const soleGeo = new THREE.BoxGeometry(0.24, 0.05, 0.38);
      const sole = new THREE.Mesh(soleGeo, GameMaterials.cartoonShoeSole);
      sole.position.y = -0.06;
      bootGroup.add(sole);

      // White laces
      const laceGeo = new THREE.BoxGeometry(0.12, 0.02, 0.08);
      const lace = new THREE.Mesh(laceGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      lace.position.set(0, 0.08, 0.04);
      bootGroup.add(lace);

      legGroup.add(bootGroup);

      legGroup.position.set(sign * 0.2, 0, 0);
      return legGroup;
    };

    const leftLeg = createScoutLeg(true);
    scout.add(leftLeg);

    const rightLeg = createScoutLeg(false);
    scout.add(rightLeg);

    // Collector Leather Satchel on Hip
    if (role === 'collector') {
      const satchelGeo = new THREE.BoxGeometry(0.26, 0.24, 0.14);
      const satchel = new THREE.Mesh(satchelGeo, GameMaterials.scoutBelt);
      satchel.position.set(-0.35, 0.65, 0);
      scout.add(satchel);

      const strapGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6);
      strapGeo.rotateZ(Math.PI / 3.8);
      const strap = new THREE.Mesh(strapGeo, GameMaterials.scoutBelt);
      strap.position.set(0.05, 0.88, 0.05);
      scout.add(strap);
    }

    return scout;
  }

  public static createBow(): THREE.Group {
    const bow = new THREE.Group();
    bow.name = 'Bow';

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, -0.65, 0),
      new THREE.Vector3(0.2, 0, 0.15),
      new THREE.Vector3(0, 0.65, 0)
    );
    const bowGeo = new THREE.TubeGeometry(curve, 12, 0.045, 6, false);
    const bowMesh = new THREE.Mesh(bowGeo, GameMaterials.bionicMetalChrome);
    bow.add(bowMesh);

    const stringGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.3, 4);
    const stringMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
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
  // (Bright, High-Visibility, Matching User's Samples 1, 2, 3)
  // =========================================================================

  public static createZombie(type: 'walker' | 'runner' | 'tank' | 'exploder' | 'siege' | 'boss'): THREE.Group {
    const zombie = new THREE.Group();
    zombie.name = `Zombie_${type}`;

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
      hasSpikyHair = false;
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
    headGroup.position.set(0, 1.5, 0);

    // Bulbous Head Sphere (oversized ~45% of entire body height!)
    const headGeo = new THREE.SphereGeometry(0.72, 22, 18);
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
      const seamGeo = new THREE.BoxGeometry(0.35, 0.025, 0.04);
      const seam = new THREE.Mesh(seamGeo, GameMaterials.eyeSocketDark);
      seam.position.set(0.18, 0.52, 0.52);
      seam.rotation.z = 0.4;
      headGroup.add(seam);

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

      const hornGeo = new THREE.ConeGeometry(0.14, 0.55, 6);
      const leftHorn = new THREE.Mesh(hornGeo, GameMaterials.ironTrim);
      leftHorn.position.set(-0.6, 0.75, 0);
      leftHorn.rotation.z = 0.6;
      headGroup.add(leftHorn);

      const rightHorn = new THREE.Mesh(hornGeo, GameMaterials.ironTrim);
      rightHorn.position.set(0.6, 0.75, 0);
      rightHorn.rotation.z = -0.6;
      headGroup.add(rightHorn);

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
    const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.3, 10);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 1.15, 0);
    zombie.add(neck);

    const torsoGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.72, 12);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.set(0, 0.75, 0);
    torso.name = 'Belly';
    torso.castShadow = true;
    zombie.add(torso);

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

      const armUpperGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.45, 8);
      const armUpper = new THREE.Mesh(armUpperGeo, shirtMat);
      armUpper.position.set(0, -0.22, 0);
      armGroup.add(armUpper);

      const forearmGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.45, 8);
      const forearm = new THREE.Mesh(forearmGeo, skinMat);
      forearm.position.set(0, -0.45, 0.22);
      forearm.rotation.x = Math.PI / 3;
      armGroup.add(forearm);

      const palmGeo = new THREE.BoxGeometry(0.16, 0.06, 0.16);
      const palm = new THREE.Mesh(palmGeo, skinMat);
      palm.position.set(0, -0.65, 0.42);
      palm.rotation.x = Math.PI / 4;
      armGroup.add(palm);

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

      const pantGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.38, 8);
      const pantMesh = new THREE.Mesh(pantGeo, pantsMat);
      pantMesh.position.set(0, 0.35, 0);
      legGroup.add(pantMesh);

      const shinGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.3, 8);
      const shinMesh = new THREE.Mesh(shinGeo, skinMat);
      shinMesh.position.set(0, 0.15, 0);
      legGroup.add(shinMesh);

      const shoeGroup = new THREE.Group();
      shoeGroup.position.set(0, 0.06, 0.06);

      const toeGeo = new THREE.CapsuleGeometry(0.14, 0.22, 8, 8);
      toeGeo.rotateX(Math.PI / 2);
      const toeMesh = new THREE.Mesh(toeGeo, GameMaterials.cartoonShoe);
      toeMesh.castShadow = true;
      shoeGroup.add(toeMesh);

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

    if (scale !== 1.0) {
      zombie.scale.set(scale, scale, scale);
    }

    return zombie;
  }
}
