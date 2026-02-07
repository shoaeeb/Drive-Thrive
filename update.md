# 3D Taxi Driving Game - Feature List

## Game Overview
A fully functional 3D taxi driving simulator with **Life Mode** built with Three.js, featuring a large open world with cities and villages, dynamic weather, day/night cycles, realistic driving physics, and complete survival mechanics where you must manage hunger, energy, fuel, and money while running your taxi business.

---

## 🎮 Life Mode - NEW!

### Player Survival Stats
- **💰 Money**: Earn from taxi fares, spend on food and fuel
- **⚡ Energy**: Decreases while driving, must rest to recharge
- **🍔 Hunger**: Decreases over time, eat at restaurants to restore
- **⛽ Fuel**: Consumed based on driving speed, refuel at gas stations
- **😊 Mood**: Affected by hunger and energy, gives bonus tips when high

### Time & Day System
- **24-Hour Clock**: Real-time display (HH:MM AM/PM)
- **Day Counter**: Tracks which day you're on
- **Dynamic Time**: Game time advances automatically
- **Sleep Mechanic**: Rest at home to skip to next morning (8 AM)

### Daily Goals & Progression
- **Money Target**: Earn $200 per day
- **Trip Target**: Complete 5 taxi trips per day
- **Progress Tracking**: Real-time display of daily achievements
- **Daily Reset**: Goals reset each new day at midnight

### World Locations & Interactions

#### 🍔 Restaurants (6 locations)
- **Cost**: $15 per meal
- **Benefits**: +40 hunger, +10 energy, +15 mood
- **Locations**: City Diner, Pizza Palace, Burger Joint, Sushi Bar, Village Cafe, Hillside Restaurant
- **Map Marker**: Red circles with "F" label

#### ⛽ Gas Stations (4 locations)
- **Cost**: $20 to refuel
- **Benefits**: Restores fuel to 100%
- **Locations**: City Gas, Quick Fuel, North Station, Village Fuel
- **Map Marker**: Cyan circles with "G" label

#### 🏠 Player Home
- **Cost**: Free
- **Benefits**: Restores energy to 100%, +20 mood, advances time to morning
- **Location**: Your personal house near city center
- **Map Marker**: Yellow circle with "H" label

### Gameplay Mechanics
- **Mood Bonus System**: High mood (>80%) gives 20% bonus on taxi fares
- **Low Fuel Penalty**: Speed reduced to 40% when fuel drops below 10%
- **Natural Stat Decay**: Energy, hunger, and fuel decrease over time
- **Interaction Prompts**: On-screen prompts when stopped near locations
- **Strategic Planning**: Balance work with self-care for optimal earnings

---

## Core Gameplay Features

### 🚗 Driving Mechanics
- **Realistic Car Physics**: Acceleration, friction, and momentum-based movement
- **Responsive Steering**: Speed-dependent turning with smooth controls
- **Handbrake System**: Emergency braking with space bar
- **Collision Detection**: Can't drive through trees, buildings, or obstacles
- **Wheel Animation**: Wheels rotate realistically based on speed

### 🚕 Taxi Mode
- **Passenger Pickup System**: Find and pick up passengers marked with yellow indicators
- **Destination Navigation**: Green markers show where to drop off passengers
- **Fare System**: Earn money based on distance traveled
- **Total Earnings Tracker**: Keep track of your taxi business success
- **5 Active Passengers**: Always passengers waiting across the city and villages
- **Automatic Respawn**: New passengers appear after successful dropoffs

---

## World & Environment

### 🌍 Massive Open World
- **2000x2000 Unit Map**: Huge explorable area
- **City Center**: Dense urban area with tall skyscrapers (20-70 units high)
- **4 Village Areas**:
  - Riverside Village (top-right)
  - Hillside Village (top-left)
  - Meadow Village (bottom-right)
  - Forest Village (bottom-left)

### 🏗️ Buildings & Structures
- **30+ City Buildings**: Modern skyscrapers with varied heights and colors
- **32+ Village Buildings**: Smaller, cozy houses with warm colors
- **Village Landmarks**: Churches with spires, community wells
- **150+ Trees**: Scattered across the landscape
- **Realistic Shadows**: Buildings and trees cast dynamic shadows

### 🛣️ Road Network
- **Main Highways**: 16-unit wide highways crossing the map
- **City Grid**: Dense 150-unit spacing roads in urban center
- **Village Roads**: Organic, less organized roads in rural areas
- **Road Markings**: White lane markings on main highways
- **Multiple Intersections**: Complex road system for navigation

---

## Visual & Atmospheric Features

### ☀️ Dynamic Day/Night Cycle
- **10-Minute Cycle**: Complete day/night rotation
- **Moving Sun**: Directional light rotates realistically across sky
- **Dynamic Sky Colors**: 
  - Bright blue during day
  - Orange during sunrise/sunset
  - Dark blue at night
- **Automatic Lighting**: Sun intensity changes based on time of day

### 💡 Lighting System
- **Street Lights**: Automatically turn on at night with warm yellow glow
- **Car Headlights**: Your car and AI cars turn on headlights at night
- **Functional Spotlights**: Two headlight beams illuminate the road ahead
- **Manual Control**: Toggle headlights on/off with 'H' key
- **Automatic Mode**: Reset to auto day/night control with 'G' key
- **Shadow Casting**: Headlights create realistic shadows

### 🌧️ Weather System
- **Rain Effects**: 300 animated rain particles
- **Dynamic Weather**: Random weather changes or manual control
- **Visual Feedback**: Rain particles fall and reset realistically
- **Toggle Control**: Press 'R' to turn rain on/off

---

## AI & Traffic

### 🚙 AI Traffic System
- **5 AI Cars**: Roaming the city and roads
- **10 Different Colors**: Blue, Green, Yellow, Magenta, Cyan, Orange, Purple, Pink, Gray, Black
- **Road Following**: AI cars stay on roads and follow proper paths
- **Intersection Navigation**: Cars turn at intersections realistically
- **Collision Avoidance**: AI cars slow down near player
- **Automatic Headlights**: AI cars turn on lights at night
- **Wheel Animation**: AI car wheels rotate with movement

---

## User Interface

### 🗺️ Mini-Map
- **Real-time Map**: 200x200 pixel canvas in bottom-right corner
- **Road Network Display**: Shows all roads (main and parallel)
- **Player Position**: Red circle with direction indicator
- **Passenger Markers**: Yellow dots with names
- **Destination Marker**: Green dot with flag and distance
- **AI Cars**: Blue dots showing traffic
- **Compass**: North indicator that rotates with car
- **Location Markers**: 
  - Red "F" = Restaurants (Food)
  - Cyan "G" = Gas Stations
  - Yellow "H" = Home
- **Compact Legend**: Bottom-left corner shows Life Mode locations

### 📊 HUD Elements
- **Speedometer**: Real-time speed display in km/h (top-right)
- **Taxi Status**: Shows current mode and passenger info (top-right)
- **Fare Display**: Current trip fare and total earnings
- **Distance Tracker**: Distance to destination when passenger is aboard
- **Life Mode Panel**: Complete stats display (top-left)
  - Current day and time
  - Money, Energy, Hunger, Fuel, Mood
  - Daily goals progress
- **Interaction Prompts**: Center-screen prompts when near locations
- **Control Guide**: Bottom-left compact control reference

---

## Controls

### Driving Controls
- **W / Arrow Up**: Accelerate forward
- **S / Arrow Down**: Brake / Reverse
- **A / Arrow Left**: Steer left
- **D / Arrow Right**: Steer right
- **Space**: Handbrake

### Game Controls
- **T**: Toggle Taxi Mode on/off
- **R**: Toggle Rain on/off
- **N**: Toggle Day/Night (instant switch)
- **H**: Toggle Headlights (manual control)
- **G**: Reset Headlights to Auto mode

### Life Mode Controls - NEW!
- **E**: Eat at Restaurant ($15) - Restores hunger, energy, mood
- **F**: Refuel at Gas Station ($20) - Fills fuel tank
- **Q**: Sleep at Home (Free) - Restores energy, advances to morning

---

## Technical Features

### 🎮 Performance Optimizations
- **Selective Shadow Casting**: Only nearby objects cast shadows
- **Optimized Particle Systems**: Efficient rain rendering
- **Collision System**: Fast spatial checking for obstacles
- **Smooth Camera**: Lerp-based camera following
- **60 FPS Target**: Optimized for smooth gameplay

### 🎨 Graphics & Rendering
- **Three.js WebGL**: Hardware-accelerated 3D graphics
- **Dynamic Shadows**: Real-time shadow mapping
- **Emissive Materials**: Glowing lights and headlights
- **Transparent Materials**: Glass windows on cars and buildings
- **Anti-aliasing**: Smooth edges on all objects

### 🔧 Physics System
- **Velocity-based Movement**: Realistic acceleration and deceleration
- **Friction Simulation**: Natural speed reduction
- **Collision Response**: Stops movement when hitting obstacles
- **Rotation Smoothing**: Gradual steering for realistic handling

---

## Game Statistics

### World Content
- **150 Trees** with collision
- **62 Buildings** (30 city + 32 village)
- **8 Village Landmarks** (churches, wells)
- **6 Restaurants** for eating and restoring stats
- **4 Gas Stations** for refueling
- **1 Player Home** for sleeping and resting
- **5 AI Cars** with full behavior
- **5 Active Passengers** at all times
- **Multiple Road Networks** spanning the entire map

### Map Coverage
- **City Area**: ~1400x1400 units
- **Village Areas**: 4 clusters of ~400x400 units each
- **Total Playable Area**: 2000x2000 units
- **Road Length**: Several kilometers of drivable roads
- **Interactive Locations**: 11 total (6 restaurants + 4 gas stations + 1 home)

---

## Unique Features

✨ **Complete Life Simulation**: Manage hunger, energy, fuel, and mood while running taxi business
✨ **Day/Night Cycle with Time**: 24-hour clock with realistic day progression
✨ **Daily Goals System**: Earn money and complete trips to meet daily targets
✨ **Mood-Based Bonuses**: Happy drivers earn better tips from passengers
✨ **Resource Management**: Strategic planning required for fuel, food, and rest
✨ **Living World**: AI traffic, weather, and time create immersive atmosphere
✨ **Exploration Rewards**: Discover cities and villages with unique architecture
✨ **Realistic Driving**: Physics-based car handling with collision detection
✨ **Dynamic Lighting**: Headlights, street lights, and sun create realistic lighting
✨ **GPS Navigation**: Minimap shows all important locations (food, gas, home)
✨ **No Loading Screens**: Seamless open world experience
✨ **Survival Elements**: Must eat, sleep, and refuel to continue playing

---

## Future Enhancement Possibilities
- Character customization
- Multiple vehicle types with different fuel efficiency
- Traffic lights and traffic violations
- More weather effects (snow, fog variations)
- Radio/music system
- Garage/car customization and upgrades
- Multiplayer support
- Mission system with story elements
- Pedestrians and street life
- More detailed building interiors
- Parking mechanics
- Vehicle damage system
- Bank system for savings
- Property ownership (buy more homes)
- Competing taxi companies
- Special events and holidays

---

**Built with Three.js | Optimized for Performance | Pure JavaScript | Life Simulation Mechanics**
