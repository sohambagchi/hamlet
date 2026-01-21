# Sprites

### **1. The Protagonist: Prince Hamlet**
_Hamlet requires the most assets. He needs two "Modes": Exploration and Combat._

**A. Exploration Mode (No Weapon)**
- **Idle (South, North, Side):** Breathing animation.
- **Walk Cycle (South, North, Side):** 4-6 frames.
- **Run/Dash Cycle:** 4-6 frames.
- **Interact/Grab:** Reaching out (for picking up clues or opening doors).
- **"The Soliloquy" (Special):** Head down, hand on chin/chest. Used for leveling up or internal monologue.
- **"The Accusation" (Special):** Pointing finger aggressively. Used in Dialogue Battles (e.g., "Attack" move).
- **Shock/Madness:** Hands gripping head.
    
**B. Combat Mode (Sword Drawn)**
- **Combat Idle (Stance):** Knees bent, sword raised. (Side view is most important here).
- **Thrust (Attack):** A quick lunge forward.
- **Parry (Block):** Sword vertical, sparks effect.
- **Dodge/Sidestep:** A quick blur or slide back.
- **Cast/Glitch:** Sword held high, "charging" pose (for Bullet Time).
- **Stagger/Hurt:** Knocked back.
- **Death:** Crumpling to the ground.
    
---
### **2. The Combat Bosses (Laertes, Pirates)**
_These characters share the same functional needs as Hamlet but with fewer specific acting cues._

**Laertes (The Rival)**
- **Exploration:** Idle, Walk, Talk (standard).
- **Combat:** Needs a full set matching Hamlet (Idle, Thrust, Parry, Dodge, Hurt).
- **Unique Death:** Distinct from a standard enemy; perhaps he props himself up before dying (to deliver his final line).

**Pirates / Guards (The Mobs)**
- **Combat Only:** You can skip complex social animations.
- **Idle:** Guard stance.
- **Walk:** Patrol walk.
- **Alert:** "!" reaction pose.
- **Attack:** Single generic swipe/poke.
- **Die:** Generic collapse.

---
### **3. The Narrative Bosses (Claudius, Gertrude, Polonius)**
_These characters rarely fight. Their "Battle" is social. Focus on "Acting" poses._

**Claudius (The King)**
- **Idle/Walk:** Regal, upright posture.
- **Sitting:** On the Throne (Static).
- **Toast:** Raising a goblet (used in Act 1 and Act 5).
- **The Prayer (Vital):** Kneeling, head bowed. (Crucial for the Act 3 "Kill/Spare" choice).
- **Death:** Slumped in Throne or lying on floor.

**Gertrude (The Queen)**
- **Idle/Walk:** Long dress (easier to animate, no legs needed).
- **Sitting:** On Throne.
- **Distress:** Hands to mouth (Reaction to Polonius's death/Hamlet's madness).
- **Drink:** Drinking from the poisoned cup.
- **Death:** Collapse.

**Polonius (The Spy)**
- **Idle/Walk:** Hunched, shuffling (indicates age).
- **"The Lesson":** Finger wagging (used when talking to Laertes/Ophelia).
- **Hiding:** A sprite of the **Curtain** (environment object) bulging, or Polonius peeking out.
- **Death:** Bleeding out on the floor.
    
**Ophelia (The Victim)**
- **Idle/Walk (Normal):** Hands clasped.
- **Idle/Walk (Mad):** Different sprite. Hair messy, erratic movement path.
- **Giving Flowers:** Arms extended (giving Rue/Rosemary).
- **Floating (Optional):** If you show her death, a static sprite of her floating in water.
    
---
### **4. Support & Special**

**The Ghost**
- **Idle:** Floating (no legs, just trailing mist).
- **Beckon:** Slowly waving arm (to lead Hamlet to the Ramparts).
- _Note:_ Render this sprite in grayscale or blue-scale and apply 50% opacity in the game engine.
    
**Horatio**
- **Idle/Walk.**
- **Kneeling:** Holding Hamlet (for the ending cutscene).
    
**Yorick**
- **Sprite:** Just the skull.
- _Implementation:_ This should be a separate small sprite that can be "attached" to Hamlet's hand during the Graveyard scene, or simply shown in the UI.
