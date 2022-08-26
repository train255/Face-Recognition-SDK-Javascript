<template>
  <div class="flex flex-row">
    <image-list @changeI="changeImage($event)"/>
    <canvas id="live-canvas" width="640" height="480"/>
    <div class="flex flex-col">
      <button @click="detectFace" type="button"
              class="px-6 py-2 font-semibold text-white bg-gray-800 rounded-md hover:opacity-95 focus:outline-none"
              aria-expanded="false">Detect Face
      </button>
      <button @click="extractLandmark" type="button"
              class="px-6 py-2 font-semibold text-white bg-gray-800 rounded-md hover:opacity-95 focus:outline-none"
              aria-expanded="false">Extract Landmark
      </button>
      <button @click="detectLivenessDetection" type="button"
              class="px-6 py-2 font-semibold text-white bg-gray-800 rounded-md hover:opacity-95 focus:outline-none"
              aria-expanded="false">Detect Liveness
      </button>
      <button @click="predictFacePose" type="button"
              class="px-6 py-2 font-semibold text-white bg-gray-800 rounded-md hover:opacity-95 focus:outline-none"
              aria-expanded="false">Estimate Face Pose
      </button>
      <button @click="predictFaceExpression" type="button"
              class="px-6 py-2 font-semibold text-white bg-gray-800 rounded-md hover:opacity-95 focus:outline-none"
              aria-expanded="false">Estimate Face Expression
      </button>
      <button @click="predictEyeCloseness" type="button"
              class="px-6 py-2 font-semibold text-white bg-gray-800 rounded-md hover:opacity-95 focus:outline-none"
              aria-expanded="false">Estimate Eye Closeness
      </button>
      <button @click="predictGender" type="button"
              class="px-6 py-2 font-semibold text-white bg-gray-800 rounded-md hover:opacity-95 focus:outline-none"
              aria-expanded="false">Estimate Gender
      </button>
      <button @click="predictAge" type="button"
              class="px-6 py-2 font-semibold text-white bg-gray-800 rounded-md hover:opacity-95 focus:outline-none"
              aria-expanded="false">Estimate Age
      </button>
      <button @click="extractFeature" type="button"
              class="px-6 py-2 font-semibold text-white bg-gray-800 rounded-md hover:opacity-95 focus:outline-none"
              aria-expanded="false">Extract Face feature
      </button>
    </div>

  </div>
</template>
<script>
import imageList from "./imageList.vue";
import * as faceSDK from "face-recognition-plugin";

export default {
  data() {
    return {
      filename: null,
      start_question: true,
      user_email: null,
      image: null,
      max_questions: 6,
      try_count: 10,
      continuous_blink_count: 0,
      total_blink_count: 0,
      challenge: null,
      questions: ["smile", "surprise", "blink eyes", "angry", "turn face right", "turn face left", "turn face up",
        "turn face down"],
      emotions: {0: "angry", 1: "disgust", 2: "fear", 3: "smile", 4: "sad", 5: "surprise", 6: "neutral"},
      active_count: 0,
      button_status: false,
      detect_session: null, //InferenceSession,
      live_session: null, //InferenceSession,
      landmark_session: null, //InferenceSession,
      pose_session: null, //InferenceSession,
      expression_session: null, //InferenceSession,
      eye_session: null, //InferenceSession,
      gender_session: null, //InferenceSession,
      age_session: null, //InferenceSession,
      feature_session: null, //InferenceSession,
    }
  },
  components: {
    imageList
  },
  computed: {
  },
  methods: {
    changeImage(filename) {
      this.filename = filename;
      this.selectImage(filename);
    },

    async take_photo() {
      const canvas = document.getElementById('live-canvas');
      const canvasCtx = canvas.getContext('2d');
      // this.image = canvas.toDataURL('image/jpeg');

      // ------- save image locally -------
      // var img = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      // window.location.href=img;

      // ------ load image locally ------
      const img1 = new Image();

      //drawing of the test image - img1
      img1.onload = function () {
        //draw background image
        canvasCtx.drawImage(img1, 0, 0, 640, 480);
        //draw a box over the top
        // canvasCtx.fillStyle = "rgba(200, 0, 0, 0.5)";
        // canvasCtx.fillRect(0, 0, 500, 500);

      };

      img1.src = 'empty.png';

    },

    selectImage(imageFile) {
      const canvas = document.getElementById('live-canvas');
      const canvasCtx = canvas.getContext('2d');
      canvasCtx.clearRect(0, 0, 640, 480);

      const img1 = new Image();
      img1.onload = function () {
        canvasCtx.drawImage(img1, 0, 0, 640, 480);
      };
      img1.src = imageFile;
    },

    async detectFace() {
      const detectionResult = await faceSDK.detectFace(this.detect_session, 'live-canvas');

      var bbox = detectionResult.bbox;
      var face_count = bbox.shape[0],
          bbox_size = bbox.shape[1];

      const canvas = document.getElementById('live-canvas');
      const canvasCtx = canvas.getContext('2d');
      canvasCtx.beginPath();

      for (let i = 0; i < face_count; i++) {
        var x1 = parseInt(bbox.data[i * bbox_size]),
            y1 = parseInt(bbox.data[i * bbox_size + 1]),
            x2 = parseInt(bbox.data[i * bbox_size + 2]),
            y2 = parseInt(bbox.data[i * bbox_size + 3]),
            width = Math.abs(x2 - x1),
            height = Math.abs(y2 - y1);

            canvasCtx.strokeStyle = "red";
            canvasCtx.strokeRect(x1, y1, width, height);
            canvasCtx.stroke()
      }
    },

    async extractLandmark() {
      const detectionResult = await faceSDK.detectFace(this.detect_session, 'live-canvas');
      const points = await faceSDK.predictLandmark(this.landmark_session, 'live-canvas', detectionResult.bbox);

      const canvas = document.getElementById('live-canvas');
      const canvasCtx = canvas.getContext('2d');
      canvasCtx.beginPath();

      for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < 68; j++) {
         var x1 = points[i][j * 2],
            y1 = points[i][j * 2 + 1];


            canvasCtx.moveTo(x1 + 2, y1);
            canvasCtx.arc(x1, y1, 2, 0, 2 * Math.PI);
            canvasCtx.strokeStyle = "red";
            canvasCtx.stroke()
        }
      }
    },

    async detectLivenessDetection() {
      const detectionResult = await faceSDK.detectFace(this.detect_session, 'live-canvas');
      const liveResult = await faceSDK.predictLiveness(this.live_session, 'live-canvas', detectionResult.bbox);

      const canvas = document.getElementById('live-canvas');
      const canvasCtx = canvas.getContext('2d');
      canvasCtx.beginPath();

      var face_count = liveResult.length;

      for (let i = 0; i < face_count; i++) {
        var x1 = parseInt(liveResult[i][0]),
            y1 = parseInt(liveResult[i][1]),
            x2 = parseInt(liveResult[i][2]),
            y2 = parseInt(liveResult[i][3]),
            result = liveResult[i][4] < 0.3 ? "Fake" : "Live",
            width = Math.abs(x2 - x1),
            height = Math.abs(y2 - y1);

        canvasCtx.strokeStyle = "red";
        canvasCtx.fillStyle = "blue";
        canvasCtx.strokeRect(x1, y1, width, height);
        canvasCtx.fillText(result, x1, y1-10);
        canvasCtx.stroke();
      }
    },

    async predictFaceExpression() {
      const detectionResult = await faceSDK.detectFace(this.detect_session, 'live-canvas');
      const expressionResult = await faceSDK.predictExpression(this.expression_session, 'live-canvas', detectionResult.bbox);

      const canvas = document.getElementById('live-canvas');
      const canvasCtx = canvas.getContext('2d');
      canvasCtx.beginPath();

      var face_count = expressionResult.length;

      for (let i = 0; i < face_count; i++) {
        var x1 = parseInt(expressionResult[i][0]),
            y1 = parseInt(expressionResult[i][1]),
            x2 = parseInt(expressionResult[i][2]),
            y2 = parseInt(expressionResult[i][3]),

            width = Math.abs(x2 - x1),
            height = Math.abs(y2 - y1);

        canvasCtx.strokeStyle = "red";
        canvasCtx.fillStyle = "blue";
        canvasCtx.strokeRect(x1, y1, width, height);
        canvasCtx.fillText("Yaw: " + this.emotions[expressionResult[i][4]], x1, y1-10);
        canvasCtx.stroke();
      }
    },

    async predictFacePose() {
      const detectionResult = await faceSDK.detectFace(this.detect_session, 'live-canvas');
      const poseResult = await faceSDK.predictPose(this.pose_session, 'live-canvas', detectionResult.bbox);

      const canvas = document.getElementById('live-canvas');
      const canvasCtx = canvas.getContext('2d');
      canvasCtx.beginPath();

      var face_count = poseResult.length;

      for (let i = 0; i < face_count; i++) {
        var x1 = parseInt(poseResult[i][0]),
            y1 = parseInt(poseResult[i][1]),
            x2 = parseInt(poseResult[i][2]),
            y2 = parseInt(poseResult[i][3]),

            width = Math.abs(x2 - x1),
            height = Math.abs(y2 - y1);

        canvasCtx.strokeStyle = "red";
        canvasCtx.fillStyle = "blue";
        canvasCtx.strokeRect(x1, y1, width, height);
        canvasCtx.fillText("Yaw: " + poseResult[i][4] + " Pitch: " + poseResult[i][5] + " Roll: " + poseResult[i][6],
          x1, y1-10);
        canvasCtx.stroke();
      }
    },

    async predictEyeCloseness() {
      const detectionResult = await faceSDK.detectFace(this.detect_session, 'live-canvas');
      const points = await faceSDK.predictLandmark(this.landmark_session, 'live-canvas', detectionResult.bbox);
      const eyeResult = await faceSDK.predictEye(this.eye_session, 'live-canvas', points);

      const canvas = document.getElementById('live-canvas');
      const canvasCtx = canvas.getContext('2d');
      canvasCtx.beginPath();

      var bbox = detectionResult.bbox;
      var face_count = bbox.shape[0],
          bbox_size = bbox.shape[1];

      for (let i = 0; i < face_count; i++) {
        var x1 = parseInt(bbox.data[i * bbox_size]),
            y1 = parseInt(bbox.data[i * bbox_size + 1]),
            x2 = parseInt(bbox.data[i * bbox_size + 2]),
            y2 = parseInt(bbox.data[i * bbox_size + 3]),
            width = Math.abs(x2 - x1),
            height = Math.abs(y2 - y1);

        const leftEye = eyeResult[i][0] ? "Close" : "Open";
        const rightEye = eyeResult[i][1] ? "Close" : "Open";

        canvasCtx.strokeStyle = "red";
        canvasCtx.fillStyle = "blue";
        canvasCtx.strokeRect(x1, y1, width, height);
        canvasCtx.fillText("Left Eye: " + leftEye + " Right Eye: " + rightEye, x1, y1-10);
        canvasCtx.stroke();
      }
    },

    async predictGender() {
      const detectionResult = await faceSDK.detectFace(this.detect_session, 'live-canvas');
      const genderResult = await faceSDK.predictGender(this.gender_session, 'live-canvas', detectionResult.bbox);

      const canvas = document.getElementById('live-canvas');
      const canvasCtx = canvas.getContext('2d');
      canvasCtx.beginPath();

      var face_count = genderResult.length;

      for (let i = 0; i < face_count; i++) {
        var x1 = parseInt(genderResult[i][0]),
            y1 = parseInt(genderResult[i][1]),
            x2 = parseInt(genderResult[i][2]),
            y2 = parseInt(genderResult[i][3]),
            result = genderResult[i][4] > 0.6 ? "Male" : "Female",
            width = Math.abs(x2 - x1),
            height = Math.abs(y2 - y1);

        canvasCtx.strokeStyle = "red";
        canvasCtx.fillStyle = "blue";
        canvasCtx.strokeRect(x1, y1, width, height);
        canvasCtx.fillText(result, x1, y1-10);
        canvasCtx.stroke();
      }
    },

    async predictAge() {
      const detectionResult = await faceSDK.detectFace(this.detect_session, 'live-canvas');
      const ageResult = await faceSDK.predictAge(this.age_session, 'live-canvas', detectionResult.bbox);

      const canvas = document.getElementById('live-canvas');
      const canvasCtx = canvas.getContext('2d');
      canvasCtx.beginPath();

      var face_count = ageResult.length;

      for (let i = 0; i < face_count; i++) {
        var x1 = parseInt(ageResult[i][0]),
            y1 = parseInt(ageResult[i][1]),
            x2 = parseInt(ageResult[i][2]),
            y2 = parseInt(ageResult[i][3]),
            result = parseInt(ageResult[i][4]),
            width = Math.abs(x2 - x1),
            height = Math.abs(y2 - y1);

        canvasCtx.strokeStyle = "red";
        canvasCtx.fillStyle = "blue";
        canvasCtx.strokeRect(x1, y1, width, height);
        canvasCtx.fillText("Age: " + result, x1, y1-10);
        canvasCtx.stroke();
      }
    },

    async extractFeature() {
      const detectionResult = await faceSDK.detectFace(this.detect_session, 'live-canvas');
      const points = await faceSDK.predictLandmark(this.landmark_session, 'live-canvas', detectionResult.bbox);
      const eyeResult = await faceSDK.extractFeature(this.feature_session, 'live-canvas', points);

      const canvas = document.getElementById('live-canvas');
      const canvasCtx = canvas.getContext('2d');
      canvasCtx.beginPath();

      var bbox = detectionResult.bbox;
      var face_count = bbox.shape[0],
          bbox_size = bbox.shape[1];

      for (let i = 0; i < face_count; i++) {
        var x1 = parseInt(bbox.data[i * bbox_size]),
            y1 = parseInt(bbox.data[i * bbox_size + 1]),
            x2 = parseInt(bbox.data[i * bbox_size + 2]),
            y2 = parseInt(bbox.data[i * bbox_size + 3]),
            width = Math.abs(x2 - x1),
            height = Math.abs(y2 - y1);

        canvasCtx.strokeStyle = "red";
        canvasCtx.fillStyle = "blue";
        canvasCtx.strokeRect(x1, y1, width, height);
        canvasCtx.fillText("Person " + i, x1, y1-10);
        canvasCtx.stroke();
      }
    },

    async load_models() {
      await faceSDK.load_opencv();
      this.detect_session = await faceSDK.loadDetectionModel();
      this.expression_session = await faceSDK.loadExpressionModel();
      this.eye_session = await faceSDK.loadEyeModel();
      this.landmark_session = await faceSDK.loadLandmarkModel();
      this.live_session = await faceSDK.loadLivenessModel();
      this.pose_session = await faceSDK.loadPoseModel();
      this.gender_session = await faceSDK.loadGenderModel();
      this.age_session = await faceSDK.loadAgeModel();
      this.feature_session = await faceSDK.loadFeatureModel();
    },
  },

  mounted() {
    this.load_models();
    this.take_photo();
  },

}
</script>

