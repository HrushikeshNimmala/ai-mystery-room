
async function testCreateCase() {
  try {
    const response = await fetch("http://localhost:5000/api/cases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        difficulty: "easy",
        category: "General Mystery",
      }),
    });

    const data = await response.json();

    console.log("HTTP status:", response.status);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Request failed:", error.message);
  }
}

testCreateCase();
