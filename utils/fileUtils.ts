
/**
 * Converts a File object to a base64 encoded string, without the data URL prefix.
 * @param file The File object to convert.
 * @returns A Promise that resolves with the base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Strip the data URL prefix (e.g., "data:image/png;base64,")
            const base64String = result.split(',')[1];
            if (base64String) {
                resolve(base64String);
            } else {
                reject(new Error('Failed to extract base64 string from file.'));
            }
        };
        reader.onerror = error => reject(error);
    });
};
