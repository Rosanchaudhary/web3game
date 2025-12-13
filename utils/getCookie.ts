  // Helper to read cookies
  export const getCookie = (key: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(
      new RegExp("(^| )" + key + "=([^;]+)")
    );
    return match ? match[2] : null;
  };