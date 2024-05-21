// Selecciona el formulario y los elementos de entrada y la imagen seleccionada del DOM
const form = document.querySelector("form");
const imageInput = document.querySelector("input");
const selectedImage = document.querySelector("#selected-image");

// Función asíncrona para cargar el modelo de MobileNet
async function loadModel() {
  const model = await mobilenet.load();
  return model;
}

// Función para crear un retraso de 'ms' milisegundos
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Función para asegurar que los cambios en el DOM se reflejen en el navegador
async function flushDom() {
    await delay(0); // Retraso de 0 milisegundos para "fluir" los cambios en el DOM
}

// Función asíncrona para clasificar una imagen usando el modelo cargado
async function classifyImage(model, img) {
  const predictions = await model.classify(img);
  return predictions;
}

// Evento que se dispara cuando el contenido del documento está completamente cargado
document.addEventListener("DOMContentLoaded", async () => {
  // Agrega un evento al cambiar la imagen en el input
  imageInput.addEventListener("change", handleImageChange);
  // Carga el modelo de MobileNet
  const model = await loadModel();
  // Habilita el botón de submit y cambia su texto
  const btn = form.querySelector("[type=submit]");
  btn.removeAttribute("disabled");
  btn.innerHTML = "Reconocer imagen";
  // Agrega un evento al formulario cuando se envía
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    // Cambia el botón a un estado de "cargando"
    btn.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Reconociendo imagen...
            `;
    btn.setAttribute("disabled", "disabled");
    // Asegura que los cambios en el DOM se reflejen
    await flushDom();
    // Obtiene las predicciones clasificando la imagen
    const predictions = await handleImageUpload(model);
    // Muestra las predicciones en el DOM
    renderPredictions(predictions);
    await flushDom();
    // Habilita nuevamente el botón y restablece su texto
    btn.removeAttribute("disabled");
    btn.innerHTML = "Reconocer imagen";
  });
});

// Función para manejar el cambio de la imagen seleccionada
function handleImageChange() {
  const formData = new FormData(form); // Crea un objeto FormData con los datos del formulario
  const image = formData.get("image"); // Obtiene la imagen del formulario
  const url = URL.createObjectURL(image); // Crea una URL para la imagen seleccionada
  // Establece la imagen seleccionada en el elemento de imagen y ajusta su tamaño
  selectedImage.src = url;
  selectedImage.width = 224;
  selectedImage.height = 224;
}

// Función asíncrona para manejar la subida de la imagen y clasificarla
async function handleImageUpload(model) {
  const predictions = await classifyImage(model, selectedImage);
  return predictions;
}

// Función para mostrar las predicciones en una tabla en el DOM
function renderPredictions(predictions) {
  const predictionsList = document.querySelector("#predictions");
  // Genera el HTML para cada predicción y lo establece en la tabla
  const html = predictions.map(
    (prediction) =>
      `
            <tr class="">
                <td>${prediction.className}</td>
                <td>${(prediction.probability * 100).toFixed(2)}%</td>
            </tr>
        `
  );
  predictionsList.innerHTML = html.join(""); // Inserta el HTML generado en la tabla de predicciones
}
