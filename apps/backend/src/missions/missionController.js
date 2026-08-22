import { store } from '../database/store.js';

export class MissionController {
  getMissionSummary() {
    return store.activeMission;
  }

  updateWaypoint(index, status) {
    if (store.activeMission.waypoints[index]) {
      store.activeMission.waypoints[index].status = status;
    }
    return store.activeMission;
  }
}

export const missionController = new MissionController();
