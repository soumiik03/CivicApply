export const mockRepair = {
  success: true,
  mode: "repair",
  status: "repaired",
  repaired: true,

  failedStep: {
    field: "Full Name",
    selector: "#fullName",
    reason: "Selector not found",
  },

  repairEvents: [
    {
      type: "failed",
      message: "Workflow step failed",
      description: "Stored selector could not be found.",
    },
    {
      type: "inspecting",
      message: "Inspecting current page",
      description: "Webcmd is analysing available form fields.",
    },
    {
      type: "searching",
      message: "Searching for replacement",
      description: "Matching field labels and page structure.",
    },
    {
      type: "repaired",
      message: "Replacement selector found",
      description: "A compatible field was discovered.",
    },
  ],

  repair: {
    oldSelector: "#fullName",
    newSelector: "#applicantName",
  },

  previousVersion: 1,
  version: 2,

  retryStatus: "success",
};