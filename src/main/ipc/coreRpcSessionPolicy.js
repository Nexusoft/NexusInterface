'use strict';

const SESSION_OVERRIDE_ENDPOINTS = new Set([
  'sessions/terminate/local',
  'sessions/unlock/local',
  'sessions/status/local',
]);
const SESSION_SELECTION_ENDPOINTS = new Set([
  'sessions/create/local',
  'sessions/unlock/local',
  'sessions/status/local',
]);

function isSessionSelectionRequest(request) {
  return (
    SESSION_SELECTION_ENDPOINTS.has(request.endpoint) &&
    (request.endpoint !== 'sessions/status/local' ||
      typeof request.params?.session === 'string')
  );
}

function createCoreRpcSessionPolicy() {
  let activeSession = null;
  let multiuser = false;
  let latestSessionSelection = 0;
  let latestSessionSelectionTarget = null;
  let latestSessionList = 0;
  let sessionRevision = 0;
  let coreGeneration = 0;
  const sessionSelectionRequests = new WeakMap();
  const pendingSessionSelections = new Set();
  const sessionListRequests = new WeakMap();
  const sessionTerminationRequests = new WeakMap();
  const coreInfoRequests = new WeakMap();

  function settleSessionSelection(request) {
    pendingSessionSelections.delete(sessionSelectionRequests.get(request));
  }

  return {
    reset() {
      activeSession = null;
      multiuser = false;
      latestSessionSelection += 1;
      latestSessionSelectionTarget = null;
      latestSessionList += 1;
      sessionRevision += 1;
      coreGeneration += 1;
      pendingSessionSelections.clear();
    },

    authorize(request) {
      const params = request.params ? { ...request.params } : undefined;
      if (SESSION_OVERRIDE_ENDPOINTS.has(request.endpoint)) {
        const authorizedRequest = { ...request, params };
        if (isSessionSelectionRequest(authorizedRequest)) {
          latestSessionSelection += 1;
          sessionSelectionRequests.set(
            authorizedRequest,
            latestSessionSelection
          );
          latestSessionSelectionTarget =
            authorizedRequest.params?.session || null;
          pendingSessionSelections.clear();
          pendingSessionSelections.add(latestSessionSelection);
        } else if (request.endpoint === 'sessions/terminate/local') {
          sessionTerminationRequests.set(authorizedRequest, {
            activeSession,
            latestSessionSelection,
          });
        }
        return authorizedRequest;
      }

      if (
        pendingSessionSelections.size > 0 &&
        !request.endpoint.startsWith('sessions/')
      ) {
        throw new Error('Core RPC blocked while session selection is pending');
      }
      if (params) delete params.session;
      const authorizedRequest = {
        ...request,
        params:
          multiuser && activeSession
            ? { session: activeSession, ...params }
            : params,
      };
      if (request.endpoint === 'system/get/info') {
        coreInfoRequests.set(authorizedRequest, coreGeneration);
      }
      if (isSessionSelectionRequest(authorizedRequest)) {
        latestSessionSelection += 1;
        sessionSelectionRequests.set(authorizedRequest, latestSessionSelection);
        latestSessionSelectionTarget =
          authorizedRequest.endpoint === 'sessions/create/local'
            ? null
            : authorizedRequest.params?.session || null;
        pendingSessionSelections.clear();
        pendingSessionSelections.add(latestSessionSelection);
      } else if (request.endpoint === 'sessions/list/local') {
        latestSessionList += 1;
        sessionListRequests.set(authorizedRequest, {
          sessionList: latestSessionList,
          latestSessionSelection,
          sessionRevision,
        });
      }
      return authorizedRequest;
    },

    observe(request, result) {
      const sessionSelection = sessionSelectionRequests.get(request);
      const sessionList = sessionListRequests.get(request);
      const termination = sessionTerminationRequests.get(request);
      const terminationSelection = termination?.latestSessionSelection;
      settleSessionSelection(request);
      if (
        request.endpoint === 'system/get/info' &&
        coreInfoRequests.get(request) === coreGeneration
      ) {
        multiuser = result?.multiuser === true;
      }
      if (
        sessionSelection !== undefined &&
        sessionSelection !== latestSessionSelection
      ) {
        return;
      }
      if (
        sessionList &&
        (sessionList.sessionList !== latestSessionList ||
          pendingSessionSelections.size > 0 ||
          sessionList.latestSessionSelection !== latestSessionSelection ||
          sessionList.sessionRevision !== sessionRevision)
      ) {
        return;
      }
      const explicitSession = request.params?.session;
      if (
        request.endpoint === 'sessions/create/local' &&
        typeof result?.session === 'string'
      ) {
        activeSession = result.session;
        sessionRevision += 1;
      } else if (
        (request.endpoint === 'sessions/status/local' ||
          request.endpoint === 'sessions/unlock/local') &&
        explicitSession
      ) {
        activeSession = explicitSession;
        sessionRevision += 1;
      } else if (
        request.endpoint === 'sessions/list/local' &&
        Array.isArray(result)
      ) {
        const sessions = result.filter(
          (session) => typeof session?.session === 'string'
        );
        if (!sessions.some((session) => session.session === activeSession)) {
          const latest = sessions.reduce(
            (current, session) =>
              !current || session.accessed > current.accessed ? session : current,
            null
          );
          activeSession = latest?.session || null;
        }
      } else if (request.endpoint === 'sessions/terminate/local') {
        const clearsActiveSession =
          explicitSession
            ? explicitSession === activeSession
            : termination?.activeSession === activeSession;
        const invalidatesLatestSelection =
          (clearsActiveSession &&
            (terminationSelection === undefined ||
              latestSessionSelection <= terminationSelection)) ||
          (explicitSession &&
            explicitSession === latestSessionSelectionTarget);
        if (clearsActiveSession) {
          activeSession = null;
          sessionRevision += 1;
        }
        if (invalidatesLatestSelection) {
          latestSessionSelection += 1;
          latestSessionSelectionTarget = null;
          pendingSessionSelections.clear();
        }
      }
    },

    cancel(request) {
      settleSessionSelection(request);
    },
  };
}

module.exports = {
  createCoreRpcSessionPolicy,
};
