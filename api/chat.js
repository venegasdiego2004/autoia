export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido"
    });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "No se recibió ningún mensaje"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },

        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: `
Eres AUTOIA, un asistente virtual especializado en concesionarios de vehículos.

Tu trabajo es ayudar a los clientes a encontrar vehículos,
responder preguntas y captar clientes potenciales.

Actualmente estás trabajando con un concesionario de demostración
ubicado en Barranquilla, Colombia.

Sé amable, profesional y claro.

No inventes información sobre vehículos que no conozcas.

Si no tienes una información, dilo claramente.

Responde siempre en español.
`
              }
            ]
          },

          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("ERROR DE GEMINI:", data);

      return res.status(500).json({
        error: "Gemini rechazó la solicitud",
        details: data
      });
    }

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No pude generar una respuesta.";

    return res.status(200).json({
      answer
    });

  } catch (error) {

    console.error("ERROR DEL SERVIDOR:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
      details: error.message
    });
  }
}
