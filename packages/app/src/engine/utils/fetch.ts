// Example POST method implementation:
export async function postData(url = "", data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

export async function uploadMultiple(
  formData: FormData,
  api: string = "upload"
) {
  try {
    const response = await fetch(`//${location.hostname}:3000/${api}`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    return result;
  } catch (error) {
    console.error("Error:", error);
  }
}
