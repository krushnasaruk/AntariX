import React from 'react';
import { PAGES } from '../utils/constants';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { CommunicationPage } from '../pages/Communication/CommunicationPage';
import { SimulationPage } from '../pages/Simulation/SimulationPage';
import { RoverPage } from '../pages/Rover/RoverPage';
import { AIPage } from '../pages/AI/AIPage';
import { MissionPage } from '../pages/Mission/MissionPage';
import { TelemetryPage } from '../pages/Telemetry/TelemetryPage';
import { DataQueuePage } from '../pages/DataQueue/DataQueuePage';
import { EventsPage } from '../pages/Events/EventsPage';
import { DigitalTwinPage } from '../pages/DigitalTwin/DigitalTwinPage';
import { MLRegistryPage } from '../pages/MLRegistry/MLRegistryPage';
import { TrainingPage } from '../pages/Training/TrainingPage';
import { SafetyGatePage } from '../pages/SafetyGate/SafetyGatePage';

export function renderPage(activePage, props) {
  switch (activePage) {
    case PAGES.DASHBOARD:
      return <DashboardPage {...props} />;
    case PAGES.COMMUNICATION:
      return <CommunicationPage {...props} />;
    case PAGES.SIMULATION:
      return <SimulationPage {...props} />;
    case PAGES.ROVER:
      return <RoverPage {...props} />;
    case PAGES.AI:
      return <AIPage {...props} />;
    case PAGES.MISSION:
      return <MissionPage {...props} />;
    case PAGES.TELEMETRY:
      return <TelemetryPage {...props} />;
    case PAGES.DATA_QUEUE:
      return <DataQueuePage {...props} />;
    case PAGES.DIGITAL_TWIN:
      return <DigitalTwinPage {...props} />;
    case PAGES.ML_REGISTRY:
      return <MLRegistryPage {...props} />;
    case PAGES.TRAINING:
      return <TrainingPage {...props} />;
    case PAGES.SAFETY_GATE:
      return <SafetyGatePage {...props} />;
    case PAGES.EVENTS:
      return <EventsPage {...props} />;
    default:
      return <DashboardPage {...props} />;
  }
}
