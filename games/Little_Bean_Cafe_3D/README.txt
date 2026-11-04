# Little Bean Café — 3D First-Person Owner Simulator

## Run it in VS Code
1. Unzip the downloaded project.
2. Open the `Little_Bean_Cafe_3D` folder in VS Code.
3. Install the Live Server extension if needed.
4. Right-click `index.html` and choose Open with Live Server.
5. Click OPEN YOUR CAFÉ.

An internet connection is required to load Three.js and the Google Fonts used by the game.

## Controls
- W A S D / arrow keys — walk
- Mouse — look around
- E — interact with a highlighted station
- Shift — sprint
- P — pause or resume the game
- Esc — close a panel or skip cooking cutscenes

## This build includes
- First-person café owner gameplay, customers, orders, cooking cutscenes, inventory, upgrades, sounds and settings.
- Lowered the main counter further and moved the register, screen, pickup shelf, takeaway cups, espresso equipment, grinder, jars, and pastry display down with their work surfaces. Café tables were lowered too. P now pauses/resumes the game.
- Interaction zones placed on the player-accessible side of the service counter.
- A refreshed storefront with a striped awning, exterior cafe sign, warm wall lights, flower boxes, welcome mat, patio furniture, trees, planters and road access.
- A larger walkable city district with connected roads, sidewalks, crosswalks, shopfronts, apartment buildings, parks, benches, trees, streetlights and bins.
- Collision boundaries for buildings, trees, furniture, equipment and other large obstacles.
- City walk limits extended well beyond the original café frontage.

The sound effects are synthesized in the browser. If a browser blocks sound until user interaction, click a button once.


## Restaurant tycoon-style update
- Cooking now uses five guided preparation stages per recipe, from station setup and ingredient measuring through cooking, finishing and quality check.
- Tickets show the exact requested menu items. Serving checks the prepared tray against the actual recipe names, so the wrong drink or pastry will not count as the requested item.
- Added taller New York-inspired apartment and storefront blocks, rooftop utility details, fire escapes, storefront canopies and crosswalks aligned with the intersections.
- Rebuilt the front facade returns so the entrance wall connects to both side walls, and added matching door knobs and push plates on both faces.


## Storefront and city continuity update
- The front facade is now a continuous solid painted wall with a fitted entrance opening instead of glass-only gaps.
- Enter a custom store name on the title screen; it appears on the title, HUD, and exterior/interior shop signs.
- Extended the ground into a continuous city foundation so the café and walkable city do not appear to float beyond the old plaza.
- City buildings now use varied roof silhouettes, different heights and widths, window/sill details on front, back and both sides, masonry courses, corner quoins, rooftop HVAC and water tanks, and front/back fire escapes.


Rear city, relaxed customer flow, and cooking mini-game update
- Added a second city avenue and detailed buildings behind the café, with visible shopfronts, windows, roof silhouettes, sidewalks, and street trees.
- Extended the continuous ground and walkable bounds behind the café so the player can walk around the building into the rear district.
- Reduced the customer queue cap to two and increased arrival intervals; rush waves are now much less frequent.
- Food preparation is now interactive: choose the correct ingredient for each step, then press and hold HOLD TO PREPARE until the progress completes before continuing.

Restaurant-tycoon expansion update
---------------------------------
- Added a landscaped park in the open plaza in front of the café, with a central stone path, flower beds, trees, benches, and park lighting.
- Added a café theme shop: Classic Garden, Coastal Blue, Tokyo Night, Nordic Minimal, and Midnight Luxe. Buy a theme once, then switch between owned themes.
- Added purchasable outdoor patio sets. Each set adds a table and four chairs to the front park; prices rise as the patio grows, with six sets available.
- Added day-by-day signature menu progression. A new drink or pastry unlocks on selected days and can appear in customer orders.
- Expanded the shop to include upgrades, ingredient stock, themes, furniture, and a menu-unlock roadmap.

The game is still a browser-based Three.js project. Open index.html with VS Code Live Server so the Three.js module import can load.


Button and mouse access fix
---------------------------
- The game starts with the mouse free so you can click SHOP and other HUD controls immediately.
- Click the 3D game view to capture the mouse for first-person camera look.
- Press Tab at any time to release the mouse without pausing, so you can click interface buttons.
- Press B to open the shop even while looking around; the mouse is released automatically.
- HUD buttons are layered above the 3D canvas and have explicit pointer-event handling.


RESTAURANT TYCOON EXPANSION UPDATE
- Added restaurant business levels with higher guest capacity and improved income at higher levels.
- Added a daily service challenge with a cash bonus for serving enough complete orders.
- Added new staff roles: kitchen cook, cashier, and front-of-house host, each with gameplay benefits and daily wages.
- Added lifetime guests and sales tracking.
- Added automatic browser save data for store name, cash, day, reputation, hired staff, upgrades, themes, stock, settings, and individually placed outdoor furniture.
- Added restore behavior for bought outdoor patio sets and placed furniture when returning to the game.
- Progress is stored in the same browser profile using localStorage; clearing browser site data removes that save.


FULL ENCLOSED BUILDING / VISUAL POLISH UPDATE
- Reworked the storefront into real wall sections around the front windows and entry.
- Added genuine framed glazing on the front, both side elevations, and rear wall; windows are openings rather than panes pasted over opaque walls.
- Added a weatherproof roof deck with perimeter fascia, parapet, gutters, corner caps, exhaust vent, and rooftop HVAC units.
- Added exterior rear branding and improved the building silhouette from multiple viewing angles.
- The chosen store name updates on the rear sign as well as the front and interior sign.
- Kept the existing game mechanics, first-person controls, shop, furniture placement, staff, menus, and progression.


EXTERIOR ENVELOPE POLISH PASS
- Added framed, glass-filled front, side and rear windows with proper surrounding wall segments.
- Added an overhanging roof deck, perimeter fascia, parapet, gutters, roof caps, ventilation and HVAC equipment.
- Added side pilasters, window lintels, exterior trim courses and downpipes.
- Retained the roof/ceiling over the interior so the café is enclosed from above as well as on all sides.


FULL-FOOTPRINT ROOF UPDATE
- Expanded the single continuous roof deck beyond the complete café shell, with even front, rear, and side overhangs.
- Rebuilt all four fascia runs and lengthened the side gutters to follow the enlarged roof edge.
- Kept the interior ceiling joined to the roof underside and repositioned rooftop HVAC and exhaust equipment onto the roof surface.

LATEST SERVICE / MOVEMENT UPDATE
- Food orders can now be served from either side of the service counter. Use E at the register on the guest-facing side or the pickup interaction behind the counter on the kitchen side.
- Walking speed has been increased slightly, from 4.1 to 5.0 movement units per second.
- Sprint speed has also been increased slightly while holding Shift.


LATEST REVISION PASS — PERFORMANCE AND SERVICE POLISH
- Added live customer patience bars to order tickets. Green means there is time left; the bar turns red when a guest is close to leaving.
- Reduced unnecessary HUD rebuilding from every frame to four refreshes per second, while keeping important order/service updates immediate.
- Cached animated pendant lights once instead of scanning every object in the 3D café every frame, reducing avoidable CPU work.
- Improved order-ticket spacing and added reduced-motion support for the new UI transitions.
- Kept the existing map, café shell, furniture, menu, progression, saves, two-sided register service, and faster movement.

LATEST CUSTOMER FLOW UPDATE
- Customers now enter from the front entrance and walk to the counter before their order can be served.
- Orders appear as serve options only after that customer reaches the counter.
- After receiving their food, customers walk to an available dining chair, turn toward the table, and use a lowered seated pose.
- Guests remain seated briefly before leaving, which frees their chair for the next guest. Arrivals pause when every tracked indoor chair is occupied.
- Customer facing direction is corrected while walking and when seated, so guests face the table rather than sitting backward.


LATEST FULL REVISION PASS — CUSTOMER ROUTING AND RELIABILITY
- Reserved each guest's dining seat at arrival, preventing multiple queued customers from being assigned the same chair. Reserved seats are released when a guest leaves or abandons an order, and cleared safely when a new day begins.
- Customers now route through side aisles and approach their assigned chair row-by-row after receiving their food, instead of taking a straight-line path through the dining tables.
- Order tickets display a live customer status: walking to the counter, waiting for food, walking to a table, seated, or leaving.
- Reduced how often each waiting guest queries and updates its patience-bar DOM element to reduce avoidable work on slower computers.
- Kept the existing first-person controls, café environment, recipes, inventory, staff, upgrades, themes, patio furniture, saving, settings, and progression.

ROOF STATUS — KEPT CLOSED
- The café retains its continuous full-footprint exterior roof deck, fascia on all four sides, gutters, and parapets.
- The roof is not removed or opened for the camera; the indoor ceiling remains in place as well.
- Rooftop equipment stays above the roof surface, while the café interior remains enclosed.


QUICKER FOOD PREPARATION UPDATE
- Ingredient preparation hold progress is substantially faster, so each recipe takes less time to complete.
- Correct ingredient choices, cooking-step progression, stock rules, and cooking cutscenes are preserved.
- A hired barista or cook gives an additional preparation-speed bonus.
- The enclosed full-footprint roof remains in place.
