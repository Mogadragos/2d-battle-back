export enum WorkerToMain {
    ERROR,
    LAUNCH,
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
