export class State {
    enter(scene, entity) { }
    execute(scene, entity) { }
    exit(scene, entity) { }
}

export class StateMachine {
    constructor(initialState, scene, entity) {
        this.currentState = initialState;
        this.scene = scene;
        this.entity = entity;

        // Start the initial state
        this.currentState.enter(this.scene, this.entity);
    }

    changeState(newState) {
        if (this.currentState) {
            this.currentState.exit(this.scene, this.entity);
        }

        this.currentState = newState;
        this.currentState.enter(this.scene, this.entity);
    }

    update() {
        if (this.currentState) {
            this.currentState.execute(this.scene, this.entity);
        }
    }
}
