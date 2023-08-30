export class Engine {
    tickLengthMs: number;
    previousTick!: number;

    thisGameLoop = this.gameLoop.bind(this);

    constructor(fps = 20) {
        this.tickLengthMs = 1000 / fps;
    }

    launch() {
        this.previousTick = Date.now();
        this.gameLoop();
    }

    gameLoop() {
        var now = Date.now();

        if (this.previousTick + this.tickLengthMs <= now) {
            var delta = (now - this.previousTick) / 1000;
            this.previousTick = now;

            this.update(delta);
        }

        if (Date.now() - this.previousTick < this.tickLengthMs - 16) {
            setTimeout(this.thisGameLoop);
        } else {
            setImmediate(this.thisGameLoop);
        }
    }

    update(delta: number) {}
}
