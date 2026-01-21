# Diagrams
### Zones

It is designed as a "hub" structure. The **Great Hall** is the central spoke; all other areas branch off from it. As the game progresses (and the castle "rots"), certain paths may become blocked or guarded, forcing you to use the **Dungeons/Sewers** shortcut.

```text
       ~ ~ ~ ~ ~ ~   THE  NORWEGIAN  SEA   ~ ~ ~ ~ ~ ~ ~
       ~                                               ~
       ~         [ THE HARBOR ] (Act 4 Exit)           ~
       ~                |                              ~
       ~                |                              ~
       #################+###############################
       #                                               #
       #              THE RAMPARTS                     #
       #       (The Ghost / Cold / Windy)              #
       #                                               #
       #######+#################################+#######
              |                                 |
      +-------+-------+                 +-------+-------+
      | ROYAL QUARTERS|                 |   THE TOWER   |
      | (Claudius &   |                 | (Prison Cell) |
      |  Gertrude)    |                 |               |
      +-------+-------+                 +-------+-------+
              |                                 |
+-------------+-------------+     +-------------+-------------+
|      THE LIBRARY          |     |       THE CHAPEL          |
|    (Polonius / Wits)      |     |     (Prayer Scene)        |
|  [Hidden Passage behind   |     |    [Confessional Booth]   |
|   Bookshelf]              |     |                           |
+-------------+-------------+     +-------------+-------------+
              |                                 |
              |                                 |
      +-------+---------------------------------+-------+
      |                                                 |
      |                 THE GREAT HALL                  |
      |        (The Throne / The Play / The Duel)       |
      |                                                 |
      +-----------------------+-------------------------+
                              |
                     +--------+--------+
                     |                 |
      +--------------+                 +--------------+
      |              |   COURTYARD     |              |
      | (Training)   | (Main Gates)    |  (Gardens)   |
      |              |                 |              |
      +------+-------+--------+--------+-------+------+
             |                |                |
      +------+------+  +------+------+  +------+------+
      |   GUARD     |  |   SEWERS    |  |  GRAVEYARD  |
      |  BARRACKS   |  | (Underground|  |   (Act 5 /  |
      |             |  |  Shortcut)  |  |   Yorick)   |
      +-------------+  +-------------+  +-------------+

```

### **Map Key & Navigation Logic**
1. **The Great Hall (Hub):**
	* This is the only "safe" zone where you can freely walk without suspicion in the early game.
	* It connects the **North** (Royalty/Plot) to the **South** (Exit/Combat).
2. **The Verticality:**
	* **The Ramparts (Top):** Only accessible at **Night**. If you try to go there during the Day, guards block you.
	* **The Sewers (Bottom):** The "fast travel" system. It runs *underneath* the map, connecting the **Barracks**, **Library**, and **Royal Quarters**. You use this to sneak into Claudius's room without being seen.
3. **The Graveyard (East):**
	* Located outside the castle walls.
	* It is physically separated. To get there, you must either exit the main gates (requires a "Pass") or find the broken wall in the Sewers.
4. **The Library (West):**
	* Contains the **Hidden Passage**. If you have high **Wits**, you find a lever behind a bookshelf that drops you directly into the Sewers, allowing you to bypass the guards in the Great Hall.

### The Role of Corridors in "The Prince of Denmark"
Visually, think of the long hallways in *Chrono Trigger* (like Magus’s Castle) or *Final Fantasy VI* (Vector).

**1. The "Arras" Mechanic (Hiding)**
In *Hamlet*, Polonius is famously killed while hiding behind an **arras** (a hanging tapestry).

* **Gameplay:** The corridors are lined with these heavy tapestries.
* **Action:** If a guard or courtier is coming, you can duck behind a tapestry.
* **Risk:** While hidden, you can’t move. If the guard stops *right in front of you*, your "Suspicion Meter" starts ticking up (simulating Hamlet holding his breath).

**2. The Acoustics (Eavesdropping)**
Corridors are echo chambers.
* **Mechanic:** You will often see "Speech Bubbles" drifting from off-screen before you see the characters.
* **Strategy:** You have to stand at the corner of a T-junction to "catch" a Rumor from two guards talking around the bend without being seen.

**3. The Ghost in the Hallway**
Since corridors are narrow (only 2-3 tiles wide), they are claustrophobic.
* **The Haunting:** Sometimes, the Ghost will spawn at the far end of a long corridor. You have no choice but to walk *through* him (taking Sanity damage) or turn back and find another route.

---
### Detailed View: The "North Corridor"
Here is a zoomed-in look at the corridor connecting the **Great Hall** to the **Royal Quarters**.

**Legend:**
* `=` : Wall
* `T` : Tapestry (Hiding Spot)
* `G` : Guard (Patrolling)
* `.` : Floor/Carpet
* `D` : Door

```text
       TO ROYAL QUARTERS (Restricted Area)
              |   |
      ========+   +========
      =                   =
      = T               T =  <-- Hiding Spot: Wait for Guard to pass
      =                   =
      =         G         =  <-- Guard walks up and down
      =         |         =
      =         v         =
      =                   =
      = T               T =  <-- Hiding Spot
      =                   =
      =                   =
      =====   =====   =====
          |   |   |   |
      TO LIBRARY  TO CHAPEL
          |   |   |   |
      ====+   +===+   +====
      =                   =
      =                   =
      =         ^         =
      =         |         =
      =    [ HAMLET ]     =
      =                   =
      ========+   +========
              |   |
         TO GREAT HALL

```
### Gameplay Scenario in this Corridor:
1. **Objective:** Get to the Royal Quarters to steal a letter from Claudius.
2. **The Obstacle:** A Guard is patrolling vertically.
3. **The Move:**
* You walk North.
* You hear footsteps.
* You quickly dash left and press 'Action' to hide behind the **Tapestry (T)** on the left wall.
* The Guard walks past you.
* **The Twist:** The Guard stops to talk to a Maid. You are stuck behind the tapestry.
* **The Reward:** Because you are stuck, you overhear them: *"The King keeps the key to the drawer under his pillow."* (You gain a **Rumor**).
* They leave. You exit the tapestry and continue North.
