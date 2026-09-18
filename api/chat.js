export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido"
    });
  }

  try {

    const {
      message,
      history = [],
      lead = {}
    } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "No se recibió ningún mensaje válido"
      });
    }

    // =====================================================
    // INVENTARIO
    // =====================================================

    const inventory = [
      {
        id: 1,
        marca: "Mazda",
        modelo: "CX-5",
        año: 2023,
        precio: 89500000,
        kilometraje: 48000,
        transmision: "Automática"
      },
      {
        id: 2,
        marca: "Toyota",
        modelo: "Corolla",
        año: 2022,
        precio: 72900000,
        kilometraje: 39000,
        transmision: "Automática"
      },
      {
        id: 3,
        marca: "Kia",
        modelo: "Sportage",
        año: 2021,
        precio: 68500000,
        kilometraje: 52000,
        transmision: "Automática"
      },
      {
        id: 4,
        marca: "Renault",
        modelo: "Duster",
        año: 2022,
        precio: 57900000,
        kilometraje: 41000,
        transmision: "Manual"
      },
      {
        id: 5,
        marca: "Mazda",
        modelo: "3",
        año: 2020,
        precio: 59900000,
        kilometraje: 61000,
        transmision: "Automática"
      }
    ];

    const inventoryText = inventory.map(vehicle => `
ID: ${vehicle.id}
Vehículo: ${vehicle.marca} ${vehicle.modelo}
Año: ${vehicle.año}
Precio: $${vehicle.precio.toLocaleString("es-CO")} COP
Kilometraje: ${vehicle.kilometraje.toLocaleString("es-CO")} km
Transmisión: ${vehicle.transmision}
`).join("\n");

    // =====================================================
    // INSTRUCCIONES CARVIA
    // =====================================================

    const systemPrompt = `

Eres CARVIA, el asistente inteligente para vehículos de un concesionario.

Tu objetivo es atender clientes, responder preguntas sobre vehículos y detectar oportunidades comerciales.

INVENTARIO ACTUAL:
${inventoryText}

=====================================================
REGLAS
=====================================================

Solo puedes afirmar que un vehículo está disponible si aparece en el inventario.

Nunca inventes:
- vehículos
- precios
- disponibilidad
- kilometraje
- años
- transmisiones
- promociones
- características

Si el cliente menciona un vehículo concreto, responde sobre ese vehículo directamente.

Si establece un presupuesto máximo, respétalo.

Puedes comparar vehículos usando únicamente la información disponible.

=====================================================
LEADS
=====================================================

Un cliente es de ALTA PRIORIDAD 🔴 cuando muestra intención clara de:

- comprar
- visitar el concesionario
- probar un vehículo
- solicitar una visita
- hablar con un asesor
- recibir información para comprar

Cuando exista intención clara de visita o prueba de manejo, CARVIA debe recopilar progresivamente:

1. Nombre
2. Apellido
3. WhatsApp o teléfono
4. Vehículo de interés
5. Día solicitado
6. Hora solicitada

NO pidas todos los datos de golpe.

Hazlo de manera natural.

Si ya tienes un dato, NO lo vuelvas a pedir.

Por ejemplo, si ya sabes el vehículo, no preguntes nuevamente qué vehículo quiere.

=====================================================
SOLICITUD DE VISITA
=====================================================

IMPORTANTE:

CARVIA NO CONFIRMA CITAS.

El cliente solamente está solicitando una fecha y hora.

Cuando todos los datos estén completos, debes decir algo equivalente a:

"Perfecto, ya tengo tus datos. Voy a enviar tu solicitud al concesionario. Un asesor se comunicará contigo para confirmar la disponibilidad y coordinar la visita. La fecha y hora todavía no están confirmadas."

=====================================================
DATOS ACTUALES DEL LEAD
=====================================================

Nombre:
${lead.nombre || "No proporcionado"}

Apellido:
${lead.apellido || "No proporcionado"}

Teléfono / WhatsApp:
${lead.telefono || "No proporcionado"}

Vehículo:
${lead.vehiculo || "No proporcionado"}

Presupuesto:
${lead.presupuesto || "No proporcionado"}

Fecha solicitada:
${lead.fecha || "No proporcionada"}

Hora solicitada:
${lead.hora || "No proporcionada"}

Interés comercial:
${lead.interes || "No determinado"}

=====================================================
INFORMACIÓN DEL CONCESIONARIO
=====================================================

Ciudad: Barranquilla, Colombia

La dirección, horario, teléfono, WhatsApp, financiación, permutas,
garantías y redes sociales todavía están pendientes de configuración.

No inventes estos datos.

=====================================================
RESPUESTA
=====================================================

Responde siempre en español.

Sé natural, amable, profesional y breve.

No hagas preguntas innecesarias.

=====================================================
FORMATO DE RESPUESTA
=====================================================

Debes responder ÚNICAMENTE con un JSON válido:

{
  "reply": "respuesta que verá el cliente",
  "lead": {
    "nombre": null,
    "apellido": null,
    "telefono": null,
    "vehiculo": null,
    "presupuesto": null,
    "fecha": null,
    "hora": null,
    "interes": "bajo"
  }
}

IMPORTANTE:

Conserva los datos que ya existen.

Si el cliente proporciona un nuevo dato, actualízalo.

Los niveles de interés son:

"bajo" = preguntas generales.

"medio" = pregunta por precio, financiación, kilometraje o disponibilidad.

"alto" = quiere comprar, visitar, probar un vehículo o hablar con un asesor.

Si un dato no está disponible, usa null.

No agregues texto fuera del JSON.

`;

    // =====================================================
    // HISTORIAL
    // =====================================================

    const contents = [];

    for (const item of history) {

      if (
        item &&
        (item.role === "user" || item.role === "model") &&
        typeof item.text === "string"
      ) {
        contents.push({
          role: item.role,
          parts: [
            {
              text: item.text
            }
          ]
        });
      }

    }

    contents.push({
      role: "user",
      parts: [
        {
          text: message
        }
      ]
    });

    // =====================================================
    // GEMINI
    // =====================================================

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
                text: systemPrompt
              }
            ]
          },

          contents: contents,

          generationConfig: {
            responseMimeType: "application/json"
          }

        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error("ERROR GEMINI:", data);

      return res.status(500).json({
        error: "Gemini rechazó la solicitud"
      });

    }

    const rawAnswer =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawAnswer) {

      return res.status(500).json({
        error: "Gemini no devolvió una respuesta"
      });

    }

    // =====================================================
    // PROCESAR JSON
    // =====================================================

    let result;

    try {

      result = JSON.parse(rawAnswer);

    } catch (error) {

      console.error("JSON INVÁLIDO DE GEMINI:", rawAnswer);

      return res.status(500).json({
        error: "Respuesta inválida de CARVIA"
      });

    }

    return res.status(200).json({

      answer: result.reply || "¿En qué puedo ayudarte?",

      lead: {
        nombre: result.lead?.nombre || lead.nombre || null,
        apellido: result.lead?.apellido || lead.apellido || null,
        telefono: result.lead?.telefono || lead.telefono || null,
        vehiculo: result.lead?.vehiculo || lead.vehiculo || null,
        presupuesto: result.lead?.presupuesto || lead.presupuesto || null,
        fecha: result.lead?.fecha || lead.fecha || null,
        hora: result.lead?.hora || lead.hora || null,
        interes: result.lead?.interes || lead.interes || "bajo"
      }

    });

  } catch (error) {

    console.error("ERROR DEL SERVIDOR:", error);

    return res.status(500).json({
      error: "Error interno del servidor"
    });

  }

}
