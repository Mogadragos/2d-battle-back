export enum WorkerToMain {
    ERROR,
    LAUNCH,
    UPDATE,
}

export enum MainToWorker {
    READY,
    SPAWN,
}

export type WorkerToMainEvent = {
    type: WorkerToMain;
    data: any;
};

export type MainToWorkerEvent<T = any> = {
    type: MainToWorker;
    player: string;
    data: T;
};
