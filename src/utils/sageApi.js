export async function querySage({ messages, contextCurricula }) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_groq_api_key_here") {
    throw new Error("Groq API Key is missing. Please set VITE_GROQ_API_KEY in your .env file.");
  }

  const systemPrompt = `You are Sage, an intelligent academic study companion. Your ONLY purpose is to help students with learning roadmaps, curriculum planning, study strategies, and educational guidance. You have been provided with the student's current curriculum as context. Generate integrated learning roadmaps that show how the new topic fits alongside the existing semester schedule. If asked anything unrelated to education, learning, study planning, or curriculum topics — respond with exactly: 'I'm Sage, your academic study companion. I can only help with learning roadmaps, curriculum planning, and study guidance. Please ask me something related to your studies!' Do NOT answer coding problems, general knowledge questions, jokes, personal questions, or any off-topic requests under any circumstances.

You MUST respond ONLY with a valid JSON object matching the following structure:
{
  "type": "message" | "roadmap",
  "message": "Use this field to respond to conversational queries, general study strategy questions, or when refusing off-topic requests with the exact required refusal string.",
  "roadmap": {
    "roadmapTitle": "Title of the integrated learning roadmap",
    "overview": "Short summary explaining how the new topic/skill fits into the student's existing curriculum context",
    "weeklyPlan": [
      {
        "week": "Week 1",
        "focus": "Topic focus",
        "tasks": ["task 1", "task 2"],
        "resources": ["suggested resource/link 1", "resource 2"]
      }
    ],
    "integrationPoints": [
      {
        "semesterNumber": 1,
        "courseName": "Course Name from current curriculum",
        "connection": "How this new topic supplements or integrates with this course"
      }
    ],
    "estimatedDuration": "e.g. 8 weeks",
    "tips": ["study tip 1", "study tip 2"]
  }
}

If the user is asking a normal question or you are refusing, set "type" to "message" and populate the "message" field. Set "roadmap" to null.
If the user is asking to learn a new topic, create a roadmap. Set "type" to "roadmap", populate the "roadmap" field, and set "message" to "".
`;

  // Inject current curriculum contexts into the user prompt or system prompt context
  let formattedContext = "No curriculum context provided.";
  if (contextCurricula && contextCurricula.length > 0) {
    formattedContext = contextCurricula.map((c, i) => {
      return `[Curriculum ${i + 1} Context: Skill: ${c.skill}, Level: ${c.level}, Semesters: ${c.semesters}\nJSON Details:\n${JSON.stringify(c.generatedData)}]`;
    }).join("\n\n");
  }

  // We append context to the system message or as a separate system-like role message.
  const apiMessages = [
    { role: "system", content: systemPrompt },
    { role: "system", content: `Here is the current student curriculum context that you MUST refer to: \n${formattedContext}` },
    ...messages.map(m => ({
      role: m.role,
      content: m.content
    }))
  ];

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: apiMessages,
        response_format: { type: "json_object" },
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Sage AI Query Error:", error);
    throw error;
  }
}
