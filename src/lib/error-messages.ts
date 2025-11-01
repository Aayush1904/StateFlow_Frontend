/**
 * Converts technical HTTP error codes and messages into user-friendly error messages
 */

export const getErrorMessage = (error: any): string => {
  // If error has a user-friendly message, use it
  if (error?.response?.data?.message) {
    const backendMessage = error.response.data.message;
    // Check if it's already user-friendly (doesn't contain technical codes)
    if (!/^\d{3}|404|500|401|403/i.test(backendMessage)) {
      return backendMessage;
    }
  }

  const status = error?.response?.status || error?.status;
  const errorCode = error?.errorCode || error?.response?.data?.errorCode;
  const message = error?.message || error?.response?.data?.message || "";

  // Handle specific error codes first
  if (errorCode) {
    switch (errorCode) {
      case "VALIDATION_ERROR":
        return "Please check your input and try again.";
      case "RESOURCE_NOT_FOUND":
        return "The item you're looking for doesn't exist or has been removed.";
      case "ACCESS_UNAUTHORIZED":
      case "UNAUTHORIZED":
        return "You don't have permission to perform this action.";
      case "FORBIDDEN":
        return "You don't have permission to access this resource.";
      case "INTERNAL_SERVER_ERROR":
        return "Something went wrong on our end. Please try again later.";
    }
  }

  // Handle HTTP status codes
  if (status) {
    switch (status) {
      case 400:
        return "Invalid request. Please check your input and try again.";
      case 401:
        return "Your session has expired. Please sign in again.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The page or resource you're looking for doesn't exist.";
      case 409:
        return "This action conflicts with existing data. Please refresh and try again.";
      case 422:
        return "The information you provided is invalid. Please check and try again.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
      case 502:
      case 503:
      case 504:
        return "Our servers are experiencing issues. Please try again later.";
      default:
        if (status >= 400 && status < 500) {
          return "There was a problem with your request. Please try again.";
        } else if (status >= 500) {
          return "Something went wrong on our end. Please try again later.";
        }
    }
  }

  // Handle network errors
  if (!error?.response) {
    if (message?.includes("timeout") || message?.includes("TIMEOUT")) {
      return "The request took too long. Please check your connection and try again.";
    }
    if (message?.includes("Network Error") || message?.includes("network")) {
      return "Unable to connect. Please check your internet connection and try again.";
    }
    return "Unable to connect to the server. Please check your internet connection.";
  }

  // Handle specific error messages
  if (message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("workspace") && lowerMessage.includes("undefined")) {
      return "Please select a workspace first before creating a project.";
    }
    if (lowerMessage.includes("unauthorized") || lowerMessage.includes("401")) {
      return "Your session has expired. Please sign in again.";
    }
    if (lowerMessage.includes("not found") || lowerMessage.includes("404")) {
      return "The item you're looking for doesn't exist.";
    }
  }

  // Fallback message
  return "Something went wrong. Please try again.";
};

/**
 * Gets a user-friendly error title based on the error
 */
export const getErrorTitle = (error: any): string => {
  const status = error?.response?.status || error?.status;
  const errorCode = error?.errorCode || error?.response?.data?.errorCode;

  if (errorCode === "VALIDATION_ERROR") {
    return "Validation Error";
  }
  if (errorCode === "ACCESS_UNAUTHORIZED" || errorCode === "UNAUTHORIZED") {
    return "Access Denied";
  }

  if (status === 401) {
    return "Session Expired";
  }
  if (status === 403) {
    return "Permission Denied";
  }
  if (status === 404) {
    return "Not Found";
  }
  if (status >= 500) {
    return "Server Error";
  }

  return "Error";
};

