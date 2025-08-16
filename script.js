// script.js

document.addEventListener("DOMContentLoaded", () => {
  const selectMunicipio = document.getElementById("municipio");
  const contenido = document.getElementById("contenido");

  // ===== Función para crear tarjeta =====
  function crearTarjeta(titulo, valor, unidad = "") {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h6>${titulo}</h6>
      <p><b>Valor:</b> ${valor}${unidad ? " " + unidad : ""}</p>
    `;
    return card;
  }

  // ===== Función para renderizar secciones =====
  function renderSeccion(tituloSeccion, datos, claseSeccion) {
    if (!datos || Object.keys(datos).length === 0) return;

    const section = document.createElement("div");
    section.className = `section-seleccionada ${claseSeccion}`;
    section.innerHTML = `<h4>${tituloSeccion}</h4>`;

    for (const [clave, valor] of Object.entries(datos)) {
      const tarjeta = crearTarjeta(clave.replace(/_/g, " "), valor);
      section.appendChild(tarjeta);
    }

    contenido.appendChild(section);
  }

  // ===== Función principal para cargar datos =====
  async function cargarDatos(codigo) {
    contenido.innerHTML = "<p>Cargando datos...</p>";

    try {
      const respuesta = await fetch(`https://censopoblacion.azurewebsites.net/API/indicadores/2/${codigo}`);
      let datos = await respuesta.json();

      if (typeof datos === "string") datos = JSON.parse(datos);

      contenido.innerHTML = "";

      if (Array.isArray(datos)) {
        const section = document.createElement("div");
        section.innerHTML = `<h4>📊 Indicadores del municipio</h4>`;

        datos.forEach(item => {
          const card = crearTarjeta(item.indicador, item.valor, item.unidad_medida || "");
          section.appendChild(card);
        });

        contenido.appendChild(section);

      } else if (typeof datos === "object") {
        const generales = {};
        const sexo = {};
        const edad = {};
        const pueblos = {};

        for (const [clave, valor] of Object.entries(datos)) {
          if (clave.toLowerCase().includes("sexo")) sexo[clave] = valor;
          else if (clave.toLowerCase().includes("edad")) edad[clave] = valor;
          else if (clave.toLowerCase().includes("pueblo")) pueblos[clave] = valor;
          else generales[clave] = valor;
        }

        renderSeccion("📊 Datos generales", generales, "datos-generales");
        renderSeccion("🚻 Población por sexo", sexo, "sexo");
        renderSeccion("👶👩‍🦳 Población por edad", edad, "edad");
        renderSeccion("🌎 Población por pueblos / etnias", pueblos, "pueblos");

      } else {
        contenido.innerHTML = "<p>No hay datos disponibles.</p>";
      }

    } catch (error) {
      contenido.innerHTML = "<p class='text-danger'>Error al cargar datos.</p>";
      console.error("Detalle del error:", error);
    }
  }

  // ===== Cargar datos iniciales =====
  cargarDatos(selectMunicipio.value);

  // ===== Evento al cambiar municipio =====
  selectMunicipio.addEventListener("change", (e) => {
    cargarDatos(e.target.value);
  });
});
