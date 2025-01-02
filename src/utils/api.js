export async function fetchSanityData() {
  try {
    const response = await fetch('/api/fetchData');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
} 