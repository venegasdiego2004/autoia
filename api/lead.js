import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido"
    });
  }

  try {

    const {
      nombre,
      apellido,
      telefono,
      vehiculo,
      presupuesto,
      fecha,
      hora
    } = req.body;

    if (
      !nombre ||
      !apellido ||
      !telefono ||
      !vehiculo ||
      !fecha ||
      !hora
    ) {
      return res.status(400).json({
        error: "Faltan datos del cliente"
      });
    }

    const email = await resend.emails.send({

      from: "onboarding@resend.dev",

      to: "venegasdiego2004@gmail.com",

      subject: `🔴 NUEVO LEAD CARVIA — ${vehiculo}`,

      html: `
        <h2>🔴 Nuevo cliente interesado</h2>

        <p><strong>CARVIA ha detectado un cliente con alta intención comercial.</strong></p>

        <hr>

        <p><strong>Nombre:</strong> ${nombre} ${apellido}</p>

        <p><strong>WhatsApp / Teléfono:</strong> ${telefono}</p>

        <p><strong>Vehículo:</strong> ${vehiculo}</p>

        <p><strong>Presupuesto:</strong> ${presupuesto || "No especificado"}</p>

        <p><strong>Fecha solicitada:</strong> ${fecha}</p>

        <p><strong>Hora solicitada:</strong> ${hora}</p>

        <hr>

        <p>
          ⚠️ La fecha y hora son una <strong>solicitud del cliente</strong>.
          La visita todavía NO está confirmada.
        </p>

        <p>
          Un asesor debe contactar al cliente para confirmar disponibilidad.
        </p>

        <br>

        <p>
          <strong>CARVIA</strong><br>
          Tu asistente inteligente para vehículos 🚗🤖
        </p>
      `
    });

    return res.status(200).json({
      success: true,
      message: "Lead enviado correctamente",
      id: email.data?.id
    });

  } catch (error) {

    console.error("ERROR RESEND:", error);

    return res.status(500).json({
      error: "No se pudo enviar el lead"
    });
  }
}
