/* =========================================================
   VALORA PROPERTY REQUEST DATA
   Sell / Rent Requests
========================================================= */

const STORAGE_KEY = "valoraPropertyRequests";


/* =========================================================
   GET REQUESTS
========================================================= */

export function getPropertyRequests() {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
  } catch (error) {
    console.error(
      "Unable to load VALORA property requests:",
      error
    );

    return [];
  }
}


/* =========================================================
   SAVE REQUESTS
========================================================= */

export function savePropertyRequests(requests) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(requests)
  );
}


/* =========================================================
   CREATE REQUEST
========================================================= */

export function createPropertyRequest(requestData) {

  const requests = getPropertyRequests();

  const newRequest = {

    id:
      "PR-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase(),

    requesterId:
      requestData.requesterId || "",

    requesterName:
      requestData.requesterName || "",

    requesterEmail:
      requestData.requesterEmail || "",

    requesterRole:
      requestData.requesterRole || "",

    propertyId:
      requestData.propertyId || "",

    propertyAddress:
      requestData.propertyAddress || "",

    propertyType:
      requestData.propertyType || "",

    bedrooms:
      requestData.bedrooms || "",

    bathrooms:
      requestData.bathrooms || "",

    propertySize:
      requestData.propertySize || "",

    requestType:
      requestData.requestType || "",

    askingPrice:
      requestData.askingPrice || "",

    rentalPeriod:
      requestData.rentalPeriod || "",

    additionalDetails:
      requestData.additionalDetails || "",

    financialInformation:
      requestData.financialInformation || "",

    status: "Pending HOA Review",

    hoaDecision:
      "",

    rejectionReason:
      "",

    assignedAgentId:
      "",

    assignedAgentName:
      "",

    assignedAt:
      "",

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),

  };


  requests.push(newRequest);

  savePropertyRequests(requests);

  return newRequest;
}


/* =========================================================
   UPDATE REQUEST
========================================================= */

export function updatePropertyRequest(
  requestId,
  updates
) {

  const requests = getPropertyRequests();

  const updatedRequests =
    requests.map((request) => {

      if (request.id !== requestId) {
        return request;
      }

      return {
        ...request,
        ...updates,
        updatedAt:
          new Date().toISOString(),
      };

    });

  savePropertyRequests(updatedRequests);

  return updatedRequests.find(
    (request) =>
      request.id === requestId
  );
}


/* =========================================================
   GET REQUESTS FOR USER
========================================================= */

export function getRequestsForUser(
  userId
) {

  return getPropertyRequests().filter(
    (request) =>
      request.requesterId === userId
  );

}


/* =========================================================
   GET PENDING HOA REQUESTS
========================================================= */

export function getPendingHOARequests() {

  return getPropertyRequests().filter(
    (request) =>
      request.status ===
      "Pending HOA Review"
  );

}


/* =========================================================
   APPROVE REQUEST
========================================================= */

export function approvePropertyRequest(
  requestId
) {

  return updatePropertyRequest(
    requestId,
    {
      status:
        "Approved - Awaiting Agent Assignment",

      hoaDecision:
        "Approved",

      rejectionReason:
        "",
    }
  );

}


/* =========================================================
   REJECT REQUEST
========================================================= */

export function rejectPropertyRequest(
  requestId,
  reason
) {

  return updatePropertyRequest(
    requestId,
    {
      status:
        "Rejected",

      hoaDecision:
        "Rejected",

      rejectionReason:
        reason ||
        "Property request was not approved.",
    }
  );

}


/* =========================================================
   ASSIGN ESTATE AGENT
========================================================= */

export function assignEstateAgent(
  requestId,
  agentId,
  agentName
) {

  return updatePropertyRequest(
    requestId,
    {
      assignedAgentId:
        agentId,

      assignedAgentName:
        agentName,

      assignedAt:
        new Date().toISOString(),

      status:
        "Assigned to Estate Agent",
    }
  );

}


/* =========================================================
   EXPORT STORAGE KEY
========================================================= */

export { STORAGE_KEY };
