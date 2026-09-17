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

    // INVENTARIO DEL CONCESIONARIO
    const inventory = [
      {
        marca: "Mazda",
        modelo: "CX-5",
        año: 2023,
        precio: "$89.500.000 COP",
        kilometraje: "48.000 km",
        transmision: "Automática"
      },
      {
        marca: "Toyota",
        modelo: "Corolla",
        año: 2022,
        precio: "$72.900.000 COP",
        kilometraje: "39.000 km",
        transmision: "Automática"
      },
      {
        marca: "Kia",
        modelo: "Sportage",
        año: 2021,
        precio: "$68.500.000 COP",
        kilometraje: "52.000 km",
        transmision: "Automática"
      },
      {
        marca: "Renault",
        modelo: "Duster",
        año: 2022,
        precio: "$57.900.000 COP",
        kilometraje: "41.000 km",
        transmision: "Manual"
      },
      {
        marca: "Mazda",
        modelo: "3",
        año: 2020,
        precio: "$59.900.000 COP",
        kilometraje: "61.000 km",
        transmision: "Automática"
      }
    ];

    const inventoryText = inventory
      .map((vehicle, index) => `
${index + 1}. ${vehicle.marca} ${vehicle.modelo}
   Año: ${vehicle.año}
   Precio: ${vehicle.precio}
   Kilometraje: ${vehicle.kilometraje}
   Transmisión: ${vehicle.transmision}
`)
      .join("\n");

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

Tu función es atender clientes interesados en comprar vehículos y ayudarlos a encontrar una opción adecuada.

IMPORTANTE:

Solo puedes afirmar que un vehículo está disponible si aparece en el inventario que se proporciona abajo.

Nunca inventes:
- vehículos
- precios
- años
- kilometrajes
- transmisiones
- características
- disponibilidad

Si el cliente pregunta por un vehículo que NO aparece en el inventario, debes decir claramente que actualmente no aparece en el inventario disponible.

Si el cliente pregunta "¿qué vehículos tienen?", muestra las opciones disponibles de manera clara y ordenada.

Si el cliente indica un presupuesto, intenta mostrar las opciones del inventario que estén dentro de ese presupuesto.

Si el cliente indica una marca, modelo, tipo de vehículo o transmisión, utiliza esa información para filtrar o recomendar las opciones correspondientes.

Si faltan datos para recomendar un vehículo, puedes preguntar por:
- presupuesto
- tipo de vehículo
- marca preferida
- transmisión
- uso que le dará al vehículo

Sé amable, profesional, natural y breve.

Responde siempre en español.

El concesionario de demostración está ubicado en Barranquilla, Colombia.

INVENTARIO ACTUAL:

${inventoryText}

Recuerda: este inventario es la única fuente válida para hablar de los vehículos disponibles.
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
