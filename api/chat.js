export default async function handler(req, res) {

  // Solo aceptamos solicitudes POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido"
    });
  }

  try {

    // Obtener el mensaje enviado desde la página
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "No se recibió ningún mensaje"
      });
    }

    // Conectar con Gemini
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
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

Tu función es atender clientes interesados en comprar vehículos.

Debes:

- Responder preguntas sobre vehículos.
- Ayudar al cliente a encontrar un vehículo.
- Preguntar por presupuesto, tipo de vehículo y preferencias cuando sea necesario.
- Ser amable, profesional y claro.
- Responder siempre en español.
- No inventar precios, vehículos, características o información que no conozcas.
- Si no tienes una información, debes decirlo claramente.

Actualmente eres el asistente de un concesionario de demostración ubicado en Barranquilla, Colombia.

Tu objetivo es ayudar al cliente y convertir conversaciones en posibles clientes interesados.
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

    // Convertir respuesta de Gemini a JSON
    const data = await response.json();

    // Si Gemini devuelve un error
    if (!response.ok) {

      console.error("ERROR DE GEMINI:", data);

      return res.status(500).json({
        error: "Gemini rechazó la solicitud",
        details: data
      });

    }

    // Obtener respuesta generada por Gemini
    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {

      console.error(
        "GEMINI NO DEVOLVIÓ TEXTO:",
        data
      );

      return res.status(500).json({
        error: "Gemini no devolvió una respuesta"
      });

    }

    // Enviar respuesta al navegador
    return res.status(200).json({
      answer: answer
    });

  } catch (error) {

    console.error(
      "ERROR DEL SERVIDOR:",
      error
    );

    return res.status(500).json({
      error: "Error interno del servidor",
      details: error.message
    });

  }

}
