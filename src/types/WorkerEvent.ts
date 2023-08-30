export enum WorkerToMain {
    ERROR,
    LAUNCH,
    UPDATE,
}

export enum MainToWorker {
    READY,
}

export type WorkerToMainEvent = {
    type: WorkerToMain;
    data: any;
};

export type MainToWorkerEvent = {
    type: MainToWorker;
    data: any;
};
