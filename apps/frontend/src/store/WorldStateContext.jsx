import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchWorldState, stepSimulation as apiStep, resetSimulation as apiReset, injectSimulationFault as apiInject, clearSimulationFault as apiClear } from '../api/simulationApi.js';
import { fetchAutonomyDecision, fetchSafetyInvariants } from '../api/autonomyApi.js';
import { fetchMissionPlan } from '../api/missionApi.js';
import { fetchIntelligenceReport, fetchLearningData } from '../api/intelligenceApi.js';
import { fetchModelRegistry } from '../api/mlApi.js';
import { fetchTrainingJobs } from '../api/trainingApi.js';
import { fetchBenchmarkResults } from '../api/benchmarkApi.js';

const WorldStateContext = createContext(null);

export function WorldStateProvider({ children }) {
  const [worldState, setWorldState] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [freshnessText, setFreshnessText] = useState('OFFLINE');

  // Subsystem States
  const [autonomyDecision, setAutonomyDecision] = useState(null);
  const [safetyInvariants, setSafetyInvariants] = useState([]);
  const [missionPlan, setMissionPlan] = useState(null);
  const [intelligenceReport, setIntelligenceReport] = useState(null);
  const [learningData, setLearningData] = useState(null);
  const [modelRegistry, setModelRegistry] = useState([]);
  const [trainingJobs, setTrainingJobs] = useState([]);
  const [benchmarkResults, setBenchmarkResults] = useState(null);

  // WebSocket Connection
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;

    function connect() {
      try {
        ws = new WebSocket('ws://localhost:3000');

        ws.onopen = () => {
          setConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'WORLD_STATE_UPDATE' && msg.worldState) {
              setWorldState(msg.worldState);
              setLastUpdated(Date.now());
            }
          } catch {}
        };

        ws.onclose = () => {
          setConnected(false);
          reconnectTimeout = setTimeout(connect, 2500);
        };

        ws.onerror = () => {
          setConnected(false);
          ws.close();
        };
      } catch {
        setConnected(false);
        reconnectTimeout = setTimeout(connect, 2500);
      }
    }

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Fallback Polling if WebSocket is disconnected
  useEffect(() => {
    let interval = null;
    if (!connected) {
      const poll = async () => {
        try {
          const res = await fetchWorldState();
          if (res?.data) {
            setWorldState(res.data);
            setConnected(true);
            setLastUpdated(Date.now());
          }
        } catch {
          setConnected(false);
        }
      };

      poll();
      interval = setInterval(poll, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connected]);

  // Freshness counter timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (!lastUpdated) {
        setFreshnessText('OFFLINE');
      } else {
        const diffMs = Date.now() - lastUpdated;
        if (diffMs < 1500) {
          setFreshnessText('LIVE');
        } else if (diffMs < 5000) {
          setFreshnessText(`STALE · ${Math.round(diffMs / 1000)}s ago`);
        } else {
          setFreshnessText('OFFLINE');
        }
      }
    }, 500);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // Periodic subsystem fetchers
  const refreshSubsystems = useCallback(async () => {
    try {
      const [dec, inv, plan, intel, learn, ml, train, bench] = await Promise.allSettled([
        fetchAutonomyDecision(),
        fetchSafetyInvariants(),
        fetchMissionPlan(),
        fetchIntelligenceReport(),
        fetchLearningData(),
        fetchModelRegistry(),
        fetchTrainingJobs(),
        fetchBenchmarkResults()
      ]);

      if (dec.status === 'fulfilled') setAutonomyDecision(dec.value?.data);
      if (inv.status === 'fulfilled') setSafetyInvariants(inv.value?.data || []);
      if (plan.status === 'fulfilled') setMissionPlan(plan.value?.data);
      if (intel.status === 'fulfilled') setIntelligenceReport(intel.value?.data);
      if (learn.status === 'fulfilled') setLearningData(learn.value?.data);
      if (ml.status === 'fulfilled') setModelRegistry(ml.value?.data || []);
      if (train.status === 'fulfilled') setTrainingJobs(train.value?.data || []);
      if (bench.status === 'fulfilled') setBenchmarkResults(bench.value?.data);
    } catch {}
  }, []);

  useEffect(() => {
    refreshSubsystems();
    const subTimer = setInterval(refreshSubsystems, 5000);
    return () => clearInterval(subTimer);
  }, [refreshSubsystems]);

  // Actions
  const step = async (dt = 1.0) => {
    const res = await apiStep(dt);
    if (res?.data) {
      setWorldState(res.data);
      setLastUpdated(Date.now());
    }
    return res;
  };

  const reset = async (seed = 42) => {
    const res = await apiReset(seed);
    if (res?.data) {
      setWorldState(res.data);
      setLastUpdated(Date.now());
    }
    refreshSubsystems();
    return res;
  };

  const injectFault = async (faultType) => {
    const res = await apiInject(faultType);
    if (res?.data) {
      setWorldState(res.data);
      setLastUpdated(Date.now());
    }
    refreshSubsystems();
    return res;
  };

  const clearFault = async (faultType) => {
    const res = await apiClear(faultType);
    if (res?.data) {
      setWorldState(res.data);
      setLastUpdated(Date.now());
    }
    refreshSubsystems();
    return res;
  };

  return (
    <WorldStateContext.Provider value={{
      worldState,
      connected,
      lastUpdated,
      freshnessText,
      autonomyDecision,
      safetyInvariants,
      missionPlan,
      intelligenceReport,
      learningData,
      modelRegistry,
      trainingJobs,
      benchmarkResults,
      step,
      reset,
      injectFault,
      clearFault,
      refreshSubsystems
    }}>
      {children}
    </WorldStateContext.Provider>
  );
}

export function useWorldState() {
  return useContext(WorldStateContext);
}

export function useRoverTelemetry() {
  const { worldState, connected, freshnessText } = useWorldState();
  return {
    rover: worldState?.rover || null,
    connected,
    freshnessText
  };
}

export function useEnvironment() {
  const { worldState } = useWorldState();
  return worldState?.environment || null;
}

export function useCommunication() {
  const { worldState } = useWorldState();
  return worldState?.communication || null;
}

export function useMission() {
  const { worldState } = useWorldState();
  return worldState?.mission || null;
}
