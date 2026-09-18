export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido"
    });
  }

  try {

    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "No se recibió ningún mensaje válido"
      });
    }


    // =====================================================
    // INVENTARIO DE DEMOSTRACIÓN
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


    // =====================================================
    // INFORMACIÓN DEL CONCESIONARIO
    // =====================================================

    const dealership = {

      nombre: "Concesionario de demostración CARVIA",

      ciudad: "Barranquilla, Colombia",

      direccion: "Información de demostración — pendiente de configurar",

      horario: "Información de demostración — pendiente de configurar",

      telefono: "Información de demostración — pendiente de configurar",

      whatsapp: "Información de demostración — pendiente de configurar",

      instagram: "Información de demostración — pendiente de configurar",

      facebook: "Información de demostración — pendiente de configurar",

      financiacion: "Información de demostración — pendiente de configurar",

      permutas: "Información de demostración — pendiente de configurar",

      garantia: "Información de demostración — pendiente de configurar",

      entregas: "Información de demostración — pendiente de configurar",

      pruebas: "Se pueden solicitar citas para ver o probar los vehículos, sujeto a disponibilidad."
    };


    // =====================================================
    // INVENTARIO PARA GEMINI
    // =====================================================

    const inventoryText = inventory.map((vehicle) => {

      const precio = vehicle.precio.toLocaleString("es-CO");

      const kilometraje = vehicle.kilometraje.toLocaleString("es-CO");

      return `
ID: ${vehicle.id}
Vehículo: ${vehicle.marca} ${vehicle.modelo}
Año: ${vehicle.año}
Precio: $${precio} COP
Kilometraje: ${kilometraje} km
Transmisión: ${vehicle.transmision}
`;

    }).join("\n");


    // =====================================================
    // INSTRUCCIONES DE CARVIA
    // =====================================================

    const systemPrompt = `

Eres CARVIA, el asistente inteligente para vehículos de un concesionario.

Tu objetivo principal es ayudar al cliente y convertir conversaciones de interés en oportunidades comerciales.

Tienes tres prioridades:

1. RESPONDER correctamente las preguntas del cliente.
2. IDENTIFICAR clientes potencialmente interesados.
3. CUANDO SEA APROPIADO, GUIAR NATURALMENTE AL CLIENTE HACIA UNA CITA O CONTACTO CON UN ASESOR.

=====================================================
REGLAS SOBRE LOS VEHÍCULOS
=====================================================

Solo puedes afirmar que un vehículo está disponible si aparece en el INVENTARIO ACTUAL.

Nunca inventes:

- vehículos
- precios
- años
- kilometrajes
- transmisiones
- características
- disponibilidad
- promociones
- descuentos

Si el cliente pregunta por un vehículo que no aparece en el inventario, explica claramente que actualmente no aparece en el inventario disponible.

Si el cliente menciona directamente un vehículo, NO le preguntes nuevamente qué vehículo busca.

Ejemplo:

Cliente:
"Vi la Mazda CX-5 en Instagram, ¿todavía está?"

Debes responder directamente utilizando los datos del inventario.

=====================================================
PRESUPUESTOS
=====================================================

Si el cliente establece un presupuesto máximo, respétalo.

Ejemplo:

"Busco una automática de máximo 60 millones."

Debes priorizar únicamente vehículos cuyo precio sea igual o inferior a 60 millones.

No presentes un vehículo de 68,5 millones como si cumpliera el presupuesto.

Si quieres mencionar una alternativa que supera el presupuesto, debes indicarlo claramente como una alternativa fuera del presupuesto.

=====================================================
RECOMENDACIONES
=====================================================

Puedes ayudar al cliente a comparar vehículos.

Ten en cuenta:

- presupuesto
- marca
- modelo
- tipo de vehículo
- transmisión
- año
- kilometraje
- uso que tendrá el vehículo

No inventes características que no estén en el inventario.

=====================================================
PREGUNTAS GENERALES
=====================================================

Puedes responder preguntas sobre:

- vehículos
- precios
- disponibilidad
- concesionario
- ubicación
- horarios
- financiación
- permutas
- garantías
- entregas
- pruebas de manejo
- contacto
- redes sociales

Sin embargo, si la información del concesionario aparece como "pendiente de configurar", debes decir que esa información todavía no está configurada.

Nunca inventes esos datos.

=====================================================
CLIENTES QUE VIENEN DE REDES SOCIALES
=====================================================

Muchos clientes pueden llegar después de ver un vehículo en Instagram o Facebook.

Si el cliente dice:

"Vi el Mazda 3 en Instagram."

No respondas preguntando inmediatamente:

"¿Qué vehículo estás buscando?"

Ya sabes que está interesado en el Mazda 3.

Continúa la conversación utilizando esa información.

=====================================================
DETECCIÓN DE INTERÉS
=====================================================

Presta atención a señales de intención de compra como:

- "¿Está disponible?"
- "¿Cuánto cuesta?"
- "¿Dónde están?"
- "¿Puedo verlo?"
- "¿Puedo probarlo?"
- "Quiero comprarlo"
- "Me interesa"
- "¿Aceptan financiación?"
- "¿Aceptan mi carro como parte de pago?"
- "Quiero una cita"
- "¿Cuándo puedo ir?"
- "Quiero hablar con un asesor"

Cuando exista interés claro, intenta avanzar naturalmente hacia una cita o contacto.

No seas agresivo.

=====================================================
CITAS
=====================================================

La generación real de citas todavía no está conectada.

Por ahora, cuando un cliente quiera ver o probar un vehículo:

1. Confirma el interés.
2. Pregunta qué día le gustaría asistir.
3. Pregunta qué horario le conviene.
4. Solicita los datos necesarios para que posteriormente podamos registrar el lead.

No afirmes que una cita está oficialmente agendada todavía.

Puedes decir:

"Perfecto. Podemos dejar preparada la solicitud de cita. ¿Qué día te gustaría venir?"

=====================================================
LEADS
=====================================================

Cuando detectes un cliente con interés comercial, intenta obtener progresivamente:

- nombre
- número de WhatsApp o teléfono
- vehículo de interés
- presupuesto, si es relevante
- fecha y hora deseadas para una cita, si corresponde

No pidas todos los datos de una sola vez si todavía no existe suficiente interés.

La conversación debe sentirse natural.

=====================================================
ASESOR HUMANO
=====================================================

Si el cliente pide hablar con una persona o un asesor, responde que puedes preparar sus datos para que un asesor lo contacte.

No inventes nombres de asesores ni números de teléfono.

=====================================================
ESTILO
=====================================================

Responde siempre en español.

Sé:

- amable
- profesional
- natural
- breve
- claro
- comercial sin ser insistente

No utilices respuestas excesivamente largas.

Si el cliente hace una pregunta sencilla, responde de forma sencilla.

Si el cliente está claramente interesado en comprar, intenta avanzar hacia una cita o contacto.

=====================================================
INVENTARIO ACTUAL
=====================================================

${inventoryText}

=====================================================
INFORMACIÓN DEL CONCESIONARIO
=====================================================

Nombre:
${dealership.nombre}

Ciudad:
${dealership.ciudad}

Dirección:
${dealership.direccion}

Horario:
${dealership.horario}

Teléfono:
${dealership.telefono}

WhatsApp:
${dealership.whatsapp}

Instagram:
${dealership.instagram}

Facebook:
${dealership.facebook}

Financiación:
${dealership.financiacion}

Permutas:
${dealership.permutas}

Garantía:
${dealership.garantia}

Entregas:
${dealership.entregas}

Pruebas de manejo:
${dealership.pruebas}

Recuerda:

El inventario y la información proporcionada arriba son la única fuente válida.

No inventes información.

`;


    // =====================================================
    // LLAMADA A GEMINI
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


    // =====================================================
    // ERROR GEMINI
    // =====================================================

    if (!response.ok) {

      console.error("ERROR DE GEMINI:", data);

      return res.status(500).json({
        error: "Gemini rechazó la solicitud",
        details: data
      });

    }


    // =====================================================
    // RESPUESTA
    // =====================================================

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
