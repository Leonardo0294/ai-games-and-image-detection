async function detectImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const image = new Image();
    const reader = new FileReader();

    reader.onload = async function(event) {
        image.src = event.target.result;
        image.onload = async function() {
            const tensor = tf.browser.fromPixels(image)
                .resizeNearestNeighbor([224, 224])
                .toFloat()
                .expandDims();

            const modelName = 'mobilenet_v2';
            const model = await tf.loadLayersModel(`https://tfhub.dev/google/tfjs-model/${modelName}/feature_vector/4/default/1`, { fromTFHub: true });

            const predictions = await model.predict(tensor).data();

            const classes = await fetch('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v2/classes.json')
                .then(response => response.json());

            const top5 = Array.from(predictions)
                .map((prob, index) => ({ probability: prob, className: classes[index] }))
                .sort((a, b) => b.probability - a.probability)
                .slice(0, 5);

            const resultElement = document.getElementById('result');
            resultElement.innerHTML = `<h3>Resultados:</h3>`;
            top5.forEach(item => {
                resultElement.innerHTML += `<p>${item.className}: ${(item.probability * 100).toFixed(2)}%</p>`;
            });
        }
    };

    reader.readAsDataURL(file);
}
