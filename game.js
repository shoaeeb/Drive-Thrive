class DrivingGame {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        this.car = null;
        this.carBody = null;
        this.wheels = [];
        
        // Collision objects
        this.collisionObjects = [];
        
        // Taxi mode
        this.taxiMode = {
            active: false,
            passenger: null,
            pickupLocation: null,
            destination: null,
            fare: 0,
            totalEarnings: 0,
            pickupRadius: 5,
            dropoffRadius: 8
        };
        
        // NPC passengers
        this.availablePassengers = [];
        
        // AI Cars
        this.aiCars = [];
        this.aiCarColors = [
            0x0000FF, // Blue
            0x00FF00, // Green
            0xFFFF00, // Yellow
            0xFF00FF, // Magenta
            0x00FFFF, // Cyan
            0xFFA500, // Orange
            0x800080, // Purple
            0xFFC0CB, // Pink
            0x808080, // Gray
            0x000000  // Black
        ];
        
        // Minimap
        this.minimap = {
            canvas: null,
            ctx: null,
            scale: 0.2, // World units to pixels
            centerX: 100,
            centerY: 100
        };
        
        // Weather and time system
        this.timeOfDay = 0.5; // 0 = midnight, 0.5 = noon, 1 = midnight
        this.weather = {
            isRaining: false,
            rainIntensity: 0,
            rainParticles: null,
            fogDensity: 0.001
        };
        this.directionalLight = null;
        this.streetLights = [];
        this.rainSystem = null;
        
        // Car headlights
        this.leftHeadlight = null;
        this.rightHeadlight = null;
        this.leftHeadlightTarget = null;
        this.rightHeadlightTarget = null;
        this.headlightsManualOverride = false;
        this.headlightsManualState = false;
        
        // Life Mode - Player Stats
        this.lifeMode = {
            enabled: true,
            money: 100,
            energy: 100,
            hunger: 100,
            fuel: 100,
            mood: 100,
            maxEnergy: 100,
            maxHunger: 100,
            maxFuel: 100,
            maxMood: 100
        };
        
        // Time system
        this.gameTime = {
            hour: 8, // Start at 8 AM
            minute: 0,
            dayCount: 1,
            timeSpeed: 0.01 // Game minutes per frame
        };
        
        // World locations
        this.worldLocations = {
            home: { x: 50, z: 50, name: "Your Home" },
            restaurants: [],
            gasStations: [],
            garages: []
        };
        
        // Daily goals
        this.dailyGoals = {
            moneyTarget: 200,
            tripsTarget: 5,
            moneyEarned: 0,
            tripsCompleted: 0
        };
        
        // Car physics
        this.carPosition = new THREE.Vector3(0, 0.4, 0);
        this.carRotation = 0;
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.speed = 0;
        this.maxSpeed = 50;
        this.acceleration = 0.3;
        this.friction = 0.95;
        this.turnSpeed = 0.08;
        
        // Input handling
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            brake: false
        };
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB); // Sky blue
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('gameContainer').appendChild(this.renderer.domElement);
        
        // Setup lighting
        this.setupLighting();
        
        // Create environment
        this.createEnvironment();
        
        // Create car
        this.createCar();
        
        // Create taxi passengers
        this.createTaxiPassengers();
        
        // Create AI cars
        this.createAICars();
        
        // Create street lights
        this.createStreetLights();
        
        // Create rain system
        this.createRainSystem();
        
        // Create world locations (restaurants, gas stations, etc.)
        this.createWorldLocations();
        
        // Setup camera
        this.setupCamera();
        
        // Setup minimap
        this.setupMinimap();
    }
    
    setupLighting() {
        // Ambient light - increased brightness for better daytime visibility
        const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
        this.scene.add(ambientLight);
        
        // Directional light (sun) - adjusted for much bigger world
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        this.directionalLight.position.set(400, 400, 400);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 1200;
        this.directionalLight.shadow.camera.left = -800;
        this.directionalLight.shadow.camera.right = 800;
        this.directionalLight.shadow.camera.top = 800;
        this.directionalLight.shadow.camera.bottom = -800;
        this.scene.add(this.directionalLight);
    }
    
    createEnvironment() {
        // Much bigger ground - expanded to 2000x2000
        const groundGeometry = new THREE.PlaneGeometry(2000, 2000);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Create expanded road network
        this.createExpandedRoadNetwork();
        
        // Trees
        this.createTrees();
        
        // Buildings (city and village)
        this.createBuildings();
        
        // Add village areas
        this.createVillageAreas();
    }
    
    createExpandedRoadNetwork() {
        const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        // Main highway system (wider roads)
        const mainHighwayGeometry = new THREE.PlaneGeometry(16, 2000);
        const mainHighway = new THREE.Mesh(mainHighwayGeometry, roadMaterial);
        mainHighway.rotation.x = -Math.PI / 2;
        mainHighway.position.y = 0.01;
        mainHighway.receiveShadow = true;
        this.scene.add(mainHighway);
        
        // Cross highway
        const crossHighwayGeometry = new THREE.PlaneGeometry(2000, 16);
        const crossHighway = new THREE.Mesh(crossHighwayGeometry, roadMaterial);
        crossHighway.rotation.x = -Math.PI / 2;
        crossHighway.position.y = 0.01;
        crossHighway.receiveShadow = true;
        this.scene.add(crossHighway);
        
        // City grid roads (closer together in center)
        for (let i = -600; i <= 600; i += 150) {
            if (Math.abs(i) > 20) { // Don't overlap with main highway
                // North-South city roads
                const cityRoad = new THREE.Mesh(new THREE.PlaneGeometry(10, 1200), roadMaterial);
                cityRoad.rotation.x = -Math.PI / 2;
                cityRoad.position.set(i, 0.01, 0);
                cityRoad.receiveShadow = true;
                this.scene.add(cityRoad);
                
                // East-West city roads
                const cityRoad2 = new THREE.Mesh(new THREE.PlaneGeometry(1200, 10), roadMaterial);
                cityRoad2.rotation.x = -Math.PI / 2;
                cityRoad2.position.set(0, 0.01, i);
                cityRoad2.receiveShadow = true;
                this.scene.add(cityRoad2);
            }
        }
        
        // Village roads (further out, less organized)
        const villageRoadPositions = [
            // Village cluster 1 (top-right)
            { x: 800, z: 800, width: 8, length: 400, rotation: 0 },
            { x: 800, z: 800, width: 400, length: 8, rotation: 0 },
            { x: 900, z: 700, width: 6, length: 200, rotation: Math.PI / 4 },
            
            // Village cluster 2 (top-left)
            { x: -800, z: 800, width: 8, length: 350, rotation: 0 },
            { x: -800, z: 800, width: 350, length: 8, rotation: 0 },
            { x: -700, z: 900, width: 6, length: 150, rotation: -Math.PI / 6 },
            
            // Village cluster 3 (bottom-right)
            { x: 800, z: -800, width: 8, length: 300, rotation: 0 },
            { x: 800, z: -800, width: 300, length: 8, rotation: 0 },
            { x: 750, z: -750, width: 6, length: 180, rotation: Math.PI / 3 },
            
            // Village cluster 4 (bottom-left)
            { x: -800, z: -800, width: 8, length: 320, rotation: 0 },
            { x: -800, z: -800, width: 320, length: 8, rotation: 0 },
            { x: -850, z: -700, width: 6, length: 160, rotation: -Math.PI / 4 }
        ];
        
        villageRoadPositions.forEach(road => {
            const villageRoad = new THREE.Mesh(
                new THREE.PlaneGeometry(road.width, road.length), 
                roadMaterial
            );
            villageRoad.rotation.x = -Math.PI / 2;
            villageRoad.rotation.y = road.rotation;
            villageRoad.position.set(road.x, 0.01, road.z);
            villageRoad.receiveShadow = true;
            this.scene.add(villageRoad);
        });
        
        // Road markings for main highways
        for (let i = -980; i < 980; i += 20) {
            // Main highway markings
            const markingGeometry = new THREE.PlaneGeometry(0.8, 12);
            const markingMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
            const marking = new THREE.Mesh(markingGeometry, markingMaterial);
            marking.rotation.x = -Math.PI / 2;
            marking.position.set(0, 0.02, i);
            this.scene.add(marking);
            
            // Cross highway markings
            const crossMarking = new THREE.Mesh(new THREE.PlaneGeometry(12, 0.8), markingMaterial);
            crossMarking.rotation.x = -Math.PI / 2;
            crossMarking.position.set(i, 0.02, 0);
            this.scene.add(crossMarking);
        }
    }
    
    createTrees() {
        // Reduce trees significantly for better performance
        for (let i = 0; i < 150; i++) {
            const tree = new THREE.Group();
            
            // Trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 2;
            // Disable shadows on some trees for performance
            trunk.castShadow = i < 50; // Only first 50 trees cast shadows
            tree.add(trunk);
            
            // Leaves
            const leavesGeometry = new THREE.SphereGeometry(2.5);
            const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 5;
            leaves.castShadow = i < 50; // Only first 50 trees cast shadows
            tree.add(leaves);
            
            // Random position across the much bigger world
            const x = (Math.random() - 0.5) * 1800;
            const z = (Math.random() - 0.5) * 1800;
            
            // Don't place trees on roads (check for expanded road network)
            const onMainHighway = (Math.abs(x) < 10 && Math.abs(z) < 1000) || (Math.abs(z) < 10 && Math.abs(x) < 1000);
            const onCityRoad = this.isOnExpandedRoad(x, z);
            
            if (!onMainHighway && !onCityRoad) {
                tree.position.set(x, 0, z);
                this.scene.add(tree);
                
                // Add to collision objects with radius for collision detection
                this.collisionObjects.push({
                    position: new THREE.Vector3(x, 0, z),
                    radius: 2.5, // Tree collision radius
                    type: 'tree'
                });
            }
        }
    }
    
    isOnExpandedRoad(x, z) {
        // Check city grid roads
        for (let roadX = -600; roadX <= 600; roadX += 150) {
            if (Math.abs(roadX) > 20 && Math.abs(x - roadX) < 8 && Math.abs(z) < 600) {
                return true;
            }
        }
        for (let roadZ = -600; roadZ <= 600; roadZ += 150) {
            if (Math.abs(roadZ) > 20 && Math.abs(z - roadZ) < 8 && Math.abs(x) < 600) {
                return true;
            }
        }
        
        // Check village roads (approximate areas)
        const villageAreas = [
            { x: 800, z: 800, size: 200 },
            { x: -800, z: 800, size: 200 },
            { x: 800, z: -800, size: 200 },
            { x: -800, z: -800, size: 200 }
        ];
        
        for (let area of villageAreas) {
            if (Math.abs(x - area.x) < area.size && Math.abs(z - area.z) < area.size) {
                // Simple road check within village areas
                if ((Math.abs(x - area.x) < 6 && Math.abs(z - area.z) < area.size) ||
                    (Math.abs(z - area.z) < 6 && Math.abs(x - area.x) < area.size)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    createBuildings() {
        // Reduce city buildings for better performance
        for (let i = 0; i < 30; i++) {
            const width = Math.random() * 20 + 10;
            const height = Math.random() * 50 + 20;
            const depth = Math.random() * 20 + 10;
            
            const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
            const buildingMaterial = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.1, 0.3, 0.6) // Urban colors
            });
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            
            // Position in city center
            const x = (Math.random() - 0.5) * 1000;
            const z = (Math.random() - 0.5) * 1000;
            
            // Don't place buildings on roads or too close to roads
            const onMainHighway = (Math.abs(x) < 25 && Math.abs(z) < 1000) || (Math.abs(z) < 25 && Math.abs(x) < 1000);
            const onCityRoad = this.isNearExpandedRoad(x, z);
            
            if (!onMainHighway && !onCityRoad && Math.abs(x) < 700 && Math.abs(z) < 700) {
                building.position.set(x, height / 2, z);
                building.castShadow = true;
                building.receiveShadow = true;
                this.scene.add(building);
                
                // Add to collision objects
                this.collisionObjects.push({
                    position: new THREE.Vector3(x, 0, z),
                    width: width,
                    depth: depth,
                    type: 'building'
                });
            }
        }
    }
    
    createVillageAreas() {
        const villagePositions = [
            { centerX: 800, centerZ: 800, name: "Riverside Village" },
            { centerX: -800, centerZ: 800, name: "Hillside Village" },
            { centerX: 800, centerZ: -800, name: "Meadow Village" },
            { centerX: -800, centerZ: -800, name: "Forest Village" }
        ];
        
        villagePositions.forEach(village => {
            // Create village buildings (smaller, more spread out) - reduced count
            for (let i = 0; i < 8; i++) {
                const width = Math.random() * 8 + 4;
                const height = Math.random() * 8 + 4;
                const depth = Math.random() * 8 + 4;
                
                const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
                const buildingMaterial = new THREE.MeshLambertMaterial({ 
                    color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.05, 0.4, 0.7) // Warmer village colors
                });
                const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
                
                // Position around village center
                const x = village.centerX + (Math.random() - 0.5) * 300;
                const z = village.centerZ + (Math.random() - 0.5) * 300;
                
                // Simple road avoidance for villages
                const tooCloseToVillageRoad = 
                    (Math.abs(x - village.centerX) < 10 && Math.abs(z - village.centerZ) < 150) ||
                    (Math.abs(z - village.centerZ) < 10 && Math.abs(x - village.centerX) < 150);
                
                if (!tooCloseToVillageRoad) {
                    building.position.set(x, height / 2, z);
                    building.castShadow = true;
                    building.receiveShadow = true;
                    this.scene.add(building);
                    
                    // Add to collision objects
                    this.collisionObjects.push({
                        position: new THREE.Vector3(x, 0, z),
                        width: width,
                        depth: depth,
                        type: 'building'
                    });
                }
            }
            
            // Add village landmarks
            this.createVillageLandmarks(village.centerX, village.centerZ);
        });
    }
    
    createVillageLandmarks(centerX, centerZ) {
        // Village church/community center
        const churchGeometry = new THREE.BoxGeometry(12, 15, 8);
        const churchMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const church = new THREE.Mesh(churchGeometry, churchMaterial);
        church.position.set(centerX + 20, 7.5, centerZ + 20);
        church.castShadow = true;
        church.receiveShadow = true;
        this.scene.add(church);
        
        // Church spire
        const spireGeometry = new THREE.ConeGeometry(2, 8);
        const spire = new THREE.Mesh(spireGeometry, churchMaterial);
        spire.position.set(centerX + 20, 19, centerZ + 20);
        spire.castShadow = true;
        this.scene.add(spire);
        
        // Village well
        const wellGeometry = new THREE.CylinderGeometry(2, 2, 3);
        const wellMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const well = new THREE.Mesh(wellGeometry, wellMaterial);
        well.position.set(centerX - 15, 1.5, centerZ - 15);
        well.castShadow = true;
        this.scene.add(well);
        
        // Add collision for landmarks
        this.collisionObjects.push({
            position: new THREE.Vector3(centerX + 20, 0, centerZ + 20),
            width: 12,
            depth: 8,
            type: 'building'
        });
        
        this.collisionObjects.push({
            position: new THREE.Vector3(centerX - 15, 0, centerZ - 15),
            radius: 2.5,
            type: 'tree' // Use tree collision for round objects
        });
    }
    
    isNearExpandedRoad(x, z) {
        // Check city grid roads
        for (let roadX = -600; roadX <= 600; roadX += 150) {
            if (Math.abs(roadX) > 20 && Math.abs(x - roadX) < 30 && Math.abs(z) < 600) {
                return true;
            }
        }
        for (let roadZ = -600; roadZ <= 600; roadZ += 150) {
            if (Math.abs(roadZ) > 20 && Math.abs(z - roadZ) < 30 && Math.abs(x) < 600) {
                return true;
            }
        }
        return false;
    }
    
    createTaxiPassengers() {
        // Create 5 random passengers waiting for pickup
        for (let i = 0; i < 5; i++) {
            this.spawnNewPassenger();
        }
    }
    
    spawnNewPassenger() {
        // Expanded road positions for much bigger world
        const roadPositions = [
            // Main highways
            { x: 0, z: (Math.random() - 0.5) * 1800 }, // Main highway
            { x: (Math.random() - 0.5) * 1800, z: 0 }, // Cross highway
            
            // City grid roads
            { x: -450, z: (Math.random() - 0.5) * 1000 },
            { x: 450, z: (Math.random() - 0.5) * 1000 },
            { x: -300, z: (Math.random() - 0.5) * 1000 },
            { x: 300, z: (Math.random() - 0.5) * 1000 },
            { x: (Math.random() - 0.5) * 1000, z: -450 },
            { x: (Math.random() - 0.5) * 1000, z: 450 },
            { x: (Math.random() - 0.5) * 1000, z: -300 },
            { x: (Math.random() - 0.5) * 1000, z: 300 },
            
            // Village roads
            { x: 800, z: (Math.random() - 0.5) * 400 + 800 }, // Riverside Village
            { x: -800, z: (Math.random() - 0.5) * 400 + 800 }, // Hillside Village
            { x: 800, z: (Math.random() - 0.5) * 400 - 800 }, // Meadow Village
            { x: -800, z: (Math.random() - 0.5) * 400 - 800 }, // Forest Village
            { x: (Math.random() - 0.5) * 400 + 800, z: 800 },
            { x: (Math.random() - 0.5) * 400 - 800, z: 800 },
            { x: (Math.random() - 0.5) * 400 + 800, z: -800 },
            { x: (Math.random() - 0.5) * 400 - 800, z: -800 }
        ];
        
        const pickupPos = roadPositions[Math.floor(Math.random() * roadPositions.length)];
        
        // Find a different road position for destination
        let destinationPos;
        do {
            destinationPos = roadPositions[Math.floor(Math.random() * roadPositions.length)];
        } while (Math.abs(pickupPos.x - destinationPos.x) < 50 && Math.abs(pickupPos.z - destinationPos.z) < 50);
        
        // Create passenger visual
        const passengerGroup = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.75;
        passengerGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.25);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAC });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.75;
        passengerGroup.add(head);
        
        // Pickup indicator (yellow cylinder)
        const indicatorGeometry = new THREE.CylinderGeometry(1, 1, 0.1);
        const indicatorMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00, transparent: true, opacity: 0.7 });
        const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        indicator.position.y = 0.05;
        passengerGroup.add(indicator);
        
        passengerGroup.position.set(pickupPos.x, 0, pickupPos.z);
        this.scene.add(passengerGroup);
        
        // Create destination marker
        const destGroup = new THREE.Group();
        const destGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.1);
        const destMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF00, transparent: true, opacity: 0.7 });
        const destMarker = new THREE.Mesh(destGeometry, destMaterial);
        destMarker.position.y = 0.05;
        destGroup.add(destMarker);
        
        // Destination flag
        const flagGeometry = new THREE.BoxGeometry(0.1, 2, 1);
        const flagMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF00 });
        const flag = new THREE.Mesh(flagGeometry, flagMaterial);
        flag.position.y = 1;
        destGroup.add(flag);
        
        destGroup.position.set(destinationPos.x, 0, destinationPos.z);
        destGroup.visible = false; // Hide until passenger is picked up
        this.scene.add(destGroup);
        
        const passenger = {
            id: Date.now() + Math.random(),
            name: this.generatePassengerName(),
            pickup: new THREE.Vector3(pickupPos.x, 0, pickupPos.z),
            destination: new THREE.Vector3(destinationPos.x, 0, destinationPos.z),
            visual: passengerGroup,
            destinationMarker: destGroup,
            fare: Math.floor(pickupPos.x !== 0 ? Math.abs(pickupPos.x - destinationPos.x) * 0.1 + 10 : Math.abs(pickupPos.z - destinationPos.z) * 0.1 + 10),
            pickedUp: false
        };
        
        this.availablePassengers.push(passenger);
    }
    
    generatePassengerName() {
        const names = ['Alex', 'Sam', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage'];
        return names[Math.floor(Math.random() * names.length)];
    }
    
    createAICars() {
        // Reduce AI cars for better performance
        for (let i = 0; i < 5; i++) {
            this.spawnAICar();
        }
    }
    
    spawnAICar() {
        // Random road positions for AI cars
        const roadPositions = [
            { x: 0, z: (Math.random() - 0.5) * 800 }, // Main road
            { x: (Math.random() - 0.5) * 800, z: 0 }, // Cross road
            { x: -400, z: (Math.random() - 0.5) * 600 }, // Left parallel road
            { x: 400, z: (Math.random() - 0.5) * 600 }, // Right parallel road
            { x: (Math.random() - 0.5) * 600, z: -400 }, // Bottom parallel road
            { x: (Math.random() - 0.5) * 600, z: 400 }  // Top parallel road
        ];
        
        const startPos = roadPositions[Math.floor(Math.random() * roadPositions.length)];
        const color = this.aiCarColors[Math.floor(Math.random() * this.aiCarColors.length)];
        
        const aiCar = this.createAICarModel(color);
        aiCar.position.set(startPos.x, 0.4, startPos.z);
        this.scene.add(aiCar);
        
        // AI car data
        const aiCarData = {
            model: aiCar,
            position: new THREE.Vector3(startPos.x, 0.4, startPos.z),
            rotation: Math.random() * Math.PI * 2,
            speed: 0,
            maxSpeed: 15 + Math.random() * 10, // Random max speed
            targetPosition: null,
            lastDirectionChange: 0,
            stuckCounter: 0,
            wheels: []
        };
        
        // Store wheel references for animation
        aiCar.traverse((child) => {
            if (child.userData && child.userData.isWheel) {
                aiCarData.wheels.push(child);
            }
        });
        
        this.aiCars.push(aiCarData);
    }
    
    createAICarModel(color) {
        const car = new THREE.Group();
        
        // Car body (main chassis)
        const bodyGeometry = new THREE.BoxGeometry(2.2, 0.6, 4.5);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: color });
        const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        carBody.position.y = 0.5;
        carBody.castShadow = true;
        car.add(carBody);
        
        // Car hood (front section)
        const hoodGeometry = new THREE.BoxGeometry(2, 0.3, 1.2);
        const hoodColor = new THREE.Color(color).multiplyScalar(0.8); // Darker shade
        const hoodMaterial = new THREE.MeshLambertMaterial({ color: hoodColor });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.set(0, 0.65, 1.8);
        hood.castShadow = true;
        car.add(hood);
        
        // Car roof/cabin
        const roofGeometry = new THREE.BoxGeometry(1.8, 0.8, 2.2);
        const roofColor = new THREE.Color(color).multiplyScalar(0.9); // Slightly darker
        const roofMaterial = new THREE.MeshLambertMaterial({ color: roofColor });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 1.2;
        roof.position.z = -0.2;
        roof.castShadow = true;
        car.add(roof);
        
        // Windows
        const windshieldGeometry = new THREE.BoxGeometry(1.6, 0.6, 0.1);
        const windshieldMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x87CEEB, 
            transparent: true, 
            opacity: 0.7 
        });
        
        // Windshield
        const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
        windshield.position.set(0, 1.2, 0.9);
        car.add(windshield);
        
        // Rear window
        const rearWindow = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
        rearWindow.position.set(0, 1.2, -1.3);
        car.add(rearWindow);
        
        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.4);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const rimGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.42);
        const rimMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        
        const wheelPositions = [
            { x: -1.3, z: 1.5 },  // Front left
            { x: 1.3, z: 1.5 },   // Front right
            { x: -1.3, z: -1.5 }, // Rear left
            { x: 1.3, z: -1.5 }   // Rear right
        ];
        
        wheelPositions.forEach((pos) => {
            // Wheel tire
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, 0.45, pos.z);
            wheel.castShadow = true;
            wheel.userData = { isWheel: true };
            car.add(wheel);
            
            // Wheel rim
            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            rim.rotation.z = Math.PI / 2;
            rim.position.set(pos.x, 0.45, pos.z);
            rim.castShadow = true;
            car.add(rim);
        });
        
        // Headlights
        const headlightGeometry = new THREE.SphereGeometry(0.2);
        const headlightMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFDD,
            emissive: 0x222211
        });
        
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-0.8, 0.7, 2.3);
        car.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(0.8, 0.7, 2.3);
        car.add(rightHeadlight);
        
        // Taillights
        const taillightGeometry = new THREE.SphereGeometry(0.15);
        const taillightMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFF0000,
            emissive: 0x110000
        });
        
        const leftTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        leftTaillight.position.set(-0.8, 0.6, -2.3);
        car.add(leftTaillight);
        
        const rightTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        rightTaillight.position.set(0.8, 0.6, -2.3);
        car.add(rightTaillight);
        
        return car;
    }
    
    createStreetLights() {
        // Create street lights at intersections and along roads (reduced number)
        const lightPositions = [
            // Main intersection only
            { x: -8, z: -8 }, { x: 8, z: -8 }, { x: -8, z: 8 }, { x: 8, z: 8 },
            
            // Key intersections only (reduced from many to few)
            { x: -400, z: 0 }, { x: 400, z: 0 }, { x: 0, z: -400 }, { x: 0, z: 400 }
        ];
        
        lightPositions.forEach((pos, index) => {
            const streetLight = new THREE.Group();
            
            // Light pole
            const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8);
            const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
            const pole = new THREE.Mesh(poleGeometry, poleMaterial);
            pole.position.y = 4;
            pole.castShadow = true;
            streetLight.add(pole);
            
            // Light fixture
            const fixtureGeometry = new THREE.SphereGeometry(0.5);
            const fixtureMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xFFFFAA,
                emissive: 0x222200
            });
            const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
            fixture.position.y = 8;
            streetLight.add(fixture);
            
            // Point light for illumination - only first 4 cast shadows
            const pointLight = new THREE.PointLight(0xFFFFAA, 0, 30);
            pointLight.position.y = 8;
            
            // Only allow shadows on the first 4 lights to stay under texture limit
            if (index < 4) {
                pointLight.castShadow = true;
                pointLight.shadow.mapSize.width = 512; // Reduced shadow resolution
                pointLight.shadow.mapSize.height = 512;
                pointLight.shadow.camera.near = 1;
                pointLight.shadow.camera.far = 25;
            }
            
            streetLight.add(pointLight);
            
            streetLight.position.set(pos.x, 0, pos.z);
            this.scene.add(streetLight);
            
            this.streetLights.push({
                group: streetLight,
                light: pointLight,
                fixture: fixture
            });
        });
    }
    
    createRainSystem() {
        // Rain particle system - reduced particles for performance
        const rainGeometry = new THREE.BufferGeometry();
        const rainCount = 300; // Reduced from 1000
        const positions = new Float32Array(rainCount * 3);
        const velocities = new Float32Array(rainCount * 3);
        
        for (let i = 0; i < rainCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 500;     // x - reduced area
            positions[i * 3 + 1] = Math.random() * 200 + 50;     // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 500; // z - reduced area
            
            velocities[i * 3] = (Math.random() - 0.5) * 2;       // x velocity
            velocities[i * 3 + 1] = -Math.random() * 10 - 5;     // y velocity (downward)
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 2;   // z velocity
        }
        
        rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        rainGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const rainMaterial = new THREE.PointsMaterial({
            color: 0x87CEEB,
            size: 0.5,
            transparent: true,
            opacity: 0.6
        });
        
        this.rainSystem = new THREE.Points(rainGeometry, rainMaterial);
        this.rainSystem.visible = false;
        this.scene.add(this.rainSystem);
    }
    
    createWorldLocations() {
        // Create restaurants
        const restaurantPositions = [
            { x: 100, z: 100, name: "City Diner" },
            { x: -150, z: 150, name: "Pizza Palace" },
            { x: 200, z: -100, name: "Burger Joint" },
            { x: -200, z: -200, name: "Sushi Bar" },
            { x: 800, z: 800, name: "Village Cafe" },
            { x: -800, z: 800, name: "Hillside Restaurant" }
        ];
        
        restaurantPositions.forEach(pos => {
            this.createRestaurant(pos.x, pos.z, pos.name);
        });
        
        // Create gas stations
        const gasStationPositions = [
            { x: -100, z: -100, name: "City Gas" },
            { x: 300, z: 300, name: "Quick Fuel" },
            { x: -400, z: 400, name: "North Station" },
            { x: 800, z: -800, name: "Village Fuel" }
        ];
        
        gasStationPositions.forEach(pos => {
            this.createGasStation(pos.x, pos.z, pos.name);
        });
        
        // Create player home
        this.createPlayerHome(50, 50);
    }
    
    createRestaurant(x, z, name) {
        const restaurant = new THREE.Group();
        
        // Building
        const buildingGeometry = new THREE.BoxGeometry(10, 6, 8);
        const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B6B });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = 3;
        building.castShadow = true;
        restaurant.add(building);
        
        // Sign
        const signGeometry = new THREE.BoxGeometry(8, 2, 0.5);
        const signMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 7, 4.5);
        restaurant.add(sign);
        
        // Marker (floating icon)
        const markerGeometry = new THREE.ConeGeometry(1, 2, 4);
        const markerMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFF6B6B,
            emissive: 0x442222
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.y = 10;
        marker.rotation.x = Math.PI;
        restaurant.add(marker);
        
        restaurant.position.set(x, 0, z);
        this.scene.add(restaurant);
        
        this.worldLocations.restaurants.push({
            position: new THREE.Vector3(x, 0, z),
            name: name,
            marker: marker,
            interactionRadius: 8
        });
    }
    
    createGasStation(x, z, name) {
        const gasStation = new THREE.Group();
        
        // Building
        const buildingGeometry = new THREE.BoxGeometry(12, 5, 10);
        const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0x4ECDC4 });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = 2.5;
        building.castShadow = true;
        gasStation.add(building);
        
        // Canopy
        const canopyGeometry = new THREE.BoxGeometry(15, 0.5, 12);
        const canopyMaterial = new THREE.MeshLambertMaterial({ color: 0x95E1D3 });
        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
        canopy.position.y = 6;
        gasStation.add(canopy);
        
        // Pump
        const pumpGeometry = new THREE.BoxGeometry(1, 2, 1);
        const pumpMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B6B });
        const pump = new THREE.Mesh(pumpGeometry, pumpMaterial);
        pump.position.set(3, 1, 0);
        gasStation.add(pump);
        
        // Marker
        const markerGeometry = new THREE.ConeGeometry(1, 2, 4);
        const markerMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4ECDC4,
            emissive: 0x224444
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.y = 10;
        marker.rotation.x = Math.PI;
        gasStation.add(marker);
        
        gasStation.position.set(x, 0, z);
        this.scene.add(gasStation);
        
        this.worldLocations.gasStations.push({
            position: new THREE.Vector3(x, 0, z),
            name: name,
            marker: marker,
            interactionRadius: 10
        });
    }
    
    createPlayerHome(x, z) {
        const home = new THREE.Group();
        
        // House
        const houseGeometry = new THREE.BoxGeometry(12, 8, 10);
        const houseMaterial = new THREE.MeshLambertMaterial({ color: 0xF38181 });
        const house = new THREE.Mesh(houseGeometry, houseMaterial);
        house.position.y = 4;
        house.castShadow = true;
        home.add(house);
        
        // Roof
        const roofGeometry = new THREE.ConeGeometry(8, 4, 4);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 10;
        roof.rotation.y = Math.PI / 4;
        home.add(roof);
        
        // Marker
        const markerGeometry = new THREE.ConeGeometry(1, 2, 4);
        const markerMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFD93D,
            emissive: 0x444422
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.y = 14;
        marker.rotation.x = Math.PI;
        home.add(marker);
        
        home.position.set(x, 0, z);
        this.scene.add(home);
        
        this.worldLocations.home = {
            position: new THREE.Vector3(x, 0, z),
            name: "Your Home",
            marker: marker,
            interactionRadius: 10
        };
    }
    
    createCar() {
        this.car = new THREE.Group();
        
        // Car body (main chassis)
        const bodyGeometry = new THREE.BoxGeometry(2.2, 0.6, 4.5);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
        this.carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.carBody.position.y = 0.5;
        this.carBody.castShadow = true;
        this.car.add(this.carBody);
        
        // Car hood (front section)
        const hoodGeometry = new THREE.BoxGeometry(2, 0.3, 1.2);
        const hoodMaterial = new THREE.MeshLambertMaterial({ color: 0xDD0000 });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.set(0, 0.65, 1.8);
        hood.castShadow = true;
        this.car.add(hood);
        
        // Car roof/cabin
        const roofGeometry = new THREE.BoxGeometry(1.8, 0.8, 2.2);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xCC0000 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 1.2;
        roof.position.z = -0.2;
        roof.castShadow = true;
        this.car.add(roof);
        
        // Windshield
        const windshieldGeometry = new THREE.BoxGeometry(1.6, 0.6, 0.1);
        const windshieldMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x87CEEB, 
            transparent: true, 
            opacity: 0.7 
        });
        const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
        windshield.position.set(0, 1.2, 0.9);
        this.car.add(windshield);
        
        // Rear window
        const rearWindowGeometry = new THREE.BoxGeometry(1.6, 0.6, 0.1);
        const rearWindow = new THREE.Mesh(rearWindowGeometry, windshieldMaterial);
        rearWindow.position.set(0, 1.2, -1.3);
        this.car.add(rearWindow);
        
        // Side windows
        const sideWindowGeometry = new THREE.BoxGeometry(0.1, 0.6, 1.8);
        const leftWindow = new THREE.Mesh(sideWindowGeometry, windshieldMaterial);
        leftWindow.position.set(-0.85, 1.2, -0.2);
        this.car.add(leftWindow);
        
        const rightWindow = new THREE.Mesh(sideWindowGeometry, windshieldMaterial);
        rightWindow.position.set(0.85, 1.2, -0.2);
        this.car.add(rightWindow);
        
        // Wheels with rims
        const wheelGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.4);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        
        // Rim geometry
        const rimGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.42);
        const rimMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        
        const wheelPositions = [
            { x: -1.3, z: 1.5 },  // Front left
            { x: 1.3, z: 1.5 },   // Front right
            { x: -1.3, z: -1.5 }, // Rear left
            { x: 1.3, z: -1.5 }   // Rear right
        ];
        
        wheelPositions.forEach((pos, index) => {
            // Wheel tire
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, 0.45, pos.z);
            wheel.castShadow = true;
            this.wheels.push(wheel);
            this.car.add(wheel);
            
            // Wheel rim
            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            rim.rotation.z = Math.PI / 2;
            rim.position.set(pos.x, 0.45, pos.z);
            rim.castShadow = true;
            this.car.add(rim);
        });
        
        // Headlights (larger and more realistic)
        const headlightGeometry = new THREE.SphereGeometry(0.2);
        const headlightMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFDD,
            emissive: 0x444422
        });
        
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-0.8, 0.7, 2.3);
        this.car.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(0.8, 0.7, 2.3);
        this.car.add(rightHeadlight);
        
        // Taillights
        const taillightGeometry = new THREE.SphereGeometry(0.15);
        const taillightMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFF0000,
            emissive: 0x220000
        });
        
        const leftTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        leftTaillight.position.set(-0.8, 0.6, -2.3);
        this.car.add(leftTaillight);
        
        const rightTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        rightTaillight.position.set(0.8, 0.6, -2.3);
        this.car.add(rightTaillight);
        
        // Front grille
        const grilleGeometry = new THREE.BoxGeometry(1.5, 0.3, 0.1);
        const grilleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const grille = new THREE.Mesh(grilleGeometry, grilleMaterial);
        grille.position.set(0, 0.5, 2.35);
        this.car.add(grille);
        
        // Bumpers
        const bumperGeometry = new THREE.BoxGeometry(2.4, 0.2, 0.3);
        const bumperMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        
        const frontBumper = new THREE.Mesh(bumperGeometry, bumperMaterial);
        frontBumper.position.set(0, 0.3, 2.4);
        frontBumper.castShadow = true;
        this.car.add(frontBumper);
        
        const rearBumper = new THREE.Mesh(bumperGeometry, bumperMaterial);
        rearBumper.position.set(0, 0.3, -2.4);
        rearBumper.castShadow = true;
        this.car.add(rearBumper);
        
        // Position car
        this.car.position.copy(this.carPosition);
        this.scene.add(this.car);
        
        // Add headlight spotlights for actual illumination
        this.createCarHeadlights();
    }
    
    createCarHeadlights() {
        // Left headlight spotlight
        this.leftHeadlight = new THREE.SpotLight(0xFFFFDD, 2, 60, Math.PI / 4, 0.5);
        this.leftHeadlight.position.set(-0.8, 0.7, 2.5);
        this.leftHeadlight.castShadow = true;
        this.leftHeadlight.shadow.mapSize.width = 1024;
        this.leftHeadlight.shadow.mapSize.height = 1024;
        this.leftHeadlight.shadow.camera.near = 1;
        this.leftHeadlight.shadow.camera.far = 50;
        
        // Create target for left headlight
        this.leftHeadlightTarget = new THREE.Object3D();
        this.leftHeadlight.target = this.leftHeadlightTarget;
        
        this.car.add(this.leftHeadlight);
        this.scene.add(this.leftHeadlightTarget);
        
        // Right headlight spotlight
        this.rightHeadlight = new THREE.SpotLight(0xFFFFDD, 2, 60, Math.PI / 4, 0.5);
        this.rightHeadlight.position.set(0.8, 0.7, 2.5);
        this.rightHeadlight.castShadow = true;
        this.rightHeadlight.shadow.mapSize.width = 1024;
        this.rightHeadlight.shadow.mapSize.height = 1024;
        this.rightHeadlight.shadow.camera.near = 1;
        this.rightHeadlight.shadow.camera.far = 50;
        
        // Create target for right headlight
        this.rightHeadlightTarget = new THREE.Object3D();
        this.rightHeadlight.target = this.rightHeadlightTarget;
        
        this.car.add(this.rightHeadlight);
        this.scene.add(this.rightHeadlightTarget);
    }
    
    setupCamera() {
        // Third-person camera behind the car
        this.camera.position.set(0, 8, -12);
        this.camera.lookAt(0, 0, 0);
    }
    
    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.keys.forward = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.keys.backward = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.keys.left = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.keys.right = true;
                    break;
                case 'Space':
                    this.keys.brake = true;
                    event.preventDefault();
                    break;
                case 'KeyT':
                    this.toggleTaxiMode();
                    break;
                case 'KeyR':
                    this.toggleRain();
                    break;
                case 'KeyN':
                    this.toggleNight();
                    break;
                case 'KeyH':
                    this.toggleHeadlights();
                    break;
                case 'KeyG':
                    this.resetHeadlightsToAuto();
                    break;
                case 'KeyE':
                    this.eatAtRestaurant();
                    break;
                case 'KeyF':
                    this.refuelAtStation();
                    break;
                case 'KeyQ':
                    this.sleepAtHome();
                    break;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            switch(event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.keys.forward = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.keys.backward = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.keys.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.keys.right = false;
                    break;
                case 'Space':
                    this.keys.brake = false;
                    break;
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    checkCollision(newPosition) {
        const carRadius = 2; // Car collision radius
        
        for (let obj of this.collisionObjects) {
            const distance = newPosition.distanceTo(obj.position);
            
            if (obj.type === 'tree') {
                if (distance < (carRadius + obj.radius)) {
                    return true;
                }
            } else if (obj.type === 'building') {
                // Check if car is within building bounds
                const dx = Math.abs(newPosition.x - obj.position.x);
                const dz = Math.abs(newPosition.z - obj.position.z);
                
                if (dx < (carRadius + obj.width / 2) && dz < (carRadius + obj.depth / 2)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    updateCarPhysics() {
        // Handle input
        if (this.keys.forward) {
            this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
        }
        if (this.keys.backward) {
            this.speed = Math.max(this.speed - this.acceleration, -this.maxSpeed * 0.5);
        }
        
        // Steering (only when moving)
        if (Math.abs(this.speed) > 0.1) {
            if (this.keys.left) {
                this.carRotation += this.turnSpeed * Math.min(Math.abs(this.speed) / 10, 1);
            }
            if (this.keys.right) {
                this.carRotation -= this.turnSpeed * Math.min(Math.abs(this.speed) / 10, 1);
            }
        }
        
        // Handbrake
        if (this.keys.brake) {
            this.speed *= 0.9;
        }
        
        // Apply friction
        this.speed *= this.friction;
        
        // Update velocity based on car rotation
        this.velocity.x = Math.sin(this.carRotation) * this.speed * 0.1;
        this.velocity.z = Math.cos(this.carRotation) * this.speed * 0.1;
        
        // Calculate new position
        const newPosition = new THREE.Vector3();
        newPosition.copy(this.carPosition);
        newPosition.add(this.velocity);
        
        // Check for collisions before updating position
        if (!this.checkCollision(newPosition)) {
            this.carPosition.copy(newPosition);
        } else {
            // Stop the car if collision detected
            this.speed *= 0.1;
        }
        
        // Update car transform
        this.car.position.copy(this.carPosition);
        this.car.rotation.y = this.carRotation;
        
        // Update headlight targets to point forward
        if (this.leftHeadlight && this.rightHeadlight && this.leftHeadlightTarget && this.rightHeadlightTarget) {
            const forwardDistance = 25;
            
            // Calculate world positions for headlight targets
            const carWorldPosition = new THREE.Vector3();
            this.car.getWorldPosition(carWorldPosition);
            
            // Left headlight target
            const leftTargetX = carWorldPosition.x + Math.sin(this.carRotation) * forwardDistance - Math.cos(this.carRotation) * 2;
            const leftTargetZ = carWorldPosition.z + Math.cos(this.carRotation) * forwardDistance + Math.sin(this.carRotation) * 2;
            this.leftHeadlightTarget.position.set(leftTargetX, 0, leftTargetZ);
            
            // Right headlight target
            const rightTargetX = carWorldPosition.x + Math.sin(this.carRotation) * forwardDistance + Math.cos(this.carRotation) * 2;
            const rightTargetZ = carWorldPosition.z + Math.cos(this.carRotation) * forwardDistance - Math.sin(this.carRotation) * 2;
            this.rightHeadlightTarget.position.set(rightTargetX, 0, rightTargetZ);
        }
        
        // Animate wheels
        const wheelRotation = this.speed * 0.05;
        this.wheels.forEach(wheel => {
            wheel.rotation.x += wheelRotation;
        });
        
        // Update speedometer
        const speedKmh = Math.abs(this.speed * 3.6).toFixed(0);
        document.getElementById('speedometer').textContent = speedKmh;
    }
    
    toggleTaxiMode() {
        this.taxiMode.active = !this.taxiMode.active;
        this.updateTaxiUI();
    }
    
    toggleRain() {
        this.weather.isRaining = !this.weather.isRaining;
        this.rainSystem.visible = this.weather.isRaining;
        
        if (this.weather.isRaining) {
            this.weather.rainIntensity = 0.7;
        } else {
            this.weather.rainIntensity = 0;
        }
    }
    
    toggleNight() {
        this.timeOfDay = this.timeOfDay > 0.5 ? 0.25 : 0.75; // Toggle between day and night
    }
    
    toggleHeadlights() {
        // Check if headlights exist
        if (!this.leftHeadlight || !this.rightHeadlight) {
            console.log("Headlights not initialized yet");
            return;
        }
        
        // Toggle manual override
        if (!this.headlightsManualOverride) {
            // First press - enable manual control
            this.headlightsManualOverride = true;
            this.headlightsManualState = this.leftHeadlight.intensity === 0; // Toggle current state
        } else {
            // Subsequent presses - toggle manual state
            this.headlightsManualState = !this.headlightsManualState;
        }
        
        // Apply the manual state immediately
        this.leftHeadlight.intensity = this.headlightsManualState ? 2 : 0;
        this.rightHeadlight.intensity = this.headlightsManualState ? 2 : 0;
        
        console.log(`Headlights ${this.headlightsManualState ? 'ON' : 'OFF'} (Manual Override) - Intensity: ${this.headlightsManualState ? 2 : 0}`);
        
        // Update headlight bulb glow
        this.car.traverse((child) => {
            if (child.material && child.material.emissive) {
                if (child.position.z > 2) { // Headlight bulbs
                    child.material.emissive.setHex(this.headlightsManualState ? 0x444422 : 0x000000);
                }
            }
        });
    }
    
    resetHeadlightsToAuto() {
        this.headlightsManualOverride = false;
        this.headlightsManualState = false;
        console.log("Headlights reset to automatic mode");
    }
    
    updateTaxiMode() {
        if (!this.taxiMode.active) return;
        
        // Check for passenger pickup
        if (!this.taxiMode.passenger) {
            for (let passenger of this.availablePassengers) {
                if (!passenger.pickedUp) {
                    const distance = this.carPosition.distanceTo(passenger.pickup);
                    if (distance < this.taxiMode.pickupRadius) {
                        this.pickupPassenger(passenger);
                        break;
                    }
                }
            }
        } else {
            // Check for passenger dropoff
            const distance = this.carPosition.distanceTo(this.taxiMode.destination);
            if (distance < this.taxiMode.dropoffRadius) {
                this.dropoffPassenger();
            }
        }
        
        this.updateTaxiUI();
    }
    
    pickupPassenger(passenger) {
        this.taxiMode.passenger = passenger;
        this.taxiMode.pickupLocation = passenger.pickup.clone();
        this.taxiMode.destination = passenger.destination.clone();
        this.taxiMode.fare = passenger.fare;
        
        passenger.pickedUp = true;
        passenger.visual.visible = false;
        passenger.destinationMarker.visible = true;
        
        console.log(`Picked up ${passenger.name}! Drive to destination for $${passenger.fare}`);
    }
    
    dropoffPassenger() {
        if (!this.taxiMode.passenger) return;
        
        const passenger = this.taxiMode.passenger;
        const fare = this.taxiMode.fare;
        
        // Add mood bonus to fare
        const moodBonus = this.lifeMode.mood > 80 ? Math.floor(fare * 0.2) : 0;
        const totalFare = fare + moodBonus;
        
        this.taxiMode.totalEarnings += totalFare;
        this.lifeMode.money += totalFare;
        this.dailyGoals.moneyEarned += totalFare;
        this.dailyGoals.tripsCompleted++;
        
        console.log(`Dropped off ${passenger.name}! Earned $${totalFare}${moodBonus > 0 ? ` (Bonus: $${moodBonus})` : ''}`);
        
        // Remove passenger and destination marker
        this.scene.remove(passenger.visual);
        this.scene.remove(passenger.destinationMarker);
        
        // Remove from available passengers
        this.availablePassengers = this.availablePassengers.filter(p => p.id !== passenger.id);
        
        // Reset taxi mode
        this.taxiMode.passenger = null;
        this.taxiMode.pickupLocation = null;
        this.taxiMode.destination = null;
        this.taxiMode.fare = 0;
        
        // Spawn new passenger
        this.spawnNewPassenger();
    }
    
    eatAtRestaurant() {
        const carPos = this.carPosition;
        
        for (let restaurant of this.worldLocations.restaurants) {
            const distance = carPos.distanceTo(restaurant.position);
            if (distance < restaurant.interactionRadius && Math.abs(this.speed) < 1) {
                if (this.lifeMode.money >= 15) {
                    this.lifeMode.money -= 15;
                    this.lifeMode.hunger = Math.min(100, this.lifeMode.hunger + 40);
                    this.lifeMode.energy = Math.min(100, this.lifeMode.energy + 10);
                    this.lifeMode.mood = Math.min(100, this.lifeMode.mood + 15);
                    console.log(`Ate at ${restaurant.name}! Hunger restored.`);
                } else {
                    console.log("Not enough money to eat!");
                }
                return;
            }
        }
    }
    
    refuelAtStation() {
        const carPos = this.carPosition;
        
        for (let station of this.worldLocations.gasStations) {
            const distance = carPos.distanceTo(station.position);
            if (distance < station.interactionRadius && Math.abs(this.speed) < 1) {
                if (this.lifeMode.money >= 20) {
                    this.lifeMode.money -= 20;
                    this.lifeMode.fuel = 100;
                    console.log(`Refueled at ${station.name}!`);
                } else {
                    console.log("Not enough money to refuel!");
                }
                return;
            }
        }
    }
    
    sleepAtHome() {
        if (!this.worldLocations.home) return;
        
        const carPos = this.carPosition;
        const distance = carPos.distanceTo(this.worldLocations.home.position);
        
        if (distance < this.worldLocations.home.interactionRadius && Math.abs(this.speed) < 1) {
            this.lifeMode.energy = 100;
            this.lifeMode.mood = Math.min(100, this.lifeMode.mood + 20);
            
            // Advance time to next morning
            this.gameTime.hour = 8;
            this.gameTime.minute = 0;
            
            console.log("Slept at home! Energy restored. Good morning!");
        }
    }
    
    updateTaxiUI() {
        const taxiInfo = document.getElementById('taxiInfo');
        if (!taxiInfo) return;
        
        if (this.taxiMode.active) {
            if (this.taxiMode.passenger) {
                const distance = this.carPosition.distanceTo(this.taxiMode.destination);
                taxiInfo.innerHTML = `
                    <div>TAXI MODE: ON</div>
                    <div>Passenger: ${this.taxiMode.passenger.name}</div>
                    <div>Fare: $${this.taxiMode.fare}</div>
                    <div>Distance to destination: ${distance.toFixed(0)}m</div>
                    <div>Total Earnings: $${this.taxiMode.totalEarnings}</div>
                `;
            } else {
                const nearestPassenger = this.findNearestPassenger();
                const distance = nearestPassenger ? this.carPosition.distanceTo(nearestPassenger.pickup) : 0;
                taxiInfo.innerHTML = `
                    <div>TAXI MODE: ON</div>
                    <div>Looking for passengers...</div>
                    <div>Nearest passenger: ${distance.toFixed(0)}m away</div>
                    <div>Total Earnings: $${this.taxiMode.totalEarnings}</div>
                `;
            }
        } else {
            taxiInfo.innerHTML = `
                <div>TAXI MODE: OFF</div>
                <div>Press T to start taxi mode</div>
                <div>Total Earnings: $${this.taxiMode.totalEarnings}</div>
            `;
        }
    }
    
    findNearestPassenger() {
        let nearest = null;
        let minDistance = Infinity;
        
        for (let passenger of this.availablePassengers) {
            if (!passenger.pickedUp) {
                const distance = this.carPosition.distanceTo(passenger.pickup);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = passenger;
                }
            }
        }
        
        return nearest;
    }
    
    updateLifeMode() {
        if (!this.lifeMode.enabled) return;
        
        // Decrease stats over time
        this.lifeMode.energy -= 0.01; // Energy decreases while driving
        this.lifeMode.hunger -= 0.008; // Hunger decreases slowly
        this.lifeMode.fuel -= Math.abs(this.speed) * 0.002; // Fuel based on speed
        
        // Mood affected by other stats
        if (this.lifeMode.hunger < 30 || this.lifeMode.energy < 30) {
            this.lifeMode.mood -= 0.01;
        } else if (this.lifeMode.hunger > 70 && this.lifeMode.energy > 70) {
            this.lifeMode.mood = Math.min(100, this.lifeMode.mood + 0.005);
        }
        
        // Clamp values
        this.lifeMode.energy = Math.max(0, Math.min(100, this.lifeMode.energy));
        this.lifeMode.hunger = Math.max(0, Math.min(100, this.lifeMode.hunger));
        this.lifeMode.fuel = Math.max(0, Math.min(100, this.lifeMode.fuel));
        this.lifeMode.mood = Math.max(0, Math.min(100, this.lifeMode.mood));
        
        // Check for low fuel
        if (this.lifeMode.fuel < 10) {
            this.maxSpeed = 20; // Reduced speed when low on fuel
        } else {
            this.maxSpeed = 50; // Normal speed
        }
        
        // Check interactions with world locations
        this.checkLocationInteractions();
        
        // Update UI
        this.updateLifeModeUI();
    }
    
    updateGameTime() {
        // Update game time
        this.gameTime.minute += this.gameTime.timeSpeed;
        
        if (this.gameTime.minute >= 60) {
            this.gameTime.minute = 0;
            this.gameTime.hour++;
            
            if (this.gameTime.hour >= 24) {
                this.gameTime.hour = 0;
                this.gameTime.dayCount++;
                this.resetDailyGoals();
            }
        }
    }
    
    resetDailyGoals() {
        this.dailyGoals.moneyEarned = 0;
        this.dailyGoals.tripsCompleted = 0;
        console.log(`Day ${this.gameTime.dayCount} started! New goals: Earn $${this.dailyGoals.moneyTarget}, Complete ${this.dailyGoals.tripsTarget} trips`);
    }
    
    checkLocationInteractions() {
        const carPos = this.carPosition;
        let nearAnyLocation = false;
        
        // Check restaurants
        this.worldLocations.restaurants.forEach(restaurant => {
            const distance = carPos.distanceTo(restaurant.position);
            if (distance < restaurant.interactionRadius && Math.abs(this.speed) < 1) {
                this.showInteractionPrompt(restaurant.name, 'E to Eat ($15)');
                nearAnyLocation = true;
            }
        });
        
        // Check gas stations (only if not already near restaurant)
        if (!nearAnyLocation) {
            this.worldLocations.gasStations.forEach(station => {
                const distance = carPos.distanceTo(station.position);
                if (distance < station.interactionRadius && Math.abs(this.speed) < 1) {
                    this.showInteractionPrompt(station.name, 'F to Refuel ($20)');
                    nearAnyLocation = true;
                }
            });
        }
        
        // Check home (only if not already near other locations)
        if (!nearAnyLocation && this.worldLocations.home) {
            const distance = carPos.distanceTo(this.worldLocations.home.position);
            if (distance < this.worldLocations.home.interactionRadius && Math.abs(this.speed) < 1) {
                this.showInteractionPrompt(this.worldLocations.home.name, 'Q to Sleep');
                nearAnyLocation = true;
            }
        }
        
        // Hide prompt if not near any location
        if (!nearAnyLocation) {
            this.hideInteractionPrompt();
        }
    }
    
    showInteractionPrompt(locationName, action) {
        // This will be shown in the UI
        const promptElement = document.getElementById('interactionPrompt');
        if (promptElement) {
            promptElement.innerHTML = `<div style="background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px;">
                <strong>${locationName}</strong><br>${action}
            </div>`;
            promptElement.style.display = 'block';
        }
    }
    
    hideInteractionPrompt() {
        const promptElement = document.getElementById('interactionPrompt');
        if (promptElement) {
            promptElement.style.display = 'none';
        }
    }
    
    updateLifeModeUI() {
        const lifeModeInfo = document.getElementById('lifeModeInfo');
        if (!lifeModeInfo) return;
        
        const timeString = `${String(Math.floor(this.gameTime.hour)).padStart(2, '0')}:${String(Math.floor(this.gameTime.minute)).padStart(2, '0')}`;
        const dayPeriod = this.gameTime.hour < 12 ? 'AM' : 'PM';
        
        lifeModeInfo.innerHTML = `
            <div style="background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px;">
                <div><strong>Day ${this.gameTime.dayCount}</strong> | ${timeString} ${dayPeriod}</div>
                <div>💰 Money: $${Math.floor(this.lifeMode.money)}</div>
                <div>⚡ Energy: ${Math.floor(this.lifeMode.energy)}%</div>
                <div>🍔 Hunger: ${Math.floor(this.lifeMode.hunger)}%</div>
                <div>⛽ Fuel: ${Math.floor(this.lifeMode.fuel)}%</div>
                <div>😊 Mood: ${Math.floor(this.lifeMode.mood)}%</div>
                <hr style="margin: 5px 0;">
                <div><strong>Daily Goals:</strong></div>
                <div>💵 ${this.dailyGoals.moneyEarned}/${this.dailyGoals.moneyTarget}</div>
                <div>🚕 ${this.dailyGoals.tripsCompleted}/${this.dailyGoals.tripsTarget}</div>
            </div>
        `;
    }
    
    updateAICars() {
        const currentTime = Date.now();
        
        for (let aiCar of this.aiCars) {
            // Choose new target if needed
            if (!aiCar.targetPosition || 
                aiCar.position.distanceTo(aiCar.targetPosition) < 30 ||
                currentTime - aiCar.lastDirectionChange > 8000 + Math.random() * 12000) {
                
                aiCar.targetPosition = this.getNextRoadTarget(aiCar.position);
                aiCar.lastDirectionChange = currentTime;
                aiCar.stuckCounter = 0;
            }
            
            // Calculate direction to target
            const direction = new THREE.Vector3();
            direction.subVectors(aiCar.targetPosition, aiCar.position);
            direction.normalize();
            
            // Update rotation to face target
            const targetRotation = Math.atan2(direction.x, direction.z);
            let rotationDiff = targetRotation - aiCar.rotation;
            
            // Normalize rotation difference
            while (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI;
            while (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI;
            
            // Smooth rotation (slower for more realistic turning)
            aiCar.rotation += rotationDiff * 0.03;
            
            // Update speed
            aiCar.speed = Math.min(aiCar.speed + 0.15, aiCar.maxSpeed);
            
            // Calculate new position along current road
            const velocity = new THREE.Vector3(
                Math.sin(aiCar.rotation) * aiCar.speed * 0.04,
                0,
                Math.cos(aiCar.rotation) * aiCar.speed * 0.04
            );
            
            const newPosition = new THREE.Vector3();
            newPosition.copy(aiCar.position);
            newPosition.add(velocity);
            
            // Keep car on road
            const correctedPosition = this.keepCarOnRoad(newPosition);
            
            // Simple collision avoidance with player car
            const distanceToPlayer = correctedPosition.distanceTo(this.carPosition);
            if (distanceToPlayer < 8) {
                // Slow down and try to avoid
                aiCar.speed *= 0.3;
            } else if (!this.checkAICarCollision(correctedPosition)) {
                aiCar.position.copy(correctedPosition);
                aiCar.stuckCounter = 0;
            } else {
                // If stuck, try a new direction
                aiCar.stuckCounter++;
                if (aiCar.stuckCounter > 20) {
                    aiCar.targetPosition = this.getNextRoadTarget(aiCar.position);
                    aiCar.stuckCounter = 0;
                }
            }
            
            // Update model position and rotation
            aiCar.model.position.copy(aiCar.position);
            aiCar.model.rotation.y = aiCar.rotation;
            
            // Animate wheels
            const wheelRotation = aiCar.speed * 0.03;
            aiCar.wheels.forEach(wheel => {
                wheel.rotation.x += wheelRotation;
            });
        }
    }
    
    keepCarOnRoad(position) {
        const correctedPos = position.clone();
        
        // Check if on main north-south road (x = 0, width = 12)
        if (Math.abs(position.x) < 6) {
            correctedPos.x = Math.max(-5, Math.min(5, position.x));
            return correctedPos;
        }
        
        // Check if on main east-west road (z = 0, width = 12)
        if (Math.abs(position.z) < 6) {
            correctedPos.z = Math.max(-5, Math.min(5, position.z));
            return correctedPos;
        }
        
        // Check parallel north-south roads
        for (let roadX = -400; roadX <= 400; roadX += 200) {
            if (roadX !== 0 && Math.abs(position.x - roadX) < 4) {
                correctedPos.x = roadX + Math.max(-3, Math.min(3, position.x - roadX));
                return correctedPos;
            }
        }
        
        // Check parallel east-west roads
        for (let roadZ = -400; roadZ <= 400; roadZ += 200) {
            if (roadZ !== 0 && Math.abs(position.z - roadZ) < 4) {
                correctedPos.z = roadZ + Math.max(-3, Math.min(3, position.z - roadZ));
                return correctedPos;
            }
        }
        
        // If not on any road, move to nearest road
        return this.moveToNearestRoad(position);
    }
    
    moveToNearestRoad(position) {
        let nearestRoad = null;
        let minDistance = Infinity;
        
        // Check all roads and find the nearest one
        const roads = [
            { x: 0, z: position.z, type: 'main-ns' }, // Main north-south
            { x: position.x, z: 0, type: 'main-ew' }, // Main east-west
        ];
        
        // Add parallel roads
        for (let roadX = -400; roadX <= 400; roadX += 200) {
            if (roadX !== 0) {
                roads.push({ x: roadX, z: position.z, type: 'parallel-ns' });
            }
        }
        
        for (let roadZ = -400; roadZ <= 400; roadZ += 200) {
            if (roadZ !== 0) {
                roads.push({ x: position.x, z: roadZ, type: 'parallel-ew' });
            }
        }
        
        // Find nearest road
        for (let road of roads) {
            const distance = Math.sqrt((position.x - road.x) ** 2 + (position.z - road.z) ** 2);
            if (distance < minDistance) {
                minDistance = distance;
                nearestRoad = road;
            }
        }
        
        if (nearestRoad) {
            return new THREE.Vector3(nearestRoad.x, position.y, nearestRoad.z);
        }
        
        return position;
    }
    
    getNextRoadTarget(currentPosition) {
        // Determine which road the car is currently on
        const currentRoad = this.getCurrentRoad(currentPosition);
        
        if (currentRoad.type === 'main-ns' || currentRoad.type === 'parallel-ns') {
            // On north-south road, choose target along same road or at intersection
            const targets = [
                new THREE.Vector3(currentRoad.x, 0.4, currentPosition.z + (Math.random() > 0.5 ? 200 : -200)),
                new THREE.Vector3(currentRoad.x, 0.4, 0), // Go to main intersection
            ];
            
            // Add intersections with east-west roads
            for (let roadZ = -400; roadZ <= 400; roadZ += 200) {
                targets.push(new THREE.Vector3(currentRoad.x, 0.4, roadZ));
            }
            
            return targets[Math.floor(Math.random() * targets.length)];
        } else {
            // On east-west road, choose target along same road or at intersection
            const targets = [
                new THREE.Vector3(currentPosition.x + (Math.random() > 0.5 ? 200 : -200), 0.4, currentRoad.z),
                new THREE.Vector3(0, 0.4, currentRoad.z), // Go to main intersection
            ];
            
            // Add intersections with north-south roads
            for (let roadX = -400; roadX <= 400; roadX += 200) {
                targets.push(new THREE.Vector3(roadX, 0.4, currentRoad.z));
            }
            
            return targets[Math.floor(Math.random() * targets.length)];
        }
    }
    
    getCurrentRoad(position) {
        // Check if on main north-south road
        if (Math.abs(position.x) < 6) {
            return { x: 0, z: position.z, type: 'main-ns' };
        }
        
        // Check if on main east-west road
        if (Math.abs(position.z) < 6) {
            return { x: position.x, z: 0, type: 'main-ew' };
        }
        
        // Check parallel north-south roads
        for (let roadX = -400; roadX <= 400; roadX += 200) {
            if (roadX !== 0 && Math.abs(position.x - roadX) < 4) {
                return { x: roadX, z: position.z, type: 'parallel-ns' };
            }
        }
        
        // Check parallel east-west roads
        for (let roadZ = -400; roadZ <= 400; roadZ += 200) {
            if (roadZ !== 0 && Math.abs(position.z - roadZ) < 4) {
                return { x: position.x, z: roadZ, type: 'parallel-ew' };
            }
        }
        
        // Default to main intersection
        return { x: 0, z: 0, type: 'main-ns' };
    }
    
    updateTimeAndWeather() {
        // Update time of day (complete cycle in 10 minutes instead of 2 minutes)
        this.timeOfDay += 0.00006;
        if (this.timeOfDay > 1) this.timeOfDay = 0;
        
        // Calculate sun position
        const sunAngle = this.timeOfDay * Math.PI * 2;
        const sunHeight = Math.sin(sunAngle) * 300;
        const sunX = Math.cos(sunAngle) * 400;
        
        this.directionalLight.position.set(sunX, Math.max(sunHeight, 50), 200);
        
        // Update lighting based on time of day
        const isNight = sunHeight < 0;
        const lightIntensity = isNight ? 0.2 : Math.max(0.8, 0.8 + (sunHeight / 300) * 0.7);
        
        this.directionalLight.intensity = lightIntensity;
        
        // Update sky color
        let skyColor;
        if (isNight) {
            skyColor = 0x001122; // Dark blue night
        } else if (sunHeight < 50) {
            // Sunrise/sunset
            skyColor = 0xFF6B35; // Orange
        } else {
            skyColor = 0x87CEEB; // Day blue
        }
        
        this.renderer.setClearColor(skyColor);
        
        // Update street lights
        this.streetLights.forEach(streetLight => {
            if (isNight) {
                streetLight.light.intensity = 1;
                streetLight.fixture.material.emissive.setHex(0x444400);
            } else {
                streetLight.light.intensity = 0;
                streetLight.fixture.material.emissive.setHex(0x000000);
            }
        });
        
        // Update car headlights
        if (this.leftHeadlight && this.rightHeadlight) {
            let shouldBeOn = false;
            
            if (this.headlightsManualOverride) {
                // Manual control is active
                shouldBeOn = this.headlightsManualState;
            } else {
                // Automatic control based on time of day
                shouldBeOn = isNight;
            }
            
            if (shouldBeOn) {
                this.leftHeadlight.intensity = 2;
                this.rightHeadlight.intensity = 2;
                
                this.car.traverse((child) => {
                    if (child.material && child.material.emissive) {
                        if (child.position.z > 2) { // Headlight bulbs
                            child.material.emissive.setHex(0x444422);
                        }
                    }
                });
            } else {
                this.leftHeadlight.intensity = 0;
                this.rightHeadlight.intensity = 0;
                
                this.car.traverse((child) => {
                    if (child.material && child.material.emissive) {
                        if (child.position.z > 2) { // Headlights
                            child.material.emissive.setHex(0x000000);
                        }
                    }
                });
            }
        }
        
        // Update AI car headlights (always automatic)
        this.aiCars.forEach(aiCar => {
            aiCar.model.traverse((child) => {
                if (child.material && child.material.emissive) {
                    if (child.position.z > 2) { // Headlights
                        child.material.emissive.setHex(isNight ? 0x222211 : 0x000000);
                    }
                }
            });
        });
        
        // Random weather changes
        if (Math.random() < 0.001) { // 0.1% chance per frame
            this.weather.isRaining = !this.weather.isRaining;
            this.rainSystem.visible = this.weather.isRaining;
            
            if (this.weather.isRaining) {
                this.weather.rainIntensity = 0.3 + Math.random() * 0.7;
            } else {
                this.weather.rainIntensity = 0;
            }
        }
    }
    
    updateRain() {
        if (!this.weather.isRaining || !this.rainSystem) return;
        
        const positions = this.rainSystem.geometry.attributes.position.array;
        const velocities = this.rainSystem.geometry.attributes.velocity.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Update positions
            positions[i] += velocities[i];     // x
            positions[i + 1] += velocities[i + 1]; // y
            positions[i + 2] += velocities[i + 2]; // z
            
            // Reset particles that hit the ground
            if (positions[i + 1] < 0) {
                positions[i] = (Math.random() - 0.5) * 1000;
                positions[i + 1] = Math.random() * 100 + 100;
                positions[i + 2] = (Math.random() - 0.5) * 1000;
            }
            
            // Keep particles within world bounds
            if (Math.abs(positions[i]) > 500) {
                positions[i] = (Math.random() - 0.5) * 1000;
            }
            if (Math.abs(positions[i + 2]) > 500) {
                positions[i + 2] = (Math.random() - 0.5) * 1000;
            }
        }
        
        this.rainSystem.geometry.attributes.position.needsUpdate = true;
        
        // Update rain material opacity based on intensity
        this.rainSystem.material.opacity = this.weather.rainIntensity * 0.8;
    }
    
    checkAICarCollision(position) {
        // Check collision with static objects (trees, buildings)
        for (let obj of this.collisionObjects) {
            const distance = position.distanceTo(obj.position);
            
            if (obj.type === 'tree') {
                if (distance < 4) { // Slightly larger radius for AI cars
                    return true;
                }
            } else if (obj.type === 'building') {
                const dx = Math.abs(position.x - obj.position.x);
                const dz = Math.abs(position.z - obj.position.z);
                
                if (dx < (3 + obj.width / 2) && dz < (3 + obj.depth / 2)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    setupMinimap() {
        this.minimap.canvas = document.getElementById('mapCanvas');
        this.minimap.ctx = this.minimap.canvas.getContext('2d');
    }
    
    updateMinimap() {
        const ctx = this.minimap.ctx;
        const canvas = this.minimap.canvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = '#2d5a27';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw roads
        this.drawMinimapRoads(ctx);
        
        // Draw world locations (restaurants, gas stations, home)
        this.drawMinimapLocations(ctx);
        
        // Draw passengers
        this.drawMinimapPassengers(ctx);
        
        // Draw AI cars
        this.drawMinimapAICars(ctx);
        
        // Draw destination if passenger is picked up
        if (this.taxiMode.passenger && this.taxiMode.destination) {
            this.drawMinimapDestination(ctx);
        }
        
        // Draw car (always on top)
        this.drawMinimapCar(ctx);
        
        // Draw compass
        this.drawMinimapCompass(ctx);
        
        // Draw legend
        this.drawMinimapLegend(ctx);
    }
    
    drawMinimapLegend(ctx) {
        // Draw compact legend background at bottom
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(2, 165, 60, 33);
        
        // Legend items - only show Life Mode locations
        const legendItems = [
            { color: '#FF6B6B', label: 'Food', y: 175 },
            { color: '#4ECDC4', label: 'Gas', y: 185 },
            { color: '#FFD93D', label: 'Home', y: 195 }
        ];
        
        ctx.font = '9px Arial';
        ctx.textAlign = 'left';
        legendItems.forEach(item => {
            // Draw color circle
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.arc(10, item.y - 3, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw label
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(item.label, 18, item.y);
        });
    }
    
    worldToMinimap(worldX, worldZ) {
        // Convert world coordinates to minimap coordinates
        const mapX = this.minimap.centerX + (worldX * this.minimap.scale);
        const mapY = this.minimap.centerY - (worldZ * this.minimap.scale); // Flip Z axis
        return { x: mapX, y: mapY };
    }
    
    drawMinimapRoads(ctx) {
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        
        // Main roads
        ctx.beginPath();
        // North-South main road
        let start = this.worldToMinimap(0, -500);
        let end = this.worldToMinimap(0, 500);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        
        // East-West main road
        start = this.worldToMinimap(-500, 0);
        end = this.worldToMinimap(500, 0);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        
        // Parallel roads
        ctx.lineWidth = 1;
        for (let roadX = -400; roadX <= 400; roadX += 200) {
            if (roadX !== 0) {
                ctx.beginPath();
                start = this.worldToMinimap(roadX, -400);
                end = this.worldToMinimap(roadX, 400);
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        }
        
        for (let roadZ = -400; roadZ <= 400; roadZ += 200) {
            if (roadZ !== 0) {
                ctx.beginPath();
                start = this.worldToMinimap(-400, roadZ);
                end = this.worldToMinimap(400, roadZ);
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        }
    }
    
    drawMinimapLocations(ctx) {
        // Draw restaurants (red fork/knife icon)
        this.worldLocations.restaurants.forEach(restaurant => {
            const pos = this.worldToMinimap(restaurant.position.x, restaurant.position.z);
            
            if (pos.x >= 0 && pos.x <= 200 && pos.y >= 0 && pos.y <= 200) {
                // Red circle for restaurant
                ctx.fillStyle = '#FF6B6B';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // White outline
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Draw "F" for Food
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 8px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('F', pos.x, pos.y + 3);
            }
        });
        
        // Draw gas stations (cyan pump icon)
        this.worldLocations.gasStations.forEach(station => {
            const pos = this.worldToMinimap(station.position.x, station.position.z);
            
            if (pos.x >= 0 && pos.x <= 200 && pos.y >= 0 && pos.y <= 200) {
                // Cyan circle for gas station
                ctx.fillStyle = '#4ECDC4';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // White outline
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Draw "G" for Gas
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 8px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('G', pos.x, pos.y + 3);
            }
        });
        
        // Draw home (yellow house icon)
        if (this.worldLocations.home) {
            const pos = this.worldToMinimap(this.worldLocations.home.position.x, this.worldLocations.home.position.z);
            
            if (pos.x >= 0 && pos.x <= 200 && pos.y >= 0 && pos.y <= 200) {
                // Yellow circle for home
                ctx.fillStyle = '#FFD93D';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
                ctx.fill();
                
                // White outline
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Draw "H" for Home
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 9px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('H', pos.x, pos.y + 3);
            }
        }
    }
    
    drawMinimapPassengers(ctx) {
        for (let passenger of this.availablePassengers) {
            if (!passenger.pickedUp) {
                const pos = this.worldToMinimap(passenger.pickup.x, passenger.pickup.z);
                
                // Check if passenger is visible on minimap
                if (pos.x >= 0 && pos.x <= 200 && pos.y >= 0 && pos.y <= 200) {
                    // Draw pickup indicator
                    ctx.fillStyle = '#FFFF00';
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Draw passenger name
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(passenger.name, pos.x, pos.y - 8);
                }
            }
        }
    }
    
    drawMinimapDestination(ctx) {
        const pos = this.worldToMinimap(this.taxiMode.destination.x, this.taxiMode.destination.z);
        
        // Check if destination is visible on minimap
        if (pos.x >= 0 && pos.x <= 200 && pos.y >= 0 && pos.y <= 200) {
            // Draw destination marker
            ctx.fillStyle = '#00FF00';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw destination flag
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(pos.x - 1, pos.y - 12, 2, 8);
            ctx.fillRect(pos.x + 1, pos.y - 12, 6, 4);
            
            // Draw distance
            const distance = this.carPosition.distanceTo(this.taxiMode.destination);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${distance.toFixed(0)}m`, pos.x, pos.y + 18);
        }
    }
    
    drawMinimapCar(ctx) {
        const pos = this.worldToMinimap(this.carPosition.x, this.carPosition.z);
        
        // Draw car as a red circle with a direction line
        ctx.save();
        ctx.translate(pos.x, pos.y);
        
        // Draw main circle (car body)
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw white outline
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw direction indicator line
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        // Direction line pointing forward
        const dirX = Math.sin(this.carRotation) * 8;
        const dirY = -Math.cos(this.carRotation) * 8; // Negative because canvas Y is flipped
        ctx.lineTo(dirX, dirY);
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawMinimapCompass(ctx) {
        // Draw compass in top-right corner of minimap
        const compassX = 180;
        const compassY = 20;
        const compassRadius = 15;
        
        // Compass background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(compassX, compassY, compassRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // North indicator
        ctx.save();
        ctx.translate(compassX, compassY);
        ctx.rotate(-this.carRotation);
        
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-3, -3);
        ctx.lineTo(3, -3);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        
        // N label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('N', compassX, compassY - 25);
    }
    
    drawMinimapAICars(ctx) {
        for (let aiCar of this.aiCars) {
            const pos = this.worldToMinimap(aiCar.position.x, aiCar.position.z);
            
            // Check if AI car is visible on minimap
            if (pos.x >= 0 && pos.x <= 200 && pos.y >= 0 && pos.y <= 200) {
                // Draw AI car as smaller blue circles
                ctx.fillStyle = '#0088FF';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw outline
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
    
    updateCamera() {
        // Follow car with smooth camera
        const idealCameraPosition = new THREE.Vector3(
            this.carPosition.x - Math.sin(this.carRotation) * 12,
            this.carPosition.y + 8,
            this.carPosition.z - Math.cos(this.carRotation) * 12
        );
        
        const idealLookAt = new THREE.Vector3(
            this.carPosition.x + Math.sin(this.carRotation) * 5,
            this.carPosition.y + 2,
            this.carPosition.z + Math.cos(this.carRotation) * 5
        );
        
        // Smooth camera movement
        this.camera.position.lerp(idealCameraPosition, 0.05);
        
        // Look at point in front of car
        const lookAtTarget = new THREE.Vector3();
        lookAtTarget.copy(idealLookAt);
        this.camera.lookAt(lookAtTarget);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updateCarPhysics();
        this.updateTaxiMode();
        this.updateAICars();
        this.updateLifeMode();
        this.updateGameTime();
        this.updateTimeAndWeather();
        this.updateRain();
        this.updateMinimap();
        this.updateCamera();
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game
const game = new DrivingGame();