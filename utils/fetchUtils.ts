export async function handleFetchError(response: Response) {
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json();
      console.error('Request failed:', data.error);
      throw new Error(data.error || 'An unknown error occurred');
    } else {
      const text = await response.text();
      console.error('Request failed with non-JSON response:', text);
      if (text.includes("<!DOCTYPE html>")) {
        throw new Error('The server returned an HTML page instead of JSON. This might indicate a server error.');
      } else {
        throw new Error('An unknown error occurred. Please try again later.');
      }
    }
  }
  return response.json();
}

