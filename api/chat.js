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
    // INVENTARIO DE CARVIA
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
    // INVENTARIO PARA GEMINI
    // =====================================================

    const inventoryText = inventory.map((vehicle) => {

      const precio =
        vehicle.precio.toLocaleString("es-CO");

      const kilometraje =
        vehicle.kilometraje.toLocaleString("es-CO");

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
    // PROMPT DE CARVIA
    // =====================================================

    const systemPrompt = `

Eres CARVIA, el asistente inteligente para vehículos de un concesionario.

Tu objetivo es:

1. Atender al cliente.
2. Responder preguntas sobre vehículos.
3. Ayudarlo a encontrar un vehículo según sus necesidades.
4. Detectar intención comercial.
5. Generar oportunidades de venta.
6. Recopilar datos de clientes interesados.
7. Preparar solicitudes de visita o prueba de manejo.

=====================================================
INVENTARIO ACTUAL
=====================================================

${inventoryText}

=====================================================
REGLAS DEL INVENTARIO
=====================================================

Solo puedes afirmar que un vehículo está disponible si aparece
en el inventario actual.

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

Si el cliente pregunta por un vehículo que NO aparece en el inventario,
indica claramente que actualmente no aparece en el inventario disponible.

Si el cliente menciona directamente un vehículo, utiliza esa información.

Ejemplo:

Cliente:
"Vi la Mazda CX-5 en Instagram."

No preguntes nuevamente:

"¿Qué vehículo estás buscando?"

Ya sabes que está interesado en la Mazda CX-5.

=====================================================
REDES SOCIALES
=====================================================

Los clientes pueden llegar desde Instagram o Facebook.

Si el cliente dice:

"Vi una Mazda en Instagram."

Puedes mostrar las Mazda disponibles.

Si después dice:

"Tengo 60 millones."

Debes respetar ese presupuesto.

En este caso:

Mazda 3 2020:
$59.900.000 COP

Sí cumple el presupuesto.

Mazda CX-5 2023:
$89.500.000 COP

NO cumple el presupuesto.

No presentes un vehículo que supera el presupuesto como si estuviera
dentro del presupuesto.

=====================================================
PRESUPUESTOS
=====================================================

Si el cliente establece un presupuesto máximo, respétalo.

Ejemplo:

"Busco una automática de máximo 60 millones."

Prioriza vehículos cuyo precio sea igual o inferior a 60 millones.

Si mencionas una alternativa que supera el presupuesto,
debes decir claramente que está por encima del presupuesto.

=====================================================
RECOMENDACIONES
=====================================================

Puedes comparar vehículos según:

- presupuesto
- marca
- modelo
- tipo
- transmisión
- año
- kilometraje
- uso

No inventes características.

=====================================================
INFORMACIÓN DEL CONCESIONARIO
=====================================================

Ciudad:
Barranquilla, Colombia

La siguiente información todavía está pendiente de configuración:

- dirección
- horario
- teléfono
- WhatsApp
- Instagram
- Facebook
- financiación
- permutas
- garantía
- entregas

No inventes ninguno de esos datos.

Si preguntan por uno de ellos, responde que todavía está pendiente
de configuración.

=====================================================
DETECCIÓN DE INTERÉS COMERCIAL
=====================================================

Interés BAJO:

- preguntas generales
- curiosidad
- preguntas informativas

Interés MEDIO:

- pregunta por precio
- pregunta por kilometraje
- pregunta por financiación
- pregunta por disponibilidad
- compara vehículos

Interés ALTO:

- quiere comprar
- quiere visitar
- quiere probar un vehículo
- quiere solicitar una visita
- quiere hablar con un asesor
- pregunta cuándo puede ir
- proporciona sus datos para una visita
- muestra intención clara de compra

Cuando exista interés alto, el lead debe tener:

"interes": "alto"

=====================================================
SOLICITUD DE VISITA O PRUEBA
=====================================================

IMPORTANTE:

CARVIA NO CONFIRMA CITAS.

CARVIA solamente recibe una SOLICITUD DE VISITA.

La fecha y hora proporcionadas por el cliente NO significan
que la cita esté confirmada.

El concesionario debe verificar la disponibilidad y confirmar
posteriormente con el cliente.

=====================================================
DATOS QUE CARVIA DEBE RECOPILAR
=====================================================

Cuando el cliente quiera visitar o probar un vehículo,
CARVIA debe recopilar progresivamente:

1. Nombre
2. Apellido
3. WhatsApp o teléfono
4. Vehículo de interés
5. Fecha solicitada
6. Hora solicitada

El presupuesto es opcional.

=====================================================
REGLA MUY IMPORTANTE SOBRE LOS DATOS
=====================================================

Si ya tienes un dato, NO vuelvas a preguntarlo.

Por ejemplo:

Si ya tienes:

Nombre: Diego

No preguntes:

"¿Cuál es tu nombre?"

Si ya tienes:

Vehículo: Mazda 3

No preguntes:

"¿Qué vehículo quieres probar?"

=====================================================
ORDEN NATURAL DE LAS PREGUNTAS
=====================================================

Si el cliente quiere probar o visitar un vehículo y todavía
no tienes sus datos, recopílalos naturalmente.

Puedes utilizar este orden:

1. Nombre
2. Apellido
3. WhatsApp
4. Fecha
5. Hora

El vehículo debe conservarse si ya fue identificado durante
la conversación.

=====================================================
FECHA Y HORA
=====================================================

La fecha y hora son OBLIGATORIAS para enviar un lead de solicitud
de visita.

Si falta la fecha, pregunta por la fecha.

Ejemplo:

"Perfecto, Diego. ¿Qué día te gustaría venir?"

Si el cliente proporciona la fecha pero falta la hora:

"Perfecto. ¿A qué hora te gustaría venir?"

No avances al envío del lead mientras falte alguno de estos datos:

- nombre
- apellido
- teléfono
- vehículo
- fecha
- hora

=====================================================
PROHIBICIÓN DE ENVIAR PREMATURAMENTE
=====================================================

MUY IMPORTANTE:

NO digas:

"Voy a enviar tu solicitud al concesionario."

si todavía falta algún dato obligatorio.

NO digas:

"Ya envié tus datos."

si todavía falta algún dato obligatorio.

NO digas:

"Tu solicitud fue enviada."

si todavía falta algún dato obligatorio.

Primero debes obtener TODOS los datos obligatorios.

=====================================================
CUANDO TODOS LOS DATOS ESTÉN COMPLETOS
=====================================================

Cuando tengas:

- nombre
- apellido
- teléfono
- vehículo
- fecha
- hora

puedes responder:

"Perfecto, ya tengo todos tus datos. Voy a enviar tu solicitud al concesionario. Un asesor se comunicará contigo para confirmar la disponibilidad y coordinar la visita. La fecha y hora todavía no están confirmadas."

IMPORTANTE:

Esta respuesta solamente se debe utilizar cuando TODOS los datos
obligatorios estén presentes.

=====================================================
ASESOR HUMANO
=====================================================

Si el cliente quiere hablar con un asesor:

Indica que puedes preparar sus datos para que un asesor
se comunique con él.

No inventes nombres de asesores ni números.

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

No hagas preguntas innecesarias.

No repitas información que ya tienes.

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

Interés:
${lead.interes || "bajo"}

=====================================================
FORMATO DE RESPUESTA
=====================================================

Debes responder ÚNICAMENTE con JSON válido.

Formato:

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

=====================================================
REGLAS DEL JSON
=====================================================

Conserva los datos que ya existen.

Si el cliente proporciona un nuevo dato,
actualiza ese dato.

Si un dato no está disponible, utiliza null.

No borres datos que ya hayan sido recopilados.

El campo "interes" debe ser:

"bajo"

"medio"

o

"alto"

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


    // =====================================================
    // MENSAJE ACTUAL
    // =====================================================

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


    // =====================================================
    // ERROR GEMINI
    // =====================================================

    if (!response.ok) {

      console.error(
        "ERROR DE GEMINI:",
        data
      );

      return res.status(500).json({
        error: "Gemini rechazó la solicitud"
      });

    }


    // =====================================================
    // OBTENER RESPUESTA
    // =====================================================

    const rawAnswer =
      data.candidates?.[0]?.content?.parts?.[0]?.text;


    if (!rawAnswer) {

      console.error(
        "GEMINI NO DEVOLVIÓ TEXTO:",
        data
      );

      return res.status(500).json({
        error: "Gemini no devolvió una respuesta"
      });

    }


    // =====================================================
    // CONVERTIR JSON
    // =====================================================

    let result;

    try {

      result = JSON.parse(rawAnswer);

    } catch (error) {

      console.error(
        "JSON INVÁLIDO DE GEMINI:",
        rawAnswer
      );

      return res.status(500).json({
        error: "CARVIA recibió una respuesta inválida"
      });

    }


    // =====================================================
    // DATOS DEL LEAD
    // =====================================================

    const updatedLead = {

      nombre:
        result.lead?.nombre ||
        lead.nombre ||
        null,

      apellido:
        result.lead?.apellido ||
        lead.apellido ||
        null,

      telefono:
        result.lead?.telefono ||
        lead.telefono ||
        null,

      vehiculo:
        result.lead?.vehiculo ||
        lead.vehiculo ||
        null,

      presupuesto:
        result.lead?.presupuesto ||
        lead.presupuesto ||
        null,

      fecha:
        result.lead?.fecha ||
        lead.fecha ||
        null,

      hora:
        result.lead?.hora ||
        lead.hora ||
        null,

      interes:
        result.lead?.interes ||
        lead.interes ||
        "bajo"

    };


    // =====================================================
    // SEGURIDAD EXTRA
    // =====================================================
    // Si faltan datos obligatorios, CARVIA no debe afirmar
    // que el lead fue enviado.

    const datosCompletos =

      updatedLead.nombre &&
      updatedLead.apellido &&
      updatedLead.telefono &&
      updatedLead.vehiculo &&
      updatedLead.fecha &&
      updatedLead.hora;


    if (!datosCompletos) {

      const texto =
        result.reply || "¿En qué puedo ayudarte?";

      const afirmaEnvio =
        texto.toLowerCase().includes("voy a enviar") ||
        texto.toLowerCase().includes("ya envié") ||
        texto.toLowerCase().includes("solicitud fue enviada") ||
        texto.toLowerCase().includes("he enviado");

      if (afirmaEnvio) {

        let pregunta = "";

        if (!updatedLead.nombre) {
          pregunta = "¿Cuál es tu nombre?";
        }
        else if (!updatedLead.apellido) {
          pregunta = "¿Cuál es tu apellido?";
        }
        else if (!updatedLead.telefono) {
          pregunta = "¿A qué número de WhatsApp o teléfono te podemos contactar?";
        }
        else if (!updatedLead.vehiculo) {
          pregunta = "¿Qué vehículo te interesa?";
        }
        else if (!updatedLead.fecha) {
          pregunta = "¿Qué día te gustaría venir?";
        }
        else if (!updatedLead.hora) {
          pregunta = "¿A qué hora te gustaría venir?";
        }

        return res.status(200).json({

          answer: pregunta,

          lead: updatedLead

        });

      }

    }


    // =====================================================
    // RESPUESTA FINAL
    // =====================================================

    return res.status(200).json({

      answer:
        result.reply ||
        "¿En qué puedo ayudarte?",

      lead: updatedLead

    });


  } catch (error) {

    console.error(
      "ERROR DEL SERVIDOR:",
      error
    );

    return res.status(500).json({
      error: "Error interno del servidor"
    });

  }

}
