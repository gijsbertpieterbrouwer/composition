
export function deviceIsDesktop(): boolean {

    // Use a regular expression to test the userAgent string for common mobile device identifiers.
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        ? false // If any of the identifiers are found, return 'Mobile'.
        : true; // Otherwise, return 'Desktop'.

}

