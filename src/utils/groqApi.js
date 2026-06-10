export async function generateCurriculum({ skill, level, semesters, weeklyHours, industryFocus }) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_groq_api_key_here") {
    throw new Error("Groq API Key is missing. Please set VITE_GROQ_API_KEY in your .env file.");
  }

  const systemPrompt = "You are an expert educational curriculum designer. Respond ONLY with valid JSON. No markdown, no explanation.";

  const userPrompt = `
Generate a comprehensive, academic-grade curriculum for learning "${skill}" at the "${level}" level, structured across ${semesters} semesters.
${weeklyHours ? `Design it for approximately ${weeklyHours} hours of weekly workload.` : ""}
${industryFocus ? `Align the curriculum with the industry focus area: "${industryFocus}".` : ""}

The output must be a single valid JSON object containing exactly the following structure, with no wrapper markdown, no code block backticks (like \`\`\`json), and no extra comments:

{
  "skill": "${skill}",
  "level": "${level}",
  "semesters": ${semesters},
  "weeklyHours": "${weeklyHours || "N/A"}",
  "industryFocus": "${industryFocus || "General"}",
  "semestersData": [
    {
      "semesterNumber": 1,
      "courses": [
        {
          "courseName": "string",
          "courseCode": "string (e.g. CS-101)",
          "credits": number (e.g. 3 or 4),
          "weeklyHours": number,
          "description": "string describing the course",
          "topics": ["array of 4-6 specific topics"],
          "learningOutcomes": ["array of 3-4 learning outcomes"],
          "learningResources": [
            {
              "title": "string (e.g. name of book, course, or doc)",
              "url": "string (valid URL or resource link)",
              "type": "string (e.g. 'Documentation', 'Course', 'Book', 'Video')"
            }
          ]
        }
      ]
    }
  ],
  "capstoneProject": {
    "title": "string",
    "description": "string",
    "deliverables": ["array of 3-4 deliverables"]
  }
}

Ensure there are exactly ${semesters} semester items in the semestersData array, and each semester has 2-4 comprehensive courses. Ensure each course has 2-3 specific, high-quality, working, real-world learning resources. These resources MUST consist of official documentation links or free YouTube tutorial playlists/channels (like freeCodeCamp, Traversy Media, Programming with Mosh, etc.) - DO NOT recommend Coursera, Udemy, or other paid online courses under any circumstances. Ensure all fields are filled out in detail.
`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    
    // Parse response
    const parsedData = JSON.parse(resultText);
    return parsedData;
  } catch (error) {
    console.error("Groq Curriculum Generation Error:", error);
    throw error;
  }
}
