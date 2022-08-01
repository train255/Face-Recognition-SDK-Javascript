import {InferenceSession, Tensor} from "onnxruntime-web";
import ndarray from "ndarray";
import ops from "ndarray-ops";

export async function loadPoseModel() {
  var pose_session = null
  await InferenceSession.create("../model/fr_pose.onnx", {executionProviders: ['wasm']})
      .then((session) => {
        pose_session = session
        const input_tensor = new Tensor("float32", new Float32Array(224 * 224 * 3), [1, 3, 224, 224]);
        for (let i = 0; i < 224 * 224 * 3; i++) {
          input_tensor.data[i] = Math.random() * 2.0 - 1.0;
        }
        const feeds = {"input": input_tensor};
        const output_tensor = pose_session.run(feeds)
        console.log("initialize the pose session.")
      })
  return pose_session
}

export async function loadDetectionModel() {
  var detect_session = null;
  await InferenceSession.create("../model/fr_detect.onnx", {executionProviders: ['wasm']})
      .then((session) => {
        detect_session = session;
        const input_tensor = new Tensor("float32", new Float32Array(320 * 240 * 3), [1, 3, 240, 320]);
        for (let i = 0; i < 320 * 240 * 3; i++) {
          input_tensor.data[i] = Math.random() * 2.0 - 1.0;
        }
        const feeds = {"input": input_tensor};
        const output_tensor = detect_session.run(feeds)
        console.log("initialize the detection session.")
      })
  return detect_session
}

export async function loadLivenessModel() {
  var live_session = null
  await InferenceSession.create("../model/fr_liveness.onnx", {executionProviders: ['wasm']})
      .then((session) => {
        live_session = session
        const input_tensor = new Tensor("float32", new Float32Array(128 * 128 * 3), [1, 3, 128, 128]);
        for (let i = 0; i < 128 * 128 * 3; i++) {
          input_tensor.data[i] = Math.random() * 2.0 - 1.0;
        }
        const feeds = {"input": input_tensor};
        const output_tensor = live_session.run(feeds)
        console.log("initialize the live session.")
      })
  return live_session;
}

export async function loadLandmarkModel() {
  var landmark_session = null
  await InferenceSession.create("../model/fr_landmark.onnx", {executionProviders: ['wasm']})
      .then((session) => {
        landmark_session = session
        const input_tensor = new Tensor("float32", new Float32Array(64 * 64), [1, 1, 64, 64]);
        for (let i = 0; i < 64 * 64; i++) {
          input_tensor.data[i] = Math.random();
        }
        const feeds = {"input": input_tensor};
        const output_tensor = landmark_session.run(feeds)
        console.log("initialize the landmark session.")
      })
  return landmark_session
}

export async function loadEyeModel() {
  var eye_session = null
  await InferenceSession.create("../model/fr_eye.onnx", {executionProviders: ['wasm']})
      .then((session) => {
        eye_session = session
        const input_tensor = new Tensor("float32", new Float32Array(24 * 24 * 1), [1, 1, 24, 24]);
        for (let i = 0; i < 24 * 24; i++) {
          input_tensor.data[i] = Math.random() * 2.0 - 1.0;
        }
        const feeds = {"input": input_tensor};
        const output_tensor = eye_session.run(feeds)
        console.log("initialize the eye session.")
      })
  return eye_session
}

export async function loadExpressionModel() {
  var expression_session = null
  await InferenceSession.create("../model/fr_expression.onnx", {executionProviders: ['wasm']})
      .then((session) => {
        expression_session = session
        const input_tensor = new Tensor("float32", new Float32Array(224 * 224 * 3), [1, 3, 224, 224]);
        for (let i = 0; i < 224 * 224 * 3; i++) {
          input_tensor.data[i] = Math.random() * 2.0 - 1.0;
        }
        const feeds = {"input": input_tensor};
        const output_tensor = expression_session.run(feeds)
        console.log("initialize the expression session.")
      })
  return expression_session
}

export function preprocessDetection(image) {
  var rows = image.rows,
      cols = image.cols;

  var img_data = ndarray(new Float32Array(rows * cols * 3), [rows, cols, 3]);

  for (var y = 0; y < rows; y++)
    for (var x = 0; x < cols; x++) {
      let pixel = image.ucharPtr(y, x);
      for (var c = 0; c < 3; c++) {
        var pixel_value = 0
        if (c === 0) // R
          pixel_value = (pixel[c] - 127) / 128.0;
        if (c === 1) // G
          pixel_value = (pixel[c] - 127) / 128.0;
        if (c === 2) // B
          pixel_value = (pixel[c] - 127) / 128.0;

        img_data.set(y, x, c, pixel_value)
      }
    }

  var preprocesed = ndarray(new Float32Array(3 * rows * cols), [1, 3, rows, cols])

  // Transpose
  ops.assign(preprocesed.pick(0, 0, null, null), img_data.pick(null, null, 0));
  ops.assign(preprocesed.pick(0, 1, null, null), img_data.pick(null, null, 1));
  ops.assign(preprocesed.pick(0, 2, null, null), img_data.pick(null, null, 2));

  return preprocesed
}

export async function detectFace(session, canvas_id) {
  const onnx_config = {
        min_sizes: [[10, 16, 24], [32, 48], [64, 96], [128, 192, 256]],
        steps: [8, 16, 32, 64],
        variance: [0.1, 0.2],
        clip: false,
        confidence_threshold: 0.6,
        top_k: 750,
        nms_threshold: 0.4,
      };
  var img = cv.imread(canvas_id);

  // var dsize = new cv.Size(320, 240);
  // var resize_image = new cv.Mat();
  // cv.resize(img, resize_image, dsize);
  cv.cvtColor(img, img, cv.COLOR_BGR2RGB);

  const image = preprocessDetection(img);

  // resize_image.delete()
  var resize_param = {cols: 320 / 320, rows: 240 / 240};

  const input_tensor = new Tensor("float32", new Float32Array(320 * 240 * 3), [1, 3, 240, 320]);
  input_tensor.data.set(image.data);

  const feeds = {"input": input_tensor};
  const output_tensor = await session.run(feeds);

  const loc = output_tensor['boxes'];
  const conf = output_tensor['scores'];

  // const landmarks = output_tensor['585']
  const total_result = conf.size / 2;

  const scale = [320, 240, 320, 240];
  const scale1 = [800, 800, 800, 800, 800, 800, 800, 800, 800, 800];

  const priors = definePriorBox([320, 240], onnx_config);

  const boxes_arr = decodeBBox(loc, priors, onnx_config);

  const scores_arr = ndarray(conf.data, [total_result, 2]).pick(null, 1);
  var landms_arr = null;//decode_landmark(landmarks, priors, onnx_config.variance);

  var box = ndarray(loc.data, [4420, 4]);
  var boxes_before = scaleMultiplyBBox(box, scale);
  var landms_before = null;//scale_multiply_landms(landms_arr, scale1);

  var [bbox_screen, scores_screen, landms_screen] = screenScore(boxes_before, scores_arr, landms_before, onnx_config.confidence_threshold);

  var [bbox_sorted, scores_sorted, landms_sorted] = sortScore(bbox_screen, scores_screen, landms_screen, onnx_config.top_k);

  var [bbox_small, score_result, landms_small, result_size] = cpuNMS(bbox_sorted, scores_sorted, landms_sorted, onnx_config.nms_threshold);
  var [bbox_result, landms_result] = scaleResult(bbox_small, landms_small, resize_param);

  var output = {
    bbox: bbox_result,
    landmark: landms_result,
    conf: score_result,
    size: result_size
  }

  return output

}

export function product(x, y) {
  var size_x = x.length,
      size_y = y.length;
  var result = [];

  for (var i = 0; i < size_x; i++)
    for (var j = 0; j < size_y; j++)
      result.push([x[i], y[j]]);

  return result;
}

export function range(num) {
  var result = [];
  for (var i = 0; i < num; i++)
    result.push(i);

  return result;
}

export function definePriorBox(image_size, onnx_config) {
  var min_sizes = onnx_config.min_sizes,
      steps = onnx_config.steps,
      clip = onnx_config.clip,
      name = "s",
      feature_maps = steps.map((step) => [Math.ceil(image_size[0] / step), Math.ceil(image_size[1] / step)]);

  var anchors = [];

  feature_maps.forEach((f, k) => {
    var min_size = min_sizes[k];
    product(range(f[0]), range(f[1])).forEach(([i, j]) => {
      min_size.forEach((m_size) => {
        var s_kx = m_size / image_size[0],
            s_ky = m_size / image_size[1];
        var dense_cx = [j + 0.5].map((x) => x * steps[k] / image_size[0]),
            dense_cy = [i + 0.5].map((y) => y * steps[k] / image_size[1]);
        product(dense_cy, dense_cx).forEach(([cy, cx]) => {
          anchors.push(cx);
          anchors.push(cy);
          anchors.push(s_kx);
          anchors.push(s_ky);
        })
      });
    });
  });

  var output = ndarray(new Float32Array(anchors), [anchors.length / 4, 4]);

  if (clip)
    output = ndarray.ops.min(1, ops.max(output, 0));

  return output;
}

export function decodeBBox(bbox, priors, onnx_config) {
  var variances = onnx_config.variance
  var loc = ndarray(bbox.data, [4420, 4]);
  // console.log(bbox, priors);
  var before_prior = priors.hi(null, 2),
      after_prior = priors.lo(null, 2);

  var before_loc = loc.hi(null, 2),
      after_loc = loc.lo(null, 2);

  var before_result = ndarray(new Float32Array(before_loc.shape[0] * before_loc.shape[1]), [before_loc.shape[0], 2]);
  var before_temp = ndarray(new Float32Array(before_loc.shape[0] * before_loc.shape[1]), [before_loc.shape[0], 2]);
  var before_temp2 = ndarray(new Float32Array(before_loc.shape[0] * before_loc.shape[1]), [before_loc.shape[0], 2]);

  var after_result = ndarray(new Float32Array(before_loc.shape[0] * before_loc.shape[1]), [before_loc.shape[0], 2]);
  var after_temp = ndarray(new Float32Array(before_loc.shape[0] * before_loc.shape[1]), [before_loc.shape[0], 2]);
  var after_temp2 = ndarray(new Float32Array(before_loc.shape[0] * before_loc.shape[1]), [before_loc.shape[0], 2]);
  var after_temp3 = ndarray(new Float32Array(before_loc.shape[0] * before_loc.shape[1]), [before_loc.shape[0], 2]);
  var after_temp4 = ndarray(new Float32Array(before_loc.shape[0] * before_loc.shape[1]), [before_loc.shape[0], 2]);

  var boxes = ndarray(new Float32Array(before_loc.shape[0] * 4), [before_loc.shape[0], 4]);

  // Before
  ops.mul(before_temp, before_loc, after_prior);
  ops.muls(before_temp2, before_temp, variances[0]);
  ops.add(before_result, before_temp2, before_prior);

  // After
  ops.muls(after_temp, after_loc, variances[1]);
  ops.exp(after_temp2, after_temp);
  ops.mul(after_temp3, after_temp2, after_prior);

  for (var index = 0; index < 4; index++)
    ops.assign(after_result.pick(null, index), after_temp3.pick(null, index));

  ops.divs(after_temp4, after_temp3, -2);
  ops.addeq(before_result, after_temp4);

  ops.addeq(after_result, before_result);

  ops.assign(boxes.pick(null, 0), before_result.pick(null, 0));
  ops.assign(boxes.pick(null, 1), before_result.pick(null, 1));
  ops.assign(boxes.pick(null, 2), after_result.pick(null, 0));
  ops.assign(boxes.pick(null, 3), after_result.pick(null, 1));

  return boxes;
}

export function decodeLandmark(landmark, priors, variances) {

  var landms = ndarray(landmark.data, [26250, 10]);
  var before_prior = priors.hi(null, 2),
      after_prior = priors.lo(null, 2);
  var result = ndarray(new Float32Array(landms.shape[0] * landms.shape[1]), landms.shape);
  var priortemp = ndarray(new Float32Array(after_prior.shape[0] * 2), [after_prior.shape[0], 2]);
  var half_size = parseInt(Math.floor(landms.shape[1] / 2));

  ops.muls(priortemp, after_prior, variances[0]);

  for (var index = 0; index < half_size; index++) {
    let temp = ndarray(new Float32Array(landms.shape[0] * 2), [landms.shape[0], 2]);
    let temp2 = ndarray(new Float32Array(landms.shape[0] * 2), [landms.shape[0], 2]);
    let preslice = landms.hi(null, (index + 1) * 2).lo(null, index * 2);
    ops.mul(temp, preslice, priortemp);
    ops.add(temp2, temp, before_prior);
    ops.assign(result.pick(null, index * 2), temp2.pick(null, 0));
    ops.assign(result.pick(null, index * 2 + 1), temp2.pick(null, 1));
  }

  return result;
}

export function scaleMultiplyBBox(boxes_arr, scale) {
  var total_result = boxes_arr.shape[0];
  var boxes_before = ndarray(new Float32Array(total_result * 4), [total_result, 4]);

  for (var index = 0; index < scale.length; index++) {
    let temp = boxes_arr.pick(null, index),
        before_result = ndarray(new Float32Array(total_result), [total_result]);
    ops.muls(before_result, temp, scale[index]);
    ops.assign(boxes_before.pick(null, index), before_result);
  }

  return boxes_before;
}

export function scaleMultiplyLandmarks(landms_arr, scale1) {
  var total_result = landms_arr.shape[0];
  var landms_before = ndarray(new Float32Array(total_result * 10), [total_result, 10]);

  for (var index = 0; index < scale1.length; index++) {
    let temp = landms_arr.pick(null, index),
        before_landms_result = ndarray(new Float32Array(total_result), [total_result]);
    ops.muls(before_landms_result, temp, scale1[index]);
    ops.assign(landms_before.pick(null, index), before_landms_result);
  }

  return landms_before;
}

export function screenScore(bbox, scores, landms, threshold) {
  var total_size = scores.shape[0];
  var index_arr = [];

  for (var index = 0; index < total_size; index++) {
    var score_temp = scores.get(index);

    if (score_temp >= threshold) {
      index_arr.push(index);
    }
  }

  var result_bbox = ndarray(new Float32Array(index_arr.length * 4), [index_arr.length, 4]);
  var result_scores = ndarray(new Float32Array(index_arr.length), [index_arr.length]);
  var result_landms = null;//ndarray(new Float32Array(index_arr.length * 10), [index_arr.length, 10]);

  index_arr.forEach((index, i) => {
    ops.assign(result_bbox.pick(i, null), bbox.pick(index, null));
    //ops.assign(result_landms.pick(i, null), landms.pick(index, null));
    ops.assign(result_scores.pick(i), scores.pick(index));
  });

  return [result_bbox, result_scores, result_landms];
}

export function sortScore(bbox, scores, landms, top_k) {
  var total_size = scores.shape[0];
  var index_sort = new Array(total_size * 2);

  for (var index = 0; index < total_size; index++) {
    var temp = scores.get(index);
    index_sort[index] = [index, temp];
  }

  index_sort.sort((a, b) => {
    if (a[1] < b[1]) return 1;
    if (a[1] > b[1]) return -1;

    return 0;
  });

  var max_size = (total_size > top_k) ? top_k : total_size;

  var result_bbox = ndarray(new Float32Array(max_size * 4), [max_size, 4]);
  var result_scores = ndarray(new Float32Array(max_size), [max_size]);
  var result_landms = null;//ndarray(new Float32Array(max_size * 10), [max_size, 10]);

  for (var idx = 0; idx < max_size; idx++) {
    result_scores.set(idx, index_sort[idx][1]);
    ops.assign(result_bbox.pick(idx, null), bbox.pick(index_sort[idx][0], null));
    //ops.assign(result_landms.pick(idx, null), landms.pick(index_sort[idx][0], null));
  }

  return [result_bbox, result_scores, result_landms];
}

export function cpuNMS(bbox, scores, landms, thresh) {
  var {max, min} = Math;
  var size = bbox.shape[0];
  var foundLocations = [];
  var pick = [];

  for (var i = 0; i < size; i++) {
    var x1 = bbox.get(i, 0),
        y1 = bbox.get(i, 1),
        x2 = bbox.get(i, 2),
        y2 = bbox.get(i, 3);

    var width = x2 - x1,
        height = y2 - y1;

    if (width > 0 && height > 0) {
      var area = width * height;
      foundLocations.push({x1, y1, x2, y2, width, height, area, index: i});
    }
  }

  foundLocations.sort((b1, b2) => {
    return b1.y2 - b2.y2;
  });

  while (foundLocations.length > 0) {
    var last = foundLocations[0] //[foundLocations.length - 1];
    var suppress = [last];
    pick.push(last.index) //foundLocations.length - 1);

    for (let i = 1; i < foundLocations.length; i++) {
      const box = foundLocations[i];
      const xx1 = max(box.x1, last.x1);
      const yy1 = max(box.y1, last.y1);
      const xx2 = min(box.x2, last.x2);
      const yy2 = min(box.y2, last.y2);
      const w = max(0, xx2 - xx1 + 1);
      const h = max(0, yy2 - yy1 + 1);
      const overlap = (w * h) / box.area;

      if (overlap >= thresh)
        suppress.push(foundLocations[i]);
    }

    foundLocations = foundLocations.filter((box) => {
      return !suppress.find((supp) => {
        return supp === box;
      })
    });
  }

  var result_bbox = ndarray(new Float32Array(pick.length * 4), [pick.length, 4]);
  var result_scores = ndarray(new Float32Array(pick.length), [pick.length]);
  var result_landms = null;//ndarray(new Float32Array(pick.length * 10), [pick.length, 10]);

  // console.log("Pick index: ", pick);

  pick.forEach((pick_index, i) => {
    ops.assign(result_bbox.pick(i, null), bbox.pick(pick_index, null));
    ops.assign(result_scores.pick(i), scores.pick(pick_index));
    //ops.assign(result_landms.pick(i, null), landms.pick(pick_index, null));
  });

  return [result_bbox, result_scores, result_landms, pick.length];
}

export function scaleResult(bbox, landmark, resize_param) {
  var size = bbox.shape[0];
  var result_bbox = ndarray(new Float32Array(size * 4), [size, 4]);
  var result_landms = null;//ndarray(new Float32Array(size * 10), [size, 10]);

  for (var i = 0; i < 2; i++) {
    let x = bbox.pick(null, i * 2),
        y = bbox.pick(null, i * 2 + 1);

    ops.divseq(x, resize_param.cols);          // X1 or X2
    ops.divseq(y, resize_param.rows);     // Y1 or Y2

    ops.assign(result_bbox.pick(null, i * 2), x);
    ops.assign(result_bbox.pick(null, i * 2 + 1), y);
  }

  /*
  for (var j = 0; j < 5; j++) {
    let x = landmark.pick(null, j * 2),
        y = landmark.pick(null, j * 2 + 1);

    ops.divseq(x, resize_param.cols);     // X
    ops.divseq(y, resize_param.rows);    // Y

    ops.assign(result_landms.pick(null, j * 2), x);
    ops.assign(result_landms.pick(null, j * 2 + 1), y);
  }
  */
  return [result_bbox, result_landms];
}

export function preprocessPose(img) {
  var cols = img.cols;
  var rows = img.rows;
  var channels = 3;

  var img_data = ndarray(new Float32Array(rows * cols * channels), [rows, cols, channels]);

  for (var y = 0; y < rows; y++)
    for (var x = 0; x < cols; x++) {
      let pixel = img.ucharPtr(y, x);
      // if(x == 0 && y == 0)
      //     console.log(pixel);
      for (var c = 0; c < channels; c++) {
        var pixel_value = 0
        if (c === 0) // R
          pixel_value = (pixel[c] / 255.0 - 0.485) / 0.229
        if (c === 1) // G
          pixel_value = (pixel[c] / 255.0 - 0.456) / 0.224
        if (c === 2) // B
          pixel_value = (pixel[c] / 255.0 - 0.406) / 0.225

        img_data.set(y, x, c, pixel_value)
      }
    }

  var preprocesed = ndarray(new Float32Array(3 * 224 * 224), [1, 3, 224, 224])
  ops.assign(preprocesed.pick(0, 0, null, null), img_data.pick(null, null, 0));
  ops.assign(preprocesed.pick(0, 1, null, null), img_data.pick(null, null, 1));
  ops.assign(preprocesed.pick(0, 2, null, null), img_data.pick(null, null, 2));

  return preprocesed
}

export function softmax(arr) {
  return arr.map(function(value, index) {
    return Math.exp(value) / arr.map( function(y /*value*/){ return Math.exp(y) } ).reduce( function(a,b){ return a+b })
  })
}

export async function predictPose(session, canvas_id, bbox, question) {
  var face_count = bbox.shape[0],
      bbox_size = bbox.shape[1]

  var img = cv.imread(canvas_id)

  var best_face_idx = getBestFace(bbox);
  if (best_face_idx === -1)
    return null;

  var x1 = parseInt(bbox.data[best_face_idx * bbox_size]),
      y1 = parseInt(bbox.data[best_face_idx * bbox_size + 1]),
      x2 = parseInt(bbox.data[best_face_idx * bbox_size + 2]),
      y2 = parseInt(bbox.data[best_face_idx * bbox_size + 3]),
      width = Math.abs(x2 - x1),
      height = Math.abs(y2 - y1);

  var x11 = parseInt(x1 - width/4),
      y11 = parseInt(y1 - height/4),
      x22 = parseInt(x2 + width/4),
      y22 = parseInt(y2 + height/4);

  var rect = new cv.Rect(Math.max(x11, 0), Math.max(y11, 0), Math.min(x22 - x11, 320), Math.min(y22 - y11, 240))
  var face_image = new cv.Mat()

  face_image = img.roi(rect)

  var dsize = new cv.Size(224, 224)
  var resize_image = new cv.Mat()
  cv.resize(face_image, resize_image, dsize)
  cv.cvtColor(resize_image, resize_image, cv.COLOR_BGR2RGB)

  // cv.imshow("live-temp", resize_image)

  var input_image = preprocessPose(resize_image)

  const input_tensor = new Tensor("float32", new Float32Array(224 * 224 * 3), [1, 3, 224, 224])
  input_tensor.data.set(input_image.data)
  const feeds = {"input": input_tensor}

  const output_tensor = await session.run(feeds)

  var arr = Array.apply(null, Array(66))
  const index_arr = arr.map(function (x, i) { return i })

  const yaw_arr = softmax(output_tensor['output'].data)
  const pitch_arr = softmax(output_tensor['617'].data)
  const roll_arr = softmax(output_tensor['618'].data)

  const yaw = yaw_arr.reduce(function (r, a, i){return r + a * index_arr[i]}, 0) * 3 - 99
  const pitch = pitch_arr.reduce(function (r, a, i){return r + a * index_arr[i]}, 0) * 3 - 99
  const roll = roll_arr.reduce(function (r, a, i){return r + a * index_arr[i]}, 0) * 3 - 99
  //console.log("Pose results: ", yaw, pitch, roll)

  const max_rx = 15, max_ry = 15;
  var result = "front";
  if (yaw < -max_ry && question === "turn face right")
      result = "right";
  else if (yaw > max_ry && question === "turn face left")
      result = "left";
  else if (pitch > max_rx && question === "turn face up")
      result = "up";
  else if (pitch < -max_rx && question === "turn face down")
      result = "down";

  resize_image.delete();

  face_image.delete();
  return result;
}

export function alignLivenessImage(image, bbox, scale_value) {
  var src_h = image.rows,
      src_w = image.cols;

  var x = bbox[0]
  var y = bbox[1]
  var box_w = bbox[2]
  var box_h = bbox[3]

  var scale = Math.min((src_h-1)/box_h, Math.min((src_w-1)/box_w, scale_value))

  var new_width = box_w * scale
  var new_height = box_h * scale
  var center_x = box_w/2+x,
      center_y = box_h/2+y

  var left_top_x = center_x-new_width/2
  var left_top_y = center_y-new_height/2
  var right_bottom_x = center_x+new_width/2
  var right_bottom_y = center_y+new_height/2

  if (left_top_x < 0) {
    right_bottom_x -= left_top_x
    left_top_x = 0
  }

  if (left_top_y < 0) {
    right_bottom_y -= left_top_y
    left_top_y = 0
  }

  if (right_bottom_x > src_w-1) {
    left_top_x -= right_bottom_x-src_w+1
    right_bottom_x = src_w-1
  }

  if (right_bottom_y > src_h-1) {
    left_top_y -= right_bottom_y-src_h+1
    right_bottom_y = src_h-1
  }
  var rect = new cv.Rect(Math.max(parseInt(left_top_x), 0), Math.max(parseInt(left_top_y), 0),
      Math.min(parseInt(right_bottom_x - left_top_x), src_w-1), Math.min(parseInt(right_bottom_y - left_top_y), src_h-1))

  var face_image = new cv.Mat()
  face_image = image.roi(rect)

  var dsize = new cv.Size(128, 128);
  var resize_image = new cv.Mat();
  cv.resize(face_image, resize_image, dsize);

  face_image.delete()
  return resize_image
}

export function preprocessLiveness(img) {
  var cols = img.cols;
  var rows = img.rows;
  var channels = 3;

  var img_data = ndarray(new Float32Array(rows * cols * channels), [rows, cols, channels]);

  for (var y = 0; y < rows; y++)
    for (var x = 0; x < cols; x++) {
      let pixel = img.ucharPtr(y, x);
      for (var c = 0; c < channels; c++) {
        var pixel_value = 0
        if (c === 0) // R
          pixel_value = pixel[c];
        if (c === 1) // G
          pixel_value = pixel[c];
        if (c === 2) // B
          pixel_value = pixel[c];

        img_data.set(y, x, c, pixel_value)
      }
    }

  var preprocesed = ndarray(new Float32Array(channels * cols * rows), [1, channels, rows, cols])
  ops.assign(preprocesed.pick(0, 0, null, null), img_data.pick(null, null, 0));
  ops.assign(preprocesed.pick(0, 1, null, null), img_data.pick(null, null, 1));
  ops.assign(preprocesed.pick(0, 2, null, null), img_data.pick(null, null, 2));

  return preprocesed
}

export function getBestFace(bbox) {
  var face_count = bbox.shape[0],
      bbox_size = bbox.shape[1];

  var idx = -1, max_size = 0;
  for (let i = 0; i < face_count; i++) {
    var x1 = parseInt(bbox.data[i * bbox_size]),
        y1 = parseInt(bbox.data[i * bbox_size + 1]),
        x2 = parseInt(bbox.data[i * bbox_size + 2]),
        y2 = parseInt(bbox.data[i * bbox_size + 3]),
        width = Math.abs(x2 - x1),
        height = Math.abs(y2 - y1);
    if (width * height > max_size)
      idx = i;
  }
  return idx
}

export async function predictLiveness(session, canvas_id, bbox) {
  var img = cv.imread(canvas_id)

  var bbox_size = bbox.shape[1];
  var best_face_idx = getBestFace(bbox);
  if (best_face_idx === -1)
    return null;

  var x1 = parseInt(bbox.data[best_face_idx * bbox_size]),
      y1 = parseInt(bbox.data[best_face_idx * bbox_size + 1]),
      x2 = parseInt(bbox.data[best_face_idx * bbox_size + 2]),
      y2 = parseInt(bbox.data[best_face_idx * bbox_size + 3]),
      width = Math.abs(x2 - x1),
      height = Math.abs(y2 - y1);

  var face_img = alignLivenessImage(img, [x1, y1, width, height], 2.7);
  //cv.imshow("live-temp", face_img);
  var input_image = preprocessLiveness(face_img);
  face_img.delete();

  const input_tensor = new Tensor("float32", new Float32Array(128 * 128 * 3), [1, 3, 128, 128]);
  input_tensor.data.set(input_image.data);
  const feeds = {"input": input_tensor};

  const output_tensor = await session.run(feeds);
  const score_arr = softmax(output_tensor['output'].data);
  console.log("Liveness result: ", score_arr);

  return score_arr[0] > 0.5;

}

export function alignLandmarkImage(image, bbox, scale_value) {
  var src_h = image.rows,
      src_w = image.cols;

  var x = bbox[0]
  var y = bbox[1]
  var box_w = bbox[2]
  var box_h = bbox[3]

  var scale = Math.min((src_h-1)/box_h, Math.min((src_w-1)/box_w, scale_value))

  var new_width = box_w * scale
  var new_height = box_h * scale
  var center_x = box_w/2+x,
      center_y = box_h/2+y

  var left_top_x = center_x-new_width/2
  var left_top_y = center_y-new_height/2
  var right_bottom_x = center_x+new_width/2
  var right_bottom_y = center_y+new_height/2

  if (left_top_x < 0) {
    right_bottom_x -= left_top_x
    left_top_x = 0
  }

  if (left_top_y < 0) {
    right_bottom_y -= left_top_y
    left_top_y = 0
  }

  if (right_bottom_x > src_w-1) {
    left_top_x -= right_bottom_x-src_w+1
    right_bottom_x = src_w-1
  }

  if (right_bottom_y > src_h-1) {
    left_top_y -= right_bottom_y-src_h+1
    right_bottom_y = src_h-1
  }
  var rect = new cv.Rect(Math.max(parseInt(left_top_x), 0), Math.max(parseInt(left_top_y), 0),
      Math.min(parseInt(right_bottom_x - left_top_x), src_w-1), Math.min(parseInt(right_bottom_y - left_top_y), src_h-1))

  var face_image = new cv.Mat()
  face_image = image.roi(rect)

  var dsize = new cv.Size(64, 64);
  var resize_image = new cv.Mat();
  cv.resize(face_image, resize_image, dsize);
  cv.cvtColor(resize_image, resize_image, cv.COLOR_BGR2GRAY)

  face_image.delete()
  return resize_image
}

export function preprocessLandmark(img) {
  var cols = img.cols;
  var rows = img.rows;
  var channels = 1;

  var img_data = ndarray(new Float32Array(rows * cols * channels), [rows, cols, channels]);

  for (var y = 0; y < rows; y++)
    for (var x = 0; x < cols; x++) {
      let pixel = img.ucharPtr(y, x);
      for (var c = 0; c < channels; c++) {
        var pixel_value = pixel[c] / 256.0;
        img_data.set(y, x, c, pixel_value)
      }
    }

  var preprocesed = ndarray(new Float32Array(channels * cols * rows), [1, channels, rows, cols])
  ops.assign(preprocesed.pick(0, 0, null, null), img_data.pick(null, null, 0));

  return preprocesed;
}

export async function predictLandmark(session, canvas_id, bbox) {
  var img = cv.imread(canvas_id);

  var bbox_size = bbox.shape[1];

  var best_face_idx = getBestFace(bbox);
  if (best_face_idx === -1)
    return null;

  var x1 = parseInt(bbox.data[best_face_idx * bbox_size]),
      y1 = parseInt(bbox.data[best_face_idx * bbox_size + 1]),
      x2 = parseInt(bbox.data[best_face_idx * bbox_size + 2]),
      y2 = parseInt(bbox.data[best_face_idx * bbox_size + 3]),
      width = Math.abs(x2 - x1),
      height = Math.abs(y2 - y1);

  var face_img = alignLandmarkImage(img, [x1, y1, width, height], 1.2);
  // cv.imshow("live-temp", face_img);
  var input_image = preprocessLandmark(face_img);
  face_img.delete();
  const input_tensor = new Tensor("float32", new Float32Array(64 * 64), [1, 1, 64, 64]);

  input_tensor.data.set(input_image.data);

  const feeds = {"input": input_tensor};

  const output_tensor = await session.run(feeds);
  var landmark_arr = output_tensor['output'].data;

  for (let i = 0; i < landmark_arr.length; i++) {
    if (i % 2 === 0)
      landmark_arr[i] = parseInt(landmark_arr[i] * width + x1);
    else
      landmark_arr[i] = parseInt(landmark_arr[i] * height + y1);
  }
  // console.log("Landmark result: ", landmark_arr[0], landmark_arr[1], landmark_arr[74], landmark_arr[75], landmark_arr[76], landmark_arr[77]);

  return landmark_arr
}

export function getEyeBBox(landmark, size) {
  var height = size[0], width = size[1];
  const padding_rate = 1.6;
  var left_eye_center_x = parseInt((landmark[74] + landmark[76] + landmark[80] + landmark[82]) / 4);
  var left_eye_center_y = parseInt((landmark[75] + landmark[77] + landmark[81] + landmark[83]) / 4);
  var left_eye_size = parseInt((landmark[78] - landmark[72]) * padding_rate);
  var left_corner_x = parseInt(left_eye_center_x - left_eye_size / 2);
  if (left_corner_x < 0)
    left_corner_x = 0;

  var left_corner_y = parseInt(left_eye_center_y - left_eye_size / 2);
  if (left_corner_y < 0)
    left_corner_y = 0;

  if (left_corner_x + left_eye_size >= width)
    left_eye_size = width - left_corner_x - 1

  if (left_corner_y + left_eye_size >= height)
    left_eye_size = height - left_corner_y - 1

  var right_eye_center_x = parseInt((landmark[86] + landmark[88] + landmark[92] + landmark[94]) / 4);
  var right_eye_center_y = parseInt((landmark[87] + landmark[89] + landmark[93] + landmark[95]) / 4);
  var right_eye_size = parseInt((landmark[90] - landmark[84]) * padding_rate);
  var right_corner_x = parseInt(right_eye_center_x - right_eye_size / 2);
  if (right_corner_x < 0)
      right_corner_x = 0
  var right_corner_y = parseInt(right_eye_center_y - right_eye_size / 2);
  if (right_corner_y < 0)
    right_corner_y = 0
  if (right_corner_x + right_eye_size >= width)
      right_eye_size = width - right_corner_x - 1
  if (right_corner_y + right_eye_size >= height)
      right_eye_size = height - right_corner_y - 1

  return [left_corner_x, left_corner_y, left_eye_size, left_eye_size,
    right_corner_x, right_corner_y, right_eye_size, right_eye_size]
}

export function alignEyeImage(image, landmark) {
  var src_h = image.rows,
      src_w = image.cols;

  var eye_bbox = getEyeBBox(landmark, [src_h, src_w])
  var rect = new cv.Rect(eye_bbox[0], eye_bbox[1], eye_bbox[2], eye_bbox[3])

  var eye_image = new cv.Mat()
  eye_image = image.roi(rect)

  var dsize = new cv.Size(24, 24);
  var left_eye = new cv.Mat();
  cv.resize(eye_image, left_eye, dsize);
  cv.cvtColor(left_eye, left_eye, cv.COLOR_BGR2GRAY)

  // right eye
  rect = new cv.Rect(eye_bbox[4], eye_bbox[5], eye_bbox[6], eye_bbox[7])
  eye_image = image.roi(rect)
  var right_eye = new cv.Mat();
  cv.resize(eye_image, right_eye, dsize);
  cv.cvtColor(right_eye, right_eye, cv.COLOR_BGR2GRAY)

  eye_image.delete()
  return [left_eye, right_eye]
}

export function preprocessEye(imgs) {
  var cols = imgs[0].cols;
  var rows = imgs[0].rows;
  var channels = 1;

  var img_data1 = ndarray(new Float32Array(rows * cols * channels), [rows, cols, channels]);
  var img_data2 = ndarray(new Float32Array(rows * cols * channels), [rows, cols, channels]);

  for (var y = 0; y < rows; y++)
    for (var x = 0; x < cols; x++) {
      let pixel1 = imgs[0].ucharPtr(y, x);
      let pixel2 = imgs[1].ucharPtr(y, x);

      for (var c = 0; c < channels; c++) {
        var pixel_value1 = pixel1[c] / 255.0;
        var pixel_value2 = pixel2[c] / 255.0;

        img_data1.set(y, x, c, pixel_value1)
        img_data2.set(y, x, c, pixel_value2)
      }
    }

  var preprocesed1 = ndarray(new Float32Array(channels * cols * rows), [1, channels, rows, cols])
  ops.assign(preprocesed1.pick(0, 0, null, null), img_data1.pick(null, null, 0));
  var preprocesed2 = ndarray(new Float32Array(channels * cols * rows), [1, channels, rows, cols])
  ops.assign(preprocesed2.pick(0, 0, null, null), img_data2.pick(null, null, 0));

  return [preprocesed1, preprocesed2]
}

export async function predictEye(session, canvas_id, landmark) {
  var img = cv.imread(canvas_id)

  var face_imgs = alignEyeImage(img, landmark);
  // cv.imshow("live-temp", face_imgs[1]);
  var input_images = preprocessEye(face_imgs);
  face_imgs[0].delete();
  face_imgs[1].delete();

  const input_tensor1 = new Tensor("float32", new Float32Array(24 * 24), [1, 1, 24, 24]);
  input_tensor1.data.set(input_images[0].data);
  const feeds1 = {"input": input_tensor1};

  const output_tensor1 = await session.run(feeds1);
  const left_res = softmax(output_tensor1['output'].data);

  const input_tensor2 = new Tensor("float32", new Float32Array(24 * 24), [1, 1, 24, 24]);
  input_tensor2.data.set(input_images[1].data);
  const feeds2 = {"input": input_tensor2};

  const output_tensor2 = await session.run(feeds2);
  const right_res = softmax(output_tensor2['output'].data);

  // console.log("Eye result: ", left_res, right_res);
  return left_res[0] > left_res[1] && right_res[0] > right_res[1];
}

export function alignExpressionImage(image, bbox) {
  var src_h = image.rows,
      src_w = image.cols;

  var x = bbox[0]
  var y = bbox[1]
  var box_w = bbox[2]
  var box_h = bbox[3]

  var rect = new cv.Rect(x, y, Math.min(parseInt(box_w * 1.2), src_w-1), Math.min(parseInt(box_h * 1.2), src_h-1))

  var face_image = new cv.Mat()
  face_image = image.roi(rect)

  var dsize = new cv.Size(224, 224);
  var resize_image = new cv.Mat();
  cv.resize(face_image, resize_image, dsize);

  face_image.delete()
  return resize_image
}

export function preprocessExpression(img) {
  var cols = img.cols;
  var rows = img.rows;
  var channels = 3;

  var img_data = ndarray(new Float32Array(rows * cols * channels), [rows, cols, channels]);

  for (var y = 0; y < rows; y++)
    for (var x = 0; x < cols; x++) {
      let pixel = img.ucharPtr(y, x);
      for (var c = 0; c < channels; c++) {
        var pixel_value = pixel[c] / 255.0;
        img_data.set(y, x, c, pixel_value)
      }
    }

  var preprocesed = ndarray(new Float32Array(channels * cols * rows), [1, channels, rows, cols])

  ops.assign(preprocesed.pick(0, 0, null, null), img_data.pick(null, null, 0));
  ops.assign(preprocesed.pick(0, 1, null, null), img_data.pick(null, null, 1));
  ops.assign(preprocesed.pick(0, 2, null, null), img_data.pick(null, null, 2));

  return preprocesed
}

export async function predictExpression(session, canvas_id, bbox) {
  var img = cv.imread(canvas_id)

  var face_count = bbox.shape[0],
      bbox_size = bbox.shape[1];

  var best_face_idx = getBestFace(bbox);
  if (best_face_idx === -1)
    return null;

  var x1 = parseInt(bbox.data[best_face_idx * bbox_size]),
      y1 = parseInt(bbox.data[best_face_idx * bbox_size + 1]),
      x2 = parseInt(bbox.data[best_face_idx * bbox_size + 2]),
      y2 = parseInt(bbox.data[best_face_idx * bbox_size + 3]),
      width = Math.abs(x2 - x1),
      height = Math.abs(y2 - y1);

  var face_img = alignExpressionImage(img, [x1, y1, width, height]);
  //cv.imshow("live-temp", face_img);
  var input_image = preprocessExpression(face_img);
  face_img.delete();

  const input_tensor = new Tensor("float32", new Float32Array(224 * 224 * 3), [1, 3, 224, 224]);
  input_tensor.data.set(input_image.data);
  const feeds = {"input": input_tensor};

  const output_tensor = await session.run(feeds);
  const expression_arr = softmax(output_tensor['output'].data);

  var max_idx = null, max_val = 0;
  for (let i = 0; i < expression_arr.length; i++)
    if (max_val < expression_arr[i]) {
      max_idx = i;
      max_val = expression_arr[i];
    }
  return max_idx;
}
