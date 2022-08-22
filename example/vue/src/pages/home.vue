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

    check_result(question, out_model, blinks_up) {
      if (question === "smile") {
        if (out_model["emotion"] === "smile") {
          this.challenge = "pass"
        } else {
          this.challenge = "fail"
        }
      } else if (question === "surprise") {
        if (out_model["emotion"] === "surprise") {
          this.challenge = "pass"
        } else {
          this.challenge = "fail"
        }
      } else if (question === "angry") {
        if (out_model["emotion"] === "angry")
          this.challenge = "pass"
        else
          this.challenge = "fail"
      } else if (question === "turn face right") {
        if (out_model["orientation"] === "right")
          this.challenge = "pass"
        else
          this.challenge = "fail"
      } else if (question === "turn face left") {
        if (out_model["orientation"] === "left")
          this.challenge = "pass"
        else
          this.challenge = "fail"
      } else if (question === "turn face up") {
        if (out_model["orientation"] === "up")
          this.challenge = "pass"
        else
          this.challenge = "fail"
      } else if (question === "turn face down") {
        if (out_model["orientation"] === "down")
          this.challenge = "pass"
        else
          this.challenge = "fail"
      } else if (question === "blink eyes") {
        if (blinks_up === true)
          this.challenge = "pass"
        else
          this.challenge = "fail"
      } else {
      }
    },

    close_camera() {
      this.$store.dispatch('camera/stopCamera')
    },

    async show_photo() {
      // const video = document.getElementById("live-video");
      // video.addEventListener("playing", function() {
      //   const canvas = document.getElementById('live-camera');
      //   const canvasCtx = canvas.getContext('2d');
      //
      //   setTimeout(() => {
      //       canvasCtx.drawImage(video, 0, 0, 320, 240);
      //   }, 100)
      //
      //   //resolve(video);
      // });

      const video = document.getElementById('live-video')
      const canvas = document.getElementById('live-camera')
      const canvasCtx = canvas.getContext('2d')
      canvasCtx.drawImage(video, 0, 0, 320, 240)

      this.image = canvas.toDataURL('image/jpeg')
      canvasCtx.strokeStyle = "red"
      canvasCtx.rect(100, 60, 120, 120)
      canvasCtx.stroke()
      setTimeout(() => this.show_photo(), 33)
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

      for (let i = 0; i < face_count; i++) {
        var x1 = parseInt(bbox.data[i * bbox_size]),
            y1 = parseInt(bbox.data[i * bbox_size + 1]),
            x2 = parseInt(bbox.data[i * bbox_size + 2]),
            y2 = parseInt(bbox.data[i * bbox_size + 3]),
            width = Math.abs(x2 - x1),
            height = Math.abs(y2 - y1);

            const canvas = document.getElementById('live-canvas');
            const canvasCtx = canvas.getContext('2d');

            canvasCtx.strokeStyle = "red";
            canvasCtx.rect(x1, y1, width, height);
            canvasCtx.stroke()
      }
    },

    async extractLandmark() {
      const detectionResult = await faceSDK.detectFace(this.detect_session, 'live-canvas');
      const points = await faceSDK.predictLandmark(this.landmark_session, 'live-canvas', detectionResult.bbox);

      for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < 68; j++) {
         var x1 = points[i][j * 2],
              y1 = points[i][j * 2 + 1];

            const canvas = document.getElementById('live-canvas');
            const canvasCtx = canvas.getContext('2d');
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

      var face_count = liveResult.length;

      for (let i = 0; i < face_count; i++) {
        var x1 = parseInt(liveResult[i][0]),
            y1 = parseInt(liveResult[i][1]),
            x2 = parseInt(liveResult[i][2]),
            y2 = parseInt(liveResult[i][3]),
            result = liveResult[i][4] < 0.3 ? "Fake" : "Live",
            width = Math.abs(x2 - x1),
            height = Math.abs(y2 - y1);

        const canvas = document.getElementById('live-canvas');
        const canvasCtx = canvas.getContext('2d');

        canvasCtx.strokeStyle = "red";
        canvasCtx.fillStyle = "blue";
        canvasCtx.rect(x1, y1, width, height);
        canvasCtx.fillText(result, x1, y1-10);
        canvasCtx.stroke();
      }
    },

    async predictFaceExpression() {
      const detectionResult = await faceSDK.detectFace(this.detect_session, 'live-canvas');
      const expressionResult = await faceSDK.predictExpression(this.expression_session, 'live-canvas', detectionResult.bbox);

      var face_count = expressionResult.length;

      for (let i = 0; i < face_count; i++) {
        var x1 = parseInt(expressionResult[i][0]),
            y1 = parseInt(expressionResult[i][1]),
            x2 = parseInt(expressionResult[i][2]),
            y2 = parseInt(expressionResult[i][3]),

            width = Math.abs(x2 - x1),
            height = Math.abs(y2 - y1);

        const canvas = document.getElementById('live-canvas');
        const canvasCtx = canvas.getContext('2d');

        canvasCtx.strokeStyle = "red";
        canvasCtx.fillStyle = "blue";
        canvasCtx.rect(x1, y1, width, height);
        canvasCtx.fillText("Yaw: " + this.emotions[expressionResult[i][4]], x1, y1-10);
        canvasCtx.stroke();
      }
    },

    async predictFacePose() {
      const detectionResult = await faceSDK.detectFace(this.detect_session, 'live-canvas');
      const poseResult = await faceSDK.predictPose(this.pose_session, 'live-canvas', detectionResult.bbox);

      var face_count = poseResult.length;

      for (let i = 0; i < face_count; i++) {
        var x1 = parseInt(poseResult[i][0]),
            y1 = parseInt(poseResult[i][1]),
            x2 = parseInt(poseResult[i][2]),
            y2 = parseInt(poseResult[i][3]),

            width = Math.abs(x2 - x1),
            height = Math.abs(y2 - y1);

        const canvas = document.getElementById('live-canvas');
        const canvasCtx = canvas.getContext('2d');

        canvasCtx.strokeStyle = "red";
        canvasCtx.fillStyle = "blue";
        canvasCtx.rect(x1, y1, width, height);
        canvasCtx.fillText("Yaw: " + poseResult[i][4] + " Pitch: " + poseResult[i][5] + " Roll: " + poseResult[i][6],
          x1, y1-10);
        canvasCtx.stroke();
      }
    },

    async predictEyeCloseness() {
      const detectionResult = await faceSDK.detectFace(this.detect_session, 'live-canvas');
      const points = await faceSDK.predictLandmark(this.landmark_session, 'live-canvas', detectionResult.bbox);
      const eyeResult = await faceSDK.predictEye(this.eye_session, 'live-canvas', points);

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

        const canvas = document.getElementById('live-canvas');
        const canvasCtx = canvas.getContext('2d');

        canvasCtx.strokeStyle = "red";
        canvasCtx.fillStyle = "blue";
        canvasCtx.rect(x1, y1, width, height);
        canvasCtx.fillText("Left Eye: " + leftEye + " Right Eye: " + rightEye, x1, y1-10);
        canvasCtx.stroke();
      }
    },

    async extractFeature() {
      const detectionResult = await faceSDK.detectFace(this.detect_session, 'live-canvas');
      const points = await faceSDK.predictLandmark(this.landmark_session, 'live-canvas', detectionResult.bbox);
      const eyeResult = await faceSDK.extractFeature(this.feature_session, 'live-canvas', points);

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

        const canvas = document.getElementById('live-canvas');
        const canvasCtx = canvas.getContext('2d');

        canvasCtx.strokeStyle = "red";
        canvasCtx.fillStyle = "blue";
        canvasCtx.rect(x1, y1, width, height);
        canvasCtx.fillText("Person " + i, x1, y1-10);
        canvasCtx.stroke();
      }
    },

    async detect_active_detection() {
      this.button_status = true;
      this.active_count = 0;
      for (let i = 0; i < this.max_questions; i++) {
        const idx = Math.floor(Math.random() * 6);

        if (this.start_question) {
          this.$notify({group: "state", title: "Active Liveness State", text: this.questions[idx]}, 1000);
        }

        this.start_question = false;
        let success = false;

        for (let j = 0; j < this.try_count; j++) {
          const start_time = performance.now();
          this.take_photo();

          // pseudo code
          await axios.post(
            "http://127.0.0.1:8000/face/active/liveness/result",
            {
              "image": this.image,
              "question": this.questions[idx],
              "blink_count": this.continuous_blink_count,
              "total_count": this.total_blink_count
            }
          ).then((response) => {
            console.log('The api works.');
          }).catch((error) => {
            //console.warn('The error occurs.');
          })

          const detectionResult = await faceapi.detect_photo(this.detect_session, 'live-canvas');
          const end_time = performance.now();

          // console.log("[detect_active_detection] process time: ", end_time - start_time, detectionResult.bbox);
          const points = await faceapi.predict_landmark(this.landmark_session, 'live-canvas', detectionResult.bbox);
          const pose_questions = ["turn face right", "turn face left", "turn face up", "turn face down"];
          var pose_result = null;

          if (pose_questions.includes(this.questions[idx]))
            pose_result = await faceapi.predict_pose(this.pose_session, 'live-canvas', detectionResult.bbox, this.questions[idx]);

          const expression_questions = ["smile", "surprise", "angry"]
          var expression_result = null;
          if (expression_questions.includes(this.questions[idx]))
            expression_result = await faceapi.predict_expression(this.expression_session, 'live-canvas', detectionResult.bbox);

          const eye_result = await faceapi.predict_eye(this.eye_session, 'live-canvas', points);

          const previous_blink_count = this.total_blink_count;
          if (eye_result)
            this.continuous_blink_count = this.continuous_blink_count + 1
          else {
            if (this.continuous_blink_count >= 1)
              this.total_blink_count = this.total_blink_count + 1
          }

          const output_status = {
            "box_face_frontal": 3,
            "box_orientation": 5,
            "emotion": this.emotions[expression_result],
            "orientation": pose_result,
            "total_blinks": this.total_blink_count,
            "count_continuous_blinks": this.continuous_blink_count
          };

          let blinks_up = false;
          if (this.total_blink_count - previous_blink_count > 0)
            blinks_up = true;

          this.check_result(this.questions[idx], output_status, blinks_up);

          setTimeout(() => this.start_question = true, 40);
          if (this.challenge === "pass") {
            success = true;
            break;
          }
        }

        //console.log("active status [1]: ", success, j, this.try_count)
        if (success) {
          this.$notify({group: "success", title: "Active Liveness Result", text: "pass"}, 1000);
          this.active_count++;
        } else {
          console.log("error case: ", this.questions[idx]);
          break;
        }

        setTimeout(() => this.start_question = true, 40);
      }

      console.log("active status [2]:  ", this.active_count, this.max_questions);
      if (this.active_count === this.max_questions)
        this.$notify({group: "fr-success", title: "Active Liveness Result", text: "The result is live."}, 4000);
      else
        this.$notify({group: "fr-error", title: "Active Liveness Result", text: "The result is fake."}, 4000);

      this.continuous_blink_count = 0;
      this.total_blink_count = 0;
      this.button_status = false;
    },

    async enroll_face() {
      this.button_status = true;
      if (this.user_email === null)
        return

      await this.take_photo();
      const response = await axios.post(
        "http://127.0.0.1:8000/face/enroll/feature",
        {
          "image": this.image,
          "user_email": this.user_email
        }
      )

      if (response.data["isEnrolled"] === true) {
        this.$notify({
          group: "success",
          title: "Face Enrollment Result",
          text: "The input face has been enrolled successfully."
        }, 2000);
      } else {
        this.$notify({
          group: "error",
          title: "Face Enrollment Result",
          text: "The input face has been enrolled successfully."
        }, 2000);
      }
      this.button_status = false;
    },

    async load_models() {
      await faceSDK.load_opencv();
      this.detect_session = await faceSDK.loadDetectionModel();
      this.expression_session = await faceSDK.loadExpressionModel();
      this.eye_session = await faceSDK.loadEyeModel();
      this.landmark_session = await faceSDK.loadLandmarkModel();
      this.live_session = await faceSDK.loadLivenessModel();
      this.pose_session = await faceSDK.loadPoseModel();
      this.feature_session = await faceSDK.loadFeatureModel();
    },
  },

  mounted() {
    this.load_models();
    this.take_photo();
  },

}
</script>

