import {InferenceSession, Tensor} from "onnxruntime-web";

async function loadAgeModel() {
  var feature_session = null;
  await InferenceSession.create("../model/fr_feature.onnx", {executionProviders: ['wasm']})
      .then((session) => {
        feature_session = session
        const input_tensor = new Tensor("float32", new Float32Array(112 * 112 * 3), [1, 3, 112, 112]);
        for (let i = 0; i < 112 * 112 * 3; i++) {
          input_tensor.data[i] = Math.random() * 2.0 - 1.0;
        }
        const feeds = {"input": input_tensor};
        const output_tensor = feature_session.run(feeds)
        console.log("initialize the feature session.")
      })
  return feature_session;
}

async function predictAge(session, canvas_id, landmarks) {
  var img = cv.imread(canvas_id);

  const result = [];
  for (let i = 0; i < landmarks.length; i++) {

    var face_img = alignFeatureImage(img, landmarks[i]);
    //cv.imshow("live-temp", face_img);
    var input_image = preprocessFeature(face_img);
    face_img.delete();

    const input_tensor = new Tensor("float32", new Float32Array(112 * 112 * 3), [1, 3, 112, 112]);
    input_tensor.data.set(input_image.data);
    const feeds = {"input": input_tensor};

    const output_tensor = await session.run(feeds);
    console.log("Feature result: ", output_tensor);

    result.push(output_tensor);
  }

  return result;
}

export {loadAgeModel, predictAge}